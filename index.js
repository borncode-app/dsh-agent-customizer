import z from '@deepseek-ai/schemastery'
import { readFile, rename, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

/** File that keeps the per-agent customizations across restarts. */
const STATE_FILE = fileURLToPath(new URL('./state.json', import.meta.url))
/** Name of the prompt section this plugin owns inside an agent scope. */
const SECTION_NAME = 'agent-customizer:instructions'
/** Largest instruction text the plugin stores when the row does not say otherwise. */
const MAX_LENGTH = 20000
/** Which generation of this file a running Host loaded; lives in every state answer. */
const REVISION = '2026-11-12.3'

export const Config = z.object({
  /** Path the Web GUI reads and writes the customizations at. */
  endpoint: z.string().default('/plugins/agent-customizer'),
  /** Largest instruction text accepted, in characters. */
  maxLength: z.number().default(MAX_LENGTH),
})

/** Hard services: the HTTP carrier that serves the page's data. */
export const inject = ['webServer']

/**
 * Read one setting, tolerating both a plain value and a live config getter.
 *
 * @param {object | undefined} config - the row's resolved configuration.
 * @param {string} field - the setting to read.
 * @param {unknown} fallback - the value to use when the setting is absent.
 * @returns {unknown} the resolved setting.
 */
function setting(config, field, fallback) {
  const value = config?.[field]
  if (value === undefined) return fallback
  const resolved = typeof value?.get === 'function' ? value.get() : value
  return resolved === undefined ? fallback : resolved
}

/**
 * Keep the per-agent customizations, apply the instructions to the agent that
 * owns them, and expose the default model to the Web GUI.
 *
 * The user picks an agent (one Agent preset) in Settings → Agent customization,
 * writes the Instructions that agent must read before it starts work, and
 * chooses the model freshly created agents start on. The instructions live
 * beside this plugin and are contributed as a prompt section inside that
 * agent's own scope, so they travel with the agent and leave when it does.
 */
export async function apply(ctx, config) {
  const logger = ctx.logger
  const endpoint = String(setting(config, 'endpoint', '/plugins/agent-customizer'))
  const maxLength = Math.max(0, Math.floor(Number(setting(config, 'maxLength', MAX_LENGTH)) || 0))

  /** The custom instructions, keyed by Agent preset id. */
  const instructions = new Map()
  /** When the customizations were last written. */
  let updatedAt = 0
  /** Live agents that received the instructions, keyed by agent id. */
  const applied = new Map()

  /**
   * Store the customizations next to the plugin.
   *
   * The write is atomic, so a crash never leaves a half-written file behind.
   *
   * @param {Map<string, string>} next - the custom instructions to store.
   * @param {number} stamp - the timestamp to record with them.
   * @returns {Promise<boolean>} whether the file was written.
   */
  const persist = async (next, stamp) => {
    const body = `${JSON.stringify({ agents: Object.fromEntries(next), updatedAt: stamp }, null, 2)}\n`
    const temporary = `${STATE_FILE}.tmp`
    try {
      await writeFile(temporary, body, 'utf8')
      await rename(temporary, STATE_FILE)
      return true
    } catch (error) {
      logger.warn(`agent-customizer: could not save the customizations: ${error instanceof Error ? error.message : String(error)}`)
      return false
    }
  }

  /** Read one JSON request body, bounded. */
  const readBody = (req) => new Promise((resolve) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > 256_000) {
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        resolve({})
      }
    })
    req.on('error', () => resolve({}))
  })

  try {
    const saved = JSON.parse(await readFile(STATE_FILE, 'utf8'))
    const agents = saved?.agents
    if (agents !== null && typeof agents === 'object') {
      for (const [id, text] of Object.entries(agents)) {
        if (typeof text === 'string' && text.trim().length > 0) instructions.set(id, text)
      }
    }
    if (typeof saved?.updatedAt === 'number') updatedAt = saved.updatedAt
  } catch {
    /* nothing stored yet: the page starts empty */
  }

  /** The instructions one agent reads, or an empty string when it has none. */
  const instructionsOf = (presetId) => instructions.get(presetId) ?? ''

  /**
   * The section text an agent renders for its own instructions.
   *
   * An agent with no instructions contributes nothing at all: the section
   * renders as empty text and the prompt assembler drops it.
   *
   * @param {string} presetId - the Agent preset the section belongs to.
   * @returns {string} the section text, or an empty string when nothing is set.
   */
  const sectionText = (presetId) => {
    const text = instructionsOf(presetId).trim()
    if (text.length === 0) return ''
    return [
      '## Agent instructions',
      "These are the user's standing instructions for this agent, written in Settings → Agent customization. Read them before starting any work. Every item is a deliverable the user expects: do not forget one of them, and confirm each one is done before reporting the work as finished.",
      '',
      text,
    ].join('\n')
  }

  /**
   * The agent roster the page offers, as the registry currently holds it.
   *
   * @param {object} registry - the Agent preset registry service.
   * @returns {Promise<object[]>} one row per declared preset.
   */
  const readPresets = async (registry) => {
    if (registry === undefined) return []
    try {
      const roster = typeof registry.remoteExportList === 'function'
        ? await registry.remoteExportList()
        : await registry.list()
      const rows = Array.isArray(roster) ? roster : (roster?.presets ?? [])
      return rows.map((row) => ({
        id: String(row.id),
        name: typeof row.name === 'string' && row.name.length > 0 ? row.name : String(row.id),
        description: typeof row.description === 'string' ? row.description : '',
        order: typeof row.order === 'number' ? row.order : 0,
        isDefault: row.isDefault === true,
        broken: typeof row.broken === 'string' ? row.broken : null,
      }))
    } catch (error) {
      logger.warn(`agent-customizer: could not read the agent roster: ${error instanceof Error ? error.message : String(error)}`)
      return []
    }
  }

  /**
   * The reasoning levels one exact model advertises.
   *
   * A model that advertises no reasoning metadata simply offers none, so the
   * page keeps its "Auto" choice and sends no effort.
   *
   * @param {object} llm - the LLM registry service.
   * @param {string} provider - the provider route the model belongs to.
   * @param {string} model - the exact model id.
   * @returns {Promise<string[]>} the advertised effort ids.
   */
  const readEfforts = async (llm, provider, model) => {
    try {
      const resolved = await llm.resolveModelInfo(provider, model)
      const efforts = resolved?.reasoning?.efforts
      if (!Array.isArray(efforts)) return []
      return efforts.map((effort) => String(effort?.id ?? '')).filter((id) => id.length > 0)
    } catch {
      return []
    }
  }

  /**
   * The models the registered providers advertise, for the page's picker.
   *
   * @param {object} llm - the LLM registry service.
   * @returns {Promise<object[]>} one group per provider that lists models.
   */
  const readProviders = async (llm) => {
    if (llm === undefined) return []
    let providers = []
    try {
      providers = llm.listProviders()
    } catch (error) {
      logger.warn(`agent-customizer: could not read the provider directory: ${error instanceof Error ? error.message : String(error)}`)
      return []
    }
    return Promise.all(providers.map(async (provider) => {
      const group = { id: String(provider.id), name: String(provider.name ?? provider.id), models: [], error: null }
      try {
        const models = await llm.listModels(provider.id)
        group.models = await Promise.all(models.map(async (model) => ({
          id: String(model.id),
          name: String(model.name ?? model.id),
          efforts: await readEfforts(llm, provider.id, String(model.id)),
        })))
      } catch (error) {
        group.error = error instanceof Error ? error.message : String(error)
      }
      return group
    }))
  }

  /** The complete answer the page renders from. */
  const snapshot = async () => {
    const registry = ctx.get('agentPresets')
    const defaults = ctx.get('agentDefaultModel')
    const llm = ctx.get('llm')
    let defaultModel = null
    try {
      defaultModel = defaults?.currentSelection?.() ?? null
    } catch {
      defaultModel = null
    }
    return {
      revision: REVISION,
      presets: await readPresets(registry),
      agents: Object.fromEntries(instructions),
      defaultModel,
      providers: await readProviders(llm),
      maxLength,
      updatedAt,
      applied: [...applied.entries()].map(([id, record]) => ({ id, agent: record.agent })),
    }
  }

  /**
   * Apply the instructions of the agent an event belongs to.
   *
   * The section is registered on the agent's own scope, so it reaches that
   * agent alone and disappears with it.
   *
   * @param {object} agent - the live agent the event carries.
   * @returns {void}
   */
  const applyTo = (agent) => {
    const registry = ctx.get('agentPresets')
    const prompt = ctx.get('systemPrompt')
    if (registry === undefined || prompt === undefined) return
    let presetId
    try {
      presetId = registry.composedPreset?.(agent.ctx) ?? agent.session?.header?.agentPreset ?? null
    } catch {
      presetId = null
    }
    if (typeof presetId !== 'string' || presetId.length === 0) return
    const dispose = agent.ctx.systemPrompt.section({
      name: SECTION_NAME,
      // Right behind the persona: the agent's identity, then the user's own
      // instructions for that agent.
      order: prompt.getSectionOrder('DEPLOYMENT_PERSONA_PREFIX') + 1,
      text: () => sectionText(presetId),
      // The user's text is data, never a `{{variable}}` reference.
      interpolate: false,
    })
    agent.ctx.effect(() => dispose, 'agent-customizer: instructions')
    applied.set(String(agent.id), { agent: presetId, dispose })
    logger.info(`agent-customizer: agent ${String(agent.id)} (${presetId}) reads its own instructions`)
  }

  ctx.inject(['systemPrompt', 'agentPresets'], () => {
    ctx.on('agent/created', ({ agent }) => {
      try {
        applyTo(agent)
      } catch (error) {
        logger.warn(`agent-customizer: could not apply the instructions: ${error instanceof Error ? error.message : String(error)}`)
      }
    }, { global: true })
    ctx.on('agent/disposed', ({ agent }) => {
      // The agent's own scope removed its prompt section; only the record goes.
      applied.delete(String(agent?.id ?? ''))
    }, { global: true })
  })

  ctx.effect(() => () => {
    // Unloading the plugin does not dispose `agent.ctx` registrations by
    // itself, so every section this plugin registered is removed here. The
    // map is read at dispose time, not copied at mount time.
    for (const dispose of applied.values()) {
      try {
        dispose()
      } catch {
        /* the agent's scope already removed it */
      }
    }
    applied.clear()
  }, 'agent-customizer: live agents')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: endpoint,
    handler: (req, res) => {
      const reply = (status, body) => {
        res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(JSON.stringify(body))
      }
      if (req.method === 'GET' || req.method === 'HEAD') {
        void (async () => {
          try {
            reply(200, await snapshot())
          } catch (error) {
            logger.warn(`agent-customizer: could not read the customizations: ${error instanceof Error ? error.message : String(error)}`)
            reply(500, { error: 'failed' })
          }
        })()
        return
      }
      if (req.method !== 'POST') {
        reply(405, { error: 'method-not-allowed' })
        return
      }
      void (async () => {
        const request = await readBody(req)
        const action = request?.action
        if (action === 'save-instructions' || action === 'clear-instructions') {
          const agent = typeof request.agent === 'string' ? request.agent.trim() : ''
          if (agent.length === 0) {
            reply(400, { error: 'unknown-agent' })
            return
          }
          // A roster that is readable must contain the agent: a typo would
          // otherwise store instructions no agent ever reads.
          const roster = await readPresets(ctx.get('agentPresets'))
          if (roster.length > 0 && !roster.some((row) => row.id === agent)) {
            reply(404, { error: 'unknown-agent', agent, available: roster.map((row) => row.id) })
            return
          }
          const text = action === 'clear-instructions' ? '' : request.instructions
          if (typeof text !== 'string') {
            reply(400, { error: 'invalid-instructions' })
            return
          }
          if (text.length > maxLength) {
            reply(413, { error: 'too-long', maxLength })
            return
          }
          const trimmed = text.trim()
          const next = new Map(instructions)
          if (trimmed.length === 0) next.delete(agent)
          else next.set(agent, trimmed)
          const stamp = Date.now()
          const saved = await persist(next, stamp)
          if (!saved) {
            reply(500, { error: 'not-saved' })
            return
          }
          instructions.clear()
          for (const [id, value] of next) instructions.set(id, value)
          updatedAt = stamp
          logger.info(`agent-customizer: instructions updated for ${agent} (${String(trimmed.length)} characters)`)
          reply(200, await snapshot())
          return
        }
        if (action === 'save-model') {
          const defaults = ctx.get('agentDefaultModel')
          if (defaults === undefined) {
            reply(501, { error: 'no-default-model' })
            return
          }
          const provider = typeof request.provider === 'string' ? request.provider.trim() : ''
          const model = typeof request.model === 'string' ? request.model.trim() : ''
          if (provider.length === 0 || model.length === 0) {
            reply(400, { error: 'invalid-model' })
            return
          }
          // `saveSelection` replaces the whole selection, so an omitted effort
          // would silently drop the stored one. An absent field keeps the
          // current effort; an explicit null clears it ("Auto").
          let current = null
          try {
            current = defaults.currentSelection()
          } catch {
            current = null
          }
          let effort
          if (request.reasoningEffort === null) {
            effort = undefined
          } else if (typeof request.reasoningEffort === 'string' && request.reasoningEffort.trim().length > 0) {
            effort = request.reasoningEffort.trim()
          } else {
            effort = typeof current?.reasoningEffort === 'string' ? current.reasoningEffort : undefined
          }
          try {
            await defaults.saveSelection({
              provider,
              model,
              ...effort === undefined ? {} : { reasoningEffort: effort },
            })
          } catch (error) {
            logger.warn(`agent-customizer: could not save the default model: ${error instanceof Error ? error.message : String(error)}`)
            reply(500, { error: 'not-saved' })
            return
          }
          try {
            current = defaults.currentSelection()
          } catch {
            current = null
          }
          if (current === null || current.provider !== provider || current.model !== model) {
            reply(500, { error: 'not-saved' })
            return
          }
          logger.info(`agent-customizer: default model is now ${provider}/${model}`)
          reply(200, await snapshot())
          return
        }
        reply(400, { error: 'unknown-action' })
      })().catch((error) => {
        logger.warn(`agent-customizer: control route failed: ${error instanceof Error ? error.message : String(error)}`)
        try {
          reply(500, { error: 'failed' })
        } catch {
          /* the reply already began */
        }
      })
    },
  }), 'agent-customizer: control route')
}

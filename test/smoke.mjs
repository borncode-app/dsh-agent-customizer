#!/usr/bin/env node
// Smoke test for the agent-customizer plugin.
//
// It exercises the live Host route end to end — read, write, validation, the
// per-agent instructions on disk, and the default model that reaches the
// profile patch — and restores everything it found, so running it never
// changes what the user has configured.
//
// Usage: node test/smoke.mjs [--host http://127.0.0.1:53577]
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const hostFlag = args.indexOf('--host')
const host = hostFlag === -1
  ? (process.env.DSH_WEB_URL ?? 'http://127.0.0.1:53577')
  : args[hostFlag + 1]
const endpoint = `${host.replace(/\/+$/, '')}/plugins/agent-customizer`
const stateFile = fileURLToPath(new URL('../state.json', import.meta.url))

/** Marker only this run writes. */
const marker = `SMOKE-AGENT-77 smoke marker ${String(Date.now())}`

let failures = 0

/**
 * Record one check.
 *
 * @param {string} name - what the check proves.
 * @param {boolean} ok - whether it held.
 * @param {string} detail - extra reading for a failed check.
 */
function check(name, ok, detail = '') {
  if (ok) {
    console.log(`PASS  ${name}`)
    return
  }
  failures += 1
  console.log(`FAIL  ${name}${detail === '' ? '' : ` — ${detail}`}`)
}

/**
 * Read the whole route answer.
 *
 * @param {RequestInit} [init] - the request to send.
 * @returns {Promise<{ status: number, body: any }>} the status and the parsed body.
 */
async function call(init) {
  const response = await fetch(endpoint, {
    headers: { accept: 'application/json', ...(init?.body === undefined ? {} : { 'content-type': 'application/json' }) },
    ...init,
  })
  let body
  try {
    body = await response.json()
  } catch {
    body = undefined
  }
  return { status: response.status, body }
}

const before = await call({ method: 'GET' })
check('the Host answers the route', before.status === 200, `status ${String(before.status)}`)
check('the answer carries the agent roster', Array.isArray(before.body?.presets) && before.body.presets.length > 0, JSON.stringify(before.body?.presets))
check('the answer carries the provider catalog', Array.isArray(before.body?.providers) && before.body.providers.length > 0, JSON.stringify(before.body?.providers))
check('the answer carries the default model', typeof before.body?.defaultModel?.provider === 'string', JSON.stringify(before.body?.defaultModel))

const presets = before.body?.presets ?? []
const agent = presets[0]?.id
check('the roster names an agent', typeof agent === 'string' && agent.length > 0, JSON.stringify(presets))
if (typeof agent !== 'string' || agent.length === 0) {
  console.log('\nsmoke test failed: the roster is empty, nothing can be checked')
  process.exit(1)
}

const originalInstructions = typeof before.body?.agents?.[agent] === 'string' ? before.body.agents[agent] : ''
const originalModel = before.body?.defaultModel ?? {}

const saved = await call({ method: 'POST', body: JSON.stringify({ action: 'save-instructions', agent, instructions: marker }) })
check('an instruction save is accepted', saved.status === 200, `status ${String(saved.status)}`)
check('the save echoes the text', saved.body?.agents?.[agent] === marker, JSON.stringify(saved.body?.agents?.[agent]))

const readBack = await call({ method: 'GET' })
check('the Host serves the new instructions', readBack.body?.agents?.[agent] === marker, JSON.stringify(readBack.body?.agents?.[agent]))

let stored = ''
try {
  stored = JSON.parse(await readFile(stateFile, 'utf8'))?.agents?.[agent]
} catch (error) {
  stored = `unreadable: ${error instanceof Error ? error.message : String(error)}`
}
check('the instructions are stored on disk', stored === marker, stored)

const other = presets.find((row) => row.id !== agent)?.id
const otherBefore = typeof before.body?.agents?.[other] === 'string' ? before.body.agents[other] : undefined
const otherSaved = await call({ method: 'POST', body: JSON.stringify({ action: 'save-instructions', agent: other, instructions: marker }) })
check('a second agent keeps its own instructions', otherSaved.status === 200 && otherSaved.body?.agents?.[agent] === marker, JSON.stringify(otherSaved.body?.agents))
check('the other agent carries the new text', otherSaved.body?.agents?.[other] === marker, JSON.stringify(otherSaved.body?.agents?.[other]))

const cleared = await call({ method: 'POST', body: JSON.stringify({ action: 'clear-instructions', agent }) })
check('a clear is accepted', cleared.status === 200, `status ${String(cleared.status)}`)
check('the cleared agent carries no instructions', cleared.body?.agents?.[agent] === undefined, JSON.stringify(cleared.body?.agents?.[agent]))
check('the other agent is untouched by the clear', cleared.body?.agents?.[other] === marker, JSON.stringify(cleared.body?.agents?.[other]))

const unknownAgent = await call({ method: 'POST', body: JSON.stringify({ action: 'save-instructions', agent: 'no-such-agent', instructions: marker }) })
check('an unknown agent is refused', unknownAgent.status === 404, `status ${String(unknownAgent.status)}`)

const badAction = await call({ method: 'POST', body: JSON.stringify({ action: 'nonsense' }) })
check('an unknown action is refused', badAction.status === 400, `status ${String(badAction.status)}`)

const tooLong = await call({ method: 'POST', body: JSON.stringify({ action: 'save-instructions', agent, instructions: 'x'.repeat(30000) }) })
check('an oversized text is refused', tooLong.status === 413, `status ${String(tooLong.status)}`)

const wrongMethod = await call({ method: 'DELETE' })
check('a wrong method is refused', wrongMethod.status === 405, `status ${String(wrongMethod.status)}`)

// The default model: switch it, read it back, and put it back where it was.
const provider = before.body?.providers?.find((group) => group.models?.length > 0)
const otherModel = provider?.models?.find((entry) => entry.id !== originalModel.model)
if (provider !== undefined && otherModel !== undefined) {
  const switched = await call({ method: 'POST', body: JSON.stringify({ action: 'save-model', provider: provider.id, model: otherModel.id }) })
  check('a model switch is accepted', switched.status === 200, `status ${String(switched.status)}`)
  check('the switched model is served', switched.body?.defaultModel?.model === otherModel.id, JSON.stringify(switched.body?.defaultModel))

  const effort = otherModel.efforts?.[0]
  if (typeof effort === 'string') {
    const withEffort = await call({ method: 'POST', body: JSON.stringify({ action: 'save-model', provider: provider.id, model: otherModel.id, reasoningEffort: effort }) })
    check('a reasoning effort is stored', withEffort.body?.defaultModel?.reasoningEffort === effort, JSON.stringify(withEffort.body?.defaultModel))

    const withoutEffort = await call({ method: 'POST', body: JSON.stringify({ action: 'save-model', provider: provider.id, model: otherModel.id, reasoningEffort: null }) })
    check('an explicit Auto removes the effort', withoutEffort.body?.defaultModel?.reasoningEffort === undefined, JSON.stringify(withoutEffort.body?.defaultModel))
  }
} else {
  check('the provider catalog offers a second model', false, JSON.stringify(provider))
}

const badModel = await call({ method: 'POST', body: JSON.stringify({ action: 'save-model', provider: '', model: '' }) })
check('an empty model is refused', badModel.status === 400, `status ${String(badModel.status)}`)

// Put everything back the way it was.
const restoredModel = await call({
  method: 'POST',
  body: JSON.stringify({
    action: 'save-model',
    provider: originalModel.provider,
    model: originalModel.model,
    reasoningEffort: typeof originalModel.reasoningEffort === 'string' ? originalModel.reasoningEffort : null,
  }),
})
check('the original model is restored', restoredModel.status === 200 && restoredModel.body?.defaultModel?.model === originalModel.model, JSON.stringify(restoredModel.body?.defaultModel))

const restored = await call({ method: 'POST', body: JSON.stringify({ action: 'save-instructions', agent, instructions: originalInstructions }) })
check('the original instructions are restored', restored.status === 200 && (restored.body?.agents?.[agent] ?? '') === originalInstructions, JSON.stringify(restored.body?.agents?.[agent]))

const restoredOther = await call({ method: 'POST', body: JSON.stringify({ action: otherBefore === undefined ? 'clear-instructions' : 'save-instructions', agent: other, instructions: otherBefore ?? '' }) })
check('the other agent is restored', restoredOther.status === 200 && (restoredOther.body?.agents?.[other] ?? '') === (otherBefore ?? ''), JSON.stringify(restoredOther.body?.agents?.[other]))

const finalRead = await call({ method: 'GET' })
check('the Host serves the restored state', (finalRead.body?.agents?.[agent] ?? '') === originalInstructions, JSON.stringify(finalRead.body?.agents?.[agent]))
check('the Host serves the restored model', finalRead.body?.defaultModel?.model === originalModel.model, JSON.stringify(finalRead.body?.defaultModel))

console.log(failures === 0 ? '\nsmoke test passed' : `\nsmoke test failed: ${String(failures)} check(s)`)
process.exit(failures === 0 ? 0 : 1)

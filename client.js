window.__ModuleLoader__.load({
  id: '@local/dsh-agent-customizer',
  factory: (require) => {
    const React = require('react')
    /** Must match the Host row's `endpoint`. */
    const ENDPOINT = '/plugins/agent-customizer'
    /** This plugin's own namespace in the Client locale service. */
    const NS = 'settings.agentCustomization'

    /** Visible text. Kept beside the exported locale resources for the same keys. */
    const dictionaries = {      en: {
        'agent.nav': 'Agent customization',
        'agent.intro': 'Tune the agents this profile runs. The instructions belong to one agent and travel with it; the default model is the model every freshly created agent starts on.',
        'agent.agent': 'Agent',
        'agent.instructions': 'Instructions',
        'agent.instructions.hint': 'Read before any work starts. Write here what this agent must always do — it joins the agent’s own prompt, behind its persona.',
        'agent.instructions.placeholder': 'For example:\n- Always answer in Thai.\n- Run the smoke test before reporting done.\n- Keep the report in workspace/report.md.',
        'agent.save': 'Save',
        'agent.saving': 'Saving…',
        'agent.clear': 'Clear',
        'agent.saved': 'Saved. New requests of this agent use these instructions.',
        'agent.cleared': 'Cleared. This agent adds no instructions.',
        'agent.error': 'Could not save the instructions.',
        'agent.empty': 'Nothing is set, so this agent adds no instructions.',
        'agent.defaultModel': 'Default model',
        'agent.defaultModel.hint': 'The model every freshly created agent starts on. A session that already chose a model keeps it.',
        'agent.provider': 'Provider',
        'agent.model': 'Model',
        'agent.effort': 'Reasoning effort',
        'agent.effort.auto': 'Auto (adapter default)',
        'agent.model.saved': 'Saved. New agents start on this model.',
        'agent.model.error': 'Could not save the default model.',
        'agent.model.none': 'No provider is configured.',
        'agent.loading': 'Loading…',
        'agent.unavailable': 'The customization service is not available.',
        'agent.broken': 'This agent could not be activated.',
        'unit.gap': ' ',
      },
      th: {
        'agent.nav': 'ปรับแต่งเอเจนต์',
        'agent.intro': 'ปรับแต่งเอเจนต์ที่โปรไฟล์นี้ใช้ คำสั่งงานจะผูกกับเอเจนต์แต่ละตัวและติดตัวไปด้วย ส่วนโมเดลเริ่มต้นคือโมเดลที่เอเจนต์ที่สร้างใหม่ทุกตัวจะเริ่มใช้',
        'agent.agent': 'เอเจนต์',
        'agent.instructions': 'คำสั่งงาน',
        'agent.instructions.hint': 'อ่านก่อนเริ่มงานทุกครั้ง เขียนสิ่งที่เอเจนต์นี้ต้องทำเสมอ — ข้อความจะถูกแทรกในพรอมต์ของเอเจนต์เอง ต่อจาก persona',
        'agent.instructions.placeholder': 'ตัวอย่าง:\n- ตอบเป็นภาษาไทยเสมอ\n- ต้องรัน smoke test ก่อนรายงานว่าเสร็จแล้ว\n- รายงานอยู่ที่ workspace/report.md',
        'agent.save': 'บันทึก',
        'agent.saving': 'กำลังบันทึก…',
        'agent.clear': 'ล้าง',
        'agent.saved': 'บันทึกแล้ว คำขอใหม่ของเอเจนต์นี้จะใช้คำสั่งเหล่านี้',
        'agent.cleared': 'ล้างแล้ว เอเจนต์นี้จะไม่เพิ่มคำสั่งใด ๆ',
        'agent.error': 'บันทึกคำสั่งไม่สำเร็จ',
        'agent.empty': 'ยังไม่ได้ตั้งคำสั่ง เอเจนต์นี้จะไม่เพิ่มข้อความใด ๆ',
        'agent.defaultModel': 'โมเดลเริ่มต้น',
        'agent.defaultModel.hint': 'โมเดลที่เอเจนต์ที่สร้างใหม่ทุกตัวจะเริ่มใช้ เซสชันที่เลือกโมเดลไว้แล้วจะยังคงโมเดลเดิม',
        'agent.provider': 'ผู้ให้บริการ',
        'agent.model': 'โมเดล',
        'agent.effort': 'ระดับการคิด',
        'agent.effort.auto': 'อัตโนมัติ (ค่าเริ่มต้นของผู้ให้บริการ)',
        'agent.model.saved': 'บันทึกแล้ว เอเจนต์ใหม่จะเริ่มใช้โมเดลนี้',
        'agent.model.error': 'บันทึกโมเดลเริ่มต้นไม่สำเร็จ',
        'agent.model.none': 'ยังไม่มีผู้ให้บริการโมเดลที่ตั้งค่าไว้',
        'agent.loading': 'กำลังโหลด…',
        'agent.unavailable': 'ไม่พบบริการปรับแต่งเอเจนต์',
        'agent.broken': 'เอเจนต์นี้เปิดใช้งานไม่ได้',
        'unit.gap': ' ',
      },
      zh: {
        'agent.nav': '智能体定制',
        'agent.intro': '调整此配置使用的智能体。指令属于某一个智能体并随其生效；默认模型是每个新建智能体启动时使用的模型。',
        'agent.agent': '智能体',
        'agent.instructions': '指令',
        'agent.instructions.hint': '开始任何工作前先阅读。写下这个智能体必须始终做的事——它会加入该智能体自己的提示词，位于其 persona 之后。',
        'agent.instructions.placeholder': '例如：\n- 始终用中文回答。\n- 报告完成前先跑冒烟测试。\n- 报告放在 workspace/report.md。',
        'agent.save': '保存',
        'agent.saving': '保存中…',
        'agent.clear': '清除',
        'agent.saved': '已保存。该智能体的新请求将使用这些指令。',
        'agent.cleared': '已清除。该智能体不再添加任何指令。',
        'agent.error': '无法保存指令。',
        'agent.empty': '尚未设置，该智能体不会添加任何内容。',
        'agent.defaultModel': '默认模型',
        'agent.defaultModel.hint': '每个新建智能体启动时使用的模型。已选择模型的会话将保持其模型。',
        'agent.provider': '提供方',
        'agent.model': '模型',
        'agent.effort': '推理强度',
        'agent.effort.auto': '自动（适配器默认值）',
        'agent.model.saved': '已保存。新智能体将使用该模型启动。',
        'agent.model.error': '无法保存默认模型。',
        'agent.model.none': '尚未配置模型提供方。',
        'agent.loading': '加载中…',
        'agent.unavailable': '定制服务不可用。',
        'agent.broken': '该智能体无法激活。',
        'unit.gap': ' ',
      },
    }

    /** Fill `{name}` placeholders from one values object. */
    function format(text, values) {
      if (values === undefined) return text
      return text.replace(/\{(\w+)\}/gu, (match, name) => (values[name] === undefined ? match : String(values[name])))
    }

    /** The row's own styles; the class names are unique to this plugin. */
    const css = [
      '.dshac_section{display:flex;flex-direction:column;gap:16px}',
      '.dshac_title{font-size:14px;line-height:20px;color:var(--dsw-alias-label-primary)}',
      '.dshac_description{margin-top:4px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}',
      '.dshac_field{display:flex;flex-direction:column;gap:6px}',
      '.dshac_label{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}',
      '.dshac_select,.dshac_textarea{box-sizing:border-box;width:100%;padding:8px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px}',
      '.dshac_select:focus,.dshac_textarea:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}',
      '.dshac_textarea{min-height:132px;max-height:320px;resize:vertical}',
      '.dshac_textarea::placeholder{color:var(--dsw-alias-label-secondary)}',
      '.dshac_row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}',
      '.dshac_grow{flex:1 1 220px;min-width:0}',
      '.dshac_button{height:32px;padding:0 14px;border:none;border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;cursor:pointer}',
      '@media (hover:hover){.dshac_button:hover{background:var(--dsw-alias-interactive-bg-hover)}}',
      '.dshac_button:disabled{opacity:.5;cursor:default}',
      '.dshac_status{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}',
      '.dshac_statusError{color:var(--dsw-alias-state-error-primary)}',
      '.dshac_statusOk{color:var(--dsw-alias-state-success-primary)}',
      '.dshac_separator{height:.5px;border:none;margin:0;background:var(--dsw-alias-border-l2)}',
      '.dshac_warning{font-size:12px;line-height:18px;color:var(--dsw-alias-state-error-primary)}',
    ].join('')

    const apply = (ctx) => {
      // Visible text goes through the Client locale service: the dictionaries
      // are registered under this plugin's own namespace, so the shell resolves
      // them with the active language and its fallback chain.
      ctx.effect(() => {
        try {
          return ctx.locale.register(NS, dictionaries)
        } catch {
          // The locale service refused the namespace: the inline dictionaries
          // below still translate every string.
          return () => {}
        }
      }, 'agent-customizer: locale dictionaries')

      /** Translate through the locale service, falling back to the inline copy. */
      const t = (key, values) => {
        try {
          const text = ctx.locale.bind(NS)(key, values)
          if (typeof text === 'string' && text.length > 0 && text !== key) return text
        } catch {
          /* the locale service is unavailable: use the inline copy */
        }
        let id = 'en'
        try {
          const snapshot = ctx.locale.getSnapshot()
          id = String(snapshot?.active ?? snapshot?.id ?? 'en')
        } catch {
          id = 'en'
        }
        const dict = dictionaries[id] ?? dictionaries[id.split('-')[0]] ?? dictionaries.en
        return format(dict[key] ?? dictionaries.en[key] ?? key, values)
      }

      /** One labelled control. */
      function Field({ label, hint, children }) {
        return React.createElement(
          'div',
          { className: 'dshac_field' },
          React.createElement('div', { className: 'dshac_label' }, label),
          children,
          hint ? React.createElement('div', { className: 'dshac_label' }, hint) : null,
        )
      }

      /** The Agent customization settings section. */
      function AgentCustomizationSection() {
        const [state, setState] = React.useState(null)
        const [error, setError] = React.useState(null)
        const [agent, setAgent] = React.useState('')
        const [text, setText] = React.useState('')
        const [status, setStatus] = React.useState('idle')
        const [busy, setBusy] = React.useState(false)
        const [provider, setProvider] = React.useState('')
        const [model, setModel] = React.useState('')
        const [effort, setEffort] = React.useState('')
        const [modelStatus, setModelStatus] = React.useState('idle')
        const [modelBusy, setModelBusy] = React.useState(false)

        /** Read the whole customization state from the Host. */
        const load = React.useCallback(async () => {
          try {
            const response = await fetch(ENDPOINT, { headers: { accept: 'application/json' } })
            if (!response.ok) throw new Error(`status ${response.status}`)
            const body = await response.json()
            setState(body)
            setError(null)
            const presets = Array.isArray(body?.presets) ? body.presets : []
            setAgent((current) => {
              if (current.length > 0 && presets.some((row) => row.id === current)) return current
              const fallback = presets.find((row) => row.isDefault) ?? presets[0]
              return fallback?.id ?? ''
            })
            const selection = body?.defaultModel
            setProvider(typeof selection?.provider === 'string' ? selection.provider : '')
            setModel(typeof selection?.model === 'string' ? selection.model : '')
            setEffort(typeof selection?.reasoningEffort === 'string' ? selection.reasoningEffort : '')
            return body
          } catch (failure) {
            setError(failure instanceof Error ? failure.message : String(failure))
            return null
          }
        }, [])

        React.useEffect(() => {
          void load()
        }, [load])

        // Adopt the stored instructions whenever the selected agent changes.
        React.useEffect(() => {
          const stored = state?.agents?.[agent]
          setText(typeof stored === 'string' ? stored : '')
          setStatus('idle')
        }, [agent, state])

        const presets = Array.isArray(state?.presets) ? state.presets : []
        const providers = Array.isArray(state?.providers) ? state.providers : []
        const selectedProvider = providers.find((group) => group.id === provider)
        const models = selectedProvider?.models ?? []
        const efforts = models.find((entry) => entry.id === model)?.efforts ?? []
        // An effort the chosen model does not advertise is shown as "Auto" and
        // is removed when the selection is saved.
        const effortValue = efforts.includes(effort) ? effort : ''
        const selected = presets.find((row) => row.id === agent)

        /** Send one action to the Host and adopt its answer. */
        const send = async (body) => {
          const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { accept: 'application/json', 'content-type': 'application/json' },
            body: JSON.stringify(body),
          })
          const answer = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(answer?.error ?? `status ${response.status}`)
          setState(answer)
          return answer
        }

        /** Store the instructions of the selected agent. */
        const save = async () => {
          if (busy || agent.length === 0) return
          setBusy(true)
          setStatus('saving')
          try {
            const answer = await send({ action: 'save-instructions', agent, instructions: text })
            const stored = answer?.agents?.[agent]
            setText(typeof stored === 'string' ? stored : '')
            setStatus('saved')
          } catch {
            setStatus('error')
          } finally {
            setBusy(false)
          }
        }

        /** Remove the instructions of the selected agent. */
        const clear = async () => {
          if (busy || agent.length === 0) return
          setBusy(true)
          setStatus('saving')
          try {
            await send({ action: 'clear-instructions', agent })
            setText('')
            setStatus('cleared')
          } catch {
            setStatus('error')
          } finally {
            setBusy(false)
          }
        }

        /** Store the model every freshly created agent starts on. */
        const saveModel = async () => {
          if (modelBusy || provider.length === 0 || model.length === 0) return
          setModelBusy(true)
          setModelStatus('saving')
          try {
            const answer = await send({
              action: 'save-model',
              provider,
              model,
              // An empty choice means "Auto": the stored effort is removed and
              // the adapter decides. The Host replaces the whole selection, so
              // the field is always sent, never left out.
              reasoningEffort: effortValue === '' ? null : effortValue,
            })
            const selection = answer?.defaultModel
            setProvider(typeof selection?.provider === 'string' ? selection.provider : provider)
            setModel(typeof selection?.model === 'string' ? selection.model : model)
            setEffort(typeof selection?.reasoningEffort === 'string' ? selection.reasoningEffort : '')
            setModelStatus('saved')
          } catch {
            setModelStatus('error')
          } finally {
            setModelBusy(false)
          }
        }

        /** Ctrl+Enter (Cmd+Enter on macOS) saves without leaving the keyboard. */
        const onKeyDown = (event) => {
          if (event.key !== 'Enter' || !(event.ctrlKey || event.metaKey)) return
          event.preventDefault()
          void save()
        }

        let statusText
        let statusClass = 'dshac_status'
        if (status === 'saving') {
          statusText = t('agent.saving')
        } else if (status === 'saved') {
          statusText = t('agent.saved')
          statusClass = 'dshac_status dshac_statusOk'
        } else if (status === 'cleared') {
          statusText = t('agent.cleared')
          statusClass = 'dshac_status dshac_statusOk'
        } else if (status === 'error') {
          statusText = t('agent.error')
          statusClass = 'dshac_status dshac_statusError'
        } else if (text.trim().length === 0) {
          statusText = t('agent.empty')
        } else {
          statusText = t('agent.instructions.hint')
        }

        let modelStatusText
        let modelStatusClass = 'dshac_status'
        if (modelStatus === 'saving') {
          modelStatusText = t('agent.saving')
        } else if (modelStatus === 'saved') {
          modelStatusText = t('agent.model.saved')
          modelStatusClass = 'dshac_status dshac_statusOk'
        } else if (modelStatus === 'error') {
          modelStatusText = t('agent.model.error')
          modelStatusClass = 'dshac_status dshac_statusError'
        }

        return React.createElement(
          'section',
          { className: 'dshac_section' },
          React.createElement('style', null, css),
          React.createElement(
            'div',
            null,
            React.createElement('h2', { className: 'dshac_title' }, t('agent.nav')),
            React.createElement('p', { className: 'dshac_description' }, t('agent.intro')),
          ),
          error ? React.createElement('p', { className: 'dshac_warning', role: 'alert' }, error) : null,
          state === null
            ? React.createElement('p', { className: 'dshac_status', role: 'status' }, t('agent.loading'))
            : null,
          React.createElement(
            Field,
            { label: t('agent.agent') },
            React.createElement(
              'select',
              {
                className: 'dshac_select',
                value: agent,
                'aria-label': t('agent.agent'),
                disabled: presets.length === 0,
                onChange: (event) => setAgent(event.target.value),
              },
              presets.length === 0
                ? React.createElement('option', { value: '' }, t('agent.model.none'))
                : presets.map((row) => React.createElement(
                    'option',
                    { key: row.id, value: row.id },
                    row.name + (row.isDefault ? ' ★' : ''),
                  )),
            ),
          ),
          selected?.broken
            ? React.createElement('p', { className: 'dshac_warning', role: 'alert' }, `${t('agent.broken')} ${selected.broken}`)
            : null,
          React.createElement(
            Field,
            { label: t('agent.instructions'), hint: t('agent.instructions.hint') },
            React.createElement('textarea', {
              className: 'dshac_textarea',
              value: text,
              spellCheck: false,
              placeholder: t('agent.instructions.placeholder'),
              'aria-label': t('agent.instructions'),
              disabled: agent.length === 0,
              onChange: (event) => {
                setText(event.target.value)
                if (status === 'saved' || status === 'cleared' || status === 'error') setStatus('idle')
              },
              onKeyDown,
            }),
          ),
          React.createElement(
            'div',
            { className: 'dshac_row' },
            React.createElement(
              'button',
              { type: 'button', className: 'dshac_button', disabled: busy || agent.length === 0, onClick: () => void save() },
              t('agent.save'),
            ),
            React.createElement(
              'button',
              { type: 'button', className: 'dshac_button', disabled: busy || agent.length === 0, onClick: () => void clear() },
              t('agent.clear'),
            ),
            React.createElement('span', { className: statusClass, role: 'status' }, statusText),
          ),
          React.createElement('hr', { className: 'dshac_separator' }),
          React.createElement(
            Field,
            { label: t('agent.defaultModel'), hint: t('agent.defaultModel.hint') },
            React.createElement(
              'div',
              { className: 'dshac_row' },
              React.createElement(
                'div',
                { className: 'dshac_grow' },
                React.createElement(
                  'select',
                  {
                    className: 'dshac_select',
                    value: provider,
                    'aria-label': t('agent.provider'),
                    disabled: providers.length === 0,
                    onChange: (event) => {
                      setProvider(event.target.value)
                      const group = providers.find((entry) => entry.id === event.target.value)
                      setModel(group?.models?.[0]?.id ?? '')
                      setEffort('')
                      setModelStatus('idle')
                    },
                  },
                  providers.length === 0
                    ? React.createElement('option', { value: '' }, t('agent.model.none'))
                    : providers.map((group) => React.createElement(
                        'option',
                        { key: group.id, value: group.id },
                        group.name,
                      )),
                ),
              ),
              React.createElement(
                'div',
                { className: 'dshac_grow' },
                React.createElement(
                  'select',
                  {
                    className: 'dshac_select',
                    value: model,
                    'aria-label': t('agent.model'),
                    disabled: models.length === 0,
                    onChange: (event) => {
                      setModel(event.target.value)
                      setEffort('')
                      setModelStatus('idle')
                    },
                  },
                  models.length === 0
                    ? React.createElement('option', { value: '' }, t('agent.model.none'))
                    : models.map((entry) => React.createElement(
                        'option',
                        { key: entry.id, value: entry.id },
                        entry.name,
                      )),
                ),
              ),
              React.createElement(
                'div',
                { className: 'dshac_grow' },
                React.createElement(
                  'select',
                  {
                    className: 'dshac_select',
                    value: effortValue,
                    'aria-label': t('agent.effort'),
                    disabled: efforts.length === 0,
                    onChange: (event) => {
                      setEffort(event.target.value)
                      setModelStatus('idle')
                    },
                  },
                  React.createElement('option', { value: '' }, t('agent.effort.auto')),
                  efforts.map((entry) => React.createElement(
                    'option',
                    { key: entry, value: entry },
                    entry,
                  )),
                ),
              ),
            ),
          ),
          React.createElement(
            'div',
            { className: 'dshac_row' },
            React.createElement(
              'button',
              {
                type: 'button',
                className: 'dshac_button',
                disabled: modelBusy || provider.length === 0 || model.length === 0,
                onClick: () => void saveModel(),
              },
              t('agent.save'),
            ),
            React.createElement('span', { className: modelStatusClass, role: 'status' }, modelStatusText ?? ''),
          ),
        )
      }

      ctx.slots.inject('settings.section', () =>
        ctx.slots.register({
          name: 'settings.section',
          id: 'agent-customization',
          order: 21,
          label: () => t('agent.nav'),
        }, AgentCustomizationSection),
      )
    }

    return { inject: ['slots', 'locale'], apply }
  },
})

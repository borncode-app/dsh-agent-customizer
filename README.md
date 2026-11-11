<div align="center">
  <img src="icon.svg" alt="" width="72" height="72">
  <h1>dsh-agent-customizer</h1>
  <p><b>Per-agent instructions and a deployment default model, editable from the Web GUI.</b></p>
  <p>
    <a href="https://github.com/borncode-app/dsh-agent-customizer/releases"><img alt="release" src="https://img.shields.io/github/v/release/borncode-app/dsh-agent-customizer?style=flat-square&color=6C4BF6"></a>
    <a href="LICENSE"><img alt="license" src="https://img.shields.io/badge/license-MIT-3DA639?style=flat-square"></a>
    <img alt="plugin" src="https://img.shields.io/badge/DeepSeek%20Harness-plugin-6C4BF6?style=flat-square">
    <img alt="platform" src="https://img.shields.io/badge/platform-win%20%7C%20mac%20%7C%20linux-555?style=flat-square">
  </p>
</div>

---

## What it does

DeepSeek Harness lets you pick which agent answers a conversation. This plugin gives each of those agents a
personality you control: a free-text **Instructions** block that is contributed to that agent's own system prompt,
plus a **default model** for the deployment, both edited on one page.

Nothing is baked into the bundle. The instructions live in `state.json` next to the plugin, so a profile upgrade
(or a `git pull`) never wipes what you wrote.

## Features

- **Per-agent instructions** — one editor per agent in *Settings → Agent customization*; each agent only sees its own block.
- **Deployment default model** — read and written from the same page, so the fallback model is not a YAML hunt.
- **Survives upgrades** — text is persisted in the plugin's `state.json`, not in the profile's patch file.
- **Bounded input** — `maxLength` rejects runaway pastes before they reach a system prompt.
- **Localized UI** — English, Thai, and Chinese strings shipped in `locale/`.
- No network calls, no credentials, no background timers.

## Requirements

| | |
|---|---|
| DeepSeek Harness | 0.2.x (Web GUI) |
| Runtime | Node 24, supplied by the Harness runtime — nothing to install |
| Platform | Windows, macOS, Linux |

## Install

Clone the repo anywhere stable, then install it as a bundle into your profile:

```bash
git clone https://github.com/borncode-app/dsh-agent-customizer.git dsh-agent-customizer
```

In DSH, open **Plugins** and install the bundle from that directory, or ask the agent:

```
plugin_manager install_bundle target=C:\path\to\dsh-agent-customizer
```

Restart once. The row appears as `agent-customizer`, and the profile keeps a `link:` reference to the directory,
so a later `git pull` updates the plugin in place.

## Configuration

The bundle's [`cordis.patch.yml`](cordis.patch.yml) inserts the host row. Override any field in your profile's
`cordis.patch.yml`:

| field | default | meaning |
|---|---|---|
| `endpoint` | `/plugins/agent-customizer` | Path the Web GUI reads and writes customizations at |
| `maxLength` | `20000` | Largest instruction text accepted, in characters |

Example override:

```yaml
- id: agent-customizer
  config:
    maxLength: 40000
```

## How it works

1. The host row registers a small HTTP endpoint on the Web GUI origin and loads `state.json`.
2. The client half (`client.js`) renders the editor for the current agent and PUTs the text back.
3. On every turn, the host row contributes the stored text to that agent's system prompt — and nothing else.

## Files

| file | role |
|---|---|
| `index.js` | host row: endpoint, persistence, system-prompt contribution |
| `client.js` | Web GUI page: per-agent editor, default-model control |
| `cordis.patch.yml` | the bundle patch that inserts the row |
| `locale/{en,th,zh}.json` | UI strings |
| `icon.svg` | plugin icon |
| `test/` | the checks used while building it |

## ภาษาไทย

Plugin นี้ทำให้คุณปรับ **"ตัวตน" ของ agent แต่ละตัว** ได้จากหน้า Settings → Agent customization โดยตรง:

- **Instructions** ของแต่ละ agent — ข้อความที่คุณเขียนจะถูกส่งเข้า system prompt ของ agent ตัวนั้นเท่านั้น
- **โมเดลเริ่มต้นของ deployment** — ตั้ง/แก้ได้จากหน้าเดียวกัน ไม่ต้องไปแก้ YAML
- ข้อความถูกเก็บใน `state.json` ของ plugin ไม่ใช่ใน patch ของโปรไฟล์ → อัปเกรด DSH หรือ `git pull` แล้วข้อความไม่หาย

ติดตั้ง: `git clone` แล้วสั่ง `plugin_manager install_bundle target=<path>` ใน DSH รีสตาร์ทหนึ่งครั้ง

## License

[MIT](LICENSE) © 2026 BornCode

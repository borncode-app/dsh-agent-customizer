> **This repository has moved into one monorepo.**
>
> The BornCode plugins — agent customization, desktop control, auto-continue,
> auto-shutdown, browser use, session instructions, session sync, and the side
> chat — now live in
> **[`borncode-app/dsh-borncode`](https://github.com/borncode-app/dsh-borncode)**,
> one repository with one Plugins entry.
>
> | this repo | new home |
> |---|---|
> | `dsh-agent-customizer` | `packages/dsh-agent-customizer` |
> | `dsh-agent-desktop` | `packages/dsh-agent-desktop` |
> | `dsh-auto-continue` | `packages/dsh-auto-continue` |
> | `dsh-auto-shutdown` | `packages/dsh-auto-shutdown` |
> | `dsh-browser-use` | `packages/dsh-browser-use` |
> | `dsh-session-instructions` | `packages/dsh-session-instructions` |
> | `dsh-session-sync` | `packages/dsh-session-sync` |
> | `dsh-side-chat` | `packages/dsh-side-chat` |
>
> The code and its history are unchanged; only the repository is shared. Install
> `dsh-borncode` instead of the individual bundles. This repository stays open
> so the old links keep working.
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

- **Per-agent instructions** â€” one editor per agent in *Settings â†’ Agent customization*; each agent only sees its own block.
- **Deployment default model** â€” read and written from the same page, so the fallback model is not a YAML hunt.
- **Survives upgrades** â€” text is persisted in the plugin's `state.json`, not in the profile's patch file.
- **Bounded input** â€” `maxLength` rejects runaway pastes before they reach a system prompt.
- **Localized UI** â€” English, Thai, and Chinese strings shipped in `locale/`.
- No network calls, no credentials, no background timers.

## Requirements

| | |
|---|---|
| DeepSeek Harness | 0.2.x (Web GUI) |
| Runtime | Node 24, supplied by the Harness runtime â€” nothing to install |
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
3. On every turn, the host row contributes the stored text to that agent's system prompt â€” and nothing else.

## Files

| file | role |
|---|---|
| `index.js` | host row: endpoint, persistence, system-prompt contribution |
| `client.js` | Web GUI page: per-agent editor, default-model control |
| `cordis.patch.yml` | the bundle patch that inserts the row |
| `locale/{en,th,zh}.json` | UI strings |
| `icon.svg` | plugin icon |
| `test/` | the checks used while building it |

## à¸ à¸²à¸©à¸²à¹„à¸—à¸¢

Plugin à¸™à¸µà¹‰à¸—à¸³à¹ƒà¸«à¹‰à¸„à¸¸à¸“à¸›à¸£à¸±à¸š **"à¸•à¸±à¸§à¸•à¸™" à¸‚à¸­à¸‡ agent à¹à¸•à¹ˆà¸¥à¸°à¸•à¸±à¸§** à¹„à¸”à¹‰à¸ˆà¸²à¸à¸«à¸™à¹‰à¸² Settings â†’ Agent customization à¹‚à¸”à¸¢à¸•à¸£à¸‡:

- **Instructions** à¸‚à¸­à¸‡à¹à¸•à¹ˆà¸¥à¸° agent â€” à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡à¸—à¸µà¹ˆà¸„à¸¸à¸“à¹€à¸‚à¸µà¸¢à¸™à¸ˆà¸°à¸–à¸¹à¸à¸ªà¹ˆà¸‡à¹€à¸‚à¹‰à¸² system prompt à¸‚à¸­à¸‡ agent à¸•à¸±à¸§à¸™à¸±à¹‰à¸™à¹€à¸—à¹ˆà¸²à¸™à¸±à¹‰à¸™
- **à¹‚à¸¡à¹€à¸”à¸¥à¹€à¸£à¸´à¹ˆà¸¡à¸•à¹‰à¸™à¸‚à¸­à¸‡ deployment** â€” à¸•à¸±à¹‰à¸‡/à¹à¸à¹‰à¹„à¸”à¹‰à¸ˆà¸²à¸à¸«à¸™à¹‰à¸²à¹€à¸”à¸µà¸¢à¸§à¸à¸±à¸™ à¹„à¸¡à¹ˆà¸•à¹‰à¸­à¸‡à¹„à¸›à¹à¸à¹‰ YAML
- à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡à¸–à¸¹à¸à¹€à¸à¹‡à¸šà¹ƒà¸™ `state.json` à¸‚à¸­à¸‡ plugin à¹„à¸¡à¹ˆà¹ƒà¸Šà¹ˆà¹ƒà¸™ patch à¸‚à¸­à¸‡à¹‚à¸›à¸£à¹„à¸Ÿà¸¥à¹Œ â†’ à¸­à¸±à¸›à¹€à¸à¸£à¸” DSH à¸«à¸£à¸·à¸­ `git pull` à¹à¸¥à¹‰à¸§à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡à¹„à¸¡à¹ˆà¸«à¸²à¸¢

à¸•à¸´à¸”à¸•à¸±à¹‰à¸‡: `git clone` à¹à¸¥à¹‰à¸§à¸ªà¸±à¹ˆà¸‡ `plugin_manager install_bundle target=<path>` à¹ƒà¸™ DSH à¸£à¸µà¸ªà¸•à¸²à¸£à¹Œà¸—à¸«à¸™à¸¶à¹ˆà¸‡à¸„à¸£à¸±à¹‰à¸‡

## License

[MIT](LICENSE) Â© 2026 BornCode

# Installation

Install the Draw.io Base Skill first. Add the Academic Overlay beside it only when you need publication-facing defaults. Add optional live-edit MCP only if you want base-skill browser sessions.

Five-tool discovery, model-control locations, and verified vs UNVERIFIED evidence live in the portable matrix at `skills/drawio/references/docs/harness-compatibility.md`. A harness is not a model tier.

## Prerequisites

- [Node.js](https://nodejs.org/) with `npx`
- One in-scope client:
  - Claude Code
  - Codex
  - Grok Build
  - Kimi Code
  - OMP (Oh My Pi)

Verify Node:

```bash
node --version
npx --version
```

## Recommended Install

```bash
npx skills add bahayonghang/drawio-skills
```

This installs the repository skill set into the skill directory for the current client integration. Restart the client, then verify **actual discovery** in a fresh session: the client must report the loaded `SKILL.md` absolute path and `version`. Copying files or opening them by path is not a discovery proof.

## Skill Variants

- `skills/drawio`: Draw.io Base Skill for general diagrams, network topology, structured redraws, import/export, shared styles, and optional live refinement.
- `skills/drawio-academic-skills`: Academic Overlay for paper-first diagrams. It depends on sibling `../drawio`; it does not include copied base runtime files and does not require MCP.

## Manual Install

### 1. Clone the repository

```bash
git clone https://github.com/bahayonghang/drawio-skills.git
cd drawio-skills
```

### 2. Copy skill folders into your client's skill directory

Copy `skills/drawio` by default.

For academic-paper defaults, copy both folders side by side:

```text
skills/
├── drawio/
└── drawio-academic-skills/
```

The overlay resolves `../drawio/scripts/cli.js`, `../drawio/references/`, `../drawio/assets/themes/`, and `../drawio/styles/built-in/` at runtime. It must read the five-tool matrix at `../drawio/references/docs/harness-compatibility.md` and must not copy that file.

#### Claude Code

- Project: `.claude/skills/`
- User: `~/.claude/skills` (Windows: `%USERPROFILE%\.claude\skills\`)

#### Codex

- Project: `.agents/skills/`
- User: `~/.agents/skills` (Windows: `%USERPROFILE%\.agents\skills\`)

Codex is `.agents/skills`, not `.codex/skills`.

#### Grok Build

- Native: `.grok/skills/`
- User: `~/.grok/skills` and `~/.agents/skills`

#### Kimi Code

- `.agents/skills/` and `.kimi-code/skills/`

#### OMP (Oh My Pi)

- `.agents/skills/` may be discovered depending on enabled providers

Missing project `.grok` / `.kimi-code` / `.omp` directories is not proof of missing capability. Restart the client after copying the folders.

## Optional Live Editing Setup

Normal create/edit/export work does **not** require MCP. Configure `@next-ai-drawio/mcp-server` only if you want base-skill live browser refinement.

Academic overlay does not need MCP and should not route through a live backend.

### Claude JSON config (and hosts that use the same `mcpServers` JSON)

macOS / Linux:

```json
{
  "mcpServers": {
    "drawio": {
      "command": "npx",
      "args": ["--yes", "@next-ai-drawio/mcp-server@latest"]
    }
  }
}
```

Windows:

```json
{
  "mcpServers": {
    "drawio": {
      "type": "stdio",
      "command": "cmd",
      "args": ["/c", "npx", "--yes", "@next-ai-drawio/mcp-server@latest"]
    }
  }
}
```

### Codex `config.toml`

macOS / Linux:

```toml
[mcp_servers.drawio]
command = "npx"
args = ["--yes", "@next-ai-drawio/mcp-server@latest"]
```

Windows:

```toml
[mcp_servers.drawio]
type = "stdio"
command = "cmd"
args = ["/c", "npx", "--yes", "@next-ai-drawio/mcp-server@latest"]
```

## Optional Desktop Export Setup

Install draw.io Desktop if you want:

- default 300dpi `.png`
- `.pdf`, `.jpg` export
- embedded `.drawio.svg`
- local desktop preview

Without Desktop, PNG export falls back to standalone SVG and must be reported. Explicit journal/IEEE vector still uses PDF or SVG. The standalone SVG path does **not** require draw.io Desktop.

## Verify the Installation

### Verify actual skill discovery

In a **fresh** session, ask the client which `SKILL.md` it loaded. A pass names the absolute path and `version`. Directory existence, `npx skills add`, or opening `skills/` by path is not that proof. Details: `skills/drawio/references/docs/harness-compatibility.md`.

### Verify the base skill is reachable

Try a simple request in your client:

```text
/drawio create a small high-contrast flowchart with 4 nodes
```

### Verify the academic overlay is reachable

```text
/drawio-academic-skills create a grayscale-safe IEEE workflow figure with 4 stages
```

If the overlay reports missing `../drawio`, copy the base skill beside it.

### Verify the local CLI

```bash
node skills/drawio/scripts/cli.js skills/drawio/references/examples/login-flow.yaml --validate
```

### Verify optional MCP availability

```bash
npm view @next-ai-drawio/mcp-server version
```

## Troubleshooting

### The skill loads, but no browser opens

That is expected in the default runtime. Browser sessions happen only when you configured optional MCP and explicitly use base-skill live refinement.

### Academic overlay cannot find `../drawio`

Install `skills/drawio` next to `skills/drawio-academic-skills`. The overlay is not a standalone copied package in the source tree.

### `No active session`

You are using MCP tools without a live session. Call `start_session` first, or switch back to the offline bundle workflow.

### Desktop export fails

Use standalone SVG instead, or install draw.io Desktop before using `--use-desktop`. Do not claim a 300dpi PNG was produced if Desktop was unavailable.

### Windows MCP launch fails

Wrap `npx` with `cmd /c` as shown above. Direct `npx` launch is often unreliable on Windows MCP transports.

## Next Steps

- [Getting Started](./getting-started.md)
- [Workflows](./workflows.md)
- [CLI Tool](./cli.md)
- [Optional MCP Tools](/api/mcp-tools.md)

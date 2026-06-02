# Installation

Install the Draw.io Base Skill first. Add the Academic Overlay beside it only when you need publication-facing defaults. Add optional live-edit MCP only if you want base-skill browser sessions.

## Prerequisites

- [Node.js](https://nodejs.org/) with `npx`
- One supported client:
  - Claude
  - Gemini
  - Codex

Verify Node:

```bash
node --version
npx --version
```

## Recommended Install

```bash
npx skills add bahayonghang/drawio-skills
```

This installs the repository skill set into the correct skill directory for the current client integration.

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

The overlay resolves `../drawio/scripts/cli.js`, `../drawio/references/`, `../drawio/assets/themes/`, and `../drawio/styles/built-in/` at runtime.

#### Claude

- macOS: `~/Library/Application Support/Claude/skills/`
- Linux: `~/.config/Claude/skills/`
- Windows: `%APPDATA%\Claude\skills\`

#### Gemini

- macOS: `~/Library/Application Support/gemini/skills/`
- Linux: `~/.gemini/skills/`
- Windows: `%APPDATA%\gemini\skills\`

#### Codex

- macOS / Linux: `~/.codex/skills/`
- Windows: `%USERPROFILE%\.codex\skills\`

Restart the client after copying the folders.

## Optional Live Editing Setup

Normal create/edit/export work does **not** require MCP. Configure `@next-ai-drawio/mcp-server` only if you want base-skill live browser refinement.

Academic overlay does not need MCP and should not route through a live backend.

### Claude / Gemini JSON config

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

- `.png`, `.pdf`, `.jpg` export
- embedded `.drawio.svg`
- local desktop preview

The standalone SVG path does **not** require draw.io Desktop.

## Verify the Installation

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

Use standalone SVG instead, or install draw.io Desktop before using `--use-desktop`.

### Windows MCP launch fails

Wrap `npx` with `cmd /c` as shown above. Direct `npx` launch is often unreliable on Windows MCP transports.

## Next Steps

- [Getting Started](./getting-started.md)
- [Workflows](./workflows.md)
- [CLI Tool](./cli.md)
- [Optional MCP Tools](/api/mcp-tools.md)

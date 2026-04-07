# Draw.io Skill for Claude, Gemini & Codex

[![Deploy Docs](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs.yml)
[![Deploy Docs (Push)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs-push.yml/badge.svg)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs-push.yml)
[![License: ISC](https://img.shields.io/badge/license-ISC-blue.svg)](https://spdx.org/licenses/ISC.html)

> **Important**: Draw.io Skill 2.2.0 is a **desktop-first hybrid workflow**. The default path is local generation through `YAML/CLI -> .drawio + sidecars`, optionally enhanced by draw.io Desktop for PNG/PDF/JPG and embedded SVG export. The [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) MCP server (`@next-ai-drawio/mcp-server`) is now an **optional live-editing layer**, not a hard dependency.

[English](./README.md) | [中文文档](./README_CN.md) | [Documentation](https://bahayonghang.github.io/drawio-skills/)

Draw.io Skill is a YAML-first, offline-first draw.io skill for engineering diagrams, academic figures, network diagrams, and structured redraws. It accepts natural language, YAML, Mermaid, CSV, and imported `.drawio` files, then normalizes everything into a consistent design-system-backed workflow.

## Features

- **Offline-first artifact bundle**: keep `.drawio`, `.spec.yaml`, and `.arch.json` aligned for repeatable local editing.
- **Desktop-aware export**: use draw.io Desktop for PNG, PDF, JPG, and embedded `.drawio.svg` when available.
- **Optional live browser refinement**: configure next-ai MCP only when you need a real-time browser session.
- **3 core routes**: `create`, `edit`, and `replicate`.
- **6 built-in themes**: `tech-blue`, `academic`, `academic-color`, `nature`, `dark`, `high-contrast`.
- **Academic and math guardrails**: IEEE-style output, MathJax-safe delimiters, caption and legend checks.
- **Cloud and stencil support**: AWS, GCP, Azure, Kubernetes, and network/provider icon workflows.
- **Network topology support**: semantic device types (`router`, `switch`, `firewall`, `server`, `load_balancer`, `subnet`, `internet`, `ap`), Phase B `star/mesh` layout improvements, and automatic link labels from interface/IP/VLAN/bandwidth metadata.
- **Vendor-aware icon mapping**: explicit AWS/Cisco icon prefixes, alias resolution (for example `aws.alb`, `aws.ec2`, `cisco.ap`), and vendor/device auto-mapping via `network.vendor` + `network.device`.
- **Import and normalize existing diagrams**: convert `.drawio` into a YAML-first bundle with `--input-format drawio --export-spec`.
- **Validation before export**: structure, layout, and quality checks, plus strict mode for paper-grade output.

## Runtime Model

Use the skill in this order unless the user explicitly wants live browser editing:

1. **Offline-first**: generate `.drawio` locally and keep sidecars in sync.
2. **Desktop-enhanced**: when draw.io Desktop is available, use it for raster/PDF export and embedded SVG.
3. **Optional live MCP**: use next-ai MCP only for real-time browser refinement.

## Install

### Recommended

```bash
npx skills add bahayonghang/drawio-skills
```

Restart your client after installation so it reloads the skill.

### Manual

1. Clone the repository.
2. Copy `skills/drawio` into your client's skill directory.

Common locations:

- **Claude**
  - macOS: `~/Library/Application Support/Claude/skills/`
  - Linux: `~/.config/Claude/skills/`
  - Windows: `%APPDATA%\Claude\skills\`
- **Gemini**
  - macOS: `~/Library/Application Support/gemini/skills/`
  - Linux: `~/.gemini/skills/`
  - Windows: `%APPDATA%\gemini\skills\`
- **Codex**
  - macOS / Linux: `~/.codex/skills/`
  - Windows: `%USERPROFILE%\.codex\skills\`

## Optional Live Editing Setup

Normal create/edit/export work does **not** require MCP. Configure `@next-ai-drawio/mcp-server` only if you want browser sessions.

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

## Quick Start

Create a new diagram:

```text
/drawio create a horizontal tech-blue login flow with 6 nodes
```

Create a network topology with structured metadata:

```text
/drawio create a tech-blue network topology with a firewall, core switch, two app servers, and a private database subnet. Label interfaces and VLANs on the links.
```

Replicate an uploaded image:

```text
/drawio replicate
Color mode: preserve-original
[upload screenshot]
```

Import an existing `.drawio` file into the offline bundle:

```bash
node skills/drawio/scripts/cli.js existing.drawio --input-format drawio --export-spec --write-sidecars
```

Render and validate a bundle:

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --validate --write-sidecars
node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars
```

Use strict mode for review-grade output:

```bash
node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars --strict-warnings
```

Use draw.io Desktop when you need raster or PDF export:

```bash
node skills/drawio/scripts/cli.js input.yaml output.pdf --validate --use-desktop
node skills/drawio/scripts/cli.js input.yaml output.png --validate --use-desktop
```

## Canonical Artifact Bundle

When the diagram will continue evolving, keep these files together:

- `<name>.drawio`
- `<name>.spec.yaml`
- `<name>.arch.json`

This is the preferred edit surface for the offline workflow.

## Network Topology Authoring

The current network-topology workflow supports:

- semantic node types such as `router`, `switch`, `firewall`, `server`, `load_balancer`, `subnet`, `internet`, and `ap`
- link metadata fields such as `srcInterface`, `dstInterface`, `ip`, `vlan`, `bandwidth`, and `linkType`
- layout intents `hierarchical`, `star`, and `mesh`
- provider-aware icon mapping through explicit `icon` fields or `network.vendor` + `network.device`

Representative specs now ship in `skills/drawio/references/examples/`:

- `campus-lan-topology.yaml`
- `aws-vpc-topology.yaml`
- `onprem-dmz-topology.yaml`
- `vendor-device-mapping.yaml`

Render one directly:

```bash
node skills/drawio/scripts/cli.js skills/drawio/references/examples/vendor-device-mapping.yaml output.drawio --validate --write-sidecars
```

## Documentation

- [Getting Started](https://bahayonghang.github.io/drawio-skills/guide/getting-started)
- [Workflows](https://bahayonghang.github.io/drawio-skills/guide/workflows)
- [CLI Tool](https://bahayonghang.github.io/drawio-skills/guide/cli)
- [Optional MCP Tools](https://bahayonghang.github.io/drawio-skills/api/mcp-tools)
- [Examples](https://bahayonghang.github.io/drawio-skills/examples/)

## Development

```bash
npm install
npm test
npm run docs:build
```

Repository layout:

- `skills/drawio/`: skill, CLI, references, themes, examples
- `docs/`: VitePress site
- `tests/`: repo-level integration tests

## Upstream Relationship

This skill builds on top of **[next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io)**, but wraps it in a YAML-first workflow with offline sidecars, design-system references, and route-specific guidance.

The official `@drawio/mcp` server is intentionally **not** the default integration surface for this repository because its tool model does not match the offline-first edit/replicate workflow.

## License

This repository currently declares **ISC** in `package.json`.

The optional upstream next-ai-draw-io MCP server is licensed under **Apache-2.0**:

- <https://github.com/DayuanJiang/next-ai-draw-io/blob/main/LICENSE>

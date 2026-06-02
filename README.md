# Draw.io Skill for Claude, Gemini & Codex

[![Deploy Docs](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs.yml)
[![Deploy Docs (Push)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs-push.yml/badge.svg)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs-push.yml)
[![License: ISC](https://img.shields.io/badge/license-ISC-blue.svg)](https://spdx.org/licenses/ISC.html)

> **Important**: Draw.io Skill 2.2.0 is a **YAML-first, offline-first base workflow**. The default path is local generation through `YAML/CLI -> .drawio + sidecars`, optionally enhanced by draw.io Desktop for PNG/PDF/JPG and embedded SVG export. The [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) MCP server (`@next-ai-drawio/mcp-server`) is optional **live refinement** for the base skill only, not a hard dependency.

[English](./README.md) | [中文文档](./README_CN.md) | [Documentation](https://bahayonghang.github.io/drawio-skills/)

Draw.io Skill is a YAML-first draw.io authoring system for engineering diagrams, network diagrams, structured redraws, Mermaid/CSV conversion, and imported `.drawio` files. Publication-facing work is handled by an Academic Overlay that depends on the sibling base skill instead of copying its runtime.

## Skill Variants

- `skills/drawio`: **Draw.io Base Skill**. Owns the shared CLI, schemas, references, themes, examples, style presets, Desktop export helpers, diagrams.net URL fallback, and optional live refinement backend.
- `skills/drawio-academic-skills`: **Academic Overlay**. Keeps academic policy, README, evals, and publication-specific references. It requires sibling `../drawio` for execution and never requires MCP/live backend.

The source tree intentionally keeps shared capability in one place. A standalone academic package can be generated later by a packaging workflow, but the repository model is base plus overlay.

## Features

- **YAML-first artifact bundle**: keep `.drawio`, `.spec.yaml`, and `.arch.json` aligned for repeatable local editing.
- **Desktop-aware export**: use draw.io Desktop for PNG, PDF, JPG, and embedded `.drawio.svg` when available.
- **Optional live refinement**: configure next-ai MCP only for base-skill browser refinement; academic overlay stays offline.
- **3 core routes**: `create`, `edit`, and `replicate`.
- **6 built-in themes**: `tech-blue`, `academic`, `academic-color`, `nature`, `dark`, `high-contrast`.
- **Academic overlay policy**: venue/audience preflight, caption/legend checks, formula fidelity, A4/Word/LaTeX expectations, and figure typing.
- **Academic figure taxonomy**: publication requests classify into `architecture`, `roadmap`, or `workflow` before layout and export.
- **Cloud and stencil support**: AWS, GCP, Azure, Kubernetes, and network/provider icon workflows through the base references.
- **Network topology support**: semantic device types (`router`, `switch`, `firewall`, `server`, `load_balancer`, `subnet`, `internet`, `ap`) and automatic link labels from interface/IP/VLAN/bandwidth metadata.
- **Import and normalize existing diagrams**: convert `.drawio` into a YAML-first bundle with `--input-format drawio --export-spec`.
- **Validation before export**: structure, layout, quality, formula, and replication text-position checks.

## Runtime Model

Use this order unless the request explicitly needs a browser session:

1. **Offline Authoring Path**: generate `.drawio` locally and keep sidecars in sync.
2. **Desktop-Enhanced Export**: use draw.io Desktop for raster/PDF and embedded SVG exports.
3. **Live Refinement Backend**: base-skill browser refinement only; the offline bundle remains canonical.
4. **Direct XML Exception**: tiny XML-only handoff or exact mxGraph control when YAML is not the right tool.

Academic overlay uses the first two paths only. It does not create, require, or route through `.mcp.json`, MCP, or live backend.

## Install

### Recommended

```bash
npx skills add bahayonghang/drawio-skills
```

Restart your client after installation so it reloads the skills.

### Manual

1. Clone the repository.
2. Copy `skills/drawio` into your client's skill directory.
3. For publication-facing workflows, also copy `skills/drawio-academic-skills` next to `drawio` so the overlay can resolve sibling `../drawio`.

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

Normal create/edit/export work does **not** require MCP. Configure `@next-ai-drawio/mcp-server` only when you want base-skill browser refinement.

Academic overlay does not need this setup.

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

Create a publication figure with the overlay:

```text
/drawio-academic-skills create an IEEE-style workflow figure for a manuscript. Deliver .drawio + .spec.yaml + .arch.json + .svg.
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

Academic overlay still uses the sibling base CLI:

```bash
node skills/drawio/scripts/cli.js skills/drawio/references/examples/system-architecture-paper.yaml academic-system.svg --validate --write-sidecars --strict-warnings
```

Use draw.io Desktop when you need raster or PDF export:

```bash
node skills/drawio/scripts/cli.js input.yaml output.pdf --validate --use-desktop
node skills/drawio/scripts/cli.js input.yaml output.png --validate --use-desktop
```

Generate a diagrams.net URL fallback from a `.drawio` file:

```bash
node skills/drawio/scripts/runtime/diagrams-net-url.js output.drawio
```

## Canonical Artifact Bundle

When the diagram will continue evolving, keep these files together:

- `<name>.drawio`
- `<name>.spec.yaml`
- `<name>.arch.json`

Academic overlay adds standalone SVG as part of the default publication bundle:

- `<name>.svg`

PNG/PDF/JPG are Desktop-enhanced optional outputs and should be reported as unavailable if draw.io Desktop is missing.

## Network Topology Authoring

The current network-topology workflow supports:

- semantic node types such as `router`, `switch`, `firewall`, `server`, `load_balancer`, `subnet`, `internet`, and `ap`
- link metadata fields such as `srcInterface`, `dstInterface`, `ip`, `vlan`, `bandwidth`, and `linkType`
- layout intents `hierarchical`, `star`, and `mesh`
- provider-aware icon mapping through explicit `icon` fields or `network.vendor` + `network.device`

Representative specs ship in `skills/drawio/references/examples/`.

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

- `skills/drawio/`: base skill, CLI, references, themes, schemas, examples, style presets
- `skills/drawio-academic-skills/`: academic overlay, README, evals, publication references
- `docs/`: VitePress site
- `tests/`: repo-level integration tests

## Upstream Relationship

This repository builds on draw.io and the optional **[next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io)** MCP server, but wraps shared behavior in a YAML-first workflow with offline sidecars, design-system references, and route-specific guidance.

The official `@drawio/mcp` server is intentionally **not** the default integration surface for this repository because its tool model does not match the offline-first edit/replicate workflow.

## License

This repository currently declares **ISC** in `package.json`.

The optional upstream next-ai-draw-io MCP server is licensed under **Apache-2.0**:

- <https://github.com/DayuanJiang/next-ai-draw-io/blob/main/LICENSE>

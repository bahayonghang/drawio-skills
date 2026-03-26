# Getting Started

Draw.io Skill is a desktop-first, offline-first workflow for producing professional draw.io diagrams from natural language, YAML, Mermaid, CSV, or imported `.drawio` files.

## What You Need

- One supported client: Claude, Gemini, or Codex
- [Node.js](https://nodejs.org/) for `npx` and the local CLI
- Optional: draw.io Desktop for PNG, PDF, JPG, or embedded SVG export
- Optional: next-ai MCP only when you want real-time browser refinement

## Install the Skill

Recommended:

```bash
npx skills add bahayonghang/drawio-skills
```

Then restart your client so it reloads the skill.

See [Installation](./installation.md) for client-specific paths and optional MCP configuration.

## Choose the Runtime Path

### Offline-first

Use this for normal create, edit, validate, and export work.

- Generate `.drawio`
- Keep `.spec.yaml` and `.arch.json` beside it
- Re-run the CLI after edits

### Desktop-enhanced

Use this when draw.io Desktop is installed and you need:

- PNG, PDF, or JPG export
- embedded `.drawio.svg`
- a quick local preview in the desktop app

### Optional live MCP

Use this only when you explicitly want in-session browser editing.

- Configure `@next-ai-drawio/mcp-server`
- open a session with `start_session`
- use `get_diagram` before `edit_diagram`

## Your First Diagram

### Route from natural language

```text
/drawio create a horizontal tech-blue login flow with 6 nodes
```

### Route from YAML

```yaml
meta:
  theme: tech-blue
  layout: horizontal

nodes:
  - id: start
    label: Start
    type: terminal
  - id: auth
    label: Auth Service
    type: service
  - id: db
    label: PostgreSQL
    type: database

edges:
  - from: start
    to: auth
    type: primary
  - from: auth
    to: db
    type: data
```

Render it:

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --validate --write-sidecars
```

## First Edit

If the skill created the diagram, edit the sidecar bundle:

1. Update `output.spec.yaml`
2. Re-render `output.drawio`
3. Keep `output.arch.json` in sync with `--write-sidecars`

If you only have a `.drawio` file, import it first:

```bash
node skills/drawio/scripts/cli.js existing.drawio --input-format drawio --export-spec --write-sidecars
```

## First Export

Generate a standalone SVG:

```bash
node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars
```

Use draw.io Desktop when you need raster or PDF export:

```bash
node skills/drawio/scripts/cli.js input.yaml output.pdf --validate --use-desktop
```

## Where to Go Next

- [Installation](./installation.md)
- [Workflows](./workflows.md)
- [Creating Diagrams](./creating-diagrams.md)
- [Replicating Diagrams](./scientific-workflows.md)
- [Editing Diagrams](./editing-diagrams.md)
- [Design System](./design-system.md)
- [Specification Format](./specification.md)
- [CLI Tool](./cli.md)
- [Export & Save](./export.md)

# Getting Started

Draw.io Skill is a YAML-first, offline-first workflow for producing professional draw.io diagrams from natural language, YAML, Mermaid, CSV, or imported `.drawio` files.

## Pick a Skill Variant

- Use `skills/drawio` for general diagrams, network topology, UML/ER/sequence/state diagrams, Mermaid/CSV conversion, import/export, style presets, and optional live refinement.
- Use `skills/drawio-academic-skills` for paper, thesis, IEEE, journal, manuscript, A4/Word/LaTeX, and publication-ready figure requests.

The academic overlay requires sibling `../drawio`. It does not copy base CLI, schemas, themes, examples, or workflow references.

## What You Need

- One supported client: Claude, Gemini, or Codex
- [Node.js](https://nodejs.org/) for `npx` and the local CLI
- Optional: draw.io Desktop for PNG, PDF, JPG, or embedded SVG export
- Optional: next-ai MCP only when you want base-skill real-time browser refinement

## Install the Skills

Recommended:

```bash
npx skills add bahayonghang/drawio-skills
```

Then restart your client so it reloads the skills.

Manual academic installs must copy both `drawio` and `drawio-academic-skills` side by side.

## Choose the Runtime Path

### Offline Authoring Path

Use this for normal create, edit, validate, replicate, import, and export work.

- Generate `.drawio`
- Keep `.spec.yaml` and `.arch.json` beside it
- Re-run the CLI after edits

### Desktop-Enhanced Export

Use this when draw.io Desktop is installed and you need:

- PNG, PDF, or JPG export
- embedded `.drawio.svg`
- a quick local preview in the desktop app

### Live Refinement Backend

Use this only for base-skill browser refinement when explicitly requested.

Academic overlay does not use MCP/live backend.

## Your First Base Diagram

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

## Your First Academic Figure

```text
/drawio-academic-skills create a publication-ready system architecture figure for an IEEE paper. Use grayscale-safe styling and deliver .drawio + .spec.yaml + .arch.json + .svg.
```

The overlay should preflight venue, figure type (`architecture`, `roadmap`, or `workflow`), color policy, caption/legend, formula fidelity, and export expectations, then execute through sibling `../drawio/scripts/cli.js`.

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

If Desktop is unavailable, use the editable bundle plus SVG and optionally generate a diagrams.net URL:

```bash
node skills/drawio/scripts/runtime/diagrams-net-url.js output.drawio
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

# Getting Started

Draw.io Skill converts natural language, YAML, Mermaid, CSV, or imported `.drawio` files into a canonical YAML model and native editable Draw.io output.

## 1. Pick A Skill

- Use `drawio` for general, engineering, architecture, network, Agent, UML/ER, flowchart, import, and conversion tasks.
- Use `drawio-academic-skills` for any paper, thesis, journal, IEEE/ACM, manuscript, camera-ready, Word, or LaTeX figure.

The Academic Overlay requires sibling `../drawio` and uses its CLI. It does not copy the runtime or use MCP.

## 2. Install

```bash
npx skills add bahayonghang/drawio-skills
```

Restart the client after installation. Manual installs must keep `drawio` and `drawio-academic-skills` in the same skills directory.

Requirements:

- Node.js 20 or newer for the YAML/CLI workflow
- optional draw.io Desktop for the default 300 DPI PNG and requested PDF/JPG/embedded SVG
- optional live MCP provider only for explicitly requested base-skill browser refinement

## 3. Create A First Diagram

```text
/drawio create a horizontal login flow with a user, gateway, auth service, and database
```

Or save a YAML spec:

```yaml
meta:
  theme: tech-blue
  layout: horizontal

nodes:
  - id: user
    label: User
    type: user
  - id: auth
    label: Auth Service
    type: service
  - id: db
    label: PostgreSQL
    type: database

edges:
  - from: user
    to: auth
    type: primary
  - from: auth
    to: db
    type: data
```

```bash
node skills/drawio/scripts/cli.js input.yaml final/login.drawio --validate --write-sidecars --sidecar-dir .drawio-tmp/login
```

## 4. Search Exact Stencils

Search before writing cloud, Kubernetes, Cisco, or raw `mxgraph.*` names:

```bash
node skills/drawio/scripts/cli.js search lambda --prefix aws4
node skills/drawio/scripts/cli.js search pod --prefix kubernetes
```

Unknown names in covered libraries fail with suggestions. Fix the YAML rather than guessing a replacement.

## 5. Deliver Final Artifacts

The default final set is editable `.drawio` plus a 300 DPI PNG from draw.io Desktop. Keep sidecars in the work directory.

```bash
node skills/drawio/scripts/cli.js input.yaml final/login.png --validate --use-desktop
```

When Desktop is unavailable, image export falls back to standalone SVG and reports the fallback. Generate SVG, PDF, JPG, or embedded `.drawio.svg` explicitly when the user or venue requests them.

## 6. Create A Publication Figure

```text
/drawio-academic-skills create a grayscale-safe IEEE architecture figure, confirm the diagram plan, and export a submission PDF
```

The overlay preflights venue, figure type, color, print target, caption/legend, formula fidelity, node budget, and export expectations before using the sibling base CLI.

## 7. Edit Or Import

Edit the canonical `.spec.yaml` when it exists, then rerender. If only a `.drawio` file exists, import it first:

```bash
node skills/drawio/scripts/cli.js existing.drawio --input-format drawio --export-spec --write-sidecars --sidecar-dir .drawio-tmp/existing
```

You can also import declared config (Terraform, Kubernetes, Compose, SQL, OpenAPI, CI) or source code (Python, JS/TS, Go, Rust) directly into a canonical diagram, compare a saved live snapshot for drift, or project/transform a diagram offline with postprocess. See [Config](./config-importers.md) / [Code](./code-importers.md) importers, [Live Drift](./live-drift.md), and [Postprocess](./postprocess.md).

## Next Steps

- [Workflows](./workflows.md)
- [Config and IaC Importers](./config-importers.md) and [Code Relationship Importers](./code-importers.md)
- [Icons and Stencil Search](./icons-stencils.md)
- [Design System](./design-system.md)
- [Academic Overlay](./academic-overlay.md)
- [CLI Reference](./cli.md)
- [Export and Artifacts](./export.md)

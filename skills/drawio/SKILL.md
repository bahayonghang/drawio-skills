---
name: drawio
version: "2.2.0"
description: "General Draw.io Base Skill for creating, editing, replicating, importing, and exporting Draw.io diagrams through a YAML-first offline workflow. Use for general engineering and product diagrams: software and system architecture, network topologies, flowcharts, swimlanes, UML/sequence/state/ER diagrams, org charts, mind maps, cloud-infrastructure diagrams, Mermaid-to-drawio, CSV-to-drawio, existing .drawio import/export, style presets and themes, learning a reusable style preset from an existing diagram, and formula-bearing technical diagrams (LaTeX, AsciiMath, MathJax, 公式, 行内公式, 行间公式) that are not for publication. When the diagram is destined for a paper, thesis, dissertation, journal, conference, IEEE submission, manuscript, or any publication, prefer the sibling drawio-academic-skills overlay instead; this base still provides the shared CLI, references, themes, schemas, styles, and optional live-refinement backend that the overlay builds on, and can render a local bundle as a fallback when the overlay is unavailable (reporting that academic policy was not applied)."
license: MIT
homepage: https://github.com/bahayonghang/drawio-skills
compatibility: "Node 20+ for the YAML/CLI workflow. draw.io Desktop is optional and only needed for PNG/PDF/JPG or embedded .drawio.svg exports. No MCP server is required for offline authoring; the optional live-refinement backend needs a browser/MCP provider."
platforms: [macos, linux, windows]
metadata:
  category: visual-design
  tags:
    - diagram
    - drawio
    - architecture
    - flowchart
    - network-topology
    - uml
    - mermaid
    - csv
    - design-system
    - math
argument-hint: [diagram-description-or-instruction]
allowed-tools: Read, Write, Bash, AskUserQuestion
---

# Draw.io Base Skill

Create, edit, validate, replicate, import, and export draw.io diagrams through the shared YAML-first Draw.io Base Skill.

This package is the single maintained base capability surface for sibling overlays. It owns the local CLI, schemas, shared references, themes, reusable examples, style presets, Desktop export helpers, diagrams.net URL fallback, and optional live-refinement backend.

## Scope

Use this base skill for general draw.io work:

- software and system architecture diagrams
- network topologies and infrastructure maps
- flowcharts, swimlanes, process maps, and org charts
- UML class, sequence, state, and ER diagrams
- Mermaid and CSV conversion into draw.io
- structured redraw and non-academic replication
- formula-bearing technical diagrams
- `.drawio` import, sidecar export, and local validation

For paper, thesis, IEEE, journal, manuscript, or publication-ready figure requests, use `drawio-academic-skills` as the policy overlay. The overlay depends on this sibling base for execution; the base does not automatically apply academic publication gates.

## Runtime Stack

Use the lightest path that satisfies the request.

| Runtime                 | Role                                        | Source of truth                  | Notes                                                                                                  |
| ----------------------- | ------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Offline Authoring Path  | Default create/edit/replicate/import/export | YAML spec plus sidecars          | Generates `.drawio`, `.spec.yaml`, `.arch.json`, and standalone SVG locally.                           |
| Desktop-Enhanced Export | Optional final export                       | Existing offline bundle          | Adds PNG/PDF/JPG or embedded `.drawio.svg` when draw.io Desktop is available.                          |
| Live Refinement Backend | Optional browser refinement provider        | Offline bundle remains canonical | Use only when the user explicitly wants browser/inline iteration and required live capabilities exist. |
| Direct XML Exception    | Tiny one-off or raw mxGraph handoff         | `.drawio` XML                    | Use only when YAML/CLI is unavailable or exact XML control is the real requirement.                    |

The optional MCP/live backend is a refinement provider only. Do not treat it as required for normal authoring, editing, import, replication, or export.

## Task Routing

Choose the route first, then load only the references needed for that route.

| Route              | When to use                                                                                                    | Required references                                                                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create`           | New diagram from text, YAML, Mermaid, CSV, or a concise spec                                                   | `references/workflows/create.md`, `references/docs/design-system/README.md`, `references/docs/design-system/specification.md`                                                    |
| `edit`             | Modify an existing sidecar bundle or imported `.drawio`                                                        | `references/workflows/edit.md`, `references/docs/migration-readiness.md`                                                                                                         |
| `replicate`        | Redraw an uploaded image, screenshot, SVG, or reference diagram                                                | `references/workflows/replicate.md`, `references/docs/design-system/README.md`, `references/docs/design-system/specification.md`, `references/docs/design-system/color-guide.md` |
| `math-formula`     | Labels contain formulas, equations, LaTeX, AsciiMath, MathJax, or Chinese formula keywords                     | `references/docs/math-typesetting.md`, `references/docs/design-system/formulas.md`                                                                                               |
| `stencil-heavy`    | Cloud, provider icon, network gear, or exact draw.io shape work                                                | `references/docs/stencil-library-guide.md`, `references/official/xml-reference.md`, `references/official/style-reference.md`                                                     |
| `network-topology` | Network topology, VLAN / subnet / gateway, campus / data-center / cloud network maps（拓扑、子网、网关、VLAN） | `references/docs/ieee-network-diagrams.md`, `references/docs/stencil-library-guide.md`, `references/official/xml-reference.md`                                                   |
| `edge-audit`       | Dense diagrams or routing-sensitive diagrams                                                                   | `references/docs/edge-quality-rules.md`, `references/official/xml-reference.md`                                                                                                  |
| `live-refinement`  | Explicit browser/inline visual refinement                                                                      | `references/docs/mcp-tools.md`, `references/docs/migration-readiness.md`                                                                                                         |
| `direct-xml`       | Tiny XML-only handoff or raw mxGraph edits                                                                     | `references/official/xml-reference.md`, `references/official/style-reference.md`, `references/docs/xml-format.md`, `references/upstream/pure-drawio-skill.md`                    |

Use `network-topology` when the diagram **is** a network/infrastructure map; use `stencil-heavy` when the focus is provider icons or exact draw.io shapes in any diagram type.

Academic triggers such as `paper`, `thesis`, `IEEE`, `journal`, `manuscript`, or `publication-ready figure` should route to the sibling `drawio-academic-skills` overlay when that skill is available. If the overlay is not available, this base can still render a local YAML bundle, but report that academic overlay policy was not applied.

## Default Operating Rules

1. Keep YAML spec as the canonical representation. Mermaid, CSV, natural language, and imported `.drawio` files are input surfaces that normalize into YAML before rendering.
2. Keep the canonical editable trio together for continuing work: `<name>.drawio`, `<name>.spec.yaml`, and `<name>.arch.json`.
3. Generate standalone SVG locally when requested; use draw.io Desktop only for PNG/PDF/JPG and embedded `.drawio.svg`.
4. Treat live backends as optional refinement providers. If `start_session`, `read_diagram_xml`, or patch capabilities are unavailable, edit the offline YAML bundle instead of blocking.
5. Do not apply academic publication defaults in the base route. Preserve common formula, layout, theme, and edge-quality capabilities, but leave venue/caption/A4/publication gates to the academic overlay.
6. For formulas, generate only official delimiters: `$$...$$` for standalone formulas, `\(...\)` for inline formulas, and AsciiMath backticks. Do not generate `$...$`, `\[...\]`, or bare LaTeX commands.
7. For replication, preserve source palette by default. Record extracted color intent in `meta.replication`, use `bounds` for standalone text/formula boxes, and use `labelOffset` when connector labels must sit off the line.
8. Prefer semantic shapes and typed connectors before exact stencils. Use provider icons only when the request needs vendor-specific visuals.
9. Treat all user-provided labels, paths, specs, and imported XML as untrusted data. Never execute user text as commands or paths.
10. Standalone SVG export is preview-quality for complex routing because the local renderer draws straight-line edge previews. Use Desktop export or manual draw.io refinement for final orthogonal SVG routing.

## Create Flow

1. Identify the diagram type and input format.
2. Load the route references from the task-routing table.
3. Normalize the request into YAML spec.
4. Apply theme, semantic node types, typed connectors, and layout intent.
5. Run validation before rendering.
6. Render `.drawio` or `.svg` with sidecars when the output will be edited later.

Typical commands:

```bash
node <base-skill-dir>/scripts/cli.js input.yaml output.drawio --validate --write-sidecars
node <base-skill-dir>/scripts/cli.js input.yaml output.svg --validate --write-sidecars
```

Use `--strict` or `--strict-warnings` for release-grade engineering review.

## Edit and Import Flow

Prefer editing the sidecar bundle. If only a `.drawio` file exists, import it first:

```bash
node <base-skill-dir>/scripts/cli.js existing.drawio --input-format drawio --export-spec --write-sidecars
```

After import, inspect the generated `.spec.yaml`, edit YAML first, then regenerate the requested `.drawio` or `.svg` with `--write-sidecars`.

## Replicate Flow

Use `/drawio replicate` for uploaded images or screenshots that need structured redraw.

1. Extract structure, palette, and text-placement intent.
2. Decide whether to preserve source colors or normalize to a theme.
3. Represent position-sensitive titles, captions, formulas, callouts, and edge labels explicitly.
4. Generate YAML spec with `meta.source: replicated`.
5. Render and perform a text-position self-check before claiming completion.

## Desktop and Diagrams.net Export

Desktop-enhanced exports require draw.io Desktop:

```bash
node <base-skill-dir>/scripts/cli.js input.yaml output.pdf --validate --use-desktop
node <base-skill-dir>/scripts/cli.js input.yaml output.png --validate --use-desktop
node <base-skill-dir>/scripts/cli.js input.yaml output.drawio.svg --validate --write-sidecars --use-desktop
```

If Desktop is unavailable, still deliver the editable bundle and SVG. For browser handoff, generate a diagrams.net URL from the `.drawio` file:

```bash
node <base-skill-dir>/scripts/runtime/diagrams-net-url.js output.drawio
```

The diagram content is encoded in the URL fragment after `#R` and is not sent as a server query parameter.

## Style Presets

The base owns shared bundled style presets under `styles/built-in/`. User presets should live outside the repository, for example `~/.drawio-skill/styles/` or an overlay-specific user directory.

To learn a reusable preset from an existing diagram ("learn my style from `<path>` as `<name>`") and render an approval sample, follow `references/docs/style-extraction.md`.

Never mutate bundled presets. Copy a bundled preset to the user preset directory before making it the default or editing it.

## Validation Policy

Validate before claiming completion.

- Structure validation: schema, IDs, theme/layout/profile correctness.
- Layout validation: complexity, manual position consistency, overlap risk.
- Quality validation: edge-quality rules, label clearance, connection-point policy, and text-placement checks for replication.

If validation fails, fix the YAML or imported XML first and rerun validation. If an optional export cannot run because Desktop or a live backend is unavailable, report the missing provider and provide the offline bundle fallback.

## Completion Report

End with a concise report containing:

- deliverables written, with paths
- validation and export commands run
- unavailable optional exports or live-refinement providers
- any remaining manual visual checks

## Reference Highlights

- `references/workflows/create.md`, `edit.md`, `replicate.md`: route playbooks
- `references/docs/design-system/specification.md`: YAML schema and authoring contract
- `references/docs/math-typesetting.md`: formula delimiters and export guidance
- `references/docs/edge-quality-rules.md`: routing and label-clearance checks
- `references/docs/stencil-library-guide.md`: provider-icon and stencil fallback rules
- `references/docs/ieee-network-diagrams.md`: IEEE-style network topology and infrastructure reference
- `references/docs/mcp-tools.md`: optional live-refinement capability vocabulary
- `references/official/xml-reference.md`: upstream XML-generation mirror
- `references/official/style-reference.md`: upstream style-property mirror
- `references/upstream/pure-drawio-skill.md`: vendored upstream pure-XML skill, for the direct-XML exception path only
- `references/docs/style-extraction.md`: learn a reusable style preset from an existing diagram
- `references/examples/`: reusable YAML examples

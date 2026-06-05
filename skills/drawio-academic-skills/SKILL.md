---
name: drawio-academic-skills
version: "0.1.0"
description: "Publication-figure overlay for draw.io. Use instead of the general drawio skill whenever a diagram is for a paper, thesis, dissertation, journal, conference, IEEE/ACM submission, manuscript, camera-ready, Word/LaTeX figure, or other publication. Applies venue, figure-type, color, caption/legend, formula, and paper-readability gates for architecture, workflow, roadmap, network-topology, and replicated paper figures. Runs offline and YAML-first through the sibling ../drawio base for CLI, references, themes, schemas, styles, and Desktop export; never requires MCP or a live backend."
license: MIT
homepage: https://github.com/bahayonghang/drawio-skills
compatibility: "Requires sibling ../drawio in the same skills directory. Node 20+ is required for the shared YAML/CLI workflow. draw.io Desktop is optional and only needed for PNG/PDF/JPG or embedded .drawio.svg exports. No MCP server is required."
platforms: [macos, linux, windows]
metadata:
  category: visual-design
  tags:
    - drawio
    - academic
    - paper-figure
    - ieee
    - thesis
    - manuscript
    - workflow
    - math
    - svg
argument-hint: [figure-description-or-instruction]
allowed-tools: Read, Write, Bash, AskUserQuestion
---

# Draw.io Academic Overlay

Create, edit, replicate, validate, and export publication-ready draw.io figures by applying academic policy on top of the sibling Draw.io Base Skill.

This overlay is intentionally thin. It does not copy base scripts, themes, schemas, official references, or workflow docs. It calls the sibling base package at `../drawio` for all shared capabilities.

## Required Sibling Base

Resolve shared resources relative to this overlay directory:

| Capability                | Use this sibling base path                                        |
| ------------------------- | ----------------------------------------------------------------- |
| CLI                       | `../drawio/scripts/cli.js`                                        |
| diagrams.net URL fallback | `../drawio/scripts/runtime/diagrams-net-url.js`                   |
| YAML schema               | `../drawio/assets/schemas/spec.schema.json`                       |
| Themes                    | `../drawio/assets/themes/`                                        |
| Shared examples           | `../drawio/references/examples/`                                  |
| Shared references         | `../drawio/references/docs/` and `../drawio/references/official/` |
| Workflow guides           | `../drawio/references/workflows/`                                 |
| Built-in style presets    | `../drawio/styles/built-in/`                                      |

If `../drawio/scripts/cli.js` is missing, stop and report that the sibling base skill must be installed next to this overlay. Do not silently recreate or vendor-copy base resources into the overlay.

## Non-Negotiable Contract

- Keep academic authoring YAML-first and offline-first.
- Never create, require, or route through `.mcp.json`, MCP, or a live backend.
- Treat `.drawio`, `.spec.yaml`, `.arch.json`, and `.svg` as the default academic delivery bundle.
- Use draw.io Desktop only as an optional export enhancer for PNG/PDF/JPG or embedded `.drawio.svg`.
- If a requested Desktop export cannot be produced locally, still deliver the editable bundle and SVG, then report the unavailable export clearly.
- Perform paper-readability and visual self-checks on exported SVG first, or on Desktop-exported PNG/PDF/JPG/embedded SVG when available. Do not substitute browser or Playwright screenshots when an exported artifact exists.
- Keep academic-specific policy in this overlay; keep shared execution in `../drawio`.

## Academic Preflight

Before generating or editing, determine and state:

1. Venue or audience: paper, thesis, IEEE, journal, manuscript, Word/A4, LaTeX, slides, or review draft.
2. Figure type: exactly one of `architecture`, `roadmap`, or `workflow`.
3. Color policy: strict monochrome, grayscale-safe with one accent, or color digital/PDF.
4. Caption, legend, and title needs.
5. Formula and text-fidelity needs: delimiters, font family, standalone text boxes, edge labels, and callouts.
6. Export expectations: default bundle plus any requested PNG/PDF/JPG; whether Desktop is required.

## Task Routing

Choose one route first, then load only the referenced files.

| Route                  | Trigger                                                            | Load                                                                                                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `academic-create`      | paper, thesis, IEEE, manuscript, journal, publication-ready figure | this overlay `references/docs/publication-overlay.md`; base `../drawio/references/docs/academic-figure-playbook.md`; base `../drawio/references/docs/academic-export-checklist.md`; base `../drawio/references/workflows/create.md`       |
| `math-formula`         | formula, equation, LaTeX, AsciiMath, MathJax, 公式                 | base `../drawio/references/docs/math-typesetting.md`; base `../drawio/references/docs/design-system/formulas.md`                                                                                                                          |
| `edit`                 | modify an existing academic bundle or imported `.drawio`           | base `../drawio/references/workflows/edit.md`; base `../drawio/references/docs/migration-readiness.md`                                                                                                                                    |
| `replicate`            | redraw screenshot, image, SVG, or reference paper figure           | this overlay `references/docs/publication-overlay.md`; base `../drawio/references/workflows/replicate.md`; base `../drawio/references/docs/design-system/specification.md`; base `../drawio/references/docs/design-system/color-guide.md` |
| `stencil-heavy`        | academic cloud, network, AWS, Azure, GCP, Cisco, Kubernetes figure | base `../drawio/references/docs/stencil-library-guide.md`; base `../drawio/references/docs/ieee-network-diagrams.md`; base `../drawio/references/official/xml-reference.md`                                                               |
| `style-preset`         | learn/use/list/delete/rename visual style presets                  | base `../drawio/references/docs/style-extraction.md`; base `../drawio/references/docs/style-presets.md`; base `../drawio/styles/built-in/`                                                                                                |
| `direct-xml-exception` | tiny handoff-only XML or exact mxGraph control                     | base `../drawio/references/upstream/pure-drawio-skill.md`; base `../drawio/references/official/xml-reference.md`                                                                                                                          |

## Academic Defaults

For academic-paper requests, set these before rendering:

```yaml
meta:
  profile: academic-paper
  figureType: architecture # architecture | roadmap | workflow
  theme: academic # or academic-color when color is acceptable
  title: Caption-ready title
  description: One sentence explaining the figure intent
  legend: Required when symbols, colors, line styles, or icons need explanation
```

Default deliverables:

- `<name>.drawio`
- `<name>.spec.yaml`
- `<name>.arch.json`
- `<name>.svg`

Add `<name>.png`, `<name>.pdf`, or `<name>.jpg` only when requested or needed for Word/A4/thesis/raster workflows, and only when draw.io Desktop export is available.

## Create Flow

1. Classify the figure as `architecture`, `roadmap`, or `workflow`.
2. Draft or normalize the YAML spec as the canonical source.
3. Use concise labels; shorten labels before shrinking fonts.
4. Validate through the sibling base CLI.
5. Render the editable bundle and standalone SVG.
6. Run a paper-readability self-check before reporting completion.

Commands:

```bash
node ../drawio/scripts/cli.js input.yaml figure.drawio --validate --write-sidecars --strict-warnings
node ../drawio/scripts/cli.js input.yaml figure.svg --validate --write-sidecars --strict-warnings
```

Use paths relative to the overlay directory, or use absolute paths when running from another working directory.

## Edit and Replicate Flow

- If a `.spec.yaml` sidecar exists, edit the YAML spec first.
- If only `.drawio` exists, import it through the sibling base CLI:

  ```bash
  node ../drawio/scripts/cli.js existing.drawio --input-format drawio --export-spec --write-sidecars
  ```

- For image/SVG replication, preserve text boxes, captions, legends, formulas, edge labels, baseline/offset, font family/size/italic state, alignment, and spacing when visible.
- Use explicit `bounds` for standalone text/formula blocks and `labelOffset` for connector labels that must sit off the line.
- Keep all regenerated files on the same basename so the academic bundle remains round-trippable.

## Export Policy

Use the sibling base CLI for deterministic exports.

```bash
# Offline SVG and sidecars
node ../drawio/scripts/cli.js input.yaml figure.svg --validate --write-sidecars --strict-warnings

# Editable .drawio bundle
node ../drawio/scripts/cli.js input.yaml figure.drawio --validate --write-sidecars --strict-warnings

# Desktop-enhanced exports
node ../drawio/scripts/cli.js input.yaml figure.drawio.svg --validate --write-sidecars --use-desktop
node ../drawio/scripts/cli.js input.yaml figure.png --validate --use-desktop
node ../drawio/scripts/cli.js input.yaml figure.pdf --validate --use-desktop
```

If Desktop is unavailable, generate a diagrams.net URL from the `.drawio` artifact:

```bash
node ../drawio/scripts/runtime/diagrams-net-url.js figure.drawio
```

Do not claim PNG/PDF/JPG files exist when Desktop export was unavailable. Report the missing export and provide the editable bundle, SVG, and fallback command or URL.

## Style Presets

Use overlay-specific user presets first, then sibling base bundled presets:

1. User presets: `~/.drawio-academic-skills/styles/`
2. Bundled presets: `../drawio/styles/built-in/`

Never mutate bundled base presets. Copy a bundled preset into the user preset directory before making it a default or editing it.

## Quality Gate

Do not claim completion until:

- `.drawio`, `.spec.yaml`, `.arch.json`, and `.svg` are aligned
- `meta.profile` is `academic-paper`
- `meta.figureType` is one of `architecture`, `roadmap`, or `workflow`
- labels are readable at paper/A4 scale
- formulas use official delimiters: `$$...$$`, `\(...\)`, or AsciiMath backticks
- captions, legends, callouts, formulas, and edge labels are not clipped or placed on connector lines
- colors are not the only carrier of meaning
- any visual self-check used the exported SVG or Desktop-exported final artifact before any live/browser preview
- requested Desktop exports were attempted or clearly reported as unavailable
- no MCP config, MCP server, or live backend is required for the result

## Completion Report

End with a concise report:

- deliverables written, with paths
- sibling base CLI commands run for validation/export
- unavailable Desktop exports and fallback provided
- remaining visual or venue-specific manual checks, if any

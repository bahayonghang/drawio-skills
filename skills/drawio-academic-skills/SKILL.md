---
name: drawio-academic-skills
version: "2.5.0"
description: "Publication-figure overlay for draw.io. Use instead of drawio whenever the diagram is for a paper, thesis, dissertation, journal, conference, IEEE/ACM submission, manuscript, camera-ready, Word/LaTeX figure, or other publication. Applies venue, figure-type, color, caption/legend, formula, and paper-readability gates for architecture, workflow, roadmap, network-topology, and replicated paper figures."
license: MIT
homepage: https://github.com/bahayonghang/drawio-skills
compatibility: "Requires sibling ../drawio in the same skills directory. Node 20+ is required for the shared YAML/CLI workflow. draw.io Desktop produces the default 300dpi PNG (plus PDF/JPG or embedded .drawio.svg); without it, image exports fall back to a standalone SVG. No MCP server is required."
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

This overlay is intentionally thin. It owns academic policy, academic docs, and paper examples; it does not copy base scripts, themes, schemas, official references, or workflow docs. It calls the sibling base package at `../drawio` for all shared execution.

## Boundary

- **Base (`../drawio`)**: shared execution primitives — CLI, schema, renderer, themes (including `academic` / `academic-color`), general references, general examples, style presets, Desktop export.
- **This overlay**: academic policy/gates, the publication overlay doc, the academic figure playbook + checklist, and paper/pipeline examples.

Themes are a base rendering primitive and stay in the base; academic policy, docs, and examples stay here.

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

Overlay-local academic assets: `references/docs/publication-overlay.md`, `references/docs/academic-figure-playbook.md`, `references/docs/academic-export-checklist.md`, and `references/examples/`.

If `../drawio/scripts/cli.js` is missing, stop and report that the sibling base skill must be installed next to this overlay. Do not silently recreate or vendor-copy base resources into the overlay.

## Non-Negotiable Contract

- Keep academic authoring YAML-first and offline-first.
- Never create, require, or route through `.mcp.json`, MCP, or a live backend.
- Treat `.drawio` and a 300dpi `.png` (via draw.io Desktop) as the default academic final deliverables; SVG is the offline fallback when Desktop is unavailable.
- Keep `.spec.yaml`, `.arch.json`, raw YAML, and diagnostics in a project-local work directory such as `.drawio-tmp/<name>/`, unless the user explicitly asks for a reproducible sidecar bundle beside the final output.
- draw.io Desktop is required for the default 300dpi PNG; use it also for PDF/JPG or embedded `.drawio.svg` on request.
- If draw.io Desktop is unavailable, the PNG export falls back to a standalone `.svg` (with a warning); still deliver the editable `.drawio` and report the fallback clearly.
- Perform paper-readability and visual self-checks on the exported PNG (or the fallback SVG) first, or on another Desktop-exported artifact when that is the requested format. Do not substitute browser or Playwright screenshots when an exported artifact exists.
- Treat external image-generation previews as optional concept previews only. They never replace YAML, `.drawio`, SVG, sidecars, or exported-artifact verification.
- Keep academic-specific policy in this overlay; keep shared execution in `../drawio`.
- Do not create or modify scratch JS scripts under a user's project-local `.agents/skills/drawio`; port durable fixes to the sibling base skill source instead.

## Academic Preflight

Before generating or editing, determine and state: venue/audience; figure type (`architecture`, `roadmap`, or `workflow`); color policy; caption/legend/title needs; formula and text-fidelity needs; export expectations.

Also estimate the **node budget**. The single authoritative budget guidance (targets, warning thresholds, node-efficient patterns, split strategies) lives in `references/docs/academic-figure-playbook.md § Node Budget Management`. If the estimate exceeds the playbook's recommended target, confirm a split/simplify strategy with the user before generating, and use compact patterns from `references/templates/`.

Full decision detail: `references/docs/publication-overlay.md § Required Academic Decisions`.

## Source Understanding

Extract only what the figure needs from papers, reference images, or text-only prompts, and keep uncertainties explicit. See `references/docs/publication-overlay.md § Source Understanding` (source-type table) and `references/docs/academic-figure-playbook.md § Scientific Figure Patterns`.

## Diagram Plan Gate

For complex paper-derived figures or academic image-replication work, present a concise diagram plan and wait for confirmation before rendering. Simple, clear academic diagrams may skip the gate and proceed to YAML/SVG. Plan template and field list: `references/docs/publication-overlay.md § Diagram Plan Gate`.

## Optional Image Preview

Use an external image-generation tool only as an optional concept preview, only after the diagram plan is confirmed, and only with privacy approval before sending unpublished or sensitive content. Treat generated text as approximate and correct final labels/formulas/geometry in YAML. Full rules: `references/docs/publication-overlay.md § Optional Image Preview`.

## Task Routing

Choose one route first, then load only the referenced files.

| Route                  | Trigger                                                            | Load                                                                                                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `academic-create`      | paper, thesis, IEEE, manuscript, journal, publication-ready figure | this overlay `references/docs/publication-overlay.md`; this overlay `references/docs/academic-figure-playbook.md`; this overlay `references/docs/academic-export-checklist.md`; base `../drawio/references/workflows/create.md`           |
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
  print: { target: cn-thesis } # optional gate: cn-thesis | ieee-single | ieee-double
```

This section defines the default academic final deliverables.

Default deliverables:

- `<name>.drawio`
- `<name>.png` (300dpi, via draw.io Desktop; falls back to `<name>.svg` when Desktop is unavailable)

Intermediate work directory:

- `<name>.spec.yaml`
- `<name>.arch.json`
- raw or normalized YAML and diagnostics

The default `<name>.png` is 300dpi. **For journal / IEEE vector submission, explicitly export `<name>.pdf` (or `.svg`)** -- those venues require vector (PS/EPS/PDF), not a raster PNG. Add other formats only when requested.

## Create Flow

1. Classify the figure as `architecture`, `roadmap`, or `workflow`.
2. For complex paper-derived requests, extract the research evidence chain and confirm the diagram plan before rendering.
3. When the optional image-preview trigger applies, generate a concept preview after confirmation, then revise the plan if needed.
4. Draft or normalize the YAML spec as the canonical source; use concise labels (shorten labels before shrinking fonts).
5. Validate through the sibling base CLI, then render the editable `.drawio` and standalone SVG with sidecars in the work directory.
6. Run an exported-artifact self-check before reporting completion.

```bash
node ../drawio/scripts/cli.js input.yaml figure.drawio --validate --write-sidecars --sidecar-dir .drawio-tmp/figure --strict-warnings
node ../drawio/scripts/cli.js input.yaml figure.svg --validate --write-sidecars --sidecar-dir .drawio-tmp/figure --strict-warnings
```

Use paths relative to the overlay directory, or absolute paths when running from another working directory. Detailed figure-type patterns: `references/docs/academic-figure-playbook.md`.

## Edit and Replicate Flow

- If a `.spec.yaml` sidecar exists, edit the YAML spec first. If only `.drawio` exists, import it through the base CLI (`--input-format drawio --export-spec`).
- For image/SVG replication, preserve text boxes, captions, legends, formulas, edge labels, baseline/offset, font family/size/italic state, alignment, and spacing when visible. Use explicit `bounds` for standalone text/formula blocks and `labelOffset` for connector labels off the line.
- Keep all regenerated files on the same basename so final artifacts and work-dir sidecars stay round-trippable.

## Export Policy

Use the sibling base CLI for deterministic exports.

```bash
# Default deliverable: editable .drawio + 300dpi PNG (--dpi defaults to 300)
node ../drawio/scripts/cli.js input.yaml figure.drawio --validate --write-sidecars --sidecar-dir .drawio-tmp/figure --strict-warnings
node ../drawio/scripts/cli.js input.yaml figure.png --validate --use-desktop

# Journal / IEEE vector submission -- export PDF (or SVG) explicitly:
node ../drawio/scripts/cli.js input.yaml figure.pdf --validate --use-desktop
node ../drawio/scripts/cli.js input.yaml figure.svg --validate --write-sidecars --sidecar-dir .drawio-tmp/figure
node ../drawio/scripts/cli.js input.yaml figure.drawio.svg --validate --write-sidecars --sidecar-dir .drawio-tmp/figure --use-desktop
```

If Desktop is unavailable, generate a diagrams.net URL from the `.drawio` artifact and report the missing export honestly:

```bash
node ../drawio/scripts/runtime/diagrams-net-url.js figure.drawio
```

When Desktop is unavailable the default PNG falls back to `.svg` (reported on stderr); do not claim PNG/PDF/JPG files exist when they were not produced.

## Style Presets

Use overlay-specific user presets first (`~/.drawio-academic-skills/styles/`), then sibling base bundled presets (`../drawio/styles/built-in/`). Never mutate bundled base presets; copy a bundled preset into the user preset directory before editing or making it a default.

## Quality Gate

Do not claim completion until:

- final `.drawio` and `.png` (or fallback `.svg`) are aligned with work-dir `.spec.yaml` and `.arch.json`
- `meta.profile` is `academic-paper` and `meta.figureType` is `architecture`, `roadmap`, or `workflow`
- node count satisfies the playbook budget (`references/docs/academic-figure-playbook.md § Node Budget Management`); split or simplify when it is exceeded
- labels are readable at paper/A4 scale; formulas use official delimiters (`$$...$$`, `\(...\)`, or AsciiMath backticks)
- label font classes stay uniform (module title / node / edge label follow the font ladder) and no label-fit overflow warnings remain
- mixed CJK/Latin labels resolve to the Times New Roman + SimSun stack (theme `cjk` stack or `meta.font`)
- captions, legends, callouts, formulas, and edge labels are not clipped or placed on connector lines
- legends use compact form (single multi-line text node, not many separate nodes)
- colors are not the only carrier of meaning
- visual self-check used the exported PNG (or fallback SVG) or Desktop-exported artifact before any live/browser preview, checking overlap, clipped text, connector-label clearance, arrows crossing text/nodes, missing modules, and mismatch from the confirmed plan/source
- if a visible defect was found, the YAML spec was corrected and rerendered once before final reporting
- requested Desktop exports were attempted or clearly reported as unavailable
- no MCP config, MCP server, or live backend is required for the result

## Completion Report

End with a concise report:

- deliverables written, with paths
- intermediate work directory, when sidecars or diagnostics were generated
- sibling base CLI commands run for validation/export
- unavailable Desktop exports and fallback provided
- remaining visual or venue-specific manual checks, if any

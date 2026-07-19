---
name: drawio-academic-skills
version: "2.7.0"
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

Create, edit, replicate, validate, and export publication-ready draw.io figures by applying academic policy on top of the sibling Draw.io Base Skill. This overlay is intentionally thin: it owns academic policy/gates, academic docs, and paper examples; the sibling base at `../drawio` owns all shared execution (CLI, schema, renderer, themes including `academic`/`academic-color`, references, examples, style presets, Desktop export).

## Required Sibling Base

Resolve shared resources relative to this overlay directory:

- CLI `../drawio/scripts/cli.js`; URL fallback `../drawio/scripts/runtime/diagrams-net-url.js`
- Schema `../drawio/assets/schemas/spec.schema.json`; themes `../drawio/assets/themes/`; palettes `../drawio/assets/palettes/`
- References `../drawio/references/docs/`, `../drawio/references/official/`, `../drawio/references/workflows/`, `../drawio/references/examples/`; shared rework contract `../drawio/references/workflows/visual-review.md`
- Built-in style presets `../drawio/styles/built-in/`

Overlay-local assets: `references/docs/publication-overlay.md`, `academic-figure-playbook.md`, `academic-export-checklist.md`, `references/examples/`, `references/templates/`.

If `../drawio/scripts/cli.js` is missing, stop and report that the sibling base skill must be installed next to this overlay; never silently recreate or vendor-copy base resources into the overlay.

## Non-Negotiable Contract

- Keep academic authoring YAML-first and offline-first. Never create, require, or route through `.mcp.json`, MCP, or a live backend.
- Treat `.drawio` and a 300dpi `.png` (via draw.io Desktop) as the default academic final deliverables; SVG is the offline fallback without Desktop — report the fallback and never claim files that were not produced.
- Keep `.spec.yaml`, `.arch.json`, raw YAML, and diagnostics in a project-local work directory such as `.drawio-tmp/<name>/`, unless the user explicitly asks for a reproducible sidecar bundle beside the final output.
- Perform paper-readability and visual self-checks on the exported PNG (or the fallback SVG) first. Do not substitute browser or Playwright screenshots when an exported artifact exists.
- Use the sibling base `../drawio/references/workflows/visual-review.md` for preview structure, issue records, YAML-first rework, and stopping rules; this overlay adds only publication checks.
- Treat external image-generation previews as optional concept previews only. They never replace YAML, artifacts, sidecars, or exported-artifact verification.
- Do not create or modify scratch JS scripts under a user's project-local `.agents/skills/drawio`; port durable fixes to the sibling base skill source instead.

## Academic Preflight

Before generating or editing, determine and state: venue/audience; figure type (`architecture`, `roadmap`, or `workflow`); color policy; caption/legend/title, formula, and text-fidelity needs; export expectations. Estimate the **node budget** (authoritative targets, thresholds, and split strategies: `references/docs/academic-figure-playbook.md § Node Budget Management`); over target, confirm a split/simplify strategy with the user and start from the compact patterns in `references/templates/`. Full decision detail: `references/docs/publication-overlay.md § Required Academic Decisions`.

### Palette Preflight

After the venue is known, if the user did not specify a palette, use `AskUserQuestion` as a single-select: venue recommendation first with `(Recommended)`, 3-4 choices, each palette's `displayName` as the label, and colorblind/grayscale safety plus venue rationale in each description. Venue map: `references/docs/academic-figure-playbook.md § Venue Palette Mapping`.

If the user already specified a palette or an unambiguous style, map it directly and do not ask. For academic replication, preserve the source palette and skip selection unless the user explicitly requests normalization. Record the chosen name in `meta.palette`. The completion report must name the palette and its colorblind/grayscale safety flags, including any print-gate downgrade.

## Source Understanding

Extract only what the figure needs from papers, reference images, or text-only prompts; keep uncertainties explicit. See `references/docs/publication-overlay.md § Source Understanding` and `references/docs/academic-figure-playbook.md § Scientific Figure Patterns`.

## Diagram Plan Gate

For complex paper-derived figures or academic image-replication work, present a concise diagram plan and wait for confirmation before rendering; simple academic diagrams may skip the gate. Template: `references/docs/publication-overlay.md § Diagram Plan Gate`.

## Optional Image Preview

Only after the diagram plan is confirmed, and only with privacy approval before sending unpublished or sensitive content; treat generated text as approximate and correct final labels/formulas/geometry in YAML. Full rules: `references/docs/publication-overlay.md § Optional Image Preview`.

## Task Routing

Choose one route, then load only its files. `overlay` = this directory; `base` = the sibling, resolved from this directory.

- `academic-create` — paper, thesis, IEEE, manuscript, journal, publication-ready figure → overlay `references/docs/publication-overlay.md`, `academic-figure-playbook.md`, `academic-export-checklist.md`; base `../drawio/references/workflows/create.md`
- `math-formula` — formula, equation, LaTeX, AsciiMath, MathJax, 公式 → base `../drawio/references/docs/math-typesetting.md`, `design-system/formulas.md`
- `edit` — modify an academic bundle or imported `.drawio` → base `../drawio/references/workflows/edit.md`, `../drawio/references/docs/migration-readiness.md`
- `replicate` — redraw screenshot, image, SVG, or reference paper figure → overlay `references/docs/publication-overlay.md`; base `../drawio/references/workflows/replicate.md`, `../drawio/references/docs/design-system/specification.md`, `color-guide.md`
- `base-capabilities` — code/config/live imports, raster extraction, multi-page bundles, AI/SysML/BPMN stencils, or offline postprocess before publication checks → base `../drawio/references/docs/upstream-capability-compatibility.md`; overlay `references/docs/publication-overlay.md`
- `stencil-heavy` — academic cloud, network, AWS, Azure, GCP, Cisco, Kubernetes figure → base `../drawio/references/docs/stencil-library-guide.md`, `ieee-network-diagrams.md`, `../drawio/references/official/xml-reference.md`
- `style-preset` — learn/use/list/delete/rename visual style presets → base `../drawio/references/docs/style-extraction.md`, `style-presets.md`, `../drawio/styles/built-in/`
- `direct-xml-exception` — tiny handoff-only XML or exact mxGraph control → base `../drawio/references/upstream/pure-drawio-skill.md`, `../drawio/references/official/xml-reference.md`

## Academic Defaults

For academic-paper requests, set these before rendering:

```yaml
meta:
  profile: academic-paper
  figureType: architecture # architecture | roadmap | workflow
  theme: academic # or academic-color when color is acceptable
  palette: okabe-ito # from venue preflight; ieee-bw for IEEE print
  title: Caption-ready title
  description: One sentence explaining the figure intent
  legend: Required when symbols, colors, line styles, or icons need explanation
  print: { target: cn-thesis } # optional gate: cn-thesis | ieee-single | ieee-double
```

Default deliverables:

- `<name>.drawio`
- `<name>.png` (300dpi, via draw.io Desktop; falls back to `<name>.svg` without Desktop)

Intermediate work directory:

- `<name>.spec.yaml`, `<name>.arch.json`, raw or normalized YAML, diagnostics

**For journal / IEEE vector submission, explicitly export `<name>.pdf` (or `.svg`)** — vector required, not raster PNG. Other formats only on request.

## Create Flow

1. Classify the figure as `architecture`, `roadmap`, or `workflow`; complex paper-derived requests confirm the diagram plan first (preview only after confirmation).
2. Draft or normalize the YAML spec as the canonical source; shorten labels before shrinking fonts.
3. Validate and render through the sibling base CLI, then self-check the exported artifact before reporting:

```bash
node ../drawio/scripts/cli.js input.yaml figure.drawio --validate --write-sidecars --sidecar-dir .drawio-tmp/figure --strict-warnings
node ../drawio/scripts/cli.js input.yaml figure.png --validate --use-desktop
```

Figure-type patterns: `references/docs/academic-figure-playbook.md`.

## Edit and Replicate Flow

- Edit the `.spec.yaml` sidecar first; if only `.drawio` exists, import via the base CLI (`--input-format drawio --export-spec`).
- For image/SVG replication, preserve text boxes, captions, legends, formulas, edge labels, baseline/offset, font family/size/italic state, alignment, and spacing when visible; use explicit `bounds` for standalone text/formula blocks and `labelOffset` for connector labels off the line.
- Keep regenerated files on the same basename for round-trippable artifacts and sidecars.

## Export Policy

Vector submission (journal/IEEE) exports PDF (or SVG) explicitly. Without Desktop, generate a diagrams.net URL and report the missing export honestly:

```bash
node ../drawio/scripts/cli.js input.yaml figure.pdf --validate --use-desktop
node ../drawio/scripts/runtime/diagrams-net-url.js figure.drawio
```

## Style Presets

Use overlay-specific user presets first (`~/.drawio-academic-skills/styles/`), then sibling base bundled presets (`../drawio/styles/built-in/`). Never mutate bundled base presets; copy into the user preset directory before editing or defaulting.

## Quality Gate

Do not claim completion until:

- final `.drawio` and `.png` (or fallback `.svg`) align with work-dir `.spec.yaml`/`.arch.json`; `meta.profile` is `academic-paper` and `meta.figureType` is `architecture`, `roadmap`, or `workflow`
- node count satisfies the playbook budget (`references/docs/academic-figure-playbook.md § Node Budget Management`); split or simplify when exceeded
- labels readable at paper/A4 scale; formulas use official delimiters (`$$...$$`, `\(...\)`, AsciiMath backticks); font classes follow the ladder with no label-fit overflow warnings
- mixed CJK/Latin labels resolve to the Times New Roman + SimSun stack (theme `cjk` stack or `meta.font`)
- captions, legends, callouts, formulas, and edge labels are not clipped or placed on connector lines; legends compact (single multi-line text node)
- colors are not the only carrier of meaning; `meta.palette` matches the venue decision; `PALETTE_PRINT_GATE` is clear — offer `ieee-bw`/`tol-high-contrast` when strict print safety fails
- the visual self-check followed sibling base `../drawio/references/workflows/visual-review.md` on the exported PNG (or fallback SVG) before any live/browser preview; academic checks additionally cover A4 readability, caption/legend, formulas, print meaning, and venue constraints
- requested Desktop exports were attempted or reported unavailable; no MCP config, server, or live backend required

## Completion Report

End with a concise report: deliverables with paths; intermediate work directory when sidecars were generated; sibling base CLI commands run; the selected palette, its colorblind/grayscale safety flags, and any print-gate downgrade; unavailable Desktop exports and the fallback provided; remaining venue-specific manual checks.

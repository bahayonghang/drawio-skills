---
name: drawio-academic-skills
version: "0.1.0"
description: "Academic-first Draw.io figure skill for papers, theses, IEEE-style diagrams, architecture figures, workflows, roadmaps, formulas, and publication-ready visualizations. Use when users ask to draw, redraw, replicate, edit, or export diagrams for academic papers or technical documents. Creates offline .drawio + .spec.yaml + .arch.json bundles, exports SVG locally, uses draw.io Desktop CLI for embedded SVG/PNG/PDF/JPG, supports style presets, self-check review loops, and diagrams.net URL fallback without requiring MCP."
license: MIT
homepage: https://github.com/bahayonghang/drawio-skills
compatibility: "Node 20+ for the YAML/CLI workflow. draw.io Desktop is optional but required for PNG/PDF/JPG and embedded .drawio.svg exports. No MCP server is required."
platforms: [macos, linux, windows]
metadata:
  category: visual-design
  tags:
    - drawio
    - academic
    - paper-figure
    - ieee
    - architecture
    - workflow
    - math
    - svg
argument-hint: [academic-figure-description-or-existing-diagram]
allowed-tools: Read, Write, Bash, AskUserQuestion
---

# Draw.io Academic Skill

Create, edit, replicate, validate, and export publication-ready draw.io figures.

This skill merges two workflows:

1. The upstream pure `drawio-skill` workflow: direct `.drawio` XML generation, Desktop export, self-check, style presets, diagrams.net URL fallback, and diagram-type presets.
2. This repository's `skills/drawio` workflow: YAML-first authoring, offline sidecars, academic quality gates, formula handling, and SVG conversion.

## Runtime Decision

Default to the offline academic path.

| Priority | Runtime | Use for |
| --- | --- | --- |
| 1 | YAML/CLI offline bundle | New academic figures, paper diagrams, repeatable edits |
| 2 | draw.io Desktop CLI | PNG/PDF/JPG, embedded `.drawio.svg`, final raster export |
| 3 | direct XML fallback | Tiny one-off diagrams, CLI unavailable, handoff-only XML |
| 4 | diagrams.net URL fallback | User cannot install Desktop but can open browser URL |

This skill intentionally ships without `.mcp.json`. Use Desktop CLI or the diagrams.net URL fallback for handoff and refinement.

## Task Routing

Choose one route first, then load only the referenced files.

| Route | Trigger | Load |
| --- | --- | --- |
| `academic-create` | paper, thesis, IEEE, manuscript, journal figure | `references/docs/academic-figure-playbook.md`, `references/docs/academic-export-checklist.md`, `references/workflows/create.md` |
| `math-formula` | formula, equation, LaTeX, AsciiMath, MathJax, 公式 | `references/docs/math-typesetting.md`, `references/docs/design-system/formulas.md` |
| `edit` | modify an existing `.drawio`, YAML bundle, or previous output | `references/workflows/edit.md`, `references/docs/migration-readiness.md` |
| `replicate` | redraw screenshot, image, SVG, or reference diagram | `references/workflows/replicate.md`, `references/docs/design-system/color-guide.md` |
| `stencil-heavy` | cloud, network, AWS, Azure, GCP, Cisco, Kubernetes | `references/docs/stencil-library-guide.md`, `references/official/xml-reference.md` |
| `style-preset` | learn/use/list/delete/rename visual style presets | `references/docs/style-presets.md`, `references/docs/upstream-pure-drawio-skill.md` |

## Academic Defaults

For academic-paper requests, set these before rendering:

- `meta.profile: academic-paper`
- `meta.figureType`: exactly one of `architecture`, `roadmap`, or `workflow`
- `meta.theme`: `academic` by default, or `academic-color` when color is useful
- `meta.title`: caption-ready figure title
- `meta.description`: one sentence explaining the figure intent

Default deliverables:

- `<name>.drawio`
- `<name>.spec.yaml`
- `<name>.arch.json`
- `<name>.svg`

Add `<name>.png` only when the user asks for PNG, Word, thesis/A4, raster-first, or screenshot matching, and draw.io Desktop export is available.

## Create Flow

1. Classify the figure as `architecture`, `roadmap`, or `workflow`.
2. Draft the YAML spec as the canonical source.
3. Use concise labels; shorten labels before shrinking fonts.
4. Validate before rendering:

   ```bash
   node <skill-dir>/scripts/cli.js input.yaml output.drawio --validate --write-sidecars
   node <skill-dir>/scripts/cli.js input.yaml output.svg --validate --write-sidecars
   ```

5. Use `--strict` or `--strict-warnings` for publication-grade checks.
6. Self-check the exported SVG/PNG when vision is available.
7. Apply targeted edits to YAML or XML, re-render, and repeat until approved.

## Edit and Replicate Flow

- If a `.spec.yaml` sidecar exists, edit the YAML spec first.
- If only `.drawio` exists, import it before editing:

  ```bash
  node <skill-dir>/scripts/cli.js existing.drawio --input-format drawio --export-spec --write-sidecars
  ```

- For image/SVG replication, extract palette intent first and preserve the source palette unless the user asks for paper-safe recoloring.
- For major structural changes, show an ASCII logic draft before rendering.
- Preserve `<name>.drawio`, `<name>.spec.yaml`, and `<name>.arch.json` together.

## Export Policy

Use the local CLI for deterministic exports.

```bash
# Offline SVG and sidecars
node <skill-dir>/scripts/cli.js input.yaml figure.svg --validate --write-sidecars

# Editable .drawio bundle
node <skill-dir>/scripts/cli.js input.yaml figure.drawio --validate --write-sidecars

# Desktop-enhanced exports
node <skill-dir>/scripts/cli.js input.yaml figure.drawio.svg --validate --write-sidecars --use-desktop
node <skill-dir>/scripts/cli.js input.yaml figure.png --validate --use-desktop
node <skill-dir>/scripts/cli.js input.yaml figure.pdf --validate --use-desktop
```

Desktop CLI supports PNG/SVG/PDF/JPG. PNG/SVG/PDF exports can embed the editable diagram XML.

If Desktop is unavailable, generate a diagrams.net URL:

```bash
node <skill-dir>/scripts/runtime/diagrams-net-url.js figure.drawio
```

The diagram XML is encoded after `#R` in the URL fragment. The fragment is client-side and is not sent to diagrams.net servers.

## Style Presets

Use user presets from `~/.drawio-academic-skills/styles/` first, then bundled presets from `styles/built-in/`.

Supported operations:

- learn a style from `.drawio`, `.xml`, `.svg`, `.png`, `.jpg`, or `.jpeg`
- preview a generated sample before saving
- list presets
- set one user preset as default
- rename or delete user presets

Never mutate bundled presets. Copy a bundled preset into `~/.drawio-academic-skills/styles/` before making it a default.

## Quality Gate

Do not claim completion until:

- `.drawio`, `.spec.yaml`, `.arch.json`, and `.svg` are aligned
- academic profile has a valid `figureType`
- labels are readable at paper/A4 scale
- formulas use official delimiters: `$$...$$`, `\(...\)`, or AsciiMath backticks
- connector routing is readable
- colors are not the only carrier of meaning
- requested PNG/PDF/JPG exports were attempted through draw.io Desktop or clearly reported as unavailable

## Reference Files

- `references/docs/upstream-pure-drawio-skill.md`: preserved upstream pure SKILL.md workflow
- `references/docs/academic-figure-playbook.md`: academic figure typing and delivery rules
- `references/docs/academic-export-checklist.md`: paper-ready checklist
- `references/docs/math-typesetting.md`: formula syntax and export guidance
- `references/official/xml-reference.md`: draw.io XML mirror
- `references/official/style-reference.md`: draw.io style mirror
- `references/examples/`: reusable YAML examples
- `styles/built-in/`: upstream pure-skill style presets
- `assets/themes/`: YAML/CLI design-system themes

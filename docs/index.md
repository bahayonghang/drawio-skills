---
layout: home

hero:
  name: "Draw.io Skill"
  text: "Base + Academic Overlay"
  tagline: YAML-first, offline-first draw.io authoring with a shared base skill, sibling academic overlay, Desktop-enhanced export, and optional base-only live refinement.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/bahayonghang/drawio-skills

features:
  - icon: 🧭
    title: Shared Base Skill
    details: "`skills/drawio` owns the CLI, schemas, references, themes, examples, style presets, Desktop helpers, diagrams.net URL fallback, and optional live refinement."

  - icon: 🎓
    title: Academic Overlay
    details: "`skills/drawio-academic-skills` is a thin sibling overlay for papers, theses, IEEE, manuscripts, A4/Word/LaTeX figures, and publication bundles."

  - icon: 📝
    title: YAML as Canonical Source
    details: "Normalize natural language, Mermaid, CSV, or imported `.drawio` files into one structured YAML spec before rendering."

  - icon: 🖥️
    title: Desktop-Enhanced Export
    details: "Use draw.io Desktop for PNG, PDF, JPG, and embedded `.drawio.svg` artifacts when available. Standalone SVG still works fully offline."

  - icon: 🚀
    title: 3 Core Routes
    details: "Create new diagrams, edit existing bundles, or replicate uploaded diagrams with route-specific references and validation rules."

  - icon: 🎨
    title: Shared Themes and Presets
    details: "Six built-in themes and bundled style presets live in the base skill so overlays do not drift."

  - icon: 🧮
    title: Academic and Math Guardrails
    details: "The overlay adds venue preflight, figure taxonomy, caption and legend checks, formula fidelity, and paper/A4 readability rules."

  - icon: ☁️
    title: Network and Stencil Workflows
    details: "Model campus LANs, AWS VPCs, DMZ layouts, UML, ER, sequence, state, and provider-specific icon workflows through the base references."

  - icon: 🔁
    title: Replication with Palette and Text Control
    details: "Replication preserves source colors by default and tracks text-box bounds plus label offsets for titles, captions, formulas, and edge labels."

  - icon: ✅
    title: Validation Before Claiming Done
    details: "Structure, layout, quality, formula, and text-position validators catch problems before export."

  - icon: 🔌
    title: Optional Base-Only Live Refinement
    details: "next-ai MCP remains supported for browser sessions in the base skill, but it is not the default runtime and is not used by the academic overlay."
---

## Skill Variants

- `skills/drawio`: Draw.io Base Skill for general diagrams, conversion, import/export, shared resources, Desktop export, diagrams.net fallback, and optional live refinement.
- `skills/drawio-academic-skills`: Academic Overlay for publication-facing figures. It requires sibling `../drawio` and does not copy base scripts, themes, schemas, or official references.

## Runtime Model

Use this order unless you explicitly need a browser session:

1. **Offline Authoring Path**: generate `.drawio` locally and keep sidecars in sync.
2. **Desktop-Enhanced Export**: add draw.io Desktop for PNG, PDF, JPG, or embedded SVG.
3. **Live Refinement Backend**: base-only browser refinement; the offline bundle remains canonical.
4. **Direct XML Exception**: tiny XML-only or exact mxGraph handoff.

Academic overlay uses the offline and Desktop-enhanced paths only.

## Quick Start

Install the skills:

```bash
npx skills add bahayonghang/drawio-skills
```

Create a first base diagram:

```text
/drawio create a horizontal tech-blue login flow with 6 nodes
```

Create an academic overlay figure:

```text
/drawio-academic-skills create an IEEE-style workflow figure for a manuscript and deliver .drawio + .spec.yaml + .arch.json + .svg
```

Validate and export from the repo:

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --validate --write-sidecars
node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars
```

Generate a diagrams.net URL fallback:

```bash
node skills/drawio/scripts/runtime/diagrams-net-url.js output.drawio
```

## What the Site Covers

- **Guide**: installation, routes, design system, YAML specification, CLI, and export workflow.
- **API**: optional base-only MCP tools, XML format notes, and the standalone SVG converter.
- **Examples**: prompt-first examples plus reusable YAML specs under `skills/drawio/references/examples/`.

## Source of Truth

This documentation tracks the current runtime model defined in:

- `skills/drawio/SKILL.md`
- `skills/drawio-academic-skills/SKILL.md`
- `skills/drawio/references/workflows/*.md`
- `skills/drawio/references/docs/**`

If a page disagrees with those files, treat the skill and references as authoritative.

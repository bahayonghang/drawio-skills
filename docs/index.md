---
layout: home

hero:
  name: "Draw.io Skill"
  text: "YAML-first diagrams with a publication overlay"
  tagline: Create, edit, replicate, import, validate, and export native draw.io diagrams through an offline-first base skill and a sibling academic policy layer.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Academic Figures
      link: /guide/academic-overlay

features:
  - title: Offline Base Skill
    details: "The base package owns YAML, CLI, schemas, themes, examples, search, rendering, validation, and optional Desktop export."
  - title: Academic Publication Overlay
    details: "A thin sibling layer adds venue, figure-type, print-readability, privacy, caption, legend, formula, and export gates."
  - title: Search Before Writing
    details: "An offline catalog resolves real AWS, Azure, GCP, Kubernetes, Cisco, and network stencil names before they enter YAML."
  - title: Native Editable Output
    details: "Final diagrams use native draw.io nodes, modules, text, and bound connectors instead of a pasted full-page reference image."
  - title: Task-Specific Design Language
    details: "Architecture, Agent and memory, network, UML/ER, flowchart, math, and replicated diagrams share one typed design system."
  - title: Exported-Artifact Verification
    details: "Validate the model, then inspect the exported PNG, SVG, PDF, or Desktop artifact before reporting completion."
---

## Pick The Right Skill

Use `skills/drawio` for general diagrams, architecture, network topology, Agent and memory systems, UML/ER, flowcharts, org charts, Mermaid/CSV conversion, existing `.drawio` files, themes, and style presets.

Use `skills/drawio-academic-skills` for papers, theses, dissertations, journals, IEEE/ACM submissions, manuscripts, camera-ready packages, and other publication figures. The overlay requires sibling `../drawio`; it does not copy the base runtime and never requires MCP.

## Runtime Model

1. **Offline authoring**: normalize input to YAML, validate it, and generate native `.drawio`.
2. **Desktop-enhanced delivery**: produce the default 300 DPI PNG or requested PDF/JPG/embedded SVG.
3. **Offline fallback**: when Desktop is unavailable, report the missing export and use standalone SVG.
4. **Optional live refinement**: base-skill browser editing only when explicitly requested.

Keep `.spec.yaml`, `.arch.json`, normalized YAML, and diagnostics in a project work directory. The default final delivery contains editable `.drawio` and a 300 DPI PNG, or SVG fallback when Desktop is unavailable.

## Quick Start

```bash
npx skills add bahayonghang/drawio-skills
```

```text
/drawio create a horizontal service architecture with an API, queue, worker, and database
```

Before using vendor stencils, search the bundled catalog:

```bash
node skills/drawio/scripts/cli.js search pod --prefix kubernetes
```

Render and validate:

```bash
node skills/drawio/scripts/cli.js input.yaml final/diagram.drawio --validate --write-sidecars --sidecar-dir .drawio-tmp/diagram
node skills/drawio/scripts/cli.js input.yaml final/diagram.png --validate --use-desktop
```

For publication work:

```text
/drawio-academic-skills create an IEEE workflow figure with grayscale-safe semantics and a PDF submission export
```

## Documentation Map

- [Workflows](./guide/workflows.md): create, edit/import, replicate, and academic routing
- [Design System](./guide/design-system.md): specifications, types, themes, icons, and connectors
- [Architecture Diagrams](./guide/architecture-diagrams.md) and [Agent Diagrams](./guide/agent-diagrams.md)
- [CLI Reference](./guide/cli.md) and [Export and Artifacts](./guide/export.md)
- [Examples](./examples/index.md): prompts and reusable YAML

## Source Of Truth

The public contract starts in `skills/drawio/SKILL.md` and `skills/drawio-academic-skills/SKILL.md`. Their routed workflow and reference files provide deeper rules. The site organizes those contracts for users; it does not replace them.

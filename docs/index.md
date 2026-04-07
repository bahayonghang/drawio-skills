---
layout: home

hero:
  name: "Draw.io Skill"
  text: "for Claude, Gemini, and Codex"
  tagline: Desktop-first, offline-first draw.io authoring with YAML specs, local sidecars, optional live editing, and academic-quality guardrails.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/bahayonghang/drawio-skills

features:
  - icon: 🧭
    title: Offline-First by Default
    details: "Generate `.drawio` locally, keep `.spec.yaml` and `.arch.json` beside it, and use live MCP only when real-time browser refinement is genuinely needed."

  - icon: 🖥️
    title: Desktop-Enhanced Export
    details: "Use draw.io Desktop for PNG, PDF, JPG, and embedded `.drawio.svg` artifacts when available. Standalone SVG still works fully offline."

  - icon: 📝
    title: YAML as Canonical Source
    details: "Normalize natural language, Mermaid, CSV, or imported `.drawio` files into one structured YAML spec before rendering."

  - icon: 🚀
    title: 3 Core Routes
    details: "Create new diagrams, edit existing bundles, or replicate uploaded diagrams with route-specific references and validation rules."

  - icon: 🎨
    title: 6 Built-In Themes
    details: "Tech Blue, Academic, Academic Color, Nature, Dark, and High Contrast cover engineering review, paper figures, presentations, and accessibility-first output."

  - icon: 🧮
    title: Academic and Math Guardrails
    details: "Built-in support for IEEE-style figures, MathJax-safe delimiters, caption metadata, legend checks, and grayscale-safe exports."

  - icon: ☁️
    title: Stencil and Cloud Support
    details: "Use semantic shapes first, then opt into AWS, GCP, Azure, Kubernetes, or network stencils when provider-specific visuals matter."

  - icon: ☁️
    title: Network Topology Workflows
    details: "Model campus LANs, AWS VPCs, and DMZ layouts with semantic network node types, `hierarchical` / `star` / `mesh` layouts, and automatic interface/IP/VLAN link labels."

  - icon: 🧩
    title: Vendor-Aware Icon Mapping
    details: "Use explicit AWS/Cisco icon prefixes, supported aliases such as `aws.alb` and `cisco.ap`, or let `network.vendor` + `network.device` derive documented stencils automatically."

  - icon: 🔁
    title: Replication with Palette Control
    details: "`/drawio replicate` preserves source colors by default and records extracted palette intent in `meta.replication` for future edits."

  - icon: ✅
    title: Validation Before Claiming Done
    details: "Structure, layout, and quality validators catch spec errors, overlap risk, edge routing issues, and academic profile omissions before export."

  - icon: 🔌
    title: Optional Live MCP
    details: "next-ai MCP remains supported for browser sessions, but it is an enhancement layer rather than the default authoring runtime."
---

## Runtime Model

Use the skill in this order unless you explicitly need a browser session:

1. **Offline-first**: generate `.drawio` locally and keep the sidecars in sync.
2. **Desktop-enhanced**: add draw.io Desktop when you need PNG, PDF, JPG, or embedded SVG exports.
3. **Optional live MCP**: start a browser session only for in-session visual refinement.

## Quick Start

Install the skill:

```bash
npx skills add bahayonghang/drawio-skills
```

Create a first diagram:

```text
/drawio create a horizontal tech-blue login flow with 6 nodes
```

Create a network topology bundle:

```text
/drawio create a tech-blue AWS VPC topology with an internet gateway, an application load balancer, two app servers, and a private RDS subnet. Label the private links.
```

Validate and export from the repo:

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --validate --write-sidecars
node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars
```

Import an existing `.drawio` file into the offline bundle:

```bash
node skills/drawio/scripts/cli.js existing.drawio --input-format drawio --export-spec --write-sidecars
```

## What the Site Covers

- **Guide**: installation, routes, design system, YAML specification, CLI, and export workflow.
- **API**: optional MCP tools, XML format notes, and the standalone SVG converter.
- **Examples**: prompt-first examples plus reusable YAML specs under `skills/drawio/references/examples/`.

## Source of Truth

This documentation tracks the current runtime model defined in:

- `skills/drawio/SKILL.md`
- `skills/drawio/references/workflows/*.md`
- `skills/drawio/references/docs/**`

If a page disagrees with those files, treat the skill and references as authoritative.

---
layout: home

hero:
  name: "Draw.io Skill"
  text: "for Claude Code"
  tagline: AI-powered diagram creation with built-in Design System and real-time browser preview
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/bahayonghang/drawio-skills

features:
  - icon: 🎨
    title: Design System 2.0
    details: 4 built-in themes (tech-blue, academic, nature, dark), 8px grid system, semantic shapes, typed connectors.

  - icon: 🚀
    title: 3 Clear Workflows
    details: "/drawio create for new diagrams, /drawio replicate for images, /drawio edit for modifications"

  - icon: 📝
    title: YAML Specification
    details: Simple, readable specification format with theme selection, semantic nodes, and typed edges.

  - icon: 🔄
    title: Real-time Preview
    details: See your diagrams appear and update in your browser as Claude creates them.

  - icon: ☁️
    title: Cloud Architecture Support
    details: AWS, GCP, Azure icons with proper icon libraries (mxgraph.aws4.*, mxgraph.gcp2.*, mxgraph.azure.*).

  - icon: ∑
    title: Math Typesetting
    details: LaTeX/AsciiMath equations with MathJax rendering. IEEE/academic publication ready.

  - icon: 🛡️
    title: Complexity Guardrails
    details: Auto-warnings for >20 nodes, >30 edges, >14 char labels. Keeps diagrams readable.

  - icon: 💾
    title: Export & Save
    details: Save as .drawio, .png, .svg, .pdf with theme-appropriate settings.
---

## Quick Start - 3 Workflows

| Command | Description | Theme Support |
|---------|-------------|---------------|
| `/drawio create` | Create diagrams from natural language | ✅ Auto theme |
| `/drawio replicate` | Replicate existing images | ✅ Domain themes |
| `/drawio edit` | Modify existing diagrams | ✅ Theme switch |

### Example: Create with Design System

```
/drawio create with tech-blue theme
A microservices architecture with:
- API Gateway (service)
- User Service (service)
- Order Service (service)
- PostgreSQL (database)
- Redis Cache (database)
All services connected via data flow arrows
```

### Example: Replicate with Theme

```
/drawio replicate with academic theme
[Upload architecture image]
```

### Example: Edit with Theme Switch

```
/drawio edit with dark theme
Convert to presentation mode
```

## Design System Features

### 4 Built-in Themes

| Theme | Use Case | Colors |
|-------|----------|--------|
| `tech-blue` | Technical docs, dashboards | Blue primary, modern |
| `academic` | IEEE papers, publications | Grayscale, high contrast |
| `nature` | Environmental, lifecycle | Green palette |
| `dark` | Presentations, dark mode | Dark background |

### Semantic Shapes

Shapes are auto-detected from labels or explicitly specified:

- `service` → Rounded rectangle (API Gateway, User Service)
- `database` → Cylinder (PostgreSQL, Redis, MongoDB)
- `decision` → Diamond (conditions, branches)
- `queue` → Parallelogram (Kafka, SQS, RabbitMQ)
- `user` → Ellipse (actors, clients)
- `formula` → White box with math support

### Typed Connectors

| Type | Style | Use Case |
|------|-------|----------|
| `primary` | Solid, block arrow | Main flow |
| `data` | Dashed | Data transfer |
| `optional` | Thin dashed | Optional paths |
| `dependency` | Diamond arrow | Dependencies |
| `bidirectional` | No arrows | Two-way |

## How It Works

```
Claude Code <--stdio--> MCP Server <--http--> Browser (draw.io)
```

1. Ask Claude to create a diagram with a theme
2. Claude generates YAML specification → draw.io XML
3. XML sent to browser via MCP server
4. Real-time preview with design system styling!

## What is Draw.io Skill?

Draw.io Skill is a Claude Code skill that enables AI-powered diagram creation with a professional design system. It provides:

- **Design System 2.0**: Unified theming, semantic shapes, typed connectors
- **YAML Specification**: Simple, readable diagram definitions
- **3 Clear Workflows**: Create, replicate, and edit diagrams
- **Real-time Preview**: See changes instantly in your browser

## Credits

- **MCP Server**: [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) by [@DayuanJiang](https://github.com/DayuanJiang)
- **Skill Conversion**: [skill-seekers](https://github.com/modelcontextprotocol/skill-seekers)
- **Draw.io**: [diagrams.net](https://www.diagrams.net/)

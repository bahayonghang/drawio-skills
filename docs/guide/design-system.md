# Design System

The Draw.io Skill Design System 2.0 provides unified theming, semantic shapes, and typed connectors for professional diagram creation.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Design System 2.0                        │
├─────────────────┬─────────────────┬────────────────────────┤
│  4 Themes       │  8 Shapes       │  5 Connectors          │
│  - tech-blue    │  - service      │  - primary             │
│  - academic     │  - database     │  - data                │
│  - nature       │  - decision     │  - optional            │
│  - dark         │  - terminal     │  - dependency          │
│                 │  - queue        │  - bidirectional       │
│                 │  - user         │                        │
│                 │  - document     │  8px Grid System       │
│                 │  - formula      │  Auto-snap alignment   │
└─────────────────┴─────────────────┴────────────────────────┘
```

## Themes

### tech-blue (Default)

**Use case:** Technical documentation, software architecture, dashboards

| Token | Value |
|-------|-------|
| Primary | `#2563EB` |
| Primary Light | `#DBEAFE` |
| Secondary | `#059669` |
| Background | `#FFFFFF` |
| Text | `#1E293B` |

```
/drawio create with tech-blue theme
```

### academic

**Use case:** IEEE papers, academic publications, print-ready diagrams

| Token | Value |
|-------|-------|
| Primary | `#1F2937` |
| Primary Light | `#F3F4F6` |
| Secondary | `#4B5563` |
| Background | `#FFFFFF` |
| Text | `#111827` |

Features:
- High contrast for print
- Grayscale-friendly
- Serif font support

```
/drawio create with academic theme
```

### nature

**Use case:** Environmental diagrams, lifecycle flows, sustainability

| Token | Value |
|-------|-------|
| Primary | `#059669` |
| Primary Light | `#D1FAE5` |
| Secondary | `#0D9488` |
| Background | `#F0FDF4` |
| Text | `#064E3B` |

```
/drawio create with nature theme
```

### dark

**Use case:** Presentations, dark mode UIs, video content

| Token | Value |
|-------|-------|
| Primary | `#60A5FA` |
| Primary Light | `#1E3A5F` |
| Background | `#0F172A` |
| Surface | `#1E293B` |
| Text | `#F1F5F9` |

```
/drawio create with dark theme
```

## Semantic Shapes

Shapes are auto-detected from labels or explicitly specified with `type:`.

### service (Default)

Rounded rectangle for components, services, and processes.

```yaml
nodes:
  - id: api
    label: API Gateway
    type: service  # Optional, auto-detected
```

**Auto-detection keywords:** None (default for unrecognized labels)

### database

Cylinder shape for data stores.

```yaml
nodes:
  - id: db
    label: PostgreSQL
    type: database
```

**Auto-detection keywords:** database, db, sql, storage, redis, mongo, postgresql, mysql, cache

### decision

Diamond shape for conditions and branches.

```yaml
nodes:
  - id: check
    label: Is Valid?
    type: decision
```

**Auto-detection keywords:** decision, condition, branch, switch, route, or labels ending with `?`

### terminal

Stadium/pill shape for start/end points.

```yaml
nodes:
  - id: start
    label: Start
    type: terminal
```

**Auto-detection keywords:** start, begin, end, finish, stop, terminate

### queue

Parallelogram for message queues and buffers.

```yaml
nodes:
  - id: mq
    label: Kafka
    type: queue
```

**Auto-detection keywords:** queue, buffer, kafka, rabbitmq, stream, sqs, message

### user

Ellipse for actors and users.

```yaml
nodes:
  - id: actor
    label: Customer
    type: user
```

**Auto-detection keywords:** user, actor, client, person, customer

### document

Document shape for reports and files.

```yaml
nodes:
  - id: report
    label: Report
    type: document
```

**Auto-detection keywords:** document, doc, file, report, log

### formula

White box optimized for LaTeX math.

```yaml
nodes:
  - id: eq
    label: "$$E = mc^2$$"
    type: formula
```

**Auto-detection:** Labels containing `$$`, `\(`, or `\[`

## Connectors

### primary

Main flow connections.

```yaml
edges:
  - from: a
    to: b
    type: primary
```

| Property | Value |
|----------|-------|
| Stroke | 2px solid |
| Arrow | Filled block |
| Color | Theme text color |

### data

Data transfer connections.

```yaml
edges:
  - from: api
    to: db
    type: data
```

| Property | Value |
|----------|-------|
| Stroke | 2px dashed (6 4) |
| Arrow | Filled block |
| Color | Theme text color |

### optional

Optional or conditional paths.

```yaml
edges:
  - from: a
    to: b
    type: optional
```

| Property | Value |
|----------|-------|
| Stroke | 1px dashed (2 2) |
| Arrow | Open |
| Color | Theme muted color |

### dependency

Dependency relationships.

```yaml
edges:
  - from: a
    to: b
    type: dependency
```

| Property | Value |
|----------|-------|
| Stroke | 1px solid |
| Arrow | Diamond |
| Color | Theme text color |

### bidirectional

Two-way connections.

```yaml
edges:
  - from: a
    to: b
    type: bidirectional
```

| Property | Value |
|----------|-------|
| Stroke | 1.5px solid |
| Arrow | None |
| Color | Theme muted color |

## 8px Grid System

All positions snap to 8px increments:

| Spacing | Value | Use |
|---------|-------|-----|
| 1 unit | 8px | Minimum margin |
| 2 units | 16px | Small spacing |
| 3 units | 24px | Module padding |
| 4 units | 32px | Node spacing |
| 5 units | 40px | Section spacing |

## Complexity Guardrails

The design system includes automatic complexity checking:

| Metric | Warning | Error |
|--------|---------|-------|
| Nodes | >20 | >30 |
| Edges | >30 | >50 |
| Modules | >5 | - |
| Label length | >14 chars | - |

When thresholds are exceeded:
- **Warning:** Suggestion to simplify
- **Error:** Confirmation required to proceed

## Custom Themes

Create custom themes by extending the base structure:

```json
{
  "name": "my-theme",
  "colors": {
    "primary": "#your-color",
    "primaryLight": "#your-light",
    "secondary": "#your-secondary",
    "background": "#ffffff",
    "text": "#000000"
  },
  "node": {
    "default": {
      "fillColor": "#your-fill",
      "strokeColor": "#your-stroke"
    }
  }
}
```

## Related

- [Specification Format](./specification.md) - YAML spec reference
- [Workflows](./workflows.md) - How to use the design system
- [Math Typesetting](./math-typesetting.md) - LaTeX support

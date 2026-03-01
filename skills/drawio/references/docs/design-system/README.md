# Draw.io Design System

A unified design system providing consistent visual language for AI-generated draw.io diagrams.

---

## Quick Start

```yaml
meta:
  theme: tech-blue    # Select theme
  layout: horizontal  # Layout direction

nodes:
  - id: api
    label: API Gateway
    type: service     # Auto-selects rounded rectangle

  - id: db
    label: User Database
    type: database    # Auto-selects cylinder

edges:
  - from: api
    to: db
    type: data        # Dashed line with arrow
    label: Query
```

---

## Core Concepts

### 8px Grid System

All positions, sizes, and spacing are multiples of 8px for professional alignment.

| Spacing | Value | Usage |
|---------|-------|-------|
| Node margin | 32px | Minimum space between nodes |
| Container padding | 24px | Space inside modules |
| Canvas padding | 32px | Edge to content |

### Themes

4 built-in themes for different use cases:

| Theme | Use Case |
|-------|----------|
| **Tech Blue** | Software architecture, DevOps |
| **Academic** | IEEE papers, grayscale print |
| **Nature** | Environmental, lifecycle |
| **Dark Mode** | Presentations, slides |

### Semantic Shapes

Automatic shape selection based on node type:

| Type | Shape |
|------|-------|
| `service` | Rounded rectangle |
| `database` | Cylinder |
| `decision` | Diamond |
| `terminal` | Stadium/Pill |
| `queue` | Parallelogram |
| `user` | Ellipse |

### Typed Connectors

Visual hierarchy through connector semantics:

| Type | Style | Usage |
|------|-------|-------|
| `primary` | Solid 2px | Main flow |
| `data` | Dashed 2px | Data/async |
| `optional` | Dotted 1px | Weak relation |

---

## Documentation

| Topic | Description |
|-------|-------------|
| [tokens.md](tokens.md) | Color, spacing, typography tokens |
| [themes.md](themes.md) | Built-in themes & customization |
| [shapes.md](shapes.md) | Semantic shape vocabulary |
| [connectors.md](connectors.md) | Connector types & routing |
| [icons.md](icons.md) | Cloud provider & DevOps icons |
| [formulas.md](formulas.md) | LaTeX/MathJax integration |
| [specification.md](specification.md) | YAML specification format |

---

## Example: Microservices Architecture

```yaml
meta:
  theme: tech-blue
  layout: horizontal

modules:
  - id: frontend
    label: Frontend
  - id: backend
    label: Backend
  - id: data
    label: Data Layer

nodes:
  - id: web
    label: Web App
    type: service
    module: frontend
    
  - id: api
    label: API Gateway
    type: service
    module: backend
    icon: aws.api-gateway
    
  - id: users
    label: User Service
    type: service
    module: backend
    
  - id: db
    label: PostgreSQL
    type: database
    module: data

edges:
  - from: web
    to: api
    type: primary
    
  - from: api
    to: users
    type: primary
    
  - from: users
    to: db
    type: data
    label: CRUD
```

---

## Design Principles

1. **Content in Components**: Prefer embedding text and formulas in nodes (shapes) rather than standalone text boxes. Use standalone text only when no suitable shape exists. Exception: edge labels for connector annotations.
   > 文字、公式等尽量写入形状组件中，而非独立文本框；仅当无合适形状时才使用独立文本框。例外：边标签用于箭头标注。
2. **KISS**: Simple, predictable styling
3. **DRY**: Reusable tokens and themes
4. **Consistency**: Same semantic = same visual
5. **Accessibility**: High contrast, print-safe options

---

## Migration from A-H Format

The legacy A-H format is replaced by YAML specification. See [specification.md](specification.md) for migration guide.

| Before (A-H) | After (YAML) |
|--------------|--------------|
| Free-text sections | Structured fields |
| Implicit styling | Explicit themes |
| No validation | JSON Schema |

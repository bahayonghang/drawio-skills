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

### Workflow Profiles

Use profiles to choose the validation posture:

| Profile | Best For |
|---------|----------|
| `default` | Standard diagrams |
| `academic-paper` | IEEE figures, thesis diagrams, paper-ready exports |
| `engineering-review` | Dense architecture and network diagrams |

### 8px Grid System

All positions, sizes, and spacing are multiples of 8px for professional alignment.

| Spacing | Value | Usage |
|---------|-------|-------|
| Node margin | 32px | Minimum space between nodes |
| Container padding | 24px | Space inside modules |
| Canvas padding | 32px | Edge to content |

### Themes

6 built-in themes for different use cases:

| Theme | Use Case |
|-------|----------|
| **Tech Blue** | Software architecture, DevOps |
| **Academic** | IEEE papers, grayscale print |
| **Nature** | Environmental, lifecycle |
| **Dark Mode** | Presentations, slides |
| **Academic Color** | Academic papers, research (color print/digital) |
| **High Contrast** | WCAG AA accessible, maximum readability |

### Replication Color Modes

When redrawing from an uploaded image, keep theme selection and color extraction separate:

| Mode | Default? | Behavior |
|------|----------|----------|
| `preserve-original` | Yes | Keep the source background and dominant palette, writing explicit style overrides for high-confidence colors. |
| `theme-first` | No | Use the selected theme as the primary palette and only keep source colors as hints/reference metadata. |

Replicated specs should usually include `meta.source: replicated` and a `meta.replication` block so later edits can tell which colors came from the image and which colors are theme fallbacks.

### Text and Label Fidelity

For ordinary generated diagrams, labels usually live inside their shapes. For screenshot or reference-image replication, text placement can carry meaning and should be preserved explicitly:

- use `type: text` for standalone titles, captions, callouts, legends, and explanatory notes;
- use `type: formula` for dedicated formula annotations, with official math delimiters;
- use `bounds: {x, y, width, height}` when exact text-box geometry matters (`bounds` is top-left based);
- use `position: {x, y}` for center-point placement of ordinary nodes;
- use `labelOffset: {x, y}` on edges to keep labels 12-20px off the connector instead of sitting on top of the line.

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
| `document` | Document |
| `formula` | Rectangle |
| `text` | Standalone text box |

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

1. **Content in Components, Except When Position Matters**: Prefer embedding ordinary labels in nodes, but treat standalone text, formula annotations, captions, callouts, and edge labels as first-class elements during replication when their separate position carries meaning.
   > 普通图中优先把文字写入形状组件；复刻图时，如果标题、说明、公式或边标签的独立位置本身有意义，就把它们作为一等文本元素处理。
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

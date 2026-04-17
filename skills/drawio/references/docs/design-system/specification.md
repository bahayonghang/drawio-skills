# Specification Format

The Design System uses a YAML-based specification format for defining diagrams. This format supersedes the [legacy A-H format](../ah-format.md) (now deprecated) with structured, type-safe definitions.

---

## Overview

The specification format provides:

- **Theme integration**: Direct theme selection
- **Workflow profiles**: Academic-paper and engineering-review validation modes
- **Semantic types**: Auto-shape mapping
- **Typed connectors**: Visual hierarchy
- **Grid alignment**: 8px grid compliance
- **Schema validation**: Structured validation

---

## Basic Structure

```yaml
meta:
  profile: default
  theme: tech-blue
  source: generated
  layout: horizontal
  canvas: auto

nodes:
  - id: n1
    label: Node Label
    type: service

edges:
  - from: n1
    to: n2
    type: primary

modules:  # optional
  - id: m1
    label: Module Name
```

---

## Meta Section

Diagram-level configuration.

```yaml
meta:
  # Workflow profile
  profile: default  # default | academic-paper | engineering-review

  # Academic intent (required when profile=academic-paper)
  figureType: architecture  # architecture | roadmap | workflow

  # How this spec was produced
  source: generated  # generated | replicated | edited

  # Theme selection (required)
  theme: tech-blue  # tech-blue | academic | academic-color | nature | dark | high-contrast | custom-name
  
  # Layout direction
  layout: horizontal  # horizontal | vertical | hierarchical
  
  # Canvas sizing
  canvas: auto  # auto | 800x600 | 1200x800
  
  # Connector routing
  routing: orthogonal  # orthogonal | rounded
  
  # Grid settings (optional, uses theme defaults)
  grid:
    size: 8
    snap: true
  
  # Diagram metadata
  title: "System Architecture"
  description: "Overview of microservices"
  legend: "Optional legend summary for paper-facing diagrams"

  # Optional replicate metadata
  replication:
    colorMode: preserve-original  # preserve-original | theme-first
    background: "#FFF7ED"
    palette:
      - hex: "#FDBA74"
        role: warm node fill
        appliesTo: nodes
        confidence: high
      - hex: "#7C2D12"
        role: connector stroke
        appliesTo: edges
        confidence: medium
    confidenceNotes:
      - "Arrowheads were anti-aliased in the source; connector color was normalized to the nearest flat brown."
```

### Theme Options

| Theme | Description |
|-------|-------------|
| `tech-blue` | Modern professional (default) |
| `academic` | IEEE/print optimized |
| `academic-color` | Color paper or research poster |
| `nature` | Green/environmental |
| `dark` | Dark mode presentations |
| `high-contrast` | Maximum contrast for accessibility and print |

### Profile Options

| Profile | Description |
|---------|-------------|
| `default` | Standard diagram workflow |
| `academic-paper` | Enables paper-facing validation and export checklist |
| `engineering-review` | Enables stricter routing and readability review |

### Academic Figure Type Options

Use `meta.figureType` whenever `meta.profile = academic-paper`.

| Figure Type | Use When | Avoid |
|-------------|----------|-------|
| `architecture` | You are explaining modules, tiers, responsibilities, and interactions | Turning runtime structure into a step-by-step process flow |
| `roadmap` | You are explaining milestones, study phases, or delivery progression | Mixing detailed runtime dependencies into a milestone timeline |
| `workflow` | You are explaining ordered execution, branching, loops, or fallback logic | Collapsing system structure and process control into one overloaded figure |

### Source Options

| Source | Description |
|--------|-------------|
| `generated` | New diagram created from text/spec |
| `replicated` | Structured redraw from an uploaded image or screenshot |
| `edited` | Existing diagram/spec that has been revised |

### Layout Options

| Layout | Description | Best For |
|--------|-------------|----------|
| `horizontal` | Left-to-right flow | Process flows |
| `vertical` | Top-to-bottom flow | Hierarchy |
| `hierarchical` | Auto-grid (4 columns) | Complex dependencies |

---

## Nodes Section

Define diagram nodes/elements.

### Basic Node

```yaml
nodes:
  - id: api
    label: API Gateway
```

### Full Node Definition

```yaml
nodes:
  - id: api
    label: API Gateway
    type: service           # Semantic type for auto-shape
    module: frontend        # Parent module ID
    size: medium            # small | medium | large | xl
    icon: aws.api-gateway   # Cloud provider icon
    position:               # Optional manual position
      x: 100
      y: 200
    style:                  # Style overrides
      fillColor: "#DBEAFE"
      strokeColor: "#2563EB"
```

### Semantic Types

| Type | Shape | Auto-detect Keywords |
|------|-------|---------------------|
| `service` | Rounded rectangle | api, service, component |
| `database` | Cylinder | db, database, sql, storage |
| `decision` | Diamond | if, decision, condition |
| `terminal` | Stadium | start, end, begin, finish |
| `queue` | Parallelogram | queue, buffer, kafka |
| `user` | Ellipse | user, actor, client |
| `document` | Document | doc, file, report |
| `formula` | Rectangle | $$, equation, formula |
| `cloud` | Cloud | cloud, internet, external |
| `process` | Rounded rectangle | process, transform, pipeline |

> **Note**: Extended types for deep learning (`conv`, `pool`, `attention`, `embed`, `norm`, `gate`, `tensor3d`, etc.) are also supported by the converter.

### Size Presets

| Size | Dimensions |
|------|------------|
| `small` | 80 × 40 px |
| `medium` | 120 × 60 px |
| `large` | 160 × 80 px |
| `xl` | 200 × 100 px |

---

## Edges Section

Define connections between nodes.

### Basic Edge

```yaml
edges:
  - from: api
    to: database
```

### Full Edge Definition

```yaml
edges:
  - from: api
    to: database
    type: data              # Connector semantic type
    label: Query            # Edge label
    labelPosition: center   # start | center | end
    bidirectional: false    # Two-way connection
    style:                  # Style overrides
      strokeColor: "#1E293B"
      strokeWidth: 2
      dashed: true
    waypoints:              # Optional manual routing
      - x: 420
        y: 180
```

### Connector Types

| Type | Line | Arrow | Usage |
|------|------|-------|-------|
| `primary` | Solid 2px | Filled block | Main flow |
| `data` | Dashed 2px | Filled block | Data/async |
| `optional` | Dotted 1px | Open block | Weak relation |
| `dependency` | Solid 1px | Diamond | Dependencies |
| `bidirectional` | Solid 1.5px | None | Two-way |

### Input Adapter Notes

- Mermaid and CSV are supported as CLI input formats.
- They are normalized into this YAML structure before rendering.
- YAML remains the canonical intermediate representation.

---

## Modules Section

Group nodes into containers/swimlanes.

```yaml
modules:
  - id: frontend
    label: Frontend Layer
    color: $primary         # Theme color reference
    
  - id: backend
    label: Backend Services
    color: $secondary
    
  - id: data
    label: Data Layer
    color: $accent
```

### Module Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier |
| `label` | string | Display name |
| `color` | string | Fill color or token |
| `style` | object | Style overrides |

---

## Style Overrides

Override theme defaults for individual elements.

### Node Style Override

```yaml
nodes:
  - id: critical
    label: Critical Service
    style:
      fillColor: "#FEE2E2"
      strokeColor: "#DC2626"
      strokeWidth: 2
      fontColor: "#991B1B"
      fontSize: 14
      fontWeight: 600
```

### Edge Style Override

```yaml
edges:
  - from: a
    to: b
    style:
      strokeColor: "#DC2626"
      strokeWidth: 3
      dashed: true
      dashPattern: "8 4"
      endArrow: classic
```

### Token References

Use `$` prefix to reference theme tokens:

```yaml
style:
  fillColor: $primaryLight   # Theme's primaryLight color
  strokeColor: $primary      # Theme's primary color
  fontColor: $text           # Theme's text color
```

### Replication Metadata

Use `meta.replication` to capture source-palette intent without turning the whole file into raw pixel data:

```yaml
meta:
  source: replicated
  theme: tech-blue
  replication:
    colorMode: preserve-original
    background: "#FFF7ED"
    palette:
      - hex: "#FDBA74"
        role: service fill
        appliesTo: nodes
        confidence: high
      - hex: "#7C2D12"
        role: connector and text
        appliesTo: mixed
        confidence: medium
    confidenceNotes:
      - "Footer gradient was simplified into a flat warm background."
```

Recommended usage:

- Write explicit `style.fillColor`, `style.strokeColor`, and `style.fontColor` on nodes/edges/modules when color extraction is high-confidence.
- Keep low-confidence or non-essential elements on theme tokens so theme changes and accessibility refinements still work.
- Use `theme-first` only when the user explicitly wants palette normalization.

---

## Complete Example

### Microservices Architecture

```yaml
meta:
  theme: tech-blue
  layout: horizontal
  canvas: auto
  title: E-Commerce Microservices

modules:
  - id: gateway
    label: API Gateway
  - id: services
    label: Core Services
  - id: data
    label: Data Layer

nodes:
  # Gateway Layer
  - id: api
    label: API Gateway
    type: service
    module: gateway
    icon: aws.api-gateway
    
  # Services Layer
  - id: orders
    label: Order Service
    type: service
    module: services
    
  - id: inventory
    label: Inventory Service
    type: service
    module: services
    
  - id: users
    label: User Service
    type: service
    module: services
    
  # Data Layer
  - id: ordersDb
    label: Orders DB
    type: database
    module: data
    icon: aws.dynamodb
    
  - id: inventoryDb
    label: Inventory DB
    type: database
    module: data
    
  - id: usersDb
    label: Users DB
    type: database
    module: data

edges:
  # API to Services
  - from: api
    to: orders
    type: primary
    
  - from: api
    to: inventory
    type: primary
    
  - from: api
    to: users
    type: primary
    
  # Services to Databases
  - from: orders
    to: ordersDb
    type: data
    label: CRUD
    
  - from: inventory
    to: inventoryDb
    type: data
    label: CRUD
    
  - from: users
    to: usersDb
    type: data
    label: CRUD
    
  # Service Dependencies
  - from: orders
    to: inventory
    type: optional
    label: Check Stock
```

### Neural Network (Academic)

```yaml
meta:
  theme: academic
  figureType: architecture
  layout: vertical
  title: CNN Architecture

nodes:
  - id: input
    label: "Input: \\(X \\in \\mathbb{R}^{28 \\times 28}\\)"
    type: terminal
    
  - id: conv1
    label: "$$\\text{Conv2D}(32, 3\\times3)$$"
    type: formula
    
  - id: pool1
    label: "$$\\text{MaxPool}(2\\times2)$$"
    type: formula
    
  - id: conv2
    label: "$$\\text{Conv2D}(64, 3\\times3)$$"
    type: formula
    
  - id: flatten
    label: Flatten
    type: process
    
  - id: dense
    label: "$$\\text{Dense}(128, \\text{ReLU})$$"
    type: formula
    
  - id: output
    label: "Output: \\(\\hat{y} \\in \\mathbb{R}^{10}\\)"
    type: terminal

edges:
  - from: input
    to: conv1
    type: primary
  - from: conv1
    to: pool1
    type: primary
  - from: pool1
    to: conv2
    type: primary
  - from: conv2
    to: flatten
    type: primary
  - from: flatten
    to: dense
    type: primary
  - from: dense
    to: output
    type: primary
```

---

## Validation

Specifications are validated against a JSON Schema:

```bash
# Validate specification
npx drawio-skills validate spec.yaml
```

Validation checks:

- Required fields present
- Valid theme reference
- Valid academic `figureType` when provided
- Unique node/module IDs
- Edge references exist
- Style values valid

---

## Migration from A-H Format

### A-H Format (Legacy)

```
A. 领域：软件架构
B. 目的：展示微服务架构
C. 标题：电商系统
D. 节点：
   - API Gateway
   - Order Service
   - Database
E. 连接：
   - API Gateway → Order Service
   - Order Service → Database
F. 布局：水平
G. 视觉：现代风格
H. 约束：无
```

### New Specification Format

```yaml
meta:
  theme: tech-blue
  layout: horizontal
  title: 电商系统

nodes:
  - id: api
    label: API Gateway
    type: service
  - id: orders
    label: Order Service
    type: service
  - id: db
    label: Database
    type: database

edges:
  - from: api
    to: orders
    type: primary
  - from: orders
    to: db
    type: data
```

### Key Differences

| Aspect | A-H Format | New Format |
|--------|------------|------------|
| Structure | Free text | YAML schema |
| Theme | Section G description | Explicit theme name |
| Shapes | Inferred | Semantic types |
| Connectors | Text description | Typed connectors |
| Validation | None | JSON Schema |
| Extensibility | Limited | Style overrides |

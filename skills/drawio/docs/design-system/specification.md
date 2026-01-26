# Specification Format

The Design System uses a YAML-based specification format for defining diagrams. This format replaces the legacy A-H format with structured, type-safe definitions.

---

## Overview

The specification format provides:
- **Theme integration**: Direct theme selection
- **Semantic types**: Auto-shape mapping
- **Typed connectors**: Visual hierarchy
- **Grid alignment**: 8px grid compliance
- **Schema validation**: Structured validation

---

## Basic Structure

```yaml
meta:
  theme: tech-blue
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
  # Theme selection (required)
  theme: tech-blue  # tech-blue | academic | nature | dark | custom-name
  
  # Layout direction
  layout: horizontal  # horizontal | vertical | hierarchical | radial
  
  # Canvas sizing
  canvas: auto  # auto | 800x600 | 1200x800
  
  # Connector routing
  routing: orthogonal  # orthogonal | rounded | curved
  
  # Grid settings (optional, uses theme defaults)
  grid:
    size: 8
    snap: true
  
  # Diagram metadata
  title: "System Architecture"
  description: "Overview of microservices"
```

### Theme Options

| Theme | Description |
|-------|-------------|
| `tech-blue` | Modern professional (default) |
| `academic` | IEEE/print optimized |
| `nature` | Green/environmental |
| `dark` | Dark mode presentations |

### Layout Options

| Layout | Description | Best For |
|--------|-------------|----------|
| `horizontal` | Left-to-right flow | Process flows |
| `vertical` | Top-to-bottom flow | Hierarchy |
| `hierarchical` | Dagre algorithm | Complex dependencies |
| `radial` | Center-outward | Mind maps |

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
```

### Connector Types

| Type | Line | Arrow | Usage |
|------|------|-------|-------|
| `primary` | Solid 2px | Filled block | Main flow |
| `data` | Dashed 2px | Filled block | Data/async |
| `optional` | Dotted 1px | Open block | Weak relation |
| `dependency` | Solid 1px | Diamond | Dependencies |
| `bidirectional` | Solid 1.5px | None | Two-way |

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

# Specification Format

The YAML specification format is the new standard for defining diagrams in Draw.io Skill 2.0. It replaces the legacy A-H format with a more intuitive, theme-aware structure.

## Quick Example

```yaml
meta:
  theme: tech-blue
  layout: horizontal

modules:
  - id: backend
    label: Backend Services

nodes:
  - id: api
    label: API Gateway
    type: service
    module: backend
  - id: db
    label: PostgreSQL
    type: database
    module: backend

edges:
  - from: api
    to: db
    type: data
    label: Query
```

## Structure

### meta (Required)

Diagram-level settings.

```yaml
meta:
  theme: tech-blue      # Theme name (required)
  layout: horizontal    # Layout direction (optional, default: horizontal)
  routing: orthogonal   # Connector routing (optional, default: orthogonal)
  title: My Diagram     # Diagram title (optional)
```

**Theme options:** `tech-blue`, `academic`, `nature`, `dark`

**Layout options:** `horizontal`, `vertical`, `hierarchical`

**Routing options:** `orthogonal`, `rounded`, `curved`

### modules (Optional)

Logical groupings/containers for nodes.

```yaml
modules:
  - id: frontend        # Unique identifier
    label: Frontend     # Display label
    color: "#E0F2FE"    # Optional background color override
```

### nodes (Required)

The diagram elements.

```yaml
nodes:
  - id: api             # Unique identifier (required)
    label: API Gateway  # Display label (required)
    type: service       # Semantic type (optional, auto-detected)
    module: backend     # Parent module (optional)
    size: medium        # Size preset (optional, default: medium)
    style:              # Style overrides (optional)
      fillColor: "#custom"
```

**Type options:** `service`, `database`, `decision`, `terminal`, `queue`, `user`, `document`, `formula`

**Size options:** `small` (80×40), `medium` (120×60), `large` (160×80), `xl` (200×100)

### edges (Optional)

Connections between nodes.

```yaml
edges:
  - from: api           # Source node id (required)
    to: db              # Target node id (required)
    type: data          # Connector type (optional, default: primary)
    label: Query        # Edge label (optional)
    style:              # Style overrides (optional)
      strokeColor: "#custom"
```

**Type options:** `primary`, `data`, `optional`, `dependency`, `bidirectional`

## Complete Example

```yaml
meta:
  theme: tech-blue
  layout: horizontal
  title: E-Commerce Architecture

modules:
  - id: frontend
    label: Frontend Layer
  - id: backend
    label: Backend Services
  - id: data
    label: Data Layer

nodes:
  # Frontend
  - id: web
    label: Web App
    type: service
    module: frontend
  - id: mobile
    label: Mobile App
    type: service
    module: frontend

  # Backend
  - id: api
    label: API Gateway
    type: service
    module: backend
  - id: auth
    label: Auth Service
    type: service
    module: backend
  - id: order
    label: Order Service
    type: service
    module: backend

  # Data
  - id: postgres
    label: PostgreSQL
    type: database
    module: data
  - id: redis
    label: Redis Cache
    type: database
    module: data
  - id: kafka
    label: Kafka
    type: queue
    module: data

edges:
  # Frontend to API
  - from: web
    to: api
    type: primary
  - from: mobile
    to: api
    type: primary

  # API to Services
  - from: api
    to: auth
    type: primary
    label: Auth
  - from: api
    to: order
    type: primary
    label: Orders

  # Services to Data
  - from: auth
    to: postgres
    type: data
  - from: order
    to: postgres
    type: data
  - from: order
    to: redis
    type: data
    label: Cache
  - from: order
    to: kafka
    type: data
    label: Events
```

## Type Auto-Detection

If `type` is not specified, it's auto-detected from the label:

| Keywords | Detected Type |
|----------|---------------|
| database, db, sql, storage, redis, mongo, postgresql, mysql, cache | `database` |
| decision, condition, branch, switch, route, or `?` | `decision` |
| start, begin, end, finish, stop, terminate | `terminal` |
| queue, buffer, kafka, rabbitmq, stream, sqs, message | `queue` |
| user, actor, client, person, customer | `user` |
| document, doc, file, report, log | `document` |
| `$$`, `\(`, `\[` | `formula` |
| (default) | `service` |

## Migration from A-H Format

### Before (A-H Format)

```
【A 布局】3:2，左→右
【B 模块】Frontend | Backend | Data
【C 节点】
- n1: API Gateway
- n2: PostgreSQL
【D 连线】n1→n2(数据)
【G 视觉】蓝色主题
```

### After (YAML Specification)

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
    label: Data

nodes:
  - id: n1
    label: API Gateway
    type: service
    module: backend
  - id: n2
    label: PostgreSQL
    type: database
    module: data

edges:
  - from: n1
    to: n2
    type: data
```

### Migration Mapping

| A-H Section | YAML Equivalent |
|-------------|-----------------|
| A (Layout) | `meta.layout` |
| B (Modules) | `modules[]` |
| C (Nodes) | `nodes[]` |
| D (Edges) | `edges[]` |
| E (Groups) | `modules[]` + `nodes[].module` |
| F (Methods) | Node labels |
| G (Visual) | `meta.theme` + `style` overrides |
| H (Export) | Handled by MCP tools |

## Validation Rules

1. **Required fields:**
   - `meta.theme`
   - `nodes` array with at least one node
   - Each node must have `id` and `label`

2. **Unique IDs:**
   - All node IDs must be unique
   - All module IDs must be unique

3. **Valid references:**
   - `edges.from` and `edges.to` must reference existing node IDs
   - `nodes.module` must reference existing module ID

4. **Complexity limits:**
   - Warning at >20 nodes
   - Error at >30 nodes
   - Warning at >30 edges

## Related

- [Design System](./design-system.md) - Themes, shapes, connectors
- [Workflows](./workflows.md) - How to use the specification
- [Math Typesetting](./math-typesetting.md) - LaTeX in specifications

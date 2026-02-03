# Workflow: /drawio create

Create diagrams from scratch using natural language descriptions with Design System support.

## Trigger

- **Command**: `/drawio create ...`
- **Keywords**: "create", "generate", "make", "draw", "生成", "创建"

## Procedure

```
Step 1: Start Session
├── Call MCP: start_session
└── Browser opens with draw.io editor

Step 2: Analyze User Request
├── Identify diagram type (flowchart, architecture, sequence, etc.)
├── Extract entities and relationships
├── Determine layout direction (horizontal/vertical/hierarchical)
└── Select theme (tech-blue default, or user-specified)

Step 3: Generate Diagram Specification
├── Create YAML specification with:
│   ├── meta: theme, layout, canvas size
│   ├── nodes: id, label, type, module, icon
│   └── edges: from, to, type, label
├── Apply semantic shape mapping (auto or explicit)
└── Validate complexity (warn if >20 nodes or >30 edges)

Step 4: Convert to Draw.io XML
├── Parse specification via src/dsl/spec-to-drawio.js
├── Apply theme tokens (colors, typography, spacing)
├── Calculate 8px grid-aligned positions
└── Generate mxCell elements with design system styles

Step 5: Create Diagram
├── Call MCP: create_new_diagram with XML
└── Diagram appears in browser

Step 6: Iterate
├── User can request modifications
└── Use /drawio edit for changes
```

## Design System Options

### Theme Selection

| Theme | Use Case | How to Request |
|-------|----------|----------------|
| **tech-blue** (default) | Software architecture, DevOps | No specification needed |
| **academic-color** ⭐ | Academic papers, research (color) | "academic-color theme" or "学术风格" |
| **academic** | IEEE grayscale print only | "academic theme" or "学术灰度" |
| **nature** | Environmental, lifecycle | "nature theme" or "自然风格" |
| **dark** | Presentations, slides | "dark theme" or "深色模式" |

> ⭐ **Recommended for academic**: Use `academic-color` for digital documents and color printing. Use `academic` only for strict grayscale requirements.

### Semantic Node Types

Specify node types for automatic shape selection:

| Type | Shape | Keywords (auto-detected) |
|------|-------|--------------------------|
| `service` | Rounded rect | API, service, gateway, backend |
| `database` | Cylinder | DB, SQL, storage, database |
| `decision` | Diamond | if, check, condition, valid |
| `terminal` | Stadium/Pill | start, end, begin, finish |
| `queue` | Parallelogram | queue, buffer, kafka, stream |
| `user` | Circle | user, actor, client, customer |
| `document` | Wave rect | doc, file, report, document |
| `formula` | White rect | equation, formula, $$ |

### Connector Types

| Type | Style | Use Case |
|------|-------|----------|
| `primary` | Solid 2px, filled arrow | Main flow (default) |
| `data` | Dashed 2px, filled arrow | Data/async flow |
| `optional` | Dotted 1px, open arrow | Weak relations |
| `dependency` | Solid 1px, diamond arrow | Dependencies |
| `bidirectional` | Solid 1.5px, no arrow | Associations |

## Input Types

| Input | Example |
|-------|---------|
| Natural language | `/drawio create a flowchart showing login process` |
| With theme | `/drawio create AWS architecture with tech-blue theme` |
| With semantic types | `/drawio create diagram with API (service), User DB (database)` |
| With math | `/drawio create a diagram with equation $$E = mc^2$$` |

## Specification Format (Optional)

For complex diagrams, use explicit YAML specification:

```yaml
meta:
  theme: tech-blue
  layout: horizontal

nodes:
  - id: api
    label: API Gateway
    type: service
    module: frontend

  - id: db
    label: User Database
    type: database
    module: data

edges:
  - from: api
    to: db
    type: data
    label: Query

modules:
  - id: frontend
    label: Frontend Layer
  - id: data
    label: Data Layer
```

Request structured format:
```
/drawio create with structured format
"使用规格格式创建..."
"Create using specification format..."
```

## Examples

### Basic Flowchart

```
/drawio create a login flowchart with:
- Start (terminal)
- Input credentials form
- Validation check (decision)
- Success → Dashboard
- Error → Back to login
```

### AWS Architecture with Theme

```
/drawio create AWS serverless architecture with tech-blue theme:
- API Gateway (service) as entry point
- Lambda (service) for business logic
- DynamoDB (database) for storage
- S3 (storage) for static files
Use AWS icons and show data flow
```

### Academic Diagram

```
/drawio create neural network training pipeline with academic theme:
- Data preprocessing
- Model training (with loss: $$L = -\sum y_i \log(\hat{y}_i)$$)
- Validation
- Deployment
```

### With Explicit Specification

```
/drawio create with structured format:

meta:
  theme: nature
  layout: vertical

nodes:
  - id: input
    label: Raw Data
    type: document
  - id: process
    label: ETL Pipeline
    type: service
  - id: output
    label: Data Warehouse
    type: database

edges:
  - from: input
    to: process
    type: data
  - from: process
    to: output
    type: primary
```

## Best Practices

1. **Content in Components** - Prefer embedding text and formulas in nodes (shapes) rather than standalone text boxes. Use standalone text only when no suitable shape exists. Exception: edge labels for connector annotations.
   > 文字、公式等尽量写入形状组件中，而非独立文本框；仅当无合适形状时才使用独立文本框。例外：边标签用于箭头标注。
2. **Specify theme** for consistent styling across diagrams
3. **Use semantic types** for automatic shape selection
4. **Describe relationships** with connector types (data, optional, etc.)
5. **Keep it simple** - aim for ≤20 nodes per diagram
6. **Use modules** for grouping related components

## Complexity Guardrails

| Metric | Threshold | Suggestion |
|--------|-----------|------------|
| Nodes | > 20 | Split into sub-diagrams |
| Edges | > 30 | Use hierarchical layout |
| Modules | > 5 | Create separate diagrams |
| Label length | > 14 chars | Abbreviate or use tooltip |

## Related

- [Design System Overview](../docs/design-system/README.md)
- [Specification Format](../docs/design-system/specification.md)
- [Themes Reference](../docs/design-system/themes.md)
- [Semantic Shapes](../docs/design-system/shapes.md)
- [Connectors](../docs/design-system/connectors.md)
- [Math Typesetting](../docs/math-typesetting.md)

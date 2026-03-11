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

Step 2: Analyze User Request + Apply Design Intent
├── Identify diagram type (flowchart, architecture, sequence, ER, etc.)
├── Extract entities and relationships from the description
├── Estimate node count and module grouping needs
│   └── If estimated nodes > 20 → pre-warn user before consultation
├── Check for explicit user specifications:
│   ├── Theme already stated? → set designIntent.theme, skip Q2
│   ├── Layout already stated? → set designIntent.layout, skip Q3
│   └── Complexity already stated? → set designIntent.complexity, skip Q4
└── Proceed to Step 2.5 for remaining unresolved dimensions

Step 2.5: Design Consultation (AskUserQuestion)
├── Call AskUserQuestion with up to 4 questions IN A SINGLE CALL:
│
│   Q1 — Target Audience & Use Case (single-select):
│     • Academic paper / research report  → preset: academic-color
│     • Engineering doc / system arch     → preset: tech-blue
│     • Presentation / slides             → preset: dark
│     • Developer reference / internal    → preset: tech-blue
│
│   Q2 — Visual Style / Theme (single-select, with markdown previews):
│     • tech-blue     — Blue professional, for architecture
│     • academic-color — Colorful academic, for papers/research
│     • dark          — Dark background, for slides/presentations
│     • nature        — Natural green, for lifecycle/process
│     • academic      — Grayscale print, for IEEE submissions
│
│   Q3 — Layout Direction (single-select):
│     • Horizontal (left→right)  — pipelines, data flows
│     • Vertical (top→bottom)    — API stacks, call hierarchies
│     • Hierarchical (tree)      — module orgs, decision trees
│     • Auto                     — AI decides based on structure
│
│   Q4 — Expected Complexity (single-select):
│     • Simple   (< 10 nodes, single page)
│     • Medium   (10–20 nodes, may need modules)
│     • Complex  (> 20 nodes → recommend splitting)
│
├── Store responses as `designIntent` object:
│   designIntent = { theme, layout, complexity, audience }
├── Apply designIntent to YAML meta pre-configuration
└── ⚠️ Skip questions already answered in Step 2

Step 3: Structured Text Draft & Confirm (Mandatory)
├── Generate ASCII text-art graph with SEMANTIC ANNOTATIONS:
│
│   Format per node: [id: semantic-type | color-token]
│   Format per edge: → edge-type →
│
│   Example output:
│   ┌─────────────────────────────────────────────────────┐
│   │  [START: terminal | $text]                          │
│   │              ↓ primary                              │
│   │  [Auth: service | $primaryLight/$primary]           │
│   │     ↙ optional              ↘ primary              │
│   │  [Err: terminal | $text]   [Dashboard: service]    │
│   │                                ↓ data              │
│   │                            [DB: database | $secondaryLight]
│   └─────────────────────────────────────────────────────┘
│
├── Display DESIGN SUMMARY below the ASCII graph:
│   ╔══════════════════════════════════════╗
│   ║  Design Summary                      ║
│   ║  Theme:    tech-blue                 ║
│   ║            $primary=#2563EB          ║
│   ║            $secondary=#059669        ║
│   ║  Layout:   horizontal, dx=160 dy=120 ║
│   ║  Nodes:    N  │  Modules: M          ║
│   ║  Edges:    E                         ║
│   ║  Status:   ✅ Normal / ⚠️ Near limit / ❌ Split recommended
│   ╚══════════════════════════════════════╝
│
└── ⚠️ PAUSE — Wait for user to confirm BOTH the logic AND the design summary
             before proceeding

Step 4: Generate Diagram Specification + Explicit Coordinate Calculation
├── Create YAML specification using designIntent values in meta:
│   ├── meta: theme (from designIntent), layout, canvas size
│   ├── nodes: id, label, type, module, icon, position: { x, y }
│   └── edges: from, to, type, label
│
├── ⚠️ CRITICAL LAYOUT REQUIREMENT:
│   The built-in layout engine only outputs nodes in a straight line.
│   You MUST explicitly calculate 2D grid coordinates for ALL nodes.
│   * Standard distance: dx=160 (horizontal), dy=120 (vertical)
│   * For decision branches: True→x+160, False→x-160 (or y±120)
│   * Use designIntent.layout to determine primary axis
│
├── Apply semantic shape mapping (auto-detected or explicit type field)
└── Validate complexity limits:
    • nodes > 20  → ⚠️ WARNING: suggest splitting
    • nodes > 30  → ❌ ERROR: must split
    • edges > 30  → ⚠️ WARNING: use hierarchical layout
    • modules > 5 → ⚠️ WARNING: create separate diagrams

Step 4.5: Plan-to-Spec Adherence Verification
├── Cross-check YAML spec against Step 3 ASCII draft and designIntent:
│   □ Node count matches (ASCII node count == YAML nodes length)
│   □ Edge types match (edge labels in ASCII == YAML edges[].type)
│   □ Theme matches (designIntent.theme == spec.meta.theme)
│   □ Layout direction matches (designIntent.layout == spec.meta.layout)
│   □ Complexity within limits (nodes ≤ 20, modules ≤ 5)
│   □ Color overrides use tokens or valid hex (validateColorScheme)
│   □ Position coordinates consistent with layout direction (validateLayoutConsistency)
│
├── If discrepancies found:
│   ├── Output a diff report showing what changed
│   └── Correct the YAML before proceeding
└── ✅ Only proceed to Step 5 after all checks pass

Step 5: Convert to Draw.io XML
├── Run: node $SKILL_DIR/scripts/cli.js input.yaml output.drawio [--validate]
│   ├── validateColorScheme() — checks all color overrides are valid tokens/hex
│   ├── validateLayoutConsistency() — detects coordinate/layout direction conflicts
│   └── Any warnings are displayed; --strict flag promotes warnings to errors
└── XML output is ready for MCP rendering

Step 6: Create Diagram
├── Call MCP: create_new_diagram with XML
└── Diagram appears in browser

Step 7: Clean Up (Mandatory)
└── Delete the intermediate YAML file to keep the workspace clean

Step 8: Iterate
├── User can request modifications
└── Use /drawio edit for changes

Step 9: Validate (Optional)
├── Check cell ID uniqueness
├── Check edge source/target reference validity
├── Check required root cells present
└── Use --validate CLI flag or validateXml() from DSL converter
```

## Design System Reference

> See the main SKILL.md for theme, shape, and connector quick-reference tables,
> or `references/docs/design-system/README.md` for the full design system documentation.

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
7. **Use color tokens** (`$primaryLight`, `$text`, etc.) instead of hardcoded hex values for theme compatibility

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
- [Color Scheme Guide](../docs/design-system/color-guide.md)
- [Semantic Shapes](../docs/design-system/shapes.md)
- [Connectors](../docs/design-system/connectors.md)
- [Math Typesetting](../docs/math-typesetting.md)

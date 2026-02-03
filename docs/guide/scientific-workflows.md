# Replicate Diagrams (`/drawio replicate`)

Replicate existing images or diagrams using structured extraction with Design System styling.

## Quick Start

```
/drawio replicate
[Upload image]
```

With theme override:

```
/drawio replicate with academic theme
[Upload architecture screenshot]
```

## Workflow Process

```
Step 1: Receive Input
├── Image upload (required)
└── Optional: text description

Step 2: Configuration
├── Select domain (software architecture, research, etc.)
├── Select theme (tech-blue default, academic for papers)
└── Specify language (Chinese/English)

Step 3: Structured Extraction
├── Analyze image structure
├── Extract to YAML specification:
│   ├── nodes with semantic types
│   ├── edges with connector types
│   └── modules for grouping
└── Mark missing info as "未提及"

Step 4: Convert to Diagram
├── Apply selected theme
├── Calculate 8px grid positions
└── Generate draw.io XML

Step 5: Real-time Preview
└── Diagram appears in browser
```

## Design System Integration

### Theme Selection by Domain

| Domain | Recommended Theme | Reason |
|--------|-------------------|--------|
| 软件架构 (Software Architecture) | `tech-blue` | Professional technical style |
| 商业流程 (Business Process) | `tech-blue` | Clean corporate look |
| 科研流程 (Research Workflow) | `academic` | IEEE-compatible, grayscale-safe |
| 工业流程 (Industrial Process) | `tech-blue` | Clear technical diagrams |
| 演示文稿 (Presentation) | `dark` | Slides, video content |
| 教学设计 (Teaching Design) | `nature` | Friendly, accessible colors |

### Semantic Shape Mapping

During extraction, visual elements are mapped to semantic types:

| Visual Element | Semantic Type | Draw.io Shape |
|----------------|---------------|---------------|
| Rectangle/Box | `service` | Rounded rectangle |
| Cylinder/Drum | `database` | Cylinder |
| Diamond | `decision` | Rhombus |
| Oval/Rounded rect | `terminal` | Stadium |
| Parallelogram | `queue` | Parallelogram |
| Person/Stick figure | `user` | Circle |
| Document shape | `document` | Wave rect |
| Math formula | `formula` | White rect with border |

### Connector Type Mapping

| Visual Style | Connector Type | Output Style |
|--------------|----------------|--------------|
| Solid arrow | `primary` | Solid 2px, filled arrow |
| Dashed arrow | `data` | Dashed 2px, filled arrow |
| Dotted line | `optional` | Dotted 1px, open arrow |
| Diamond end | `dependency` | Solid 1px, diamond |
| Double-headed | `bidirectional` | Solid 1.5px, no arrow |

## Input Examples

### With Image Only

```
/drawio replicate
[Upload image]
```

### With Theme Selection

```
/drawio replicate with academic theme
[Upload paper figure]
This is a figure from our research paper
```

### With Domain + Theme

```
/drawio replicate
【领域】软件架构
【主题】tech-blue
【语言】中文
[Upload image]
这是我们的微服务架构图，请按设计系统标准重绘
```

### For Academic Papers

```
/drawio replicate with academic theme
【领域】科研流程
[Upload paper figure]
这是论文中的实验流程图，需要IEEE标准化重绘
```

## Output Format

The extraction produces a YAML specification:

```yaml
meta:
  theme: tech-blue
  layout: horizontal
  source: replicated

nodes:
  - id: n1
    label: API Gateway
    type: service
    module: frontend

  - id: n2
    label: User DB
    type: database
    module: data

edges:
  - from: n1
    to: n2
    type: data
    label: Query

modules:
  - id: frontend
    label: 前端层
  - id: data
    label: 数据层
```

## Extraction Rules

⚠️ **Hard Rules (Violations cause regeneration):**

1. **Only use content from input** - Never add inferred content
2. **Mark missing as "未提及"** - Never guess
3. **Apply semantic types** - Map visuals to design system types
4. **Modules ≤ 5** - Merge if necessary
5. **Nodes per module: 3-7** - Summarize if too many
6. **Labels ≤ 14 characters** - No symbols in labels
7. **Use typed connectors** - Map line styles to connector types

## Complexity Guardrails

| Metric | Threshold | Suggestion |
|--------|-----------|------------|
| Nodes | > 20 | Split into sub-diagrams |
| Edges | > 30 | Use hierarchical layout |
| Modules | > 5 | Create separate diagrams |
| Label length | > 14 chars | Abbreviate or use tooltip |

## Troubleshooting

### Image too complex?
- Split into multiple diagrams (max 20-30 nodes each)
- Focus on one module at a time
- Use hierarchical layout for large structures

### Colors don't match original?
- Design system applies consistent theme colors
- Original colors are mapped to semantic types
- Use explicit style overrides for custom colors

### Shapes different from original?
- Design system maps to semantic shapes
- Explicit `type:` override available in spec
- Check semantic shape documentation

### Text labels truncated?
- Keep labels ≤ 14 characters
- Use abbreviations
- Move details to tooltips or annotations

## Related

- [Creating Diagrams](./creating-diagrams.md) - `/drawio create` workflow
- [Editing Diagrams](./editing-diagrams.md) - `/drawio edit` workflow
- [Design System](./design-system.md) - Themes, shapes, connectors
- [Specification Format](./specification.md) - YAML spec reference
- [Math Typesetting](./math-typesetting.md) - LaTeX support

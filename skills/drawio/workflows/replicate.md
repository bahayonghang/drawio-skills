# Workflow: /drawio replicate

Replicate existing images or diagrams using structured extraction with Design System styling.

## Trigger

- **Command**: `/drawio replicate ...`
- **Keywords**: "replicate", "recreate", "复刻", "复现", "重绘"

## Procedure

```
Step 1: Receive Input
├── Image upload (required)
└── Optional: accompanying text description

Step 2: Configuration
├── Select domain (software architecture, research, etc.)
├── Select theme (tech-blue default, academic for papers)
└── Specify language (Chinese/English)

Step 3: Structured Extraction
├── Analyze image structure
├── Extract to YAML specification format:
│   ├── nodes with semantic types
│   ├── edges with connector types
│   └── modules for grouping
├── Apply semantic shape mapping
└── Mark missing info as "未提及"

Step 4: Quality Validation
├── Check: modules ≤ 5
├── Check: nodes per module 3-7
├── Check: labels ≤ 14 characters
├── Check: total nodes ≤ 30
└── If fails: suggest splitting

Step 5: Convert to Diagram
├── Parse specification via src/dsl/spec-to-drawio.js
├── Apply selected theme
├── Calculate 8px grid positions
├── Call MCP: start_session
└── Call MCP: create_new_diagram

Step 6: Review and Refine
├── Compare with original image
└── Use /drawio edit for adjustments
```

## Design System Integration

### Theme Selection by Domain

| Domain | Recommended Theme | Reason |
|--------|-------------------|--------|
| 软件架构 (Software Architecture) | tech-blue | Professional technical style |
| 商业流程 (Business Process) | tech-blue | Clean corporate look |
| 科研流程 (Research Workflow) | academic | IEEE-compatible, grayscale-safe |
| 工业流程 (Industrial Process) | tech-blue | Clear technical diagrams |
| 项目管理 (Project Management) | tech-blue | Standard project visuals |
| 教学设计 (Teaching Design) | nature | Friendly, accessible colors |

### Semantic Shape Mapping

During extraction, map visual elements to semantic types:

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

## Input Format

### With Image Only

```
/drawio replicate
[Upload image]
```

### With Theme Selection

```
/drawio replicate with academic theme
[Upload image]
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

## Domain Configurations

### 软件架构 (Software Architecture)

- **Theme**: tech-blue (default)
- **Semantic Types**: service, database, queue, user
- **Icons**: AWS/GCP/Azure, Kubernetes, Docker
- **Typical flow**: 用户请求→网关→服务→数据层→响应

### 商业流程 (Business Process)

- **Theme**: tech-blue
- **Semantic Types**: service, decision, document, user
- **Typical flow**: 输入→处理→决策→输出→归档

### 科研流程 (Research Workflow)

- **Theme**: academic (grayscale)
- **Semantic Types**: document, service, decision, formula
- **Special**: Mark sample size, statistics, ethics if present
- **Typical flow**: 对象→采集→处理→分析/建模→产出

### 工业流程 (Industrial Process)

- **Theme**: tech-blue
- **Semantic Types**: service, database, queue
- **Typical flow**: 对象→采集→处理→控制→产出

## Extraction Rules

⚠️ **Hard Rules (Violations cause regeneration):**

1. **Only use content from input** - Never add inferred content
2. **Mark missing as "未提及"** - Never guess
3. **Apply semantic types** - Map visuals to design system types
4. **Modules ≤ 5** - Merge if necessary
5. **Nodes per module: 3-7** - Summarize if too many
6. **Labels ≤ 14 characters** - No symbols in labels
7. **Use typed connectors** - Map line styles to connector types

## Output Format

The extraction produces a YAML specification:

```yaml
meta:
  theme: tech-blue  # or academic for papers
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

## Examples

### From Flowchart Image

```
/drawio replicate
【领域】商业流程
【主题】tech-blue
[Upload expense approval flowchart]
请复刻这个费用审批流程图
```

### From Architecture Screenshot

```
/drawio replicate with tech-blue theme
【领域】软件架构
【语言】English
[Upload architecture diagram]
Recreate this microservices architecture with design system styling
```

### From Research Paper Figure

```
/drawio replicate with academic theme
【领域】科研流程
[Upload paper figure]
这是论文中的实验流程图，需要学术风格重绘以便投稿
```

## Troubleshooting

### Image too complex?
- Split into multiple diagrams (max 20-30 nodes each)
- Focus on one module at a time
- Use hierarchical layout for large structures

### Colors don't match original?
- Design system applies consistent theme colors
- Original colors are mapped to semantic types
- Use `--preserve-colors` to keep original palette (advanced)

### Shapes different from original?
- Design system maps to semantic shapes
- Explicit `type:` override available in spec
- Check semantic shape documentation

### Text labels truncated?
- Keep labels ≤ 14 characters
- Use abbreviations
- Move details to tooltips or annotations

## Related

- [Design System Overview](../docs/design-system/README.md)
- [Specification Format](../docs/design-system/specification.md)
- [Semantic Shapes](../docs/design-system/shapes.md)
- [Themes Reference](../docs/design-system/themes.md)
- [Academic Theme Guide](../docs/ieee-diagrams.md)

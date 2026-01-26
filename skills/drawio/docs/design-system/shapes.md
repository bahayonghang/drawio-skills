# Semantic Shapes

The Design System automatically maps semantic node types to appropriate draw.io shapes, ensuring consistent visual vocabulary across diagrams.

---

## Shape Mapping

### Automatic Detection

When a node's label or type matches certain keywords, the system automatically selects the appropriate shape:

| Semantic Type | Shape | mxCell Style | Keywords |
|---------------|-------|--------------|----------|
| `service` | Rounded Rectangle | `rounded=1` | service, api, component, microservice |
| `database` | Cylinder | `shape=cylinder3` | database, db, sql, storage, redis, mongo |
| `decision` | Diamond | `shape=rhombus` | decision, condition, if, check, gateway |
| `terminal` | Stadium/Pill | `rounded=1;arcSize=50` | start, begin, end, finish, stop |
| `queue` | Parallelogram | `shape=parallelogram` | queue, buffer, kafka, rabbitmq, stream |
| `user` | Circle/Ellipse | `ellipse` | user, actor, client, person |
| `document` | Document | `shape=document` | document, report, file, log |
| `formula` | Rectangle | `rounded=1` | formula, equation, $$, math |
| `process` | Rectangle | `rounded=1` | process, task, action, step |
| `cloud` | Cloud | `shape=cloud` | cloud, internet, external |
| `container` | Swimlane | `swimlane` | container, module, group, layer |

---

## Usage

### Explicit Type

Specify the semantic type directly in the specification:

```yaml
nodes:
  - id: db
    label: User Database
    type: database  # → Cylinder shape
```

### Auto-Detection

If no type is specified, the system analyzes the label:

```yaml
nodes:
  - id: db
    label: PostgreSQL Storage  # Contains "storage" → database type
```

Detection priority:
1. Explicit `type` field (highest)
2. Label keyword matching
3. Default to `service` (rounded rectangle)

---

## Shape Styles by Theme

Each theme defines colors for semantic shapes:

### Tech Blue

| Type | Fill | Stroke |
|------|------|--------|
| service | `#DBEAFE` | `#2563EB` |
| database | `#D1FAE5` | `#059669` |
| decision | `#FEF3C7` | `#D97706` |
| terminal | `#F1F5F9` | `#64748B` |
| queue | `#EDE9FE` | `#7C3AED` |
| user | `#E0F2FE` | `#0284C7` |
| document | `#FFFFFF` | `#CBD5E1` |
| formula | `#FFFFFF` | `#2563EB` |

### Academic

All shapes use white fill with black stroke for grayscale compatibility.

### Nature

| Type | Fill | Stroke |
|------|------|--------|
| service | `#D1FAE5` | `#059669` |
| database | `#ECFCCB` | `#84CC16` |
| decision | `#FEF9C3` | `#CA8A04` |

### Dark Mode

| Type | Fill | Stroke |
|------|------|--------|
| service | `#1E3A5F` | `#60A5FA` |
| database | `#064E3B` | `#34D399` |
| decision | `#713F12` | `#FBBF24` |

---

## Size Variants

Shapes support multiple size presets:

| Size | Width | Height | Usage |
|------|-------|--------|-------|
| `small` | 80px | 40px | Compact diagrams, icons |
| `medium` | 120px | 60px | **Default** |
| `large` | 160px | 80px | Emphasized nodes |
| `xl` | 200px | 100px | Major components |

```yaml
nodes:
  - id: main
    label: Main Service
    size: large  # 160×80 px
```

---

## mxCell Style Reference

### Rounded Rectangle (service)

```xml
<mxCell style="rounded=1;whiteSpace=wrap;html=1;arcSize=20;
  fillColor=#DBEAFE;strokeColor=#2563EB;strokeWidth=1.5;
  fontColor=#1E293B;fontSize=13;fontFamily=Inter;" />
```

### Cylinder (database)

```xml
<mxCell style="shape=cylinder3;whiteSpace=wrap;html=1;
  boundedLbl=1;backgroundOutline=1;size=15;
  fillColor=#D1FAE5;strokeColor=#059669;strokeWidth=1.5;
  fontColor=#1E293B;fontSize=13;" />
```

### Diamond (decision)

```xml
<mxCell style="rhombus;whiteSpace=wrap;html=1;
  fillColor=#FEF3C7;strokeColor=#D97706;strokeWidth=1.5;
  fontColor=#1E293B;fontSize=13;" />
```

### Stadium/Pill (terminal)

```xml
<mxCell style="rounded=1;whiteSpace=wrap;html=1;arcSize=50;
  fillColor=#F1F5F9;strokeColor=#64748B;strokeWidth=1.5;
  fontColor=#1E293B;fontSize=13;" />
```

### Parallelogram (queue)

```xml
<mxCell style="shape=parallelogram;perimeter=parallelogramPerimeter;
  whiteSpace=wrap;html=1;fixedSize=1;
  fillColor=#EDE9FE;strokeColor=#7C3AED;strokeWidth=1.5;" />
```

### Ellipse (user)

```xml
<mxCell style="ellipse;whiteSpace=wrap;html=1;
  fillColor=#E0F2FE;strokeColor=#0284C7;strokeWidth=1.5;
  fontColor=#1E293B;fontSize=13;" />
```

### Document

```xml
<mxCell style="shape=document;whiteSpace=wrap;html=1;
  boundedLbl=1;
  fillColor=#FFFFFF;strokeColor=#CBD5E1;strokeWidth=1.5;" />
```

### Cloud

```xml
<mxCell style="ellipse;shape=cloud;whiteSpace=wrap;html=1;
  fillColor=#F1F5F9;strokeColor=#64748B;strokeWidth=1.5;" />
```

---

## Custom Shapes

For shapes not covered by semantic types, use explicit style overrides:

```yaml
nodes:
  - id: custom
    label: Custom Node
    style:
      shape: hexagon
      fillColor: "#FEE2E2"
      strokeColor: "#DC2626"
```

Available shapes in draw.io:
- `rectangle`, `ellipse`, `rhombus`, `triangle`
- `hexagon`, `parallelogram`, `trapezoid`
- `cylinder3`, `cube`, `document`, `cloud`
- `step`, `tape`, `note`, `card`
- `actor`, `umlActor`, `folder`

---

## Cloud Provider Shapes

For cloud architecture diagrams, use icon references:

```yaml
nodes:
  - id: lambda
    label: Lambda Function
    icon: aws.lambda  # Uses mxgraph.aws4.lambda shape
```

See [icons.md](icons.md) for cloud provider icon references.

---

## Formula Shapes

Formula nodes have special styling to accommodate LaTeX rendering:

```yaml
nodes:
  - id: eq1
    label: "$$E = mc^2$$"
    type: formula
```

Style characteristics:
- White fill for readability
- Thin blue border
- Auto-sized based on formula complexity
- Serif font family for math notation

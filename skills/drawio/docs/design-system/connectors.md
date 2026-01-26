# Connectors

The Design System defines a semantic connector system with clear visual hierarchy for different relationship types.

---

## Connector Types

### Primary Flow

**Purpose**: Main process flow, critical paths

| Property | Value |
|----------|-------|
| Line | Solid, 2px |
| Arrow | Filled block |
| Color | Text color (`#1E293B` in Tech Blue) |

```yaml
edges:
  - from: a
    to: b
    type: primary
```

```xml
<mxCell style="endArrow=block;endFill=1;strokeWidth=2;
  strokeColor=#1E293B;" />
```

---

### Data Flow

**Purpose**: Data transmission, async communication, API calls

| Property | Value |
|----------|-------|
| Line | Dashed (6 4), 2px |
| Arrow | Filled block |
| Color | Text color |

```yaml
edges:
  - from: service
    to: database
    type: data
    label: Query
```

```xml
<mxCell style="endArrow=block;endFill=1;strokeWidth=2;
  dashed=1;dashPattern=6 4;strokeColor=#1E293B;" />
```

---

### Optional

**Purpose**: Weak relationships, optional paths, fallbacks

| Property | Value |
|----------|-------|
| Line | Dotted (2 2), 1px |
| Arrow | Open block |
| Color | Muted text (`#64748B`) |

```yaml
edges:
  - from: main
    to: fallback
    type: optional
```

```xml
<mxCell style="endArrow=open;endFill=0;strokeWidth=1;
  dashed=1;dashPattern=2 2;strokeColor=#64748B;" />
```

---

### Dependency

**Purpose**: Dependencies, constraints, composition

| Property | Value |
|----------|-------|
| Line | Solid, 1px |
| Arrow | Filled diamond |
| Color | Text color |

```yaml
edges:
  - from: component
    to: library
    type: dependency
```

```xml
<mxCell style="endArrow=diamond;endFill=1;strokeWidth=1;
  strokeColor=#1E293B;" />
```

---

### Bidirectional

**Purpose**: Associations, mutual relationships, two-way communication

| Property | Value |
|----------|-------|
| Line | Solid, 1.5px |
| Arrow | None (both ends) |
| Color | Muted text |

```yaml
edges:
  - from: serviceA
    to: serviceB
    type: bidirectional
```

```xml
<mxCell style="endArrow=none;startArrow=none;strokeWidth=1.5;
  strokeColor=#64748B;" />
```

---

## Arrow Types

| Type | Style | mxCell Value | Usage |
|------|-------|--------------|-------|
| Filled Block | ▶ | `endArrow=block;endFill=1` | Primary, data flow |
| Open Block | ▷ | `endArrow=open;endFill=0` | Optional flow |
| Filled Diamond | ◆ | `endArrow=diamond;endFill=1` | Composition |
| Open Diamond | ◇ | `endArrow=diamondThin;endFill=0` | Aggregation |
| Classic | → | `endArrow=classic` | Simple arrow |
| None | — | `endArrow=none` | Bidirectional |

---

## Routing Modes

The system selects routing algorithm based on diagram type:

### Orthogonal (Default)

Right-angle turns for technical diagrams.

```yaml
meta:
  routing: orthogonal
```

```xml
<mxCell style="edgeStyle=orthogonalEdgeStyle;rounded=0;
  jumpStyle=arc;jumpSize=8;" />
```

Features:
- Horizontal/vertical segments only
- Line jumps enabled for crossings
- Clean, professional appearance

---

### Rounded

Right-angle with rounded corners for flowcharts.

```yaml
meta:
  routing: rounded
```

```xml
<mxCell style="edgeStyle=orthogonalEdgeStyle;rounded=1;
  arcSize=8;" />
```

Features:
- Softer visual feel
- 8px corner radius
- Good for process flows

---

### Curved

Bezier curves for mind maps and organic layouts.

```yaml
meta:
  routing: curved
```

```xml
<mxCell style="edgeStyle=entityRelationEdgeStyle;curved=1;" />
```

Features:
- Natural, flowing lines
- Avoid sharp turns
- Good for concept maps

---

## Line Jumps

When connectors cross, jumps prevent ambiguity:

```xml
<mxCell style="jumpStyle=arc;jumpSize=8;" />
```

| Style | Appearance |
|-------|------------|
| `arc` | Small arc over crossing |
| `gap` | Gap in line |
| `sharp` | Sharp angle |
| `none` | No jump (lines cross) |

---

## Edge Labels

### Placement

```yaml
edges:
  - from: a
    to: b
    label: "Request"
    labelPosition: center  # center, start, end
```

### Styling

Labels use the theme's edge label settings:
- Font size: 10-11px
- Font weight: 400
- Color: Muted text

```xml
<mxCell style="edgeLabel;html=1;align=center;verticalAlign=middle;
  fontSize=11;fontColor=#64748B;" />
```

---

## Theme Variations

### Tech Blue

| Type | Stroke Color |
|------|--------------|
| primary | `#1E293B` |
| data | `#1E293B` |
| optional | `#64748B` |
| dependency | `#1E293B` |
| bidirectional | `#64748B` |

### Academic

All connectors use black (`#1E1E1E`) for print compatibility.

### Dark Mode

| Type | Stroke Color |
|------|--------------|
| primary | `#F1F5F9` |
| data | `#94A3B8` |
| optional | `#64748B` |
| dependency | `#94A3B8` |
| bidirectional | `#64748B` |

---

## Best Practices

### Visual Hierarchy

1. Use **primary** for main process flow (thickest)
2. Use **data** for data transmission (dashed)
3. Use **optional** for fallback paths (thin, dotted)
4. Use **dependency** sparingly for technical relationships

### Avoid Clutter

- Limit crossings; use jumps when unavoidable
- Group related connections
- Keep connector count below 30 per diagram

### Consistency

- Use same connector type for same relationship across diagram
- Don't mix routing styles within a diagram
- Match label style to connector importance

---

## Custom Connectors

For relationships not covered by built-in types:

```yaml
edges:
  - from: a
    to: b
    style:
      strokeColor: "#DC2626"
      strokeWidth: 3
      dashed: true
      dashPattern: "8 4 2 4"
      endArrow: classic
```

Available arrow types:
- `block`, `open`, `classic`, `oval`
- `diamond`, `diamondThin`
- `ERone`, `ERmany`, `ERoneToMany`
- `none`

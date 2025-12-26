# Draw.io XML Format Reference

## Table of Contents
- [mxfile Structure](#mxfile-structure)
- [mxCell Attributes](#mxcell-attributes)
- [Style Properties](#style-properties)
- [Common Shapes](#common-shapes)
- [Edge Styles](#edge-styles)
- [Colors and Formatting](#colors-and-formatting)

## mxfile Structure

```xml
<mxfile host="app.diagrams.net" modified="2024-01-01T00:00:00.000Z" version="22.0.0">
  <diagram name="Page-1" id="unique-diagram-id">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1"
                  tooltips="1" connect="1" arrows="1" fold="1"
                  page="1" pageScale="1" pageWidth="827" pageHeight="1169"
                  math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <!-- Visual elements start here -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

### mxGraphModel Attributes

| Attribute | Description |
|-----------|-------------|
| `dx`, `dy` | Canvas offset |
| `grid` | Show grid (1=yes, 0=no) |
| `gridSize` | Grid cell size in pixels |
| `guides` | Show alignment guides |
| `tooltips` | Enable tooltips |
| `connect` | Allow connections |
| `arrows` | Show arrow markers |
| `page` | Show page boundary |
| `pageWidth`, `pageHeight` | Page dimensions |

## mxCell Attributes

### Vertex (Shape)

```xml
<mxCell id="unique-id"
        value="Display Text"
        style="style-string"
        vertex="1"
        parent="1">
  <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
</mxCell>
```

| Attribute | Required | Description |
|-----------|----------|-------------|
| `id` | Yes | Unique identifier (start from "2") |
| `value` | No | Display text/label |
| `style` | No | Style properties string |
| `vertex` | Yes | Must be "1" for shapes |
| `parent` | Yes | Parent cell ID (usually "1") |

### Edge (Connection)

```xml
<mxCell id="unique-id"
        value=""
        style="edge-style-string"
        edge="1"
        parent="1"
        source="source-id"
        target="target-id">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

| Attribute | Required | Description |
|-----------|----------|-------------|
| `id` | Yes | Unique identifier |
| `edge` | Yes | Must be "1" for edges |
| `source` | Yes | Source cell ID |
| `target` | Yes | Target cell ID |
| `value` | No | Edge label text |

## Style Properties

Style is a semicolon-separated string of key=value pairs:

```
style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
```

### Common Style Properties

| Property | Values | Description |
|----------|--------|-------------|
| `rounded` | 0, 1 | Rounded corners |
| `whiteSpace` | wrap, nowrap | Text wrapping |
| `html` | 1 | Enable HTML in labels |
| `fillColor` | #hex | Background color |
| `strokeColor` | #hex | Border color |
| `strokeWidth` | number | Border thickness |
| `fontColor` | #hex | Text color |
| `fontSize` | number | Font size |
| `fontStyle` | 0,1,2,3 | 0=normal, 1=bold, 2=italic, 3=bold+italic |
| `align` | left, center, right | Horizontal text alignment |
| `verticalAlign` | top, middle, bottom | Vertical text alignment |
| `opacity` | 0-100 | Element transparency |
| `shadow` | 0, 1 | Drop shadow |
| `glass` | 0, 1 | Glass effect |
| `dashed` | 0, 1 | Dashed border |
| `dashPattern` | pattern | e.g., "8 8" |

## Common Shapes

### Basic Shapes

**Rectangle:**
```xml
<mxCell id="2" value="Rectangle" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
</mxCell>
```

**Rounded Rectangle:**
```xml
<mxCell id="3" value="Rounded" style="rounded=1;whiteSpace=wrap;html=1;arcSize=20;" vertex="1" parent="1">
  <mxGeometry x="100" y="200" width="120" height="60" as="geometry"/>
</mxCell>
```

**Ellipse/Circle:**
```xml
<mxCell id="4" value="Ellipse" style="ellipse;whiteSpace=wrap;html=1;" vertex="1" parent="1">
  <mxGeometry x="100" y="300" width="80" height="80" as="geometry"/>
</mxCell>
```

**Diamond/Rhombus:**
```xml
<mxCell id="5" value="Decision" style="rhombus;whiteSpace=wrap;html=1;" vertex="1" parent="1">
  <mxGeometry x="100" y="400" width="80" height="80" as="geometry"/>
</mxCell>
```

### Flowchart Shapes

**Process (Rectangle):**
```xml
style="rounded=0;whiteSpace=wrap;html=1;"
```

**Decision (Diamond):**
```xml
style="rhombus;whiteSpace=wrap;html=1;"
```

**Start/End (Stadium):**
```xml
style="rounded=1;whiteSpace=wrap;html=1;arcSize=50;"
```

**Document:**
```xml
style="shape=document;whiteSpace=wrap;html=1;boundedLbl=1;"
```

**Data (Parallelogram):**
```xml
style="shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fixedSize=1;"
```

**Database (Cylinder):**
```xml
style="shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;"
```

### Architecture Shapes

**Container/Group:**
```xml
style="rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;"
```

**Cloud:**
```xml
style="ellipse;shape=cloud;whiteSpace=wrap;html=1;"
```

**Server/Cube:**
```xml
style="shape=cube;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;darkOpacity=0.05;darkOpacity2=0.1;"
```

**Actor (UML):**
```xml
style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;"
```

## Edge Styles

### Arrow Types

| Style | Description |
|-------|-------------|
| `endArrow=classic` | Standard arrow |
| `endArrow=block` | Block arrow |
| `endArrow=open` | Open arrow |
| `endArrow=oval` | Oval end |
| `endArrow=diamond` | Diamond end |
| `endArrow=none` | No arrow |
| `startArrow=...` | Same options for start |

### Edge Routing

**Orthogonal (right-angle):**
```xml
style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;"
```

**Curved:**
```xml
style="edgeStyle=entityRelationEdgeStyle;curved=1;rounded=0;html=1;"
```

**Straight:**
```xml
style="edgeStyle=none;html=1;"
```

### Complete Edge Examples

**Standard Arrow:**
```xml
<mxCell id="e1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=classic;" edge="1" parent="1" source="2" target="3">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

**Dashed Line:**
```xml
<mxCell id="e2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;dashed=1;endArrow=none;" edge="1" parent="1" source="2" target="3">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

**Labeled Edge:**
```xml
<mxCell id="e3" value="Yes" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=classic;" edge="1" parent="1" source="5" target="6">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

## Colors and Formatting

### Standard Color Palette

| Color | Fill | Stroke |
|-------|------|--------|
| Blue | `#dae8fc` | `#6c8ebf` |
| Green | `#d5e8d4` | `#82b366` |
| Yellow | `#fff2cc` | `#d6b656` |
| Orange | `#ffe6cc` | `#d79b00` |
| Red | `#f8cecc` | `#b85450` |
| Purple | `#e1d5e7` | `#9673a6` |
| Gray | `#f5f5f5` | `#666666` |
| White | `#ffffff` | `#000000` |

### Color Usage Example

```xml
<mxCell id="2" value="Blue Box"
        style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontColor=#333333;"
        vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
</mxCell>
```

## ID Naming Convention

Recommend using descriptive IDs for easier editing:
- Shapes: `node-1`, `process-start`, `decision-1`
- Edges: `edge-1-2`, `flow-yes`, `connection-a-b`

**Important:** IDs must be unique within the diagram.

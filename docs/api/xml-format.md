# XML Format Reference

Technical reference for Draw.io XML format.

## Basic Structure

### Root Element

```xml
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <!-- Diagram content here -->
  </root>
</mxGraphModel>
```

## Cells (Vertices)

### Basic Rectangle

```xml
<mxCell id="2" value="Process" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
  <mxGeometry x="160" y="120" width="120" height="60" as="geometry"/>
</mxCell>
```

### Rounded Rectangle

```xml
<mxCell id="3" value="Start" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">
  <mxGeometry x="160" y="40" width="120" height="60" as="geometry"/>
</mxCell>
```

### Diamond (Decision)

```xml
<mxCell id="4" value="Decision?" style="diamond;whiteSpace=wrap;html=1;" vertex="1" parent="1">
  <mxGeometry x="160" y="200" width="120" height="80" as="geometry"/>
</mxCell>
```

## Styling

### Fill Color

```xml
<style>...fillColor=#dae8fc;...</style>
```

### Stroke Color

```xml
<style>...strokeColor=#6c8ebf;...</style>
```

### Font Styling

```xml
<style>...fontSize=14;fontStyle=1;...</style>
```

`fontStyle=1` = Bold
`fontStyle=2` = Italic

## Edges (Connections)

### Basic Arrow

```xml
<mxCell id="5" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="2" target="3">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

### Labeled Edge

```xml
<mxCell id="6" value="Yes" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="4" target="5">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

## Common Style Properties

### Shapes

- `rounded=0/1` - Rounded corners
- `ellipse=1` - Ellipse/circle
- `diamond=1` - Diamond shape
- `swimlane` - Swimlane container

### Alignment

- `align=left/center/right` - Horizontal alignment
- `verticalAlign=top/middle/bottom` - Vertical alignment

### Borders

- `strokeWidth=2` - Border thickness
- `dashed=1` - Dashed border

### Shadows

- `shadow=1` - Drop shadow effect

## Complete Example

```xml
<mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Start" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
      <mxGeometry x="160" y="40" width="120" height="60" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="Process" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
      <mxGeometry x="160" y="140" width="120" height="60" as="geometry"/>
    </mxCell>
    <mxCell id="4" value="End" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;" vertex="1" parent="1">
      <mxGeometry x="160" y="240" width="120" height="60" as="geometry"/>
    </mxCell>
    <mxCell id="5" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="2" target="3">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
    <mxCell id="6" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="3" target="4">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>
```

## Tips for Manual Editing

1. **Validate XML**: Ensure well-formed XML structure
2. **Unique IDs**: Every cell must have a unique ID
3. **Parent References**: Specify parent for hierarchical structures
4. **Geometry**: Always include geometry for vertices

## Learn More

- [Draw.io Documentation](https://www.diagrams.net/doc/faq/svg-export)
- [Examples](../examples/)

# Draw.io XML Format Reference

This document describes the XML format used by draw.io diagrams.

## Basic Structure

A draw.io diagram is represented as an XML document with the following structure:

```xml
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <!-- Diagram elements go here -->
  </root>
</mxGraphModel>
```

### Root Elements

- `<mxGraphModel>`: The root element of the diagram
- `<root>`: Contains all diagram cells
- `<mxCell id="0">`: The root cell (always present)
- `<mxCell id="1" parent="0">`: The default layer (always present)

## Cell Types

### Vertex (Node)

A vertex represents a shape or node in the diagram:

```xml
<mxCell id="2" value="My Node" style="rounded=1;fillColor=#dae8fc" vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
</mxCell>
```

**Attributes:**
- `id`: Unique identifier for the cell
- `value`: Text label displayed on the node
- `style`: Visual styling (see Style Properties below)
- `vertex="1"`: Indicates this is a vertex
- `parent`: ID of the parent cell (usually "1")

**Geometry:**
- `x`, `y`: Position coordinates
- `width`, `height`: Size dimensions

### Edge (Connection)

An edge represents a connection between two vertices:

```xml
<mxCell id="3" value="Connection" style="edgeStyle=orthogonalEdgeStyle;rounded=0" edge="1" parent="1" source="2" target="4">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

**Attributes:**
- `id`: Unique identifier for the cell
- `value`: Text label on the edge
- `style`: Visual styling
- `edge="1"`: Indicates this is an edge
- `source`: ID of the source vertex
- `target`: ID of the target vertex
- `parent`: ID of the parent cell (usually "1")

## Style Properties

Styles are defined as semicolon-separated key-value pairs:

```
property1=value1;property2=value2;property3=value3
```

### Common Style Properties

#### Shape and Appearance

- `shape`: Shape type (e.g., `rectangle`, `ellipse`, `rhombus`, `cylinder`, `cloud`)
- `rounded`: Rounded corners (0 or 1)
- `fillColor`: Background color (hex, e.g., `#dae8fc`)
- `strokeColor`: Border color (hex, e.g., `#6c8ebf`)
- `strokeWidth`: Border width (number)
- `dashed`: Dashed border (0 or 1)
- `dashPattern`: Dash pattern (e.g., `3 3`)

#### Text Styling

- `fontColor`: Text color (hex, e.g., `#000000`)
- `fontSize`: Font size (number)
- `fontFamily`: Font family (e.g., `Helvetica`)
- `fontStyle`: Font style (0=normal, 1=bold, 2=italic, 4=underline, combine with +)
- `align`: Horizontal alignment (`left`, `center`, `right`)
- `verticalAlign`: Vertical alignment (`top`, `middle`, `bottom`)

#### Edge Styling

- `edgeStyle`: Edge routing style (e.g., `orthogonalEdgeStyle`, `elbowEdgeStyle`)
- `curved`: Curved edge (0 or 1)
- `startArrow`: Start arrow type (e.g., `classic`, `block`, `diamond`)
- `endArrow`: End arrow type (e.g., `classic`, `block`, `diamond`)
- `startFill`: Fill start arrow (0 or 1)
- `endFill`: Fill end arrow (0 or 1)

#### Layout

- `horizontal`: Horizontal layout (0 or 1)
- `spacing`: Spacing between elements (number)
- `spacingTop`, `spacingBottom`, `spacingLeft`, `spacingRight`: Individual spacing

### Example Styles

**Rounded Rectangle with Blue Fill:**
```
rounded=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontColor=#000000
```

**Dashed Border:**
```
dashed=1;dashPattern=3 3;strokeColor=#b85450
```

**Bold Text:**
```
fontStyle=1;fontSize=14;fontColor=#000000
```

**Orthogonal Edge with Arrow:**
```
edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=classic
```

## Cloud Architecture Icons

### AWS Icons

AWS icons use the `shape=mxgraph.aws4.*` format:

```xml
<mxCell id="2" value="Lambda" style="sketch=0;points=[[0,0,0],[0.25,0,0],[0.5,0,0],[0.75,0,0],[1,0,0],[0,1,0],[0.25,1,0],[0.5,1,0],[0.75,1,0],[1,1,0],[0,0.25,0],[0,0.5,0],[0,0.75,0],[1,0.25,0],[1,0.5,0],[1,0.75,0]];outlineConnect=0;fontColor=#232F3E;gradientColor=#F78E04;gradientDirection=north;fillColor=#D05C17;strokeColor=#ffffff;dashed=0;verticalLabelPosition=bottom;verticalAlign=top;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.lambda;" vertex="1" parent="1">
  <mxGeometry x="200" y="100" width="78" height="78" as="geometry"/>
</mxCell>
```

**Common AWS Icons:**
- `mxgraph.aws4.lambda`: AWS Lambda
- `mxgraph.aws4.api_gateway`: API Gateway
- `mxgraph.aws4.dynamodb`: DynamoDB
- `mxgraph.aws4.s3`: S3
- `mxgraph.aws4.ec2`: EC2
- `mxgraph.aws4.rds`: RDS

### GCP Icons

GCP icons use the `shape=mxgraph.gcp2.*` format:

```xml
<mxCell id="2" value="Cloud Run" style="sketch=0;html=1;verticalAlign=top;labelPosition=center;verticalLabelPosition=bottom;align=center;spacingTop=-6;fontSize=11;fontStyle=1;fontColor=#999999;shape=mxgraph.gcp2.cloud_run;" vertex="1" parent="1">
  <mxGeometry x="200" y="100" width="75" height="75" as="geometry"/>
</mxCell>
```

**Common GCP Icons:**
- `mxgraph.gcp2.cloud_run`: Cloud Run
- `mxgraph.gcp2.cloud_sql`: Cloud SQL
- `mxgraph.gcp2.cloud_storage`: Cloud Storage
- `mxgraph.gcp2.compute_engine`: Compute Engine
- `mxgraph.gcp2.cloud_functions`: Cloud Functions

### Azure Icons

Azure icons use the `shape=mxgraph.azure.*` format:

```xml
<mxCell id="2" value="Functions" style="sketch=0;html=1;verticalAlign=top;labelPosition=center;verticalLabelPosition=bottom;align=center;spacingTop=-6;fontSize=11;fontStyle=1;fontColor=#999999;shape=mxgraph.azure.azure_functions;" vertex="1" parent="1">
  <mxGeometry x="200" y="100" width="75" height="75" as="geometry"/>
</mxCell>
```

**Common Azure Icons:**
- `mxgraph.azure.azure_functions`: Azure Functions
- `mxgraph.azure.sql_database`: SQL Database
- `mxgraph.azure.storage`: Storage
- `mxgraph.azure.virtual_machine`: Virtual Machine
- `mxgraph.azure.app_service`: App Service

## Animated Connectors

To create animated connectors, use the `flowAnimation` style property:

```xml
<mxCell id="3" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;flowAnimation=1" edge="1" parent="1" source="2" target="4">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

**Animation Properties:**
- `flowAnimation=1`: Enable flow animation
- `flowAnimationDirection`: Animation direction (`normal` or `reverse`)

## Complete Example

Here's a complete example of a simple flowchart:

```xml
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>

    <!-- Start Node -->
    <mxCell id="2" value="Start" style="rounded=1;fillColor=#d5e8d4;strokeColor=#82b366" vertex="1" parent="1">
      <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
    </mxCell>

    <!-- Process Node -->
    <mxCell id="3" value="Process" style="rounded=0;fillColor=#dae8fc;strokeColor=#6c8ebf" vertex="1" parent="1">
      <mxGeometry x="100" y="200" width="120" height="60" as="geometry"/>
    </mxCell>

    <!-- Decision Node -->
    <mxCell id="4" value="Decision?" style="rhombus;fillColor=#fff2cc;strokeColor=#d6b656" vertex="1" parent="1">
      <mxGeometry x="90" y="300" width="140" height="80" as="geometry"/>
    </mxCell>

    <!-- End Node -->
    <mxCell id="5" value="End" style="rounded=1;fillColor=#f8cecc;strokeColor=#b85450" vertex="1" parent="1">
      <mxGeometry x="100" y="420" width="120" height="60" as="geometry"/>
    </mxCell>

    <!-- Connections -->
    <mxCell id="6" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1" edge="1" parent="1" source="2" target="3">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>

    <mxCell id="7" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1" edge="1" parent="1" source="3" target="4">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>

    <mxCell id="8" value="Yes" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1" edge="1" parent="1" source="4" target="5">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>
```

## Tips

### ID Management

- IDs must be unique within the diagram
- Start with ID "2" (IDs "0" and "1" are reserved)
- Use sequential IDs for simplicity

### Positioning

- Use consistent spacing between elements (e.g., 100px)
- Center elements horizontally for better appearance
- Leave enough space for labels and connections

### Colors

Use consistent color schemes:
- **Green** (`#d5e8d4`): Start/success states
- **Blue** (`#dae8fc`): Process/action states
- **Yellow** (`#fff2cc`): Decision/warning states
- **Red** (`#f8cecc`): End/error states

### Edge Routing

- `orthogonalEdgeStyle`: Right-angle connections (most common)
- `elbowEdgeStyle`: Elbow-shaped connections
- `curved=1`: Smooth curved connections

## Resources

- [Draw.io Documentation](https://www.diagrams.net/doc/)
- [Draw.io GitHub](https://github.com/jgraph/drawio)
- [mxGraph Documentation](https://jgraph.github.io/mxgraph/)

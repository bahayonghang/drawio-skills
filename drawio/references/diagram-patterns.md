# Diagram Patterns Reference

## Table of Contents
- [Flowchart Patterns](#flowchart-patterns)
- [Architecture Diagram Patterns](#architecture-diagram-patterns)
- [Layout Guidelines](#layout-guidelines)

## Flowchart Patterns

### Simple Linear Flow

```
[Start] → [Process 1] → [Process 2] → [End]
```

```xml
<mxfile host="app.diagrams.net">
  <diagram name="Linear Flow" id="linear-1">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <!-- Start -->
        <mxCell id="start" value="Start" style="rounded=1;whiteSpace=wrap;html=1;arcSize=50;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
          <mxGeometry x="100" y="100" width="100" height="40" as="geometry"/>
        </mxCell>
        <!-- Process 1 -->
        <mxCell id="p1" value="Process 1" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="250" y="100" width="120" height="40" as="geometry"/>
        </mxCell>
        <!-- Process 2 -->
        <mxCell id="p2" value="Process 2" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="420" y="100" width="120" height="40" as="geometry"/>
        </mxCell>
        <!-- End -->
        <mxCell id="end" value="End" style="rounded=1;whiteSpace=wrap;html=1;arcSize=50;fillColor=#f8cecc;strokeColor=#b85450;" vertex="1" parent="1">
          <mxGeometry x="590" y="100" width="100" height="40" as="geometry"/>
        </mxCell>
        <!-- Edges -->
        <mxCell id="e1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;" edge="1" parent="1" source="start" target="p1">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="e2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;" edge="1" parent="1" source="p1" target="p2">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="e3" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;" edge="1" parent="1" source="p2" target="end">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

### Decision Branch Flow

```
[Start] → [Check] → Yes → [Action A] → [End]
              ↓
             No → [Action B] ↗
```

```xml
<mxfile host="app.diagrams.net">
  <diagram name="Decision Flow" id="decision-1">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <!-- Start -->
        <mxCell id="start" value="Start" style="rounded=1;whiteSpace=wrap;html=1;arcSize=50;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
          <mxGeometry x="100" y="150" width="100" height="40" as="geometry"/>
        </mxCell>
        <!-- Decision -->
        <mxCell id="decision" value="Condition?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1">
          <mxGeometry x="250" y="130" width="80" height="80" as="geometry"/>
        </mxCell>
        <!-- Action A (Yes path) -->
        <mxCell id="actionA" value="Action A" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="400" y="80" width="120" height="40" as="geometry"/>
        </mxCell>
        <!-- Action B (No path) -->
        <mxCell id="actionB" value="Action B" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="400" y="220" width="120" height="40" as="geometry"/>
        </mxCell>
        <!-- End -->
        <mxCell id="end" value="End" style="rounded=1;whiteSpace=wrap;html=1;arcSize=50;fillColor=#f8cecc;strokeColor=#b85450;" vertex="1" parent="1">
          <mxGeometry x="600" y="150" width="100" height="40" as="geometry"/>
        </mxCell>
        <!-- Edges -->
        <mxCell id="e1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;" edge="1" parent="1" source="start" target="decision">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="e2" value="Yes" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;" edge="1" parent="1" source="decision" target="actionA">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="e3" value="No" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;" edge="1" parent="1" source="decision" target="actionB">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="e4" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;" edge="1" parent="1" source="actionA" target="end">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="e5" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;" edge="1" parent="1" source="actionB" target="end">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

### Loop Pattern

```
[Start] → [Process] → [Check] → Yes → (back to Process)
                          ↓
                         No → [End]
```

Key: Use edge waypoints for loop-back arrows.

## Architecture Diagram Patterns

### Three-Tier Architecture

```
┌─────────────────────────────────────┐
│          Presentation Layer         │
│   [Web App]    [Mobile App]         │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│           Business Layer            │
│      [API Gateway] → [Services]     │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│             Data Layer              │
│    [Database]    [Cache]            │
└─────────────────────────────────────┘
```

```xml
<mxfile host="app.diagrams.net">
  <diagram name="Three Tier" id="arch-1">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <!-- Presentation Layer Container -->
        <mxCell id="layer1" value="Presentation Layer" style="rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="100" y="50" width="400" height="100" as="geometry"/>
        </mxCell>
        <mxCell id="webapp" value="Web App" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="130" y="80" width="100" height="50" as="geometry"/>
        </mxCell>
        <mxCell id="mobile" value="Mobile App" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="260" y="80" width="100" height="50" as="geometry"/>
        </mxCell>
        <!-- Business Layer Container -->
        <mxCell id="layer2" value="Business Layer" style="rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="100" y="180" width="400" height="100" as="geometry"/>
        </mxCell>
        <mxCell id="api" value="API Gateway" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
          <mxGeometry x="130" y="210" width="100" height="50" as="geometry"/>
        </mxCell>
        <mxCell id="services" value="Services" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
          <mxGeometry x="260" y="210" width="100" height="50" as="geometry"/>
        </mxCell>
        <!-- Data Layer Container -->
        <mxCell id="layer3" value="Data Layer" style="rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;verticalAlign=top;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="100" y="310" width="400" height="100" as="geometry"/>
        </mxCell>
        <mxCell id="db" value="Database" style="shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#ffe6cc;strokeColor=#d79b00;" vertex="1" parent="1">
          <mxGeometry x="130" y="340" width="80" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="cache" value="Cache" style="shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#f8cecc;strokeColor=#b85450;" vertex="1" parent="1">
          <mxGeometry x="240" y="340" width="80" height="60" as="geometry"/>
        </mxCell>
        <!-- Connections -->
        <mxCell id="c1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;startArrow=classic;startFill=1;" edge="1" parent="1" source="webapp" target="api">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="c2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;" edge="1" parent="1" source="api" target="services">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="c3" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;startArrow=classic;startFill=1;" edge="1" parent="1" source="services" target="db">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

### Microservices Pattern

```
[Client] → [API Gateway] → [Service A]
                        → [Service B]
                        → [Service C]
              ↓
         [Message Queue] ←→ [Services]
              ↓
         [Database per Service]
```

### Cloud Architecture Pattern

Use cloud-specific shapes:
- Cloud shape for external services
- Cylinder for databases
- Rectangle groups for VPCs/subnets
- Dashed containers for logical grouping

## Layout Guidelines

### Spacing

| Element | Recommended Spacing |
|---------|---------------------|
| Between shapes | 50-100px |
| Between layers | 80-120px |
| Container padding | 20-30px |
| Edge labels | Centered on edge |

### Standard Sizes

| Element | Width | Height |
|---------|-------|--------|
| Process box | 120px | 40-60px |
| Decision diamond | 80px | 80px |
| Start/End terminal | 100px | 40px |
| Container | 400px+ | Variable |
| Database cylinder | 80px | 60px |

### Alignment Tips

1. **Horizontal flows**: Align shapes vertically (same y-coordinate)
2. **Vertical flows**: Align shapes horizontally (same x-coordinate)
3. **Grids**: Use gridSize=10 for easy alignment
4. **Centering**: Calculate center positions based on container width

### Color Coding Suggestions

| Purpose | Fill Color | Stroke Color |
|---------|------------|--------------|
| Start/Success | `#d5e8d4` | `#82b366` |
| End/Error | `#f8cecc` | `#b85450` |
| Decision | `#fff2cc` | `#d6b656` |
| Process | `#dae8fc` | `#6c8ebf` |
| Data/Storage | `#ffe6cc` | `#d79b00` |
| External | `#e1d5e7` | `#9673a6` |
| Container | `none` | `#666666` (dashed) |

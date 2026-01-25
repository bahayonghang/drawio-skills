# Style Presets (Draw.io Style Strings)

Use these copy-paste style string presets to make diagrams look consistent and professional. They work both for:

- generating draw.io XML (`style="..."` on a cell), and
- updating cells via `edit_diagram`.

## Palette (Default)

- Primary fill: `#dae8fc`
- Primary stroke: `#6c8ebf`
- Success fill: `#d5e8d4`
- Success stroke: `#82b366`
- Warning fill: `#fff2cc`
- Warning stroke: `#d6b656`
- Container fill: `#f5f5f5`
- Container stroke: `#999999`

## Nodes

### Primary (Service / Component)

```
rounded=1;html=1;whiteSpace=wrap;align=left;verticalAlign=middle;
fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=14;fontColor=#000000;
spacingLeft=10;spacingRight=10;spacingTop=6;spacingBottom=6
```

### Success (Data / Result)

```
rounded=1;html=1;whiteSpace=wrap;align=left;verticalAlign=middle;
fillColor=#d5e8d4;strokeColor=#82b366;fontSize=14;fontColor=#000000;
spacingLeft=10;spacingRight=10;spacingTop=6;spacingBottom=6
```

### Warning (Note / Constraint)

```
rounded=1;html=1;whiteSpace=wrap;align=left;verticalAlign=middle;
fillColor=#fff2cc;strokeColor=#d6b656;fontSize=13;fontColor=#000000;
spacingLeft=10;spacingRight=10;spacingTop=6;spacingBottom=6
```

### Formula (MathJax-Friendly)

```
rounded=1;html=1;whiteSpace=wrap;align=left;verticalAlign=middle;
fillColor=#ffffff;strokeColor=#6c8ebf;fontSize=16;fontColor=#000000;
spacingLeft=12;spacingRight=12;spacingTop=8;spacingBottom=8
```

## Containers

### Zone / Boundary (VPC / Subnet / Module)

```
rounded=0;html=1;whiteSpace=wrap;align=left;verticalAlign=top;
fillColor=#f5f5f5;strokeColor=#999999;fontSize=12;fontColor=#333333;
spacingLeft=12;spacingRight=12;spacingTop=10;spacingBottom=10
```

## Edges

### Main Flow (Orthogonal)

```
edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;
endArrow=block;endFill=1;strokeColor=#333333;strokeWidth=2;html=1
```

### Data Flow (Dashed)

```
edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;
endArrow=block;endFill=1;strokeColor=#333333;strokeWidth=2;dashed=1;dashPattern=6 4;html=1
```

## Quick Layout Rules

- Keep widths consistent within the same layer.
- Use even spacing (roughly 40–80px between nodes).
- Prefer orthogonal connectors and avoid crossings.


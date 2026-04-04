# Style Presets

This file is a **local supplement**, not the full draw.io style dictionary.

Use these presets when you need a small set of copy-paste style strings for quick patches or hand-authored XML. For the full upstream catalog of shape types, style properties, color semantics, and HTML label rules, read:

- [Official Style Reference Mirror](../official/style-reference.md)
- [Official XML Reference Mirror](../official/xml-reference.md)

For normal skill usage, prefer the design system over raw style strings:

- [Design System Overview](design-system/README.md)
- [Themes](design-system/themes.md)
- [Shapes](design-system/shapes.md)
- [Connectors](design-system/connectors.md)

## Local Usage Rules

- Keep a limited palette (3-4 colors) unless the source diagram explicitly needs more.
- Use `html=1` for rich text and MathJax labels.
- Prefer orthogonal connectors for technical architecture diagrams.
- When patching existing XML, only use these presets as short helpers; do not treat them as the authoritative style vocabulary.

## Presets: Nodes

### Service / Component

```
rounded=1;html=1;whiteSpace=wrap;align=left;verticalAlign=middle;
fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=14;fontColor=#000000;
spacingLeft=10;spacingRight=10;spacingTop=6;spacingBottom=6
```

### Data / Result

```
rounded=1;html=1;whiteSpace=wrap;align=left;verticalAlign=middle;
fillColor=#d5e8d4;strokeColor=#82b366;fontSize=14;fontColor=#000000;
spacingLeft=10;spacingRight=10;spacingTop=6;spacingBottom=6
```

### Note / Constraint

```
rounded=1;html=1;whiteSpace=wrap;align=left;verticalAlign=middle;
fillColor=#fff2cc;strokeColor=#d6b656;fontSize=13;fontColor=#000000;
spacingLeft=10;spacingRight=10;spacingTop=6;spacingBottom=6
```

### Formula

```
rounded=1;html=1;whiteSpace=wrap;align=left;verticalAlign=middle;
fillColor=#ffffff;strokeColor=#6c8ebf;fontSize=16;fontColor=#000000;
spacingLeft=12;spacingRight=12;spacingTop=8;spacingBottom=8
```

## Presets: Containers

### Zone / Boundary

```
rounded=0;html=1;whiteSpace=wrap;align=left;verticalAlign=top;
fillColor=#f5f5f5;strokeColor=#999999;fontSize=12;fontColor=#333333;
spacingLeft=12;spacingRight=12;spacingTop=10;spacingBottom=10
```

### Dashed Boundary

```
rounded=0;html=1;whiteSpace=wrap;align=left;verticalAlign=top;
fillColor=#f5f5f5;strokeColor=#999999;dashed=1;dashPattern=4 4;
fontSize=12;fontColor=#333333;spacingLeft=12;spacingRight=12;spacingTop=10;spacingBottom=10
```

## Presets: Edges

### Main Flow

```
edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;
endArrow=block;endFill=1;strokeColor=#333333;strokeWidth=2;html=1
```

### Data Flow

```
edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;
endArrow=block;endFill=1;strokeColor=#333333;strokeWidth=2;dashed=1;dashPattern=6 4;html=1
```

### Dependency

```
edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;
endArrow=block;endFill=1;strokeColor=#666666;strokeWidth=1;html=1
```

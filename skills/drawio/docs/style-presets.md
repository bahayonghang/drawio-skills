# Style Presets (Draw.io Style Strings)

> ⚠️ **DEPRECATED**: This file is deprecated. Please use the new **Design System** documentation instead:
> - [Design System Overview](design-system/README.md)
> - [Design Tokens](design-system/tokens.md)
> - [Themes](design-system/themes.md)
> - [Shapes](design-system/shapes.md)
> - [Connectors](design-system/connectors.md)
>
> The new design system provides unified theming, semantic shapes, and typed connectors.

---

*Legacy content preserved for reference:*

This reference provides copy-paste style string presets for consistent, professional-looking diagrams. Use these presets when generating draw.io XML or when updating cells via `edit_diagram`.

## General Rules

- Keep a limited palette (3–4 colors).
- Use `html=1` for rich text and MathJax labels.
- Prefer left-aligned text for long labels and formulas.
- Prefer orthogonal connectors for technical architecture diagrams.

## Color Palette (Default)

- Primary fill: `#dae8fc` (light blue)
- Primary stroke: `#6c8ebf` (blue)
- Success fill: `#d5e8d4` (light green)
- Success stroke: `#82b366` (green)
- Warning fill: `#fff2cc` (light yellow)
- Warning stroke: `#d6b656` (yellow)
- Neutral container fill: `#f5f5f5` (light gray)
- Neutral container stroke: `#999999` (gray)

## Presets: Nodes

### Node: Primary (Service/Component)

```
rounded=1;html=1;whiteSpace=wrap;align=left;verticalAlign=middle;
fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=14;fontColor=#000000;
spacingLeft=10;spacingRight=10;spacingTop=6;spacingBottom=6
```

### Node: Success (Data/Result)

```
rounded=1;html=1;whiteSpace=wrap;align=left;verticalAlign=middle;
fillColor=#d5e8d4;strokeColor=#82b366;fontSize=14;fontColor=#000000;
spacingLeft=10;spacingRight=10;spacingTop=6;spacingBottom=6
```

### Node: Warning (Note/Constraint)

```
rounded=1;html=1;whiteSpace=wrap;align=left;verticalAlign=middle;
fillColor=#fff2cc;strokeColor=#d6b656;fontSize=13;fontColor=#000000;
spacingLeft=10;spacingRight=10;spacingTop=6;spacingBottom=6
```

### Node: Formula (MathJax-Friendly)

```
rounded=1;html=1;whiteSpace=wrap;align=left;verticalAlign=middle;
fillColor=#ffffff;strokeColor=#6c8ebf;fontSize=16;fontColor=#000000;
spacingLeft=12;spacingRight=12;spacingTop=8;spacingBottom=8
```

## Presets: Containers

### Container: Zone / Boundary (VPC / Subnet / Module)

```
rounded=0;html=1;whiteSpace=wrap;align=left;verticalAlign=top;
fillColor=#f5f5f5;strokeColor=#999999;fontSize=12;fontColor=#333333;
spacingLeft=12;spacingRight=12;spacingTop=10;spacingBottom=10
```

### Container: Dashed Boundary (Optional)

```
rounded=0;html=1;whiteSpace=wrap;align=left;verticalAlign=top;
fillColor=#f5f5f5;strokeColor=#999999;dashed=1;dashPattern=4 4;
fontSize=12;fontColor=#333333;spacingLeft=12;spacingRight=12;spacingTop=10;spacingBottom=10
```

## Presets: Edges (Connectors)

### Edge: Main Flow (Orthogonal, Arrow)

```
edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;
endArrow=block;endFill=1;strokeColor=#333333;strokeWidth=2;html=1
```

### Edge: Data Flow (Dashed)

```
edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;
endArrow=block;endFill=1;strokeColor=#333333;strokeWidth=2;dashed=1;dashPattern=6 4;html=1
```

### Edge: Dependency (Thin)

```
edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;
endArrow=block;endFill=1;strokeColor=#666666;strokeWidth=1;html=1
```

## Tips for Layout Quality

- Keep node widths consistent within the same layer.
- Keep 40–80px spacing between nodes.
- Avoid edge crossings; prefer routing around containers.
- When exporting, enable crop to remove whitespace.


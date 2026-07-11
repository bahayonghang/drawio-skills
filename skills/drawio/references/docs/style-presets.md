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

## Theme × Diagram-Type Fit

Distilled from the fireworks `style-diagram-matrix` after triage. Covers the four
fireworks-derived themes ported into `assets/themes/` plus the closest existing
themes. Pick by diagram type; avoid the **Poor** combinations.

| Theme (`--theme`) | Register | Best for | Avoid (Poor) |
|---|---|---|---|
| `tech-blue` (default) | Light, cool | Architecture, flowchart, data flow, general | — |
| `notion-clean` | Light, grayscale minimal | Class/ER, sequence, use-case, comparison tables, Notion/wiki embeds | — |
| `blueprint` | Dark navy, cyan, sharp | Formal architecture, UML (class/sequence/state), network topology, data flow | Mind map, comparison tables (grid fights radial/tabular layout) |
| `dark-terminal` | Near-black, neon, monospace | Dev-blog architecture, agent/memory systems, network topology, data flow | Use-case (stick figures wash out on dark) |
| `dark-luxury` | Pure-black, champagne gold | Premium/editorial architecture, agent systems, mind map, network, keynote heroes | Comparison tables, use-case, standard UML (dark bg non-standard) |
| `arch-dark` | Dark slate, multicolor | Cloud/service architecture (existing house dark theme) | — |
| `nature` | Light, green | Warm/organic light docs | — |
| `high-contrast` | Accessibility | Any diagram needing max legibility | — |

Notes:

- **Academic policy is unchanged.** Academic/paper figures still default to the
  `academic` / `academic-color` themes (SimSun + Times CJK stack, IEEE conventions).
  The themes above target product/architecture/dev-doc contexts and do not override
  academic overlay selection.
- **Glassmorphism, Flat Icon, Claude Official, OpenAI Official were not ported** —
  see `.trellis/tasks/07-11-fw-style-presets/research/style-triage.md` for the
  token-level rationale (overlap or non-portable gradients/blur/rgba).
- Dark themes rely on solid color tokens only; source SVG gradients, glow/blur
  filters and drop-shadows are intentionally dropped (recorded in the triage).

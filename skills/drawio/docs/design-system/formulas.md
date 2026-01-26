# Formula Integration

The Design System provides best practices for integrating LaTeX and mathematical formulas into draw.io diagrams.

---

## Overview

Draw.io supports MathJax rendering for LaTeX formulas. The Design System defines consistent styling and placement rules for formula nodes.

**Requirements**:
- Enable `Extras > Mathematical Typesetting` in draw.io
- Use proper delimiters for formula content

---

## Delimiter Syntax

### Inline Formulas

For formulas within text, use `\(...\)` delimiters:

```yaml
nodes:
  - id: n1
    label: "Linear: \\(y = mx + b\\)"
```

Renders as: "Linear: $y = mx + b$"

### Block Formulas

For standalone formulas, use `$$...$$` delimiters:

```yaml
nodes:
  - id: eq1
    label: "$$\\sum_{i=1}^{n} x_i$$"
    type: formula
```

### AsciiMath

For simpler notation, use backticks:

```yaml
nodes:
  - id: n2
    label: "`sum_(i=1)^n x_i`"
```

---

## Formula Node Styling

Formula nodes use special styling for readability:

| Property | Value | Reason |
|----------|-------|--------|
| Fill | White | Clean background for formulas |
| Stroke | Primary blue | Visual distinction |
| Stroke Width | 1px | Thin border, focus on content |
| Font | Serif (Latin Modern) | Mathematical typography |
| Padding | 8-16px | Space around formula |

### Theme Styles

**Tech Blue**:
```json
{
  "fillColor": "#FFFFFF",
  "strokeColor": "#2563EB",
  "strokeWidth": 1
}
```

**Academic**:
```json
{
  "fillColor": "#FFFFFF",
  "strokeColor": "#1E1E1E",
  "strokeWidth": 1
}
```

**Dark Mode**:
```json
{
  "fillColor": "#1E293B",
  "strokeColor": "#60A5FA",
  "strokeWidth": 1
}
```

---

## Placement Strategies

### Inline in Node Label

Best for: Simple formulas as part of explanation

```yaml
nodes:
  - id: loss
    label: "Loss Function: \\(L = -\\sum y \\log(\\hat{y})\\)"
    type: process
```

### Dedicated Formula Node

Best for: Important equations, theorems, definitions

```yaml
nodes:
  - id: theorem
    label: "$$E = mc^2$$"
    type: formula
    size: medium
```

### Formula Sequence

For derivations, create connected formula nodes:

```yaml
nodes:
  - id: step1
    label: "$$f(x) = x^2 + 2x + 1$$"
    type: formula
  - id: step2
    label: "$$f(x) = (x + 1)^2$$"
    type: formula

edges:
  - from: step1
    to: step2
    type: primary
    label: "Factor"
```

---

## Sizing Guidelines

Formula node sizes depend on content complexity:

| Complexity | Size | Example |
|------------|------|---------|
| Simple | 100×50 | `x^2 + y^2` |
| Medium | 140×60 | `\sum_{i=1}^n x_i` |
| Complex | 180×80 | Multi-line equations |
| Very Complex | 220×100 | Matrices, systems |

### Auto-sizing

The system estimates size based on formula length:
- Characters < 10: Small
- Characters 10-25: Medium
- Characters 25-50: Large
- Characters > 50: XL or manual

---

## Common Formula Patterns

### Greek Letters

```latex
\alpha, \beta, \gamma, \delta, \epsilon
\theta, \lambda, \mu, \sigma, \omega
```

### Subscripts & Superscripts

```latex
x_i, x_{i,j}, x^2, x^{n+1}
```

### Fractions

```latex
\frac{a}{b}, \frac{dy}{dx}
```

### Sums & Products

```latex
\sum_{i=1}^{n} x_i
\prod_{j=1}^{m} y_j
```

### Integrals

```latex
\int_0^{\infty} e^{-x} dx
```

### Matrices

```latex
\begin{pmatrix} a & b \\ c & d \end{pmatrix}
```

---

## Academic Diagram Example

For IEEE-style research diagrams:

```yaml
meta:
  theme: academic
  layout: vertical

nodes:
  - id: input
    label: "Input: \\(X \\in \\mathbb{R}^{n \\times d}\\)"
    type: terminal
    
  - id: layer1
    label: "$$H_1 = \\sigma(W_1 X + b_1)$$"
    type: formula
    
  - id: layer2
    label: "$$H_2 = \\sigma(W_2 H_1 + b_2)$$"
    type: formula
    
  - id: output
    label: "Output: \\(\\hat{Y} = \\text{softmax}(H_2)\\)"
    type: terminal

edges:
  - from: input
    to: layer1
    type: primary
  - from: layer1
    to: layer2
    type: primary
  - from: layer2
    to: output
    type: primary
```

---

## Troubleshooting

### Formula Not Rendering

1. Check MathJax is enabled: `Extras > Mathematical Typesetting`
2. Verify delimiter syntax: `\(...\)` or `$$...$$`
3. Escape backslashes in YAML: `\\sum` not `\sum`

### Formula Cut Off

- Increase node size
- Check padding settings
- Use block formula instead of inline

### Wrong Font

- Ensure theme uses serif formula font
- Check custom style overrides

### Dark Mode Issues

- Formula background may need explicit white fill
- MathJax renders in black by default

---

## Best Practices

### Clarity

- One main equation per formula node
- Use inline formulas for variables in text
- Break complex derivations into steps

### Consistency

- Same delimiter style throughout diagram
- Consistent symbol usage (e.g., always $x_i$ not $x_j$)
- Match formula style to theme

### Readability

- Adequate node size for formula
- Sufficient padding (8-16px)
- High contrast (white background for formulas)

### Academic Standards

- Follow journal notation conventions
- Use standard mathematical symbols
- Provide equation numbers for reference

---

## XML Reference

Formula node in draw.io XML:

```xml
<mxCell value="$$\sum_{i=1}^{n} x_i$$" 
  style="rounded=1;whiteSpace=wrap;html=1;
  fillColor=#FFFFFF;strokeColor=#2563EB;strokeWidth=1;
  fontFamily=Latin Modern;fontSize=13;
  verticalAlign=middle;align=center;"
  vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="140" height="60" as="geometry"/>
</mxCell>
```

Key style properties:
- `html=1`: Enable HTML/MathJax rendering
- `whiteSpace=wrap`: Allow text wrapping
- `fillColor=#FFFFFF`: White background
- `fontFamily=Latin Modern`: Serif math font

# Formula Integration

Use this file for formula-node styling, placement, and sizing inside the Draw.io design system.

Syntax rules and troubleshooting live in `../math-typesetting.md`. Treat that file as the source of truth for:

- `$$...$$` vs `\(...\)` vs `` `...` ``
- mixed inline LaTeX and AsciiMath
- unsupported forms such as `$...$` and `\[...\]`
- MathJax toggling, YAML escaping, XML escaping, and export details

## Placement Strategy

### Inline in a Standard Node Label

Use inline LaTeX when the label is mostly prose and the formula is only part of the sentence.

```yaml
nodes:
  - id: loss
    label: "Loss Function: \\(L = -\\sum y \\log(\\hat{y})\\)"
    type: process
```

Best for:

- variable annotations
- short equations inside a pipeline step
- labels such as input/output tensor shapes

### Dedicated Formula Node

Use a `formula` node when the label is primarily an equation.

```yaml
nodes:
  - id: theorem
    label: "$$E = mc^2$$"
    type: formula
    size: medium
```

Best for:

- loss functions
- update rules
- theorem statements
- important definitions

### Formula Sequence

Break derivations into several connected formula nodes instead of one oversized label.

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

## Formula Node Styling

Formula nodes prioritize readability over visual decoration.

| Property | Value | Reason |
|----------|-------|--------|
| Fill | White by default | Keep formulas easy to scan |
| Stroke | Theme primary or grayscale academic stroke | Preserve semantic grouping |
| Stroke Width | 1px | Keep border subtle |
| Padding | 8-16px | Avoid clipping and crowding |
| Alignment | Center by default | Works best for standalone equations |

### Theme Examples

**Tech Blue**

```json
{
  "fillColor": "#FFFFFF",
  "strokeColor": "#2563EB",
  "strokeWidth": 1
}
```

**Academic**

```json
{
  "fillColor": "#FFFFFF",
  "strokeColor": "#1E1E1E",
  "strokeWidth": 1
}
```

**Dark Mode**

```json
{
  "fillColor": "#1E293B",
  "strokeColor": "#60A5FA",
  "strokeWidth": 1
}
```

For dark themes, verify rendered math contrast manually. MathJax output often benefits from a light fill even when the rest of the diagram is dark.

## Sizing Guidelines

Choose node size based on rendered complexity, not only source length.

| Complexity | Suggested Size | Typical Content |
|------------|----------------|-----------------|
| Simple | 100x50 | `x^2 + y^2` |
| Medium | 140x60 | `\sum_{i=1}^{n} x_i` |
| Complex | 180x80 | long fractions, long summations |
| Very Complex | 220x100 | matrices, multi-part expressions |

### Auto-sizing Heuristic

- Characters < 10: small
- Characters 10-25: medium
- Characters 25-50: large
- Characters > 50: XL or manual sizing

Always resize after preview when the formula contains fractions, matrices, or nested superscripts/subscripts.

## Best Practices

### Clarity

- Put one main equation in each formula node.
- Use inline formulas for short variable mentions inside prose.
- Split long derivations into multiple nodes.

### Consistency

- Use the same notation across the whole diagram.
- Match symbols to the surrounding paper, slide deck, or specification.
- Keep formula-bearing nodes visually consistent within the same module or stage.

### Readability

- Prefer white or high-contrast fills for formula nodes.
- Leave enough padding around the rendered expression.
- Avoid squeezing block math into narrow process nodes.

## Academic Example

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
```

## XML Styling Reference

```xml
<mxCell value="$$\sum_{i=1}^{n} x_i$$"
  style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#2563EB;strokeWidth=1;verticalAlign=middle;align=center;"
  vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="140" height="60" as="geometry"/>
</mxCell>
```

Key style properties:

- `html=1` to allow MathJax rendering inside the cell
- `whiteSpace=wrap` to avoid truncation
- centered alignment for dedicated formula nodes
- conservative stroke styling so the equation remains the focal point

# Math Typesetting (LaTeX / AsciiMath) in Draw.io

Use this file as the syntax source of truth for formulas in draw.io labels and text shapes.

> Source: <https://www.drawio.com/doc/faq/math-typesetting>
> Related design guidance: `design-system/formulas.md`

## Official Delimiter Rules

Draw.io uses MathJax for mathematical typesetting. Math is recognized only when wrapped in explicit delimiters.

| Syntax | Use It For | Example |
|--------|------------|---------|
| `$$...$$` | Standalone equations, dedicated formula nodes, labels that are entirely math | `$$E = mc^2$$` |
| `\(...\)` | Inline math inside a longer sentence or label | `Output: \(y = f(x)\)` |
| `` `...` `` | Simple AsciiMath expressions | `` `sum_(i=1)^n x_i` `` |

### Rule of Thumb

- Use `$$...$$` only when the label is essentially a formula block.
- Use `\(...\)` for sentence-level inline math.
- Use `` `...` `` only for simple AsciiMath or when the user explicitly asks for AsciiMath.

### Minimal Examples

```yaml
nodes:
  - id: inline
    label: "Linear: \\(y = mx + b\\)"

  - id: block
    label: "$$\\sum_{i=1}^{n} x_i$$"
    type: formula

  - id: asciimath
    label: "`sum_(i=1)^n x_i`"
```

## Mixed Labels

Inline LaTeX and AsciiMath may appear in the same label. Keep each formula wrapped independently.

```yaml
nodes:
  - id: mixed
    label: "Score: \\(x_i^2\\), baseline: `x^2`"
```

Prefer `\(...\)` over `` `...` `` when the expression already uses LaTeX commands or must match the paper notation.

## Unsupported or Discouraged Output

Do not generate these forms in final skill output:

```text
\frac{a}{b}          # bare LaTeX
\alpha + \beta       # bare LaTeX
$x^2 + y^2$          # discouraged single-dollar inline syntax
\[x^2 + y^2\]        # discouraged bracket block syntax
```

Use these instead:

```text
\(\frac{a}{b}\)
\(\alpha + \beta\)
\(x^2 + y^2\)
$$x^2 + y^2$$
```

Notes:

- The skill should not emit bare LaTeX, `$...$`, or `\[...\]`.
- The current math helpers normalize `$...$` to `\(...\)` and `\[...\]` to `$$...$$` when encountered in imported text, but final emitted labels should still use the three supported syntaxes only.

## Required UI Setting

Enable this in draw.io before previewing or editing formulas:

`Extras > Mathematical Typesetting`

When the toggle is enabled, draw.io renders the label through MathJax. Disable it temporarily to inspect the raw source.

## YAML Writing Rules

In YAML, escape backslashes inside quoted strings:

```yaml
nodes:
  - id: input
    label: "Input: \\(X \\in \\mathbb{R}^{n \\times d}\\)"

  - id: loss
    label: "$$\\mathcal{L} = -\\sum_{i=1}^{n} y_i \\log(\\hat{y}_i)$$"
    type: formula
```

Checklist:

- Write `\\(` and `\\)` in YAML strings when using inline LaTeX.
- Keep `$$` unchanged in YAML strings.
- Escape every LaTeX backslash inside the YAML string.

## XML `value` Attribute Rules

Equations are stored in the `value` attribute of `mxCell` nodes and edge labels.

Keep the math delimiters inside `value="..."` and escape XML attribute characters:

- `&` -> `&amp;`
- `<` -> `&lt;`
- `>` -> `&gt;`
- `"` -> `&quot;`

Avoid hidden HTML formatting tags in math labels.

### Inline XML Example

```xml
<mxCell id="2" value="Model: \(y = Wx + b\)" style="rounded=1;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf" vertex="1" parent="1">
  <mxGeometry x="120" y="120" width="220" height="70" as="geometry"/>
</mxCell>
```

### Block XML Example

```xml
<mxCell id="3" value="$$\mathcal{L} = \sum_i (y_i-\hat y_i)^2$$" style="rounded=1;html=1;fillColor=#d5e8d4;strokeColor=#82b366" vertex="1" parent="1">
  <mxGeometry x="120" y="220" width="320" height="90" as="geometry"/>
</mxCell>
```

## Export Rules

- Default math output is SVG-based.
- For exported PDF files where selectable math matters, use `math-output=html`.
- Vector export remains preferred for academic figures: PDF or SVG.

## Validation Checklist

Before finalizing any diagram with formulas, verify:

- Every formula uses one of: `$$...$$`, `\(...\)`, or `` `...` ``.
- `$$...$$` is reserved for standalone equations, not sentence-level inline text.
- No bare backslash commands remain in labels.
- No `$...$` or `\[...\]` remains in emitted YAML/XML.
- `Extras > Mathematical Typesetting` is enabled before visual inspection.
- YAML strings escape LaTeX backslashes correctly.
- XML `value` content is HTML-free and XML-escaped.

## Troubleshooting

### Math does not render

1. Enable `Extras > Mathematical Typesetting`.
2. Check that the label uses `$$...$$`, `\(...\)`, or `` `...` ``.
3. Click `</>` in the toolbar and remove hidden HTML tags if present.

### Formula overflows or gets clipped

- Increase the shape size.
- In the Style panel, under Property -> Text Overflow, try `Block` or `Width`.
- Prefer a dedicated formula node instead of forcing long block math into a small process node.

### Exported PDF has extra whitespace

- Keep formula nodes away from the diagram boundary.
- Use left or right alignment for formula labels when appropriate.

## LaTeX Quick Reference

### Greek Letters

| Symbol | Code | Symbol | Code |
|--------|------|--------|------|
| α | `\alpha` | Γ | `\Gamma` |
| β | `\beta` | Δ | `\Delta` |
| γ | `\gamma` | Θ | `\Theta` |
| λ | `\lambda` | Σ | `\Sigma` |
| μ | `\mu` | Φ | `\Phi` |
| π | `\pi` | Ω | `\Omega` |

### Common Operators

```latex
\times
\div
\pm
\leq
\geq
\neq
\approx
\infty
\partial
\nabla
\rightarrow
\Rightarrow
```

### Fractions, Powers, Sums

```latex
\frac{a}{b}
\sqrt{x}
\sqrt[n]{x}
x^{n}
x_{i}
\sum_{i=1}^{n} x_i
\prod_{i=1}^{n} x_i
\int_{a}^{b} f(x) \, dx
\lim_{x \to \infty} f(x)
```

### Matrices and Sets

```latex
\begin{bmatrix} a & b \\ c & d \end{bmatrix}
\begin{pmatrix} x \\ y \\ z \end{pmatrix}
\mathbb{R}
\mathbb{N}
\mathbb{Z}
\mathbb{C}
\mathcal{L}
```

## Academic Diagram Notes

When formulas appear in paper figures:

- Keep equation labels concise.
- Use the same notation as the surrounding manuscript.
- Define symbols in the caption or legend when needed.
- For grayscale print, do not rely on color alone to distinguish formula-bearing nodes.

### Example Academic Labels

```yaml
nodes:
  - id: input
    label: "Input: \\(x \\in \\mathbb{R}^d\\)"
    type: terminal

  - id: model
    label: "Model: \\(y = Wx + b\\)"
    type: process

  - id: loss
    label: "$$\\mathcal{L} = -\\sum_{i=1}^{n} y_i \\log(\\hat{y}_i)$$"
    type: formula
```

### Recommended Export Workflow

1. Draft the diagram with official formula delimiters only.
2. Enable `Extras > Mathematical Typesetting`.
3. Verify inline labels use `\(...\)` and standalone formulas use `$$...$$`.
4. Export as PDF or SVG.
5. For selectable math in PDF, use `math-output=html`.

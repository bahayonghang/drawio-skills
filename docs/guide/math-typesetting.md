# Math Typesetting (LaTeX / AsciiMath)

Draw.io can render mathematical equations inside shape labels and text using MathJax.

> **Official Reference**: https://www.drawio.com/doc/faq/math-typesetting

## Supported Input Syntax

Put your equation directly in the label text:

- **AsciiMath (inline)**: wrap with backticks
  - Example: `` `a^2+b^2=c^2` ``
- **LaTeX (block)**: wrap with `$$`
  - Example: `$$\sqrt{3×-1}+(1+x)^2$$`
- **LaTeX (inline)**: wrap with `\(` and `\)`
  - Example: `\(\sqrt{3×-1}+(1+x)^2\)`
- **Mixing**: you can mix inline LaTeX and AsciiMath in the same label.

## Enable Rendering

In draw.io, enable:

`Extras > Mathematical Typesetting`

When enabled, draw.io renders the equations with MathJax. Disable the same option to edit the raw LaTeX/AsciiMath source.

## LaTeX Quick Reference

### Greek Letters

| Lowercase | Code | Uppercase | Code |
|-----------|------|-----------|------|
| α | `\alpha` | Γ | `\Gamma` |
| β | `\beta` | Δ | `\Delta` |
| γ | `\gamma` | Θ | `\Theta` |
| δ | `\delta` | Λ | `\Lambda` |
| ε | `\epsilon` | Π | `\Pi` |
| θ | `\theta` | Σ | `\Sigma` |
| λ | `\lambda` | Φ | `\Phi` |
| μ | `\mu` | Ω | `\Omega` |
| π | `\pi` | | |
| σ | `\sigma` | | |
| φ | `\phi` | | |
| ω | `\omega` | | |

### Common Operators

| Symbol | Code | Symbol | Code |
|--------|------|--------|------|
| × | `\times` | ± | `\pm` |
| ÷ | `\div` | ∞ | `\infty` |
| ≤ | `\leq` | ∂ | `\partial` |
| ≥ | `\geq` | ∇ | `\nabla` |
| ≠ | `\neq` | → | `\rightarrow` |
| ≈ | `\approx` | ⇒ | `\Rightarrow` |
| ∈ | `\in` | ∀ | `\forall` |
| ⊂ | `\subset` | ∃ | `\exists` |

### Math Structures

```latex
\frac{a}{b}              % Fraction
\sqrt{x}                 % Square root
\sqrt[n]{x}              % nth root
x^{n}                    % Superscript
x_{i}                    % Subscript
\sum_{i=1}^{n} x_i       % Summation
\prod_{i=1}^{n} x_i      % Product
\int_{a}^{b} f(x) dx     % Integral
\lim_{x \to \infty}      % Limit
```

### Matrices and Vectors

```latex
\begin{bmatrix} a & b \\ c & d \end{bmatrix}   % Matrix
\begin{pmatrix} x \\ y \end{pmatrix}           % Column vector
\vec{v}                                         % Vector arrow
\mathbf{A}                                      % Bold matrix
\hat{x}                                         % Unit vector
```

### Special Fonts

```latex
\mathbb{R}        % Real numbers ℝ
\mathbb{N}        % Natural numbers ℕ
\mathcal{L}       % Calligraphic (Loss, Lagrangian)
\mathcal{F}       % Fourier transform
```

## Prompt Examples

### Inline equations in labels

```
Create a diagram with a node labeled:
Linear model: \(y = Wx + b\)
Make the label left-aligned and readable.
```

### Block equations (bigger formulas)

```
Create a diagram with a node labeled:
$$\mathcal{L}=\sum_i (y_i-\hat y_i)^2$$
Resize the node so the equation is not clipped.
```

### IEEE Paper: Neural Network Architecture

```
Create an IEEE-style block diagram for a CNN:
1) Input: \(x \in \mathbb{R}^{H \times W \times C}\)
2) Conv: \(f = \sigma(W * x + b)\)
3) Pooling: \(\text{MaxPool}_{2 \times 2}\)
4) FC: \(y = \text{softmax}(Wh + b)\)
Use grayscale-compatible styling (black borders, white fill).
Add caption: "Fig. 1. Architecture of the proposed model."
```

### IEEE Paper: Control System

```
Create a feedback control system for IEEE paper:
- Reference: \(r(t)\)
- Error: \(e(t) = r(t) - y(t)\)
- PID: \(u = K_p e + K_i \int e \, dt + K_d \frac{de}{dt}\)
- Plant: \(G(s) = \frac{K}{s(Ts+1)}\)
Include feedback loop. Caption: "Fig. 2. PID control system."
```

## IEEE / Academic Publication Guidelines

### Figure Standards

- **Figure number**: Use "Fig. N." format (e.g., "Fig. 1.")
- **Caption**: Sentence case, period at end, placed below figure
- **Font size**: Match journal requirements (typically 8-10pt)

### Grayscale Compatibility

Academic papers often print in B&W:

- Use black borders with white/light gray fills
- Avoid color-only encoding
- Use line styles (solid, dashed, dotted) for differentiation
- Test by exporting to grayscale PDF

### Export for LaTeX Integration

1. **Format**: PDF or SVG (vector quality)
2. **Math output**: Use `math-output=html` for selectable math
3. **Crop**: Enable to remove excess whitespace
4. **Resolution**: ≥300 DPI for rasterized elements

### Common IEEE Domain Formulas

#### Machine Learning

```latex
$$\mathcal{L} = \frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2$$     % MSE
$$\text{softmax}(z_i) = \frac{e^{z_i}}{\sum_{j} e^{z_j}}$$          % Softmax
$$\theta_{t+1} = \theta_t - \eta \nabla_\theta \mathcal{L}$$        % SGD
```

#### Signal Processing

```latex
$$X(f) = \int_{-\infty}^{\infty} x(t) e^{-j2\pi ft} dt$$            % Fourier
$$H(s) = \frac{Y(s)}{X(s)}$$                                        % Transfer function
```

#### Communications

```latex
$$C = B \log_2\left(1 + \frac{S}{N}\right)$$                        % Shannon capacity
```

### Journal-Specific Notes

| Journal | Math Format | Figure Format |
|---------|-------------|---------------|
| IEEE Transactions | LaTeX | EPS/PDF |
| ACM | LaTeX | PDF/PNG |
| Elsevier | LaTeX/MathML | TIFF/EPS/PDF |
| Springer | LaTeX | EPS/PDF |
| Nature | LaTeX | PDF/AI/EPS |

## Export Notes

By default, math output uses SVG. If you need selectable math symbols in an exported PDF, you can use the URL parameter:

`math-output=html`

## XML Label Safety

If you are generating raw draw.io XML (instead of typing directly in the editor):

- Escape XML attribute characters inside `value="..."`
  - `&` → `&amp;`
  - `<` → `&lt;`
  - `>` → `&gt;`
  - `"` → `&quot;`
- Avoid inserting HTML tags into the label text.
- Keep math delimiters paired (backticks, `$$`, `\(` and `\)`).

## Troubleshooting

### Math is not rendered

- Make sure `Extras > Mathematical Typesetting` is enabled.
- If it still fails, the label may include hidden HTML formatting tags. Select the text, click `</>` in the toolbar, delete extra tags, then re-enable Mathematical Typesetting.

### Clipping or whitespace during export

- Set Text Overflow to `Block` or `Width` (sometimes `Hidden`) and resize the shape.
- Use left or right alignment and keep formula shapes away from diagram edges.

## IEEE Submission Checklist

- [ ] All equations use LaTeX format
- [ ] Figure has proper caption: "Fig. N. Description."
- [ ] Legend explains all symbols
- [ ] Grayscale compatibility verified
- [ ] Vector format (PDF/SVG) used
- [ ] Font size matches journal requirements

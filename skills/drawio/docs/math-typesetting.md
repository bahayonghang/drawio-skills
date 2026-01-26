# Math Typesetting (LaTeX / AsciiMath) in Draw.io

This reference explains how to place mathematical equations in draw.io labels and text shapes.

> **Source**: https://www.drawio.com/doc/faq/math-typesetting

## ⚠️ MANDATORY: Delimiter Requirements

**CRITICAL**: All mathematical expressions MUST be wrapped in appropriate delimiters. Draw.io uses MathJax which requires explicit delimiters to recognize and render math.

### Required Delimiter Format

| Type | Delimiter | When to Use | Example |
|------|-----------|-------------|---------|
| **Block LaTeX** | `$$...$$` | Standalone equations, primary formulas | `$$E = mc^2$$` |
| **Inline LaTeX** | `\(...\)` | Equations within text labels | `Output: \(y = f(x)\)` |
| **AsciiMath** | `` `...` `` | Simple expressions | `` `x^2 + y^2` `` |

### ❌ Common Mistakes (NEVER do this)

```
❌ \frac{a}{b}           → Missing delimiters!
❌ \alpha + \beta        → Missing delimiters!
❌ x^2 + y^2             → Missing delimiters!
❌ E = mc^2              → Missing delimiters!
❌ \sum_{i=1}^n x_i      → Missing delimiters!
```

### ✅ Correct Format (ALWAYS do this)

```
✅ $$\frac{a}{b}$$
✅ \(\alpha + \beta\)
✅ $$x^2 + y^2$$
✅ $$E = mc^2$$
✅ $$\sum_{i=1}^{n} x_i$$
```

### Validation Checklist

Before finalizing any diagram with math, verify:

- [ ] Every LaTeX command (`\frac`, `\sqrt`, `\sum`, `\int`, `\lim`, etc.) is inside `$$` or `\(...\)`
- [ ] Greek letters (`\alpha`, `\beta`, `\gamma`, etc.) are delimited
- [ ] Superscripts (`^`) and subscripts (`_`) in math context are delimited
- [ ] Special fonts (`\mathbb`, `\mathcal`, `\text`) are delimited
- [ ] Matrix environments (`\begin{bmatrix}...`) are delimited
- [ ] No bare backslash commands exist in any label text

## Supported Syntax

Enter the equation directly in a text shape (or any label) using one of these delimiters:

- **AsciiMath (inline)**: wrap with a single backtick
  - Example: `` `a^2+b^2=c^2` ``
- **LaTeX (block)**: wrap with `$$`
  - Example: `$$\sqrt{3×-1}+(1+x)^2$$`
- **LaTeX (inline)**: wrap with `\(` and `\)`
  - Example: `\(\sqrt{3×-1}+(1+x)^2\)`
- **Mixing**: you can mix inline LaTeX and AsciiMath in the same text.

## LaTeX Quick Reference

### Greek Letters

| Lowercase | Code | Uppercase | Code |
|-----------|------|-----------|------|
| α | `\alpha` | Α | `A` |
| β | `\beta` | Β | `B` |
| γ | `\gamma` | Γ | `\Gamma` |
| δ | `\delta` | Δ | `\Delta` |
| ε | `\epsilon` | Ε | `E` |
| θ | `\theta` | Θ | `\Theta` |
| λ | `\lambda` | Λ | `\Lambda` |
| μ | `\mu` | Μ | `M` |
| π | `\pi` | Π | `\Pi` |
| σ | `\sigma` | Σ | `\Sigma` |
| φ | `\phi` | Φ | `\Phi` |
| ω | `\omega` | Ω | `\Omega` |

### Common Math Operators

| Symbol | Code | Description |
|--------|------|-------------|
| × | `\times` | Multiplication |
| ÷ | `\div` | Division |
| ± | `\pm` | Plus-minus |
| ≤ | `\leq` | Less than or equal |
| ≥ | `\geq` | Greater than or equal |
| ≠ | `\neq` | Not equal |
| ≈ | `\approx` | Approximately |
| ∈ | `\in` | Element of |
| ⊂ | `\subset` | Subset |
| ∪ | `\cup` | Union |
| ∩ | `\cap` | Intersection |
| ∞ | `\infty` | Infinity |
| ∂ | `\partial` | Partial derivative |
| ∇ | `\nabla` | Nabla/gradient |
| → | `\rightarrow` | Right arrow |
| ⇒ | `\Rightarrow` | Implies |
| ∀ | `\forall` | For all |
| ∃ | `\exists` | Exists |

### Fractions, Roots, and Powers

```latex
\frac{a}{b}           % Fraction: a/b
\sqrt{x}              % Square root
\sqrt[n]{x}           % nth root
x^{n}                 % Superscript (power)
x_{i}                 % Subscript
x_{i}^{n}             % Combined sub/superscript
```

### Summation, Product, Integral, Limit

```latex
\sum_{i=1}^{n} x_i              % Summation
\prod_{i=1}^{n} x_i             % Product
\int_{a}^{b} f(x) \, dx         % Definite integral
\iint_{D} f(x,y) \, dA          % Double integral
\oint_{C} \vec{F} \cdot d\vec{r} % Line integral
\lim_{x \to \infty} f(x)        % Limit
```

### Matrices and Vectors

```latex
\begin{bmatrix} a & b \\ c & d \end{bmatrix}   % Matrix with brackets
\begin{pmatrix} x \\ y \\ z \end{pmatrix}      % Column vector with parentheses
\vec{v}                                         % Vector notation
\mathbf{A}                                      % Bold matrix notation
\hat{x}                                         % Unit vector
```

### Special Fonts

```latex
\mathbb{R}        % Real numbers ℝ
\mathbb{N}        % Natural numbers ℕ
\mathbb{Z}        % Integers ℤ
\mathbb{C}        % Complex numbers ℂ
\mathcal{L}       % Calligraphic (e.g., Lagrangian, Loss)
\mathcal{F}       % Fourier transform
\mathscr{H}       % Script (Hamiltonian)
```

### Common IEEE/Academic Formulas

#### Machine Learning

```latex
% Loss function (MSE)
$$\mathcal{L} = \frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2$$

% Cross-entropy loss
$$\mathcal{L} = -\sum_{i=1}^{n} y_i \log(\hat{y}_i)$$

% Softmax
$$\text{softmax}(z_i) = \frac{e^{z_i}}{\sum_{j=1}^{K} e^{z_j}}$$

% Gradient descent
$$\theta_{t+1} = \theta_t - \eta \nabla_\theta \mathcal{L}(\theta_t)$$
```

#### Signal Processing

```latex
% Fourier Transform
$$X(f) = \int_{-\infty}^{\infty} x(t) e^{-j2\pi ft} \, dt$$

% Convolution
$$(f * g)(t) = \int_{-\infty}^{\infty} f(\tau) g(t-\tau) \, d\tau$$

% Transfer function
$$H(s) = \frac{Y(s)}{X(s)} = \frac{b_0 + b_1 s + \cdots}{a_0 + a_1 s + \cdots}$$
```

#### Control Systems

```latex
% PID Controller
$$u(t) = K_p e(t) + K_i \int_0^t e(\tau) d\tau + K_d \frac{de(t)}{dt}$$

% State-space representation
$$\dot{x} = Ax + Bu, \quad y = Cx + Du$$
```

#### Statistics & Probability

```latex
% Normal distribution
$$f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$

% Bayes' theorem
$$P(A|B) = \frac{P(B|A) P(A)}{P(B)}$$

% Expectation
$$\mathbb{E}[X] = \sum_{i} x_i P(x_i)$$
```

#### Neural Networks

```latex
% Forward propagation
$$a^{[l]} = \sigma(W^{[l]} a^{[l-1]} + b^{[l]})$$

% Attention mechanism
$$\text{Attention}(Q,K,V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

% Batch normalization
$$\hat{x}_i = \frac{x_i - \mu_B}{\sqrt{\sigma_B^2 + \epsilon}}$$
```

## Enable Rendering

In draw.io, enable:

`Extras > Mathematical Typesetting`

When enabled, draw.io uses MathJax to render the equation. Disable the same option to see/edit the raw LaTeX/AsciiMath source.

## Using Equations in Diagram XML

Equations are stored in the `value` attribute of cells (nodes or edges). The important parts:

- Put the equation delimiters inside `value="..."`.
- Avoid inserting extra HTML tags into the label content.
- Escape XML attribute characters inside `value`:
  - `&` → `&amp;`
  - `<` → `&lt;`
  - `>` → `&gt;`
  - `"` → `&quot;`

### Example: node label with inline LaTeX

```xml
<mxCell id="2" value="Model: \(y=Wx+b\)" style="rounded=1;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf" vertex="1" parent="1">
  <mxGeometry x="120" y="120" width="220" height="70" as="geometry"/>
</mxCell>
```

### Example: node label with block LaTeX

```xml
<mxCell id="3" value="$$\mathcal{L}=\sum_i (y_i-\hat y_i)^2$$" style="rounded=1;html=1;fillColor=#d5e8d4;strokeColor=#82b366" vertex="1" parent="1">
  <mxGeometry x="120" y="220" width="320" height="90" as="geometry"/>
</mxCell>
```

## Export Behavior

- Default math output is **SVG**.
- You can use a URL parameter to switch to HTML output:
  - `math-output=html`
  - This setting allows you to select most maths symbols in an exported PDF file.

## Troubleshooting

### Math overflows or looks clipped

- In the Style panel, under Property → Text Overflow, set one of:
  - `Block` or `Width` (sometimes `Hidden`)
- Resize the shape to match the rendered math output.

### Exported images/PDF have extra whitespace

- Use left or right text alignment for formula labels.
- Keep formula shapes away from the diagram edges.

### Math is not rendered

If equations do not render correctly, the text may include hidden HTML formatting tags:

1. Select the text, then click `</>` in the toolbar to reveal hidden HTML tags.
2. Delete extra HTML tags.
3. Re-enable `Extras > Mathematical Typesetting`.

## IEEE / Academic Publication Guidelines

### Figure Labeling Standards

For IEEE, ACM, and other academic journals, follow these conventions:

```
Fig. 1. Block diagram of the proposed neural network architecture.
```

- **Figure number**: Use "Fig." followed by Arabic numeral (1, 2, 3...)
- **Caption**: Sentence case, period at end, placed below the figure
- **Font**: Match journal requirements (typically 8-10pt Times New Roman)

### Math in Figure Labels

When including equations in diagram labels for academic papers:

1. **Keep equations concise**: Use variable names rather than full expressions when possible
2. **Define variables**: Include a legend or caption explaining all symbols
3. **Consistency**: Use the same notation throughout the paper and diagrams

#### Example: Block Diagram with Equations

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Input       │     │     Model       │     │     Output      │
│  \(x \in R^d\)  │ ──▶ │  \(y = Wx + b\) │ ──▶ │   \(\hat{y}\)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Black & White Compatibility

Academic papers often print in grayscale. Ensure:

- **No color-only encoding**: Don't rely solely on colors to convey meaning
- **High contrast**: Black text on white background (or vice versa)
- **Pattern differentiation**: Use line styles (solid, dashed, dotted) instead of colors
- **Test**: Export to grayscale PDF and verify readability

### Export Settings for IEEE Papers

1. **Format**: PDF or SVG (vector formats preserve quality)
2. **Resolution**: At least 300 DPI for any rasterized elements
3. **Crop**: Enable "Crop" to remove excess whitespace
4. **Background**: Usually white (uncheck "Transparent Background")
5. **Math output**: Use `math-output=html` for selectable text in PDF

### Common IEEE Domain Formulas

#### Communications & Information Theory

```latex
% Shannon capacity
$$C = B \log_2\left(1 + \frac{S}{N}\right)$$

% Bit error rate (BPSK)
$$P_b = Q\left(\sqrt{\frac{2E_b}{N_0}}\right)$$

% MIMO capacity
$$C = \log_2\det\left(\mathbf{I} + \frac{\text{SNR}}{n_t}\mathbf{H}\mathbf{H}^H\right)$$
```

#### Power Systems & Electronics

```latex
% Power equation
$$P = VI\cos\theta = I^2 R = \frac{V^2}{R}$$

% Three-phase power
$$P_{3\phi} = \sqrt{3} V_L I_L \cos\theta$$

% Transfer function (Buck converter)
$$G_{vd}(s) = \frac{\hat{v}_o}{\hat{d}} = V_g \frac{1}{1 + sL/R + s^2 LC}$$
```

#### Computer Vision & Image Processing

```latex
% Convolution operation
$$(I * K)(x,y) = \sum_i \sum_j I(x-i, y-j) K(i,j)$$

% IoU (Intersection over Union)
$$\text{IoU} = \frac{|A \cap B|}{|A \cup B|}$$

% PSNR
$$\text{PSNR} = 10 \log_{10}\left(\frac{\text{MAX}^2}{\text{MSE}}\right)$$
```

#### Robotics & Control

```latex
% Forward kinematics
$$T_n^0 = \prod_{i=1}^{n} T_i^{i-1}$$

% Jacobian
$$\dot{x} = J(q)\dot{q}$$

% LQR cost function
$$J = \int_0^\infty (x^T Q x + u^T R u) \, dt$$
```

### Journal-Specific Notes

| Journal | Math Format | Figure Format | Notes |
|---------|-------------|---------------|-------|
| IEEE Transactions | LaTeX preferred | EPS/PDF | Use IEEE templates |
| ACM | LaTeX preferred | PDF/PNG | Follow ACM style guide |
| Elsevier | LaTeX/MathML | TIFF/EPS/PDF | Check journal guidelines |
| Springer | LaTeX preferred | EPS/PDF | Use svjour3 class |
| Nature | LaTeX | PDF/AI/EPS | Simple, clean equations |

### Recommended Workflow for Academic Diagrams

1. **Design** diagram in draw.io with LaTeX labels
2. **Enable** `Extras > Mathematical Typesetting` to preview
3. **Verify** all equations render correctly
4. **Export** as PDF with `math-output=html` for selectable math
5. **Check** grayscale compatibility
6. **Add** proper figure caption in your LaTeX/Word document


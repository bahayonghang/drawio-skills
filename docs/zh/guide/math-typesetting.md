# 数学公式排版（LaTeX / AsciiMath）

Draw.io 支持在图形的文字与标签中渲染数学公式，底层使用 MathJax。

> **官方文档**: https://www.drawio.com/doc/faq/math-typesetting

## 支持的输入语法

直接在形状文本/标签里输入公式，并使用对应分隔符：

- **AsciiMath（行内）**：使用反引号包裹
  - 示例：`` `a^2+b^2=c^2` ``
- **LaTeX（块级）**：使用 `$$` 包裹
  - 示例：`$$\sqrt{3×-1}+(1+x)^2$$`
- **LaTeX（行内）**：使用 `\(` 与 `\)` 包裹
  - 示例：`\(\sqrt{3×-1}+(1+x)^2\)`
- **混用**：同一段文本中可混用行内 LaTeX 与 AsciiMath。

## 如何启用渲染

在 draw.io 菜单中启用：

`Extras > Mathematical Typesetting`

启用后会用 MathJax 渲染公式；关闭后可看到/编辑原始 LaTeX/AsciiMath 文本。

## LaTeX 快速参考

### 希腊字母

| 小写 | 代码 | 大写 | 代码 |
|------|------|------|------|
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

### 常用运算符

| 符号 | 代码 | 符号 | 代码 |
|------|------|------|------|
| × | `\times` | ± | `\pm` |
| ÷ | `\div` | ∞ | `\infty` |
| ≤ | `\leq` | ∂ | `\partial` |
| ≥ | `\geq` | ∇ | `\nabla` |
| ≠ | `\neq` | → | `\rightarrow` |
| ≈ | `\approx` | ⇒ | `\Rightarrow` |
| ∈ | `\in` | ∀ | `\forall` |
| ⊂ | `\subset` | ∃ | `\exists` |

### 数学结构

```latex
\frac{a}{b}              % 分数
\sqrt{x}                 % 平方根
\sqrt[n]{x}              % n次根
x^{n}                    % 上标（幂）
x_{i}                    % 下标
\sum_{i=1}^{n} x_i       % 求和
\prod_{i=1}^{n} x_i      % 连乘
\int_{a}^{b} f(x) dx     % 积分
\lim_{x \to \infty}      % 极限
```

### 矩阵与向量

```latex
\begin{bmatrix} a & b \\ c & d \end{bmatrix}   % 矩阵
\begin{pmatrix} x \\ y \end{pmatrix}           % 列向量
\vec{v}                                         % 向量箭头
\mathbf{A}                                      % 粗体矩阵
\hat{x}                                         % 单位向量
```

### 特殊字体

```latex
\mathbb{R}        % 实数集 ℝ
\mathbb{N}        % 自然数集 ℕ
\mathcal{L}       % 花体（损失函数、拉格朗日量）
\mathcal{F}       % 傅里叶变换
```

## Prompt 示例

### 行内公式（适合说明性文字）

```
创建一个节点，标签为：
线性模型：\(y = Wx + b\)
并把文字左对齐，保证可读性。
```

### 块级公式（适合较长表达式）

```
创建一个节点，标签为：
$$\mathcal{L}=\sum_i (y_i-\hat y_i)^2$$
调整节点尺寸，避免公式被裁切。
```

### IEEE 论文：神经网络架构图

```
创建一个 IEEE 风格的 CNN 架构框图：
1) 输入层：\(x \in \mathbb{R}^{H \times W \times C}\)
2) 卷积层：\(f = \sigma(W * x + b)\)
3) 池化层：\(\text{MaxPool}_{2 \times 2}\)
4) 全连接层：\(y = \text{softmax}(Wh + b)\)
使用灰度兼容样式（黑色边框，白色填充）。
添加标题："Fig. 1. Architecture of the proposed model."
```

### IEEE 论文：控制系统框图

```
创建一个 IEEE 论文用的反馈控制系统图：
- 参考输入：\(r(t)\)
- 误差信号：\(e(t) = r(t) - y(t)\)
- PID 控制器：\(u = K_p e + K_i \int e \, dt + K_d \frac{de}{dt}\)
- 被控对象：\(G(s) = \frac{K}{s(Ts+1)}\)
包含反馈回路。标题："Fig. 2. PID control system."
```

## IEEE / 学术论文发表指南

### 图表规范

- **图号格式**：使用 "Fig. N." 格式（如 "Fig. 1."）
- **标题**：句首大写，句末加句号，置于图下方
- **字体大小**：符合期刊要求（通常 8-10pt）

### 灰度兼容性

学术论文常以黑白印刷：

- 使用黑色边框配白色/浅灰填充
- 避免仅用颜色区分信息
- 使用线型（实线、虚线、点线）进行区分
- 导出灰度 PDF 进行测试

### LaTeX 集成导出

1. **格式**：PDF 或 SVG（矢量质量）
2. **公式输出**：使用 `math-output=html` 使公式可选中
3. **裁剪**：启用以去除多余空白
4. **分辨率**：栅格元素 ≥300 DPI

### 常用 IEEE 领域公式

#### 机器学习

```latex
$$\mathcal{L} = \frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2$$     % 均方误差
$$\text{softmax}(z_i) = \frac{e^{z_i}}{\sum_{j} e^{z_j}}$$          % Softmax
$$\theta_{t+1} = \theta_t - \eta \nabla_\theta \mathcal{L}$$        % 梯度下降
```

#### 信号处理

```latex
$$X(f) = \int_{-\infty}^{\infty} x(t) e^{-j2\pi ft} dt$$            % 傅里叶变换
$$H(s) = \frac{Y(s)}{X(s)}$$                                        % 传递函数
```

#### 通信系统

```latex
$$C = B \log_2\left(1 + \frac{S}{N}\right)$$                        % 香农容量
```

### 期刊特定说明

| 期刊 | 公式格式 | 图片格式 |
|------|----------|----------|
| IEEE Transactions | LaTeX | EPS/PDF |
| ACM | LaTeX | PDF/PNG |
| Elsevier | LaTeX/MathML | TIFF/EPS/PDF |
| Springer | LaTeX | EPS/PDF |
| Nature | LaTeX | PDF/AI/EPS |

## 导出注意事项

默认数学输出使用 SVG。若希望导出 PDF 后公式可被选中，可使用 URL 参数：

`math-output=html`

## XML 标签安全建议

如果你是"生成 draw.io XML"而不是在编辑器里直接输入：

- 需要对 `value="..."` 中的 XML 属性字符做转义
  - `&` → `&amp;`
  - `<` → `&lt;`
  - `>` → `&gt;`
  - `"` → `&quot;`
- 避免在标签文本里混入 HTML 标签
- 确保公式分隔符成对出现（反引号、`$$`、`\(` 与 `\)`）

## 常见问题排查

### 公式不渲染

- 确认已启用 `Extras > Mathematical Typesetting`。
- 若仍失败，可能混入隐藏的 HTML 格式化标签：选中文字，点击工具栏 `</>` 显示隐藏标签并删除，然后重新启用 Mathematical Typesetting。

### 公式溢出/裁切或导出出现空白

- 在样式面板里将 Text Overflow 设置为 `Block` 或 `Width`（部分情况 `Hidden`），并调整形状尺寸。
- 建议左/右对齐并远离画布边缘，避免导出图片/PDF 出现额外空白。

## IEEE 投稿检查清单

- [ ] 所有公式使用 LaTeX 格式
- [ ] 图表有正确标题："Fig. N. 描述."
- [ ] 图例说明所有符号
- [ ] 灰度兼容性已验证
- [ ] 使用矢量格式（PDF/SVG）
- [ ] 字体大小符合期刊要求

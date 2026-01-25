# A–H Spec → Draw.io XML (Deterministic Starter)

This guide describes a deterministic workflow that turns an A–H spec into a starter draw.io XML. Use it to make “structured extraction” (A–H) and “diagram rendering” (draw.io) composable and repeatable.

## What You Get

- A basic draw.io XML with:
  - module containers
  - stacked nodes per module
  - orthogonal edges (dashed when the A–H line type contains `虚线`)
- Safe label handling:
  - rejects HTML tags
  - rejects unbalanced math delimiters
  - escapes XML attribute characters

## Implementation Reference

The generator lives in:

- `skills/drawio/src/dsl/ah-to-drawio.js`

## Recommended Workflow

1. Generate a strict A–H spec using [Scientific Workflows](./scientific-workflows.md) or your own prompt template.
2. Convert the A–H spec into XML using `ahToDrawioXml`.
3. Create the diagram via MCP:
   - `start_session`
   - `create_new_diagram` (send the generated XML)
4. Refine with `edit_diagram` using [Style Presets](./style-presets.md).
5. Export with `export_diagram`.

## Minimal Example (A–H)

```
A 总体布局：16:9；左→右
B 模块设置：
模块1：计算
模块2：评估
C 节点清单：
模块1-步骤1
ID: N1
Label: 线性模型 \(y=Wx+b\)
模块2-步骤1
ID: N2
Label: $$\mathcal{L}=\sum_i (y_i-\hat y_i)^2$$
D 连线关系：
N1→N2；关系：因果；线型：实线箭头
E 分组与阶段：未提及
F 方法与标签：未提及
G 视觉规范：未提及
H 导出建议：drawio
```


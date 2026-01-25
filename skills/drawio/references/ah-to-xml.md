# A–H Spec → Draw.io XML (Deterministic Generator)

This reference documents a small deterministic generator that converts an A–H spec into a starter draw.io XML. It is designed to make structured extraction (A–H) and rendering (draw.io) composable and repeatable.

## What It Does

- Parses sections A–H from plain text.
- Reads nodes from section C (`ID: N1`, `Label: ...`).
- Reads edges from section D (`N1→N2 ...`), and applies dashed style when the line type contains `虚线`.
- Generates a basic layout with module containers and stacked nodes.
- Validates and XML-escapes labels via `src/math` helpers (rejects HTML tags and unbalanced math delimiters).
- Emits numeric `mxCell id="..."` values for compatibility with stricter draw.io builds/plugins, while preserving the original logical IDs (`N1`, `N2`, ...) in `data-id="..."`.

## Limitations (By Design)

- Layout is intentionally simple (deterministic, not auto-optimized).
- Only uses IDs in edges; ignores labels in section D.
- Treats `T形线` as a normal edge style for now.
- The logical node IDs from the A–H spec are not used as draw.io XML cell IDs; they are stored in `data-id` instead.

## Usage (Local)

The generator is implemented here:

- `skills/drawio/src/dsl/ah-to-drawio.js`

Recommended workflow:

1. Ask the model to output a strict A–H spec using `references/structured-diagram-prompts.md`.
2. Convert the A–H spec to draw.io XML with `ahToDrawioXml`.
3. Use MCP tools:
   - `start_session`
   - `create_new_diagram` (send the generated XML)
   - `edit_diagram` for refinements
   - `export_diagram`

## Example A–H Input (Minimal)

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

# Palette catalog: 15 palette datasets, swatches, index

> 父任务：`.trellis/tasks/07-14-palette-system`。**依赖：`07-14-palette-core` 完成（entries 契约与物化行为冻结）**——启动前确认 core 已归档或其契约声明可用。

## Goal

在 core 冻结的契约上批量纳入其余 12 组配色数据，交付 15 张可重复生成的 swatch 样张与索引。

## Requirements

1. **12 组新数据**（HEX 取自父任务 `research/palette-standards-research.md`，形态按父 design §3）：
   - 学术：`tol-bright`、`tol-muted`、`tol-light-fill`（显式 fill/stroke 对，Tol light 作 fill）、`ieee-color`、`tol-high-contrast`、`matlab-lines`、`seaborn-colorblind`、`journal-npg`、`journal-jama`、`morandi`（强制深描边；`colorblindSafe:false`、`grayscaleSafe:false`）；
   - 工程：`c4-blue`（深色 base + 显式 `text:#FFFFFF`、external 灰系、boundary/连线色入 notes 或 connector）、`cloud-aws`（AWS 8 类别色；azure `#0078D4`/gcp 四色变体写入 notes）。
2. **元数据完整**：每组 `category/colorblindSafe/grayscaleSafe/maxCategories/source/venues/notes` 如实填写（安全标志按调研报告，期刊系一律 `colorblindSafe:false`）。
3. **swatch 生成**：标准模板 YAML（8 节点 + 3 类连接线）+ 入库生成脚本（对全部 15 组循环渲染 `.drawio` + `.png`，无 Desktop 回退 SVG）→ `references/examples/palettes/`；脚本可重复执行、幂等。
4. **索引**：`references/examples/palettes/README.md` 表格（样张 + 安全标志 + maxCategories + venues + 出处链接）。

## Acceptance Criteria

- [ ] 15 组 JSON 全部通过 core 的结构校验；单测抽样断言 HEX（npg 10 色、c4 四层蓝、aws 8 色、tol 各系首末色）与调研报告一致。
- [ ] 15 × (`.drawio` + 图像) 产物存在且由入库脚本重复生成结果一致。
- [ ] README 索引覆盖 15 组且安全标志与 JSON 元数据一致（单测或脚本断言）。
- [ ] 视觉抽检 ≥3 张（含 morandi 深描边补偿、c4-blue 白字）。
- [ ] `node --test` + root `npm test` 全绿。

## 约束

- 数据为主、代码仅生成脚本；不改 core 契约——若发现契约缺口，回父任务 design.md 修订并同步 core，不在本任务内私改。

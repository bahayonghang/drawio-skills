# Design: 评估并移植精选视觉风格为主题/样式预设

## 依赖

无硬前置（与 R1/R2 并行安全；不触碰 schema，仅新增 theme/preset JSON + 文档）。

## 方案

### A. 评估矩阵（先产出取舍清单，落 `.trellis/tasks/07-11-fw-style-presets/research/style-triage.md`）

对 `ref/fireworks-tech-graph/references/style-{1..8}-*.md` 逐一提取核心令牌（bg、node fill/stroke、文字色、强调色、字体），对照现有 7 套 themes + 3 套 built-in styles 判定：

| fireworks 风格 | 预判 | 理由 |
|---|---|---|
| 1 Flat Icon | 不移植 | 与 default/tech-blue 重复度高 |
| 2 Dark Terminal | **候选** | 现有 dark.json 偏通用，需对比后定 |
| 3 Blueprint | **候选（优先）** | 无对应；正式架构文档场景 |
| 4 Notion Clean | **候选** | 极简文档风，现有无 |
| 5 Glassmorphism | 不移植 | 渐变/毛玻璃在 drawio 样式系统还原成本高 |
| 6 Claude Official | 低优先 | 暖米色可作 nature 变体，价值有限 |
| 7 OpenAI Official | 不移植 | 与 default/academic 极简白重复 |
| 8 Dark Luxury | 对比后定 | 与 arch-dark 同为深底强调色，疑似重复 |

预判仅是起点；实施时以令牌实测对比为准，每条结论写"为何（不）移植"。

### B. 移植形态：theme（`assets/themes/<name>.json`）

选 theme 而非 style preset：fireworks 风格本质是全局色板+字体+边样式，与 theme.schema.json 的职责吻合；style preset（styles/built-in）留给"从用户图学来的风格"。命名 `blueprint.json`、`dark-terminal.json`、`notion-clean.json`（以实际入选为准）。

- 只取色彩/描边/字体令牌；SVG 滤镜（glow/blur/drop-shadow）不可移植，记录在 triage 文档。
- 字体遵守用户偏好：CJK 场景 Times New Roman + SimSun 栈不被新主题破坏（新主题字体只设 Latin 栈或沿用主题机制默认）。
- 结构照抄现有 `dark.json` 字段集，通过 `theme.schema.json` 校验。

### C. 适配指引

把 `style-diagram-matrix.md` 浓缩为一节"主题×图类型适配"加进 `references/docs/style-presets.md`（已有文档，追加章节）：只保留入选主题 + 现有主题的行，标注 Poor 组合（如 Blueprint×MindMap）。

### D. 样张

用同一个现有 example（`arch-dark-web-app.yaml` 改主题字段，或 `microservices.yaml`）为每套新主题渲染样张 SVG 到 `.drawio-tmp/style-samples/`，与 fireworks `references/samples/*.png` 人工比对色彩气质。

## 不做

- 不动 arch-dark/academic 既有主题；不覆盖 bundled 预设；不改 SKILL.md description。
- 不追求像素级还原（引擎不同，取"色彩气质一致"）。

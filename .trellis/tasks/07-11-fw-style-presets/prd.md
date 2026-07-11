# PRD: 评估并移植精选视觉风格为主题/样式预设

父任务：`07-11-fireworks-into-drawio`（R3）。来源素材：`ref/fireworks-tech-graph/references/style-*.md`（8 套风格令牌）、`style-diagram-matrix.md`（风格×图类型适配表）、`samples/`（效果参照图）。

## Requirements

1. **筛选**：对 8 套风格逐一评估与现有资产（`assets/themes/`、`styles/built-in/`、arch-dark、academic/academic-color）的重复度，输出取舍清单。预判：
   - 候选移植：Blueprint（正式架构文档）、Dark Terminal（dev 向）、Notion Clean（极简文档）；
   - 疑似重复：Dark Luxury vs 已有 arch-dark（需对比后决定）；
   - 低优先：Glassmorphism（渐变/毛玻璃在 draw.io 样式系统中还原成本高）、Claude/OpenAI Official。
2. **移植**：每套入选风格移植为 drawio theme（`assets/themes/`）或 built-in style preset（`styles/built-in/`），按现有 theme.schema.json / styles/schema.json 结构；只取色彩/字体/描边令牌，不取 SVG 滤镜（drop-shadow/blur）等不可移植项，不可移植项记录在案。
3. **适配指引**：将 `style-diagram-matrix.md` 精华（哪种风格适合哪类图、哪些组合是 Poor）浓缩进 `references/docs/style-presets.md` 或 themes.md，供选型时引用。
4. 遵守既有规则：不改动/覆盖现有 bundled 预设；新增文件走仓库源内路径。

## Acceptance Criteria

- [ ] 取舍清单落档（含"为何不移植"的条目）。
- [ ] 每套入选风格：schema 校验通过，且用同一个示例 YAML 渲染出样张 SVG 供人工比对 fireworks samples。
- [ ] 样张满足用户硬性偏好（透明文本框、绑定连线；memory: drawio-diagram-user-preferences）。
- [ ] 风格×图类型适配指引进入 references，且不与 academic 主题政策冲突（学术图仍默认 academic 主题）。

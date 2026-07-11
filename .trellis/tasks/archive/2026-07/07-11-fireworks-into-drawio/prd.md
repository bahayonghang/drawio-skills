# PRD: 引入 fireworks-tech-graph 图形生成能力优化 drawio 技能（父任务）

## 背景

`ref/fireworks-tech-graph` 是一个 SVG-first 的技术图生成技能，与本仓库 `skills/drawio`（YAML-first → CLI → .drawio/SVG）解决同一问题但引擎相反。

对比结论（源自 2026-07-11 分析）：

| 维度 | fireworks-tech-graph | skills/drawio |
|---|---|---|
| 引擎 | 手写 SVG → cairosvg PNG | YAML → CLI 渲染 + 校验 |
| 强项 | 语义词汇丰富、8 套精选风格、AI/agent 图类型覆盖全 | 渲染/校验/边路由健壮、产物可编辑 |
| 弱项 | SVG 语法脆弱、校验弱、产物不可编辑 | AI/agent 图语义与精选视觉风格偏薄 |

## 核心决策（约束）

1. **不新建 skill**：所有能力融入现有 `skills/drawio`（基座）；`drawio-academic-skills` 通过 sibling 依赖自动继承。
2. **不引入 SVG 直绘引擎**：fireworks 的手写 SVG / Python-list 生成、cairosvg 导出、validate-svg 脚本机制劣于现有 CLI 管线，全部不移植。
3. **移植的是知识，不是代码**：图类型布局规则、形状/箭头语义词汇、AI 模式库、视觉风格令牌。
4. 遵守现有基座/overlay 边界：主题与设计系统内容进基座；学术策略不动。

## 需求集（映射到子任务）

- R1 AI/Agent 图类型覆盖：Agent Architecture、Memory Architecture（Mem0/MemGPT 式）、Mind Map、Timeline 布局规则进入 drawio references；RAG/Agentic RAG/Mem0/Multi-Agent/Tool-Call 模式成为 YAML examples。→ `07-11-fw-agent-diagram-types`
- R2 语义词汇融合：Shape Vocabulary（概念→形状）与 Arrow Semantics（流类型→颜色/线型/含义 + 图例强制规则）融入 design-system 文档与语义节点/连接器类型。→ `07-11-fw-shape-arrow-semantics`
- R3 视觉风格移植：从 8 套风格中筛选非重复者移植为 themes / styles/built-in 预设，附风格×图类型适配指引。→ `07-11-fw-style-presets`

## 跨子任务验收标准

1. `skills/` 下仍只有 `drawio` 与 `drawio-academic-skills` 两个技能。
2. 未新增任何 SVG 直绘脚本；渲染路径仍是 `scripts/cli.js`。
3. 新增 YAML examples 均通过 `node skills/drawio/scripts/cli.js <yaml> <out>.svg --validate` 且无 error。
4. SKILL.md 路由表若有更新，仍满足 description 触发探针要求（memory: drawio-skills-desc-probe-set，改 description 前先跑 26 条探针，合计 ≤800 字符）。
5. 遵守用户硬性绘图偏好（memory: drawio-diagram-user-preferences）：透明文本框、原生绑定连线、正交边共线拉直、Times New Roman+SimSun 字体、字号尽量大。
6. 学术 overlay 无需任何修改即可继续工作（sibling 路径未变）。

## 集成评审（父任务收尾）

- 汇总三子任务产物，检查 references 间无冲突表述（尤其箭头颜色语义 vs arch-dark 设计语言）。
- 全量跑一遍新增 examples 渲染 + validate。

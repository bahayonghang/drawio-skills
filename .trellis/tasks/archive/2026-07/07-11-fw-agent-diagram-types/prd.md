# PRD: 补齐 AI/Agent 图类型布局规则与模式库

父任务：`07-11-fireworks-into-drawio`（R1）。来源素材：`ref/fireworks-tech-graph/SKILL.md` §Diagram Types（Agent Architecture / Memory Architecture / Mind Map / Timeline）与 §Style Selection 末尾的常见模式列表。

## Requirements

1. 在 `skills/drawio/references/docs/` 新增 `agent-diagrams.md`（或经评估并入 `architecture-diagrams.md`），移植并适配以下布局规则为 YAML-first 表述（不含任何 SVG 坐标/viewBox 细节）：
   - Agent Architecture：Input / Agent Core / Memory / Tool / Output 五层概念分层；迭代推理用回环连线表达。
   - Memory Architecture（Mem0/MemGPT 式）：读路径与写路径分开（不同 connector 类型）；memory tiers 分层；操作标签（store/retrieve/consolidate）。
   - Mind Map：中心辐射布局在现有 layout（star）上的用法与限制。
   - Timeline/Gantt：横向时间轴 + 分类色条 + 里程碑标记的 YAML 表达方式。
2. 在 `skills/drawio/references/examples/` 新增可渲染的 YAML examples（每个 ≤ 现有示例复杂度量级）：
   - `rag-pipeline.yaml`、`agentic-rag.yaml`、`mem0-memory-layer.yaml`、`multi-agent-orchestration.yaml`、`tool-call-loop.yaml`（可合并精简，最少 3 个）。
3. `SKILL.md` 任务路由表若新增 `agent-architecture` 路由或扩展现有 `architecture` 路由触发词（"agent 架构图"、"RAG 图"、"记忆架构"等），必须先跑 description 探针集（memory: drawio-skills-desc-probe-set）。
4. 不移植：SVG generation strategy、Python-list 方法、cairosvg 导出、validate-svg。

## Acceptance Criteria

- [ ] 新 reference 文档存在且只含 YAML-first 表述，无 SVG 直绘指导。
- [ ] 每个新 example 通过 `node skills/drawio/scripts/cli.js <yaml> <out>.svg --validate` 无 error。
- [ ] 渲染产物满足用户硬性偏好（透明文本框、绑定连线、共线拉直；memory: drawio-diagram-user-preferences）。
- [ ] 回环/迭代推理连线在渲染中可读（无穿模、标签不压线）。
- [ ] 若改了 SKILL.md description/路由：26 条探针通过且 description ≤800 字符门槛。

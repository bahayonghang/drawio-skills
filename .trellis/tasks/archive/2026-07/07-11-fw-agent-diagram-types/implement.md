# Implement: 补齐 AI/Agent 图类型布局规则与模式库

前置：`07-11-fw-shape-arrow-semantics` 已完成（examples 依赖新 type）。开工前确认 `assets/schemas/spec.schema.json` 已含 `llm/agent/vector_store/memory/tool/gateway` 与 `control/memory_read/memory_write/async/feedback`。

## 步骤

1. 通读素材与落点
   - 读 `ref/fireworks-tech-graph/SKILL.md` §Agent Architecture、§Memory Architecture、§Mind Map、§Timeline、§Style Selection 模式列表。
   - 读 `skills/drawio/references/docs/architecture-diagrams.md`（避免与 arch-dark 语言冲突）与 `design-system/specification.md`（YAML 能力边界：layout、group、bounds、图例写法）。
2. 写 `references/docs/agent-diagrams.md`（design.md §A 五节 + 模式速查）。
   - 验证：文档内不出现 viewBox/px 坐标/SVG 标签；引用的 type/edge 全部存在于 schema。
3. 逐个创建 5 个 examples（design.md §B），每写一个立即：
   - `node scripts/cli.js references/examples/<f>.yaml .drawio-tmp/<f>.svg --validate` 无 error；
   - 目检 SVG：回环边可读、标签不压线、图例存在、透明文本框、连线为绑定边（memory: drawio-diagram-user-preferences）。
4. 更新 SKILL.md `architecture` 路由行（仅正文表格，不动 frontmatter description）。
   - 验证：git diff 确认 frontmatter 未变。
5. 回归：全部新旧 examples 批量 `--validate`。

## 回滚点

纯增量（1 个新文档 + 5 个新 YAML + SKILL.md 一行表格），删除即回滚。

## 注意

- 若某模式在 ≤20 节点内表达不下，精简而非扩容（节点预算精神与学术 playbook 一致）。
- 5 个 examples 若有两个结构高度雷同可合并，最少保留 3 个（PRD 允许）。

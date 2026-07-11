# PRD: 融合语义形状词汇与箭头语义到 design-system

父任务：`07-11-fireworks-into-drawio`（R2）。来源素材：`ref/fireworks-tech-graph/SKILL.md` §Shape Vocabulary、§Arrow Semantics。

## Requirements

1. **Shape Vocabulary 映射**：把 fireworks 的概念→形状表（User、LLM/Model、Agent/Orchestrator、Memory 短期/长期、Vector Store、Graph DB、Tool、API/Gateway、Queue/Stream、File、External Service 等）映射到 drawio 语义节点类型：
   - 已有对应 type 的：在 `design-system/shapes.md` 补充概念别名与用法说明。
   - 缺失的（如 vector-store、graph-db、agent、llm、queue）：评估加入 YAML schema 的语义 type 与 renderer 默认样式；若成本过高，先以文档化的 style 组合（shape+icon 配方）落地并记录决定。
2. **Arrow Semantics 融合**：把流类型表（primary data / control-trigger / memory read / memory write / async-event / transform / feedback-loop → 颜色+线宽+虚线+含义）融入：
   - `design-system/connectors.md`：typed connector 语义清单与默认样式。
   - `design-system/color-guide.md`：颜色语义与现有角色色板（含 arch-dark 设计语言）冲突消解——arch-dark 优先，fireworks 色值仅作默认建议。
   - 图例规则："使用 ≥2 种箭头语义时必须有图例（紧凑单文本节点形式)" 写入 edge-quality 或 connectors 文档。
3. `icons.md` 已有 `lucide.brain-circuit`/`lobe.*` 等 AI 图标指引，与新形状词汇交叉引用，不重复建表。
4. 不移植 SVG marker/stroke 实现细节，仅移植语义层。

## Acceptance Criteria

- [ ] shapes.md / connectors.md / color-guide.md 更新完成且相互一致（同一概念不出现两套颜色）。
- [ ] 每个新增语义 type（若加 schema）有 schema 校验 + 渲染冒烟：一个包含全部新 type 的 YAML 通过 `--validate` 并渲染。
- [ ] 与 arch-dark 设计语言（architecture-diagrams.md）无冲突表述；冲突处显式写明优先级。
- [ ] 图例规则文档化且与学术 overlay 的"紧凑图例"要求（单多行文本节点）一致。

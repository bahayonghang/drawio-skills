# Design: 补齐 AI/Agent 图类型布局规则与模式库

## 依赖

**前置：`07-11-fw-shape-arrow-semantics` 必须先完成**——本任务 examples 使用其新增的节点 type（`llm/agent/vector_store/memory/tool/gateway`）与边 type（`control/memory_read/memory_write/async/feedback`）。若前置未完成，examples 退化为现有 type + 文档注记，不阻塞但质量降级。

## 方案

### A. 新 reference：`references/docs/agent-diagrams.md`

独立新文档（不并入 architecture-diagrams.md——后者是 arch-dark 设计语言专章，职责不同）。内容为 YAML-first 布局规则，全部改写自 fireworks SKILL.md 对应章节，去除 SVG/viewBox/像素坐标：

1. **Agent Architecture**：五概念层（Input → Agent Core → Memory → Tool → Output）；用 `layout: vertical` + group/boundary 表达分层；迭代推理用 `feedback` 边回环；Memory 类型（短期虚线 `memory` / 长期 `database`/`vector_store`）视觉区分。
2. **Memory Architecture（Mem0/MemGPT 式）**：读路径 `memory_read`、写路径 `memory_write` 分开；tiers（Working → Short-term → Long-term → External）纵向分层；操作名作 edge label（store/retrieve/consolidate）。
3. **Mind Map**：`layout: star` 用法与限制（单层辐射；二级分支手动 bounds 或拆图）；何时改用层级图。
4. **Timeline/Gantt**：现有原语的表达配方（横向泳道/分组 + 分类色 + 里程碑用 `decision`/菱形或文本标记）；说明这是配方而非新 layout 引擎。
5. 常见模式速查（文字版结构，指向 examples）：RAG Pipeline、Agentic RAG、Agentic Search、Mem0 Memory Layer、Multi-Agent、Tool Call Loop。

### B. 新 examples（`references/examples/`）

| 文件                             | 覆盖                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------ |
| `rag-pipeline.yaml`              | Query→Embed→VectorSearch→Retrieve→LLM→Response；`vector_store`、transform 语义 |
| `agentic-rag.yaml`               | RAG + agent 循环 + tool；`agent`、`feedback`、`control`                        |
| `mem0-memory-layer.yaml`         | 读/写路径分色；`memory_read`/`memory_write`、memory tiers                      |
| `multi-agent-orchestration.yaml` | Orchestrator→SubAgents→Aggregator；`async` 可选                                |
| `tool-call-loop.yaml`            | LLM→ToolSelector→Exec→Parser→LLM 回环                                          |

每个 ≤20 节点，主题用 default 或 arch-dark（选一统一），必须含图例（当 ≥2 种边语义）。

### C. SKILL.md 路由

扩展现有 `architecture` 路由的 When-to-use 一句话并在 Required references 加 `agent-diagrams.md`；**不改 frontmatter description**（避免触发探针流程）。若实施中发现必须改 description，停下来报告，由人决定是否跑 26 条探针。

## 不做

- 不移植 Sequence/Class/UseCase/State/ER 章节（现有 UML 路由已覆盖）。
- 不新增 layout 引擎；Mind Map/Timeline 只用现有 layout + 配方。
- 不移植 SVG 生成策略、视觉复查像素规则（drawio 已有 visual self-check 政策）。

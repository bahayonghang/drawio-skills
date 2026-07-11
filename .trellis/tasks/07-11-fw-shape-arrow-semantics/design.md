# Design: 融合语义形状词汇与箭头语义到 design-system

## 现状（已核实 2026-07-11）

- `assets/schemas/spec.schema.json` 节点 type 枚举含 `service, database, queue, user, cloud, graph, ...`（33 个），**缺**：`llm`、`agent`、`vector_store`、`tool`、`gateway`、`memory`（短期）。
- 边 type 枚举仅 `primary, data, optional, dependency, bidirectional`，**缺**：`control`（触发）、`memory_read`、`memory_write`、`async`（事件）、`feedback`（回环）。
- 渲染样式映射在 `scripts/` 下（dsl/ 或 shared/，实施时用 grep 定位现有 type→style 表照葫芦画瓢）。

## 方案

### A. 节点语义（新增 schema type，低成本优先）

| fireworks 概念 | 落地 | 说明 |
|---|---|---|
| LLM / Model | 新 type `llm` | 圆角矩形 + 强调色；文档建议配 `lucide.brain-circuit` 图标 |
| Agent / Orchestrator | 新 type `agent` | 双边框圆角矩形或 hexagon（复用 gateway 视觉如已有 hexagon 实现） |
| Vector Store | 新 type `vector_store` | cylinder 变体（复用 database 渲染 + 网格提示线可选，不强求） |
| Graph DB | 复用现有 `graph` | 仅文档补别名，不加 type |
| Memory 短期 | 新 type `memory` | 圆角矩形虚线边框（ephemeral=dashed 语义） |
| Tool / Function | 新 type `tool` | 圆角矩形；文档建议 `lucide.wrench` 类图标 |
| API / Gateway | 新 type `gateway` | hexagon |
| Queue/User/File/External | 复用 `queue`/`user`/`document`/`cloud` | 仅文档补别名 |

原则：渲染实现全部复用现有 shape 原语（rect/rounded/cylinder/hexagon/dashed），**不新增绘制代码路径**，只加 type→现有样式的映射；做不到的降级为文档化 shape+icon 配方。

### B. 边语义（新增 edge type）

在现有 5 种上新增，默认样式写入各 theme 或渲染器默认表（跟随现有 edge type 的实现位置）：

| 新 type | 默认视觉 | 语义 |
|---|---|---|
| `control` | 橙 `#ea580c` 实线 1.5 | 触发/控制 |
| `memory_read` | 绿 `#059669` 实线 1.5 | 读取存储 |
| `memory_write` | 绿 `#059669` 虚线 5,3 | 写入存储 |
| `async` | 灰 `#6b7280` 虚线 4,2 | 事件/非阻塞 |
| `feedback` | 紫 `#7c3aed` 曲线/回环 1.5 | 迭代回环 |

冲突消解：**主题令牌优先于上表色值**——arch-dark / academic 主题内这些 type 必须映射到主题自身色板（arch-dark 见 `architecture-diagrams.md` 角色色）；上表颜色仅作 default/light 主题默认。文档中显式写明优先级：用户显式样式 > 主题 > type 默认。

### C. 文档更新

- `design-system/shapes.md`：概念→type 对照表（含"复用别名"列）。
- `design-system/connectors.md`：edge type 语义清单 + 图例规则（≥2 种箭头语义必须有图例，紧凑单文本节点形式，与学术 overlay 一致）。
- `design-system/color-guide.md`：新增边语义色，标注"主题优先"。
- `design-system/icons.md`：交叉引用一行，不重复建表。

### D. 兼容性

新增枚举值为纯增量，不破坏既有 YAML；`--validate` 对旧文件行为不变。渲染回退：未知主题下新 edge type 回退 `data` 样式（若实现层有此机制则沿用，无则在默认表兜底）。

## 不做

- 不移植 SVG marker/滤镜实现；不改 edge 路由算法；不动学术 overlay 文件。

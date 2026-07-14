# drawio-ai-kit 架构深度分析（探索代理报告，2026-07-14）

来源：对 `ref/drawio-ai-kit` 的全量探索。

## 总览

零运行时依赖的 Node18+ ESM 框架 + `drawio-ai` CLI。核心：声明式布局引擎 + 真实 stencil 目录 + 静态校验器，专治 AI 编造不存在的 shape ID（渲染成空白框）。1.0.0 已移除 MCP server，纯 CLI。

## 目录职责

| 目录                            | 职责                                                                                                                                                                                                                                                      |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/`（9 个 .mjs，2441 行）    | `cli.mjs`（命令分发）、`core.mjs`（目录加载+搜索+校验器，705 行）、`builder.mjs`（Diagram 类 + A\* 边路由，614 行）、`layout-engine.mjs`（声明式布局，299 行）、`types.mjs`（7 种拓扑）、`theme.mjs`（设计令牌）、`bpmn.mjs`、`layout.mjs`、`cli-lib.mjs` |
| `catalog/`（12 个 JSON，~18MB） | 单一事实来源：stencil ID → 样式/颜色/连接点。`aws.json`（983 图标+19 组）由脚本从 vendor 索引生成                                                                                                                                                         |
| `data/`                         | `shape-index.json.gz`（10,446 条 shape 索引，jgraph/drawio-mcp，Apache-2.0）+ `lobe-icons.json`                                                                                                                                                           |
| `packs/`（888 文件）            | 非 AWS 图标包源，`manifest.json` + `build_pack.py` 编译                                                                                                                                                                                                   |
| `rules/`（8 个 .md，410 行）    | 画图规则                                                                                                                                                                                                                                                  |
| `skills/`（5 个 SKILL.md）      | 瘦域技能（AWS/Azure/GCP/Databricks/BPMN）                                                                                                                                                                                                                 |
| `scripts/`（3 个 .py，stdlib）  | `ingest_index.py`、`build_pack.py`、`crawl_icons.py`                                                                                                                                                                                                      |
| `vendor/`                       | `autolayout.py`（Graphviz）、`aiicons.py`、`repair_png.py`、`encode_drawio_url.py`                                                                                                                                                                        |
| `examples/`（29 文件）          | 零硬编码坐标的模板                                                                                                                                                                                                                                        |
| `test/`（8 文件，807 行）       | `node:test` 零依赖                                                                                                                                                                                                                                        |

## 核心机制：真实 stencil 校验（防幻觉支柱）

- 数据源：`data/shape-index.json.gz`，每条 `{style, w, h, title, tags}`，**style verbatim 逐字保留**，不拼样式不猜名。
- `scripts/ingest_index.py` 过滤 `mxgraph.aws4` 家族生成 `catalog/aws.json`（983 图标）。条目示例：
  `{"name":"s3","label":"Simple Storage Service (S3)","category":"Storage","color":"#7AA116","w":78,"h":78,"style":"...shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.s3;"}`
- `core.mjs:loadCatalog` 合并所有 `catalog/*.json`，建 `byName` Map 和 `validNames` Set。
- `core.mjs:searchIcon`：非模糊，**加权打分**——norm()（NFKD+去符号）后 exact=+100、名称 token=+25、haystack=+6，检索 name/label/category/tags/aliases。支持逗号批量 `drawio-ai search "s3, lambda, nat gateway"`。compact 模式只返回 name/label/category/color 省 token。
- `core.mjs:validateDiagram`（:175）：正则抽取 XML 中所有 `resIcon=`/`grIcon=`/`shape=mxgraph.aws4.*`，逐个查 `validNames`；不存在 → 报错并**给搜索建议**：`Stencil not found: mxgraph.aws4.xxx — suggestions: a, b, c`。

## 自动布局

自研 flexbox 式声明引擎（非 elkjs/dagre）：`icon/box` 叶 + `group/frame/grid/pool/phantom` 容器工厂搭树 → `renderTree` 三阶段 measure（自底向上算 w/h）→ place（自顶向下派 x/y）→ emit。7 种拓扑（pipeline/hierarchy/network/hubspoke/hybrid/mesh/sequence）+ bpmn。边路由 `builder.mjs:link`（:143）：A\* 通道路由 + nudge 三阶段，零依赖。>15 节点可选 `vendor/autolayout.py`（Graphviz dot）。两种输出契约：Scaffold（默认，只留连接点，人编辑友好）vs Bake（冻结路点）。

## validate/audit 三级体系

- **硬错误**（退出码 2）：unknown stencil（带建议）、重复 cell id、悬空边、resourceIcon 缺 `aspect=fixed`。
- **AWS 约定**（auditAwsConventions）：图标被改色（偏离 category 官方色）、GROUP_LEVEL 嵌套顺序（Cloud/Account/Region=0→VPC=2→AZ=3→Subnet=4→SG=5）、非 AWS 框圆角。
- **几何**（auditGeometry，无需渲染）：子元素溢出父容器、同级叶子部分重叠（排除故意 badge）、多边同点入箭头堆叠；用父链解析绝对坐标。
- **边编排**（auditEdges）：超长绕行、交叉过多、边穿过无关节点（线段-矩形相交）、连到透明占位叶。
- **美学**（auditAesthetics）：字号≤4 种且≤14px、背景填充≤8 色、light-dark() 令牌、fan-out 方角+固定连接点、图标尺寸统一。
- **BPMN 语义**（auditBpmn）：网关分叉/合并、开始无入边、结束无出边、孤立流对象。
- 所有 advice 是教学式字符串，agent 照 checklist 一轮修完。

## 图标包规模与命名

| 包              | 规模           | 命名                                                                                   |
| --------------- | -------------- | -------------------------------------------------------------------------------------- |
| AWS             | 983 图标+19 组 | `mxgraph.aws4.*` 真名（`s3`/`eks`），组 `group_vpc`/`group_region`，11 category 官方色 |
| Azure（12.9MB） | 626            | `azure_*`，官方 V23（base64 image）                                                    |
| GCP             | 216            | `gcp_*`                                                                                |
| Databricks      | 49             | 语义名，robkisk/databricks-icons PNG                                                   |
| BPMN            | 19             | `bpmn_*`，参数化 `mxgraph.bpmn.*`（非 base64）                                         |
| 8 个 OSS 包     | 281            | database66/bigdata48/cicd42/aiml26/containers26/observability26/databricks24/network15 |

合计 2106 图标，`loadCatalog` 合并统一可搜。AWS 用原生矢量 stencil，其余多 base64 image tile。

## skills/ 与 rules/

- 5 个瘦 SKILL.md：frontmatter 精准触发词 → Preflight（查 PATH，绝不自行 npm i -g）→ Delegate 路径（子 agent + 模型路由：模板匹配走便宜档）→ Inline 路径（`workflow`→`principles --mode`→`root`→build/validate/render）→ Domain notes + Self-check。硬规则：输出写用户 cwd，绝不写进 kit repo。
- `rules/principles.md` 通用九条：先匹配模板、每个图标必查 search、官方容器嵌套、≤8 填充色+light-dark、3-4 字号≤14px、边语义（实线主流/虚线同步）、managed vs self-managed、左源右消费者+横切 band、交付前 validate 清零。
- 域规则：`aws-architecture.md`（色=身份不可改、clusterBox 连边界不连副本）、azure/gcp/databricks/bpmn、`diagram-types.md`（模板表+复现循环）、`style-guide.md`（指向 theme.mjs 令牌）。
- `drawio-ai principles --mode <domain>` 按域拼装下发，附 catalog category 计数。

## CLI 命令面与端到端工作流

命令：search（批量）· style · validate · audit · render（`--check` 钳 1100px 省 token+机读 issues）· logo · categories · types · principles --mode · scaffold（模板改写成自校验脚本）· root · workflow。

工作流：`root` 取安装路径 → import 引擎 → 声明节点树 renderTree → d.link → d.validate() → render --check → Read PNG 视觉自检（一次列全、一轮修完、≤2 轮）→ 最终 PNG + 写 .drawio 到用户项目。

## 值得借鉴的其他优点

- 防幻觉三支柱：verbatim 索引 + 存在性校验带建议 + 声明式引擎禁手写坐标。
- 数据管线可复现：stdlib Python、manifest 声明式、预构建 JSON 已 commit（用户无需重建）。
- 测试：golden snapshot 钉坐标结构（registry-golden.test.mjs）、contract/save-guard（防写进 repo）、可选依赖降级测试。
- Token 经济：compact 搜索结果、批量查询、--check 降分辨率、advice 聚合单行。
- 文档分层：README/AGENTS.md/CONTEXT.md（术语表）/developer-guide（codemap）/ADR/api-cheatsheet（agent 单文件 API）。
- Skill 与引擎解耦：瘦技能只做触发+委派；改规则不动技能。
- Phantom frame（ADR-0005）：不可见布局包装器，只算几何不 emit cell。

## 关键文件速查

校验 `src/core.mjs:175 validateDiagram`；布局 `src/layout-engine.mjs:293 renderTree`；边路由 `src/builder.mjs:143 link`；数据生成 `scripts/ingest_index.py`；拓扑 `src/types.mjs`；令牌 `src/theme.mjs`;agent API `docs/api-cheatsheet.md`；示例 `examples/aws/build_vpc.mjs`。

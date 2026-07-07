# drawio skills 深度审查发现（2026-07-06）

审查范围：`skills/drawio`（base v2.3.0）、`skills/drawio-academic-skills`（overlay v2.3.0）。
参考基准：`ref/drawio-skill`（Agents365-ai/drawio-skill v1.28.0）+ 网络搜索（IEEE 作者指南、draw.io v30 ChangeLog、ELK/elkjs、网络拓扑规范）。
审查方法：skill-audit 五维度（编码/触发/内容/结构/评测）+ 渲染管线实证测试（`/tmp/drawio-audit/`）。

## 发现表（按严重度排序）

| # | skill | 维度 | 问题 | 严重度 | 修复建议 |
|---|-------|------|------|--------|----------|
| 1 | drawio | 内容/代码 | `drawio-to-svg.js` 不换算容器子节点相对坐标：modules 内节点在 SVG 中全部错位到画布原点附近并互相重叠；边随之退化为零长度线（实证：Encoder/Decoder 都画在 (24,64)，边为 `x1=84 y1=94 x2=84 y2=94`）。SVG 是默认学术交付物 + 视觉自检依据 → 默认交付损坏 | 高 | renderVertex/renderEdge 前先按 parent 链累加绝对坐标；补容器场景回归测试 |
| 2 | drawio | 内容/代码 | SVG 边渲染一律"中心到中心直线"，忽略 orthogonalEdgeStyle、waypoints、exitX/entryX；箭头扎进节点中心，与 .drawio 实际路由严重不符 | 高 | 至少实现：边端点裁剪到节点边界 + waypoints 折线回放 + exit/entry 挂点定位；正交回退策略 |
| 3 | drawio | 内容/代码 | SVG `<text>` 不拆行（无 tspan），多行标签被浏览器折叠成一行；学术 playbook 主推的"单节点多行紧凑图例"在 SVG 中不可读 | 高 | 按 `\n`/`<br>` 拆 tspan，行高 1.4em；长行按 whiteSpace=wrap 语义估算换行 |
| 4 | drawio | 内容/代码 | 布局引擎无边感知：`hierarchical` 实为按 YAML 顺序的 4 列网格；horizontal/vertical 只是模块内堆叠。学术 workflow/流程图必须整图手工 bounds，且质量全靠手放 | 高 | 引入 elkjs layered（支持复合图+正交路由；dagre 有复合图致命 bug 不选）；ELK bend points 回放为 draw.io waypoints；参考 ref 仓库 Graphviz 方案与 --tune 双向评分 |
| 5 | drawio-academic | 内容 | 官方旗舰模板 `neural-network-architecture-compact.yaml` 在自家 `--validate` 下产生 26 条告警（11 条边质量、1 条 -60px 重叠），而 overlay 标准命令是 `--strict-warnings` → 模板在推荐管线下硬失败 | 高 | 修模板坐标间距；把模板纳入 CI（--strict-warnings 必须通过） |
| 6 | drawio | 内容/代码 | 单条边默认挂 `FACE_SLOTS[0]=0.25` 偏心槽位（实证 exitY=0.25/entryY=0.25），最常见的一进一出箭头系统性不居中 | 中 | 每面 1 条边时用 0.5；多条边才用分布槽位（0.5→0.25/0.75…） |
| 7 | drawio | 内容/代码 | 主题保真三连：(a) `moduleTheme.rounded || 12` 把 academic 主题 `rounded:0` 吞成 arcSize=12 圆角（实证）；(b) `theme.node.*.rounded` 完全无人消费，SHAPE_STYLES 硬编码 `rounded=1;arcSize=20`，IEEE 直角矩形意图整体失效；(c) `theme.typography.fontFamily`（含 academic 的 Latin Modern 公式字体栈）被 `getDefaultFontPolicy` 硬编码 Times New Roman 回退覆盖，主题字体是死配置 | 中 | `??` 替换 `||`；节点样式生成消费主题圆角；resolveFontFamily 接入 theme.typography 作为回退层 |
| 8 | drawio | 内容/代码 | `NETWORK_VENDOR_DEVICE_ICONS.aws.subnet → 'aws.rds_instance'`：AWS 子网错映射为 RDS 实例图标 | 中 | 改为 VPC/subnet 组框或正确图标；补 vendor-device 映射测试 |
| 9 | drawio | 内容/代码 | 发出的 stencil 形状名（`shape=switch`、`shape=cube;direction=south`、`mxgraph.cisco.*`、`mxgraph.aws4.*` 前缀拼接）无任何目录校验，拼错即 Desktop 渲染空白框；对比 ref 仓库有 shape-index.json.gz（10k+ 形状）+ shapesearch.py | 中 | 引入形状目录（可复用 ref 的 shape-index 思路）做构建期/校验期核对；SVG 渲染器同步补 cube/tensor3d 等近似绘制 |
| 10 | drawio-academic | 内容 | 学术密度告警阈值矛盾：`validateAcademicProfile` 在 >18 节点（无模块 >12）告警"dense"，而 playbook 节点预算表说 30-40 是理想区间、41+ 才警告；合规的 30 节点架构图必然触发告警 | 中 | 统一为 playbook 预算：告警阈值对齐 41/61/100 三档，或按 figureType 分档 |
| 11 | drawio-academic | 内容 | 紧凑图例矛盾：playbook 推荐"1 个多行 text 节点当图例"（示例 8 行），但 >3 手动行即触发"labels should stay concise"告警 → 按文档做必然被警告，strict 下失败 | 中 | 校验器豁免 type:text/图例节点的行数检查，或单独设图例行数上限 |
| 12 | drawio-academic | 内容 | 模板/playbook 存在 schema 漂移键：`style.shape`、`style.rounded`、`meta.canvasSize`、`meta.gridSize`、module `bounds` 均不被渲染器消费（grep 证实），静默忽略；playbook 图例示例 `shape: text` 不生效会退化为 service 彩盒 | 中 | 模板改用受支持字段（type/bounds/meta.canvas）；或渲染器对未知键报 warning；validateSpec 增加未知字段检测 |
| 13 | drawio-academic | 内容 | 缺"画布 px → 版面 pt"映射指引：IEEE 单栏 3.5in/双栏 7.16in、成品字号 8-10pt（外部证实），但 skill 从不计算 1200px 宽图缩到单栏后 11px 字 ≈ 3pt 不可读的问题；"A4 可读"仅凭感觉 | 中 | 在 preflight/checklist 增加目标栏宽与画布尺寸推荐（如单栏 ≤ 900px、字号按缩放比核算），校验器算有效 pt |
| 14 | drawio-academic | 内容 | IEEE 矢量投稿只收 PS/EPS/PDF（外部证实），SVG 不在名单；overlay 默认交付 .drawio+.svg，对 IEEE 目标应主动建议 Desktop PDF 或说明 SVG→PDF 转换 | 低 | venue=IEEE 时默认附 PDF（Desktop 可用时）；checklist 注明 SVG 非 IEEE 提交格式 |
| 15 | drawio-academic | 结构/评测 | `evals/evals.json` 版本 0.1.0 与 SKILL.md 2.3.0 不一致；evals 为提示+断言清单，无自动 runner；`darwin-results.tsv`/`test-prompts.json`/`baseline-prompts.json` 为历史遗留，新鲜度存疑 | 低 | 同步版本号；标注 evals 运行方式；清理或归档过期评测产物 |
| 16 | drawio | 内容 | `estimateTextSize` 仅作用于 text 节点；普通节点固定 preset（120×60）+ whiteSpace=wrap，长标签溢出无告警；formula 节点无自动宽度，长公式默认 120×60 被裁 | 低 | 为 formula/长标签节点做内容感知尺寸或告警 |
| 17 | drawio | 内容 | `checkComplexity` 对 >14 字符标签逐节点刷 info 噪音（模板一次 13 条），淹没真实告警 | 低 | 阈值放宽或聚合成单条摘要 |
| 18 | drawio | 结构 | base 自带 `.mcp.json` 而 overlay 合同"永不经由 MCP"；SKILL.md 定位 MCP 为可选 refinement，不算冲突但易误解 | 低 | 在 base SKILL.md 显式注明 .mcp.json 仅服务 live-refinement 路线 |
| 19 | 两者 | 触发 | description 触发词覆盖中文关键词不足（"流程图/拓扑/组网/架构图"在 base description 有拼音外的英文，学术 overlay 无"毕业论文/大论文/学报"等中文触发词） | 低 | description 增补高频中文触发词；跑 trigger 评测回归 |

## 全绿项（明确通过）

- **编码与格式**：两个 SKILL.md 及抽查参考文档均为 UTF-8（CRLF），frontmatter `name`/`description` 齐全且与目录名一致。
- **失效引用**：SKILL.md 引用的 tokens.md、workflows/edit.md、replicate.md 等全部存在，无死链。
- **安全实践**：主题名路径穿越防护、图标名注入校验、Desktop 命令 execFile 无 shell、URL fragment 不上传服务器——质量高于参考仓库。
- **测试基建**：根目录 10 个测试文件（integration/security/academic 等）+ scripts 内单测，明显强于 ref 仓库。
- **base/overlay 边界**：职责划分清晰，overlay 不复制 base 资源，路由表互指明确。
- **边质量规则文档**（edge-quality-rules.md）本身合理，问题在实现与文档不同步。

## 参考仓库能力差距（选择性借鉴，不照搬）

| ref/drawio-skill 能力 | 我方现状 | 借鉴建议 |
|---|---|---|
| Graphviz autolayout.py：分层布局 + splines=ortho 航点回放 + cluster 容器 + --tune 双向评分 | 无边感知布局 | 用 elkjs 实现同等能力（离线、纯 Node、复合图原生支持） |
| shape-index.json.gz（10k+ 形状）+ shapesearch.py | 硬编码 ~10 个图标别名 | 引入形状目录做校验与检索 |
| validate.py --score 可读性评分（穿框×20 + 交叉×10 + 边长） | 无评分 | 在 validateEdgeQuality 基础上加布局评分，供 --tune 与回归对比 |
| troubleshooting.md 故障速查表 | 分散在各文档 | 可选：汇总一页故障表 |
| 视觉自检循环（vision 读 PNG，2 轮上限） | SVG 自检（但 SVG 保真损坏） | 修好 SVG 保真后即等效更优（离线无 Desktop 依赖） |

## 外部标准要点（已核实）

- IEEE 图形：推荐字体 Helvetica/Times New Roman/Arial/Cambria/Symbol；成品字号约 9-10pt（可缩至 8pt）；全图字体字号一致；矢量收 PS/EPS/PDF（无 SVG）；线稿 ≥600dpi、灰度/彩色 ≥300dpi；单栏 3.5in / 双栏 7.16in；CVD 无障碍要求颜色+形状双编码。
- draw.io v30+：桌面端内置 ELK 布局（Arrange 菜单）与 Mermaid 打开支持；CLI `--layout`（ref 仓库证实 ≥30 可用、≤29 会破坏参数解析）。
- elkjs vs dagre：dagre 无法处理复合图父节点边（6 年未修），elkjs layered 原生支持复合图 + ORTHOGONAL 边路由 + bendPoints；约 435KB gzip，Mermaid/drawio 官方同源。
- 网络拓扑规范：North-South 方向（外部在上）、三层 core/distribution/access 分行、逻辑图与物理图分离、图例强制、区域边界（DMZ/VLAN/安全域）为一等容器、线型+协议标签双编码。

## 实证记录

测试产物在 `/tmp/drawio-audit/`（会话临时目录，复现命令如下）：

```bash
# 1. 容器坐标错位 + 零长度边（mod-test.yaml：2 modules 2 nodes 1 edge）
node skills/drawio/scripts/cli.js mod-test.yaml mod-test.drawio --validate   # PASS
node skills/drawio/scripts/cli.js mod-test.yaml mod-test.svg                 # SVG 中两节点均在 (24,64)，边 x1=x2/y1=y2

# 2. 单边 0.25 偏心挂点：见 mod-test.drawio edge style exitY=0.25;entryY=0.25

# 3. 多行图例折行失效：plain-test.yaml type:text 多行标签 → SVG <text> 含裸换行，无 tspan

# 4. 模板 strict 失败：
node skills/drawio/scripts/cli.js skills/drawio-academic-skills/references/templates/neural-network-architecture-compact.yaml tpl.drawio --validate
# → 26 warnings（11 条边质量，含 -60px 负段）

# 5. academic 主题圆角吞没：mod-test.drawio module style 含 rounded=1;arcSize=12（主题声明 rounded:0）
```

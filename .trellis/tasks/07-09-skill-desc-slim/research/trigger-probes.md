# 触发探针集与评测方法

## 方法：classification-probe

- **不使用** skill-creator 的 run_loop/run_eval 管道（Windows select-on-pipe 缺陷 → 假 0% 召回）。
- 每个条件（baseline = 当前 description；candidate = PRD 方向 B 草案）各跑 **2 个独立子代理**。
- 子代理只收到：5 条 skill（name+description，含 3 条固定干扰项）+ 26 条用户消息（乱序混排、无期望标签），要求逐条判定"应触发哪个 skill 或 none"。
- 干扰项（两条件下文本完全一致）：`beautiful-mermaid-editor`、`docx`、`dataviz`。

## 判分规则

- 正例：判定 = 期望 skill 记正确。
- 负例：判定 ≠ drawio 且 ≠ drawio-academic-skills（none 或干扰项均可）记正确。
- 每条件聚合：两跑全对 = 稳定正确；一对一错 = 抖动；两跑全错 = 错误。
- **回退定义**：baseline 稳定正确 → candidate 两跑全错；或互斥对在 candidate 两跑中任一侧全错。
- 通过门槛（PRD 验收）：candidate recall/precision ≥ baseline；4 组互斥对 100% 正确。

## 探针集（26 条）

| id | 用户消息 | 期望 |
| --- | --- | --- |
| q01 | 画一张微服务系统架构图，包含网关、各服务和数据库 | drawio |
| q02 | 为我的 IEEE 论文画一张系统架构图，需要 camera-ready 质量 | academic |
| q03 | 把这份周报整理成一份 Word 文档 | 非本组（docx/none） |
| q04 | Convert this Mermaid flowchart into a draw.io diagram file | drawio |
| q05 | 把这篇论文里的 Figure 3 复刻成可编辑矢量图，用在我的毕业论文里 | academic |
| q06 | Draw a network topology for our campus network with VLANs and gateways | drawio |
| q07 | 用 matplotlib 画一个销量柱状图 | 非本组（dataviz/none） |
| q08 | Create the workflow figure for our CVPR camera-ready submission | academic |
| q09 | 帮我把这份 CSV 员工名单转成 drawio 组织结构图 | drawio |
| q10 | 画一张博士学位论文第三章用的技术路线图 | academic |
| q11 | 修复 spec-to-drawio.js 里自动布局的 bug | 非本组（none，编码任务） |
| q12 | 编辑现有的 system.drawio，把认证模块拆成两个服务 | drawio |
| q13 | Redraw this pipeline figure for a journal manuscript; it must stay readable at single-column width | academic |
| q14 | 复刻这张白板照片里的流程图，做成可编辑的 drawio 文件 | drawio |
| q15 | 为期刊投稿准备一张带公式的模型结构图 | academic |
| q16 | Create a UML sequence diagram for the login flow | drawio |
| q17 | 帮我写论文的 related work 部分 | 非本组（none，写作无图） |
| q18 | 画一个数据处理流程图 | drawio（互斥对 B1） |
| q19 | 画一个论文方法章节用的数据处理流程图 | academic（互斥对 B2） |
| q20 | 把这个 .drawio 文件导出为 PNG | drawio |
| q21 | 复刻这张网络拓扑图 | drawio（互斥对 C1） |
| q22 | 复刻这篇 paper 里的网络拓扑图，用于会议投稿 | academic（互斥对 C2） |
| q23 | 帮我画一个带 LaTeX 公式的技术示意图 | drawio（互斥对 D1） |
| q24 | 画我论文里要用的带 LaTeX 公式的方法示意图 | academic（互斥对 D2） |
| q25 | 在 README 里用 Mermaid 语法写一个时序图 | 非本组（none） |
| q26 | 把这张系统架构图截图做成 PPT 幻灯片 | 非本组（none/其他） |

覆盖核对：drawio 正例 11（≥8 ✓）、academic 正例 9（≥8 ✓）、互斥对 4 组：A(q01,q02)、B(q18,q19)、C(q21,q22)、D(q23,q24)（≥4 ✓）、负例 6（≥4 ✓）。

互斥对设计意图：同一图型（架构/流程/拓扑/公式示意）仅靠"论文/paper/投稿"语境词区分两个 skill，直接压测被精简的边界枚举。

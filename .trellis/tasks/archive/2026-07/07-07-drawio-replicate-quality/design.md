# Design: drawio 复刻质量优化（直线正交路由、透明文本框、原生连线）

## 1. 根因分析（对照：工业系统架构原图 vs codex 复刻样张）

| 症状 | 根因 | 证据位置 |
| --- | --- | --- |
| 垂直/水平箭头出现 Z 形折弯 | `buildRoutedEdges` 在源面与目标面**各自独立**按固定比例槽位（`FACE_SLOTS = 0.25/0.5/0.75/...`）分配 exitX/entryX。比例乘以两个不同宽度/偏移的形状后，绝对坐标几乎必然不共线，`orthogonalEdgeStyle` 于是插入折弯 | spec-to-drawio.js:1560（FACE_SLOTS）、1714-1725（独立分组分配） |
| 折弯无人发现 | `validateEdgeQuality` 只查角点、短末段、退化 waypoint、走廊槽位复用，**没有任何绝对坐标共线检查**；edge-quality-rules.md 仅在人工 Audit Checklist 里问一句 "Would aligning two nodes make the arrow straight?" | spec-to-drawio.js:1986-2064；edge-quality-rules.md:31 |
| 纯文本框白底遮挡 | 转换器对 `type: text` 默认已是 `fillColor=none;strokeColor=none;labelBackgroundColor=none`（spec-to-drawio.js:982-1027），但 `node.style?.fillColor` 优先级最高——replicate 的 preserve-original 取色把白画布色写进文本节点样式即被放行；手写 XML 路径完全无兜底 | spec-to-drawio.js:982-986；replicate.md Text Fidelity Pass 仅是 "default to none" 的软措辞 |
| 竖排中文标签断行/截断（「能耗指 标计算」「过程数据报▂」） | ①YAML label 的 `\n` 经 `escapeXmlAttr` 以字面换行写入 XML 属性，XML 属性值规范化将其折叠为空格，多行结构丢失后靠 `whiteSpace=wrap` 随机断行；②文本节点硬编码 `overflow=hidden` 截断超出内容；③无竖排一字一行模式指引 | spec-to-drawio.js:1014（overflow）；math/index.js `escapeXmlAttr`（无换行处理）；buildXml label 直出 |
| 边标签互相叠压（「被控变量决」×「工业大数据」） | 无标签碰撞 lint | — |
| 非原生箭头风险 | 转换器输出的边始终带 `source`/`target`（spec-to-drawio.js:1308），但 agent 手写/编辑 XML 时可产生浮动边或用 `shape=singleArrow` 等形状冒充连线，`validateXml()` 不检查 | spec-to-drawio.js:2713 一带仅有 edgePattern 统计 |

结论：三层同做——①路由算法保证「构造即直线」，②校验层兜底（含手写 XML 路径），③文档把软建议升级为 Blocking Rule。

## 2. 方案设计

### 2.1 共享坐标路由（R1，替换盲槽位分配）

以垂直边为例（水平边对称，X/Y 互换）：

1. 面向对确定后（`detectEdgeFaces` 不变），对每条无显式连接点、无 waypoint 的边计算**共享绝对 X**：
   - 候选值 = 较窄一侧形状的面中心 X（人画图习惯：小箱中心垂直连入大箱）。
   - 夹取（clamp）到两形状面的公共 X 区间 `[max(srcL,tgtL)+m, min(srcR,tgtR)-m]`，边距 m=8px 避开角点（沿用禁角规则）。
   - 公共区间不存在（横向错位超过面宽）→ 回退现有槽位行为，该边本来就需要折弯，不算违规。
2. 同一面多条边：以**边的共享 X** 为分配单元（不是面比例）。按共享 X 排序；相邻间距 < 30px 时在各自公共区间内对称扩散，扩散时**整条边的两端一起移动**，共线性不破坏。
3. 反算比例：`exitX = (sharedX - src.x) / src.width`，`entryX = (sharedX - tgt.x) / tgt.width`，保留 4 位小数；`exitY/entryY` 按面取 0/1 不变。显式 `style.exitX` 等用户值仍以 `??` 优先，行为兼容。
4. 双向平行边（A→B 与 B→A）：视为同一走廊的两条边，共享 X 各自偏移 ±15px 以上，保持两条平行直线（对应原图 Web浏览器⇄Web服务器 双箭头）。

### 2.2 直线度审计（R1.3）

`validateEdgeQuality` 新增：对每条无 waypoint 且已解析连接点的正交边计算
`delta = |absExit - absEntry|`（垂直边比 X，水平边比 Y）：

- `delta == 0`：通过。
- `0 < delta` 且两面存在公共区间：报 warning「可避免的折弯，公共区间 [a,b] 内存在共线解」；`--strict` 视为失败。
- 公共区间不存在：不报（真实错位连接）。

### 2.3 纯文本框强制透明（R2）

- `generateNodeStyleWithSpec`：`isTextNode` 分支忽略 `node.style.fillColor/strokeColor`，恒输出 `fillColor=none;strokeColor=none;labelBackgroundColor=none`；发现被忽略的显式填充时推 warning（提示改用形状节点或 `formula` 类型）。**不设逃生口**——"单纯文本框"语义上就是无填充，需要底色的标注应使用 `formula`（保留其白底带边框设计，超出本任务范围）或普通形状节点。
- `validateXml()` 兜底（覆盖手写 XML）：正则扫描 `style` 以 `text;` 开头的 vertex，若含 `fillColor=#FFFFFF|#FFF|white`（大小写不敏感）→ warning，`--strict` 失败。
- replicate.md Text Fidelity Pass 措辞升级：取色环节明确「画布/背景色不得赋给文本框填充」，从 "default to none" 改为强制规则并入 Step 8 校验清单。

### 2.4 原生绑定连线校验（R3）

`validateXml()` 新增两查：

- `edge="1"` 的 mxCell 缺 `source=` 或 `target=` → 逐条报「浮动边，须绑定到节点」。
- vertex 样式含 `shape=singleArrow|shape=doubleArrow|shape=triangle|mxgraph.arrows2` → 报「箭头形状冒充连线，改用绑定边」。（`triangle` 若确有合法用途，按样式上下文放宽为 warning，不做 strict 失败——实现时以误报率定档。）

### 2.5 竖排 CJK 标签与文本尺寸（R4）

- 竖排模式 = 文本节点 label 一字一行（`\n` 分隔，渲染层转 `<br>`，需确认现有 label 换行处理路径），宽度 ≈ fontSize + 12，高度 ≈ 字数 × fontSize × 1.4 + padding。**不用 `horizontal=0`**（整体旋转 90°，不符合中文竖排）。
- 文本节点默认样式去掉 `overflow=hidden` 改为不裁剪；bounds 缺省时按内容估算最小尺寸（CJK 每字 ≈ fontSize 宽，Latin ≈ 0.6×fontSize），bounds 显式给出但估算内容超出 >20% 时 warning。
- 标签碰撞 lint（近似包围盒）：edge label 之间、edge label 与非自身连线、文本框与连线段的矩形相交 → warning。定位为 lint 而非布局引擎，允许少量误报，只在 `--validate`/`--strict` 报告。

### 2.6 文档与措辞（R1.4/R2.2/R3.2/AC7）

- edge-quality-rules.md：Blocking Rules 增加第 8 条「共线优先：垂直/水平边先取公共区间共线解；仅当公共区间不存在才允许折弯或 waypoint」，Default Face Policy 改为「以对端投影定槽位，0.25/0.5/0.75 仅作无位置信息时的回退」。
- replicate.md / tokens.md（Text & Label Styling）/ SKILL.md：透明文本框强制规则、原生绑定边规则、竖排标签模式。
- drawio-academic-skills：publication-overlay.md 等引用处同步一句措辞，不改结构。

### 2.7 箭头头部默认风格（R5）

`generateConnectorStyle`：`endArrow` 为 `block`/`classic` 且未显式给 `endSize` 时补 `endSize=12`（优先级 `edge.style.endSize` > `theme.connector.<type>.endSize` > 默认 12）；存在 `startArrow` 时对称补 `startSize`。达成原图那种粗实心大三角箭头观感，且仍是原生绑定边的普通样式字段（服从 R3）。文档同步：edge-quality-rules.md 收录默认箭头风格；replicate.md Connector Type Mapping 注明。

### 2.8 标签换行保真（R6）

`buildXml` 中节点/模块/边标签在 `prepareMathLabel` 之后：raw label 不含数学定界符（`$$`、`\(`、`\[`、反引号）时，把残留的字面 `\n` 替换为 `&lt;br&gt;`（XML 解析后成为 `<br>`，`html=1` 渲染为换行）。数学标签跳过，避免打断 MathJax。竖排一字一行标签即 `label: "可\n视\n化\n数\n据"`，配合 `estimateTextSize` 现有多行估算（按 `\n` 分行）自然得到窄高框。`validateXml` 的新增检查（§2.4）与文本白底扫描均改为返回 `warnings` 字段（`{valid, errors, warnings}` 追加字段，向后兼容）：import 外部文件容忍，`--validate` 打印，生成管线 `--strict` 拦截。

## 3. 兼容性与风险

- **产出 XML 变化**：所有依赖自动槽位的 spec 生成结果都会变（变直）。示例 fixture（login-flow-test.drawio 等）与快照类断言需再生成；`references/examples/*.yaml` 逐个重跑 CLI 确认无新 warning。
- **显式样式不受影响**：`style.exitX ?? ...` 的用户优先逻辑保留。
- **误报风险**：碰撞 lint 与箭头形状检查按 warning 起步，`--strict` 才拦截；直线度审计只在「存在共线解却没用」时报，天然低误报。
- **回滚**：算法/校验/文档分层提交，出问题 `git revert` 对应层即可；无运行时开关。

## 4. 验证形状

核心回归资产 = 依据原图建模的 `industrial-architecture` YAML fixture（宽顶箱 + 4 条垂直边、双向平行边、圆柱库、虚线模块、竖排中文标签、透明文本标注齐全）：

1. 修复前跑 CLI 记录基线（有折弯、有 warning 清单）。
2. 修复后：`--strict` 零告警、SVG 目视直线、连接点绝对坐标共线（脚本断言）。
3. `node --test` 全绿（scripts/ 下现有 + 新增用例）。

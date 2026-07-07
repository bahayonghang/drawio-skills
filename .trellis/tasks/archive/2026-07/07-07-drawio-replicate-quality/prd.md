# drawio skill 复刻质量优化：直线正交路由、透明文本框与原生连线

## Goal

消除 `/drawio replicate`（及 create/edit）产出图中的三类质量缺陷，使复刻结果达到原图级别的连线与文字观感：

1. **箭头歪歪扭扭**：本应垂直/水平的直线箭头被正交路由折成 Z 形折弯（源头：连接点槽位在源/目标面上按各自形状的固定比例独立分配，绝对坐标不共线）。
2. **纯文本框白底**：单纯文本框（standalone text）出现白色填充，遮挡网格与连线。要求**纯文本框一律透明背景**（`fillColor=none`），不允许白色背景。
3. **非原生箭头**：连接必须使用 draw.io 原生的「两个模块之间绑定连线」（mxCell edge 带 `source`/`target` 引用，随节点移动），禁止用额外添加的实心箭头形状或无锚定的浮动连线模拟连接。

背景：对照「工业系统架构原图 vs codex 复刻结果」发现上述缺陷（复刻样张见任务 research/ 或会话记录，2026-07-07）。

## Requirements

### R1 直线正交路由（核心）

- R1.1 转换器 `buildRoutedEdges`（skills/drawio/scripts/dsl/spec-to-drawio.js:1560-1725）自动分配连接点时，垂直边的 exit/entry 换算为**绝对 X 坐标后必须相等**（水平边同理为绝对 Y 相等），使无 waypoint 的正交边默认渲染为一条直线段。
- R1.2 同一面上有多条边时，槽位分配须基于**对端节点的中心坐标排序与投影**，而不是盲取 0.25/0.5/0.75 固定比例；分配后仍须满足 R1.1 的共线要求，且相邻通道间距 ≥ 30px（沿用现有 corridor 规则）。
- R1.3 校验层（`validateEdgeQuality` 及 `--validate`/`--strict`）新增「直线度审计」：无 waypoint 的正交边，若绝对 exit/entry 坐标差 delta 满足 0 < delta ≤ 阈值（建议 24px），报 warning 并提示对齐方式；`--strict` 下视为失败。
- R1.4 文档 `references/docs/edge-quality-rules.md` 把「共线直线优先」升级为 Blocking Rule：先对齐节点/连接点使线变直，再考虑 waypoint；禁止盲选固定槽位比例。

### R2 纯文本框透明背景（用户硬性要求）

- R2.1 纯文本节点（semantic type `text`，含 caption/callout/legend/竖排标签）最终样式必须为 `fillColor=none;strokeColor=none;labelBackgroundColor=none`；YAML 显式给出白色/浅色填充时，转换器忽略或校验拦截（warning，`--strict` 失败），除非用户在 style 中显式声明 `allowFill: true` 之类的逃生口（逃生口设计在 design.md 定夺，默认不允许白底）。
- R2.2 replicate 工作流的取色环节（preserve-original）不得把画布底色赋给文本框填充；`references/workflows/replicate.md` 的 Text Fidelity Pass 相应措辞从 "default to none" 升级为强制规则。
- R2.3 边标签（edge label）保持透明：不使用 `labelBackgroundColor` 遮线（已有规则），校验层可发现 edge label 带白底时给出 warning。

### R3 原生绑定连线

- R3.1 所有连接必须是 `edge="1"` 且同时带 `source` 与 `target` 节点引用的原生边；`--validate`/`validateXml()` 新增检查：发现缺 source/target 的浮动边、或用 `shape=singleArrow`/`shape=triangle` 等箭头形状充当连线时报错。
- R3.2 SKILL.md 与 create/edit/replicate 工作流文档明确该规则，覆盖 agent 手写 XML 绕过 YAML 管线的场景。

### R4 竖排 CJK 标签与文本框尺寸（复刻样张暴露的伴生缺陷）

- R4.1 提供竖排中文标签模式：一字一行（显式换行），文本框宽度按 fontSize+padding 取值；禁止靠窄框自动 wrap 产生「能耗指 标计算」式断行。
- R4.2 文本节点当前硬编码 `overflow=hidden` 导致截断（如「过程数据报▂」）；改为内容自适应或加入「内容尺寸估算 vs bounds」校验，避免文字被裁剪。
- R4.3 校验层新增文本/标签碰撞检查：edge label 与连线、edge label 之间、文本框与连线的包围盒重叠时给出 warning（如样张中「被控变量决」与「工业大数据」互相叠压）。

### R5 箭头头部风格（2026-07-07 追加）

- R5.1 连接线箭头默认使用**粗实心大三角**观感（draw.io 原生 `endArrow=block;endFill=1` 且加大 `endSize`，参考原图箭头样张）：转换器为 block/classic 箭头补默认 `endSize=12`（YAML `edge.style.endSize` 与主题可覆盖）；带 `startArrow` 的边同理补 `startSize`。
- R5.2 该风格仍必须通过原生绑定边实现（服从 R3），不得用箭头形状拼装。

### R6 标签换行保真（实施侦查发现的伴生缺陷）

- R6.1 YAML label 中的 `\n` 目前以字面换行符写入 XML 属性，被 XML 属性值规范化折叠为空格，导致多行标签依赖 `whiteSpace=wrap` 随机断行（复刻样张「能耗指 标计算」的直接成因）。产出层须把非数学标签的 `\n` 转为 `<br>`（属性内转义为 `&lt;br&gt;`），数学标签（含 `$$`/`\(`/反引号）不转换以免破坏 MathJax。

### 约束

- 保持 YAML-first 离线管线；不引入 MCP/在线依赖。
- 改动落在 skills/drawio（转换器、校验、文档、示例）；skills/drawio-academic-skills 仅在引用相关规则处同步措辞，不做结构改动。
- 现有测试（spec-to-drawio.test.js 等）全部通过；行为变化处补充/更新用例。
- 不重排既有示例 YAML 的语义；如示例受新校验影响，修正示例本身使其达标。

## Acceptance Criteria

- [x] AC1 用本任务附带的「工业架构复刻回归样例」YAML（research/ 中固化）跑 CLI：生成的 .drawio 中所有无 waypoint 正交边的绝对 exit/entry 坐标共线（垂直边 X 相等、水平边 Y 相等），导出 SVG 目视无 Z 形折弯。
- [x] AC2 同一面多条边（如宽箱顶部 4 条垂直边）各自与对端节点中心对齐，互不交叉、间距 ≥ 30px。
- [x] AC3 YAML 中给纯文本节点写 `fillColor: "#FFFFFF"`，产物仍为透明（或 `--strict` 下构建失败并给出明确报错），默认输出样式含 `fillColor=none;strokeColor=none;labelBackgroundColor=none`。
- [x] AC4 构造含浮动边（无 source/target）与 `shape=singleArrow` 冒充连线的 .drawio，`--validate` 能逐条报出。
- [x] AC5 竖排标签示例（如「可视化数据」「上位操作指令」）按一字一行渲染，无 wrap 断行、无截断字符。
- [x] AC6 `node --test` 全绿；新增路由/校验逻辑有对应单测（直线度、白底拦截、浮动边检测、标签碰撞至少各 1 例）。
- [x] AC7 edge-quality-rules.md、replicate.md、tokens.md（Text & Label Styling 节）与 SKILL.md 的规则措辞更新到位，drawio-academic-skills 引用处同步。
- [x] AC8 默认生成的 block 箭头带 `endSize=12`（粗实心大三角观感），`edge.style.endSize` 可覆盖。
- [x] AC9 多行 label（含竖排一字一行）在产物 XML 中以 `&lt;br&gt;` 呈现，draw.io 打开后换行保真；数学标签不受影响。

## Notes

- 复刻对照结论（详见 design.md 根因分析）：转换器已默认文本透明、已生成原生绑定边——缺陷主要来自 ①槽位分配算法不保证共线，②取色/手写 XML 路径缺少强制校验兜底。因此本任务「算法修正 + 校验兜底 + 文档升级」三层同做。
- 竖排文字不使用 `horizontal=0`（会整体旋转 90°，不符合中文竖排习惯），用一字一行换行实现。

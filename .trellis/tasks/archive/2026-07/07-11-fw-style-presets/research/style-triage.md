# Style Triage: fireworks 8 套风格 → drawio 主题

来源：`ref/fireworks-tech-graph/references/style-{1..8}-*.md`。
对照资产：`skills/drawio/assets/themes/{tech-blue,nature,dark,high-contrast,academic,academic-color,arch-dark}.json`。
判定口径：drawio `theme.schema.json` 只接受实心 `#RRGGBB` 令牌 + 字体栈 + 描边/圆角；渐变、rgba 透明、SVG 滤镜（blur/glow/drop-shadow）、图案 pattern、逐元素 opacity、text-transform、letter-spacing、标题专用字体均**不可移植**。

## 结论总览

| # | fireworks 风格 | 决定 | 落地文件 |
|---|---|---|---|
| 1 | Flat Icon | 不移植 | — |
| 2 | Dark Terminal | **移植** | `assets/themes/dark-terminal.json` |
| 3 | Blueprint | **移植** | `assets/themes/blueprint.json` |
| 4 | Notion Clean | **移植** | `assets/themes/notion-clean.json` |
| 5 | Glassmorphism | 不移植 | — |
| 6 | Claude Official | 不移植（低价值） | — |
| 7 | OpenAI Official | 不移植 | — |
| 8 | Dark Luxury | **移植** | `assets/themes/dark-luxury.json` |

## 逐套令牌与理由

### 1 Flat Icon — 不移植
核心令牌：bg `#ffffff`、box `#ffffff`/stroke `#d1d5db`、text `#111827`/`#6b7280`、按流类型选箭头色（蓝 `#2563eb`/红 `#dc2626`/绿 `#16a34a`/紫 `#9333ea`）+ 六种 icon tint 底。
对照 `tech-blue.json`：同为浅色、圆角 8、蓝主色、多彩语义节点，重复度高。Flat Icon 唯一差异化点是"按流类型分箭头颜色"，而这一点在本仓库已由 connector 语义类型（primary/data/control/memory_*/feedback 各自配色）覆盖。**为何不移植**：与 tech-blue/default 浅色主题功能重叠，无新增气质。icon tint 底色属于逐节点手绘装饰，非主题级令牌。

### 2 Dark Terminal — 移植（vs dark.json 令牌级对比）
| 维度 | dark.json（现有） | style-2 Dark Terminal |
|---|---|---|
| 画布底 | `#0F172A`（slate-950，带蓝调） | `#0f0f1a`（近黑，蓝调更弱）→ `#1a1a2e` 渐变 |
| 面板底 | `#1E3A5F`（蓝填充节点） | `#0f172a` 面板 + 分功能 tint（紫/橙/绿/蓝） |
| 主字体 | Inter 无衬线 | **等宽栈**（SF Mono/Fira Code/Cascadia） |
| 强调色 | 蓝 `#60A5FA` 单主色 | 霓虹紫 `#a855f7`/橙 `#f97316`/绿/蓝多强调 |
| 气质 | 通用深色演示 | 黑客终端、霓虹于近黑 |
**为何移植**：dark.json 是"通用无衬线深色"，Dark Terminal 差异在（a）等宽字体优先、（b）近黑底、（c）霓虹多强调色——三点合起来构成独立气质，非 dark.json 的换色变体。
**不可移植记录**：`#0f0f1a→#1a1a2e` 线性渐变底（改用纯色 `background`+`canvas.gridColor` 近似）；关键节点 glow（`feGaussianBlur`）滤镜；`letter-spacing:0.02em`。等宽字体只设 latin 栈，`typography.cjk` 留空 → 由默认字体策略回退（不破坏 SimSun/Times CJK 偏好）。

### 3 Blueprint — 移植（无对应）
核心令牌：bg `#0a1628`、grid `#112240`、panel `#0d1f3c`、stroke 青 `#00b4d8`、radius **2（锐角）**、text `#caf0f8`/`#90e0ef`、accent 青/白/橙 `#f77f00`/绿 `#06d6a0`，等宽 Courier。
对照：现有 7 主题无"工程蓝图（navy + 青 + 锐角 + 等宽 + 网格）"气质。**为何移植**：正式架构/基础设施文档场景空缺，气质独立。
**不可移植记录**：`<pattern id="grid">` 网格叠层（用 `canvas.gridColor=#112240` 近似，无法画真实网格线）；角标 L 形 corner-bracket 边框；`text-transform:uppercase`；`letter-spacing:0.05em`；右下 title-block。锐角用 `node.rounded=2`、`module.rounded=2` 表达。

### 4 Notion Clean — 移植（无对应）
核心令牌：bg `#ffffff`、box `#f9fafb`/stroke `#e5e7eb`、radius 4、text `#111827`/`#374151`/`#9ca3af`、单一蓝箭头 `#3b82f6`、灰分隔 `#d1d5db`、系统无衬线、无阴影无图标。
对照：tech-blue 偏饱和多彩，nature 绿单色，academic 学术白——均非"极简灰阶文档嵌入"气质。**为何移植**：Notion/Confluence/GitHub wiki 内嵌文档场景空缺。
**不可移植记录**：几乎全部可移植（本就 flat 无阴影无渐变）。差异说明：Notion 原规范主张"全图单一蓝箭头"，本仓库 connector 为多语义类型，移植时保留蓝为 primary/feedback，其余语义类型用克制灰阶（`#9ca3af`/`#d1d5db`）+ 绿 memory，属有意适配而非违背。

### 5 Glassmorphism — 不移植
核心令牌：`#0d1117→#161b22` 渐变底、玻璃卡 `rgba(255,255,255,0.05)` + `backdrop-filter: blur(12px)`、`feGaussianBlur`、radialGradient 环境光晕、渐变文字 `fill=url(#grad)`。
**为何不移植**：全部立身之本（半透明 rgba 填充、模糊、渐变底、光晕、渐变文字）在 drawio 主题令牌体系无法表达——schema 只接受实心 `#RRGGBB`。强行落地会退化成"普通深色主题"，丢失全部玻璃气质，得不偿失。

### 6 Claude Official — 不移植（低价值）
核心令牌：暖米底 `#f8f6f3`、pastel 填充（蓝 `#a8c5e6`/teal `#9dd4c7`/beige `#f4e4c1`/灰 `#e8e6e3`）、深灰描边 `#4a4a4a`、radius 12、粗描边 2.5、系统无衬线。
对照：气质确与现有浅色主题（tech-blue 冷、nature 绿、academic 白）不同（暖米 + pastel）。**为何不移植**：设计阶段评估为"低优先、价值有限"——暖米 pastel 主要服务演示气质，功能上与 tech-blue/nature 的"浅色文档/架构"定位重叠，且软阴影 `feDropShadow` 不可移植会削弱其招牌暖感。留待有明确暖色演示需求时再作为 nature 变体补。（若后续需要，令牌已在此备好可直接落地。）

### 7 OpenAI Official — 不移植
核心令牌：纯白底 `#ffffff`、白填充 + 浅灰边 `#e5e5e5`、绿 `#10a37f` 品牌强调、极细边 1.5、系统字体、无阴影无渐变。
对照 `academic.json`（白底、白节点填充 `#FFFFFF`）与 default/tech-blue：极简白 + 细灰边高度重复。**为何不移植**：与 academic 极简白重叠；差异仅"绿色品牌强调"，可由 connector 语义色或单点覆盖实现，不值得单列主题。

### 8 Dark Luxury — 移植（vs arch-dark 令牌级对比）
| 维度 | arch-dark.json（现有） | style-8 Dark Luxury |
|---|---|---|
| 画布底 | `#020617`（slate-950，**冷蓝黑**） | `#0a0a0a`（**纯黑无蓝调**） |
| 主强调 | 青 `#22D3EE`（冷） | 香槟金 `#d4a574`（**暖**） |
| 节点填充 | 分色多彩填充（emerald/violet/amber…） | 统一 `#111111`，仅描边分桶 |
| 标题字体 | 无衬线 | Georgia 衬线（仅标题） |
| 气质 | 云架构冷色系 | 编辑感/奢华、金于纯黑 |
**为何移植**：arch-dark 是冷蓝黑多彩填充；Dark Luxury 差异在（a）纯黑无蓝、（b）暖金唯一强调、（c）统一深填充仅描边分桶——暖冷取向相反，非 arch-dark 变体。填补"高级编辑感深色"（README hero、大会 slide、知识库）空缺。
**不可移植记录**：标题专用 Georgia 衬线——主题无"标题级字体"槽位，`typography.primary` 若设衬线会波及全部节点文本并伤 CJK 小字，故 primary 保持无衬线、金色气质仅由颜色承载（衬线招牌无法在主题级还原，记录在案）；中央 radial 环境光晕；容器 `opacity` 分级；`typography.cjk` 留空回退默认策略。

## 通用不可移植清单（跨风格）
- 线性/径向**渐变**底与渐变文字（style 2/5/8）。
- **SVG 滤镜**：glow（`feGaussianBlur`+`feMerge`）、drop-shadow（`feDropShadow`）、blur。
- **半透明 rgba** 填充/描边（style 5）。
- **pattern 网格**真实线（style 3，改 `canvas.gridColor` 近似）。
- **text-transform / letter-spacing / 标题专用字体**（style 2/3/8）。
- 逐元素 **opacity**、corner-bracket、title-block 等手绘装饰。

## 待补项（与 R2 对齐）
四套新主题 connector 均已覆盖现有全部 10 种类型（primary/data/optional/dependency/bidirectional/control/memory_read/memory_write/async/feedback）。若 R2 新增额外 edge type，需回补对应色板条目；当前无待补。

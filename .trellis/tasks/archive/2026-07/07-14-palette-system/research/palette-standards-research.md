# 科研论文与工程图表配色系统调研报告

> 调研日期：2026-07-14。所有 HEX 值均已对照官方源码/官方文档核实（核实来源见各节链接）。
> 用途：为 drawio-skills 独立 palette 层设计提供依据。

---

## 1. 学术出版需求（硬约束）

### 1.1 IEEE

来源：[IEEE Author Center - Resolution and Size](https://journals.ieeeauthorcenter.ieee.org/create-your-ieee-journal-article/create-graphics-for-your-article/resolution-and-size/)、[IEEE Books - Create Original Graphics](https://books.ieeeauthorcenter.ieee.org/prepare-your-book-manuscript/create-original-graphics/)、[T-MTT Information for Authors](https://mtt.org/publications/t-mtt/information-for-authors/)

- 线上 (Xplore) 彩色免费，**印刷版默认自动转灰度**；印刷彩色需作者付费。
- 因此事实要求：**图必须在灰度打印下可读**。官方建议"避免 pastel 色（lime、yellow 等）"，因为直接转灰度后区分度极差。
- 官方明确建议：颜色 + 形状/线型双编码（实线/虚线、不同标记符号、填充图案），"检查灰度打印件能否正确解读"。
- 提交 RGB 色彩模式，出版方转 CMYK；矢量优先（EPS/PDF），位图 ≥300 dpi（彩色/灰度）、≥600 dpi（线稿）。
- 提及 CVD（红绿、蓝绿、黄红难分）应回避。

### 1.2 Elsevier

来源：[Artwork and media instructions](https://www.elsevier.com/about/policies-and-standards/author/artwork-and-media-instructions)

- 非强制但官方建议：色盲影响 5–10% 人口；建议用色盲模拟工具（Color Oracle / Coblis / Photoshop Proof Setup）检查；"先问是否真的需要颜色"，考虑单色 + 形状/位置/线型区分。
- 色彩空间：RGB 优先；印刷彩色多数期刊需付费，线上恒为彩色。

### 1.3 Nature / Science 系

来源：[Nature research figure guide - specifications](https://research-figure-guide.nature.com/figures/preparing-figures-our-specifications/)、[Nature Reviews artwork guide (PDF)](https://www.nature.com/reviews/pdf/artworkguide.pdf)

- Nature 明确要求使用**可访问色板**，官方点名示例即 **Wong/Okabe-Ito**（Wong, B. Nature Methods 8, 441, 2011）。
- 明确规则：**避免红/绿对比**；荧光图像建议重着色为绿/品红 (green/magenta)；**避免 rainbow/jet 色标**；网站遵循 WCAG 2.1 AA。
- 概念图：黑色文字为主、限制颜色数量、颜色用于层级/分类而非装饰。

### 1.4 博士学位论文（黑白打印安全）

常见事实做法（各校要求汇总的社区共识，非单一标准）：

- 假设终稿被黑白复印/打印：折线用**线型 + 标记**区分，面积用**灰阶 + 填充图案 (hatching)** 区分，颜色仅作冗余编码。
- 若用彩色，选**亮度单调分离**的色板（转灰度后仍有序可分），如 Tol high-contrast、viridis 采样。
- 纯灰阶推荐间隔 ≥25% 亮度：如 `#000000, #555555, #999999, #CCCCCC` + 白底描边。

---

## 2. 事实标准配色方案（HEX 已核实）

### 2.1 Okabe-Ito / Wong（Color Universal Design, 8 色）

来源：[jfly CUD](https://jfly.uni-koeln.de/color/)、[easystats see](https://easystats.github.io/see/reference/okabeito_colors.html)

`#E69F00`(橙) `#56B4E9`(天蓝) `#009E73`(蓝绿) `#F0E442`(黄) `#0072B2`(蓝) `#D55E00`(朱红) `#CC79A7`(紫红) `#000000`(黑，变体用 `#999999` 灰)

- 色盲安全：**是**（protan/deutan/tritan 全覆盖，学界金标准，Nature 官方点名）
- 灰度安全：**大体是**（亮度有意错开，但黄色在白底需描边）
- 场景：学术通用默认；对无障碍有要求的期刊首选

### 2.2 Paul Tol 定性色板

来源：[Paul Tol's notes (SRON)](https://personal.sron.nl/~pault/)、[khroma vignette](https://packages.tesselle.org/khroma/articles/tol.html)、Tol 技术笔记 SRON/EPS/TN/09-002 v3.2

| 方案 | HEX | 色盲安全 | 灰度安全 |
|---|---|---|---|
| bright (7) | `#4477AA #EE6677 #228833 #CCBB44 #66CCEE #AA3377 #BBBBBB` | 是 | 部分 |
| vibrant (7) | `#EE7733 #0077BB #33BBEE #EE3377 #CC3311 #009988 #BBBBBB` | 是 | 部分 |
| muted (9) | `#CC6677 #332288 #DDCC77 #117733 #88CCEE #882255 #44AA99 #999933 #AA4499`（坏数据 `#DDDDDD`） | 是 | 部分 |
| high-contrast (3) | `#004488 #DDAA33 #BB5566`（+黑白） | 是 | **是（设计目标即灰度可分）** |
| light (9) | `#77AADD #99DDFF #44BB99 #BBCC33 #AAAA00 #EEDD88 #EE8866 #FFAABB #DDDDDD` | 尚可 | 否 |
| medium-contrast (6) | `#6699CC #004488 #EECC66 #997700 #EE99AA #994455`（明暗成对） | 是 | 是（成对明暗） |

注意：Tol 规定定性色板"按给定顺序取色、不得插值"。**light 系设计用途是"填充带标签的单元格"**——这正好是 draw.io 节点填充场景，非常适合做浅底深字节点。

### 2.3 Matplotlib tab10 / seaborn colorblind

来源：matplotlib docs（Tableau 10 派生）、[seaborn/palettes.py](https://github.com/mwaskom/seaborn/blob/master/seaborn/palettes.py)

- **tab10**：`#1F77B4 #FF7F0E #2CA02C #D62728 #9467BD #8C564B #E377C2 #7F7F7F #BCBD22 #17BECF` — 非色盲安全（红绿对存在）、非灰度安全；但辨识度高、读者熟悉度最高
- **seaborn colorblind (10)**：`#0173B2 #DE8F05 #029E73 #D55E00 #CC78BC #CA9161 #FBAFE4 #949494 #ECE133 #56B4E9` — 色盲安全（Okabe-Ito 改良版）

### 2.4 MATLAB 默认

来源：[MATLAB colororder / lines](https://www.mathworks.com/matlabcentral/answers/140453-cycling-through-both-linestyle-and-linecolor)

- **lines (R2014b+ 默认 7 色)**：`#0072BD #D95319 #EDB120 #7E2F8E #77AC30 #4DBEEE #A2142F` — 工科论文中出现频率极高，"MATLAB 味"即事实标准之一；非严格色盲安全但蓝橙主导、表现尚可
- **parula**：连续色图，亮度单调 → 灰度安全，用于热图类，不适合定性节点填充

### 2.5 IEEE 论文图惯例（SciencePlots）

来源：[SciencePlots Gallery](https://github.com/garrettj403/SciencePlots/wiki/Gallery)、[README](https://github.com/garrettj403/scienceplots)

- `ieee` 风格核心不是特定颜色，而是：**单栏宽度 + 600 dpi + 黑白可读**；其默认色循环配合**线型循环**（实线/虚线/点划线），颜色为蓝红黑等高对比少量色。
- SciencePlots 的色盲安全色循环直接内置 Paul Tol 的 bright/vibrant/muted/high-contrast/light。
- 结论：skill 的 "ieee" 配色组应实现为 **黑 + 蓝 + 红少色系（如 `#000000 #0072B2 #D55E00`）或 Tol high-contrast + 线型/图案区分**。

### 2.6 ColorBrewer 定性色板

来源：colorbrewer2.org（Cynthia Brewer）

- **Set2 (8)**：`#66C2A5 #FC8D62 #8DA0CB #E78AC3 #A6D854 #FFD92F #E5C494 #B3B3B3` — 柔和中饱和，适合大面积填充；3 色内色盲安全
- **Dark2 (8)**：`#1B9E77 #D95F02 #7570B3 #E7298A #66A61E #E6AB02 #A6761D #666666` — 深色适合线条/描边；3 色内色盲安全
- **Paired (12)**：`#A6CEE3 #1F78B4 #B2DF8A #33A02C #FB9A99 #E31A1C #FDBF6F #FF7F00 #CAB2D6 #6A3D9A #FFFF99 #B15928` — 浅/深成对，天然适合 draw.io "浅填充 + 深描边" 范式；含红绿，非色盲安全

### 2.7 中国学术圈流行配色

**ggsci 期刊系列**（来源：[ggsci palettes.R 源码](https://rdrr.io/cran/ggsci/src/R/palettes.R)，国内"顶刊配色"教程的事实来源）：

| 系列 | HEX | 备注 |
|---|---|---|
| **npg** (Nature, 10) | `#E64B35 #4DBBD5 #00A087 #3C5488 #F39B7F #8491B4 #91D1C2 #DC0000 #7E6148 #B09C85` | 国内最流行的"Nature 配色" |
| **aaas** (Science, 10) | `#3B4992 #EE0000 #008B45 #631879 #008280 #BB0021 #5F559B #A20056 #808180 #1B1919` | 深饱和 |
| **lancet** (9) | `#00468B #ED0000 #42B540 #0099B4 #925E9F #FDAF91 #AD002A #ADB6B6 #1B1919` | |
| **jama** (7) | `#374E55 #DF8F44 #00A1D5 #B24745 #79AF97 #6A6599 #80796B` | 低饱和、偏莫兰迪质感，**期刊系里灰度表现最好** |
| **nejm** (8) | `#BC3C29 #0072B5 #E18727 #20854E #7876B1 #6F99AD #FFDC91 #EE4C97` | 蓝红经典 |

注意：这些是"期刊风格模仿"，**均含红绿组合、非色盲安全**——作为美学选项提供，不作为无障碍选项。

**莫兰迪系**（来源：[skewcy 学术莫兰迪色盘](https://skewcy.com/2024/08/17/morandi.html)、[AJE 顶刊配色文章](https://www.aje.cn/arc/journal-color-scheme)、[moRandi R 包](https://github.com/narcisoyu/moRandi)）：低饱和灰调风格，无统一标准 HEX。典型代表值：`#8C9E88 #AAB8A8 #C7B299 #D6C4B1 #E8DED3`；扩展常用：`#A27E7E #B5C4B1 #7A8B99 #C9A9A6 #8696A7 #D8CAAF #9CA8B8`。低饱和 → 大面积填充舒适，但**同亮度色多、灰度和色盲区分差**，需深描边补偿。

---

## 3. 工程/架构图事实标准

### 3.1 云厂商官方色

**AWS Architecture Icons 类别色**（来源：[aws-icons-for-plantuml 官方源码](https://github.com/awslabs/aws-icons-for-plantuml/blob/main/source/AWSCommon.puml)，与 draw.io 内置 aws4 库一致）：

| 类别 | HEX |
|---|---|
| Compute / Containers | `#ED7100` (Smile 橙) |
| Storage / IoT | `#7AA116` (Endor 绿) |
| Database / DevTools | `#C925D1` (Nebula 紫红) |
| Networking / Analytics / Serverless | `#8C4FFF` (Galaxy 紫) |
| Security / Front-end | `#DD344C` (Mars 红) |
| Mgmt & Governance / App Integration | `#E7157B` (Cosmos 粉) |
| AI/ML / Migration | `#01A88D` (Orbit 青) |
| General / 深色底 | `#232F3E` (Squid 藏青) |

**Azure**：主色 `#0078D4`（Azure Blue），无公开按类别标准 HEX 表；用 `#0078D4` + 灰阶表达"Azure 风"。来源：[Azure Architecture Icons](https://learn.microsoft.com/en-us/azure/architecture/icons/)。

**GCP**：Google 品牌四色 `#4285F4`(蓝) `#EA4335`(红) `#FBBC04`(黄) `#34A853`(绿)。来源：[Google Cloud icons](https://cloud.google.com/icons)。

### 3.2 C4 model（Structurizr 默认，事实标准）

来源：[structurizr-cli defaults](https://github.com/andyglick/structurizr-cli/blob/master/docs/defaults.md)、[C4-PlantUML 主题源码](https://github.com/plantuml-stdlib/C4-PlantUML/blob/a11242b3/themes/puml-theme-C4_blue.puml)

| 元素 | 背景 | 文字 |
|---|---|---|
| Person | `#08427B` | `#FFFFFF` |
| Software System | `#1168BD` | `#FFFFFF` |
| Container | `#438DD5` | `#FFFFFF` |
| Component | `#85BBF0` | `#000000` |
| External Person/System/Container | `#686868` / `#999999` / `#B3B3B3` | 白 |
| Boundary | 透明底、`#444444` 虚线 | |
| 连线 | `#666666` | |

单色蓝深→浅表达层级，天然色盲安全 + 灰度安全（亮度单调）。

### 3.3 draw.io 默认样式色板

来源：[draw.io style reference（官方）](https://www.drawio.com/docs/reference/diagram-generation/style-reference/)

浅填充 + 深描边成对（即格式面板顶部默认 scheme）：

| 名称 | fillColor | strokeColor |
|---|---|---|
| blue | `#DAE8FC` | `#6C8EBF` |
| green | `#D5E8D4` | `#82B366` |
| yellow | `#FFF2CC` | `#D6B656` |
| orange | `#FFE6CC` | `#D79B00` |
| red | `#F8CECC` | `#B85450` |
| purple | `#E1D5E7` | `#9673A6` |
| pink | `#E6D0DE` | `#996185` |
| gray | `#F5F5F5` | `#666666` |

海量现存 draw.io 图的事实外观，应保留为 "classic" 组以兼容用户预期。浅填充黑字对比度好，但各浅色间灰度几乎不可分（依赖描边与标签）。

---

## 4. 可访问性硬指标

来源：[W3C Understanding SC 1.4.11](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)

- **WCAG 2.1 SC 1.4.11 (AA)**：理解内容所必需的图形对象，与**相邻颜色**对比度 ≥ **3:1**。对 draw.io 图：节点边界/连线 vs 画布背景 ≥3:1；相邻色块之间若边界承载语义也需 3:1，或加深色描边/留白缝隙来达标。有文字标签冗余表达时可豁免（标签本身按 1.4.3 ≥4.5:1）。
- **色盲安全组合**：deuteranopia/protanopia 下安全的对比轴是 **蓝↔橙、蓝↔黄、紫↔绿(慎)**；禁忌 **红↔绿、蓝绿↔灰、纯红↔黑**。生物图像惯例用 **绿/品红** 替代红/绿。
- **灰度可分性**：转灰度后相邻类别的相对亮度差建议 ≥20–25%（即 4–5 档灰阶为上限）；超过 4–5 类必须叠加线型/图案/形状编码。Tol high-contrast 与 C4 单色深浅系按此设计。
- 实操验证工具：Color Oracle、Coblis 模拟；对比度按 WCAG relative luminance 公式计算。

---

## 5. 推荐纳入 skill 的配色组清单

### 学术 (academic)

| # | 组名 | 色值 | 定位 |
|---|---|---|---|
| 1 | `okabe-ito` | §2.1 全 8 色 | **学术默认**。Nature 官方点名，CVD 全覆盖 |
| 2 | `tol-bright` | §2.2 bright 7 色 | 学术备选，饱和度高于 Okabe-Ito |
| 3 | `tol-muted` | §2.2 muted 9 色 | 类别多 (≤9) 时的色盲安全选项 |
| 4 | `tol-light-fill` | §2.2 light 9 色作 fill + 同系深色描边 | Tol 官方指定用途即"填充带标签单元格"，最贴合 draw.io 节点场景 |
| 5 | `ieee-bw` | `#000000 #FFFFFF #555555 #999999 #CCCCCC` + 线型/hatching；强调色仅 `#0072B2 #D55E00` | IEEE 印刷/学位论文黑白打印安全；灰度间隔 ≥25% |
| 6 | `ieee-color` | `#000000 #0072B2 #D55E00`（SciencePlots ieee 惯例）+ 线型循环 | IEEE 线上彩色 + 印刷灰度双可读 |
| 7 | `tol-high-contrast` | `#004488 #DDAA33 #BB5566` + 黑白 | 彩色但灰度安全，适合 camera-ready |
| 8 | `matlab-lines` | §2.4 lines 7 色 | 工科 IEEE 论文"MATLAB 味"事实标准 |
| 9 | `seaborn-colorblind` | §2.3 colorblind 10 色 | 类别多且需 CVD 安全时的备选 |
| 10 | `journal-npg` | §2.7 npg 10 色 | 中国用户"Nature 风"心智；标注非色盲安全 |
| 11 | `journal-jama` | §2.7 jama 7 色 | 期刊风中灰度/低饱和表现最好，兼作"莫兰迪学术风"规范替身 |
| 12 | `morandi`（可选） | §2.7 莫兰迪 8 色 + 强制深描边 | 国内审美需求；必须标注 not colorblind-safe / not grayscale-safe |

### 工程 (engineering)

| # | 组名 | 色值 | 定位 |
|---|---|---|---|
| 13 | `c4-blue` | §3.2 全套（含 external 灰系） | C4/软件架构事实标准；单色深浅、双安全 |
| 14 | `cloud-aws` | §3.1 AWS 8 类别色（Azure `#0078D4`、GCP 四色作变体） | 云架构图与 draw.io aws4 库原生一致 |

### 通用 (general)

| # | 组名 | 色值 | 定位 |
|---|---|---|---|
| 15 | `drawio-classic` | §3.3 全 8 对 fill/stroke | 向后兼容默认外观；流程图/白板风 |

**设计建议**：每组元数据带 `colorblindSafe` / `grayscaleSafe` / `maxCategories` 标志位；学术场景默认 `okabe-ito`，出版黑白场景自动降级 `ieee-bw` 或 `tol-high-contrast`；所有浅色填充统一配 ≥3:1 对比度的深描边以满足 WCAG 1.4.11。

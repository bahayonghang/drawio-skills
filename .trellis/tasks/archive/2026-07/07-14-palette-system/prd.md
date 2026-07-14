# Palette system for drawio skills (academic + engineering color groups)

## Goal

给 `skills/drawio`（base）与 `skills/drawio-academic-skills`（overlay）加入**独立于 theme 的配色组（palette）系统**：内置科研/工程事实标准色板，使用 skill 时按场景通过 AskUserQuestion 选择配色组，并以校验 gate 落实出版硬约束（IEEE 灰度打印、Elsevier 色盲建议、学位论文黑白安全）。

## 背景

现有 theme 机制把颜色、字体、间距、节点样式绑在一个 JSON 里；学术 overlay 只能在 `academic`（灰度）/ `academic-color` 两个 theme 间二选一。缺少：

1. 科研/工程事实标准配色组（Okabe-Ito、Paul Tol、ggsci NPG、SciencePlots ieee、C4、AWS 等）；
2. 独立于排版的配色维度（换颜色必须换整个 theme）；
3. 配色选择交互；
4. 出版硬约束的可校验落地。

调研依据：`research/palette-standards-research.md`（HEX 已对官方源码核实）。

## 目标用户与场景

- 博士毕业大论文（黑白打印安全）、IEEE/ACM 期刊会议（印刷灰度可读）、Elsevier/Nature 系（colorblind-safe）投稿图；
- 工程架构图（C4、云架构、微服务）需要厂商/社区事实标准配色；
- 国内学术审美需求（NPG"Nature 风"、莫兰迪）。

## Requirements

### R1 独立 palette 数据层（已拍板架构）

- 新增 `skills/drawio/assets/palettes/*.json` + palette schema。
- palette 只管颜色（有序类别色 + 可选 fill/stroke 成对 + 可选语义角色映射）；theme 继续管字体/间距/形状/线型；二者正交组合（如 `theme: academic` × `palette: okabe-ito`）。
- 每个 palette 必带元数据：`name`、`displayName`、`category`（academic|engineering|general）、`colorblindSafe`、`grayscaleSafe`、`maxCategories`、`source`（出处 URL）、`venues`（适用场景标签）、`notes`。
- **可扩展性（用户明确要求）**：新增配色组 = 只加一个通过 schema 校验的 JSON，零代码改动；文档写明添加流程；支持从仓库外用户目录加载自定义 palette（沿用现有用户 style preset 目录约定）。

### R2 首批配色组（15 组，HEX 以调研报告为准）

- 学术：`okabe-ito`（学术默认）、`tol-bright`、`tol-muted`、`tol-light-fill`、`ieee-bw`、`ieee-color`、`tol-high-contrast`、`matlab-lines`、`seaborn-colorblind`、`journal-npg`、`journal-jama`、`morandi`；
- 工程：`c4-blue`、`cloud-aws`（含 azure/gcp 变体色说明）；
- 通用：`drawio-classic`（向后兼容 draw.io 默认外观）。
- IEEE 相关组不少于 4 组（`ieee-bw`、`ieee-color`、`tol-high-contrast`、`matlab-lines`），呼应"多加几组 IEEE 相关配色最佳实践"。

### R3 spec/渲染集成

- `meta.palette: <name>` 写入 spec schema；palette 解析后覆盖 theme 的类别/语义色；浅色填充自动派生（或用 palette 自带 fill/stroke 对），描边与画布对比度 ≥3:1（WCAG 1.4.11）。
- 现有 `$token` 引用、per-node 覆盖、无 `meta.palette` 时的行为完全不变（向后兼容）。
- 提供 `$paletteN`（第 N 个类别色）token 供 YAML 显式引用。

### R4 配色选择交互（已拍板：学术必问、工程按需）

- 学术 overlay：Academic Preflight 的 color policy 步骤升级为 AskUserQuestion 配色组选择，venue→推荐默认项置顶（R5）；用户已明说配色时不问。
- base skill：仅当用户提到配色/色盲/黑白打印/多类别区分且未指定时才问；否则沿用现有 theme 默认，不打扰。
- **replicate 路由例外**：复制流程默认保留源 palette（base SKILL.md 规则 8），不进入 palette 选择；仅当用户明确要求归一化/换配色时才问。

### R5 venue→配色推荐映射（写入学术 playbook，AskUserQuestion 默认项排序依据）

| venue/场景 | 推荐（置顶） | 备选 |
|---|---|---|
| IEEE 印刷 / camera-ready | `ieee-bw` | `tol-high-contrast`、`ieee-color` |
| IEEE 线上/会议 | `ieee-color` | `matlab-lines`、`okabe-ito` |
| Elsevier / 通用期刊 | `okabe-ito` | `tol-bright`、`tol-muted`、`seaborn-colorblind` |
| Nature/Science 系 | `okabe-ito` | `tol-muted`、`journal-npg`（注明非 CVD 安全） |
| 博士学位论文（cn-thesis） | `ieee-bw` | `tol-high-contrast`、`journal-jama` |
| 工程架构 / C4 | `c4-blue` | `cloud-aws`、`drawio-classic` |
| 云架构 | `cloud-aws` | `c4-blue` |

### R6 灰度/色盲安全校验 gate

- `--validate` 新增 palette 检查：转灰度后相邻类别相对亮度差 <20% 报 warning；实际使用类别数超过 `maxCategories` 报 warning。
- 与学术 print gate 联动：`print.target: cn-thesis | ieee-single | ieee-double` 且所选 palette `grayscaleSafe: false` → 结构化 warning（`--strict` 下 error），并提示降级到 `ieee-bw`/`tol-high-contrast`。
- 非 colorblind-safe palette 用于学术 profile 时输出提示（不阻断，尊重美学选择，如 NPG）。

### R7 配色预览样张

- 每组 palette 用同一张标准小图渲染一份 swatch 预览（`.drawio` + PNG/SVG），放入 base `references/examples/palettes/`，文档内嵌索引。

### R8 文档与发布集成

- 更新：base `color-guide.md`（决策树加 palette 维度）、`themes.md`（theme × palette 关系）、`specification.md`（meta.palette）、base SKILL.md；overlay `publication-overlay.md`、`academic-figure-playbook.md`（venue 映射表 + preflight 问法）、overlay SKILL.md。
- **发布面（完整清单）**：两个 skill 的 `agents/interface.yaml`、academic `agents/openai.yaml`、两侧 evals **无条件**新增 palette 触发/输出用例（交互路由已变化，不以 description 是否改动为条件）、root `package.json`/`package-lock.json`/README 版本、两侧 CHANGELOG。
- 若改动两个 SKILL.md 的 `description`：合计 ≤800 字符门槛，必须跑 07-09-skill-desc-slim 的 26 条探针（4 组互斥对）。

### R9 结构化诊断契约（Codex 审核修正）

- 校验管线引入 `{level: info|warning|error, code, message}` 诊断对象；`info` 不参与 `--strict` 失败；既有字符串 warning 行为逐字节不变。
- `validateColorScheme` 接受 palette 参数，`$paletteN`（及 `-fill/-stroke/-text` 变体）为合法 token；无 palette 时仍非法。
- 显式 `meta.palette` 引用未知/损坏/校验不过的 palette → hard error（不静默回退）；错误消息列出可用名称。

## 非目标

- 不做连续色图（parula/viridis 热图类）；
- 不改 theme 的字体/间距/形状体系；不迁移/重写现有 12 个 theme（palette 是叠加维度）；
- 不做 live-refinement/MCP 侧的配色交互。

## 任务结构（父 + 3 子）

本任务为**父任务**：持有需求全集、共享技术设计（design.md）、调研报告、跨子任务验收与最终集成评审。实施拆为三个可独立验收的子任务（顺序依赖写入各子任务工件）：

| 子任务 | 交付 | 依赖 |
|---|---|---|
| `07-14-palette-core` | palette schema/loader/apply/token/结构化诊断/校验 gate，用 okabe-ito、ieee-bw、drawio-classic 三组代表性数据打穿全链路 | 无 |
| `07-14-palette-catalog` | 其余 12 组数据 + 15 张 swatch 样张（可重复生成）+ 索引 | core 完成 |
| `07-14-palette-skill-integration` | AskUserQuestion 规则（含 replicate 例外）、文档、interface/openai.yaml、evals、版本发布 | core、catalog 完成 |

## Acceptance Criteria（跨子任务，父任务集成评审用）

- [ ] `assets/palettes/` 15 组 JSON 全部通过结构校验，HEX 与调研报告一致（单测断言）。
- [ ] `meta.palette: okabe-ito` + `theme: academic` 渲染结果中节点类别色来自 Okabe-Ito，字体/线型仍为 academic theme（渲染单测）。
- [ ] 不写 `meta.palette` 时输出与现版本一致（回归测试）。
- [ ] strict 模式：含 `$paletteN` 的 spec 校验通过；仅 info 诊断的 spec exit 0；`morandi` + `print.target: ieee-single` 触发 warning、`--strict` 下 exit 非零。
- [ ] 显式引用未知/损坏 palette → hard error 且列出可用名称（单测）。
- [ ] AskUserQuestion 流程写入两个 SKILL.md/playbook，学术 preflight 含 venue→默认项排序，replicate 路由默认不问；trigger 探针全过、description 预算达标。
- [ ] 15 张 swatch 样张存在、可由入库脚本重复生成且被文档引用。
- [ ] interface.yaml × 2、openai.yaml、evals、root 版本、CHANGELOG 全部同步；root `npm test` / `just ci` 全绿（含策略契约断言）。

## 约束（来自项目记忆）

- 改 SKILL.md/reference 措辞会触发 root tests/ 策略契约断言 → 收尾必须跑 root npm test / just ci，不能只跑 per-skill node --test。
- PostToolUse prettier 会 restyle .js（单引号冲突）→ 编辑 .js 用 Bash 保持 surgical。
- 用户图表硬性偏好（透明文本框、原生绑定连线、共线拉直、Times New Roman+SimSun、开放箭头）不受本任务影响，palette 不得改动这些默认。

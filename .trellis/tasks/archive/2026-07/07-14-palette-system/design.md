# Design — Palette System（v2，吸收 Codex 审核 5 项 P1 修正）

> 修订记录：v2 修复——① `$paletteN` 校验器豁免缺失；② info 级诊断被 strict 阻断；③ series/pairs 双解释歧义 → 统一 `entries[]`；④ 灰度 gate 改查实际渲染色；⑤ 自定义 palette 运行时契约（无 schema validator 依赖、显式选择不静默回退）。

## 1. 总体架构

palette 是与 theme 正交的颜色维度，叠加在现有渲染管线上：

```
YAML spec ─▶ loadTheme(meta.theme) ─▶ loadPalette(meta.palette) ─▶ applyPalette(theme, palette)
                                                                       │
                                                       derived theme（仅颜色被覆盖）+ usage 记录
                                                                       ▼
                                                      现有 calculateLayout / 样式生成（不改）
```

- **无 `meta.palette` 时 `applyPalette` 为恒等函数**——向后兼容的核心保证（回归测试断言输出不变）。
- theme 继续拥有：typography、spacing、borderRadius、node 形状参数、connector 线型、canvas。
- palette 覆盖：类别/语义填充与描边色、连接线默认色（可选）。

## 2. 文件布局

```
skills/drawio/
  assets/palettes/                 # 15 组内置 palette
  references/palette.schema.json   # 文档级契约（测试复用 loader 的结构校验，不引入 ajv）
  references/examples/palettes/    # swatch 样张 + 索引 README
  scripts/dsl/palette.js           # loadPalette / applyPalette / 结构校验 / 派生
  scripts/dsl/palette-validate.js  # 校验 gate（结构化诊断）
~/.drawio-skill/palettes/          # 用户自定义 palette
```

## 3. palette JSON 契约 —— 单一有序 `entries[]`（修正 ③）

```jsonc
{
  "name": "okabe-ito",
  "displayName": "Okabe-Ito (CUD)",
  "category": "academic",              // academic | engineering | general
  "colorblindSafe": true,
  "grayscaleSafe": false,              // 保守：黄色白底需描边
  "maxCategories": 8,
  "source": "https://jfly.uni-koeln.de/color/",
  "venues": ["elsevier", "nature", "generic-journal"],
  "notes": "Nature 官方点名的 CVD 金标准",
  "entries": [                          // 1–16 项，有序，按序取色不得插值（Tol 规则）
    { "name": "orange", "base": "#E69F00" },                        // fill/stroke/text 全派生
    { "name": "blue", "base": "#6C8EBF",
      "fill": "#DAE8FC", "stroke": "#6C8EBF", "text": "#000000" }   // 显式覆盖任意子集
  ],
  "roles": { "service": 4, "database": 2 },   // 可选：语义类型 → entry 索引（0 基，必须 < entries.length）
  "connector": { "default": "#000000" }        // 可选：连接线默认色
}
```

- 旧设计的 `series`/`pairs`/`textOn` 三概念**全部废除**：每个 entry 统一携带 `base` + 可选 `fill/stroke/text`。
- **loader 在加载时物化**每个 entry 为完整 `{ base, fill, stroke, text }`（缺省字段按 §4 派生），下游（applyPalette、token 解析、gate）只见单一形态，无二义。
- `roles` 与 `$paletteN` 均索引 entry，含义唯一。
- drawio-classic = 8 个显式 fill/stroke entry；ieee-bw = 灰阶 entries + roles；c4-blue = 深色 base + 显式 `text: #FFFFFF`。

## 4. 派生规则（物化时执行，纯函数可单测）

对每个 entry 的缺省字段：

1. `fill` 缺省：`tint(base, white, 0.85)`；若 `relLum(base) < 0.25`（深色系）则 `fill = base`。
2. `stroke` 缺省：`base`；物化后若 stroke 与 theme canvas background 对比度 < 3:1，自动加深至达标（WCAG 1.4.11），记一条 `info` 诊断。
3. `text` 缺省：`relLum(fill) < 0.25` → `#FFFFFF`，否则继承 theme `text`。
4. 语义映射：有 `roles` 用 roles；否则按固定出场顺序（service→0, database→1, decision→2, queue→3, user→4, document→5, …，agentic 类型续位表写死在 palette.js，跨 palette 稳定）循环取色。
5. 中性 token（`background/surface/text/textMuted/border` 等）保持 theme 原值；ieee-bw 通过显式 roles+entries 覆盖为灰阶。
6. **内容中立语义类型不参与 palette 映射**（实施期追认）：`text`、`formula` 节点恒继承 theme 样式，不进入 usage 统计。缘由：审查发现 `academic × ieee-bw` 主路径下 caption 被映射成白底白字且虚增 usage 触发假灰度告警（P1，已修）；formula 同理（okabe-ito 下黑底白字违背学术公式透明惯例，P3-7 定夺排除）。

## 5. token 与颜色校验器（修正 ①）

- `resolveThemeColor` 新增：`$paletteN`（1 基 → entry N 的 `base`）、`$paletteN-fill` / `$paletteN-stroke` / `$paletteN-text`（物化值）。越界 → warning + 回退 theme primary。
- **`validateColorScheme(spec, theme)` 签名改为 `(spec, theme, palette)`**：`validTokens` 在 theme.colors 基础上并入 `$palette1..$paletteN` 及 `-fill/-stroke/-text` 变体（palette 为 null 时集合不变）。
- 回归测试：strict 模式下，含 `$paletteN` token 的 spec 校验通过；无 palette 时 `$paletteN` 仍按非法报警（防止裸用）。

## 6. 结构化诊断契约（修正 ②）

现状：所有校验消息是扁平字符串，`options.strict` 对全量 warnings 抛错，level 硬编码 `'warning'`（spec-to-drawio.js ~2906）。端到端契约：

- 诊断对象：`{ level: 'info' | 'warning' | 'error', code: 'PALETTE_<NAME>', message }`。
- 汇聚层改为 `allDiagnostics`：既有校验器返回的字符串包装为 `{ level: 'warning', code: 'LEGACY', message }`（既有行为逐字节不变）；palette 系诊断原生结构化。
- **strict 判定：`level !== 'info'` 才计入失败**；`error` 级无论 strict 与否都进失败路径（目前仅 print-gate 联动在 strict 下产生 error）。
- `options.returnWarnings` 返回值保留 `{level, message}` 形态并透传真实 level；CLI 打印时 info 前缀区分。
- 回归测试：仅含 info 诊断的 spec 在 `--strict` 下 exit 0；既有 warning 行为不变。

## 7. loader 运行时契约（修正 ⑤）

- 解析顺序：内置 `assets/palettes/` → 用户 `~/.drawio-skill/palettes/`；同名时**用户覆盖内置**并发 `info` 诊断。
- 名称安全：`^[a-z][a-z0-9-]*$` + 路径防穿越（复用 loadTheme 模式）。
- **显式 `meta.palette` 永不静默回退**（与 loadTheme 的默认回退相反）：
  - 未知名称 → **hard error**，消息列出全部可用 palette 名；
  - JSON 解析失败 → hard error，附解析错误；
  - 结构校验失败（缺 required 字段、entries 越界、roles 索引超界、HEX 非法、entries >16）→ hard error，附首个违规项。
- 结构校验为 **palette.js 内手写校验函数**（仓库依赖仅 js-yaml，无 ajv，不新增依赖）；`palette.schema.json` 作为文档与外部工具契约保留，单测断言手写校验与 schema 必填项清单一致（防漂移）。

## 8. 校验 gate（修正 ④：查实际渲染结果，两项独立检查）

`applyPalette` 渲染时记录 **usage**：被 spec 中实际节点占用的 entry（语义映射命中 + 显式 `$paletteN` 引用）及其**最终物化 fill 色**。gate 基于 usage，不再看 entries 原始排列：

| code | 检查 | 条件 | 级别 |
|---|---|---|---|
| `PALETTE_GRAYSCALE_PAIR` | 灰度可分性 | 实际使用 entry 的最终 fill **两两配对**灰度亮度差 < 0.20（≤16 项，O(n²) 可忽略） | warning（逐对列出） |
| `PALETTE_BOUNDARY_CONTRAST` | 边界对比 | 使用 entry 的 stroke vs canvas background < 3:1（派生兜底后仍不达标，如用户显式 stroke） | warning |
| `PALETTE_MAX_CATEGORIES` | 类别超限 | 实际使用类别数 > `maxCategories` | warning（提示叠加线型/图案） |
| `PALETTE_PRINT_GATE` | print 联动 | `meta.print.target ∈ {cn-thesis, ieee-single, ieee-double}` 且 `grayscaleSafe: false` | warning；strict 下 **error**，提示降级 `ieee-bw`/`tol-high-contrast` |
| `PALETTE_CVD_NOTICE` | CVD 提示 | `meta.profile: academic-paper` 且 `colorblindSafe: false` | **info**（依赖 §6 契约不阻断 strict） |

灰度亮度 = WCAG relative luminance（纯函数入 palette-validate.js）。

## 9. AskUserQuestion 交互契约（写入 SKILL.md / playbook，非代码）

- **学术 overlay preflight**：确定 venue 后，若用户未明说配色 → AskUserQuestion 单选；选项 = venue 映射表（PRD R5）推荐置顶标 "(Recommended)"，共 3–4 项；label = displayName，description = 安全标志 + 适用说明。用户已明说（如"Nature 配色"）→ 直接映射，不问。
- **base skill**：仅当请求提到配色/palette/色盲/黑白打印/多类别区分且未指定时才问；否则不问、不设 `meta.palette`。
- **replicate 例外（修正 ⑥）**：复制流程默认保留源 palette（base SKILL.md 规则 8），**不进入** palette 选择；仅当用户明确要求"归一化/换配色"时才问，且写入 `meta.replication` 记录归一化决定。
- 完成报告须注明所用 palette 及安全标志。

## 10. swatch 样张

标准 swatch spec（固定 8 节点 + 3 类连接线模板 YAML 一份），15 组各渲染 `.drawio` + `.png`（无 Desktop 回退 SVG）至 `references/examples/palettes/`；生成脚本入库（可重复再生成），README 索引表带安全标志。

## 11. 兼容性、发布与回滚

- 纯叠加：全部行为由 `meta.palette` 触发；不写该字段 → 输出与现版本一致（回归测试）。
- 发布面（吸收修正 ⑦）：两个 skill `SKILL.md` version、`agents/interface.yaml` × 2、academic `agents/openai.yaml`、两侧 evals（**无条件**新增 palette 触发/输出用例，不以 description 是否改动为条件）、root `package.json`/`package-lock.json`/README 版本、CHANGELOG × 2。
- 回滚边界：删 `assets/palettes/`、`palette*.js`、schema `meta.palette`、文档段落即完全回退；无数据迁移。

## 12. 分阶段验证（降返工面）

核心契约（子任务 palette-core）先用 **3 组代表性数据**打穿全链路，覆盖三种 entry 形态：

- `okabe-ito` —— 纯 base 派生路径；
- `ieee-bw` —— 灰阶 + roles + 显式 fill/stroke 路径 + print gate；
- `drawio-classic` —— 全显式 fill/stroke 对路径。

其余 12 组在 catalog 子任务批量纳入（此时数据形态已被架构验证）。

## 13. 权衡记录

- grayscaleSafe 取保守值（okabe-ito → false）：宁多一次降级提示，不放过灰度不可分风险；venue 映射把 ieee-bw 置顶，正常流程不触发。
- roles 出场顺序写死代码而非每 palette 声明：跨 palette 换色时同类型颜色位置稳定，JSON 保持薄。
- 手写结构校验而非引入 ajv：仓库依赖极简（仅 js-yaml）是既有取向；校验面小（一个契约），漂移用单测钉住。
- 不做 CMYK：IEEE/Elsevier 均要求作者提交 RGB（调研 §1.1/§1.2）。

### 实施期口径注记（审查 P3，记录在案不改行为）

- `tol-light-fill` 标 `colorblindSafe: true`：较调研表"尚可"轻微上调，可辩护（Tol light 本为 CVD 友好设计），JSON notes 保留意见。
- `c4-blue` external 层文字用 `#000000` 而非调研表"白"：WCAG 上正确（白字在 `#B3B3B3` 仅 ~1.8:1），prd 只钉了深蓝层 `text:#FFFFFF`，属有理偏离。
- ieee-bw 的 `#000000`/`#555555` 按 WCAG 相对亮度口径差 0.09（<0.20 阈值）：调研"≥25% 亮度间隔"是通道值口径，二者不同；roles 默认映射避开该组合，同图混用会如实触发 `PALETTE_GRAYSCALE_PAIR`，行为符合设计。
- 未列入出场顺序表的类型（router/switch/firewall 等）统一落 entry 0：网络图各设备同色为当前已知边界，如需类型级区分留待后续任务扩展续位表。

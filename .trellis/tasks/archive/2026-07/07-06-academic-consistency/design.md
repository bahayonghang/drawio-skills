# Design — 学术规则、模板与文档一致性修复

## 决策

### R1 密度阈值：删除而非调参

`checkComplexity` 已实现与 playbook《System warnings》完全一致的 41/61/100 三档（0-40 静默）。矛盾源是 `validateAcademicProfile` 的 `>18（无模块 >12）` 额外密度告警——直接删除该块，使 checkComplexity 成为唯一密度裁判。文档无需改（playbook 表述本来就对）。

### R2 图例豁免 + 可见长度估算

- verbose-label 检查跳过显式 `type: 'text'` 节点（图例/说明的合法形态）。
- 新增 `estimateVisibleLabelLength`：剥离 `$$`/`\(\)`、TeX 命令按 1 字形计、去 `{}_^` 后计数——张量公式标签（源码 50+ 字符、可见 ~15）不再误报。40 字符阈值不变，作用对象改为可见长度。

### R3 schema 漂移：双向治理

- 新增 `validateSchemaDrift(spec)`（warning 通道，接入 specToDrawioXml）：
  - meta 未知键（已知集 = 实际消费键 + `template` 模板自述元数据）
  - node.style 未知键（已知集 = generateNodeStyleWithSpec/pushTextSpacing/resolveFontStyle 实际读取的 16 键）
  - module 未知键（id/label/color/style/bounds 之外——bounds 本身零消费，列入未知并在模板中移除）
- 模板/playbook 清理：`canvasSize`/`gridSize` → 删除（canvas 用 auto 推导）；module `bounds` 删除（布局从子节点重算，声明值本就被忽略）；`style.shape: box` 与 `style.rounded` 删除；`style.shape: text` → 顶层 `type: text`。

### R4 neural-network 模板坐标重排

统一 32px 垂直/水平间距（≥30px 末段规则 + 8px 网格）：模块 A/B/C 高 216、D 高 264；B 内 2×2 网格列间距 32（b1 宽 72、b2 x=424）；图例下移 y=400。a1_input fontSize 11 → 10。新增守护测试 `tests/academic-templates-strict.test.js`：模板 + 学术示例全量 `specToDrawioXml({ strict: true })` 不抛错。

### R5 版面尺寸告警（阈值定稿）

- 换算依据（IEEE 已核实）：单栏 3.5in = 252pt；px→pt 同幅面缩放 `有效pt = fontSize × 252 / 画布宽px`。
- 触发条件：academic-paper profile 且画布宽（meta.canvas 声明值或 bounds 极值+80）> **1500px** 且最小节点字号的单栏有效值 < 8pt → warning（给出算式与四个出路：加大字号 ≥ ceil(宽/31.5)、收窄画布、按双栏 516pt、拆图）。
- 1500px 阈值理由：既有模板（~1100-1200px）不受影响（旗舰模板按既有视觉密度设计，处方在文档而非 strict 失败）；AC 的 1600px 用例触发。文档（checklist + playbook）给出完整 px→pt 表与"画布按目标栏宽设计"的处方。

### R6 IEEE 投稿格式提示

checklist 与 publication-overlay 注明：IEEE 矢量只收 PS/EPS/PDF（SVG 不在名单）；Desktop 可用时建议附 PDF；不改默认 .drawio+.svg 交付契约。

### R7 杂项

- academic evals.json version 0.1.0 → 2.3.0，增 `_runner` 说明（提示+断言清单，无自动 runner，人工/agent 逐条核验）。
- `evals/README.md` 标注 darwin-results.tsv / test-prompts.json / baseline-prompts.json 为历史快照及再生成方式（保留不删）。
- checkComplexity 的 >14 字符逐节点 info 聚合为单条摘要（首 3 个 id + 总数）；>200 fatal 保持逐节点。

## 兼容性

- 新告警均为 warning 级（strict 下才失败）；既有 7 个学术示例已零告警，不受影响。
- 模板清理只删除"声明即被忽略"的键，渲染结果不变（重排坐标除外，属修复目标）。

## 测试策略

- 单测：图例豁免、可见长度估算、密度块删除（30 节点无告警）、schema 漂移三类告警、1600px 字号告警、label info 聚合。
- 守护测试：模板+学术示例 strict 全过。
- `npm test` 全量回归。

## 回滚

代码集中在 spec-to-drawio.js 校验器区 + 模板/文档；单提交 revert。

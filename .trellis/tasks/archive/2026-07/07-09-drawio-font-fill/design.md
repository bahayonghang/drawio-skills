# Design — drawio 字体统一与填充式字号系统

## 总体架构

引入"两阶段字号规划"（font plan），插在现有 spec→layout→XML 流水线中，不改变 YAML-first 契约：

```
validateSpec
  → [Phase 1] assignFontPlan(spec, theme)     # 预布局：把梯子字号物化进 style.fontSize（仅缺省处，记录哪些是自动赋的）
  → layoutNodes(...)                          # 现有布局；getNodeSize 变为内容感知（预设为最小值）
  → [Phase 2] shrinkFontPlanToBounds(...)     # 后布局：显式 bounds 节点按类求最大可容字号，类内取 min，夹 [12, 梯子]
  → generateNodeStyle / module / edge XML     # 消费最终 style.fontSize（代码不变或微调回退值）
  → validators                                # 溢出校验泛化 + meta.print 印刷换算
```

关键决策与理由：

1. **物化进 `style.fontSize` 而非旁路 Map**：XML 装配、边标签间隙计算（:1241）、溢出校验（:1646）已经都读 `style.fontSize`，物化后天然一致，改动面最小。只写"缺省处"，用户显式值不动（向后兼容）；内部用 `Set`（或 symbol 标记）区分自动赋值，Phase 2 只收缩自动值。
2. **盒子内容感知**：`getNodeSize(size, nodeType, label, fontSize)` 增加第 4 参；非 text 节点返回 `max(preset, contentExtent(label, fontSize) + padding)`（宽高分别 max）。SIZE_PRESETS 语义从"固定值"变"最小值"。这是"不超框"的结构性保证——120×60 的 medium 盒装不下 20px 中文双行标签。
3. **类的定义**：`module-title` / `node`（非 text 全部）/ `edge-label` / `text` 四类。论文规范要求同类字号一致，因此 Phase 2 的收缩取类内最小可容值统一应用，而不是逐节点各自缩放。
4. **字族回退列表**：cjk 桶输出 `Times New Roman,SimSun`——CSS/SVG 逐字形回退让 Latin 命中 Times、汉字回退宋体；本仓库两条导出路径（自有 SVG 渲染器直写 font-family 属性；Desktop=Chromium）都支持。`safeStyleText` 已放行逗号；需确认 meta.font 校验（:2882 附近）不拦逗号，若拦则放宽为同一 safeStyleText 规则。

## 字号梯子（常量 + 主题）

| 类 | 新默认 | 旧值 | 落点 |
|---|---|---|---|
| module title | 22（fontStyle=1） | 主题 12 / 代码 14 | `academic*.json module.labelFontSize`、`:1182` 回退 |
| node | 20 | 主题 11 / 代码 13（`:46`、`:1019`） | `academic*.json node.default.fontSize` + typography.fontSize 表、代码回退 |
| edge label | 18 | 硬编码 11（`:1241`/`:1384`） | 抽 `resolveEdgeLabelFontSize(edge)` 常量 18 |
| text 节点 | 16 | 13 | 代码回退；`estimateTextSize` 接收节点实际 fontSize（修掉硬编码 13） |
| 下限 | 12 | 无 | Phase 2 clamp + 溢出告警 |

非 academic 主题 JSON 的显式字号本轮不改（surgical）；代码回退值提升后，未指定主题字号的路径同步变大。文本估宽沿用 0.6/1.05em 系数（`estimateTextSize`/`measureLabelExtent` 复用）。

## 字族解析（A）

- `getDefaultFontPolicy`（:887）：两个分支统一 `{ primary: 'Times New Roman', cjk: 'Times New Roman,SimSun', formula: 'Times New Roman' }`。
- `academic.json` / `academic-color.json`：`typography.fontFamily.cjk = "Times New Roman, SimSun"`；`theme.schema.json` 若约束 fontFamily 键集则补 cjk。
- `font-policy.md`（Trellis spec）：Good 案例与 Contracts 更新为"桶值允许逗号回退列表；cjk 桶推荐 `Times New Roman,SimSun`"。
- 风险：SimSun 仅 Windows 自带 → 文档注明跨平台可追加 `Songti SC` / `Noto Serif CJK SC`；不写进默认值（避免 Desktop 字体面板显示冗长）。

## 门禁（C）

- 删除 `:2232-2249` 的 8–10 检查，替换为印刷换算检查（对所有 academic spec 生效）：
  - `meta.print`: `{ target?: 'cn-thesis'|'ieee-single'|'ieee-double', widthPt?: number, minPt?: number }`；预设 cn-thesis=440pt/9pt、ieee-single=252pt/8pt、ieee-double=516pt/8pt；widthPt/minPt 覆盖预设。
  - 缺省行为保持现状（ieee-single + 仅画布 >1500px 时评估），`meta.print` 存在时总是评估。告警文案给出"最小需要字号/压缩画布/换目标宽度"三条出路。
  - `KNOWN_META_KEYS` + `spec.schema.json` 增 `print`。
- 溢出校验：`:1646` 的 text-bounds 检查推广为"任何带显式 bounds 的节点，`measureLabelExtent(label, 最终 fontSize, 8)` 超出 bounds → warning"。自动布局节点因内容感知盒不会触发。

## 文档/模板（D）

- `tokens.md`：字号表改为新梯子 + "盒随文本增长、预设为最小值" + 字族列表规则。
- `academic-figure-playbook.md`：示例 YAML 去掉/改掉 9–11 显式字号；「Canvas and Print Sizing」增 cn-thesis 档与 `meta.print` 用法；prescriptions 改为"按目标栏宽选 meta.print，字号交给梯子/收缩"。
- 两个 compact 模板：删除 `fontSize: 10` 显式覆盖（继承梯子）。
- academic `SKILL.md` Quality Gate 增两条：同类元素字号一致；文本不超框（溢出告警清零）。
- `academic-export-checklist.md`：增 Word 插入建议（PNG/嵌字体）与宋体核对项。
- 公开 docs（`docs/api/xml-format.md`、`docs/zh/api/xml-format.md`、`docs/zh/guide/specification.md` 等）中出现旧默认字号/字族处按实际 grep 结果同步。

## 测试（E）

- 更新受默认值影响的既有断言（fontSize=13/11/12 → 新梯子）。
- 新增：
  1. 混排/纯西文标签 fontFamily 断言（列表 vs 单值）。
  2. 梯子默认：node 20 / module 22 / edge 18。
  3. 内容感知盒：长 CJK 标签盒宽 > preset。
  4. 类级收缩：两节点显式窄 bounds → 同一收缩字号、≥12、用户显式 fontSize 不被改。
  5. 溢出告警：bounds 塞不下 → warning 出现。
  6. meta.print：cn-thesis 宽画布 → warning 文案含 440pt 数学；8–10 告警不再出现。
- fixture：`skills/drawio/evals/fixtures/`（或 tests 内联 YAML）加用户样张同款多模块中英混排架构图。

## 兼容性 / 回滚

- 行为变化：所有未显式指定字号的既有 spec 重渲染后字号变大、盒子可能变大 → 这是需求本身；用户显式值路径完全不变。
- 回滚边界：单 commit（或按 A/BC/DE 分 2–3 个 commit），`git revert` 即可；无数据迁移。

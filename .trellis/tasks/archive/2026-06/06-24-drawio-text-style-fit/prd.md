# drawio 文字样式优化：透明底 + 内容定宽

## Goal

消除 `drawio` 与 `drawio-academic-skills` 两个 skill 在生成/编辑图时反复出现的两类文字样式问题，使输出的文字与标注默认透明、按内容定宽，便于阅读与后续移动变换。

## Background（根因，已查证）

两个问题都**不是自动转换路径的 bug**，而是 skill 指导文档的空缺——模型手写 XML/YAML（edit / replicate / 学术叠加层）时的默认倾向无规则纠正。

- **问题 1 文字带白底**：全 skill 搜不到 `labelBackgroundColor` 指导，也无"文字必须透明"的规则。白底有两个来源文档都未约束：独立文字框 `fillColor=#FFFFFF`、节点标签 `labelBackgroundColor=#FFFFFF`（文字白色光晕，即第一张图"有效频带"效果）。模型在彩色图上加标注时本能加白底求可读性。
- **问题 2 文字框被拉到与方框等宽**：全 skill 搜 `fit to content / char width / autosize / 略宽` 等 0 命中。`replicate` 要求给文字写显式 `bounds`（skills/drawio/references/workflows/replicate.md:51,75）却无"只比文字略宽"的启发式；转换器把 `text` 节点固定为 `medium=120×60`（skills/drawio/scripts/dsl/spec-to-drawio.js:355,371），与内容长度无关。

## Scope（已与用户确认）

文档 + 转换器护栏 + 新增 eval（最全范围）。

## Requirements

- **R1 透明底规则（文档）**：在两个 skill 的相关文档中明确——文字/标注/caption/callout 默认 `fillColor=none` 且 `labelBackgroundColor=none`；仅当在繁杂背景上确需分隔时，才作为**有意识的例外**使用克制的浅色/半透明底（绝不用硬白方块），并要求记录理由。
- **R2 内容定宽规则（文档）**：文字/标签框按内容定宽——宽度只比最长行略宽（含左右内边距），不铺满父容器/源图区域，以保证元素可被独立选中、移动、变换。提供可操作的宽度估算启发式（区分 Latin 与 CJK 字宽）。
- **R3 落点覆盖**：规则需进入 base 的操作规则与 design-system 文档、`edit`/`replicate` 工作流；学术叠加层（`publication-overlay.md` / playbook）同步承载，覆盖两个 skill 的主要文字产出路径。
- **R4 转换器护栏（代码）**：`spec-to-drawio.js` 中 `text` 节点样式补 `labelBackgroundColor=none`；`text` 节点在无显式 `size`/`bounds` 时宽度按 `node.label` 内容估算，替代固定 `medium`。改动不破坏既有非文字节点行为。
- **R5 验证 eval（评测）**：新增能复现这两个问题的 eval 用例（彩色图上的标注 callout、含多行文字的节点），用 skill-creator 的 with-skill / old-skill 对比评测，量化新版在"无白底""文字框不过宽"上的改善。

## Constraints

- 遵循仓库既有风格；JS 文件用单引号风格，按 [[drawio-skills-format-hook-conflicts]] 经验，编辑 `.js` 走 Bash 以避免 prettier 改写非改动行。
- 学术叠加层为"薄层"，不得复制 base 资源；规则尽量沉淀在 base、叠加层只放学术增量与指针（遵守 SKILL.md 既定边界）。
- 转换器改动必须保持既有单测通过；若 `getNodeSize`/尺寸相关断言需调整，必须是有意的、并补充新断言。
- 不引入运行时新依赖；离线 YAML-first 流程不变。

## Acceptance Criteria

- [ ] base 与 academic 两个 skill 的文档都包含 R1（透明底）与 R2（内容定宽）规则，且 `edit`/`replicate`/学术叠加层均有覆盖或指针。
- [ ] 转换器对 `text` 节点输出包含 `fillColor=none` 且 `labelBackgroundColor=none`；无白底光晕。
- [ ] 转换器对无显式尺寸的 `text` 节点按内容估算宽度（短标签更窄、长标签不裁切），可由新单测验证。
- [ ] `npm test`（或仓库等价测试命令）全绿；新增/调整的断言覆盖 text 透明底与内容定宽。
- [ ] 新增 eval 用例运行后，with-skill 输出相对 old-skill 在"无 `fillColor=#FFFFFF`/`labelBackgroundColor` 白底""文字框宽度接近内容而非容器"上有可见改善（在 eval viewer / benchmark 中体现）。
- [ ] 变更最小且可追溯，每行改动都能对应到 R1–R5。

## Out of Scope

- 不改 skill 的 `description` 触发词（本次不做触发优化，规避 Windows run_loop 评测缺陷 [[skill-creator-windows-trigger-harness]]）。
- 不重构布局引擎或主题系统；不调整非文字节点的默认尺寸/配色。
- 不新增 PNG/PDF 导出或 live backend 相关能力。

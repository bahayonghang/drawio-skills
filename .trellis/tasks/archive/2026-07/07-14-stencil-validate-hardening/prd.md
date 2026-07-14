# 未知 stencil 校验闭环强化（拒绝+搜索建议）

父任务：`07-14-drawio-ai-kit-integration`。**依赖**：`07-14-stencil-catalog-search`（v2 目录 + `dsl/catalog-search.js` + `dsl/icon-mappings.js` 共享模块）完成并归档后才可 start——搜索建议与"默认拒绝"的误杀率都取决于目录覆盖度。

> 2026-07-14 修订：吸收 Codex 审阅——现有校验器**没有** error 聚合通道（`validateShapeReferences` 返回 string[]，:2932 全部包装为 warning），需定义新返回契约；`aspect=fixed` 改为直接修复 aws4 resourceIcon 样式生成（实测生成样式确实缺失），删除不存在的"手写 style 透传"检查目标。

## Goal

把现有 `validateShapeReferences()` 的软 warning 升级为"查询-约束-拒绝"闭环：覆盖命名空间内的未知 stencil **默认报错**并附真实名字建议（对标 `ref/drawio-ai-kit` 的 `Stencil not found: … — suggestions: a, b, c`），并修复 aws4 resourceIcon 生成样式缺 `aspect=fixed` 导致图标变形的问题。

## Requirements

### R1 未知 stencil 默认拒绝（含新错误契约）

- 覆盖前缀（aws4/gcp2/azure/mscae/kubernetes/cisco/cisco19/networks，以子任务 1 落地为准）内、目录未命中的 shape/icon 引用：默认（非 `--strict`）即 **error**，CLI 退出非 0，不产出 `.drawio`。
- **新返回契约**：`validateShapeReferences()` 从 `string[]` 改为 `{ errors: [], warnings: [] }`；调用点（`spec-to-drawio.js:2932` 一带）新增 error 聚合通道——errors 非空时（且未开 `allowUnknownShapes`）抛出聚合错误；`options.returnWarnings` 的返回结构里以 `level: 'error'` 条目携带（既有 `level: 'warning'` 结构向后兼容）；`silent`/`strict` 语义不变。其余九个 validate* 函数不改签名。
- 错误信息含 top-3 搜索建议（复用 `dsl/catalog-search.js`）与"用 `cli.js search <词>` 自查"提示，教学式、一次列全所有未知名字。
- 降级开关 `--allow-unknown-shapes`：未知项回落为 warning（现行为）。`ICON_ALIASES` 自动纠错优先于报错。

### R2 aws4 resourceIcon 补 `aspect=fixed`

- 实测：`aws.ec2` 生成样式 `shape=mxgraph.aws4.resourceIcon;resIcon=…` **缺** `aspect=fixed`（`spec-to-drawio.js:1140` compound 分支）。直接在生成路径补上（k8s 参数化分支若子任务 1 已加，一并核对），带回归测试与既有快照/示例更新。
- 原"手写 style 透传检查"取消：探针证实 `style.shape` 不进入最终样式，检查目标不存在。`style.shape` 被静默忽略这一行为本身记录为观察项，是否改进另行立项，本任务不动。

### R3 范围排除（本任务不做）

- 覆盖前缀之外（`uncovered`）的 `mxgraph.*` 透传维持现状（不校验），`--validate` 报告保留计数提示。
- kit 的 auditGeometry、AWS 改色检测、GROUP_LEVEL 嵌套审计：不做代码化；普适部分由文档子任务以规则文字落地。
- 主题对 aws4 图标的重着色（`fillColor` 来自 theme）是本仓库主题体系的设计行为，不引入 kit 的"改色即警告"。

## Acceptance Criteria

- [ ] fixture：含 `aws.s3_bucket_magic` 与 `k8s.podd` 的 YAML，默认运行报 error、退出码非 0、无输出文件，错误文本含各自 top-3 建议与 search 提示，且两个未知名**一次全部列出**。
- [ ] 同一 fixture 加 `--allow-unknown-shapes` 后与现行为一致（warning + 正常产出）；`--strict` 语义不回退。
- [ ] `options.returnWarnings` 调用方拿到 `level:'error'` 条目；既有只消费 warning 的调用方不破坏（全量测试绿）。
- [ ] `aws.ec2` 生成样式含 `aspect=fixed`；既有 22 个 `references/examples/*.yaml` 与 academic 全部模板默认模式零 error（无误杀）、`academic-templates-strict.test.js` 绿。
- [ ] 新行为专门测试（默认拒绝/降级/建议内容/聚合/新契约）；根 `npm test` / `just ci` 全绿。

## Notes / Constraints

- 误杀是最大风险：实施第一步对全部既有示例跑基线；误杀优先补目录/别名而不是放松校验。
- 旧 warning 文案 "would render as an empty box in draw.io Desktop" 若被根测试断言（实施时 grep），保留句式仅改判级。
- `.js` 编辑经 Bash；不改 SKILL.md frontmatter description；文档说明归文档子任务。

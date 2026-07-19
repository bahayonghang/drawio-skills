# 视觉识别导出与返工闭环加固

## Goal

让 base 与 academic 路径生成一个稳定、尺寸受控、结构有效的 `vision-preview`，使视觉模型能够读取实际导出物；再把视觉问题绑定到稳定对象 ID，优先回写 canonical YAML/spec，经过校验和重导形成可停止、可复现的返工闭环。

## Confirmed Facts

- `skills/drawio/scripts/runtime/desktop.js` 的 `buildDrawioExportArgs` 默认 `embedDiagram=true`；PNG/JPG 接受 `scale`。
- `skills/drawio/scripts/cli.js` 默认 PNG DPI 为 300，即 `scale=300/96`。
- 当前 base、replicate 和 academic 已要求检查 exported artifact，但视觉问题分类和返工规则分散，尚无共享结构化 review contract。
- 本机 draw.io Desktop `30.3.11` 的嵌入 PNG 实测 `2996 x 3249`、IEND 完整、可视觉读取。
- 非嵌入 `--width 2000` preview 实测 `2000 x 2170`、可读取；因此必须检查最长边，而不是只限制宽度。
- Desktop 进程返回后曾短暂读不到输出文件，需要稳定等待。
- 上游 IEND 截断在当前版本未复现；无条件追加 IEND 不安全。
- 详细现场记录：`../07-18-drawio-upstream-port/research/upstream-capability-audit.md`。

## Requirements

### R0.1 Vision Preview Export Profile

- CLI 提供显式 `--visual-preview` 路径；仅允许 PNG Desktop 输出。
- runtime 使用内部 profile `vision-preview`，不带 `-e`，不带 `-s`，先用 `--width 2000`。
- 输出稳定后读取 IHDR；若高度超过 2000，改用 `--height 2000` 重导。
- 最终 preview 必须满足 `max(width, height) <= 2000`。
- preview 放在 work/diagnostic 路径，不改变默认 final deliverable 名称和 300dpi/embedded 行为。
- Desktop 不可用时沿用 standalone SVG fallback，并诚实报告没有 PNG vision-preview。

### R0.2 Output Stabilization

- Desktop 调用返回后等待目标文件出现且连续观测到稳定大小。
- 等待有明确超时、轮询上限和错误信息；不能无限阻塞。
- 文件系统、时钟/等待函数可注入，使 missing、late、stable、timeout 都可确定性测试。

### R0.3 PNG Inspection and Conservative Repair

- 检查 8-byte PNG signature、IHDR 长度/尺寸、chunk 边界和 terminal IEND。
- 完整 PNG 返回结构化 metadata，不改文件。
- 只有精确匹配已知 IEND 截断形态的有效 PNG 可以补全终块。
- 非 PNG、IHDR 损坏、IDAT/其他 chunk 截断、尾部垃圾必须显式报错，不尝试“修复”。
- repair 必须幂等，并返回 `unchanged/repaired/rejected` 状态。

### R0.4 Structured Visual Review

- 共享 review record 至少包含：`pageId`、`objectId`、`problem`、`severity`、`evidence`、`suggestedAction`。
- `problem` 覆盖 overlap、clipped-label、missing-connection、off-canvas、edge-through-object、stacked-edge、edge-label-overlap、missing-content、source-mismatch。
- 视觉模型无法确定对象时记录页面和区域描述，不编造 object ID。
- review 中的确定性问题与 CLI validator 输出合并去重，但保留来源 `deterministic` 或 `visual`。

### R0.5 YAML-First Rework Loop

- 有 `.spec.yaml` 时按 node/edge/module/page ID 修改 canonical spec。
- 只有 imported drawio 无 sidecar或 direct-XML exception 才修改 XML；修改后仍运行 XML validation。
- 单对象反馈执行最小补丁；布局方向/全局主题等全局反馈允许重新布局或重新生成。
- 每轮执行 `patch -> validate -> render preview -> inspect -> visual review`。
- 自主修复最多 2 轮；仍有 blocker 时把问题展示给用户。用户评审达到 5 轮时建议 Desktop 精调，不宣称自动完成。
- 同一 preview 路径覆盖更新，避免生成 `v1/v2/v3` 垃圾；final artifact 不被 preview 覆盖。

### R0.6 Base and Academic Information Architecture

- base 新增一个共享 `references/workflows/visual-review.md` 作为完整流程单一事实源。
- base `SKILL.md`、create/edit/replicate 只保留强 context pointer 和必要的一行完成契约。
- academic 不新增 runtime；在现有 Quality Gate/publication docs 中引用 base 流程并追加 A4、论文字号、caption/legend、公式和印刷检查。
- 保留当前 test-pinned 文案和 academic reference whitelist，除非对应测试与契约同步更新。

### R0.7 Evidence and Output Eval

- file-backed cases 至少覆盖：small、wide、tall、CJK、dense academic。
- PNG parser 另有完整、已知 IEND 截断、非 PNG、其他 chunk 截断 fixture。
- deterministic assertions 检查尺寸、embed 标记、IEND、artifact path、问题 record 和 canonical patch target。
- 视觉模型评测记录 provider/model 或明确标为 recorded fixture/command-executed；不可用时写 `missing evidence`。
- 生成或更新 `reports/output_quality_scorecard.md`，不得把 fixture 回放称为模型执行。

## Acceptance Criteria

- [ ] `--visual-preview` 生成不带 `-e/-s` 的 PNG，经过重导后最长边不超过 2000px。
- [ ] 当前默认 final PNG 参数保持向后兼容。
- [ ] late/stable/timeout 文件落盘行为都有确定性测试。
- [ ] 完整 PNG 不变；精确 IEND 截断可修；非 PNG和其他截断被拒绝。
- [ ] 结构化 review 对每个问题保留位置/对象、严重度、证据、动作和来源。
- [ ] 返工默认按稳定 ID 修改 canonical spec，并在每轮后执行 validate/render/review。
- [ ] base 只有一个完整视觉流程事实源；academic 只追加 policy，未复制 runtime。
- [ ] 五类 file-backed preview case 通过确定性断言；视觉模型不可用时证据状态保持诚实。
- [ ] focused tests、root `npm test`、`just ci` 通过；docs build 按文档改动执行。

## Dependencies

- 无前置 feature child；本任务最先实施。
- 后续 C1 drift、C2 raster/C4、C3 prdiff/buildup 消费本任务的 preview、PNG inspection 和 review record 契约。
- 实施前必须先审阅本任务 `design.md` 与 `implement.md`，然后只启动本 child，不启动父任务。

## Out of Scope

- 在 CLI 内调用特定云视觉 API。
- 自动接受视觉模型输出并无校验地修改文件。
- 改变现有 final 300dpi/embedded 默认交付契约。
- 为所有历史 draw.io 版本修复任意 PNG 损坏。
- 在 academic overlay 复制 base runtime 或完整 review table。

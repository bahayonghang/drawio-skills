# Canonical 多页基础

## Goal

在 `skills/drawio` base 内建立向后兼容的 canonical multi-page foundation：稳定的页面与跨页对象身份、结构化页面链接、逐页 spec/XML 校验、确定性 YAML/sidecar 序列化，以及 canonical multi-page YAML 与多页 `.drawio` 的可验证 round-trip。

本 child 只交付共享基础契约。C4 语义预设和 `compress` 摘要只能作为后继消费者；raster、SysML/BPMN、skill 路由、interfaces、全局 output scorecard 与 integration/promotion 不进入本任务。

## Confirmed Facts

- legacy canonical YAML 是无显式版本的单页 `meta/nodes/edges/modules`；`parseSpecYaml` 会补齐缺省数组，`serializeSpecYaml` 按当前对象顺序输出。
- `specToDrawioXml` 只渲染一个 `<mxGraphModel>`；`createDrawioFileContent` 固定包装成单个 `Page-1`。
- `drawioToSpec` 默认只导入第一张 `<diagram>`，`--page` 只选择一页；压缩和未压缩页面均可解码。
- 当前 `validateXml` 以整段 XML 为一个 cell namespace；若直接校验多页 `<mxfile>`，每页合法重复的 `0/1` root cell 会被误报为重复 ID。
- 当前 renderer 把 canonical object id 映射为页内数字 cell id；没有额外 metadata 时，导入无法恢复原 canonical object id。
- 上游 `c4.py` 用页面名 slug 作为 page id、要求全文件 object id 全局唯一，并只生成 `data:page/id,<pageId>`；上游 `compress.py` 扁平读取多页、只复制第一页作为 detail。这些行为不能直接成为本仓 canonical contract。
- base skill 的 offline YAML authoring、`.drawio` import、sidecar 与 validation 不需要 Desktop、网络、browser、MCP 或视觉模型。

## Requirements

### R1 Backward-Compatible Document Model

- legacy 单页 YAML 保持隐式 legacy-flat 形态；不得自动写入 `schemaVersion`、`pages`、page id 或 link 字段。
- legacy normalization 只承诺支持字段和值的语义无损，不承诺保留 YAML 注释、anchor、源文本空白或原始字节；这与当前 `js-yaml` parse/serialize 行为一致。
- legacy 默认 `.drawio`、SVG、sidecar、stdout 与 `--export-spec` 行为保持不变；确定性 fixture 必须证明默认输出没有新增 wrapper、page metadata 或字段漂移。
- 新 multi-page bundle 使用显式 `schemaVersion: 1`，顶层为 document metadata、ordered `pages` 和 structured `links`。multi-page 不以扁平单页对象作为第二种隐式解释。

### R2 Page and Object Identity

- page `id` 是稳定机器身份，必须显式、大小写敏感且匹配 renderer-safe ID 规则；page `name` 是可重复的 Unicode display label，不参与身份。
- `pages` 数组顺序是唯一 authoritative page ordering；render/import/serialize 不按 id 或 name 排序。
- canonical object identity 是 `(pageId, objectId)`；node、module 和 edge 在 multi-page 中都必须有显式 object id，并在同一 page 的三类对象间唯一。
- 不同页面可以复用同一 object id；不得要求上游式的全文件 object id 全局唯一。
- renderer cell id 仍是页内实现细节。multi-page XML 必须保存安全的 canonical page/object metadata，使本仓生成的 bundle round-trip 后恢复原 `(pageId, objectId)`，不能依赖数字 cell id、label 或数组位置。

### R3 Structured Page Links

- document-level `links` 采用 `{ from: { pageId, objectId }, to: { pageId, objectId } }`；source 与 target 只允许指向 node 或 module，target object 必须真实存在。
- renderer 将 source 绑定为 draw.io 页面跳转 `data:page/id,<targetPageId>`；`to.objectId` 是 canonical/sidecar 的稳定语义目标，本 child 不承诺 draw.io viewer 自动聚焦目标 cell。
- 缺失 page/object、重复 page/object/link identity、错误对象类型或 self-duplicate link 都是 hard error；不得静默删除、猜测或按 label 回退。
- 不接受任意 raw link URI。page/object ids 拒绝控制字符和 XML/URI 注入字符，page names 经过 XML attribute escaping；`javascript:`、HTML data URI、事件属性和 closing-tag payload 必须有拒绝测试。

### R4 Per-Page Validation and Round-Trip

- 每页先按现有单页 `validateSpec` 契约校验，再做 multi-page object/link referential integrity；错误包含稳定 path、page index、page id 和对象位置。
- 每个生成或导入的 `<diagram>` 独立运行 XML validation；cell `0/1` 允许在不同页面重复，但同页重复、dangling edge 或 malformed model 仍失败。
- multi-page YAML -> `.drawio` 按 page order 生成一个 `<mxfile>` 和多个带安全 `id/name` 的 `<diagram>`；每页独立 layout/render，不共享 mutable layout state。
- `.drawio` -> canonical bundle 必须支持所有页面、压缩/未压缩混合、原 page order/id/name 和 canonical metadata 恢复。
- round-trip 验收针对本仓支持的 canonical 字段：normalize(YAML) -> `.drawio` -> import -> normalize 后深相等。任意第三方 XML 的未知 draw.io 属性不承诺无损保留。
- 外部 `.drawio` 页面缺少 id 时，all-pages import 按源顺序生成 `page-1`、`page-2`；存在但不安全或重复的 page id 显式拒绝。第一次 canonical export 后 identity 稳定。

### R5 YAML, Sidecar, Arch and CLI Boundaries

- multi-page `.spec.yaml` 保存一个完整 bundle，字段和数组按 author order 确定性序列化；不写时间戳、绝对路径或 provider 状态。
- legacy `.arch.json` 保持 `version: 1` 和现有 shape；multi-page `.arch.json` 使用 `version: 2`，记录 ordered pages、逐页/总 counts、稳定 object identity 与 structured links。
- `--write-sidecars` / `--sidecar-dir` 继续写一个 document-level `.spec.yaml` 和一个 `.arch.json`；不自动拆成每页 sidecar。
- multi-page YAML 输出 `.drawio` 时默认渲染全部页面。输出 SVG/PNG/PDF/JPG 时必须用 `--page <index|id|name>` 明确选择一页；本 child 不做批量 binary export。
- draw.io import 默认第一页面的 legacy-flat 行为不变；新增 `--all-pages` 才导入 multi-page bundle，且与 `--page` 互斥。multi-page stdin 没有明确 `.drawio` output 时显式失败，避免改变 legacy stdout 契约。
- page name selector 只有在唯一匹配时可用；重名时错误列出候选 page ids。id selector 优先于 name，index 为 0-based。

### R6 Scope, Dependencies and Evidence

- 不新增 runtime dependency；使用现有 Node 20、`js-yaml`、`node:zlib`、shared XML utilities 与现有 renderer/ELK。
- 不调用 Desktop、网络、browser、MCP、视觉模型或外部 binary；本基础契约只需 deterministic source/XML/file-backed evidence。
- 保持 legacy YAML、Redis/Lucide/AI icons、普通 stencil、现有 adapters 和 academic overlay 兼容。
- 不修改 `skills/drawio/SKILL.md`、`skills/drawio-academic-skills/SKILL.md`、interfaces 或全局 output scorecard。
- C4、`compress`、raster、SysML/BPMN、PR bot 与 integration/promotion 只能消费本契约，不在本 child 实现或创建任务。

## Acceptance Criteria

- [ ] legacy single-page fixture matrix 的 parse/validate/render/serialize/sidecar 默认行为与实施前 golden 完全一致；没有自动 `schemaVersion/pages` 或 XML wrapper 漂移。
- [ ] `schemaVersion: 1` multi-page bundle、page ordering、page id/name、跨页 `(pageId, objectId)` 和 edge explicit-id 契约有 schema/runtime tests。
- [ ] structured link 正确生成页面跳转并在 import/sidecar 中保留完整 source/target；missing target、duplicate ids 和 injection payload 均 hard-fail 且定位到 page/path。
- [ ] 多页 `.drawio` 对每页独立 validate；重复 root `0/1` 不跨页误报，真实同页重复与 dangling refs 仍被拒绝。
- [ ] uncompressed、compressed 和 mixed-page fixtures 完成 multi-page YAML -> `.drawio` -> YAML semantic round-trip，page/object/link identity 与 order 不变。
- [ ] multi-page `.spec.yaml` 与 arch v2 确定性；legacy arch v1 不变；sidecar-dir placement 仍符合现有 contract。
- [ ] CLI 保持 draw.io default first-page import，只有 `--all-pages` 导入 bundle；非 `.drawio` multi-page export 无 `--page` 时明确失败。
- [ ] focused tests、legacy single-page matrix、multi-page round-trip、injection/security scan、`npm test`、`just ci` 和 `git diff --check` 全部通过。
- [ ] 没有新增 runtime dependency、网络/Desktop/browser/MCP/视觉模型调用、第二套 XML renderer、C4/compress 语义或 integration 路由。
- [ ] 只启动、归档本 child；C2/C3 bucket 与 parent 保持 planning，未创建 integration/promotion child。

## Out of Scope

- C4 System Context/Container/Component 语义、C4 shape/theme preset 或自动层级生成。
- `compress` 聚类、摘要命名、董事会叙事或 detail-page 生成。
- raster/replicate、SysML/BPMN、PR bot、PPT/HTML/批量 binary export。
- 两个 `SKILL.md`、interfaces、全局 scorecard、release promotion 或 remote push。
- 任意第三方 `.drawio` 未建模属性的通用无损 XML editor。

## Dependencies and Approvals

- 前置 feature：无。已完成 C0/AI icon 仅作为兼容回归面，不继承其 Desktop、网络、browser、MCP 或视觉模型批准。
- 新 runtime dependency：不需要，且未经新的明确批准不得增加。
- 外部动作批准：本 child 规划与实施均不需要；Desktop、网络、browser、MCP、视觉模型和 binary evidence 均标记为不必要，而非 `missing evidence`。
- 实施批准：仍需要用户审阅本任务三个规划工件并明确批准后，才可执行 `task.py start`。

# SysML/BPMN canonical stencil delta

## Goal

让现有离线 shape catalog、search、canonical `icon` validation 与唯一 draw.io renderer 能发现并使用 vendored index 中已有的 SysML/BPMN stencil，同时诚实限定 flat canonical schema 无法表达的嵌套语义。

## Confirmed Facts

- `shape-index.json.gz` 已 vendored `mxgraph.sysml.*` 27 项、`mxgraph.bpmn.*` 196 项；实施前生成的 `shape-catalog.json.gz` 两类均为 0。
- `COVERED_PREFIXES` 是 catalog 生成与 validation 覆盖范围的单一来源；当前不含 SysML/BPMN，因此未知名称被归为 `uncovered` 而不是 `unknown`。
- `catalog-search.js`、`resolveShapeNameKind()`、`validateSpec()` 与 `specToDrawioXml()` 已形成唯一 catalog-to-renderer 路径，无需新 renderer、layout engine、schema 或 shape index。
- 上游 diagram-type reference 描述 SysML BDD/IBD/requirement/parametric 与 BPMN task/event/gateway/pool/lane/flow，但本仓 flat canonical schema 不拥有任意嵌套 port、pool/lane containment 或专用 connector semantic contract。
- 已归档 `07-14-stencil-catalog-search` 拥有现有 catalog v2 架构；本 child 只扩展其覆盖集合和回归证据。

## Capability Mapping

- **adapt**：把 vendored index 中 `mxgraph.sysml.*` 与 `mxgraph.bpmn.*` 条目纳入现有 deterministic catalog，供 search、validation 与 canonical `icon` 节点消费。
- **bridge**：通用 block/task/requirement label、普通 node/edge、ELK layout、renderer、sidecar 与 visual-review 继续使用现有 canonical pipeline。
- **replace**：无。本 child 不引入上游 Python `shapesearch.py`、renderer 或 preset runtime。
- **defer**：需要相对 geometry/parent containment 的 SysML ports、BPMN pool/lane hierarchy，以及专用 message/sequence-flow 语义；在新增 canonical containment/connector contract 前不得宣称端到端支持。

## Requirements

1. `COVERED_PREFIXES` 增加且仅增加 `mxgraph.sysml.`、`mxgraph.bpmn.`，生成器继续以该常量为单一来源。
2. 重建的 catalog 必须确定性包含全部 27 个 SysML 与 196 个 BPMN source rows 对应的唯一 stencil name；重复 style variant 只合并 name，title/tags 仍可用于 search。
3. search 必须能为 `sysml requirement` 和 `bpmn task` 返回对应前缀结果，显式 `--prefix` 过滤保持有效且结果稳定。
4. `resolveShapeNameKind()` 对已收录名称返回 `stencil`，对两类 covered namespace 下的拼写错误返回 `unknown`；其他未覆盖 namespace 行为不变。
5. 至少一个 SysML 与一个 BPMN canonical `icon` spec 必须通过 validation 并由现有 renderer 产生非空 `shape=mxgraph.*` XML，不建立平行渲染路径。
6. 新增 `.trellis/spec/drawio-skill/sysml-bpmn.md`，记录 catalog ownership、支持边界、defer 与验证契约；不在 feature child 修改两个 `SKILL.md`、interfaces、global eval/scorecard、compatibility、docs 或 release evidence。
7. runtime 保持 Node-only/offline；不得引入 Python、Graphviz、network、Desktop、browser、MCP、model 或新 dependency。

## Acceptance Criteria

- [x] 生成器 focused test 先失败，再证明 SysML/BPMN 收录、去重与排序确定性。
- [x] 生成后的 catalog 对 source index 统计为 SysML 27/27 rows、BPMN 196/196 rows，且两个 namespace 均有非零唯一 stencil 集合。
- [x] `sysml requirement`、`bpmn task` 与显式 prefix search 的 top results 属于正确 namespace。
- [x] 已知 stencil、未知 covered stencil、既有 covered/uncovered 行为均有回归测试。
- [x] canonical SysML/BPMN icon validation/render smoke 复用 `validateSpec`、ELK/既有 renderer，并产生可检查的 XML shape style。
- [x] focused tests、相关 DSL tests、`npm test`、`just ci` 与 `git diff --check` 通过。
- [x] Desktop/model/human semantic fidelity 与 deferred nested constructs 保持 `missing evidence`，不计为通过。

## Dependencies

- 已归档 `07-14-stencil-catalog-search`：catalog v2、search、ranking、validation 基础。
- 已归档 `07-18-drawio-ai-icon-catalog`：独立 Lobe catalog；本 child 不修改或复制其 runtime/assets。
- 已归档 `07-19-drawio-multi-page-foundation` 与 `07-19-drawio-raster-replicate-adapter`：无实现依赖，只要求最终 integration 保持兼容。

## Out of Scope

- SysML/BPMN 专用 canonical schema、嵌套 container/port geometry、自动语义建模或新 layout algorithm。
- 上游 Python CLI、Desktop 渲染截图、模型生成或人工语义正确性声明。
- 修改 skill description、interfaces、global evals/docs/matrix/scorecard/package/release evidence。

## Missing Evidence

- 没有 Desktop 像素渲染证据、视觉模型或人工领域专家对 SysML/BPMN 语义正确性的验证。
- 没有 flat canonical schema 对 nested ports、pools、lanes 或专用 message/sequence flow 的端到端证据；这些能力权威状态为 `defer`。

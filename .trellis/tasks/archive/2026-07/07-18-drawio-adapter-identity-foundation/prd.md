# Canonical adapter 与稳定身份基础

## Goal

建立所有 C1 importer 共用的有版本 canonical graph projection、identity factory、稳定 renderer ID、projection validation 和 projection-to-spec 边界，使 parser 只负责解析，布局与渲染稳定回到现有 JavaScript ELK/canonical pipeline。

## Confirmed Facts

- 当前 adapter 直接返回 `{ meta, nodes, edges, modules }`；没有正式的 graph projection schema 或跨 snapshot identity contract。
- canonical node/module ID 只允许字母开头的字母数字、下划线和连字符，而所需 identity 包含点、斜线、方括号和 provider-specific path。
- renderer 会把 canonical node ID 映射到内部 numeric mxCell ID，因此完整 external identity 不需要直接成为 XML cell ID。
- vendored ELK 已在 `scripts/dsl/auto-layout.js` 为 `meta.layout: hierarchical` 处理 compound nodes 与 orthogonal edge routes。
- C0 的 visual review 依赖稳定 canonical object ID；label 不是可接受的默认 identity。

## Requirements

### R1 CanonicalGraphProjection v1

- 定义独立 JSON schema，top-level 至少包含 `version`、`source`、`nodes`、`edges`、`modules`、`diagnostics`。
- `source` 至少包含 adapter、domain、mode（`code|declared|live|drift`）和可复现 locator；时间、绝对路径和 provider metadata 不能参与 identity。
- projection node/module 保存完整 `{ scheme, key }` identity、display label、semantic hints 和允许比较的 attributes；edge 保存 identity、from/to identity、relation、稳定 discriminator 与 attributes。
- 未知 projection version、重复 identity、悬空 edge、非法 attributes、非确定性 discriminator 或 unsupported construct 必须在 projection 边界失败或产生明确 diagnostic，不能静默丢失。

### R2 Shared Identity Factory

- 一个 base-owned factory 负责 normalize、serialize、compare 和 stable renderer ID；importer 不得自行拼字符串或 hash。
- renderer ID 由 `scheme + NUL + normalized key` 的 SHA-256 确定性派生，使用满足现有 ID regex 的 kind prefix + 固定长度 lowercase hex；必须检测输出碰撞并失败。
- label、输入顺序、绝对 checkout path、capture time、style 和 mutable runtime instance ID 不参与 stable renderer ID。
- 最低 factory 规则：
  - Terraform：完整 module-qualified resource address，保留 `count/for_each` instance key。
  - Kubernetes：显式 scope + normalized namespace + kind + name；cluster-scoped 对象使用明确 sentinel，不把缺 namespace 猜成 display label。
  - Docker Compose：project + service；container ID/name 只作为 secondary instance attribute。
  - Code：language + canonical project-relative POSIX module path；不使用当前机器的 absolute root。
  - OpenAPI：uppercase method + normalized, case-preserving path；operation summary/operationId 只作 attribute。
  - CI：provider + canonical repo-relative workflow path + stable job key；workflow/job display name 不参与 identity。
- 额外定义 SQL `dialect/schema/table`、generic group 和 edge identity；同端点同 relation 的多重 edge 必须提供 source-derived discriminator。

### R3 Projection To Canonical Spec

- projector 只把 validated projection 转为现有 spec shape，并可在 canonical node/edge/module 上保留完整 identity metadata；不得布局或生成 XML。
- 输出 `meta.layout: hierarchical`，随后调用现有 `validateSpec`、JS ELK、renderer、XML validation 与 artifact helpers。
- identity metadata 必须纳入 schema、runtime validation、arch sidecar 和 schema-drift contract；不允许成为 renderer 忽略且无法 round-trip 的幽灵字段。
- semantic hints 通过现有 type/icon/module/style policy 映射；projection 不接受 raw Draw.io style strings。

### R4 Errors, Evidence, And Boundaries

- 导出稳定错误 taxonomy：`ADAPTER_PARSE`、`ADAPTER_UNSUPPORTED`、`PROJECTION_INVALID`、`IDENTITY_INVALID`、`IDENTITY_COLLISION`、`OPTIONAL_DEPENDENCY_MISSING`、`DRIFT_INCOMPATIBLE`；CLI 保留 code/context 并非零退出。
- 本 child 不实现任何具体 code/config/live parser，不添加 CLI capture command，不修改 academic runtime。
- 本 child 不添加 Graphviz；上游 `autolayout.py` 的默认 Graphviz 路径标记 `replace`，由现有 JS ELK 接替。Graphviz 只有出现 ELK 缺口的对比证据后才可作为隔离 optional tool。
- focused fixtures 必须证明 identity 与 label/顺序/path 解耦、declared/live shared factory、edge discriminator、collision/error 和 projection-to-spec/ELK 接入。
- provider CLI、Desktop、Graphviz 和视觉模型执行证据本 child 均为 `missing evidence`，且不影响 deterministic foundation 验收。

## Dependencies

- 前置：已完成 C0 只作为后续 visual consumer contract；本 child 没有未完成 feature dependency。
- 后续消费者：`07-18-drawio-code-importers`、`07-18-drawio-config-importers`、`07-18-drawio-live-snapshots-drift`。
- 实施时只能启动本 child；父任务和 C1 bucket 保持 `planning`。

## Acceptance Criteria

- [x] `CanonicalGraphProjection v1` schema 和 runtime validator 对 valid/invalid fixture 给出确定性结果。
- [x] identity factory 覆盖 Terraform、Kubernetes、Compose、Code、OpenAPI、CI、SQL、group、edge 规则。
- [x] 同 identity 在 label、顺序、绝对 root 和 capture metadata 变化时得到相同 renderer ID；不同 identity 不冲突，人工 collision fixture 显式失败。
- [x] declared/live 测试调用同一个 factory export，而非复制相同字符串逻辑。
- [x] edge 多重关系没有 discriminator 时失败；稳定 discriminator 下顺序变化不改变 edge identity。
- [x] projection 可投影为 schema-valid canonical spec，经过 vendored JS ELK 后仍保留 identity，且不调用 Graphviz。
- [x] canonical YAML 与 `.arch.json` 能保留必要 identity/provenance，但不包含 raw source secret、绝对路径或 raw XML/style blob。
- [x] Mermaid、CSV、drawio import 和未携带 identity 的现有 spec 保持向后兼容。
- [x] focused tests、`npm test`、`just ci` 通过；docs/schema surface 变化时 `npm run docs:build` 通过。
- [x] optional/provider/model/Graphviz 未执行证据继续标记 `missing evidence`。

## Out Of Scope

- Python/JS/Go/Rust、Terraform/Kubernetes/Compose/SQL/OpenAPI/CI 的实际 parser。
- live provider command execution、snapshot capture 和 drift presentation。
- Graphviz layout、上游 graph JSON/CLI compatibility、academic overlay runtime。

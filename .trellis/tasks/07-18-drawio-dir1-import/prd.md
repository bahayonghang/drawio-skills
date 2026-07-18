# 方向①导入与漂移

## Goal

把代码、声明式配置和运行态快照解析成同一套有版本的 canonical graph projection，再投影到现有 YAML-first canonical spec，由本仓 JavaScript ELK 完成布局；在不依赖可变 label 的前提下比较声明态与运行态漂移。

本目录是 C1 能力域 bucket，只拥有范围、child 依赖、跨 child 验收和集成审阅，不直接实施，也不得运行 `task.py start`。

## Confirmed Facts

- 本仓已有 `skills/drawio/scripts/adapters/index.js`、`validateSpec`、vendored JS ELK、Draw.io renderer、sidecar 和 C0 视觉返工闭环。
- 现有 canonical `node.id` 只接受 `^[A-Za-z][A-Za-z0-9_-]*$`，不能直接承载 Terraform address、Kubernetes tuple、Go module path 或 CI path。
- 上游 importer 输出临时 graph JSON，多数再交给 `autolayout.py`；`autolayout.py` 默认硬依赖 Graphviz `dot`，多个 importer 的默认 transitive reduction 还调用 `tred`。
- 上游 `drawiodiff.py` 比较 Draw.io cell ID 或可选 label，只把 label 变化视为 node change，没有正式的重要属性合同。
- C0 `07-18-drawio-vision-rework` 已完成，base 已拥有 `vision-preview`、structured visual review、YAML-first rework 和 stopping rules；确定性检查不能替代实际导出物的视觉模型执行证据。

## Requirements

### R1 Child Boundaries

- `07-18-drawio-adapter-identity-foundation`：拥有 projection schema、共享 identity factory、稳定 render ID、projection validation/projector 和错误分类。
- `07-18-drawio-code-importers`：拥有 Python imports/classes、JS/TS、Go、Rust 源码关系解析，只输出 projection；依赖 foundation。实现仅使用 Node JS/TS 与 optional Python，不引入 Go/Rust toolchain 或 subprocess。
- `07-18-drawio-config-importers`：拥有 Terraform、Kubernetes、Compose、SQL DDL、OpenAPI、GitHub Actions/GitLab CI 声明态解析；依赖 foundation。
- `07-18-drawio-live-snapshots-drift`：拥有 Terraform state、Docker inspect、Kubernetes live JSON、projection drift 和 drift visual review；依赖 foundation、config importers 和已完成 C0。

### R2 Canonical And Identity Contracts

- Adapter 只解析并输出 canonical spec 或正式版本化的 canonical graph projection；不得写 Draw.io XML、不得布局、不得调用 Desktop。
- projection 到 spec 后必须依次经过 `validateSpec`、本仓 JS ELK、renderer、`validateXml` 和现有 sidecar/artifact 管线。
- 完整语义 identity 与 renderer-safe `id` 分离；后者由前者确定性派生，不能由 label、数组序号或输入遍历顺序派生。
- 声明态与 live snapshot 必须调用同一个 identity factory；不得在各 importer 内复制 identity 拼接规则。
- 最低 identity 规则：Terraform module-qualified resource address；Kubernetes scope/namespace/kind/name；Compose project/service；Code canonical module path；OpenAPI method + normalized path；CI provider/workflow/job。
- edge identity 由 source identity、relation、target identity 和稳定 discriminator 构成；同端点同 relation 的多重边缺少 discriminator 时必须报错，不能使用易变 ordinal。

### R3 Layout, Errors, Dependencies, And Evidence

- JS ELK 是默认且唯一必经布局；Graphviz 不成为默认依赖。只有独立、可选、已有比较证据的能力才可声明 Graphviz，并且缺证据时继续 `defer`。
- 解析错误、unsupported construct、projection validation、identity collision、optional dependency missing 和 drift incompatibility 必须有不同的错误代码/消息；不静默返回部分正确结果。
- Python、Terraform/Docker/Kubernetes CLI、Graphviz 或新增 parser package 都只能按 child 工件所述成为显式可选依赖；普通 create/edit/import/export 不受影响。
- 每个 child 都要列出 focused tests、root gates、rollback boundary 和未取得证据；fixture、command、Desktop 和 model evidence 必须分开标记。
- live/drift 必须复用 C0 的 preview、structured review、YAML-first rework 和 stopping rules；未取得 provider/model metadata 时视觉模型执行继续标记 `missing evidence`。
- 所有 runtime、schema、adapters、fixtures 和完整流程归 base；academic overlay 只追加出版检查和指向 base 的强引用。

## Dependencies And Delivery Order

```text
completed C0 visual-preview/review/rework/stopping contracts
                  |
                  v
adapter + stable identity foundation
          |                    |
          v                    v
   code importers       config importers
                              |
                              v
                 live snapshots + drift
```

`code importers` 与 `config importers` 在 foundation 完成后可独立交付；`live snapshots + drift` 还必须等待 config child 固化 Terraform/Kubernetes/Compose 的声明态 identity 与 projection 语义。

## Acceptance Criteria

- [ ] 四个 child 都有独立 `prd.md`、`design.md`、`implement.md`，依赖、交付顺序和验收边界不靠目录树暗示。
- [ ] foundation 提供可测试的 versioned projection、identity factory、stable render ID、错误分类和 projection-to-spec 合同。
- [ ] 15 个 C1 相关 upstream 脚本逐项标记 `bridge`、`adapt`、`replace` 或 `defer`，包含理由、owner、依赖和证据状态。
- [ ] code/config adapters 只解析；任何 layout 都回到本仓 JS ELK，Graphviz 不在默认路径。
- [ ] declared/live 的 Terraform、Kubernetes、Compose identity fixture 跨 child 一致；label 变化不改变 identity。
- [ ] drift 分别报告 node、edge、重要 attribute 的 `added/removed/changed/same`，并以文字/线型保留非颜色语义。
- [ ] live/drift 的确定性 gates 与 C0 visual evidence 分开；无 provider/model 执行证据时保留 `missing evidence`。
- [ ] base/academic 所有权没有反转或复制；root `npm test`、`just ci`、docs build 按各 child 风险执行。
- [ ] bucket 始终保持 `planning` 且不作为 implementation target；只启动当前可执行 child。

## Out Of Scope

- 上游 Python CLI、参数和临时 graph JSON 的兼容承诺。
- 在 adapter 中直接生成 XML、执行布局、调用 Desktop 或修改 preview。
- 把 Graphviz、Python、provider CLI、browser、MCP 或网络变成普通 base runtime 的硬依赖。
- 在没有实际 provider/model 运行时宣称视觉模型验收通过。

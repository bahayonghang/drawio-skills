# 运行态快照与架构漂移

## Goal

把用户明确提供的 Terraform state/plan JSON、Docker inspect JSON 和 Kubernetes live JSON 规范化为 sanitized canonical graph projection，复用声明态 identity factory 比较 node、edge 和重要 attributes 的漂移，并用 C0 的 visual-preview/review/rework/stopping 合同验收漂移图。当前 child 只处理 file/stdin snapshot，不执行 live capture。

## Requirements

- 前置依赖：foundation 与 config importers 完成；C0 已归档完成。
- `tfstate.py`、`dockerimports.py` 映射为 `adapt`；`drawiodiff.py` 映射为 `replace`。Kubernetes live JSON bridge 到 config child 的同一 Kubernetes adapter/identity builder，不复制 upstream parser。
- Adapter 只消费用户明确指定的 JSON file/stdin；不扫描目录、不复制或持久化 raw snapshot，不执行 `terraform`、`docker`、`kubectl`，不访问 daemon/socket、远程 cluster/cloud 或认证环境。
- declared/live 必须 import 同一个 Terraform/Kubernetes/Compose identity factory 和 important attribute allowlist。Compose live 容器以 project/service 匹配声明 service；instance 只聚合为 replica count，container name/ID 不进入 projection。
- Docker MVP 只投影带明确 Compose project/service labels 的 service：同一 project/service 的 containers 聚合为一个 node，container name/ID 不持久化；standalone containers 与仅凭 container inspect 无法可靠还原逻辑名的 network/volume 关系返回显式 diagnostic 并保持 `missing evidence`，禁止按前缀猜测。
- Terraform instance address 精确参与 identity。未展开的 declared address 与 state 中的 `count`/`for_each` instance address 表示不同粒度，当前报告为 removed baseline + added instances，不猜测聚合；跨实例对齐保持 `missing evidence`。
- drift 在 projection 层按 identity 比较，分别输出 nodes、edges、attributes 的 `added/removed/changed/unchanged`。label 是显式 display comparison field，但不是 identity key；relation 属于 edge identity，relation 变化表现为 removed + added。
- report 中 status buckets、identity records、changed keys 和 before/after object keys 都确定性排序。当前三域 edge allowlist 为空，因此 domain edge `changed` 可为空；generic comparator 仍覆盖 allowlisted edge attribute change。
- drift report/diagram 除颜色外必须包含 status text、legend、removed dashed 和 changed evidence；不能让 monochrome/print 场景丢失语义。
- sanitized projection/report 是 work-dir evidence；raw snapshot 仍是用户拥有的输入且不得复制。canonical YAML 是可编辑图源。任何视觉返工修改 drift canonical YAML 后重新 validate/render/preview。
- Terraform 永不投影 `values`、`sensitive_values`、outputs 或 change payload；Docker 永不投影 `Config.Env`、非必要 labels、container ID/name、credentials 或 bind paths；Kubernetes 永不投影 Secret `data`/`stringData`/`binaryData`、annotations、managedFields、literal env values 或 raw object。Diagnostics 不得包含原值、绝对路径或 raw payload。
- 复用 C0：bounded `vision-preview`、structured review record、YAML-first patch loop、最多 2 轮自主修复/5 轮用户评审停止规则。
- deterministic structure/layout checks 与实际 PNG/model review 分开；无 provider/model metadata 时 `model-executed` 为 `missing evidence`。

## Acceptance Criteria

- [x] Terraform state、Docker inspect、Kubernetes JSON 有 valid/invalid/sensitive-field fixtures，并输出 valid live projection。
- [x] declared/live 精确同一实体的 identity/render ID 相同；label、capture time、container instance name 和输入顺序变化不破坏匹配；Terraform instance 粒度限制有显式测试和 diagnostic。
- [x] node、edge、important attribute 的 `added/removed/changed/unchanged` 有 deterministic tests；相同 identity 的 label/allowlisted attribute change 标记 `changed`，relation change 标记 removed + added。
- [x] duplicate/ambiguous identity、projection/report version mismatch、显式 comparison context 不同或 incompatible domains 抛 `DRIFT_INCOMPATIBLE`/identity error，不回退 label。Kubernetes scope 与 Compose project 必须由调用者提供；Terraform comparison context 是显式逻辑 scope，不从 cwd/backend 猜测。
- [x] drift canonical spec 经过 JS ELK/renderer/validation；没有 Graphviz。
- [x] drift 语义有文字、线型、legend，不只靠颜色。
- [x] 至少一组 declared-vs-live file-backed case 消费 C0 preview/review/YAML-first/stopping contract。
- [x] focused tests、`npm test`、`just ci` 通过；公共 docs/scorecard 变化时 docs build 通过。
- [x] provider CLI、真实 live environment、Desktop 和 model runs 未执行时分别保持 `missing evidence`。
- [x] raw snapshot、Terraform sensitive values、Kubernetes Secret payload、Docker env/labels/credentials/paths 不出现在 projection、report、canonical YAML、diagnostics 或 committed fixtures。

## Out Of Scope

- 默认执行 provider CLI、访问 cloud/cluster/socket、长期监控或自动修复 live infrastructure。
- 任何 capture provider、provider CLI subprocess 或认证环境继承；Terraform、Docker、Kubernetes capture 后续分别规划和批准。
- Docker standalone container、network/volume declared/live parity，以及 Terraform `count`/`for_each` declared-instance 聚合。
- 从 Draw.io XML/style 反推 drift attributes，或默认按 label 匹配。
- PR bot/PR comments；属于 C3 Governed child。

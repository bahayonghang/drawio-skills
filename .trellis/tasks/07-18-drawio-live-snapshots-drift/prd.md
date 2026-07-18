# 运行态快照与架构漂移

## Goal

把用户提供的 Terraform state/plan JSON、Docker inspect JSON 和 Kubernetes live JSON 规范化为 canonical graph projection，复用声明态 identity factory 比较 node、edge 和重要 attributes 的漂移，并用 C0 的 visual-preview/review/rework/stopping 合同验收漂移图。

## Requirements

- 前置依赖：foundation 与 config importers 完成；C0 已归档完成。
- `tfstate.py`、`dockerimports.py` 映射为 `adapt`；`drawiodiff.py` 映射为 `replace`。Kubernetes live JSON bridge 到 config child 的同一 Kubernetes adapter/identity builder，不复制 upstream parser。
- Adapter 只消费已捕获的 JSON file/stdin；默认不执行 `terraform`、`docker`、`kubectl`，不读取远程 cluster/cloud。
- declared/live 必须 import 同一个 Terraform/Kubernetes/Compose identity factory 和 important attribute allowlist。Compose live 容器以 project/service 匹配声明 service；container name/ID 为 secondary instance attribute。
- drift 在 projection 层按 identity 比较，分别输出 nodes、edges、attributes 的 `added/removed/changed/same`；label 变化只是 attribute change，不是 identity match key。
- drift report/diagram 除颜色外必须包含 status text、legend、removed dashed 和 changed evidence；不能让 monochrome/print 场景丢失语义。
- snapshot/projection/diff 是 work-dir evidence；canonical YAML 是可编辑图源。任何视觉返工修改 drift canonical YAML 后重新 validate/render/preview。
- 复用 C0：bounded `vision-preview`、structured review record、YAML-first patch loop、最多 2 轮自主修复/5 轮用户评审停止规则。
- deterministic structure/layout checks 与实际 PNG/model review 分开；无 provider/model metadata 时 `model-executed` 为 `missing evidence`。

## Acceptance Criteria

- [ ] Terraform state、Docker inspect、Kubernetes JSON 有 valid/invalid/sensitive-field fixtures，并输出 valid live projection。
- [ ] declared/live 同一实体的 identity/render ID 相同；label、capture time、container instance name 和输入顺序变化不破坏匹配。
- [ ] node、edge、important attribute 四状态分别有 tests；相同 identity 的 label/attribute change 标记 `changed`。
- [ ] duplicate/ambiguous identity、schema version mismatch、不同 scope/project 或 incompatible domains 抛 `DRIFT_INCOMPATIBLE`/identity error，不回退 label。
- [ ] drift canonical spec 经过 JS ELK/renderer/validation；没有 Graphviz。
- [ ] drift 语义有文字、线型、legend，不只靠颜色。
- [ ] 至少一组 declared-vs-live file-backed case 消费 C0 preview/review/YAML-first/stopping contract。
- [ ] focused tests、`npm test`、`just ci` 通过；公共 docs/scorecard 变化时 docs build 通过。
- [ ] provider CLI、真实 live environment、Desktop 和 model runs 未执行时分别保持 `missing evidence`。

## Out Of Scope

- 默认执行 provider CLI、访问 cloud/cluster/socket、长期监控或自动修复 live infrastructure。
- 从 Draw.io XML/style 反推 drift attributes，或默认按 label 匹配。
- PR bot/PR comments；属于 C3 Governed child。

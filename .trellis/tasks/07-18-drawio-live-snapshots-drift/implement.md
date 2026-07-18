# Implement - 运行态快照与架构漂移

## Preconditions

- [ ] foundation 与 config children 已完成；shared identity/attribute fixtures 已冻结。
- [ ] 本 child 三件套获批准；只启动本 child，父任务/C1 bucket 保持 `planning`。
- [ ] inline 运行 `trellis-before-dev`，读取 C0 archived artifacts 和现行 visual-review contract。

## Ordered Work

1. 先补 snapshot version/shape、declared/live exact identity parity、sensitive omission、Docker replica aggregation、diff four-state、ordering 和 incompatibility red tests。
2. 实现 Terraform state/plan 与 Docker inspect snapshot normalizers；Kubernetes declared/live wrappers 复用同一 structured normalizer、identity builder 和 allowlist。不得调用 code parser、Python worker、provider CLI 或其他 subprocess。
3. 实现 projection drift engine，分别比较 nodes/edges/allowlisted attributes 与 display label；禁止 label fallback，relation change使用 removed + added。
4. 生成 versioned machine report 与 non-color-only drift projection，交给 shared projector/validateSpec/JS ELK/renderer/validateXml；presentation 只在 canonical spec 层追加 status text、legend 和 removed dashed。
5. 用 file-backed declared/live case消费 C0 review record/YAML-first/stopping contract；不执行 Desktop/model，证据保持 `missing evidence`。
6. 更新 base live/drift reference、compatibility、scorecard；academic 只追加 print/publication review pointer。

## Focused Tests

```powershell
node --test skills/drawio/scripts/adapters/terraform-state.test.js
node --test skills/drawio/scripts/adapters/docker-inspect.test.js
node --test skills/drawio/scripts/adapters/kubernetes-live.test.js
node --test skills/drawio/scripts/adapters/graph-drift.test.js
node --test tests/vision-preview-evidence.test.js tests/visual-verification-policy.test.js tests/security.test.js
```

## Root Gates

```powershell
npm test
just ci
npm run docs:build
```

## Optional Dependencies

- Adapter input：local JSON file/stdin，无新增 runtime dependency。
- `terraform`、`docker`、`kubectl` 与任何 capture provider：当前 child 不实现、不执行，后续分别立项审批。
- Python/config/code parser subprocess：当前 child 不执行；测试使用纯 JavaScript snapshot fixtures和现有 injected seams。
- Graphviz：无；JS ELK 默认。
- Desktop/vision provider：当前 child 不执行，按 contract 保持 `missing evidence`。

## Evidence And Rollback

- 记录 fixture、command、provider CLI、Desktop、model execution 为不同 evidence kind。
- 无真实 provider/model metadata 时继续 `missing evidence`；不得用 deterministic diff 代替。
- snapshot normalizer 与 comparator/presentation 使用两个原子工作提交，可单独 rollback。只允许为 live mode wrapper、Compose replica allowlist 和 executable contract 做最小 shared config/spec改动；不得私建第二套 identity factory。

## Final Review

- [ ] declared/live import 同一个 factory/attribute allowlist，有代码级 import evidence。
- [ ] label/instance/order 不影响 primary identity，ambiguous match 显式失败。
- [ ] node/edge/attribute `added/removed/changed/unchanged` 完整、排序稳定且不只靠颜色。
- [ ] Raw/sensitive/env/Secret/path/payload 不进入任何生成 artifact 或 diagnostic。
- [ ] C0 review/rework/stopping contracts 被 file-backed case 消费；Desktop/model 保持 `missing evidence`。
- [ ] JS ELK 默认，无 Graphviz。
- [ ] focused/root gates 通过，provider/model gaps 明示。

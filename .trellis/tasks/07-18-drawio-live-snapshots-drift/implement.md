# Implement - 运行态快照与架构漂移

## Preconditions

- [ ] foundation 与 config children 已完成；shared identity/attribute fixtures 已冻结。
- [ ] 本 child 三件套获批准；只启动本 child，父任务/C1 bucket 保持 `planning`。
- [ ] inline 运行 `trellis-before-dev`，读取 C0 archived artifacts 和现行 visual-review contract。

## Ordered Work

1. 先补 declared/live identity parity、sensitive omission、diff four-state 和 incompatibility red tests。
2. 实现 Terraform state/plan 与 Docker inspect normalizers；Kubernetes live bridge 复用 config adapter。
3. 实现 projection drift engine，分别比较 nodes/edges/allowlisted attributes；禁止 label fallback。
4. 生成 machine report 与 non-color-only drift projection，交给 shared projector/JS ELK。
5. 用 file-backed declared/live case 跑 C0 preview、structured review、YAML-first rework 和 stopping rule evidence。
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
- `terraform`、`docker`、`kubectl`：仅 optional capture commands，默认不执行。
- Graphviz：无；JS ELK 默认。
- Desktop/vision provider：只用于 C0 evidence，缺失时按 contract fallback/`missing evidence`。

## Evidence And Rollback

- 记录 fixture、command、provider CLI、Desktop、model execution 为不同 evidence kind。
- 无真实 provider/model metadata 时继续 `missing evidence`；不得用 deterministic diff 代替。
- live normalizer、diff CLI/reference 和 scorecard case 可单独 rollback；config/foundation contract 不在本 child 私改。

## Final Review

- [ ] declared/live import 同一个 factory/attribute allowlist，有代码级 import evidence。
- [ ] label/instance/order 不影响 primary identity，ambiguous match 显式失败。
- [ ] node/edge/attribute statuses 完整且不只靠颜色。
- [ ] C0 preview/review/rework/stopping contracts 被实际消费。
- [ ] JS ELK 默认，无 Graphviz。
- [ ] focused/root gates 通过，provider/model gaps 明示。

# Implement - Canonical adapter 与稳定身份基础

## Preconditions

- [x] 用户审阅本 child 的 `prd.md`、`design.md`、`implement.md` 并明确批准。
- [x] 只运行 `task.py start 07-18-drawio-adapter-identity-foundation`；父任务与 C1 bucket 保持 `planning`。
- [x] inline Phase 2 重新运行 `trellis-before-dev`，读取 parent research、C0 contract、frontend/drawio-skill specs。
- [x] 搜索当前 adapter/schema/validator/arch sidecar assertions，记录兼容面。

## Step 1 - Red Contract Tests

- 新增 `identity.test.js`：覆盖全部 domain factories、label/order/root/time independence、invalid tuple 和 synthetic collision injection。
- 新增 `graph-projection.test.js`：覆盖 version、duplicates、dangling edges、attribute allowlist、unknown constructs 和 deterministic ordering。
- 新增 `projection-to-spec.test.js`：证明输出满足现有 ID regex、identity round-trip，且不布局、不生成 XML。

Completion: 新合同测试因缺少实现而失败，现有 adapter tests 保持 green。

## Step 2 - Identity Factory

- 实现 structure-first domain factory 和 canonical serialization。
- 使用 Node built-in `crypto` 生成固定 renderer ID；注入 hash seam 测 collision，不依赖真实碰撞。
- 实现 edge discriminator/uniqueness、module identity 和 stable sort。

Completion: 相同 identity 的不同 label/order/path fixture 产生完全相同 ID；ambiguous tuple 显式失败。

## Step 3 - Projection Schema And Validation

- 增加 `graph-projection.schema.json` 与等价 runtime validation。
- 限制 source locator、attributes、diagnostics 和 secret-bearing fields。
- 建立统一 error codes/object，不在 reusable module 中 `process.exit`。

Completion: schema/runtime validators 对 fixture 结果一致，错误包含 code 与 source context。

## Step 4 - Projection To Spec

- 实现 semantic projector，保留 identity/provenance，不接受 raw Draw.io style。
- 扩展 canonical schema、`validateSpec`、schema-drift contract、`buildArchMetadata` 和相关 tests。
- 旧 spec identity 可选；adapter-produced projection identity 必需。

Completion: projection -> spec -> serialize/parse -> arch sidecar 保留 sanitized identity，旧 tests 不变。

## Step 5 - JS ELK Integration Proof

- 用 foundation fixture 调用 projector、`validateSpec`、`applyAutoLayout`、renderer 和 `validateXml`。
- 注入 ELK test seam，断言 adapter/projector 没有 `dot/tred` subprocess 或 Graphviz package。
- 记录 `autolayout.py = replace` 和 Graphviz `defer` 的证据状态。

Completion: hierarchical fixture 经现有 vendored ELK 产生 bounds/waypoints；无 Graphviz 时路径完整。

## Step 6 - Reference And Compatibility Surface

- 在 base reference 中记录 projection/identity/optional dependency contract；保持 `SKILL.md` lean。
- 只有 route evidence 证明需要时才修改 descriptions；若修改，运行既有 26-probe regression 和 1024-byte gate。
- academic 只在必要时增加指向 base 的 policy pointer，不增加 runtime/schema copy。

## Focused Tests

```powershell
node --test skills/drawio/scripts/adapters/identity.test.js
node --test skills/drawio/scripts/adapters/graph-projection.test.js
node --test skills/drawio/scripts/adapters/projection-to-spec.test.js
node --test skills/drawio/scripts/dsl/auto-layout.test.js tests/arch-json.test.js tests/security.test.js
```

## Root Gates

```powershell
npm test
just ci
npm run docs:build
```

## Verification Evidence - 2026-07-18

- focused identity/projection/projector tests: `16/16` passed。
- adapter + JS ELK + arch sidecar + security tests: `86/86` passed。
- `npm test`: `485/485` passed。
- `just ci`: version sync、Markdown lint、`485/485` tests 与 VitePress docs build passed。
- `.trellis` task/spec Markdown lint 与 `git diff --check`: passed。
- dependency/import review: no Graphviz、`dot/tred`、subprocess、新 runtime dependency 或 academic runtime copy。
- provider CLI、Draw.io Desktop、Graphviz comparison 与 visual-model execution：未执行，继续标记 `missing evidence`；deterministic structure/ELK/XML evidence 不计作视觉模型实测。

如未改 public docs，docs build 仍因 shared schema/reference 风险建议执行；无法执行必须记录原因。

## Optional Dependencies And Missing Evidence

- 新增 runtime dependency：无。
- Python/provider CLI/Desktop/Graphviz：不执行、不需要；证据为 `missing evidence`，Graphviz 同时 `defer`。
- visual model：不执行；不得把 ELK/structure tests 称为视觉实测。

## Risky Files And Rollback

- `spec.schema.json` / `validateSpec`：保持 identity 对 legacy spec 可选；可回滚 schema property 与 adapter route。
- `artifacts.js`：只保留 sanitized identity，不泄露 raw source；可回滚新增 metadata fields。
- `auto-layout.js`：原则上只消费投影后的 spec，不为本 child 新增 layout engine。
- 任一 identity contract 变更必须先更新 version/fixtures；不得在消费者 child 本地热修。

## Final Review

- [x] 全部 identity 规则与用户要求一致，默认不依赖 label。
- [x] declared/live shared factory 有 import-level test 证据。
- [x] projection schema、runtime validator 和 projector 边界一致。
- [x] adapter/projector 不布局、不生成 XML、不调用 Desktop。
- [x] JS ELK 是默认路径，Graphviz 没有成为依赖。
- [x] root gates 通过，provider/Desktop/Graphviz/model 缺失证据诚实记录。

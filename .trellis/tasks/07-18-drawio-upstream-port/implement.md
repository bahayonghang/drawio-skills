# Implement - 父任务规划与集成编排

父任务不直接实现生产代码。它拥有源需求、能力映射、子任务依赖、跨子任务验收和最终集成审查。

## Phase 1 - Planning Gate

- [x] 创建父任务和四个初始能力域任务。
- [x] 记录 37 个上游脚本、129 个测试、当前能力差距和本机 Desktop 证据。
- [x] 用户选择“功能等价整合”，不做逐脚本 CLI 兼容。
- [x] 收敛父 `prd.md` / `design.md`，纠正 IEND、Python 和 YAML-first 边界。
- [x] 用户选择完整离线 AI icon 目录；固定 309 个真实 base brand、canonical variant 规则和零 runtime network，并排除上游 suffix 解析产生的 2 个伪 family。
- [x] 创建 C2.1 `07-18-drawio-ai-icon-catalog` 并完成独立规划草案。
- [ ] 将 C1/C2/C3 能力域 bucket 拆成独立可验收 deliverable；依赖写入每个 child 的 `prd.md` / `implement.md`。
- [ ] 创建最终 integration/promotion child。

## Execution Order

```text
C0 vision-preview + structured rework
  -> canonical adapter/page foundations
      -> code/config/live import + drift
      -> raster/types/icons/C4
      -> offline transforms/runtime exports
          -> governed PR bot
              -> skill integration + Library promotion evidence
                  -> parent integration review
```

只有当前可执行 child 运行 `task.py start`。父任务和未拆分的能力域 bucket 保持 `planning`。

## Child Planning Rules

每个可执行 child 在启动前必须：

1. 有不含 `TBD` 的 `prd.md`、`design.md`、`implement.md`。
2. 写明前置 child 和消费的契约，不能只依赖树位置。
3. 从 `research/upstream-capability-audit.md` 选择自己的 upstream 项，标记 `bridge/adapt/replace/defer`。
4. 列出修改文件、focused tests、root gates、外部依赖和 `missing evidence`。
5. 遵循 `.trellis/spec/frontend/` 与 `.trellis/spec/drawio-skill/`，不引用会话记忆键作为实施规范。
6. 在 inline Phase 2 先运行 `trellis-before-dev`；jsonl seed 不作为本平台 planning gate。

## Planned Deliverables

### C0 - `07-18-drawio-vision-rework`

- vision-preview export profile
- Desktop output stabilization
- PNG inspect + conservative known-truncation repair
- structured visual review contract
- YAML-first targeted rework workflow
- base/academic routing and five-case output evidence

### C1 bucket - `07-18-drawio-dir1-import`

拆分目标：

- canonical adapter/identity foundation
- code importers
- config importers
- live snapshots + drift

### C2 bucket - `07-18-drawio-dir2-authoring`

拆分目标：

- replicate/raster canonical adapter
- `07-18-drawio-ai-icon-catalog`：已创建；固定来源、309 品牌离线资产、loader/resolver、供应链与视觉证据
- SysML/BPMN delta
- canonical multi-page C4

### C3 bucket - `07-18-drawio-dir3-postprocess`

拆分目标：

- offline XML/text transforms
- interactive/runtime exporters
- buildup/compress/timelapse
- governed PR bot

### Integration/promotion child - 待创建

- `SKILL.md` route/context pointers
- base/academic interface and eval alignment
- compatibility and optional dependency matrix
- trigger evaluation only if descriptions change
- `reports/output_quality_scorecard.md`
- package, docs, root CI and release evidence

## Cross-Task Validation

```powershell
# Focused behavior tests first
node --test <affected-test-files>

# Root behavior and policy contracts
npm test

# Closest local CI and docs gate
just ci
npm run docs:build
```

Additional gates:

- description changed: existing 26-probe trigger regression + byte/character budget.
- Desktop behavior: current-machine integration run or explicit `missing evidence`.
- Python/Graphviz path: dependency matrix plus available integration runs; skipped paths remain `missing evidence`.
- HTML outputs: injection/XSS fixtures.
- PR bot: trust, permissions, pinned supply-chain and disabled-by-default checks.
- Library output eval: at least five file-backed cases, with execution kind labeled honestly.

## Parent Integration Review

- [ ] Every upstream item has one authoritative mapping and evidence status.
- [ ] No duplicate shape index, layout engine, base runtime or overlay copy exists.
- [ ] All adapters converge on canonical spec/page bundle and stable IDs.
- [ ] C0 contract is reused by drift, raster/C4, postprocess and PR diff paths.
- [ ] Offline base works without Python, Graphviz, network, Desktop, MCP or browser.
- [ ] Optional paths fail with precise dependency messages and documented fallback.
- [ ] Interfaces, evals, docs, compatibility and package contents match shipped behavior.
- [ ] Root gates pass; unavailable external evidence remains visible.

## Rollback Points

- Feature children remain independently revertible.
- Existing final export semantics stay backward compatible; vision-preview is additive.
- Canonical single-page flow remains available while multi-page support rolls out.
- Network and PR automation remain opt-in and can be removed without affecting offline authoring.

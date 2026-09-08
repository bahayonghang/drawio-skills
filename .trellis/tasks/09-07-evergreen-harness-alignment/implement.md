# Implementation plan

## Approval gate
计划已批准。四个子任务已按一次一项 start → 完成 → archive。R5 只做父任务集成复核与证据回写，不改产品源码，不归档父任务，不 push。

## Ordered checklist
- [x] R1 / AC1：执行 test-baseline，完成同版本锁文件来源、默认与 opt-in 测试边界、安装证据。 归档 `.trellis/tasks/archive/2026-09/09-07-harness-test-baseline/`（4e33fe3 / 50d71d6）。
- [x] R2 / AC2：执行 quality-gates，移出 ci 的 version-sync，补 PR 质量作业、Windows fixture 和 LTS 验证。 归档 `.trellis/tasks/archive/2026-09/09-07-harness-quality-gates/`（a99aa01 / ff77b56）。Node 24 hosted/local ABI 仍 UNVERIFIED。
- [x] R3 / AC3：执行 rule-alignment，修正唯一规则来源及源码/安装入口，验证五工具的实际发现与模型控制。 归档 `.trellis/tasks/archive/2026-09/09-07-harness-rule-alignment/`（5ad59cc + f0fbd61 / aea4707）。Fresh session 仍 UNVERIFIED。
- [x] R4 / AC4：执行 skill-doc-evidence，同步双语说明、skill 可携带矩阵与批准项证据。 归档 `.trellis/tasks/archive/2026-09/09-07-harness-skill-doc-evidence/`（882a219 / 16b2ac8）。Desktop 视觉仍 UNVERIFIED。
- [x] R5 / AC5：强模型复核范围、子任务证据和最终 diff；未取得 runtime 证据继续标 UNVERIFIED。 见 `research/r5-integration.md` 与 `research/unverified.md`。父子 PRD/design/implement/JSONL 齐备；子任务一次一项且全部先于父任务归档；父任务在子任务活动期间未归档。
- [ ] 通过后按批准范围本地收尾；本计划不含 push、发布或全局规则修改。 只读质量门禁（`npm run ci` / trellis-check）待主会话执行，本轮不记为已通过。

## Validation
规划：各成员执行 task.py validate；父树执行 plan_precheck.py --include-descendants。
上述命令只证明规划结构，不代表实施验收。
实施：node scripts/version-sync.js --check；npm test；显式真解析器测试；
just lint；npm run docs:build；修改后的 just ci；git diff --check；
验证运行前后 tracked 文件无意外变化。
quality-gates 已把 `just ci` 改为只读 `npm run ci` 代理。父任务只读质量门禁待主会话 / trellis-check 执行，R5 不宣称该门禁已通过。

## Writeback and cost
实施结果记录问题、owning file、适用 harness、模型选择位置、检查输出与缺证据项。
具体型号/账户成本在分配时确认；低成本 worker 不负责最终审查或支持范围裁决。

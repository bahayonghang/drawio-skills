# 常青项目审查与五套 harness 对齐

## Goal
让 Claude Code、Codex、Grok Build、Kimi Code、OMP（Oh My Pi）中的维护工作获得一致的项目事实、批准边界和可复现检查。强模型负责规划与审查，低成本模型只执行确定的小项。

## Background
2026-09-07，dev，审查起点 HEAD d03304a，初始工作区干净、无活动任务。
计划已批准；四个子任务按一次一项 start → 完成 → archive，产品修复在各子任务工作提交中。父任务仍未归档（`tasks/09-07-evergreen-harness-alignment`，`status=in_progress`）。R5 为父任务集成复核，不改产品源码。
审查发现和原始运行日志位于 research/，结论入口为 research/audit-report.md；集成地图为 research/r5-integration.md。

## Requirements
- R1：可复现安装、默认离线测试、真实可选解析器验收分离；保留首次失败，不解除全局安全策略。
- R2：检查不得修复受检对象；PR 有只读质量门禁，部署继续 release-only；Windows 命令可执行。
- R3：共享项目规则及 skill 源码有唯一来源；五工具加载、权限、模型/子代理控制和实际入口差异有证据。
- R4：批准且验证的结论回写项目说明与 skill 库，注明适用工具；双语导出契约一致，静态测试不冒充 fresh-session/视觉验收。
- R5：父任务拥有源需求、子任务依赖及集成验收；用户可分项批准。低成本模型不独立做权限、安全、支持范围和最终验收判断。

## Acceptance Criteria
- [x] AC1 (R1): test-baseline 安装、缺依赖和真解析器验收均有环境、命令、退出码、日志；默认离线与 opt-in 真解析器边界不混淆。 子任务 AC1–AC3 已勾选；证据 `.trellis/tasks/archive/2026-09/09-07-harness-test-baseline/prd.md`、同目录 `research/verification-summary.md`。子任务 AC4 Node 24 仍 UNVERIFIED（同目录 `research/node24-evidence.md`、`research/unverified.md`）。
- [x] AC2 (R2): quality-gates 版本漂移负例使检查失败且不修改文件；PR/部署职责分离；Windows fixture 不触碰用户目录。 子任务 AC1/AC2/AC4 已勾选；证据 `.trellis/tasks/archive/2026-09/09-07-harness-quality-gates/prd.md`、同目录 `research/verification-summary.md`。子任务 AC3 Node 24 Windows/Linux 与当前 HEAD 的 GitHub Actions 仍 UNVERIFIED（同目录 `research/unverified.md`）。
- [x] AC3 (R3): rule-alignment 对五工具记录规则/skill/模型入口及证据等级；本机 2.5.0 旧副本和 2.8.0 源码的分叉得到解决及验证，不复制五份规则。 子任务 AC1–AC4 已勾选；证据 `.trellis/tasks/archive/2026-09/09-07-harness-rule-alignment/prd.md`、同目录 `research/verification-summary.md`。五工具 fresh session 仍 UNVERIFIED（同目录 `research/unverified.md`）。
- [x] AC4 (R4): skill-doc-evidence 同步双语说明、spec 与 skill 引用；每项批准内容可追溯至子任务、适用工具和检查证据；未执行项标 UNVERIFIED。 子任务 AC1–AC5 已勾选；证据 `.trellis/tasks/archive/2026-09/09-07-harness-skill-doc-evidence/prd.md`、同目录 `research/verification-summary.md`。Desktop 视觉仍 UNVERIFIED（同目录 `research/unverified.md`）。
- [x] AC5 (R5): 父子均有 PRD/design/implement 及真实 JSONL（concrete 路径，无 `{{placeholder}}` 模板占位）。用户批准后子任务按 test-baseline → quality-gates → rule-alignment → skill-doc-evidence 一次一项 start、完成、归档；四个子任务均已落入 `.trellis/tasks/archive/2026-09/`，且均发生在父任务归档之前。父任务在子任务活动期间保持未归档。集成地图 `research/r5-integration.md`；未执行项 `research/unverified.md`。只读质量门禁（`npm run ci` / trellis-check）待主会话执行，本轮不记为已通过。

## Task map
| 子任务 | 优先级 | 需求 | 状态 |
| --- | --- | --- | --- |
| 09-07-harness-test-baseline | P1 | R1 | archived `archive/2026-09/`；工作 4e33fe3，归档 50d71d6 |
| 09-07-harness-quality-gates | P1 | R2 | archived；工作 a99aa01，归档 ff77b56 |
| 09-07-harness-rule-alignment | P1 | R3 | archived；工作 5ad59cc + f0fbd61，归档 aea4707 |
| 09-07-harness-skill-doc-evidence | P2 | R4 | archived；工作 882a219，归档 16b2ac8 |
父任务直接拥有 R5；仍位于 `tasks/09-07-evergreen-harness-alignment`，尚未归档。

## Out of scope
不重写 CLI/DSL/renderer，不增业务功能或跨工具同步引擎。
不改用户全局配置/原生 memory，不新增付费调用，不自动推送、发布或合并，不进行桌面 UI 自动化。
其它推荐仓库和 Trellis 上游模板不在本次修复范围；发现上游问题只记录来源。

## Approval
计划已批准并按一次一项执行四个子任务；全部子任务已归档，父任务未归档。Node 24 Windows/Linux ABI、当前 HEAD 的 GitHub Actions（未 push）、五工具 fresh session、Desktop 视觉仍 UNVERIFIED，见 `research/unverified.md`。父任务只读质量门禁待主会话 / trellis-check 执行。

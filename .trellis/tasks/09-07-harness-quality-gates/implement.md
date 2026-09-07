# Implementation plan

## Approval and order
保持planning；用户批准后才激活本子任务。
依赖 test-baseline 安装与 Node24/parser 证据；不依赖 rule-alignment 的本机安装操作。先修改 quality-guidelines，后由 skill-doc-evidence 顺序补导出说明。

## Work
- [x] R1：npm run ci 是唯一只读入口，包含version-check/lint/default tests/真实parser/docs-build；just ci仅代理，version-sync保留显式修改命令。
- [x] R2：PR 与 dev/main push 有最小只读质量作业，Linux/Windows 跑默认和真实 parser 检查；部署维持 release published。
- [x] R3：Windows clean/tree 示例使用可执行且有明确范围的跨平台实现，所有删除验证仅在受控 fixture 内进行。
- [x] 强模型按PRD各AC逐项核验，保留失败及未执行记录。 AC3 Node 24 / GitHub 仍为 UNVERIFIED。
- [x] 将批准结论按适用工具回写 owning spec/说明；公共文档由父任务协调避免并行冲突。 quality-guidelines 已回写；AGENTS/README 仍交后续子任务。

## Files
package.json scripts（version:check/lint/ci，test:parsers由test-baseline提供）；justfile；新增 .github/workflows/ci.yml；.github/workflows/deploy-docs.yml（已验证Node基线、复用只读gate与job权限）；tests/workflow-contract.test.js（拟新增，限定真实不变量）；.trellis/spec/frontend/quality-guidelines.md。AGENTS/README 对应说明交给其它子任务统一写。

## Checks
- node --test tests/workflow-contract.test.js（拟新增：版本漂移不修改、workflow权限/触发、Windows fixture范围）。
- just --dry-run ci 检查依赖；在临时副本构造版本漂移并运行 just ci，检查退出码与前后hash。
- Windows/Linux执行 just lint、npm test、npm run docs:build、重构后的 just ci。
- 真实 parser gate 继承 test-baseline 的 env 与隔离Python。
- gh run view 在用户另行授权推送后的当前HEAD上验证；本地通过不称GitHub已通过。
- git diff --check；比较运行前后tracked文件。

## Cost and escalation
强模型 Codex/Claude Code 负责质量门禁、权限和跨平台复核；Grok Build 强模型可独立审查历史工作流因果。低成本 worker 可按明确模板改 justfile/CI 和补 fixture，删除范围与权限变更必须强模型复核。
范围、依赖版本或外部成本发生实质变化时报告具体变更；不将未知项自动通过。

# Design

## Contract
package.json提供version:check/lint/ci入口，ci依次运行版本检查、lint、npm test、npm run test:parsers、docs build；just对应命令只代理npm。version-sync单独保留，不进入检查依赖，不另写版本逻辑。
新增最小 GitHub 质量流程：pull_request 和 dev/main push，contents: read，Windows/Linux matrix；安装锁定依赖，调用npm run ci，不假定hosted runner有just。Python使用仓库已锁定requirements并传绝对DRAWIO_TEST_PYTHON；不引入required provider/MCP/Desktop。
部署workflow保持release-only；build job先完成与质量job相同的Node/Python及锁定依赖准备，指定DRAWIO_TEST_PYTHON，再于上传前调用同一npm run ci。顶层contents: read，仅deploy job有pages: write/id-token: write，checkout设置persist-credentials:false。不恢复PR评论，使用日志或job summary。
clean/tree采用Node script recipe，使用已有必需Node运行时，不新增Python核心维护依赖或另建清理框架；clean先确认resolve后的目标在fixture/repo范围且拒绝越界链接；测试只在临时fixture执行。tree仅枚举，不安装外部tree工具。
Node24采用 test-baseline 的真实 parser 结果后才改 CI；若失败，不能改成静默skip。

## Owning files
package.json scripts（version:check/lint/ci，test:parsers由test-baseline提供）；justfile；新增 .github/workflows/ci.yml；.github/workflows/deploy-docs.yml（已验证Node基线、复用只读gate与job权限）；tests/workflow-contract.test.js（拟新增，限定真实不变量）；.trellis/spec/frontend/quality-guidelines.md。AGENTS/README 对应说明交给其它子任务统一写。

## Harness and model routing
强模型 Codex/Claude Code 负责质量门禁、权限和跨平台复核；Grok Build 强模型可独立审查历史工作流因果。低成本 worker 可按明确模板改 justfile/CI 和补 fixture，删除范围与权限变更必须强模型复核。

## Requirements trace
- AC1 ← R1：由上述对应边界及 implement.md 检查验证。
- AC2 ← R2：由上述对应边界及 implement.md 检查验证。
- AC3 ← R2：由上述对应边界及 implement.md 检查验证。
- AC4 ← R3：由上述对应边界及 implement.md 检查验证。

## Evidence / rollback
运行必须记录环境、命令、退出码；缺证据保持UNVERIFIED。出错只回退本子任务改动，保护其它任务和用户文件。

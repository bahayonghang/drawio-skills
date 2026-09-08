# Implementation plan

## Approval and order
保持planning；用户批准后才激活本子任务。
可独立规划。tests/skill-installation.test.js须等待test-baseline写完再扩展；AGENTS检查命令在quality-gates完成后统一。公共README/安装矩阵由skill-doc-evidence集中写。

## Work
- [x] R1：根 AGENTS.md 作为共享工程事实来源，Claude入口采用薄引用，工具差异不变成五份重复规则。
- [x] R2：skills/ 是唯一产品源码；经差异审查后修复本机 .agents 2.5.0 副本与2.8.0源码分叉，保留可恢复性，不覆盖其它技能/用户定制。
- [x] R3：五工具区分静态路径、实际发现、新会话触发；模型字段与权限能力按各工具真实语义，不假定 SKILL 字段跨工具等价。平台相关Trellis命令显式选平台，避免auto默认claude。
- [x] 强模型按PRD各AC逐项核验，保留失败及未执行记录。 Fresh-session / Desktop / GitHub / Node 24 remain UNVERIFIED (`research/unverified.md`).
- [x] 将批准结论按适用工具回写 owning spec/说明；公共文档由父任务协调避免并行冲突。 AGENTS/CLAUDE updated; README/install pages left to skill-doc-evidence.

## Files
AGENTS.md；新增 CLAUDE.md；tests/skill-installation.test.js（在 test-baseline 改动后顺序扩展）；本机 .agents/skills/drawio 与 drawio-academic-skills 的安装关系（ignored，不提交）。README与公共安装指南由 skill-doc-evidence 集中写；不手改托管Trellis模板或用户全局配置。

## Checks
- 检查共享规则与所有引用文件存在；新CLAUDE薄桥接人工审查，避免固定整段文案字符串测试。
- node --test tests/skill-installation.test.js tests/skill-metadata.test.js。
- source及安装入口SKILL版本、resolved路径、CLI --help代表能力对照。
- 五CLI --version 与无推理 discovery/help（可用时）分别记录；仅保存必要信息，避免导出密钥配置。
- 新会话只读探针：报告实际AGENTS/SKILL来源、版本、2.8新能力和审批边界；不编辑、不启动UI、不执行外部写入。
- 独立Python进程设置五种TRELLIS_PLATFORM值并调用detect_platform(Path.cwd())，验证各自返回本平台。
- npm test、git diff --check；静态检查不冒充真实发现。

## Cost and escalation
Claude Code 强模型适合薄桥接/hooks优先级审查，Codex 强模型负责源码到安装入口追踪，Grok强模型做兼容语义反证。OMP可通过明确role安排低成本worker，Kimi coder可做已定的说明/fixture修改。低成本worker不得决定加载语义、权限或删除旧安装。
范围、依赖版本或外部成本发生实质变化时报告具体变更；不将未知项自动通过。

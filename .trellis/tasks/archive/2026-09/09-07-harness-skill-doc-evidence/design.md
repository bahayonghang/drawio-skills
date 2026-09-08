# Design

## Contract
唯一可携带矩阵位于base skill references/docs/harness-compatibility.md；AGENTS/README/安装页用链接与少量工具路径说明，不机械复制正文。
矩阵记录2026-09-07文档/CLI快照、skills与agent字段的不同语义、强规划/强审查/低成本执行分工、native/compat/fallback、新会话未验证。
导出口径跟随已发布SKILL与现有CLI，不修改renderer来迎合过时README。普通默认PNG300dpi，Desktop缺失SVG fallback；论文明确矢量提交时按显式PDF/SVG。
回写表以子任务为行：批准范围、适用工具、修改文件、验证命令/结果、缺证据；不把操作流水或凭据放进skill。
长期知识库可选；本计划选择项目说明与skill库完成授权回写，无需全局知识迁移。
将硬编码AskUserQuestion改为宿主可用单选提问能力；无该工具时普通文字提问。选择数适配宿主schema；已指定配色不重复询问。删除两份SKILL中的Claude工具名allowed-tools字段，使用宿主权限配置，矩阵解释历史字段差异。

## Owning files
README.md；README_CN.md；docs/guide/installation.md；docs/zh/guide/installation.md；.trellis/spec/frontend/quality-guidelines.md（quality-gates后顺序更新）；新增 skills/drawio/references/docs/harness-compatibility.md；两份 SKILL.md 仅加入按需引用；tests/visual-verification-policy.test.js、tests/skill-installation.test.js 按有意义契约扩展。；skills/drawio-academic-skills/references/docs/academic-figure-playbook.md；skills/drawio/references/workflows/create.md；tests/palette-skill-policy.test.js。

## Harness and model routing
强模型Claude/Codex审查交付语义与证据边界；低成本Codex Luna/Claude Haiku/Kimi coder/OMP smol（账户实际可用时）适合双语同步、引用修正、fixture。强模型最终确认，不把model名写成能力保证或测量过的价格结论。

## Requirements trace
- AC1 ← R1：由上述对应边界及 implement.md 检查验证。
- AC2 ← R2：由上述对应边界及 implement.md 检查验证。
- AC3 ← R3：由上述对应边界及 implement.md 检查验证。
- AC4 ← R1,R2,R3：由上述对应边界及 implement.md 检查验证。
- AC5 ← R4：由上述对应边界及 implement.md 检查验证。

## Evidence / rollback
运行必须记录环境、命令、退出码；缺证据保持UNVERIFIED。出错只回退本子任务改动，保护其它任务和用户文件。

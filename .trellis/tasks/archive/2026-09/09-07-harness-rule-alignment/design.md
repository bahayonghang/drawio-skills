# Design

## Contract
AGENTS持有共享事实，CLAUDE以 @AGENTS.md 薄引用桥接；只有当前工具实证需要时才写差异指引，不新建GROK/KIMI/OMP同义规则。
本机安装：只读比较source与旧副本，分类用户独有改动；保存必要恢复副本后，用仓库内junction/符号链接或标准安装刷新两个drawio skill。保留其它 .agents 与 Trellis skills。链接解析后必须仍落在本仓库skills/对应目录。
Fresh clone：文档提供按工具可发现路径的可复现安装步骤；测试使用临时目录，不依赖当前机器副本，不建通用manifest同步引擎。
所有工具能力分为 native、compatibility、explicit file read fallback，格式兼容不代表权限约束或model字段生效。
Grok SKILL allowed-tools/model/effort不能当作真实权限/选模；Kimi忽略Claude agent model字段，按自身Agent模型池接口；OMP按modelRoles/agent selector；Codex按TOML；Claude按agent model/permissionMode。
平台相关Trellis命令显式设置TRELLIS_PLATFORM=claude|codex|grok|kimi|omp，或使用命令提供的--platform，不改全局环境。当前auto实测返回claude；托管adapter/workflow不在本项目重写。
新会话模型调用属于单独运行成本，若本次批准未涵盖该调用，保留UNVERIFIED，不借smoke自动消费。

## Owning files
AGENTS.md；新增 CLAUDE.md；tests/skill-installation.test.js（在 test-baseline 改动后顺序扩展）；本机 .agents/skills/drawio 与 drawio-academic-skills 的安装关系（ignored，不提交）。README与公共安装指南由 skill-doc-evidence 集中写；不手改托管Trellis模板或用户全局配置。

## Harness and model routing
Claude Code 强模型适合薄桥接/hooks优先级审查，Codex 强模型负责源码到安装入口追踪，Grok强模型做兼容语义反证。OMP可通过明确role安排低成本worker，Kimi coder可做已定的说明/fixture修改。低成本worker不得决定加载语义、权限或删除旧安装。

## Requirements trace
- AC1 ← R1：由上述对应边界及 implement.md 检查验证。
- AC2 ← R2：由上述对应边界及 implement.md 检查验证。
- AC3 ← R2：由上述对应边界及 implement.md 检查验证。
- AC4 ← R3：由上述对应边界及 implement.md 检查验证。

## Evidence / rollback
运行必须记录环境、命令、退出码；缺证据保持UNVERIFIED。出错只回退本子任务改动，保护其它任务和用户文件。

# 对齐五套harness项目规则与分工

## Goal
修复规则发现和源码/本机skill入口分叉，给五工具提供同一工程事实及明确的模型与权限边界。

## Background
skills/drawio/SKILL.md:3=2.8.0；.agents/skills/drawio/SKILL.md:3=2.5.0（本机ignored）；.agents/skills/drawio/scripts/cli.js:56 仅基础格式；源码 skills/drawio/scripts/cli.js:133 已列更多导入。README.md:71 的 Codex .codex/skills 安装示例与当前官方 .agents/skills 契约不一致。缺工具专属目录不自动等于缺能力。
属于父任务 evergreen-harness-alignment；当前只规划，用户批准后实施。

## Requirements
- R1：根 AGENTS.md 作为共享工程事实来源，Claude入口采用薄引用，工具差异不变成五份重复规则。
- R2：skills/ 是唯一产品源码；经差异审查后修复本机 .agents 2.5.0 副本与2.8.0源码分叉，保留可恢复性，不覆盖其它技能/用户定制。
- R3：五工具区分静态路径、实际发现、新会话触发；模型字段与权限能力按各工具真实语义，不假定 SKILL 字段跨工具等价。平台相关Trellis命令显式选平台，避免auto默认claude。

## Acceptance Criteria
- [x] AC1 (R1): AGENTS.md 提供当前质量入口、源码/安装边界、五工具差异链接；CLAUDE.md 仅桥接共享项目说明和必要加载指引，无重复项目规则。
- [x] AC2 (R2): 批准后的本机 .agents/skills/drawio* 已指向或安装2.8.0源码；Claude junction仍指向有效当前内容；对替换前副本做差异审查并记录定制项处理；版本、路径和新CLI能力与源码一致。
- [x] AC3 (R2): 现有 skill-installation 测试在隔离目录验证同一源码安装、academic sibling依赖、代表性新CLI能力；不在GitHub CI要求存在本机ignored目录。
- [x] AC4 (R3): 五工具分别记录版本、加载的规则与skill来源、主/子代理模型控制位置、是否发生付费或外部动作；纯静态未取得新会话证据的单元保持UNVERIFIED，不能宣称五工具已端到端通过；独立进程中显式TRELLIS_PLATFORM五种值分别解析到对应平台。

## Dependencies
可独立规划。tests/skill-installation.test.js须等待test-baseline写完再扩展；AGENTS检查命令在quality-gates完成后统一。公共README/安装矩阵由skill-doc-evidence集中写。

## Out of scope
不重写生产渲染/解析架构，不增加通用同步或验证框架，不改全局配置，不自动推送/发布。

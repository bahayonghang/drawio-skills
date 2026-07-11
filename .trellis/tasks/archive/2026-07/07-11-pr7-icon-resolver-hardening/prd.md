# 加固 PR #7 图标解析与安装契约

## Goal

在保留 PR #7 的内嵌品牌与语义图标能力的同时，确保图标解析不依赖仓库根级新增包或运行时网络，不会把不存在的图标静默编译成坏链接，并恢复合并后的完整 CI。

## Background

- PR #7 已于 2026-07-11 合并，merge commit 为 `8ad6e2a`。
- PR 分支自身 `just ci` 通过，但真实安装与无效图标探针暴露两个缺陷：
  - `lucide.server-cog`、`lucide.alarm-clock` 依赖根级 `lucide-static`，只复制 `skills/drawio` 时无法解析。
  - `lobe.definitely-not-real` 被视为有效 image icon，校验零告警，但生成的 CDN URL 返回 404。
- PR 同时引入 `joinForPlatform()`；Windows 分支使用 `win32.join()`，与既有绝对路径解析语义不一致。
- `tests/drawio-academic-skill.test.js` 已在 `55a9f07` 加入 `industrial-architecture-cn-paper.yaml` 白名单；该示例同日已在本地完成，但被顶层 `examples/` ignore 规则漏提交，导致干净 checkout 的 `just ci` 失败。

## Requirements

1. 图标解析器必须保持纯本地、可复制：
   - 移除 `lucide-static` 根级依赖及运行时 `fs/path/createRequire` 查找。
   - `lobe.*`、`ai.*`、`brand.*`、`lucide.*` 的成功结果必须是内嵌 SVG data URI，不得返回 HTTP(S) URL。
   - 不扩展到解决仓库既有 `js-yaml` 依赖的整体安装策略。
2. 支持集必须显式、有限且与文档一致：
   - 保留内嵌 Lobe：OpenAI、Claude/Anthropic、Gemini 及现有兼容 alias。
   - 保留 Redis/OpenAI brand alias。
   - 保留现有内嵌 Lucide 集，并补齐文档已经承诺的 `server-cog` 与 `alarm-clock`。
   - 删除 Mistral、LangChain、Hugging Face 的 CDN fallback 声明；未来新增图标必须提交内嵌数据与测试。
3. 未知 `lobe.*` / `ai.*` / `brand.*` / `lucide.*` 必须返回 `null`，并由 `validateShapeReferences()` 产生 unknown-shape 告警，不得静默通过。
4. English/Chinese README、图标设计文档、stencil guide 与实现支持集同步，不再宣称 "full Lucide" 或运行时 CDN fallback。
5. `desktop.js` 对平台路径拼接和单值绝对化使用同一个 `resolveForPlatform(platform, ...parts)` 语义，并有 Windows 回归测试。
6. 将本地已存在且被测试白名单引用的 `industrial-architecture-cn-paper.yaml` 纳入版本跟踪，不改写其内容，也不删除白名单契约。
7. 为硬编码的 Lobe Icons 与 Lucide 路径数据保留明确的上游来源与许可证声明。

## Acceptance Criteria

- [x] `package.json` / `package-lock.json` 不再包含 `lucide-static`。
- [x] `icon-resolver.js` 不导入 `node:fs`、`node:path`、`node:module`，也不包含 `http://` / `https://` 图标 fallback。
- [x] 所有文档列出的 Lobe/brand/Lucide 图标均解析为 `image=data:image/svg+xml,...`。
- [x] `lobe.definitely-not-real`、`lucide.not-a-real-icon`、`brand.not-real` 均返回 `null`，且 shape-reference 校验产生告警。
- [x] Windows Desktop 候选路径保持绝对、规范，并覆盖显式命令、Program Files 与 LocalAppData。
- [x] Lobe Icons 与 Lucide 的许可证声明随 skill 源码分发。
- [x] `industrial-architecture-cn-paper.yaml` 成为 tracked fixture，干净 checkout 可通过 overlay 白名单测试。
- [x] targeted Node tests 通过。
- [x] `just ci` 通过，包括版本检查、Markdown lint、全部测试和 VitePress build。
- [x] 本任务不包含用户并行修改的 `.gitignore`；其新增规则继续忽略 `skills-lock.json`。

## Out Of Scope

- 扩展完整 Lucide 或完整 Lobe 图标库。
- 重新设计整个 skill 的第三方依赖安装机制。
- 发布新版本或推送本地修复到远端。

# 文档站重构设计

## Architecture And Boundaries

本任务主要改变 VitePress 内容层，并通过仓库已有版本同步脚本完成 2.6.0 minor release。`skills/` 继续拥有行为契约、工作流和深层参考；`docs/` 负责将这些内容按用户任务重新组织。站点不复制运行时代码，也不引入自动同步机制。

内容优先级：

1. 两个 `SKILL.md` 定义公开范围、默认路线、产物与质量门。
2. `references/workflows/` 与 `references/docs/` 提供操作细节和设计规则。
3. `node skills/drawio/scripts/cli.js --help`、schemas 与测试用于验证命令和行为没有被文档夸大。
4. `docs/` 将以上内容压缩、交叉链接并提供双语入口。

## Proposed Information Architecture

```text
Introduction
  Overview
  Getting Started
  Installation

Workflows
  Route Overview
  Create
  Edit and Import
  Replicate
  Academic Publication Overlay

Authoring
  Specification
  Design System
  Architecture Diagrams
  Agent and Memory Diagrams
  Icons and Stencil Search
  Themes and Style Presets
  Connectors and Edge Quality
  Math Typesetting

CLI and Delivery
  CLI Reference
  Export and Artifacts

Reference
  Optional MCP Tools
  XML Format
  SVG Converter

Examples
  Overview
  Flowchart
  Architecture
  YAML Examples
```

English 使用现有根路由；Chinese 在 `/zh/` 下保持同构。已有页面优先重写或拆责，仅在一个页面无法清楚承载当前独立契约时新增页面，避免把每个 Skills 内部 reference 机械映射成站点页面。

## Content Mapping

| Docs area | Primary sources |
|---|---|
| Overview / routing | both `SKILL.md` files |
| Create / edit / replicate | `references/workflows/{create,edit,replicate}.md` |
| CLI / export | Base `SKILL.md`, `cli.js --help`, runtime artifact and Desktop behavior |
| Specification / design system | `references/docs/design-system/`, schemas, semantic type spec |
| Icons / stencils | `stencil-library-guide.md`, design-system icons, catalog search CLI |
| Architecture / agents | `architecture-diagrams.md`, `agent-diagrams.md`, examples |
| Academic overlay | overlay `SKILL.md`, publication overlay, figure playbook, export checklist |
| API / MCP | current Base references and implementation; MCP stays optional |

## Compatibility And Migration

- 尽量保留现有页面路径，避免外部链接失效；新增能力使用新页面和导航入口。
- 拆分页面后，旧页面保留合理摘要与新页面链接，不做无提示删除。
- 不改 base path `/drawio-skills/`、locale 路由或 GitHub Pages 部署契约。
- 将 footer 和 README 当前版本更新到 2.6.0；不建设多版本文档系统。

## Version Contract

- `package.json` 是版本真源，使用 `scripts/version-sync.js --version 2.6.0` 更新脚本管理的版本面。
- Changelog 不由同步脚本管理，人工把已有 Unreleased 内容归入 2.6.0，并重新留下空 Unreleased。
- README 已有用户改动，版本更新采用单行定向修改，不回退或格式化相邻内容。
- VitePress footer 直接显示 2.6.0；版本一致性由 `just version-check` 与站点文本搜索共同验证。

## Trade-Offs

- 选择精选站点而非全量镜像：减少重复和漂移，但需要维护显式覆盖矩阵。
- 选择手工双语同构而非构建时翻译：内容更可控、构建零新增依赖，但每次公共行为变更必须同步两棵文档树。
- 保留 API/ADR 页面：兼容现有链接；通过导航层级把主任务路径放在前面，避免内部格式参考压过用户工作流。

## Risk And Rollback

- 最大风险是大范围 Markdown 重写引入死链或中英文行为不一致。按页面组逐批修改，每批运行 VitePress build，并用导航/页面集合脚本检查 parity。
- `docs/DEPLOYMENT.md` 与 README 已有用户改动，实施时使用 path-scoped diff，绝不格式化或重写这些文件。
- 若新信息架构导致 build 或链接回归，可按页面组回退新增导航项和对应页面，不影响 Skills/runtime。

# 按当前 Skills 契约重构双语文档站

## Goal

以当前 `skills/drawio` Base Skill 与 `skills/drawio-academic-skills` Academic Overlay 为内容真源，重构 `docs/` 的信息架构、导航和中英文用户文档，并将完成后的仓库从 2.5.0 提升到 2.6.0，使站点能准确解释当前的任务路由、离线 YAML-first 工作流、search-first stencil 选择、默认导出策略、设计系统与出版级 overlay，而不是继续以旧版本页面结构零散承载新能力。

## Background

- Base Skill 当前版本为 2.5.0，并把 create/edit/replicate/import/export、Mermaid/CSV、架构与 Agent 图、样式预设、主题和非出版公式图统一路由在 `skills/drawio/SKILL.md:1-26`。
- 当前 VitePress footer 仍写着 `v2.2.0`（`docs/.vitepress/config.ts:137`），与 Skills 契约漂移。
- `skills/drawio/SKILL.md:97` 已要求云厂商、Kubernetes、Cisco 和 `mxgraph.*` 图标先运行离线 `search`，但站点没有独立、可发现的 catalog/search 文档入口。
- Base Skill 已将默认可视交付物改为 Desktop 生成的 300 DPI PNG，Desktop 不可用时回退 SVG（`skills/drawio/SKILL.md:53-54,84-85,139-154`）；Academic Overlay 同样以 `.drawio + 300dpi .png` 为默认并对期刊矢量提交另作要求（`skills/drawio-academic-skills/SKILL.md:57-68,156-177`）。现有部分导出页已经更新，但站点首页、导航和其他流程页仍未形成一致契约。
- Skills 参考树已有独立的 architecture diagrams、agent diagrams、stencil library、style presets、edge quality、design-system 子文档，以及 academic figure playbook、publication overlay、academic export checklist；当前 `docs/` 只在少量总览页面中提及其中部分能力。
- `.trellis/spec/frontend/quality-guidelines.md` 要求公开行为同时考虑 English 与 `docs/zh/`，并要求文档变更至少通过 Markdown lint、VitePress build，跨 Skills/Docs 契约时运行 `just ci`。
- 工作区已有用户未提交改动：`.github/WORKFLOWS.md`、删除 `.github/workflows/build-docs-pr.yml`、`README.md`、`docs/DEPLOYMENT.md`。部署相关改动不纳入本任务；`README.md` 只允许在保留现有 badge 删除的前提下更新其过期版本文本。

## Requirements

### R1 内容真源与覆盖矩阵

- 建立 Skills-to-Docs 覆盖矩阵，优先级为：`SKILL.md` 公共契约 -> 被其路由的 workflow/reference -> 实际 CLI help 与测试。
- 不把 Skills 内部参考文件逐字复制到站点；按用户任务重新组织并保留指向真源的明确对应关系。
- 发现 Skills 文案与实际 CLI/测试冲突时先记录并以可执行行为校验，不在文档中扩大未经验证的能力。

### R2 信息架构与导航

- 重构 `docs/.vitepress/config.ts` 的英文与中文导航，使 Base Skill、Academic Overlay、核心工作流、Authoring/Design System、CLI/Export、Reference、Examples 都可直接发现。
- 首页与 Getting Started 清楚区分通用 Base Skill 和论文、学位论文、IEEE/ACM、camera-ready 等出版场景的 Academic Overlay。
- 将站点显示版本同步到本次发布的 2.6.0，清除公开站点中的旧 `v2.2.0` 标识。

### R3 Base Skill 工作流

- 文档完整覆盖 create、edit/import、replicate 三条主路线及自动路由边界。
- 新增或重构 search-first stencil/catalog 指南，覆盖 `search <query>`、`--prefix`、`--limit`、`--json`、未知 covered stencil 默认拒绝与 `--allow-unknown-shapes` 临时逃生门。
- CLI 文档与实际命令面一致，覆盖 YAML、Mermaid、CSV、drawio 输入、验证、strict、Desktop export、sidecars 和 canonical spec export。
- 输出策略统一为：最终目录默认保留 `.drawio` 与 300 DPI `.png`；Desktop 不可用时报告 SVG fallback；`.spec.yaml`/`.arch.json` 默认进入显式 work/sidecar 目录；矢量或其他格式按请求生成。

### R4 Authoring 与图表类型

- 让 Specification、Design System、Themes/Style Presets、Icons/Stencils、Connectors/Edge Quality、Math 等内容成为清晰的渐进式参考层，而不是堆在单页总览中。
- 为 architecture diagrams 与 agent/memory/timeline 等当前 Skills 能力提供可发现的用户入口，并引用真实 YAML/CLI 示例。
- 示例应复用 `skills/drawio/references/examples/` 与当前 schemas/themes/styles；不复制会漂移的伪实现或无效 shape 名称。

### R5 Academic Overlay

- 建立独立的 Academic Overlay 文档入口，说明 sibling `../drawio` 依赖、Base/Overlay 边界、academic preflight、source understanding、diagram plan gate、可选外部 image preview 的隐私确认、学术默认样式、出版导出与质量门。
- 复杂论文图或参考图重绘才默认考虑 image preview；简单清晰图直接走 YAML/SVG；最终权威产物仍是可编辑 Draw.io 与导出文件，不能把生成的 raster preview 当最终图。
- 期刊/IEEE 矢量交付要求与默认 300 DPI PNG 预览明确区分。

### R6 双语一致性与内容质量

- 英文页面与 `docs/zh/` 保持相同的信息架构、导航覆盖和行为契约；中文页面使用自然中文，不保留未解释的旧术语堆叠。
- 修复重构涉及的失效内部链接、重复页面职责、过期命令、过期版本与相互矛盾的产物描述。
- 保留仍有效的 ADR、optional MCP、XML/SVG API 和 examples；MCP 始终标为 Base Skill 的可选 live refinement，不得写成默认或 Academic 依赖。

### R7 2.6.0 Minor Version Release

- 使用仓库自带 `scripts/version-sync.js --version 2.6.0` 同步 `package.json`、`package-lock.json` 根包版本、两个 `SKILL.md` frontmatter 和 `skills/drawio/evals/evals.json`，不得批量替换 lockfile 中第三方依赖的 `2.5.0`。
- 将 Base 与 Academic changelog 的当前 `Unreleased` 内容归档到 `2.6.0 (2026-07-14)`，保留新的空 `Unreleased` 区段。
- 将 VitePress footer 和 `README.md` 的公开当前版本更新为 2.6.0；保留 `README.md` 中本任务开始前的 badge 删除。
- 运行 `just version-check` 证明所有脚本管理的版本面一致。

## Acceptance Criteria

- [x] `docs/.vitepress/config.ts` 中 English 与 `/zh/` 导航同构，所有导航目标存在且 VitePress 构建无 dead link。
- [x] 公开站点不再出现 `v2.2.0`，显示版本与两个 Skills 的 2.6.0 一致。
- [x] Base Skill 的 Scope、Runtime Stack、Task Routing、Default Rules、Create/Edit/Replicate、Desktop Export、Style Presets、Validation、Completion Report 均有明确站点落点。
- [x] Academic Overlay 的 Boundary、Preflight、Source Understanding、Plan Gate、Optional Image Preview、Defaults、Flows、Export、Quality Gate 均有明确站点落点。
- [x] CLI 页面包含实际 `--help` 暴露的输入格式、search 子命令、validation/strict、unknown-shape escape hatch、sidecar 与 Desktop export 行为；示例命令可直接从仓库根目录运行。
- [x] search-first、默认 300 DPI PNG、Desktop 缺失 SVG fallback、最终产物与 work-dir sidecar 分离在所有相关页面中表述一致。
- [x] architecture、agent/memory、stencil/icon、theme/style preset、edge quality、math、academic publication 均可从导航在两次点击内到达。
- [x] English 与 Chinese 对应页面无公共行为遗漏；新增页面成对出现，或有书面理由说明仅单语适用。
- [x] `package.json`、lockfile 根包、两个 Skills 和 Base evals 均为 2.6.0，两个 changelog 含 `2.6.0 (2026-07-14)`，`just version-check` 通过。
- [x] 不修改本任务开始前已有改动的 `.github/WORKFLOWS.md`、`.github/workflows/build-docs-pr.yml`、`docs/DEPLOYMENT.md`；`README.md` 仅叠加版本文本更新并保留用户 badge 删除。
- [x] `just lint`、`npm run docs:build`、相关文档策略测试与最终 `just ci` 通过；`git diff --check` 通过。

## Out Of Scope

- 修改 CLI、DSL、schemas、themes、styles 或 Skills 行为来新增功能；Skills frontmatter 的 2.6.0 版本同步除外。
- 重写 Skills 参考树；本任务消费其当前契约，不反向大改真源。
- 修改 GitHub Actions、发布触发器或 `docs/DEPLOYMENT.md`；`README.md` 只做当前版本同步。
- 引入文档生成器、内容同步框架、搜索服务或新的运行时依赖。
- 重新设计 VitePress 主题视觉样式；仅做支撑新信息架构所需的配置和内容调整。

## Open Questions

无阻塞问题。默认采用“面向用户任务的精选站点 + Skills 参考树作为深层真源”，而不是把 `skills/**/references/docs/` 全量镜像进 VitePress。

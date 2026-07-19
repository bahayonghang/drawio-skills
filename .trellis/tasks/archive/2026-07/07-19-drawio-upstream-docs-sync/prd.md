# 同步上游整合能力到 docs 与中英 README

## Goal

以当前 `skills/drawio` Base Skill（2.7.0）的 SKILL.md 任务路由与 `references/docs/*` 参考文档为内容真源，把 **2.7.0 发布（commit `bb05245`）之后落地、但公开文档尚未覆盖的一批"上游整合"离线能力**同步到 VitePress 文档站（新增专题页 + 更新现有页与导航）、中英文根 README，并补齐 `CHANGELOG.md` 的版本条目。完成后，文档站与 README 能准确解释配置/代码导入器、运行态快照与架构漂移、离线 AI 图标目录、多页 canonical bundle、postprocess 套件与 raster 提取适配器，而不是只在 `docs/guide/cli.md` 里以 18 行占位段落零散提及。

## Background

- Base Skill `skills/drawio/SKILL.md`（version 2.7.0）已在任务路由表中固化新路由：`config-import`、`live-drift`、`code-import`、`multi-page`、`raster-replicate`、`postprocess`，并指向 skill 侧参考文档（`references/docs/config-importers.md`、`code-importers.md`、`live-snapshots-drift.md`、`canonical-graph-projection.md`、`upstream-capability-compatibility.md`）。这些是本任务的**内容真源**。
- 自 `bb05245`（2.7.0，theme×palette）以来，仓库合入了一大批 feat 提交（`97d3c81` 规范投影基础、`6afac39/e53d46e/21d01b7/484b7a4` 配置/代码/快照/漂移适配器、`2e12c90/0eab7b7` AI 图标目录与解析、`8fb4889/8e82eec/14c78f3` 多页 DSL/往返/CLI、`c0edb70/05ff82c/1def151` postprocess 投影/HTML/CLI、`0b6a379` raster 适配器、`669c415` SysML/BPMN stencil、`978bab1` 上游整合入口推广）。
- 公开文档只在 `978bab1` 给 `docs/guide/cli.md`（中英）补了 18 行 "Upstream Capability Promotion" 段落。`README.md`、`README_CN.md` 自 2.7.0 起未更新其 Features/Documentation；`CHANGELOG.md` 仍停在描述 2.2.0/0.1.0 base 拆分的状态，与 `package.json` 的 `2.7.0` 漂移。
- `docs/.vitepress/config.ts` footer 仍写 `v2.6.0`（应为 2.7.0），侧边栏与顶部导航没有任何导入器/漂移/多页/postprocess 入口。
- 存在同类先例 `.trellis/tasks/archive/2026-07/07-14-docs-skill-sync-refactor`（同为重构双语文档 + 版本对齐），其 `prd.md/design.md/implement.md` 结构与验收方式可作参照。
- 项目 spec 约束（`.trellis/spec/frontend/quality-guidelines.md`）：公开行为需同时覆盖英文与 `docs/zh/`；文档变更至少通过 Markdown lint 与 VitePress build；跨 Skills/Docs 契约时跑 `just ci`。

## Requirements

### R1 内容真源与不越权

- 所有新增/更新的用户文档，其能力描述必须与 `skills/drawio/SKILL.md` 及 `skills/drawio/references/docs/*` 一致；不得发明命令、输入格式或未发布的能力。
- 保持 skill 侧参考文档中的**证据边界**表述：deterministic/离线路径为已执行证据；Desktop、Graphviz、真实 provider/cluster/daemon、视觉模型、浏览器/MCP、PR 自动化等仍是 "missing evidence"，公开文档不得夸大为已支持。
- 明确 postprocess 只出货 `mermaid`、`explain`、`relabel`、`restyle`、`heatmap`、`html` 六个操作；runbook/animated SVG/tube/sequence/compress/buildup/PPTX/timelapse/PR diff 是"deferred，不是隐藏命令"。

### R2 新增专题页（中英对称）

在 `docs/guide/`（英文）与 `docs/zh/guide/`（中文）新增以下专题页，并在 `docs/api/` + `docs/zh/api/` 新增能力映射页：

1. Config & IaC Importers（`config-importers.md`）——Terraform / Kubernetes / Compose / SQL DDL / OpenAPI / GitHub Actions / GitLab CI，含各自 `--input-format`、稳定身份规则、可选 Python(HCL/SQL) parser 边界。
2. Code Relationship Importers（`code-importers.md`）——Python(imports/classes) / JS-TS / Go / Rust，含目录扫描边界（500 文件、1MiB/文件、4MiB 上限）、可选 parser 依赖与未解析限制。
3. Live Snapshots & Drift（`live-drift.md`）——Terraform state/plan、Docker inspect、Kubernetes live JSON 三种快照适配器 + 架构漂移比较/渲染，强调"仅处理用户显式选择的 JSON、不做 provider 捕获"。
4. Multi-page Canonical Bundles（`multi-page.md`）——bundle v1、稳定 page/object 身份、结构化链接、`--all-pages --export-spec` 往返。
5. Postprocess Suite（`postprocess.md`）——六个操作、无脚本自包含 HTML 查看器、`--page`/`--all-pages` 用法与保真/身份保留约束。
6. Upstream Capability Map（`upstream-capability-map.md`，Reference 组）——把 skill 侧 37 行兼容矩阵引入公开站（精炼摘要 + bridge/adapt/replace/defer 语义 + 指向 skill 权威文档）。

### R3 更新现有页与导航

- `docs/guide/cli.md`（中英）：把现有 "Upstream Capability Promotion" 占位段扩成正式内容——在 Inputs/Options 表补齐新 `--input-format`（terraform/kubernetes/compose/sql/openapi/github-actions/gitlab-ci/python-imports/python-classes/js-imports/go-imports/rust-imports/raster-extraction）、`--all-pages`/`--export-spec`、`postprocess` 子命令，并链接 R2 专题页。
- `docs/guide/workflows.md`（中英）：在路线概览加入新路由。
- `docs/guide/getting-started.md`（中英）：简述新导入/漂移/postprocess 能力并链接。
- `docs/guide/icons-stencils.md`（中英）：补离线 AI 图标目录（309 个授权离线 SVG 品牌 + icon-resolver）与 SysML/BPMN stencil 扩展。
- `docs/guide/scientific-workflows.md`（中英，replicate 页）：补 `--input-format raster-extraction` 结构化提取输入。
- `docs/index.md` 与 `docs/zh/index.md`：新增一张覆盖"离线导入器/适配器"的 feature 卡片，并在 quick-start 或正文点到新能力。
- `docs/.vitepress/config.ts`：中英 nav/sidebar 新增入口（专题页 + Reference 映射页），并把 footer `v2.6.0` 修正为 `v2.7.0`。

### R4 中英文根 README

- `README.md` 与 `README_CN.md` 的 Features 段补齐：离线配置/代码导入器、运行态快照 + 架构漂移、多页 bundle、postprocess 套件、离线 AI 图标目录。
- 新增或扩展一个能力段（如 "Offline Importers & Adapters" / 「离线导入器与适配器」），概述六路由与证据边界，并链接文档站对应页。
- Documentation 段补上新页链接。
- 保持中英对称；不改动现有 badge、许可、安装与 MCP 配置内容；README 现为 2.7.0，保持不变。

### R5 CHANGELOG 版本条目（仅根 `CHANGELOG.md`）

- **目标仅根 `CHANGELOG.md`**：仓库有三个 CHANGELOG——根 `CHANGELOG.md`（停留在 2.2.0/0.1.0 描述，无测试耦合，本任务重建对象）、`skills/drawio/CHANGELOG.md`（权威、在维护、已有 2.4.0→2.7.0，被 `tests/palette-skill-policy.test.js:63-64` pin 住 `## 2.7.0 (2026-07-14)`）、`skills/drawio-academic-skills/CHANGELOG.md`（同被 pin）。**本任务不改后两个 skill 侧 CHANGELOG**（守 Non-Goals，避免测试门）。
- 保持 Keep a Changelog + 日期条目格式，重建根 CHANGELOG 为 repo 级汇总。
- 补齐 2.3.0→2.7.0 的里程碑条目（字体/填充、stencil 目录 v2 与 search、open 箭头与 300dpi PNG 默认、双语文档重构、theme×palette + arch-dark + agentic 等），来源为 git 历史与 `skills/drawio/CHANGELOG.md`。
- 为 2.7.0 之后本批上游整合能力新增一个 `[Unreleased]` 段（配置/代码导入器、快照+漂移、AI 图标目录、多页 bundle、postprocess、raster、SysML/BPMN），并注明 per-skill 明细以 skill 侧 CHANGELOG 为权威。
- 与 `package.json` 的 `2.7.0` 对齐；**本任务不做 package 版本号提升**（不改 `package.json`/`SKILL.md` 版本）。
- **已知遗留（仅记录、不在本任务处理）**：权威的 `skills/drawio/CHANGELOG.md` Unreleased 目前也未收录上游整合批；若需一并补入，另开任务（涉及 skill 侧 + 需跑 root `npm test`）。

## Non-Goals

- 不改 skill 侧源码、参考文档或 CLI 行为（只消费其为真源）。
- 不做 package/SKILL 版本号提升，不改部署工作流（`.github/`、`docs/DEPLOYMENT.md`）。
- 不新增示例 `.drawio`/图片资产（如需示例，引用 skill 侧已有 fixtures 的路径描述即可）。
- 不把 deferred（未出货）能力写成"已支持"。

## Acceptance Criteria

1. R2 六个专题页在 `docs/guide|api/` 与 `docs/zh/guide|api/` 均存在且内容对称，能力描述与 skill 真源一致、保留证据边界表述。
2. `docs/.vitepress/config.ts` 中英 sidebar/nav 均能导航到全部新页，无死链；footer 显示 `v2.7.0`。
3. R3 所列现有页均已更新且中英对称；`cli.md` 覆盖全部新 `--input-format`、多页 flag 与 `postprocess` 子命令。
4. `README.md` 与 `README_CN.md` 的 Features/能力段/Documentation 段均已同步且对称。
5. `CHANGELOG.md` 含 2.3.0→2.7.0 里程碑与本批上游整合的 `[Unreleased]` 段，与 `package.json 2.7.0` 对齐。
6. `npx markdownlint` / `npm run docs:build`（或 `just ci`）通过；无新增 lint 失败与断链。

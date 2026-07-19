# 补录上游整合批到 skill 侧 base CHANGELOG

## Goal

把 2.7.0 之后落地的"上游整合"离线能力批补入权威的 `skills/drawio/CHANGELOG.md` 的 `## Unreleased` 段，使 skill 侧变更记录与已合入的源码一致。根 `CHANGELOG.md` 已在 `07-19-drawio-upstream-docs-sync`（commit `6373ce7`）里以 repo 级摘要覆盖了这批能力；本任务补齐 skill 侧的权威 per-skill 明细。

## Background

- `07-19-drawio-upstream-docs-sync` 已同步 docs 站、中英 README 与根 `CHANGELOG.md`，但**刻意未改** skill 侧 CHANGELOG（守 Non-Goals 与测试门）。
- `skills/drawio/CHANGELOG.md` 是权威、在维护的 per-skill 变更记录（现有 `## Unreleased` 覆盖 07-16 审计 W1–W6 的 packaging/slim 工作，但**未收录**本批上游整合能力）。
- 内容真源：`skills/drawio/references/docs/{config-importers,code-importers,live-snapshots-drift,canonical-graph-projection,upstream-capability-compatibility}.md` 与 `.trellis/spec/drawio-skill/{config-importers,code-importers,multi-page-foundation,postprocess,raster-replicate-adapter,sysml-bpmn,canonical-adapter-identity}.md`。
- 涉及提交（git 归纳）：`97d3c81`（规范投影基础）、`6afac39/e53d46e/21d01b7/484b7a4`（配置/代码/快照/漂移适配器）、`2e12c90/0eab7b7/196566a`（AI 图标目录/解析/Desktop 用例）、`8fb4889/8e82eec/14c78f3`（多页 DSL/往返/CLI）、`c0edb70/05ff82c/1def151`（postprocess 投影/HTML/CLI）、`0b6a379`（raster 适配器）、`669c415`（SysML/BPMN stencil）、`978bab1`（上游整合入口推广）。

## Constraints（硬约束）

- **测试门**：`tests/palette-skill-policy.test.js:63-64` 断言 `skills/drawio/CHANGELOG.md` 与 `skills/drawio-academic-skills/CHANGELOG.md` 均含 `## 2.7.0 (2026-07-14)` 且其后 500 字符内出现 `palette`。**不得扰动 `## 2.7.0` 段**：新条目一律加在 `## Unreleased` 段内（位于 2.7.0 之上），不改 2.7.0 段文本与结构。
- **真源一致 / 不越权**：保留证据边界（离线/deterministic = command-executed；Desktop/Graphviz/真实 provider/cluster/daemon/视觉模型/browser/MCP/PR 自动化 = missing evidence）；postprocess 只出货六操作（mermaid/explain/relabel/restyle/heatmap/html），deferred≠隐藏命令；SysML/BPMN 源行数≠能力数，嵌套构造 deferred。
- **范围**：只改 `skills/drawio/CHANGELOG.md`；不改源码、参考文档、SKILL.md、package.json。学术 overlay CHANGELOG（`skills/drawio-academic-skills/CHANGELOG.md`）除非确有 overlay-facing 变更，否则不动（本批为 base-only 能力，预计不动）。
- **不做版本提升**：保持 `package.json` / SKILL.md 的 2.7.0；本批以 `## Unreleased` 记录，如实标注"已合入、未打 tag"。

## Requirements

1. 在 `skills/drawio/CHANGELOG.md` 的 `## Unreleased` 段新增一个清晰子标题（如 `### Upstream capability integration`），列出：配置/IaC 导入器、代码关系导入器、运行态快照 + 架构漂移、离线 AI 图标目录（309 授权离线品牌）、多页 canonical bundle v1、postprocess 六操作套件、raster 提取适配器、SysML/BPMN stencil 扩展。
2. 措辞与既有 CHANGELOG 风格一致（Keep a Changelog、命令/标识用反引号、每条一句要点），并保留证据边界表述。
3. 确认 `skills/drawio-academic-skills/CHANGELOG.md` 无需改动（若确需，仅在不扰动其 `## 2.7.0` 段前提下补一句 overlay-facing 说明）。

## Non-Goals

- 不改根 `CHANGELOG.md`（已在上游 docs-sync 任务完成）。
- 不改源码/参考/SKILL/package.json。
- 不做 tag/release 发布动作。

## Acceptance Criteria

1. `skills/drawio/CHANGELOG.md` 的 `## Unreleased` 段完整覆盖本批八类能力，措辞与证据边界正确；`## 2.7.0 (2026-07-14)` 段文本与结构未改动。
2. `npx markdownlint skills/drawio/CHANGELOG.md` 通过。
3. `npm test` 全绿（尤其 `tests/palette-skill-policy.test.js` 与 `tests/skill-metadata.test.js` 不回归）；如触及更广契约则 `just ci` 通过。
4. `git diff --stat` 仅显示 `skills/drawio/CHANGELOG.md`（及若确需的 academic CHANGELOG），无其他文件外溢。

# 设计：上游整合能力文档同步

## 内容真源映射（source-of-truth → 公开页）

| 公开页（新建/更新） | 内容真源 | 覆盖能力 |
| --- | --- | --- |
| `guide/config-importers.md`（新建） | `skills/drawio/references/docs/config-importers.md` + `canonical-graph-projection.md` | terraform / kubernetes / compose / sql / openapi / github-actions / gitlab-ci `--input-format` + 稳定身份 + 可选 Python parser |
| `guide/code-importers.md`（新建） | `references/docs/code-importers.md` | python-imports/-classes、js-imports、go-imports、rust-imports + 扫描边界 + parser 依赖 |
| `guide/live-drift.md`（新建） | `references/docs/live-snapshots-drift.md` | terraform state/plan、docker inspect、k8s live JSON + 漂移比较/渲染 |
| `guide/multi-page.md`（新建） | `references/docs/upstream-capability-compatibility.md`（c4/多页行）+ SKILL `multi-page` 路由 + cli 段 | bundle v1、page/object 身份、`--all-pages --export-spec` |
| `guide/postprocess.md`（新建） | `upstream-capability-compatibility.md`（postprocess 行）+ cli 段 | mermaid/explain/relabel/restyle/heatmap/html 六操作 |
| `api/upstream-capability-map.md`（新建） | `references/docs/upstream-capability-compatibility.md` 全表 | 37 脚本 bridge/adapt/replace/defer 摘要 |
| `guide/cli.md`（更新） | SKILL create/edit 段 + cli 现状 | 新 input-format、多页 flag、postprocess 子命令 |
| `guide/icons-stencils.md`（更新） | `upstream-capability-compatibility.md`（aiicons 行）+ `stencil-library-guide.md` | 309 离线 AI 图标 + SysML/BPMN |
| `guide/scientific-workflows.md`（更新） | `upstream-capability-compatibility.md`（raster2drawio 行） | `--input-format raster-extraction` |
| `guide/workflows.md` / `getting-started.md`（更新） | SKILL 路由表 | 新路由概览 + 链接 |
| `index.md`（更新） | 以上汇总 | 一张 feature 卡片 |
| `README.md` / `README_CN.md`（更新） | 以上汇总 | Features + 能力段 + Documentation 链接 |
| `CHANGELOG.md`（更新） | git 历史 | 2.3.0→2.7.0 + `[Unreleased]` 上游整合 |

## 信息架构（VitePress 导航）

在 `docs/.vitepress/config.ts` 的中英 sidebar 中，于 "Workflows / 工作流" 与 "Authoring / 图表编写" 之间新增一个组：

- 组名 EN `Import & Integrate` / ZH `导入与集成`：
  - Config & IaC Importers → `/guide/config-importers`
  - Code Relationship Importers → `/guide/code-importers`
  - Live Snapshots & Drift → `/guide/live-drift`
  - Multi-page Bundles → `/guide/multi-page`
  - Postprocess → `/guide/postprocess`
- "Reference / 参考" 组新增：Upstream Capability Map → `/api/upstream-capability-map`
- 顶部 nav 新增一项 EN `Import` / ZH `导入` → `/guide/config-importers`（其余 nav 保持）。
- 中文侧使用 `/zh/...` 前缀镜像同一结构。
- footer message `v2.6.0` → `v2.7.0`。

死链约束：新增 sidebar 条目必须与实际新建的 `.md` 文件一一对应；`raster-extraction` 不单独建页（并入 scientific-workflows），因此不在 sidebar 单列。

## 页面模板（每个新专题页统一骨架）

1. H1 + 一段"这是什么/离线边界"引子（对齐 skill 真源首段）。
2. `## CLI` 或 `## Usage`：可复制命令块，命令前缀统一 `node skills/drawio/scripts/cli.js ...`（与仓库根一致，非 skill 内相对路径）。
3. `## Stable Identity` / `## 稳定身份`：各输入的身份规则要点（表或列表）。
4. `## Evidence & Limits` / `## 证据与边界`：明确 command-evidence vs missing-evidence，deferred 说明。
5. `## Related` / `## 相关`：链接 cli、canonical-graph-projection（如相关）、SKILL 路由、其他专题页。

命令前缀说明：skill 真源里用 `node scripts/cli.js`（skill 内相对）；公开文档统一改成 `node skills/drawio/scripts/cli.js`（仓库根相对），与现有 `docs/guide/cli.md`、`docs/index.md` 既有写法一致。

## 中英对称策略

- 先写英文页 → 再写中文镜像页，逐段对应，保留代码块与命令原样、仅翻译散文与表头。
- 术语固定：importer=导入器、adapter=适配器、drift=漂移、snapshot=快照、canonical projection=规范投影、bundle=（多页）包、postprocess=后处理、evidence boundary=证据边界、deferred=延后/未出货。
- 中英同一组标题层级、同一 anchor 结构，便于交叉链接与 lint。

## 版本策略

- 不改 `package.json`（保持 2.7.0）与两个 SKILL.md version。
- VitePress footer 修正为 `v2.7.0`（现 2.6.0 为遗留 bug）。
- CHANGELOG：2.7.0 及以前用日期化版本段；本批上游整合（`bb05245` 之后、未打 tag）归入 `[Unreleased]`，如实标注"已合入、未发布"。

## CHANGELOG 目标与测试门

- 三个 CHANGELOG：根 `CHANGELOG.md`（重建对象，无测试读取）、`skills/drawio/CHANGELOG.md`（权威，已有 2.4.0→2.7.0，**被 `tests/palette-skill-policy.test.js:63-64` 断言 `## 2.7.0 (2026-07-14)` 段近 palette**）、`skills/drawio-academic-skills/CHANGELOG.md`（同被断言）。
- 本任务**只改根 `CHANGELOG.md`**；不触 skill 侧两个 CHANGELOG，测试门自然不受影响。
- 记忆提示：改 skill 侧措辞会触发 root `tests/` 契约断言；本任务因不动 skill 侧，理论上 docs-only 不触发，但收尾仍跑一次 root 测试/`just ci` 兜底。

## 根 CHANGELOG 重建来源（git 里程碑 → 版本段）

- 2.3.0：`55a9f07/c097a6d` 统一中西文字体 + 填充式字号系统。
- 2.4.0：`374d270/8b8435b/60e039c/32f6583` stencil 目录 v2、共享 icon 映射、离线 search、未知 stencil 拒绝闭环。
- 2.5.0：`1995193/13c52b5/5eab366` open 箭头默认、300dpi PNG 默认。
- 2.6.0：`3de2852` 双语文档重构。
- 2.7.0：`8ebaa56/be8be47/a8c62ea/db228cf/bb05245` arch-dark、agentic 节点、AI/Agent 图类型、fireworks 主题、theme×palette 15 组。
- `[Unreleased]`：`97d3c81`…`978bab1` 上游整合批（本任务文档化的能力）。

（版本号为对历史提交的归纳汇总，非精确 tag 重放；如与既有 tag 冲突以既有为准。）

## 风险与规避

- **越权夸大能力**：严格照 skill 真源，逐条保留 evidence boundary，postprocess 六操作封闭集显式声明。
- **中英漂移**：逐页成对提交，收尾用 grep 对照两侧 H2 数量与新页存在性。
- **死链 / build 失败**：新增 sidebar 前先建文件；收尾跑 `npm run docs:build`。
- **prettier/markdownlint 冲突**：遵循 `.markdownlint.json` 与 `.prettierrc`（markdown override 保留散文与 frontmatter 引号）；改 `config.ts` 时保持既有单引号/无分号风格。
- **改动外溢**：只动 R2/R3/R4/R5 列出的文件；不顺手重排无关页。

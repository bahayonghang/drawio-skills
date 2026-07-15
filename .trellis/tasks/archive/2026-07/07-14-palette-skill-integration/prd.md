# Palette skill integration: interaction, docs, interfaces, evals, release

> 父任务：`.trellis/tasks/07-14-palette-system`。**依赖：`07-14-palette-core` 与 `07-14-palette-catalog` 均完成**——交互与文档要引用全部 15 组及其安全标志。

## Goal

把 palette 能力接入两个 skill 的使用面：AskUserQuestion 选择规则（含 replicate 例外）、venue 映射、文档、agents 接口、evals 与版本发布。

## Requirements

1. **交互规则（父 design §9）**：
   - 学术 overlay preflight：venue 确定后未明说配色 → AskUserQuestion 单选，venue 映射（父 prd R5 表）推荐置顶标 "(Recommended)"；已明说则直接映射不问。
   - base：仅配色/色盲/黑白打印/多类别关键词且未指定时问；否则不问不设 `meta.palette`。
   - **replicate 例外**：默认保留源 palette（base SKILL.md 规则 8），不进入选择；仅用户明确要求归一化时问。
   - 完成报告注明所用 palette 及安全标志。
2. **文档**：base `color-guide.md`（决策树加 palette 维度）、`themes.md`（theme × palette 关系）、`specification.md`（meta.palette + `$paletteN` token）、base SKILL.md；overlay `academic-figure-playbook.md`（venue 映射表 + preflight 问法）、`publication-overlay.md`（色彩政策改为 palette 选择 + print gate 联动）、overlay SKILL.md（checklist 与 gate 呼应）。
3. **发布面（无条件，不以 description 改动为前提）**：
   - `skills/drawio/agents/interface.yaml`、`skills/drawio-academic-skills/agents/interface.yaml`、`skills/drawio-academic-skills/agents/openai.yaml` 同步 palette 能力描述；
   - 两侧 evals 新增 palette 触发/输出用例（选择交互、replicate 例外、print gate 降级提示）；
   - 两个 SKILL.md version 2.6.0 → 2.7.0、CHANGELOG × 2、root `package.json`/`package-lock.json`/README 版本同步。
4. **description 门槛（仅当改动 description）**：合计 ≤800 字符；跑 07-09-skill-desc-slim 26 条探针（4 组互斥对；Windows 用分类探针 workaround）。

## Acceptance Criteria

- [ ] 两个 SKILL.md/playbook 含完整交互契约；replicate 路由默认不问有明文。
- [ ] venue→配色映射表落在 `academic-figure-playbook.md`，与父 prd R5 一致。
- [ ] interface.yaml × 2、openai.yaml、evals 用例、版本号、CHANGELOG 全部同步（对照清单逐项勾验）。
- [ ] trigger 探针全过（若 description 改动）；root `npm test` / `just ci` 全绿（策略契约断言会咬文档措辞）。
- [ ] 抽样端到端演练：一次学术 create（venue=IEEE 印刷 → 默认 ieee-bw）、一次 replicate（不触发选择）留证于任务目录。

## 约束

- 文档措辞受 root tests/ 策略契约约束，逐条修绿；不得只跑 per-skill node --test。
- 不改 core/catalog 的代码与数据；发现缺口回父任务修订。

# Implement — Palette System（父任务：任务图 + 集成收尾）

> v2：吸收 Codex 审核，实施细节下沉到三个子任务；本文件只保留任务图、跨子任务顺序和父级集成收尾。父任务本身无直接编码工作。

## 任务图与顺序

```
07-14-palette-core ──▶ 07-14-palette-catalog ──▶ 07-14-palette-skill-integration ──▶ 父任务集成评审
```

- [ ] **core**（`.trellis/tasks/07-14-palette-core`）：schema/loader/apply/token/结构化诊断/校验 gate；okabe-ito、ieee-bw、drawio-classic 三组代表性数据打穿全链路。见其 prd.md/implement.md。
- [ ] **catalog**（`.trellis/tasks/07-14-palette-catalog`）：其余 12 组数据、swatch 生成脚本 + 15 张样张 + 索引。依赖 core 的 entries 契约冻结。
- [ ] **integration**（`.trellis/tasks/07-14-palette-skill-integration`）：AskUserQuestion 规则（含 replicate 例外）、文档、interface/openai.yaml、evals、版本发布。依赖 core + catalog。

## 父级集成评审（全部子任务归档前执行）

- [ ] 对照父 prd.md「Acceptance Criteria」逐条勾验。
- [ ] root `npm test` / `just ci` 全绿（不能只跑 per-skill node --test）。
- [ ] 视觉抽查：3 张代表 swatch（okabe-ito / ieee-bw / c4-blue）+ 1 张 academic × okabe-ito 实际图。
- [ ] 回滚预案确认：删 `assets/palettes/`、`palette*.js`、schema `meta.palette`、文档段落即可整体回退，无数据迁移。

## 全局约束（各子任务继承）

- 编辑 `.js` 一律走 Bash（PostToolUse prettier 会 restyle 单引号风格）。
- 改 SKILL.md/reference 措辞会触发 root tests/ 策略契约断言。
- description 改动 → 26 条探针 + ≤800 字符预算（Windows 用分类探针 workaround）。
- 用户图表硬性偏好（透明文本框、原生绑定连线、共线拉直、Times New Roman+SimSun、开放箭头）不得被 palette 改动。

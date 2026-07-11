# Implement: 评估并移植精选视觉风格为主题/样式预设

前置：无硬前置。可与其他子任务并行（不碰 schema/scripts）。

## 步骤

1. 评估：读 8 份 `ref/fireworks-tech-graph/references/style-*.md` + 现有 `assets/themes/*.json`、`styles/built-in/*.json`，写 `research/style-triage.md`（每套：核心令牌、对照结论、移植/不移植理由；Dark Luxury vs arch-dark、Dark Terminal vs dark.json 必须做令牌级对比）。
   - 验证：8 套全覆盖，无"TBD"。
2. 移植：为每套入选风格新建 `assets/themes/<name>.json`（照抄 dark.json 字段结构，填 fireworks 令牌；滤镜类不可移植项记入 triage）。
   - 验证：`python -c "import json,jsonschema; jsonschema.validate(json.load(open('assets/themes/<name>.json')), json.load(open('references/theme.schema.json')))"`（schema 路径以 grep 实际确认为准）或走 CLI 渲染即隐式校验。
3. 样张：同一 example 逐主题渲染 `.drawio-tmp/style-samples/<theme>.svg`，`--validate` 无 error；目检与 fireworks samples 气质一致、文本框透明、连线绑定。
4. 文档：`references/docs/style-presets.md` 追加"主题×图类型适配"章节（design.md §C）。
   - 验证：新主题名与文件名一致；academic 场景仍指向 academic 主题（不与 overlay 政策冲突）。
5. 回归：现有 examples 用默认主题批量 `--validate`（确认新增主题文件未影响主题加载）。

## 回滚点

纯增量（N 个 theme json + 1 个文档章节 + triage 研究档），删除即回滚。

## 注意

- 新主题若需要主题内 edge-type 色板条目（R2 新增的 edge type），与 R2 产物对齐；若 R2 未完成，先只覆盖现有 5 种 edge type，并在 triage 记录待补项。
- CJK 字体栈不被新主题破坏（用户偏好 Times New Roman + SimSun）。

# Implement: 融合语义形状词汇与箭头语义到 design-system

前置：无（本任务是 R1 的前置——R1 的 examples 将使用本任务新增的 type）。

## 步骤

1. 定位现有 type→style 映射实现
   - `grep -rn "load_balancer\|'gateway'\|hexagon" skills/drawio/scripts/` 找到节点 type 样式表；`grep -rn "'dependency'\|'bidirectional'" skills/drawio/scripts/` 找到边 type 样式表。
   - 验证：能说出新增一个 type 需要改哪些文件（schema + 样式表 + 可能的 theme json）。
2. schema 扩展：`assets/schemas/spec.schema.json` 节点枚举加 `llm, agent, vector_store, memory, tool, gateway`；边枚举加 `control, memory_read, memory_write, async, feedback`。
   - 验证：旧 example（`references/examples/microservices.yaml`）`--validate` 仍通过。
3. 渲染映射：按 design.md §A/§B 在样式表中加映射（复用现有 shape 原语；边默认色按表，主题内由主题令牌覆盖）。检查 `assets/themes/*.json` 是否需要为新 type 补主题条目（至少 arch-dark、academic、default 路径不报 warning）。
   - 验证：写临时冒烟 YAML（含全部新节点 type + 全部新边 type），`node scripts/cli.js smoke.yaml smoke.svg --validate` 无 error；打开 SVG 目检形状/颜色/虚线正确。
4. 文档更新：shapes.md / connectors.md / color-guide.md / icons.md 按 design.md §C。
   - 验证：三份文档同一概念颜色一致；图例规则与 academic-figure-playbook 的紧凑图例表述不矛盾。
5. 全量回归：`for f in references/examples/*.yaml` 逐个 `--validate` 渲染，无新增 error/warning。

## 回滚点

schema/样式表改动集中在少数文件，git 单 commit 可整体回滚。

## 注意

- .js 文件编辑经由 Bash（heredoc/python）避免 prettier hook 重排（memory: drawio-skills-format-hook-conflicts）。
- 不修改 SKILL.md description（本任务无路由变更）。
- 冒烟 YAML 放 `.drawio-tmp/`，不进 examples。

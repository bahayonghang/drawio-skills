# 执行清单：drawio 架构图设计语言增强

1. [x] 写 `skills/drawio/assets/themes/arch-dark.json`（按 design.md 定稿映射表）→ 验证：主题 schema 校验通过（复用现有主题校验方式/测试）。
2. [x] 渲染 spike：单节点各语义类型 + 双行副标签 + 虚线 module 各出一张最小 YAML，跑 `cli.js --validate` 渲染 SVG 目视 → 验证：配色/可读性/虚线边界符合预期，副标签写法定稿。
3. [x] 写 `references/docs/architecture-diagrams.md`（含出处声明、映射表、YAML 片段、布局纪律、legend 规则、自检清单；片段全部来自步骤 2 实测）→ 验证：文档内每个 YAML 片段均可独立渲染。
4. [x] 移植三个示例为 `references/examples/arch-*.yaml` 并渲染 `.drawio` + SVG → 验证：`--validate` 通过、无重叠告警、legend 在边界外、与参考 HTML 语义等价。
5. [x] SKILL.md 接线：Task Routing 新增 `architecture` 路由行 + Reference Highlights 补一行；**description 行不动** → 验证：`git diff` 确认 frontmatter description 零变更。
6. [x] 联动文档：`references/docs/design-system/themes.md`、根 README / README_CN 主题清单 6→7。
7. [x] 许可：`skills/drawio/assets/licenses/architecture-diagram-generator-MIT.txt`（原文 + 出处 URL）。
8. [x] 端到端实测：全新中文微服务描述 + `arch-dark` 生成架构图，逐条过新文档自检清单（PRD 验收 3）。
9. [x] `just ci`（或仓库现行检查命令）全绿。
10. [x] `trellis-check` 复核；如步骤 2 发现可沉淀契约（副标签写法、module 虚线约定）走 `trellis-update-spec`。
11. [x] 中文 Conventional Commit（emoji + `[AI]` + agent trailers）分批提交；归档任务并记录 journal。

## Review Gates

- 步骤 2 后：spike 渲染图人工目视，确认设计语言观感达标再写文档（避免文档先行、片段失真）。
- 步骤 4 后：三示例 SVG 与参考项目截图并排目视对比。

## Rollback Points

- 步骤 2 若发现主题 schema/渲染能力承载不了关键效果（如虚线 module）：回 design.md 调整"主题承载 vs 文档 style 覆盖"分界，不得为此改 JS 代码；若必须改 JS，暂停并另立任务评审。
- 步骤 9 CI 失败：只修本任务引入的问题，不吸收无关工作树改动。
- 整体回滚：删除新增的主题/文档/示例/许可文件，还原 SKILL.md、themes.md、README 行。

## 执行备注

- 步骤 10：无需新增 .trellis/spec 契约——size 预设契约 spec 已有记载（本次示例初稿用错为 w/h 对象，已修正并在新文档 legend 片段中注明）；module 顶部预留空间规则已沉淀进 references/docs/architecture-diagrams.md。
- 与上游的偏差：不支持副标签独立小字号（HTML 标签被安全校验拒绝），以统一字号双行标签 + 角色配色承担层级，已写入文档。

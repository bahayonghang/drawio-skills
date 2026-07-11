# 吸收 architecture-diagram-generator 设计语言，增强 drawio 架构图能力

## Goal

将 `ref/architecture-diagram-generator`（Cocoon AI，MIT）中可迁移的**设计语言**——语义配色体系、组件标注风格、间距纪律、边界（region/安全组）画法、legend 摆放规则——移植进 `skills/drawio` 基座，成为新内置主题 `arch-dark`、一份架构图授权规范文档和三个可复现 YAML 示例。**不新建技能，不新增 HTML 导出路由**（已在评审中明确否决）。

## Background

- 参考项目输出深色 HTML+SVG 架构图。其 HTML 交付形态不吸收；可迁移的价值在设计语言层：
  - 语义配色：frontend=cyan / backend=emerald / database=violet / cloud=amber / security=rose / message-bus=orange / external=slate，底色 slate-950；
  - 组件标注：主标签 + 技术栈副标签（如 "API Server / FastAPI :8000"）的双行风格；
  - 布局纪律：组件间最小间距、消息总线放在组件间隙内不压框；
  - 边界画法：云区域 = 大圆角虚线 amber 框，安全组 = 小虚线 rose 框；
  - legend 规则：必须在所有边界框之外、最低边界下方留白摆放。
- drawio 基座现状（已核实）：主题以 JSON 定义 `node.<语义类型>` 配色（现有 6 个主题，含 `dark`）；YAML spec 节点类型词汇表含 `service/database/queue/user/cloud/terminal/document/text/process` 等；`modules` 支持容器分组和 style 覆盖；`--validate` 已有重叠与边质量检查。设计语言可完全落在**主题 JSON + 规范文档 + 示例**层，无需改转换器代码。
- 触发边界不受影响：本任务不改 `drawio` / `drawio-academic-skills` 的 description，因此不触发 26 条探针回归义务（07-09-skill-desc-slim 门槛仅约束 description 变更）。

## Requirements

1. 新增内置主题 `skills/drawio/assets/themes/arch-dark.json`：
   - 遵循现有 `theme.schema.json`，通过 schema 校验；
   - 底色/表面/边框采用参考项目 slate 深色体系；
   - 将参考项目七类语义色映射到现有节点类型词汇表（映射表在 design.md 定稿），不新增转换器节点类型；
   - 连接器与文字颜色保证深底可读。
2. 新增规范文档 `skills/drawio/references/docs/architecture-diagrams.md`：
   - 角色→节点类型+颜色映射表、双行标注风格、间距纪律、region/安全组边界画法（modules + style 覆盖写法）、消息总线摆放、legend 必须在边界外的规则，全部给出可直接套用的 YAML 片段；
   - 文档头注明设计语言源自 architecture-diagram-generator（MIT, Cocoon AI）。
3. SKILL.md 任务路由接线：`create` 或新增 `architecture` 路由行引用新文档；**frontmatter description 保持不变**。
4. 移植三个官方示例（web-app / aws-serverless / microservices）为 YAML spec，放入 `skills/drawio/references/examples/`，使用 `arch-dark` 主题，可经 CLI 渲染出 `.drawio` + SVG 且 `--validate` 通过。
5. 主题相关文档联动更新：`references/docs/design-system/themes.md`、根 README / README_CN 的主题清单（6 → 7）。
6. 出处与许可：设计语言改编声明 + MIT 原文（沿用 `assets/licenses/` 现有形制）。
7. 布局纪律与 legend 规则中可自动化的部分优先复用现有 `--validate` 能力；不为本任务新写校验脚本（若实测需要另立任务）。

## Non-Goals

- 不新建技能包；不给 CLI 增加 HTML/网页导出路由或导出工具栏。
- 不修改两条技能的 frontmatter description（避免触发探针回归义务）。
- 不改动转换器/渲染器 JS 代码与节点类型词汇表。
- 不动 `drawio-academic-skills`（深色分享风格与论文场景无关；academic 若将来要用另立任务）。
- 不修改 `ref/` 只读镜像。

## Acceptance Criteria

1. `arch-dark.json` 通过主题 schema 校验，出现在主题清单文档中。
2. 三个示例 YAML 经 `cli.js --validate` 渲染成功，SVG 目视核对：语义配色与参考项目对应、深底文字可读、组件无重叠、legend 位于所有边界框之外。
3. 用一段全新的中文微服务系统描述 + `arch-dark` 主题实测生成架构图：双行标注、边界框、legend 规则均按新文档生效。
4. `git diff` 确认两条 SKILL.md 的 description 行零变更。
5. `just ci`（或仓库现行检查命令）全绿。
6. README / README_CN / themes.md 主题数与清单一致；许可声明就位。

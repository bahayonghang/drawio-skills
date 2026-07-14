# 先查后写工作流规则与几何审计文档整合

父任务：`07-14-drawio-ai-kit-integration`。**依赖**：前两个子任务（`stencil-catalog-search`、`stencil-validate-hardening`）完成——本任务写入文档的命令名、flag、错误行为必须与已落地实现一致。

> 2026-07-14 修订：吸收 Codex 审阅——改动横跨 SKILL.md、三个 workflow、stencil guide、design-system 与可能的 academic overlay，且受根测试精确字符串断言约束，不按 PRD-only 轻量任务处理；执行计划见 `implement.md`（文件映射、顺序、验证门）。技术设计无新架构决策，不设 design.md。

## Goal

把"先查后写"（search-before-write）固化为 `skills/drawio` 的默认工作流规则，并把 `ref/drawio-ai-kit` rules/principles 中与本仓库体系兼容的画图规则以文档形式合入 design-system——让 AI 使用者在生成 YAML 前查询真实 stencil、在交付前理解校验器的拒绝行为。

## Requirements

### R1 SKILL.md 默认规则

- `skills/drawio/SKILL.md` 默认规则区新增一条：凡使用云厂商/网络图标（`aws.*/azure.*/gcp.*/k8s.*/cisco*.*/mxgraph.*`），先 `node scripts/cli.js search <关键词>` 确认真实名字再写入 YAML；未知名字默认会被校验器拒绝（附建议），`--allow-unknown-shapes` 仅作逃生门。
- **不改 frontmatter description**（避免触发 26 条探针门槛，memory `drawio-skills-desc-probe-set`）。

### R2 workflow 与参考文档

- `references/workflows/create.md`（及 edit/replicate 中涉及图标选择处）插入先查后写步骤。
- `references/docs/stencil-library-guide.md`：search 子命令完整用法（批量、--prefix、spec 写法反查）、目录覆盖范围表（各前缀条数，以子任务 1 实测为准）、未知名被拒绝时的处置流程。

### R3 精选审计规则合入 design-system

从 kit `rules/` 择取**与现有体系及用户偏好不冲突**者，合入 `references/docs/design-system/` 相应子文档（文字规则，不新增代码校验）：

- 云厂商图标色=身份、不得改色；官方容器嵌套顺序（Cloud/Account/Region→VPC→AZ→Subnet→SG）。
- 克制配色（背景填充色种数克制）、边语义（实线主流程/虚线辅助与异步）、cluster 连边界不连每个副本、避免超长绕行连线。
- **明确排除**：kit 的"字号≤14px"（与用户硬性偏好"字号尽量大不超框"冲突，memory `drawio-diagram-user-preferences`）、light-dark() 令牌与 kit 拓扑/主题体系（与本仓库 11 主题冲突）。

### R4 academic overlay 同步（最小）

- 仅当 base 能力映射表（Required Sibling Base）语义要求时，在 `drawio-academic-skills` 文档中提及 search 能力；不复制 base 内容（overlay 契约测试保持绿）。

## Acceptance Criteria

- [ ] SKILL.md 默认规则含先查后写条目，frontmatter description 与既有精确断言字符串（visual-verification、sidecar 措辞等）逐字未动。
- [ ] create/edit/replicate workflow 与 stencil-library-guide 更新一致，命令示例可直接复制运行。
- [ ] design-system 新增规则与既有 8 子文档、11 主题、`edge-quality-rules.md` 无措辞冲突或重复（重复处合并而非并列）。
- [ ] 根 `npm test` / `just ci` 全绿（尤其 `visual-verification-policy`、`skill-metadata`、`drawio-academic-skill` 契约测试）。

## Notes / Constraints

- 改 SKILL.md/reference 措辞必触发根测试精确字符串断言（memory `drawio-skills-canonical-test-gate`）：动手前先 grep 目标文件在 `tests/` 中被断言的片段，只做追加、不动被钉住的句子。
- 若实施中发现确需改 description，先停下跑 `07-09-skill-desc-slim` 的 26 条探针集（4 组互斥对，≤800 字符门槛），通过后再继续。

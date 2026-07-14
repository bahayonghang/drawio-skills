# 实施计划：先查后写工作流规则与几何审计文档整合

> 2026-07-14 新增：吸收 Codex 审阅——本任务涉及 SKILL.md、三个 workflow、stencil guide、design-system、可能的 academic overlay，且受根测试精确字符串断言约束，按复杂任务补齐执行计划。

前置：前两个子任务已完成归档（命令名、flag、错误行为以实际落地为准，动笔前先核对）；本任务 `task.py start` 后动手。纯文档任务，不改 `.js`。

## 文件映射（改动清单）

| # | 文件 | 改动 |
|---|---|---|
| 1 | `skills/drawio/SKILL.md` | 默认规则区追加"先查后写"一条（正文；frontmatter description 逐字不动） |
| 2 | `skills/drawio/references/workflows/create.md` | 图标选择步骤前插入 search 步骤 |
| 3 | `skills/drawio/references/workflows/edit.md` / `replicate.md` | 涉及新增图标处同步（只在确有图标选择环节时改） |
| 4 | `skills/drawio/references/docs/stencil-library-guide.md` | search 完整用法、目录覆盖表（含 mscae/k8s 家族，数字以子任务 1 记录区为准）、被拒绝时处置流程、`--allow-unknown-shapes` 说明 |
| 5 | `skills/drawio/references/docs/design-system/`（相应子文档） | 合入精选规则：图标色=身份、官方容器嵌套顺序、克制配色、边语义、cluster 连边界、避免超长绕行 |
| 6 | `skills/drawio-academic-skills/`（条件） | 仅当 Required Sibling Base 映射表需补 search 行时最小追加 |

## Checklist

1. [ ] 核对落地事实：`cli.js search` 实际参数面、错误文案、`--allow-unknown-shapes` 行为；子任务 1 记录区的覆盖数字。
   - 验证：文档中每个命令示例实际跑一遍可用。
2. [ ] grep 防线：对文件映射 1-6 中每个目标文件，先在根 `tests/` 中 grep 被精确断言的片段（`visual-verification-policy`、`skill-metadata`、`drawio-academic-skill` 等），列出"不可动措辞"清单。
   - 验证：清单记入记录区；后续只做追加、不动被钉句子。
3. [ ] 改 SKILL.md 默认规则（文件 1）。
   - 验证：`git diff` 确认 frontmatter 零改动；根 `npm test` 中 metadata/policy 测试绿。
4. [ ] 改 workflows（文件 2-3），与 SKILL.md 措辞一致。
5. [ ] 改 stencil-library-guide（文件 4），命令示例逐个实跑验证。
6. [ ] 合入 design-system 规则（文件 5）：先通读现有 8 子文档与 `edge-quality-rules.md`，重复处合并不并列；**排除**"字号≤14px"（与用户偏好"字号尽量大"冲突）与 light-dark 令牌。
   - 验证：新旧文档无自相矛盾表述（人工通读 + grep 关键词）。
7. [ ] （条件）academic overlay 最小追加（文件 6）。
   - 验证：`drawio-academic-skill.test.js` 绿（overlay 不复制 base 契约）。
8. [ ] 全量：根 `npm test` → `just ci`。
   - 验证：全绿，特别是三个策略契约测试。

## 回滚点

- 纯文档改动，单 commit 或按文件分组 commit；任一测试红 → 还原对应文件即可。

## 记录区（实施时填写）

- 不可动措辞清单：TBD
- 实跑过的命令示例清单：TBD

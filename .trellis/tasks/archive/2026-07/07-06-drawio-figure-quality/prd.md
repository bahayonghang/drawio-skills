# drawio skills 学术图与网络架构图质量优化

## Goal

作为父任务总控四个子任务，消除 2026-07-06 深度审查（见 `research/audit-findings.md`）发现的质量缺陷，使 `skills/drawio` + `skills/drawio-academic-skills` 能稳定产出高质量的学术流程图与网络架构图：SVG 交付物忠实反映 .drawio、非手工 bounds 也能得到可读布局、主题意图（IEEE 直角/灰度/字体）真实生效、文档与校验器不再互相矛盾。

## Source Requirement Set

用户目标：绘制更好的学术流程图、网络架构图，并解决其中的细节问题。
审查证据：`research/audit-findings.md`（19 项发现、5 项实证、外部标准核实）。

## Task Map（子任务）

| 子任务 | 优先级 | 覆盖发现 |
|---|---|---|
| 07-06-svg-renderer-fidelity | P0 | #1 #2 #3 #9(SVG侧) |
| 07-06-auto-layout-engine | P1 | #4 #6 |
| 07-06-theme-style-fidelity | P1 | #7 #8 #9(校验侧) |
| 07-06-academic-consistency | P1 | #5 #10 #11 #12 #13 #14 #15 #17 |

低优先级发现 #16/#18/#19 暂不立项，随相邻子任务顺带处理或后续再评估。

建议顺序：svg-renderer-fidelity → theme-style-fidelity / academic-consistency（可并行）→ auto-layout-engine（最大改动，依赖 SVG 保真修复后才能有效自检）。

## Cross-child Acceptance Criteria（父任务验收）

- [x] 四个子任务全部完成并归档。
- [x] 集成回归：`mod-test.yaml`（modules 场景）渲染的 SVG 与 .drawio 在 draw.io Desktop 中目视一致（节点位置、边路由、文本行）。
- [x] 官方模板与 `references/examples/`、`references/templates/` 全部通过 `--validate --strict-warnings`。
- [x] 根目录测试套件（`node --test tests/`）与 scripts 单测全部通过。
- [x] 文档（playbook/checklist/edge-quality-rules/specification）与代码行为一致，无本次审查列出的矛盾项残留。
- [x] SKILL.md 版本号按语义化提升，CHANGELOG 记录本轮变更。

## Constraints

- 保持离线优先、YAML-first 契约不变；不得引入 MCP/浏览器依赖。
- overlay 只改政策/文档/示例，代码修复全部落在 base（`skills/drawio`）。
- 遵守仓库既有代码风格；.js 编辑注意 format-hook 单引号问题（见项目 memory）。

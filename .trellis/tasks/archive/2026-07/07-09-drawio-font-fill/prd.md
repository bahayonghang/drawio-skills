# drawio 字体统一与填充式字号系统

## Goal

解决 skill 产图「字体过小、字族不统一」问题：全链路统一 Times New Roman（西文/数字）+ SimSun（中文），并让字号在不超出方框的前提下尽量放大、同类元素一致，符合中英文论文规范（用户 2026-07-09 提供优化前后对照样张为验收基准）。

## Background（根因，已由分析确认）

1. 字号被多层默认值压小：academic 主题节点 11px/模块 12px、代码回退 13/11、playbook 示例 9–11、compact 模板 10。
2. 两条学术门禁互相矛盾：`spec-to-drawio.js` 中「8–10」检查把 px 当 pt，与 IEEE 印刷换算检查（宽画布要求 ≥48px）冲突，实际把作者推向小字。
3. 字号与盒子解耦：普通节点用固定 SIZE_PRESETS（medium 120×60），文本不参与盒尺寸，也没有普通节点的溢出校验。
4. 字族按整段路由：混排标签整体落单一 `Simsun`，英文/数字不走 Times New Roman；非学术 profile 的 cjk 桶是无汉字字形的 `Times New Roman`（渲染回退失控）；academic 主题 typography 无 cjk 键。

## Requirements

- **R1 字族统一**：所有文本面（节点、模块标题、边标签、text 节点）默认字族解析为回退列表——含 CJK 的文本 `Times New Roman,SimSun`（Latin 落 Times、汉字落宋体），纯西文 `Times New Roman`；公式桶保持 Times New Roman。两个 profile（academic/general）行为一致。用户显式 `style.fontFamily` / `meta.font` 仍可覆盖。
- **R2 字号梯子**：默认字号提升为 模块标题 22（加粗）/ 节点 20 / 边标签 18 / text（caption/legend）16，下限 12；同类元素字号必须一致。
- **R3 不超出方框**：
  - 自动布局节点：盒子按内容感知增长（SIZE_PRESETS 变为最小值），文本按 0.6em(Latin)/1.05em(CJK) 估宽 + 内边距。
  - 显式 bounds 节点（replicate 流）：按类求"最大可容纳字号"，类内取最小并夹在 [12, 梯子值]。
  - 溢出校验从 text 节点扩展到所有带显式 bounds 的节点，超框告警（`--strict-warnings` 阻断）。
- **R4 论文印刷护栏**：删除误导性「8–10」检查；印刷换算检查泛化为 `meta.print`（预设 `cn-thesis` 440pt/最小 9pt、`ieee-single` 252pt/8pt、`ieee-double` 516pt/8pt，可自定义 widthPt/minPt），保持 warning 性质。
- **R5 文档/模板同步**：tokens.md 字号表、academic playbook（Canvas and Print Sizing 增中文档位、示例字号）、两个 compact 模板、academic SKILL.md Quality Gate（新增字号一致/不超框两条）、`.trellis/spec/frontend/font-policy.md`、schema（meta.print、字族列表）。公开 docs（en/zh）中涉及默认字号/字族处联动。
- **R6 测试**：node:test 覆盖新行为（字族列表、梯子默认、类级收缩、溢出告警、meta.print 告警），修正因默认值变化而失效的既有断言；新增用户架构图同款 fixture。

## Constraints

- 离线、YAML-first、base/overlay 边界不破坏（quality-guidelines.md）。
- `.js` 文件编辑走 Bash（PostToolUse prettier hook 会把 Edit 改成双引号风格，见 memory）。
- 双语 docs 行为镜像时须同步（quality-guidelines）。
- 用户显式覆盖永远优先于自动规划（不破坏既有 spec 的向后兼容）。

## Acceptance Criteria

- [x] 混排标签（如 `训练服务\n独立子进程 · GPU绑定`）生成的 mxCell style 含 `fontFamily=Times New Roman,SimSun`；纯英文标签含 `fontFamily=Times New Roman`（或主题列表）。
- [x] 无显式 fontSize 的 spec：节点 style 出现 `fontSize=20`、模块标题 `fontSize=22`、边标签 `fontSize=18`；同类元素字号一致。
- [x] 自动布局下无任何标签估算宽度超出盒宽（盒子随内容增长）；显式小 bounds 时类级收缩生效且不低于 12，仍放不下则输出溢出 warning。
- [x] 学术 profile 不再出现「expects 8-10pt labels」告警；`meta.print: { target: cn-thesis }` + 宽画布输出印刷换算 warning（数值按 440pt/9pt 计算）。
- [x] `npm test` 全绿；`just ci` 通过（或明确报告不可用项）。
- [x] 用户样张同款 fixture 渲染 SVG 目视核对：字族衬线、字号饱满、无溢出。

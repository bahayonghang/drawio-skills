# 基线评测结果（改写前，2026-07-09）

- 条件：当前仓库 description（drawio 552 字符 + academic 585 字符 = 1137 字符）。
- 方法与探针集：见 `trigger-probes.md`；2 个独立子代理（无期望标签、禁用工具）。
- 结果：**两跑逐条判定完全一致，均 26/26**。

## 汇总指标

| 指标                       | run1               | run2  |
| -------------------------- | ------------------ | ----- |
| drawio 召回（11 正例）     | 11/11              | 11/11 |
| academic 召回（9 正例）    | 9/9                | 9/9   |
| 负例正确（6 条不触发本组） | 6/6                | 6/6   |
| drawio 精确率              | 100%（无负例误入） | 100%  |
| academic 精确率            | 100%               | 100%  |
| 互斥对 A/B/C/D             | 4/4                | 4/4   |

## 逐条判定（两跑一致，仅列一份）

q01 drawio / q02 academic / q03 docx / q04 drawio / q05 academic / q06 drawio / q07 dataviz / q08 academic / q09 drawio / q10 academic / q11 none / q12 drawio / q13 academic / q14 drawio / q15 academic / q16 drawio / q17 none / q18 drawio / q19 academic / q20 drawio / q21 drawio / q22 academic / q23 drawio / q24 academic / q25 none / q26 none

全部与期望一致。基线为满分，改写后的通过条件即为：同探针集仍需 26/26。

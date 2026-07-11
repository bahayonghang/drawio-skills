# 执行清单：精简 drawio skills description

前置：本任务为轻量任务，PRD + 本清单即可，无需 design.md。实施顺序不可调换——评测基线必须先于任何改写。

## Checklist

1. [x] **建探针集** → 写入 `research/trigger-probes.md`：≥20 条中英混合 probe，按 PRD 验收标准覆盖 drawio 正例、academic 正例、≥4 组互斥对、无关负例；每条标注期望路由。
   - verify：条数与覆盖矩阵齐全（四类各达标）。
2. [x] **跑基线 classification-probe**（对当前 description）→ 结果写入 `research/baseline-results.md`。
   - 方法：把两条候选 description（可混入 2-3 条干扰 skill 描述）+ probe query 交给模型判"应触发哪个 skill/都不触发"，脚本或人工统计 recall/precision。
   - ⚠️ 不要用 skill-creator 的 run_loop/run_eval 管道（Windows select-on-pipe 假 0% 召回）。
   - verify：每条 probe 有判定记录，汇总出基线 recall/precision。
3. [x] **按方向 B 改写**两条 description（草案见 PRD，可依基线微调）。
   - verify：PRD 复测命令输出合计 ≤800 字符；`git diff` 仅含两个 SKILL.md 的 description 行。
4. [x] **复跑同一探针集** → 结果写入 `research/after-results.md`。
   - verify：recall/precision ≥ 基线；互斥对 100% 正确。回退则恢复对应关键词、标注 load-bearing，重跑直至达标。
5. [x] **沉淀证据与规范**：前后对比结论汇总；如形成"关键词×用例"规范，走 trellis-update-spec。
   - verify：research/ 下三份文件齐全。
6. [x] **提交**：git-commit 流程（中文 Conventional Commits），提交时决定版本号/CHANGELOG 是否递增。
   - verify：工作区不残留本任务未跟踪文件。

## 回滚点

- 第 3 步后任何评测回退：`git checkout -- skills/*/SKILL.md` 即可完全回滚，探针集与基线数据保留复用。

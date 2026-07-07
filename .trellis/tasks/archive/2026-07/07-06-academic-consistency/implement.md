# Implement — 学术规则、模板与文档一致性修复

> .js/.yaml 经 Bash+python 补丁（CRLF 归一化）；单块命令 ≤8KB。

## Checklist

1. [x] spec-to-drawio.js 校验器改造：删密度块、text 豁免 + estimateVisibleLabelLength、validateSchemaDrift + 接线、R5 版面告警、checkComplexity info 聚合。
   - 验证：node --check + 针对性单测红转绿。
2. [x] 单测：新增 academic consistency describe（豁免/可见长度/无密度告警/漂移告警/1600px 告警/info 聚合）；修正受影响旧断言。
   - 验证：node --test spec-to-drawio.test.js 全绿。
3. [x] 两个 compact 模板清理 + neural-network 坐标重排（design.md 坐标表）；`--validate` 双模板零 warning。
   - 验证：CLI --validate 输出 0 条 warning。
4. [x] 新增 tests/academic-templates-strict.test.js（模板+学术示例 strict 守护）。
   - 验证：node --test tests/ 通过。
5. [x] 文档：playbook 图例示例（type: text）与 box 示例去漂移键、增"画布与印刷尺寸"小节；checklist/publication-overlay 增 px→pt 表与 IEEE PDF 提示。
   - 验证：grep 无 style.shape/canvasSize 残留（模板与 playbook 内）。
6. [x] evals：academic evals.json 版本 2.3.0 + _runner 注记；evals/README.md 历史产物状态。
   - 验证：版本一致性测试（若有）/ 手查。
7. [x] 全量：npm test + 全示例渲染回归。

## 回滚点

- 步骤 3 后模板渲染异常：git checkout 两个模板。
- 单分支单提交，revert 即回滚。

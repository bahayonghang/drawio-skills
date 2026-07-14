# 实施计划：未知 stencil 校验闭环强化

> 2026-07-14 修订：新错误契约 + aspect=fixed 生成路径修复。

前置：`07-14-stencil-catalog-search` 已完成（v2 目录 + `dsl/catalog-search.js` + `dsl/icon-mappings.js`）；本任务 `task.py start` 后动手。`.js` 编辑经 Bash。

## Checklist

1. [ ] 基线：脚本循环 `references/examples/*.yaml` + `drawio-academic-skills/references/{examples,templates}/*.yaml` 过 `--validate`，记录现有 shape 警告清单。
   - 验证：清单空或逐条确认"确实未知"；真实图形被标未知 → 回子任务 1 补目录/别名。
2. [ ] grep：`tests/`+`skills/` 中 "empty box" 文案断言；仓内 `validateShapeReferences(`、`returnWarnings` 全部调用点清单。
3. [ ] `validateShapeReferences()` 改返回 `{errors, warnings}`（未知→errors，含 top-3 spec 写法建议）；调用点新增 error 聚合：非 `allowUnknownShapes` 时 buildXml 前抛聚合 Error（挂 `err.validationErrors`），降级时回落 warning。
   - 验证：模块级 `node --test` 新用例绿（拒绝/聚合/降级/strict 正交）。
4. [ ] `cli.js` 加 `--allow-unknown-shapes` + 帮助文本。
   - 验证：编造名 fixture 默认退出码非 0 无输出；加 flag 产出且仅 warning。
5. [ ] aspect=fixed：compound 分支（aws4ResourceIcon + k8sParamIcon）样式追加 `aspect=fixed`；重生成受影响示例/快照并 diff 审查（只允许样式串追加）。
   - 验证：`aws.ec2` 与 `k8s.pod` 样式单测绿；全示例 diff 干净。
6. [ ] 步骤 2 清单中的测试同步判级（保句式）；补用例矩阵与全示例零误杀基线测试。
7. [ ] 全量：根 `npm test` → `just ci`。
   - 验证：全绿；`academic-templates-strict` / `integration` / `security` 无回退。

## 回滚点

- 步骤 3-4（契约+CLI）与测试同 commit，整体可回滚。
- 步骤 5（aspect=fixed）独立 commit，可单独回滚。

## 记录区（实施时填写）

- 基线误杀清单：TBD
- `validateShapeReferences`/`returnWarnings` 调用点清单：TBD
- 被断言的旧文案位置：TBD

# Implement — drawio 字体统一与填充式字号系统

> 平台说明：本任务由主 Agent inline 实施（Claude Code），不派发 sub-agent，故不维护 implement.jsonl/check.jsonl。
> 硬约束：`.js` 一律用 Bash（python/node 脚本或 sed）编辑，避免 PostToolUse prettier 重排引号风格。

## 顺序清单

1. **A 字族统一**
   - [x] `spec-to-drawio.js` `getDefaultFontPolicy`：cjk 桶两分支统一为 `Times New Roman,SimSun`。
   - [x] 确认 `meta.font` 校验（~:2882）与 `spec.schema.json` 放行逗号列表；必要时放宽。
   - [x] `academic.json` / `academic-color.json` 增 `typography.fontFamily.cjk`；`theme.schema.json` 若约束键集则补。
   - 验证：`node --test skills/drawio/scripts/dsl/spec-to-drawio.test.js`（临时脚本渲染混排 spec，grep style 断言）。

2. **B1 梯子默认值**
   - [x] 代码回退：`:46` DEFAULT md/sm、`:1019` node 13→20、`:1182` module 14→22、text 13→16。
   - [x] 边标签：抽 `resolveEdgeLabelFontSize`，`:1241`/`:1384` 共用，默认 18。
   - [x] `academic.json`/`academic-color.json`：node.default.fontSize→20、module.labelFontSize→22、typography.fontSize 表同步。

3. **B2 内容感知盒**
   - [x] `getNodeSize` 增 `fontSize` 参数：非 text 有标签节点返回 `max(preset, extent+padding)`；text 节点把节点实际 fontSize 传入 `estimateTextSize`。
   - [x] 布局各调用点（~:647/:674/:705/:720/:749/:773 及 getNodeMetrics）传入节点已物化的 fontSize。

4. **B3 两阶段字号规划**
   - [x] Phase 1 `assignFontPlan(spec, theme)`：布局前把梯子值写进缺省的 `style.fontSize`（node/edge/module label 走主题读取路径的可跳过），记录自动赋值集合。
   - [x] Phase 2 `shrinkFontToBounds`：布局后对显式 bounds 节点按类求最大可容字号，类内 min、clamp [12, 梯子]，仅覆盖自动赋值。
   - 验证：单测——窄 bounds 双节点得到同一收缩值；用户显式 fontSize 不变。

5. **C 门禁**
   - [x] 删 8–10 检查（:2232-2249）；实现 `meta.print` 解析 + 预设（cn-thesis 440/9、ieee-single 252/8、ieee-double 516/8）+ 换算告警；`KNOWN_META_KEYS`、`spec.schema.json` 增 print。
   - [x] 溢出校验推广到所有显式 bounds 节点（复用 `measureLabelExtent`）。
   - 验证：单测覆盖 warning 文案与触发条件。

6. **E 测试与 fixture**
   - [x] 修复既有断言（默认字号变化引起）。
   - [x] 新增 design.md §测试 列出的 6 组用例；fixture 采用用户样张同款架构图 YAML。
   - 验证：`npm test` 全绿。

7. **D 文档/模板/spec 同步**
   - [x] tokens.md、academic-figure-playbook.md、两个 compact 模板、academic SKILL.md Quality Gate、academic-export-checklist.md。
   - [x] `.trellis/spec/frontend/font-policy.md` 更新（Contracts/Good 案例/梯子）。
   - [x] grep 公开 docs（en+zh）旧默认字号/字族文字并同步。
   - 验证：`just lint`（Markdown）；grep 无残留 "8-10pt"/"fontSize: 10" 误导。

8. **终检与收尾**
   - [x] 渲染 fixture → SVG 目视核对（字族/字号/不超框），对照用户优化后样张。
   - [x] `just ci`（含 version-sync、lint、tests、docs build）；不可用项如实报告。
   - [x] Trellis 3.3 spec 更新已在步骤 7 覆盖；3.4 中文 Conventional Commit（`[AI]` 标头 + Why 行）。

## 回滚点

- 每个大步骤后 `git status` 保持可分割；异常时 `git checkout -- <file>` 回退单文件；整体回滚以本任务 commit 为界 `git revert`。

# Implement — drawio 文字样式优化：透明底 + 内容定宽

执行顺序：先转换器（可单测闭环）→ 再文档 → 再 eval 验证 → 收尾。每步带验证；评审门用 ☑ 标注。

## 命令速查

```bash
# 全量测试
npm test
# 单文件调试（Node 内置 test runner）
node --test skills/drawio/scripts/dsl/spec-to-drawio.test.js
# 渲染自检（生成 .drawio + .svg）
node skills/drawio/scripts/cli.js <in>.yaml <out>.drawio --validate --write-sidecars --sidecar-dir .drawio-tmp/<out>
node skills/drawio/scripts/cli.js <in>.yaml <out>.svg   --validate --write-sidecars --sidecar-dir .drawio-tmp/<out>
# 提交前完整门禁
just ci   # = version-sync + version-check + lint + test + docs-build
```

> `.js` 改动一律用 Bash（heredoc/sed）落盘，避免 PostToolUse prettier 改写非改动行（[[drawio-skills-format-hook-conflicts]]）。改完用 `git diff` 确认只动了目标行。

## 阶段 A — 转换器护栏（R4）

- [ ] A1. `estimateTextSize(label, fontSize=13)`：在 `spec-to-drawio.js` Size 区新增内部 helper。按 `\n`/`<br>` 拆行；ASCII≈0.6×fs、CJK≈1.05×fs 累加；`width=clamp(ceil(maxLine)+20, 48, 320)`、`height=max(ceil(lines×fs×1.4)+12, 24)`。
  - verify：`node -e` 快测 `estimateTextSize('有效频带')` 与 `estimateTextSize('Conv1D-ResNet + FiLM + Cross-Attention')` 宽度合理（前者明显窄、后者不超上限）。
- [ ] A2. 扩展 `getNodeSize(size, nodeType, label)`：加可选第三参；`nodeType==='text' && !SIZE_PRESETS[size] && label` 时返回 `estimateTextSize(label)`；其余分支不变（向后兼容）。
  - verify：`node --test` 跑 getNodeSize 既有断言（line 169-185）仍绿。
- [ ] A3. text 样式补 `labelBackgroundColor=none`：`generateNodeStyleWithSpec` 的 `isTextNode` 分支 `parts` 追加该项。
  - verify：对一个 `type: text` 节点生成 style，断言含 `fillColor=none` 且 `labelBackgroundColor=none`。
- [ ] A4. 布局调用点传 label：将 `getNodeSize(node.size, semanticType)` 改为 `getNodeSize(node.size, semanticType, node.label)`（约 483/495/508/551/582/643 行，逐一核对）。显式 `bounds`/`position+size` 路径不动。
  - verify：`npm test` 全绿；`git diff` 只含目标行。
- [ ] A5. 新增单测：在 `spec-to-drawio.test.js` 增 ① text 节点 style 含透明底 + 无白底光晕；② 无显式尺寸的 text 节点宽度随 label 长度变化（短<长）且短标签宽度 < 旧固定 120。
  - verify：`node --test skills/drawio/scripts/dsl/spec-to-drawio.test.js` 全绿。
- ☑ **评审门 G1**：A 阶段 diff + 测试结果交用户/检查确认后再进入 B。

## 阶段 B — 指导文档（R1/R2/R3）

- [ ] B1. `tokens.md` 新增 `## Text & Label Styling`：规则 A（透明底 + why + 例外）、规则 B（内容定宽 + why + 估算启发式）。作为唯一规范来源。
- [ ] B2. `skills/drawio/SKILL.md` `Default Operating Rules` 加第 13 条（一句话 + 指针 tokens.md）。
- [ ] B3. `references/workflows/edit.md`：改标签/样式处加规则 + 指针。
- [ ] B4. `references/workflows/replicate.md`：Text Fidelity / `bounds` 段加"透明底 + bounds.width 按内容定宽"+ 指针。
- [ ] B5. `references/docs/design-system/specification.md`：`text` 类型行后加样式约定 + 指针。
- [ ] B6. 学术叠加层 `publication-overlay.md`：`Formula/callout placement` 段加学术增量规则 + 指针 base tokens.md（不复制）。
- [ ] B7. `academic-figure-playbook.md`：callout/legend 条目补一句或留指针。
  - verify（B 整体）：`just lint`（markdownlint）通过；通读确认无重复正文、指针路径正确、各文件语言一致。
- ☑ **评审门 G2**：文档 diff 交用户确认规则措辞与覆盖面。

## 阶段 C — Eval 验证（R5）

- [ ] C1. 快照旧 skill：`cp -r skills/drawio skills/drawio-workspace/skill-snapshot/drawio`（academic 视需要），作为 old_skill baseline。
- [ ] C2. 在 `skills/drawio/evals/evals.json` 增 2 个用例：`callout-over-color`、`multiline-node-and-text`（prompt 见 design §4）。
- [ ] C3. 同一轮内并行 spawn 子代理：每用例跑 with_skill（新版）与 old_skill（快照），输出存 `skills/drawio/drawio-workspace/iteration-1/eval-<id>/{with_skill,old_skill}/outputs/`。
- [ ] C4. 写脚本对输出 `.drawio` 评分：正则查 `fillColor=#FFFFFF` / `labelBackgroundColor` 白底；按 cell 文本估算宽度区间核对"非容器整宽"。grading.json 用 `text/passed/evidence` 字段。
- [ ] C5. 聚合 + 查看：生成 `benchmark.json`；`generate_review.py --static <html>` 产出独立 HTML（Windows 无显示用 static），交用户查看 with vs old。
  - verify：with_skill 在两断言上优于 old_skill；用户在 viewer 确认改善。
- ☑ **评审门 G3**：根据 eval/用户反馈决定是否回阶段 A/B 迭代。

## 阶段 D — 收尾（移交 Phase 3）

- [ ] D1. 清理：删除 `drawio-workspace/`、`.drawio-tmp/` 等临时产物（除非用户要留）。
- [ ] D2. `just ci` 全绿（version + lint + test + docs-build）。
- [ ] D3. 进入 Trellis Phase 3：spec 更新（如有可沉淀约定）→ commit（`[AI]` 头 + 规则要求的 Why 行）。

## 回滚点

- 阶段 A 出错：`git checkout -- skills/drawio/scripts/dsl/spec-to-drawio.js`（及其 test），文档/eval 未动可独立保留。
- 阶段 B 出错：文档为纯增量，按文件 `git checkout` 即可，不影响 A 的代码护栏。
- 整体回滚：本任务全在工作分支，必要时 `git reset` 到任务起点 commit。

## 待办：sub-agent manifests（start 前）

- 若用 trellis-implement/check 子代理：把 `spec-to-drawio.js`、`spec-to-drawio.test.js`、`tokens.md`、两个 workflow、`publication-overlay.md` 列入 `implement.jsonl`；把 `evals.json`、本 design/prd 列入 `check.jsonl`。

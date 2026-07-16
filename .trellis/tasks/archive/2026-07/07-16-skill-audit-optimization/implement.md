# Implement — yao-meta 审计驱动的 drawio 双 skill 优化

执行顺序即回滚点顺序;每个 W* 一个 commit(格式 `chore(skills): W<n> <摘要>`)。任何一步 `npm test` 变红,先修或 revert 本步,不得带病进入下一步。

上下文加载顺序:`implement.jsonl` → `prd.md` → `design.md` → 本文件。子代理 dispatch 一律以 `Active task: .trellis/tasks/07-16-skill-audit-optimization` 开头。

## 步骤 0 · 开工基线(不产 commit)

- [ ] `git status` clean;`npm test` 全绿并记录用例数(基线 445)。
- [ ] 确认评审门对 prd Open Questions 1–4 的裁决已回填到本文件对应步骤(默认:Q1 保留文档化、Q2 并入后删除、Q3 接受 14KB/12KB、Q4 补 base openai.yaml)。

## 步骤 1 · W1 打包卫生(P0)

- [ ] 按 design § W1 重写 `justfile` zip recipe(`git ls-files` 清单 + `zipfile` 写入 + 三条自校验)。
- [ ] 验证:`just zip` 成功;对两个 zip 分别执行 namelist ↔ `git ls-files -- skills/<name>` diff 为空;人工确认名单无 `.drawio-tmp/`。
- [ ] 反向验证:在 `skills/drawio/.drawio-tmp/` 存在本地文件的状态下重跑 `just zip`,确认脏文件不进包(当前工作区即有 16 个,天然满足)。
- [ ] `just clean-zip`;`npm test`;commit(回滚点 R1)。

## 步骤 2 · W2 `.mcp.json` 文档化

- [ ] base `SKILL.md` Runtime Stack live-refinement 行 Notes 追加供给说明(design § W2 措辞要素:用途/pin 版本/npx 网络行为/离线不依赖)。
- [ ] `references/docs/mcp-tools.md` 新增 "Provisioning" 小节。
- [ ] 验证:`grep -rn "mcp.json" skills/drawio --include="*.md"` ≥2 处;"No MCP server is required" 原句仍在;`npm test` 绿。
- [ ] commit(R2)。

## 步骤 3 · W4 孤儿资源治理

- [ ] 对 3 个孤儿 doc 逐个跑 grep 门:`grep -rn "<basename>" scripts tests skills docs`;把结果贴进 `research/orphan-disposition.md`(含最终动作)。
- [ ] `examples.md` / `drawio-aesthetic-guide.md`:独有内容比对并入目标文档(design § W4 表),然后删除(按 Q2 裁决)。
- [ ] 新建 `skills/drawio/references/examples/README.md`(21 条 when-to-use 表);palettes README 补 swatch 模板与 `palette.schema.json` 指针;base SKILL.md Style Presets 段补 `style-presets.md` 提及。
- [ ] academic:playbook 相应小节点名 7 个示例 + 2 个模板。
- [ ] 验证:`node research/audit-orphan-check.mjs` 输出两包 0 孤儿;`npm test` 绿(若删除文件触发策略测试,回到 grep 门复核而非硬改测试)。
- [ ] commit(R3)。

## 步骤 4 · W3a base eval 基线(在瘦身之前)

- [ ] 通读 `skills/drawio-academic-skills/evals/README.md`,把评分口径摘要写入 `skills/drawio/evals/README.md`(新建)。
- [ ] dispatch 一个 sub-agent 逐案例执行 base `evals/evals.json` 全部 15 条(真实运行 CLI,逐断言判定),产出分数、最弱维度、判定依据。
- [ ] 写入 `skills/drawio/evals/darwin-results.tsv` 基线行(`old_score=-`,`status=baseline`,`eval_mode=dry_run`);跑不了的案例在 note 记 `missing evidence`。
- [ ] `npm test` 绿;commit(R4)。

## 步骤 5 · W5 SKILL.md 瘦身(风险最高,放在证据基线之后)

- [ ] 产出 `research/policy-assertion-map.md`:扫描 `tests/*.test.js` 全部字符串断言 → 目标文件/章节 → 处置。**映射评审通过前不动文案。**
- [ ] base `SKILL.md`:按 design § W5 手法 1–3 迭代;每轮 `npm test` + `wc -c skills/drawio/SKILL.md`,直至 ≤14,000B。
- [ ] academic `SKILL.md`:同法,直至 ≤12,000B。
- [ ] 验证:`git diff` 确认两处 frontmatter 无任何字节变化;被下沉规则在目标 reference 中有权威段落(逐条列在 commit message);`npm test` 绿。
- [ ] commit(R5)。

## 步骤 6 · W3b eval 抽查(瘦身回归门)

- [ ] 从 15 案例选 ≥5 条覆盖被移动文本的路由(create / 边线规则 / palette 询问门 / replicate / 导出回退),同法真实执行。
- [ ] `darwin-results.tsv` 追加一行(`old_score=基线分`);若回归超噪声,revert R5 或修正后重跑本步。
- [ ] commit(R6,可与 R5 修正合并)。

## 步骤 7 · W6 小项 + 收尾

- [ ] academic `.gitignore` 删过期注释;新建 base `agents/openai.yaml`(按 Q4 裁决;字段同构自 interface.yaml)。
- [ ] 两份 skill CHANGELOG 的 Unreleased 段各补本任务条目(W1–W6 一行式)。
- [ ] 终检(最后一轮全量):`npm test` 全绿 + `just ci` 通过 + `node research/audit-orphan-check.mjs` 0 孤儿 + `just zip` 自校验通过后 `just clean-zip`。
- [ ] commit(R7)→ 进入 Phase 3(spec 更新:若 `.trellis/spec/drawio-skill/` 需要新增"打包与文档契约"条目,在 3.3 处理;journal 记录)。

## 明确不做

- 不改两条 frontmatter `description`(探针回归门不触发)。
- 不改 `scripts/**/*.js`、schema、渲染行为。
- 不为 missing evidence(盲评包 / telemetry / reports/)补形式工件。

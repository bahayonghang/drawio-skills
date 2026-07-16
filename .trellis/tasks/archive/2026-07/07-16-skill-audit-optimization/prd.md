# yao-meta 审计驱动的 drawio 双 skill 优化

## Goal

依据 yao-meta 审计报告(`research/yao-meta-audit.md`,2026-07-16,基线 445/445 绿)修复 1 项 block 与 4 项 warn 级发现,使 `skills/drawio` 与 `skills/drawio-academic-skills` 达到可复现发布、证据对称、资源可发现的 Library 档水位;瘦身初始加载但不改变任何行为契约。

## Requirements

按优先级分六个工作流(细节与证据见审计报告 F1–F7):

- **W1 · P0 · 打包卫生**:`just zip` 只打包 git 跟踪文件,杜绝 `.drawio-tmp/` 等本地脏文件进入发布 zip,并在配方内自校验。
- **W2 · P1 · `.mcp.json` 文档化**:在 base SKILL.md(Runtime Stack live-refinement 行)与 `references/docs/mcp-tools.md` 中说明该文件的用途、pin 版本、npx 网络行为、离线流程不依赖它。默认方案是"保留并文档化";若评审改判"移除出包",改为在 mcp-tools.md 提供手工配置说明。
- **W3 · P1 · base eval 证据**:按 academic 同款逐断言方法真实跑一次 base 15 条 eval 基线,落 `evals/darwin-results.tsv`(同列结构)+ `evals/README.md`;W5 瘦身后对受影响路由抽查 ≥5 条并记录第二行结果。**禁止伪造结果。**
- **W4 · P1 · 孤儿资源治理**:为 base/academic 的 `references/examples/`(及 academic `references/templates/`)建条目级 when-to-use 索引;裁决 3 个孤儿 doc(`examples.md`、`drawio-aesthetic-guide.md` 删除或并入,`style-presets.md` 在 base 侧补提及);`palette.schema.json` 在 palettes README 加指针。删除任何文件前先 grep `scripts/`、root `tests/` 与两份 SKILL.md 确认零引用。
- **W5 · P2 · SKILL.md 瘦身**:base 21,825B → ≤14,000B,academic 17,448B → ≤12,000B。手段限于:把已有权威 reference 的细则正文(如 base 规则 13/14 与 tokens.md、edge-quality-rules.md 重叠部分;academic Quality Gate 与 playbook 重叠部分)收敛为一行契约句 + 指针;压缩 Reference Highlights 与路由表的重叠。**frontmatter `description` 一字不动。**
- **W6 · P2 · 小项**:academic `.gitignore` 过期注释清理;openai.yaml 不对称(补 base 侧或记录 overlay-only 理由);随 W4 完成 schema 指针。

## Constraints

- 行为不变:不改渲染器/CLI/schema 行为,不加新功能;所有变更是文档、打包配方与 eval 证据。
- **description 冻结**:两条 description 本任务不修改,从而不触发 26 条探针回归门(`.trellis/tasks/archive/2026-07/07-09-skill-desc-slim/research/trigger-probes.md`)。若评审要求改 description,先跑探针再改,且合计 ≤800 字符。
- **契约测试门**:root `tests/` 策略测试断言 SKILL.md/reference 措辞。W5 动文案前必须先产出"测试断言 → SKILL.md 章节"映射;移动文本时保留契约短语或在同一提交内有意识地更新对应测试。收尾以 root `npm test`(及 `just ci`)为准,不得只跑 per-skill 测试。
- 格式化 hook:PostToolUse prettier 会重排 `.js`;若需改 JS(本任务预计不需要),经 Bash 编辑以保持 surgical。
- 提交粒度:每个工作流一个 commit,作为回滚点。
- yao-meta 边界:缺失证据(盲评包、telemetry、reports/)如实标注,不为形式补齐,不在本任务范围。

## Acceptance Criteria

- [ ] W1:`just zip` 产物文件名单 == `git ls-files skills/<name>` 输出(两包各验一次);名单中 0 个 `.drawio-tmp/`、`.playwright-mcp/`、`logs/` 路径;配方含自校验失败即退出非零。
- [ ] W2:`grep -rn "mcp.json" skills/drawio --include="*.md"` ≥2 处命中(SKILL.md + mcp-tools.md),内容涵盖用途/pin 版本/网络行为/离线无依赖四要素。
- [ ] W3:`skills/drawio/evals/darwin-results.tsv` 存在,列结构与 academic 版一致,含 ≥1 行真实基线;`evals/README.md` 说明方法;W5 后追加 ≥1 行抽查结果且无回归(分数不降超过噪声说明)。
- [ ] W4:重跑审计孤儿脚本(留存于 research/)对两包报告 0 个孤儿(允许"目录级索引条目"计为已引用);索引文件本身被各自 SKILL.md 或路由表提及。
- [ ] W5:`wc -c` 达标(base ≤14,000B,academic ≤12,000B);两条 description 与 2.7.0 版本时逐字节相同;移出正文均能在目标 reference 中找到对应权威段落。
- [ ] W6:academic `.gitignore` 无失效注释;openai.yaml 决策已落地(文件或文档记录)。
- [ ] 全局:root `npm test` 445+ 全绿;`just ci` 通过;每个工作流独立 commit。

## Open Questions(评审门裁决)

1. `.mcp.json`:保留并文档化(推荐)还是移除出包?
2. 孤儿 doc `examples.md`(12.5KB)与 `drawio-aesthetic-guide.md`:删除、并入 design-system/,还是索引保留?
3. W5 体积目标 14KB/12KB 是否可接受为首期(yao-meta 理想值 1.3k tokens ≈ 5KB,需二期再评)?
4. openai.yaml:补 base 侧,还是文档记录 overlay-only?

## Notes

- 需求与验收的事实依据全部来自 `research/yao-meta-audit.md`,引用编号 F1–F8。
- 本任务为 complex:`design.md` 与 `implement.md` 必须在 `task.py start` 前完成并通过评审。

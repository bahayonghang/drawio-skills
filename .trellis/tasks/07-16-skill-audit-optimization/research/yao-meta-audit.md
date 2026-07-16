# yao-meta 审计报告 — skills/drawio 与 skills/drawio-academic-skills

- 审计日期:2026-07-16(分支 dev,工作区 clean)
- 审计模式:yao-meta audit/evaluate-only(只产出 findings + 修复建议,本报告不改动 skill 文件)
- 档位判定:两个 skill 均按 **Library** 档审计(公开 GitHub 分发、版本化、`just zip` 打包、MIT、有 evals 与治理测试)
- 被审版本:双 skill `2.7.0`(与 package.json 一致,由 `tests/skill-metadata.test.js` 契约保证)

## 证据采集命令(可复现)

- 结构与体积:`find skills/... -type f`、`wc -c skills/*/SKILL.md`
- 引用完整性 / 孤儿检测:临时脚本(提取两份 SKILL.md 中反引号路径逐一 `existsSync`;以 skill 内全部 md/yaml/json 为语料检查 references/ 下文件 basename 是否被提及)
- 契约基线:`npm test` → **445/445 通过,56 suites,4.6s(Windows)**
- 打包配方:`justfile` 的 `zip` recipe;跟踪状态:`git ls-files` / `git check-ignore`

## 总体结论

| Gate(Review Studio) | 状态 | 摘要 |
| --- | --- | --- |
| Intent Canvas | pass | 双方 job/输出/排除边界清晰;base Scope 与 overlay Boundary 显式互指 |
| Trigger Lab | pass | description 370+402=772 字符,≤800 联合门槛;26 条探针回归集已归档待复用 |
| Output Lab | **warn** | academic 有已记录 eval 结果(82.8→89.2);**base 只有 15 条 eval 定义、无任何运行记录** |
| Context Budget | **warn** | base SKILL.md 21,825B(≈5.5k tokens)、academic 17,448B(≈4.4k tokens),远超 yao-meta library 档 1,300 tokens 初始加载预算 |
| Resource Boundaries | **warn** | base 17 个、academic 6 个孤儿资源;`.mcp.json` 零文档提及 |
| Runtime Matrix | pass | 声明 macos/linux/windows;本机(Windows)全绿,含 desktop-detection/adapters/integration |
| Trust Report | **warn** | `.mcp.json` 经 `npx --yes` 运行时拉包(版本已 pin、无 integrity);vendored elkjs/licenses 出处齐全;security.test.js 绿 |
| Skill Atlas | pass | 双 skill 是设计好的 near-neighbor 对,互斥路由双向显式;探针集含 3 个固定干扰项 |
| Registry/打包 | **block** | `just zip` 用 `shutil.make_archive` 全目录打包,无排除规则 → 本地脏文件泄漏进发布包 |
| Release Notes | pass | 双 CHANGELOG 维护中(各有 Unreleased 段);`just version-check/version-sync` 工具链在位 |
| Operations Loop / Waivers / 盲评包 | missing evidence | 无 reports/、无 waiver 台账、无盲 A/B 评审包(见"缺失证据清单") |

**1 项 block、5 项 warn,其余 pass。** 修复映射见文末 W1–W6,对应任务 `prd.md`。

## 发现明细

### F1 · BLOCK · 发布打包无排除规则,本地脏文件会进 zip

- 证据:`justfile` zip recipe 对 `skills/<name>` 整目录执行 `shutil.make_archive`,无任何过滤;`skills/drawio/.drawio-tmp/` 现存 16 个本地文件(smoke/reg SVG、style-samples),已被根 `.gitignore:51` 忽略但 **make_archive 不读 gitignore**。
- 影响:发布 zip 混入回归渲染产物与临时文件;academic 侧本地若存在 `.playwright-mcp/`、`logs/`、`docs/superpowers`、`.last_update`(其自身 `.gitignore` 所列)同样泄漏。包体不可复现(依赖打包机器的本地状态)。
- 建议:zip 内容以 `git ls-files skills/<name>` 为准(只打包被跟踪文件),并在 recipe 内自校验(archive 名单中断言无 `.drawio-tmp/` 等)。

### F2 · WARN · `.mcp.json` 被跟踪但零文档提及,运行时 `npx --yes` 拉包

- 证据:`git ls-files` 确认 `skills/drawio/.mcp.json` 被跟踪;`grep -rn "mcp.json" skills/drawio --include="*.md"` 零命中(SKILL.md、mcp-tools.md 均未提及该文件本身);内容为 `npx --yes @next-ai-drawio/mcp-server@0.4.13`。
- 影响:包内存在一个不可发现的配置文件;版本虽 pin 但每次启动经 npx 网络拉取、无 integrity 校验;与 base "No MCP server is required" 的叙述之间缺一句解释(它是可选 live-refinement 的供给方式)。overlay 明文承诺 "Never create, require, or route through `.mcp.json`",对比之下 base 的沉默更显突兀。
- 建议(推荐 a):(a) 在 base SKILL.md Runtime Stack 的 live-refinement 行与 `references/docs/mcp-tools.md` 中各加一句,说明该文件的用途、pin 版本、网络行为、离线流程不依赖它;(b) 备选:从包中移除,改为 mcp-tools.md 里的手工配置说明。保留/移除属产品决策,评审门定夺。

### F3 · WARN · base evals 只有定义、无运行记录(missing evidence)

- 证据:`skills/drawio/evals/` 仅 `evals.json`(15 案例)+ `baseline-prompts.json` + fixtures;对比 `skills/drawio-academic-skills/evals/` 有 `darwin-results.tsv`(基线 82.8 → 89.2,2026-04-27,dry_run)+ `README.md` + `test-prompts.json`。academic `_runner` 声明:无自动 runner,逐断言人工/agent 验证。
- 影响:base 的输出质量主张无可复现证据;两包证据面不对称。
- 建议:按 academic 同款方法跑一次 base 15 案例基线,落 `evals/darwin-results.tsv`(同列结构)+ `evals/README.md`(方法说明)。**不得伪造——必须真实跑。**

### F4 · WARN · 孤儿资源:base 17 个、academic 6 个

- 证据(basename 在本 skill 任何 md/yaml/json 中从未出现):
  - base docs:`references/docs/examples.md`(12.5KB)、`references/docs/drawio-aesthetic-guide.md`;`references/docs/style-presets.md` 特殊——base 自身不提,但 **academic 路由表引用它**(跨包单向引用);
  - base 其他:12 个 `references/examples/*.yaml`(auto-layout-workflow、aws-vpc-topology、campus-lan-topology、cloud-reference-architecture、e-commerce、login-flow、neural-network、onprem-dmz-topology、replicated-brand-flow、swimlane-engineering-review、tiered-network-topology、vendor-device-mapping)、`references/examples/palettes/palette-swatch.template.yaml`、`references/palette.schema.json`(实际仅被 `scripts/dsl/palette.test.js` 使用,属未声明的测试契约);
  - academic:5 个 `references/examples/*.yaml`(ablation-study-pipeline、ieee-network-paper、industrial-architecture-cn-paper、research-pipeline、technical-roadmap-paper)+ `references/templates/neural-network-architecture-compact.yaml`。
- 影响:资源"看上去比实际更成体系"(yao-meta 反模式);agent 只能靠目录遍历发现示例,无 when-to-use 索引;个别 doc 疑似被 design-system/ 与 references/examples/ 取代的历史遗留。
- 建议:为两侧 `references/examples/`(与 academic `references/templates/`)建条目级索引(名称+适用场景一行);逐个裁决 3 个孤儿 doc(删除前先 grep scripts/ 与 root tests/ 确认无引用);`style-presets.md` 在 base 侧补一处提及;`palette.schema.json` 在 palettes README 加指针。

### F5 · WARN · SKILL.md 初始加载超预算

- 证据:base 21,825B ≈ 5.5k tokens、217 行;academic 17,448B ≈ 4.4k tokens、222 行(按 ~4B/token 估算)。yao-meta library 档初始加载预算 1,300 tokens。两文件逐行重复仅 3 行(>40 字符),"thin overlay" 在文本层成立,肥在各自内容:base 16 条编号运营规则(其中 13、14 已在 tokens.md / edge-quality-rules.md 有权威版本)、16 条 Reference Highlights(与路由表重叠);academic Quality Gate 14 条细则与 playbook 重叠。
- 影响:每次触发即支付 ~5k tokens;规则正文与 references 双源维护有漂移风险。
- 注意:行数远低于 Anthropic <500 行指引,且仓库自有 installer-limit 契约测试为绿——超的是 yao-meta 更严的预算。定位为"分阶段瘦身目标",非当下故障。
- 建议:首期 base ≤14KB、academic ≤12KB(细则正文移到已有的权威 reference,SKILL.md 留一行契约句 + 指针);description 本轮**不动**(避免触发探针回归门)。root 策略测试断言 SKILL.md 措辞,动文案前先建"测试断言 → 章节"映射。

### F6 · INFO · agents 打包目标不对称

- 证据:academic 有 `agents/openai.yaml` + `interface.yaml`;base 仅 `interface.yaml`。overlay 离开 sibling base 无法执行,单侧提供 OpenAI 目标意义存疑。
- 建议:补 base `agents/openai.yaml`,或在 CHANGELOG/文档记录"overlay-only 目标"的理由。

### F7 · INFO · academic `.gitignore` 过期注释

- 证据:注释 "Auto-update timestamp (written by SKILL.md step 0)" —— 现行 SKILL.md 已无 step 0 / 自动更新机制。
- 建议:删注释(及确认 `.last_update` 条目是否仍需保留)。

### F8 · INFO · CHANGELOG Unreleased 内容待发布

- 证据:两份 CHANGELOG 各有非空 Unreleased 段,版本停在 2.7.0。
- 建议:本任务修复合入后随下一版本号一并 cut(`just version-sync-to` + `version-check`),不单独处理。

## 健康项(无需修复,审计留证)

- 引用完整性:两份 SKILL.md 提及的全部路径存在(0 缺失),含 overlay → `../drawio/` 跨包路径。
- 触发面:772/800 字符联合预算内(余量 28);互斥路由双向声明;26 条探针回归集在 `.trellis/tasks/archive/2026-07/07-09-skill-desc-slim/research/trigger-probes.md`(classification-probe 法,规避 Windows run_loop 假 0% 召回缺陷)。
- 契约与版本:`npm test` 445/445 绿;版本三处同步(双 SKILL.md + package.json)有测试与 `just version-check` 双保险。
- 供应链出处:`assets/licenses/` 4 份上游许可证;`scripts/vendor/elkjs/` 带 LICENSE + README;运行时依赖仅 `js-yaml`(有 lockfile)。
- 安全基线:`tests/security.test.js` 覆盖标签注入、`!!python/object`、`!!js/function`、script 标签拒绝等,全绿。

## 缺失证据清单(missing evidence,如实标注、不补形式)

- 无 `reports/`(secret scan、output_quality_scorecard、trust report 均无独立工件)——root tests 部分覆盖其意图,Library 档记 warn,不建议为形式补齐。
- 无盲 A/B 评审包与 reviewer adjudication 记录。
- 无 adoption/telemetry(公开仓库、个人维护,暂不适用)。
- base eval 运行记录缺失 = F3(列入修复)。

## 修复方案映射(→ prd.md W1–W6)

| 工作流 | 发现 | 优先级 |
| --- | --- | --- |
| W1 打包卫生 | F1 | P0 |
| W2 `.mcp.json` 文档化 | F2 | P1 |
| W3 base eval 基线证据(瘦身前基线 + 瘦身后抽查) | F3 | P1 |
| W4 孤儿资源治理 | F4 | P1 |
| W5 SKILL.md 瘦身 | F5 | P2 |
| W6 小项(gitignore 注释 / openai.yaml / schema 指针) | F6 F7 | P2 |

F8 随发布流程处理,不设工作流。

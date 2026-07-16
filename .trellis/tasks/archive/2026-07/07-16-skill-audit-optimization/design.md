# Design — yao-meta 审计驱动的 drawio 双 skill 优化

事实依据:`research/yao-meta-audit.md`(F1–F8)。本设计只覆盖 W1–W6,不改任何渲染/CLI 行为。

## 总体边界

- 变更面 = `justfile`(打包配方)+ 两个 skill 的 markdown/YAML 文档 + base `evals/` 证据文件 + 可能的 `agents/openai.yaml` 新增。
- 不变面 = `scripts/`(全部 JS)、`assets/schemas/`、两条 frontmatter `description`、root `tests/` 的既有断言语义(除非 W5 有意识迁移,见下)。
- 执行顺序与回滚:`W1 → W2 → W4 → W3a(基线)→ W5 → W3b(抽查)→ W6`,每个工作流一个 commit,回滚 = `git revert` 对应提交;无迁移、无状态。

## W1 · 打包卫生(F1)

**方案**:重写 `justfile` 的 `zip` recipe——内容清单改为 `git ls-files -- skills/<name>`,用 `zipfile.ZipFile` 逐文件写入(arcname 相对 `skills/`,保持现有 zip 内部布局 `<skill>/...` 不变),替换 `shutil.make_archive` 的"整目录扫描"。

**配方内自校验**(违规即 `SystemExit(1)`):

1. 清单非空且包含 `SKILL.md`;
2. 清单中不含任何以 `.drawio-tmp/`、`.playwright-mcp/`、`logs/`、`docs/superpowers` 开头或含 `.DS_Store`、`.last_update` 的路径(防御 git 误跟踪);
3. 打包后重新读 zip namelist 与清单逐一比对。

**取舍**:

- `git ls-files` 语义 = "发布内容 == 已提交内容",这正是可复现目标;代价是"有意但未跟踪"的文件不会进包——接受,这类文件本就该先提交。
- 依赖 git 可用:仓库工作流已处处假设 git,不新增前置。
- 文件名含空格/非 ASCII:当前清单无此类路径,用 `text=True` + `splitlines()` 足够;配方注释注明此假设。
- 不新增 root 测试文件:自校验内置于配方,避免为打包再造一层 node 测试(简单优先)。`.mcp.json` 是被跟踪文件,按 W2 决策默认随包分发。

**验证**:`just zip` 后
`python -c "import zipfile;print('\n'.join(sorted(zipfile.ZipFile('drawio.zip').namelist())))"` 与 `git ls-files -- skills/drawio | sed 's|^skills/||'` diff 为空;academic 同理;`just clean-zip` 收尾。

## W2 · `.mcp.json` 文档化(F2)

**默认方案(保留并文档化)**,两处改动:

1. base `SKILL.md` Runtime Stack 表 "Live Refinement Backend" 行 Notes 单元格追加一句:provisioned via the tracked `.mcp.json`(pinned `@next-ai-drawio/mcp-server@0.4.13`,由 `npx` 启动时联网拉取);offline authoring 不读取该文件。
2. `references/docs/mcp-tools.md` 增加一小节 "Provisioning(`.mcp.json`)":文件位置、pin 版本、升级方式(改版本号)、网络/供应链注意(npx 运行时拉取、无 integrity 校验)、离线路径完全不依赖它。

**兼容红线**:保持既有短语 "No MCP server is required" 原样(compatibility 字段与策略测试可能引用);新增文字只做补充说明,不改既有句子。

**备选(评审改判移除)**:`git rm skills/drawio/.mcp.json`,配置示例整体移入 mcp-tools.md 供手工创建;SKILL.md 不提 `.mcp.json`。触发条件:评审门对 Open Question 1 选"移除"。

## W3 · base eval 证据(F3)

**方法**:逐字遵循 `skills/drawio-academic-skills/evals/README.md` 的评分与记录方法(该文件是既有权威;若其中有 academic 专属步骤,做最小同构替换并在 base `evals/README.md` 中注明差异)。执行体是一个 sub-agent(按 dispatch 协议带 `Active task:` 前缀),对 `evals/evals.json` 15 个案例逐条:执行 prompt → 按 `assertions` 清单逐项判定 → 汇总分数与最弱维度。

**产物**:

- `skills/drawio/evals/darwin-results.tsv`,列结构与 academic 完全一致:`timestamp  commit  skill  old_score  new_score  status  dimension  note  eval_mode`;
- `skills/drawio/evals/README.md`:方法、评分口径、复跑指引(镜像 academic 版结构)。

**两阶段**:

- **W3a 基线**(在 W5 之前):全量 15 案例,`old_score=-`、`status=baseline`、`eval_mode=dry_run`。
- **W3b 抽查**(在 W5 之后):≥5 个案例,覆盖 W5 移动过文本的路由(create、architecture/edge 规则、palette 询问门、replicate、export 回退),追加一行 `old_score=基线分`;若下降超出 note 中声明的噪声幅度,判定 W5 回归,回滚或修正 W5 后重跑。

**红线**:结果必须来自真实执行;任何跑不了的案例记 `missing evidence` 而非估分。Windows 下不用 skill-creator 的 run_loop/run_eval 管道(已知假 0% 召回缺陷)。

## W4 · 孤儿资源治理(F4)

**索引设计**(解决"只能目录遍历发现"):

- 新建 `skills/drawio/references/examples/README.md`:表格逐条列 21 个 YAML(文件 | 图类型 | 展示的主题/布局/特性 | 何时加载);palettes 子目录一行指向既有 `palettes/README.md`,并在该 README 中补 `palette-swatch.template.yaml` 与 `../palette.schema.json`(注明由 `scripts/dsl/palette.test.js` 强制)的指针。
- base `SKILL.md` Reference Highlights 中 `references/examples/: reusable YAML examples` 一行改指向该 README(与 W5 合并编辑,W4 阶段先建文件)。
- academic:`references/examples/` 7 个 YAML 与 `references/templates/` 2 个模板,在 `academic-figure-playbook.md` 的相应小节(Scientific Figure Patterns / Node Budget Management)以条目级列表点名;不新建独立 README(文件少,避免结构装饰)。

**孤儿 doc 裁决流程**(每个文件先过 grep 门:`grep -rn "<basename>" scripts/ tests/ skills/ docs/`,零引用才可删):

| 文件 | 预判 | 动作 |
| --- | --- | --- |
| `references/docs/examples.md`(12.5KB) | 疑似被 `references/examples/*.yaml` 取代的历史目录文档 | 内容比对:独有内容并入新 examples README,然后删除;若评审选"保留",改为在新 README 中链接 |
| `references/docs/drawio-aesthetic-guide.md` | 疑似被 design-system/ + architecture-diagrams.md 取代 | 同上,独有内容并入 design-system 对应文档 |
| `references/docs/style-presets.md` | **保留**(academic 路由表引用中) | 在 base SKILL.md Style Presets 段补一处指针,消除"仅被 sibling 引用"的单向依赖 |

**验收工具**:把审计用孤儿检测脚本固化为 `research/audit-orphan-check.mjs`(从临时脚本迁入,加"目录级索引条目视为已引用"的豁免规则),验收时重跑输出 0。

## W5 · SKILL.md 瘦身(F5)

**前置产物**:`research/policy-assertion-map.md`——逐个扫描 root `tests/*.test.js` 中的字符串断言,列出:断言短语 → 断言目标文件 → 命中的 SKILL.md 章节 → 处置(原样保留 / 随文本迁移并同步改测试)。**此映射未完成前不动任何文案。**

**瘦身手法**(仅这三类,防止语义漂移):

1. **细则正文下沉**:与既有权威 reference 重叠的规则正文收敛为"一行契约句 + 指针"。首批候选:base 规则 13(正文已在 `design-system/tokens.md § Text & Label Styling`)、规则 14(已在 `edge-quality-rules.md`)、规则 12(SVG 导出细节可入 `xml-format.md` 或 workflows);academic Quality Gate 中与 `academic-figure-playbook.md` 重叠的细则(node budget、font ladder、legend 形态)。
2. **Reference Highlights 收敛**:16 条列表与 Task Routing 表重叠部分删除,仅保留路由表覆盖不到的条目(或整段替换为指向 W4 新建 examples README + 路由表的两行)。
3. **表格压缩**:Runtime Stack 表 Notes 列的长句压缩(该表 4 行占位大)。

**红线**:frontmatter 整体(含 description)逐字节不动;每条被下沉的规则,其"契约句"必须保留可执行判定(如 "$$...$$ only" 这类硬约束不许只剩指针);Completion Report 与 Quality Gate 的清单骨架保留(它们是输出契约)。

**节奏**:先 base 后 academic;每完成一个文件即跑 `npm test` + `wc -c`;不达标继续按手法 1–3 迭代,不引入新手法。

**取舍**:目标定 14KB/12KB(≈35%/31% 削减)而非 yao-meta 理想 1.3k tokens——后者需要重构路由表本身,风险与本任务"行为不变"约束冲突,留二期。

## W6 · 小项(F6/F7)

- academic `.gitignore`:删除 "Auto-update timestamp (written by SKILL.md step 0)" 注释;`.last_update` 条目保留(无害防御)。
- openai.yaml:**推荐补 base `agents/openai.yaml`**,内容由 base `interface.yaml` 按 academic `openai.yaml` 的既有字段结构同构生成(两文件字段一致,只是 schema 形态差异),保持双包打包目标对称;若评审选"overlay-only",改为在两份 CHANGELOG Unreleased 记录理由一行。

## 风险与缓解

| 风险 | 缓解 |
| --- | --- |
| W5 移动文本破坏策略测试 | 断言映射先行;每文件即时 `npm test`;独立 commit 可单独 revert |
| W5 语义丢失(agent 不再遵守下沉规则) | 契约句保留硬判定;W3b 抽查以真实 eval 验证;回归即回滚 W5 |
| W3 手工评分主观漂移 | 严格沿用 academic README 口径;TSV note 记录判定依据;dry_run 标注 |
| W1 改动打包破坏既有消费方 | zip 内部布局(`<skill>/` 前缀)保持不变;仅内容清单收紧 |
| prettier hook 干扰 | 本任务不改 `.js`;justfile/md/yaml 不受该 hook 影响(若受,经 Bash 写入) |

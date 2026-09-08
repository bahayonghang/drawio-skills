# 常青项目与五套 harness 审查报告

审查日期：2026-09-07。仓库 dev / d03304a；工作区初始干净。
状态：**审查完成，改造计划待批准；未修复产品代码。**
范围：CLI/DSL/runtime、skill与overlay、公共说明、Trellis规则、测试及GitHub失败工作流。
采用主线程强模型及两个独立专家只读审查；未启动其它harness的付费推理或桌面UI。

## 1. 项目结构与数据流

| 位置 | 职责与关键文件 |
| --- | --- |
| skills/drawio | 唯一共享runtime；SKILL.md路由，scripts/cli.js命令入口，adapters/转换输入，dsl/校验/布局/输出，runtime/管理artifact/Desktop |
| skills/drawio-academic-skills | 学术政策、专属示例/模板、eval；依赖sibling ../drawio，共享运行时不复制 |
| tests 与 skills内 *.test.js | scripts/run-tests.js:63收集两处测试，交给Node test runner |
| docs 与 docs/zh | VitePress双语公共说明，docs/.vitepress/config.ts构建/导航 |
| scripts/version-sync.js | package.json版本为源，同步两个skill与eval版本；--check只读 |
| .trellis | 项目spec、阶段、任务、journal；本轮只创建父子规划 |
| .agents/.claude/.codex | 本机ignored配置/安装结果，不是tracked源码或fresh-clone保证 |
| .github/workflows | 当前只有release文档部署，无PR产品质量检查 |

核心边界：输入 → adapter/canonical projection → YAML/spec验证 → JS ELK布局 → draw.io/SVG renderer → artifact与可选Desktop导出。
harness负责选择并调用skill/CLI；模型负责规划与视觉判断。CLI成功不证明模型看过图，skill文件存在不证明当前会话已加载。

## 2. 本轮验证记录

环境：Windows PowerShell；Node 26.7.0，npm 12.0.2，just 1.58.0。
初次未安装项目node_modules；源码和lock在审查前后保持不变。

| 检查 | 实际结果 | 证据 |
| --- | --- | --- |
| npm test | exit 1；662总，659通过，1失败，2跳过，约12.1秒 | npm-test.log:929；失败在tests/integration.test.js:388 |
| 定向JS CLI集成测试 | 同样非0；缺 es-module-lexer@2.3.1 | node --test --test-name-pattern="CLI: code importer directory route" tests/integration.test.js |
| node scripts/version-sync.js --check | exit 0；版本同步2.8.0 | 当前命令输出 |
| npm run docs:build | exit 1；vitepress命令不可用 | 未进入实际文档编译 |
| npm ci | exit 1；EALLOWREMOTE，拒绝npmmirror uc.micro tarball；另有EPERM cleanup warning | npm-ci.log |
| npm exec --no -- markdownlint-cli ... | exit 1；缺包，npx取消，没有下载新版本 | lint未进入实际Markdown校验 |
| 当前源码学术YAML示例 --validate | exit 0；spec与XML校验通过 | system-architecture-paper.yaml，CLI stdout；无视觉/渲染外观结论 |
| just ci | 未执行 | 其version-sync会修改受检文件，本轮拆开只读检查 |
| 真实parser opt-in | 默认跳过2项 | code-parsers.integration.test.js:12；optional-python.integration.test.js:10 |
| GitHub | 最近10次查询均成功，最新2026-08-24是Pages动态部署；非当前HEAD质量证明 | gh run list；历史失败见下一节 |

复现命令（仓库根目录）：

```powershell
npm test
node --test --test-name-pattern="CLI: code importer directory route" tests/integration.test.js
node scripts/version-sync.js --check
npm run docs:build
npm ci
npm exec --no -- markdownlint-cli "docs/**/*.md" "skills/**/*.md" "README*.md" --ignore "skills/drawio/references/official/**" --ignore "skills/drawio/references/upstream/**" --ignore "skills/drawio/scripts/vendor/**"
```

npm ci仅尝试安装已有锁定依赖，留下ignored的未完成node_modules；没有修改lock/package，也没有修改allow-remote策略。后续完整安装与lint/docs成功仍是未取得证据。

## 3. 优先级发现与根因

### F1 · P1 · 源码2.8.0，当前harness安装入口仍为2.5.0
证据：skills/drawio/SKILL.md:3 与 .agents/skills/drawio/SKILL.md:3；academic同样分叉。
.agents两个目录是实体副本，.claude对应两个目录是指向.agents的Junction。
旧 .agents/skills/drawio/scripts/cli.js:56 只列yaml/mermaid/csv/drawio；新源码 skills/drawio/scripts/cli.js:133 列出新的code/config等格式。
根因：被测tracked源码与本机可发现安装目录是两套内容；测试只跑skills，不能证明本机安装最新。
追加同输入CLI对照：向两个入口传入带name: audit的单服务Compose配置；源码入口exit 0生成有效mxGraphModel，安装入口exit 1，在加载阶段因ambient js-yaml缺失报ERR_MODULE_NOT_FOUND。完整输出见source-compose.log/installed-compose.log。它验证了旧安装的实际执行故障，不等同于五harness新会话触发证明。
影响：从该入口触发会获得旧能力。各harness实际新会话触发仍UNVERIFIED，不把路径推断升级为端到端证明。
最小改造：差异审查后刷新/链接两个本机drawio入口；既有隔离安装测试补代表能力，不把ignored副本加入CI，不造同步引擎。
归属：rule-alignment。

### F2 · P1 · Claude Code规则入口断链，安装说明混淆产品和工具
根CLAUDE.md缺失；AGENTS.md:1 有项目工程规则。Claude官方明确其读取CLAUDE.md，推荐以@AGENTS.md导入共享规则。
README.md:93 与README_CN.md:94 使用Claude桌面产品路径，而非Claude Code的~/.claude/skills；
README.md:71、:97 的Codex路径沿用.codex/skills，当前官方是.agents/skills。
docs/guide/installation.md:56 与中文页镜像该问题；只覆盖Claude/Codex/Gemini，缺Grok/Kimi/OMP说明。
根因：将“能读取某种文件格式”和“正确发现该文件”混为一谈。
改造：tracked CLAUDE.md薄桥接；五工具安装/发现矩阵，按native/compat说明。
不因缺GROK.md/KIMI.md/OMP.md就增加同义规则，它们可利用AGENTS等已支持入口。
归属：rule-alignment + skill-doc-evidence。

### F3 · P1 · npm12默认策略与混合lock来源使安装失败
package-lock.json中135个resolved指向registry.npmjs.org、108个指向registry.npmmirror.com；
首个报错为 package-lock.json:3383 的uc.micro。
本机npm源码 @npmcli/config/lib/definitions/definitions.js:247 定义npm12 allow-remote默认none，非registry同host tarball被拒；当前registry是npmjs.org。
根因：锁文件下载host混合与npm12安全默认的确定性冲突。EPERM是失败清理时的附带warning，非首要安装拒绝原因。
改造：同版本、同integrity规范化公共registry来源；不关闭全局安全策略。修改前保留首轮失败，修改后做干净安装与完整检查。
归属：test-baseline。

### F4 · P1 · 默认测试对可选parser存在隐式硬依赖
tests/integration.test.js:388 无条件调用js-imports；
skills/drawio/scripts/cli.js:338 路由到parseJavaScriptImportsProject；
skills/drawio/scripts/adapters/js-code.js:23 动态加载es-module-lexer/js；
skills/drawio/scripts/adapters/code-common.js:162 把缺包映射OPTIONAL_DEPENDENCY_MISSING。
package.json:28 把它声明optional，而真实parser套件在code-parsers.integration.test.js:12有显式gate。
现象：缺可选包时测试失败；生产错误处理符合既有契约，不应吞错或将包改为强制runtime依赖。
改造：默认离线/真parser成功测试明确分层，保留缺依赖断言；CI显式执行真parser，不能简单skip使覆盖消失。
归属：test-baseline。

### F5 · P1 · 检查会改版本，且当前没有PR质量门禁
justfile:176 先version-sync再version-check；scripts/version-sync.js:86确实写文件。
AGENTS.md:27称ci为lint+test，不完整；.github/workflows/deploy-docs.yml:37只有install与docs-build。
根因：修复命令进入验证链；删除历史PR预览后没有独立产品质量检查。
改造：package.json提供npm run ci唯一只读入口，just代理；新增最小PR/push质量workflow，contents: read；release上传前复用gate，写权限仅deploy job，checkout不持久化凭据；不恢复PR评论。
Node20已被官方列为EOL，本地Node26为Current；拟Node24 LTS作为维护基线，须先验证锁定Tree-sitter，不能借升级声明虚构通过。
归属：quality-gates。

### F6 · P2 · Windows recipe仍使用不匹配的Unix命令
justfile:5选powershell.exe，但:71-73使用rm -rf，:146使用Unix tree参数。
根因：只替换shell，没有同步recipe命令语义。
改造：采用Node script recipe，不增加核心维护的Python依赖；在临时fixture测试范围与空格路径，保留sentinel。
独立审查确认Windows rm解析为Remove-Item但无-rf参数，tree解析为tree.com且无-L/-I参数。本轮不在真实仓库执行clean/rebuild。
归属：quality-gates。

### F7 · P2 · SKILL正文绑定Claude工具名，跨harness未定义降级
skills/drawio/SKILL.md:143、academic SKILL.md:58、academic-figure-playbook.md:131要求AskUserQuestion；
tests/palette-skill-policy.test.js:13、:17还固定该字面名称。
两份SKILL:23/:22的allowed-tools不会在五工具中产生同样权限语义。
改造：用宿主实际可用的单选提问能力，按宿主schema限制选项数；没有结构化工具时文字提问。
保留触发条件和已指定配色优先，去掉工具名元数据对可移植性的误导；测试检查语义而非Claude字面工具名。
归属：skill-doc-evidence。

### F8 · P2 · README/spec默认交付契约落后于SKILL
README.md:247、:251及中文镜像仍SVG默认、PNG可选；
两份SKILL分别:76与:45已规定drawio+300dpi PNG，Desktop缺失SVG fallback；
.trellis/spec/frontend/quality-guidelines.md:85仍列drawio+svg。
AGENTS.md:10亦将overlay资源范围描述得比当前专属示例/模板更窄。
改造：同步文档，不改正确的生产导出行为；保留期刊显式PDF/SVG矢量提交及sidecar工作目录。
归属：rule-alignment（AGENTS）+ skill-doc-evidence（公共/skill说明）。

### F9 · P2 · 多工具目录共存时Trellis自动选择Claude
.trellis/scripts/common/cli_adapter.py:803支持TRELLIS_PLATFORM，:937默认返回claude；当前未设置变量且.claude/.codex共存。
独立Python进程实测detect_platform(Path.cwd())返回claude；显式设置claude/codex/grok/kimi/omp逐一返回对应平台。
改造：共享说明记录显式平台调用和只读probe，不手改本仓库托管adapter/workflow；不意味着本轮task.py create产生了错误平台副作用。
归属：rule-alignment。

## 4. 历史失败工作流因果与当前状态

| run | 日志结论 | 当前关系 |
| --- | --- | --- |
| [28843884164](https://github.com/bahayonghang/drawio-skills/actions/runs/28843884164) | 文档构建成功，Comment PR调用issues.createComment报403 Resource not accessible by integration | 历史评论权限失败 |
| [28845416251](https://github.com/bahayonghang/drawio-skills/actions/runs/28845416251) | 同样在POST /issues/5/comments报403；非VitePress编译错误 | 历史相同失败 |
两份log已保存。本地git历史d1c4ccc尝试调整权限，ea0db75降级评论失败，d89ba94删除PR预览workflow。
当前缺口是独立只读质量门禁，不能把已删除的评论流程当现存阻断，也不需要恢复评论权限。
独立CI审查还核对了[22558567429](https://github.com/bahayonghang/drawio-skills/actions/runs/22558567429)与[22558567430](https://github.com/bahayonghang/drawio-skills/actions/runs/22558567430)：2026-03在setup-node cache:npm阶段因缺lockfile失败，尚未安装/构建。
38a0884添加lock后，同日[22558722846](https://github.com/bahayonghang/drawio-skills/actions/runs/22558722846)成功；因此历史缺lock已解决，不能与当前混合registry失败混为一谈。
当前release-only workflow没有对应发布运行证据；最新Pages内部动态部署成功不能证明它或当前HEAD质量通过。

## 5. 可批准任务与检查

| 子任务 | 优先级 | 主要拟修改 | 必须通过 |
| --- | --- | --- | --- |
| test-baseline | P1 | lockfile、integration/真实parser/隔离安装测试、parser spec | npm12干净安装、omit-optional默认套件、完整真parser成功及故意缺包负例 |
| quality-gates | P1 | package scripts、justfile、新ci.yml、deploy gate/权限/Node基线、quality spec、workflow fixture测试 | 版本漂移非0且不修复、Windows/Linux检查、无PR外部写权限、release-only不变 |
| rule-alignment | P1 | AGENTS、薄CLAUDE、隔离安装测试；经审查刷新本机两个ignored入口 | source与安装一致、引用有效、五CLI发现/新会话证据分级 |
| skill-doc-evidence | P2 | 双语README/安装页、SKILL按需矩阵/提问语义、导出spec/策略测试 | 安装/元数据/配色/导出策略测试，lint、docs-build、CLI示例 |

每个子任务已有prd.md、design.md、implement.md；父任务保留源需求/依赖/集成验收。
完整检查命令与文件责任在各子任务implement.md中，公共文件按依赖串行修改。
批准结果最终回写项目说明与skill库；本轮不改这些目标，也不把未经验证的新会话/视觉结论写成通过。

## 6. 审查边界
未验证：依赖完整安装后的全套通过、Node24 native parser、真实Desktop导出外观、五harness新会话端到端、当前HEAD远程CI。
未做：产品修复、升级依赖、解除全局策略、桌面操作、额外模型调用、提交/推送/发布。
本轮可批准的是上述最小改造范围，不是已修复声明。

## 7. 一手依据
- [Codex skills](https://learn.chatgpt.com/docs/build-skills)、[AGENTS](https://learn.chatgpt.com/docs/agent-configuration/agents-md)、[subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)。
- [Claude Code memory](https://code.claude.com/docs/en/memory)、[skills](https://code.claude.com/docs/en/skills)、[subagents](https://code.claude.com/docs/en/sub-agents)。
- [Grok skills/compatibility](https://docs.x.ai/build/features/skills-plugins-marketplaces)。
- [Kimi skills](https://moonshotai.github.io/kimi-code/en/customization/skills)、[agents](https://moonshotai.github.io/kimi-code/en/customization/agents)。
- [OMP context](https://github.com/can1357/oh-my-pi/blob/main/docs/context-files.md)、[task agents](https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md)。
- [Node release status](https://nodejs.org/en/about/previous-releases)。

## 8. 独立审查采纳记录
规则专家核对了五CLI版本、CLAUDE桥接、source/安装版本与Junction、安装路径、提问字段语义、Trellis平台检测；主线程复核关键文件与自动平台探针。
CI专家核对了ci副作用、Windows命令、历史失败、Node生命周期；采纳npm单一gate、Node维护命令、发布复用gate与job权限。
未采纳额外.npmrc配置层或manifest同步引擎：先用现有lock/安装边界解决已证实问题。没有把缺parser推断为生产解析器回归。
最终独立规划复核：无实质阻断，可提交用户审批；确认AC机制、共享文件串行归属及批准边界自洽。parser runner必须同时启用两个真实集成文件的opt-in条件，零skip且缺环境非0。
父子树机械预检：5个成员、22条AC均识别、无未定义ID或未覆盖需求、blocking=0；五份task.py validate全部通过。上述均为规划证据，产品测试仍保留659通过/1失败/2跳过的本轮结果。

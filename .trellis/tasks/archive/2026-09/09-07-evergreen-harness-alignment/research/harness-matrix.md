# 五套 harness 能力、分工与成本边界

日期2026-09-07；这是规划依据快照，不是永久能力保证。harness决定工具/上下文/权限路径，model决定推理能力与成本。
本机--version：Claude Code 2.1.263；Codex CLI 0.153.4；Grok Build 1.0.22 (8f40483ca2a5)；Kimi Code 0.41.0；OMP 18.1.12。
只读CLI版本/帮助与官方文档已核对；没有启动五套工具的付费推理、新会话或GUI。

## Capability matrix
| 工具 | 规则与skill入口 | 子代理与选模边界 | 本项目适合的强模型任务 |
| --- | --- | --- | --- |
| Claude Code | CLAUDE.md，薄@AGENTS.md桥接；.claude/skills，~/.claude/skills；本机skill Junction目前指旧.agents副本 | Agent与agent model/permissionMode；不能把SKILL allowed-tools当deny-list；新会话可用/memory核实规则 | 审查共享指令优先级、skill提问和出版政策；独立复核CI权限 |
| Codex | AGENTS.md层级；.agents/skills和~/.agents/skills；本机2.5副本 | 自定义agent TOML的model与model_reasoning_effort；未设置时通常继承；当前宿主工具schema与权限优先 | 主规划、代码边界/测试根因、源码到安装入口、一体化验收 |
| Grok Build | AGENTS家族及Claude兼容；native .grok/skills，user ~/.grok/skills与~/.agents/skills；本机可经.claude入口发现 | native subagents；SKILL allowed-tools不授予或限制权限，model/effort字段不应用；须使用native agent/model控制 | 作为独立强审查核对兼容误判、失败工作流的其它假设 |
| Kimi Code | 根AGENTS及native规则；当前支持.agents/skills与.kimi-code/skills | coder/explore等native agent；Claude agent model字段不能移植作选模配置，需自身模型池/调用接口 | 有界模块审阅、说明一致性复核；明确文件与测试的执行 |
| OMP（Oh My Pi） | 根AGENTS、native .omp及兼容provider；.agents/skills可发现，受启用provider影响 | Task agent model/role selector和modelRoles；role是否便宜取决于实际映射，不取决于smol名字 | 强review role用于独立审查；低成本role用于限定文件执行 |

Grok官方页面只明确user ~/.agents/skills；本规划不假定它直接扫描项目.agents，使用已明确的.claude兼容或.grok native路径。
缺.grok/.kimi/.omp目录不是缺能力证明；有目录/帮助输出也不是hooks信任或新会话加载成功证明。
五者不天然拥有相同browser/MCP/imagegen/Desktop能力。项目CLI保持离线可用；视觉判断只有在实际看到导出图后才能报告。

## Problem-to-worker routing
| 问题 | 规划/审查 | 可交低成本模型的执行 | 必须保留给强模型 |
| --- | --- | --- | --- |
| npm lock与可选parser测试 | Codex主审；Claude独立复核 | 同版本resolved修正、移动明确的测试、运行命令/摘取失败 | 错误归因、是否漏掉真parser、native依赖支持决定 |
| ci副作用与Windows范围 | Codex或Claude强模型；Grok独立复核 | 移除ci的sync依赖、按批准模板写workflow/fixture | 删除范围、权限、PR/release触发及失败传播 |
| 规则加载与旧skill入口 | Claude/Codex强模型；Grok/Kimi/OMP原生差异复核 | 已批准薄桥接、路径文档、临时安装fixture | 是否替换本机定制、工具字段语义、实际发现判定 |
| PNG/SVG与双语说明 | Claude/Codex强模型 | 双语同步、引用修正、保留断言的policy test更新 | publication矢量要求、视觉质量与证据判断 |
| 批准项回写 | 主线程强模型验收 | 证据表与链接整理 | 是否达成验收、哪些必须UNVERIFIED |

低成本候选：Codex gpt-5.6-luna（固定小项）或gpt-5.6-terra（扫描），Claude明确配置的Haiku；
OMP将执行role映射到账户实际更低成本的模型；Kimi coder是角色不是廉价型号；Grok也必须先确认native选模与账户计费。
不以模型营销别名、harness名称或“子代理”三个字推断便宜；未测五套工具在本项目上的准确率/时延/成本，不给伪量化排名。
强模型保留规划与最终审查，廉价worker只拿批准的输入、文件、输出和检查命令；失败回报，不自动扩范围。

## Evidence ladder
- 本轮确认：官方能力说明、本机版本/静态入口、source2.8与安装2.5差异、Node测试及失败日志。
- CLI discovery：只在确有无推理inspect/list命令且已跑时标PASS；其它仅--help不算。
- Fresh session：必须实际报告读取的规则/SKILL绝对路径、版本、代表能力和批准边界；本轮全部UNVERIFIED。
- Hooks/tool permissions：需要实际信任/加载和行为证据，不能凭配置文件存在判定。
- Desktop/image/visual：需要真实输出和视觉核验；本轮不触发。
- 模型费用：以实施账户/配置为准，本轮没有价格实测。

## Sources
[Claude memory](https://code.claude.com/docs/en/memory)；
[Claude skills](https://code.claude.com/docs/en/skills)；
[Claude agents](https://code.claude.com/docs/en/sub-agents)；
[Codex skills](https://learn.chatgpt.com/docs/build-skills)；
[Codex agents](https://learn.chatgpt.com/docs/agent-configuration/subagents)；
[Grok skills/compatibility](https://docs.x.ai/build/features/skills-plugins-marketplaces)；
[Kimi agents](https://moonshotai.github.io/kimi-code/en/customization/agents)；
[Kimi skills](https://moonshotai.github.io/kimi-code/en/customization/skills)；
[OMP context](https://github.com/can1357/oh-my-pi/blob/main/docs/context-files.md)；
[OMP role selection](https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md)。

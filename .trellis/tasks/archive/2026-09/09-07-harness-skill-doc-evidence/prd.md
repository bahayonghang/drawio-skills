# 统一skill发布说明与证据回写

## Goal
使公共说明、工程规范与当前skill交付契约一致，将批准结论按适用工具回写可携带skill资料。

## Background
README.md:247 与 :251 把SVG设为publication默认且PNG可选；skills/drawio-academic-skills/SKILL.md:45 已规定PNG300dpi默认与SVG fallback。.trellis/spec/frontend/quality-guidelines.md:85 仍列drawio+svg默认。两份README标题只Claude/Codex，installation未列其它三套。
属于父任务 evergreen-harness-alignment；当前只规划，用户批准后实施。

## Requirements
- R1：README/安装页覆盖五工具，Codex路径与当前发现机制一致，区分harness能力与模型档位，不把无依据别名写成长期保证。
- R2：README/规范采用当前SKILL的PNG300dpi默认、无Desktop的SVG fallback、sidecar工作目录以及publication显式矢量导出契约。
- R3：维护一份skill内可携带的五工具矩阵，链接官方依据和检查日期，并逐项记录已验证/UNVERIFIED；项目说明只引用，避免五份复制。
- R4：提问语义不硬编码Claude专属AskUserQuestion；使用宿主实际提供的提问工具，工具不存在时允许普通文字提问，不让frontmatter假装授予权限。

## Acceptance Criteria
- [x] AC1 (R1): README中英与installation中英均有五工具入口或指向同一矩阵，Codex .agents/skills 路径正确，说明如何验证实际发现；低成本执行候选与强模型审查分工明确。
- [x] AC2 (R2): README与quality spec不再与两份SKILL的默认交付契约冲突；保留用户显式格式请求优先、journal/IEEE矢量要求、sidecar路径及缺Desktop诚实fallback。
- [x] AC3 (R3): 每个批准子项记录适用工具、源码位置、检查/测试证据与剩余缺口；skill-only安装后仍能读取矩阵，academic通过../drawio引用，不复制base资料。
- [x] AC4 (R1,R2,R3): 相关安装/元数据/导出策略测试通过，Markdown lint和docs build通过；至少一个离线CLI导出示例通过结构校验，未执行Desktop或视觉检查不记为pass。
- [x] AC5 (R4): base/academic/playbook中的配色提问改为宿主中性描述，保留触发条件与显式用户配色优先；palette策略测试覆盖无结构化提问工具的文字路径。

## Dependencies
rule-alignment与quality-gates契约确定后整合；修改共用quality spec和安装测试须串行接续，不覆盖前面任务。

## Out of scope
不重写生产渲染/解析架构，不增加通用同步或验证框架，不改全局配置，不自动推送/发布。

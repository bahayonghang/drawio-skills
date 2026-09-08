# Implementation plan

## Approval and order
保持planning；用户批准后才激活本子任务。
rule-alignment与quality-gates契约确定后整合；修改共用quality spec和安装测试须串行接续，不覆盖前面任务。

## Work
- [x] R1：README/安装页覆盖五工具，Codex路径与当前发现机制一致，区分harness能力与模型档位，不把无依据别名写成长期保证。
- [x] R2：README/规范采用当前SKILL的PNG300dpi默认、无Desktop的SVG fallback、sidecar工作目录以及publication显式矢量导出契约。
- [x] R3：维护一份skill内可携带的五工具矩阵，链接官方依据和检查日期，并逐项记录已验证/UNVERIFIED；项目说明只引用，避免五份复制。
- [x] R4：提问语义不硬编码Claude专属AskUserQuestion；使用宿主实际提供的提问工具，工具不存在时允许普通文字提问，不让frontmatter假装授予权限。
- [x] 强模型按PRD各AC逐项核验，保留失败及未执行记录。
- [x] 将批准结论按适用工具回写 owning spec/说明；公共文档由父任务协调避免并行冲突。

## Files
README.md；README_CN.md；docs/guide/installation.md；docs/zh/guide/installation.md；.trellis/spec/frontend/quality-guidelines.md（quality-gates后顺序更新）；新增 skills/drawio/references/docs/harness-compatibility.md；两份 SKILL.md 仅加入按需引用；tests/visual-verification-policy.test.js、tests/skill-installation.test.js 按有意义契约扩展。；skills/drawio-academic-skills/references/docs/academic-figure-playbook.md；skills/drawio/references/workflows/create.md；tests/palette-skill-policy.test.js。

## Checks
- node --test tests/visual-verification-policy.test.js tests/drawio-academic-skill.test.js tests/palette-skill-policy.test.js tests/skill-installation.test.js tests/skill-metadata.test.js。
- 审核EN/CN路径、格式请求与缺Desktop行为；只测会造成工作流错误的契约，不锁整段文案。
- node skills/drawio/scripts/cli.js skills/drawio-academic-skills/references/examples/system-architecture-paper.yaml <temporary-output>.svg --validate --write-sidecars --sidecar-dir <temporary-workdir>。
- just lint；npm run docs:build；node scripts/version-sync.js --check；npm test；git diff --check。
- 如果实际没有Desktop/视觉、新会话模型或远程CI证据，最终记录UNVERIFIED；无需为文档修正自动调用这些能力。

## Cost and escalation
强模型Claude/Codex审查交付语义与证据边界；低成本Codex Luna/Claude Haiku/Kimi coder/OMP smol（账户实际可用时）适合双语同步、引用修正、fixture。强模型最终确认，不把model名写成能力保证或测量过的价格结论。
范围、依赖版本或外部成本发生实质变化时报告具体变更；不将未知项自动通过。

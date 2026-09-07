# Implementation plan

## Approval and order
保持planning；用户批准后才激活本子任务。
用户批准后可执行；输出安装/测试契约供 quality-gates。

## Work
- [x] R1：公共依赖锁文件来源与配置的 npm registry 一致，保持现有版本和 integrity，不改全局 allow-remote。
- [x] R2：默认离线测试不隐式依赖可选 JS parser；缺依赖错误仍有确定性测试，真 parser 成功路径必须在专门验收中执行。
- [x] R3：以 Node 24 LTS 拟议维护基线验证锁定 parser；记录 Node 26/npm 12 复现结果及 Python/native 依赖证据，不能把 skip 当成功。 Node 24 **UNVERIFIED**；Node 26/npm 12 与隔离 Python 已记录。
- [ ] 强模型按PRD各AC逐项核验，保留失败及未执行记录。
- [x] 将批准结论按适用工具回写 owning spec/说明；公共文档由父任务协调避免并行冲突。

## Files
package-lock.json；tests/integration.test.js；skills/drawio/scripts/adapters/code-parsers.integration.test.js；tests/skill-installation.test.js。package.json scripts 与 scripts/run-tests.js：新增 npm run test:parsers，复用现有runner设置opt-in且缺必要Python环境时非0，不改依赖版本。规范回写 .trellis/spec/drawio-skill/code-importers.md。

## Checks
- [x] npm ci（完整依赖），保留退出码及安装日志。 `research/npm-ci-ac1.log` exit 0。
- [x] 在独立临时 checkout 执行 npm ci --omit=optional、npm test。 `research/npm-test-omit-optional.log` exit 0。
- [x] node --test tests/skill-installation.test.js tests/integration.test.js。 `research/skill-installation-integration.log` exit 0。
- [x] npm run test:parsers：完整安装并指定隔离DRAWIO_TEST_PYTHON后执行；真实code/config parser全部实际执行、零skip；故意缺parser环境必须非0。 `research/test-parsers.log` exit 0；`research/test-parsers-missing-python.log` exit 1；`research/test-parsers-missing-packages.log` exit 1 / 0 skip。
- [x] 使用既有 skills/drawio/scripts/adapters/python/requirements.txt 的隔离 Python，设置 DRAWIO_TEST_PYTHON 后运行 optional-python.integration.test.js。 `research/optional-python.log` exit 0。
- [x] node scripts/version-sync.js --check；git diff --check；检查 lock 版本/integrity对照。 均为 exit 0；`research/lockfile-compare.json`。
- [ ] Node 24 真 parser：**UNVERIFIED**（`research/node24-evidence.md`）。

## Cost and escalation
强模型 Codex 负责 npm/模块加载/测试边界设计与最终审查，Claude Code 强模型独立复核缺依赖与真 parser 覆盖。低成本 worker 可改锁文件来源、搬移已指定测试及整理日志；不得擅自 skip、升级依赖或裁定 ABI 支持。
范围、依赖版本或外部成本发生实质变化时报告具体变更；不将未知项自动通过。

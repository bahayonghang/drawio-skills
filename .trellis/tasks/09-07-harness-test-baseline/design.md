# Design

## Contract
将 lock 的公共下载来源规范化到 registry.npmjs.org，仅重建 resolved 地址；核对每条 name/version/integrity，没有依赖升级或宽泛重新解析。
将无条件 JS CLI 成功测试移至显式真实 parser 验收，沿用 DRAWIO_TEST_CODE_PARSERS；npm run test:parsers通过现有scripts/run-tests.js的--code-parsers参数设置开关并仅运行两个真实parser集成文件，缺少明确DRAWIO_TEST_PYTHON时直接失败，不捕获异常后skip。不改默认npm test的发现范围。
扩展现有隔离安装测试，在临时 skills 副本中断开 ambient parser 包，验证基础 YAML 成功和可选路由精确失败。
真解析器验收保留 CLI→adapter→canonical projector→validation→renderer 的端到端成功测试，不能仅检查 import 成功。
先在 Node 24 下跑现有锁定 native parser。若确需改变 parser 版本或新增构建依赖，停止该分支并提出具体升级计划；继续独立文档/默认测试工作。

## Owning files
package-lock.json；tests/integration.test.js；skills/drawio/scripts/adapters/code-parsers.integration.test.js；tests/skill-installation.test.js。package.json scripts 与 scripts/run-tests.js：新增 npm run test:parsers，复用现有runner设置opt-in且缺必要Python环境时非0，不改依赖版本。规范回写 .trellis/spec/drawio-skill/code-importers.md。

## Harness and model routing
强模型 Codex 负责 npm/模块加载/测试边界设计与最终审查，Claude Code 强模型独立复核缺依赖与真 parser 覆盖。低成本 worker 可改锁文件来源、搬移已指定测试及整理日志；不得擅自 skip、升级依赖或裁定 ABI 支持。

## Requirements trace
- AC1 ← R1：由上述对应边界及 implement.md 检查验证。
- AC2 ← R2：由上述对应边界及 implement.md 检查验证。
- AC3 ← R2：由上述对应边界及 implement.md 检查验证。
- AC4 ← R3：由上述对应边界及 implement.md 检查验证。

## Evidence / rollback
运行必须记录环境、命令、退出码；缺证据保持UNVERIFIED。出错只回退本子任务改动，保护其它任务和用户文件。

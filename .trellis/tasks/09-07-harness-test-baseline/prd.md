# 恢复可复现安装与可选解析器测试边界

## Goal
恢复符合 npm 当前策略的安装及默认测试；显式区分离线能力与真实可选解析器能力。

## Background
tests/integration.test.js:388 无条件进入真实 JS parser；skills/drawio/scripts/adapters/code-parsers.integration.test.js:12 已有 opt-in gate；package.json:28 声明 optionalDependencies。package-lock.json:3383 固定 npmmirror uc.micro 下载地址。本轮 npm test 659 pass / 1 fail / 2 skip；npm ci 报 EALLOWREMOTE。
属于父任务 evergreen-harness-alignment；当前只规划，用户批准后实施。

## Requirements
- R1：公共依赖锁文件来源与配置的 npm registry 一致，保持现有版本和 integrity，不改全局 allow-remote。
- R2：默认离线测试不隐式依赖可选 JS parser；缺依赖错误仍有确定性测试，真 parser 成功路径必须在专门验收中执行。
- R3：以 Node 24 LTS 拟议维护基线验证锁定 parser；记录 Node 26/npm 12 复现结果及 Python/native 依赖证据，不能把 skip 当成功。

## Acceptance Criteria
- [x] AC1 (R1): 在 npm 12 默认 allow-remote=none、registry.npmjs.org 的干净临时 checkout 中 npm ci 退出 0；安装前后 package.json/package-lock.json 无非计划变化，版本/integrity与基线相同。
- [x] AC2 (R2): 仅 devDependencies 的 npm ci --omit=optional 后 npm test 无失败；隔离安装用例确认 YAML 可用、js-imports 明确 OPTIONAL_DEPENDENCY_MISSING。
- [x] AC3 (R2): 完整安装后 DRAWIO_TEST_CODE_PARSERS=1 的真实解析器和 JS CLI 成功用例执行且通过；故意移除该临时环境 parser 时该验收退出非0，不以 skip 通过。
- [ ] AC4 (R3): Node 24 下真实 JS/Go/Rust/Python AST 全部执行，有环境版本和输出；HCL/SQL 使用既有 requirements.txt 的隔离 Python 显式启用，未取得任一证据不得称全套通过。 **Node 24 UNVERIFIED**（本机仅 Node 26.7.0 / 25.9.0）。HCL/SQL 隔离 Python 与 Node 26 真 parser 已执行，见 `research/verification-summary.md`。

## Dependencies
用户批准后可执行；输出安装/测试契约供 quality-gates。

## Out of scope
不重写生产渲染/解析架构，不增加通用同步或验证框架，不改全局配置，不自动推送/发布。

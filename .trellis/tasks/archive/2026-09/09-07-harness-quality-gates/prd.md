# 建立只读质量门禁与跨平台检查

## Goal
让同一检查入口真实报告失败且不修改源码，在 PR 阶段验证功能而保留仅 release 部署。

## Background
justfile:176 的 ci 依赖 version-sync；justfile:69 的 clean 使用 rm -rf，而 justfile:5 选 powershell.exe；justfile:146 使用类 Unix tree 参数。.github/workflows/deploy-docs.yml:5 仅 release，:37 npm ci、:40 docs build，没有产品测试。历史 PR 403 是已移除的评论步骤问题，不能恢复旧流程。
属于父任务 evergreen-harness-alignment；当前只规划，用户批准后实施。

## Requirements
- R1：npm run ci 是唯一只读入口，包含version-check/lint/default tests/真实parser/docs-build；just ci仅代理，version-sync保留显式修改命令。
- R2：PR 与 dev/main push 有最小只读质量作业，Linux/Windows 跑默认和真实 parser 检查；部署维持 release published。
- R3：Windows clean/tree 示例使用可执行且有明确范围的跨平台实现，所有删除验证仅在受控 fixture 内进行。

## Acceptance Criteria
- [x] AC1 (R1): 在临时副本故意制造 skill/package 版本不一致，just ci 非0退出且漂移原样保留；一致时质量检查通过，tracked 文件前后不变。 证据：`research/ac1-drift.meta.json`（npm/just exit 1，hashes unchanged）；一致工作区 `just ci` exit 0 且 `research/tracked-hash-compare.json` changed=[]。
- [x] AC2 (R2): 新质量workflow仅contents: read，不申请评论写权限；PR/push运行同一npm gate，release上传前复用gate且写权限仅deploy job具有，触发仍release-only；所有 Python/JS/Go/Rust 真 parser job 有执行证据或明确 UNVERIFIED。 本地 Node 26 `test:parsers` 3 pass / 0 skip（`research/just-ci.log`）。Linux/Windows GitHub Node 24：**UNVERIFIED**（`research/unverified.md`，未 push）。
- [ ] AC3 (R2): Node 24 拟议 CI 基线在 Windows/Linux 验证；Node20旧说明更新为已验证基线，未验证版本不虚构支持。 Workflow 已 pin Node 24；本机 Node 24 **UNVERIFIED**。quality-guidelines 已将 Node 20 记为旧 Actions pin（EOL），不是当前保证。
- [x] AC4 (R3): Windows fixture 中 clean 只移除预期 docs dist/cache 和 node_modules，保留同级 sentinel；tree 正常列出，路径含空格也通过；不在真实工作区执行 clean/rebuild。 `tests/workflow-contract.test.js` exit 0。

## Dependencies
依赖 test-baseline 安装与 Node24/parser 证据；不依赖 rule-alignment 的本机安装操作。先修改 quality-guidelines，后由 skill-doc-evidence 顺序补导出说明。

## Out of scope
不重写生产渲染/解析架构，不增加通用同步或验证框架，不改全局配置，不自动推送/发布。

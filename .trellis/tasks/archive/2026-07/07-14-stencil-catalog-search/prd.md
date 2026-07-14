# stencil 目录扩容与离线 search 查询命令

父任务：`07-14-drawio-ai-kit-integration`（需求集与集成验收见父 prd 及其 `research/`）。执行顺序：本任务为三个子任务中的**第一个**，后两个子任务依赖本任务的目录、搜索能力与共享映射模块。

> 2026-07-14 修订：吸收 Codex 审阅。数据源与现有目录同上游（jgraph/drawio-mcp shape-index），按唯一 `shape=`/`resIcon=` 的平铺提取**不会**带来增长；真实扩容空间在（a）**参数化条目**——索引含 365 条 `prIcon=` 条目（`mxgraph.kubernetes.icon2` 39 个、`mxgraph.cisco19.rect` 149 个、`mxgraph.aws4.productIcon` 132 个）与 19 个 `grIcon`，现提取方式把它们坍缩成单条；（b）**前缀拓宽**——索引共 6459 个唯一 shape 名、40+ 前缀，现目录只筛 7 个（`mscae` 148 条是 Azure 补充库）。azure 原生 87 / gcp2 110 即 draw.io 上游全部，不承诺原生增长。

## Goal

补齐 `skills/drawio` 的离线 stencil 目录（重点：参数化家族提取，让 k8s 从 1 条可用变为约 39 条），抽出共享 icon 映射模块，并新增 `search` CLI 子命令——建立"先查后写"闭环的基础设施。对标 `ref/drawio-ai-kit` 的 catalog + `drawio-ai search` 机制。

## Requirements

### R1 目录重建（含参数化家族）

- 数据源：`ref/drawio-ai-kit/data/shape-index.json.gz`（10,446 条，jgraph/drawio-mcp，Apache-2.0；含 style verbatim / title / tags），vendor 进本仓库。
- 目录格式 v2 必须表达**参数化家族**：`{base shape, 参数键(prIcon/grIcon/resIcon), 合法参数值集}`。平铺名与家族参数值都可校验、可搜索。
- 前缀范围：既有 7 前缀（aws4/gcp2/azure/kubernetes/cisco/cisco19/networks）保持；新增 `mscae`（Azure 补充，148 条）进入**可搜索+可校验**范围。其余前缀（office/rack/veeam/alibaba_cloud…）本期不进目录，记入 design 的后续清单。
- 条目带可搜索元数据（title/tags）；gzip 体积实测记录（现 11.3 KB，估算上限见 design.md）。
- 提供可复现的纯 Node 生成脚本，产物提交进仓库；不引入 Python。

### R2 共享 icon 映射模块（Codex 发现 2）

- 把 `ICON_PREFIXES`、`ICON_ALIASES`、`resolveIconShape`（现为 `spec-to-drawio.js:892/902/1023` 的私有/导出成员）抽到独立模块（如 `dsl/icon-mappings.js`），统一负责：正向解析（spec 写法→mxgraph 名）、别名纠错、**反向映射**（mxgraph 名→spec 写法，search 输出用）。
- `spec-to-drawio.js` 改为 import 并 re-export（既有外部 import `resolveIconShape` 的调用方不破坏）；后续 `catalog-search.js` 与校验任务都 import 此模块，**不得**形成 `spec-to-drawio.js ↔ catalog-search.js` 循环依赖。

### R3 k8s 参数化发射修复

- 现状 bug：`k8s.pod` → `mxgraph.kubernetes.pod`（平铺名，不存在，Desktop 渲染空白框）。修复：`k8s.*` 走参数化发射 `shape=mxgraph.kubernetes.icon2;prIcon=<value>`（比照既有 aws4ResourceIcon compound 路径），`resolveShapeNameKind` 增加对应 kind。
- `mxgraph.aws4.productIcon` / `mxgraph.cisco19.rect` 家族：进目录、可搜索、可校验；spec 发射支持为可选加分项（不阻塞验收）。

### R4 离线 search 子命令

- `node scripts/cli.js search <query>`：离线检索目录；加权打分（exact 名称 > 名称 token > title/tags）；逗号批量；`--prefix` 过滤；compact 输出含**该名字在本 skill YAML 中的正确写法**（经共享映射模块反查，参数化家族输出 `k8s.pod` 这类写法）；无结果时给近似建议、退出码区分。

### R5 兼容与合规

- `resolveShapeNameKind`、`validateShapeReferences` 既有语义不回退（新 kind 只增不改）；catalog 格式变更同步加载器与测试。
- `assets/licenses/` 增补 shape-index 数据源 Apache-2.0 attribution。运行时依赖保持仅 `js-yaml`。

## Acceptance Criteria

- [ ] `node scripts/cli.js search pod --prefix kubernetes` 离线返回真实条目且给出 `k8s.pod` 写法；`search "s3, lambda, nat gateway"` 一次返回三组结果。
- [ ] kubernetes 可用（可校验+可搜索）条目 ≥ 30（参数化提取，约 39）；`mscae` 148 条进入目录；cisco19 家族参数值进入目录；`aws4` 既有条目不丢失。azure 原生 87 / gcp2 110 维持（上游即全部，不作为增长验收）。
- [ ] 含 `k8s.pod` 的 YAML 生成的 `.drawio` 中样式为 `shape=mxgraph.kubernetes.icon2;prIcon=pod` 形态（Desktop 打开非空白框）。
- [ ] 共享映射模块落地：`grep` 确认 `ICON_PREFIXES/ICON_ALIASES` 单一定义点；`spec-to-drawio.js` re-export 兼容；无循环依赖（`node --test` 全绿即隐含验证）。
- [ ] 生成脚本可复现（重跑逐字节一致）；新模块均有 `node --test` 测试；根 `npm test` / `just ci` 全绿。
- [ ] `assets/licenses/` 含数据源 attribution。

## Notes / Constraints

- 编辑 `scripts/*.js` 走 Bash 写入，避开 PostToolUse prettier 重排（memory `drawio-skills-format-hook-conflicts`）。
- 不改 SKILL.md frontmatter description。SKILL.md 正文/workflow 的 search 用法说明归子任务 `07-14-search-first-workflow-docs`。
- 勿在 `ref/` 内写任何文件。

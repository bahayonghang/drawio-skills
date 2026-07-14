# 整合 drawio-ai-kit 防幻觉与质量校验特性到 drawio skill

## Goal

将 `ref/drawio-ai-kit`（零依赖 Node CLI，靠真实 stencil 目录 + 静态校验器 + 声明式布局治 AI 编造 shape ID）中可迁移的防幻觉与质量能力，整合进 `skills/drawio`（及其 overlay `skills/drawio-academic-skills`），核心补齐三块：

1. **完整离线 stencil 目录 + 查询命令**（先查后写的基础设施）；
2. **未知 stencil 校验闭环**（默认拒绝 + 搜索建议，而非仅 warning）；
3. **先查后写工作流规则 + 精选审计规则文档化**。

## Background（差距分析结论）

> 2026-07-14 修订（Codex 审阅 + 复核）：kit 的 `data/shape-index.json.gz` 与现有目录**同上游**（jgraph/drawio-mcp），按唯一 `shape=`/`resIcon=` 的平铺提取不产生任何增长。真实扩容空间经复核确认为：**参数化条目**（索引含 365 条 `prIcon=`：kubernetes.icon2→39 值、cisco19.rect→149 值、aws4.productIcon→132 值，另 19 个 `grIcon`，均被平铺提取坍缩成单条）与**前缀拓宽**（`mscae` 148 条为 Azure 补充库）。azure 原生 87 / gcp2 110 即 draw.io 上游全部，不承诺原生增长。连带发现：现 resolver 把 `k8s.pod` 解析成不存在的平铺名 `mxgraph.kubernetes.pod`（应为 `shape=mxgraph.kubernetes.icon2;prIcon=pod`），修复归子任务 1。

对照分析（2026-07-14，两个探索代理报告，原文见本任务 `research/`）：

- 现有 `skills/drawio` 已具备：elkjs 自动布局（vendored）、45+ 语义 shape 预设、icon-resolver 前缀映射 + 别名纠错、白名单 `shape-catalog.json.gz` + `validateShapeReferences` **warning 级**校验、丰富的 spec 软校验（edge quality / label fit / color scheme 等）。
- 关键缺口：
  - 白名单覆盖极不均衡：aws4 599 / cisco 291 / gcp2 110 / azure 87 / networks 58 / cisco19 38 / **kubernetes 仅 1**；覆盖前缀之外不校验。
  - 离线路径**没有任何图标查询工具**（`search_shape_catalog` 只存在于 MCP/live 后端文档），AI 只能"先写后被 warning 兜底"。
  - 未知 stencil 默认只 warning（`--strict` 才升 error），且不给纠正建议。
- drawio-ai-kit 的对应设计（可迁移）：verbatim 真实索引（10,446 shape，jgraph/drawio-mcp，Apache-2.0）→ 加权打分 `search`（支持逗号批量、compact 省 token 输出）→ `validate` 对未知 stencil 报错并附搜索建议 → rules/principles 教学式规则下发。

## Task Map（子任务）

| 子任务 | 交付物 | 依赖 |
|---|---|---|
| `07-14-stencil-catalog-search` | 目录 v2（参数化家族提取，k8s≈39 值；新增 mscae）+ 共享 icon 映射模块 + `cli.js search` 离线查询 + `k8s.*` 参数化发射修复 | 无 |
| `07-14-stencil-validate-hardening` | `validateShapeReferences` 新契约 `{errors,warnings}`：未知 stencil 默认 error + top-N 建议；aws4 resourceIcon 生成样式补 `aspect=fixed` | 依赖 catalog+search+映射模块落地 |
| `07-14-search-first-workflow-docs` | SKILL.md/workflows/design-system 写入"先查后写"规则与精选审计规则 | 依赖前两者的最终命令名与行为 |

执行顺序：catalog-search → validate-hardening → workflow-docs。顺序写在各子任务 prd 中，父任务不做实现，只负责需求集、跨子任务验收与最终集成评审。

## Cross-child Acceptance Criteria（集成验收）

- [ ] 端到端：一个含编造图标名（如 `aws.s3_bucket_magic`、`k8s.podd`）的 YAML，默认（非 `--strict`）被 CLI 拒绝，错误信息含可用的搜索建议；按建议修正后成功生成 `.drawio`，在 draw.io Desktop 打开无空白框。
- [ ] `node scripts/cli.js search pod --prefix kubernetes`（离线、无网络）返回真实条目并给出 `k8s.pod` 写法；k8s 可用（可校验+可搜索）条目从 1 提升到 ≥30（参数化家族提取）；含 `k8s.pod` 的 YAML 生成参数化样式、Desktop 打开非空白框。azure/gcp 原生条目维持上游全量（87/110），不作为增长验收。
- [ ] `skills/drawio/SKILL.md` 含"先查后写"默认规则；`drawio-academic-skills` overlay 不复制 base 运行时（既有契约测试保持绿）。
- [ ] 根 `npm test`（`node scripts/run-tests.js`）与 `just ci` 全绿，包括 `visual-verification-policy`、`drawio-academic-skill`、`security`、`integration` 等策略契约测试。

## Constraints

- **纯 Node**：不引入 Python 运行时依赖（kit 的 ingest 是 Python，本仓库重写为 Node 脚本或一次性生成后提交产物）；运行时依赖保持仅 `js-yaml`。
- **许可**：`shape-index` 数据源为 Apache-2.0（jgraph/drawio-mcp），需在 `assets/licenses/` 补 attribution；不复制 drawio-ai-kit 的 MIT 代码，仅借鉴机制思路，如需引用具体实现须注明来源。
- **向后兼容**：现有 YAML 示例、academic 模板、`--strict` 语义不回退；新增硬校验须提供降级开关。
- **不改 SKILL.md frontmatter description**（避免触发 26 条触发探针门槛，见 memory `drawio-skills-desc-probe-set`）；如确需改 description，先跑探针集。
- **不做**（明确排除）：
  - 不引入 kit 的布局引擎/A\* 边路由（已有 elkjs + 确定性布局，重复造轮子）；
  - 不引入 render→PNG 视觉自检循环（与根 `visual-verification-policy` 的"优先导出物"措辞存在冲突风险，留作后续独立评估）；
  - 不新建独立 skill、不改动 skill 分发镜像（`.agents/`、`.claude/`、`.codex/` 由既有同步机制处理）；
  - 不整合 kit 的 7 拓扑类型/theme.mjs 设计令牌（与现有 11 主题体系冲突，收益低）。
- 用户既有画图硬性偏好不受影响（透明文本框、原生绑定连线、Times New Roman+SimSun、默认 Open 箭头等，见 memory `drawio-diagram-user-preferences`）。

## Notes

- **激活顺序（显式）**：当前 Trellis 指针停在最后创建的文档子任务上，不可依赖 fallback 指针。修订评审通过后必须显式执行 `python ./.trellis/scripts/task.py start`（目标 `07-14-stencil-catalog-search`），再按 catalog-search → validate-hardening → workflow-docs 顺序推进；父任务本身不 start。
- **子代理模式门槛**：各任务 `implement.jsonl` / `check.jsonl` 目前为 0 条。inline 模式可直接开工；若交给 sub-agent 模式执行，start 前需按 Phase 1.3 策划 jsonl 清单（至少把本任务 prd/design/implement 与 `research/` 两份报告、目标源码文件列入）。
- 数据源文件：`ref/drawio-ai-kit/data/shape-index.json.gz`（10,446 条，含 style verbatim/title/tags）；现有白名单 `skills/drawio/assets/catalog/shape-catalog.json.gz` 派生自同源索引（同源即无平铺增量，见 Background 修订）。
- 编辑 `skills/drawio/scripts/*.js` 时经由 Bash 写入以绕过 PostToolUse prettier 重排（见 memory `drawio-skills-format-hook-conflicts`）。

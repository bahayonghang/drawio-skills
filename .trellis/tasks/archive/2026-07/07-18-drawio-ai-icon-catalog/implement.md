# Implement - 离线 AI 图标目录

## Preconditions

- [ ] 用户审阅并批准本 child 的 `prd.md`、`design.md`、`implement.md`。
- [ ] `07-18-drawio-vision-rework` 已完成，或明确记录本轮只完成确定性部分且 Desktop/vision 为 `missing evidence`；不得降低最终验收标准。
- [ ] 启动时只对 `07-18-drawio-ai-icon-catalog` 运行 `task.py start`；父任务和方向② bucket 保持 planning。
- [ ] inline Phase 2 先运行 `trellis-before-dev`，加载 `frontend` 与 `drawio-skill` specs。
- [ ] 已批准仅访问官方 npm registry、运行固定 `npm view` / `npm pack --ignore-scripts`、安全 tar listing/解包、本机 Desktop 合成 fixture 和提交 generated gzip；未批准视觉模型、browser 或 MCP。
- [ ] 快照现有 OpenAI/Claude/Gemini/alias/Redis/Lucide 测试与 `skill-metadata` policy，作为兼容基线。

## Step 1 - Red Tests for Generator Contract

- 新增 `skills/drawio/scripts/tools/build-ai-icon-catalog.test.js` 和最小 package fixture。
- 先写失败测试：variant priority、ASCII sorting、duplicate/unresolved family、package/version/license mismatch、危险 SVG、1em normalization、byte reproducibility、原子输出。
- fixture 只覆盖算法；正式 309-brand source 不复制进测试目录。

Completion: 每个生成器失败分支都有确定性断言，新测试因生成器尚不存在而失败。

## Step 2 - Deterministic Generator and Catalog

- 新增 `skills/drawio/scripts/tools/build-ai-icon-catalog.js`，只接受显式 source/integrity/output 参数，不联网、不读取随机 node_modules。
- 从官方 registry 以固定 package/version 重新获取；`npm pack` 必须禁用 scripts，并使用仓库 `.drawio-tmp/` 下的隔离 cache/source 目录。
- 对 tarball bytes 计算固定 SHA-512 SRI，检查所有 tar entries 位于 `package/` 且没有绝对路径、`..` 或链接，再本地解包；不要依赖本规划阶段临时目录。
- 生成 `skills/drawio/assets/catalog/ai-icons.json.gz`，二次读取验证 309 count、209/1/99 分布、两个 `-text-color` 归并回归和安全规则。
- 连续生成两次，比较 gzip bytes 与 SHA-256；把命令、hash、count、size 和安全摘要写入 child `research/catalog-trust-report.md`。

Completion: checked-in catalog 可复现，provenance/count/security gate 全通过；临时 source 可清理。

## Step 3 - Lazy Loader

- 新增 `skills/drawio/scripts/dsl/ai-icon-catalog.js` 与 colocated tests。
- 实现 read/gunzip/schema/provenance/count/cache、exact lookup 和 search ranking。
- 覆盖 missing/corrupt gzip、wrong schema/version/count、duplicate slug、unknown slug 和 cache reuse。
- catalog 错误抛明确异常；unknown slug 返回 `null`，两者测试可区分。

Completion: loader 只在请求 AI namespace 时读取一次，并对所有错误状态产生稳定、可操作结果。

## Step 4 - Resolver, Search, and Compatibility

- 将 `icon-resolver.js` 的三项 `LOBE_PATHS` 切换到 loader；保留 Lucide/Redis 独立路径。
- 把 full-name compatibility 与 slug alias 收敛成一个权威表，实现 full-name compatibility -> namespace exact -> slug alias 规则和 `lobe.anthropic` / `ai.anthropic` 特例。
- 扩展 `catalog-search.js` 与 validation suggestions，使 `--prefix lobe` 使用 AI catalog；不复制排名算法到 CLI。
- 先扩展现有 resolver/search/spec tests，再实现；全量遍历 309 canonical slugs 和两个 namespace。
- 保持 `tests/skill-metadata.test.js` 对 `icon-resolver.js` 的 read/network 禁令。
- 同步更新 `.trellis/spec/frontend/quality-guidelines.md` 的 Bundled Image Icon Contract：允许独立、固定路径、单缓存的 bundled gzip loader，同时继续禁止 resolver 直接读文件、root package discovery 和网络 fallback。

Completion: 309 canonical names、既有兼容名、unknown suggestions 和 non-AI lazy boundary 全部通过 focused tests。

## Step 5 - File-Backed Visual Cases

- 在 `skills/drawio/evals/fixtures/` 增加五个最小 YAML cases：core aliases、gradients、currentColor、advanced SVG、dense CJK RAG/Agent。
- 对每个 case 生成 canonical `.drawio` 并 validate，检查 image data URI 可解码且无 HTTP(S)。
- 使用 C0 CLI 生成 `.drawio-tmp/*.preview.png`：

  ```powershell
  node skills/drawio/scripts/cli.js skills/drawio/evals/fixtures/ai-icons-core.yaml .drawio-tmp/ai-icons-core.preview.png --use-desktop --visual-preview --validate
  ```

- 对其余四个 fixture 使用同一命令模式；记录 Desktop version、PNG dimensions/structure 和 structured visual review。
- 按 YAML-first 返工，最多遵循 C0 自主轮次限制；没有视觉模型时只记录 Desktop/deterministic 证据与 `missing evidence`。

Completion: 五个 file-backed cases 都有可追踪执行种类；代表性 preview 非空且 visual blocker 已关闭或明确交回用户。

## Step 6 - Integration Handoff

- 在 child `research/integration-handoff.md` 记录新增 public identifiers、search syntax、license/trademark wording、fixtures、evidence paths 和已知 residual risk。
- 不在本 child 扩写两个 `SKILL.md`、interfaces 或全局 scorecard；后继 integration/promotion child 使用该 handoff 添加一个强 context pointer 并同步 docs/evals/release evidence。
- 如果实施发现 description 不需要改变，明确记录并跳过 trigger churn；若后继确需改 description，运行既有 26-probe trigger regression 和字符/字节预算。

Completion: 后继 child 不需要从 commit diff 猜公共契约，每个文档/路由/eval 更新点都有单一证据来源。

## Step 7 - Validation

从最小到全量运行：

```powershell
node --test skills/drawio/scripts/tools/build-ai-icon-catalog.test.js
node --test skills/drawio/scripts/dsl/ai-icon-catalog.test.js
node --test skills/drawio/scripts/dsl/catalog-search.test.js
node --test skills/drawio/scripts/dsl/spec-to-drawio.test.js
node --test tests/skill-metadata.test.js tests/security.test.js tests/integration.test.js
npm test
just ci
npm run docs:build
```

另外执行：

- 生成器双跑 byte/hash comparison。
- 309 slug × `lobe`/`ai` resolver matrix。
- runtime source/network scan；provenance/license URL 不得误报为 runtime fetch。
- 当前机器 Desktop + C0 preview 五案例；不可用时记录具体缺口，不写通过。

## Risky Files and Rollback

- `skills/drawio/scripts/dsl/icon-resolver.js`：保持窄接口与兼容输出；可独立恢复三项 embedded constants。
- `skills/drawio/scripts/dsl/catalog-search.js`：AI prefix 分支不得改变普通 shape 排名；以现有 search tests 保护。
- `skills/drawio/assets/catalog/ai-icons.json.gz`：只能由 generator 更新；损坏时 loader 必须硬失败而非空白图标。
- `skills/drawio/assets/licenses/lobe-icons-MIT.txt`：保留完整 MIT 文本；不把商标说明写成额外授权。

## Final Review Checklist

- [ ] 309/309 canonical slugs，209/1/99 variant 分布，`-text-color` 误分回归已锁定。
- [ ] 固定 provenance、两次生成 byte-identical、hash 已记录。
- [ ] runtime zero network、zero new dependency、lazy single load。
- [ ] catalog corruption 与 unknown icon 失败语义可区分。
- [ ] exact slug、legacy aliases、search suggestions 均有回归测试。
- [ ] 309 SVG 安全拒绝和 data URI 检查通过。
- [ ] 五个 file-backed visual cases 已执行或外部证据明确为 `missing evidence`。
- [ ] `SKILL.md` 没有塞入 309 名称或重复实现细节。
- [ ] integration handoff 足以驱动后继 route/docs/eval/release 收口。

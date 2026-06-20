# PRD — drawio 学术叠加层边界归位与去重重构

## 背景

`skills/drawio`（base）+ `skills/drawio-academic-skills`（thin overlay）是一组「基座 + 学术叠加层」。
overlay 自我声明「keep academic-specific policy in this overlay」，但实际存在三类问题：

1. **边界泄漏**：纯学术*策略文档*躺在 base（`academic-figure-playbook.md`、`academic-export-checklist.md`），与声明冲突。
2. **三处内容重叠**：学术概念（source understanding、figure-type、diagram plan gate、image preview、node budget、visual verification）在 overlay `SKILL.md`、`publication-overlay.md`、base `academic-figure-playbook.md` 各写一遍，硬编码数字（如 node 上限 40/60）多处重复。
3. **资产契约不对齐**：base 无 `agents/` 目录；overlay 用厂商命名 `agents/openai.yaml`；evals 结构两边不平价。

## 范围内（In Scope）

### P1 边界归位（主题留 base）
- 将 `academic-figure-playbook.md`、`academic-export-checklist.md` 从 `drawio/references/docs/` 搬到 `drawio-academic-skills/references/docs/`。
- 将 7 个纯学术 examples 从 `drawio/references/examples/` 搬到 `drawio-academic-skills/references/examples/`：
  `system-architecture-paper`、`yolo-model-architecture-paper`、`max-pooling-operation-paper`、`technical-roadmap-paper`、`ieee-network-paper`、`ablation-study-pipeline`、`research-pipeline`。
- **主题保留在 base**（`academic.json` / `academic-color.json`）。在 overlay `SKILL.md` 与 base `README` 明确边界定义：「主题 = base 渲染基元；overlay = 学术策略/文档/examples」。
- 同步更新所有引用路径（overlay SKILL.md / publication-overlay.md / evals.json / README / README_CN）。

### P0 去重
- overlay `SKILL.md` 瘦身为路由器：删除与 `publication-overlay.md` 重复的展开段落，保留 frontmatter、Required Sibling Base、Non-Negotiable Contract、Task Routing、Quality Gate，其余指向 references。
- `publication-overlay.md`（策略/gate/隐私）与 `academic-figure-playbook.md`（figure 模式库 + node budget）去重：互相只引用不复制。
- node budget 数字只在 playbook 出现一次；SKILL.md/overlay 引用不再硬编码。

### P2 契约对齐
- base 新增 `agents/interface.yaml`。
- overlay 提供 `agents/interface.yaml`（vendor-neutral，符合输出契约）。
- overlay `evals/evals.json` 更新被搬 examples 的路径；判定 `darwin-results.tsv` 去留。

## 范围外（Out of Scope）

- **不搬主题、不改 base CLI 主题加载逻辑**（测试 `tests/drawio-academic-skill.test.js:52/61` 与文档已将「academic 主题属于 base」固化为不变量）。
- 不改渲染/转换核心逻辑（`spec-to-drawio.js` 等）。
- 不动 base 通用 examples（含 `neural-network.yaml`，偏通用且与 `assets/examples/neural-network.drawio`、base `examples.md` 配套）。
- 不重写 SKILL.md 的学术策略内容本身（仅去重与归位）。

## 验收标准

1. 2 个学术文档 + 7 个学术 examples 已物理位于 overlay；base `references/docs|examples` 不再含这些文件。
2. 全仓非 archive 区无指向旧路径的悬空引用（`grep` 验证）。
3. overlay `SKILL.md` 行数明显下降（目标 ≤ ~150 行），Task Routing 的 `academic-create`/`replicate` 路由指向搬迁后的 overlay 路径。
4. node budget 上限数字在仓库内仅有一个权威定义点（playbook）。
5. base `agents/interface.yaml` 与 overlay `agents/interface.yaml` 存在且字段对齐。
6. 既有测试命令全绿；尤其 `tests/drawio-academic-skill.test.js`、`tests/integration.test.js` 主题断言保持成立。
7. 用搬迁后的 overlay 路径跑通一条 academic example 的 CLI 渲染（生成 `.drawio` + `.svg`，validate 通过）。
8. base `README` / overlay `SKILL.md` 含一句明确的「主题=base / 策略=overlay」边界定义。

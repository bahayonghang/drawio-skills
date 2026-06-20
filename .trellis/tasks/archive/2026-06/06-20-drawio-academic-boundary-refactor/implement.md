# Implement — drawio 学术叠加层边界归位与去重重构

执行顺序按「先搬迁 → 改引用 → 去重 → 加资产 → 改测试 → 验证」。每步带 verify。

## 阶段 A：搬迁文件（git mv）

- [ ] A1 移动 2 个学术文档到 overlay `references/docs/`
  - `git mv skills/drawio/references/docs/academic-figure-playbook.md skills/drawio-academic-skills/references/docs/`
  - `git mv skills/drawio/references/docs/academic-export-checklist.md skills/drawio-academic-skills/references/docs/`
- [ ] A2 移动 7 个学术 examples 到 overlay `references/examples/`（先 `mkdir -p`）
  - 列表：system-architecture-paper, yolo-model-architecture-paper, max-pooling-operation-paper, technical-roadmap-paper, ieee-network-paper, ablation-study-pipeline, research-pipeline
- [ ] verify：`ls skills/drawio-academic-skills/references/{docs,examples}`；base 侧已不含这些文件。

## 阶段 B：更新引用路径

- [ ] B1 overlay `SKILL.md`：`academic-create` 路由（playbook/checklist 改本地 `references/docs/...`）、L71 node-budget 引用改本地 playbook。
- [ ] B2 overlay `references/docs/publication-overlay.md`：L176-177 base 路径 → 本地（同目录）。
- [ ] B3 overlay `evals/evals.json`：3 处 `skills/drawio/references/examples/...` → `skills/drawio-academic-skills/references/examples/...`。
- [ ] B4 overlay `README.md` + `README_CN.md`：example 路径 → overlay 新位置。
- [ ] B5 根 `README.md`：边界描述（L16/L18）更新为新契约。
- [ ] verify：`grep -rnE "drawio/references/(docs/academic|examples/(system-architecture-paper|yolo|max-pooling|technical-roadmap|ieee-network-paper|ablation-study|research-pipeline))" skills/drawio-academic-skills README.md` 无旧路径残留（排除 archive）。

## 阶段 C：P0 去重

- [ ] C1 overlay `SKILL.md` 瘦身 ≤ ~150 行：保留 frontmatter / intro / Required Sibling Base / Non-Negotiable Contract / Task Routing / Academic Defaults(yaml) / Quality Gate / Completion Report；Preflight/Source Understanding/Diagram Plan Gate/Optional Image Preview/Create Flow 压成指向 `publication-overlay.md` 的指针。
- [ ] C2 `publication-overlay.md` ↔ `academic-figure-playbook.md` 去重：overlay 文件留策略/gate/隐私/evidence chain；playbook 留 figure 模式库 + node budget；互引不复制。
- [ ] C3 node-budget 数字唯一来源 = playbook；SKILL.md/overlay 改引用不硬编码。
- [ ] verify：人工核对无大段重复；`wc -l skills/drawio-academic-skills/SKILL.md`。

## 阶段 D：P2 资产对齐

- [ ] D1 新增 `skills/drawio/agents/interface.yaml`（参照 overlay openai.yaml 字段，描述 base 能力面）。
- [ ] D2 新增 `skills/drawio-academic-skills/agents/interface.yaml`（vendor-neutral；保留 openai.yaml）。
- [ ] verify：两文件存在、yaml 合法、字段对齐。

## 阶段 E：重写测试

- [ ] E1 `tests/drawio-academic-skill.test.js`：
  - 1.3 SKILL.md 段落断言 → 匹配瘦身后文本。
  - 1.5 白名单 deepEqual → 加入 2 文档 + 7 examples（排序后）。
  - step3 input → `SKILL_DIR/references/examples/system-architecture-paper.yaml`。
  - step4 input 根 → `SKILL_DIR/references/examples`。
- [ ] verify：仅改断言以匹配新架构，不放宽测试意图（仍校验「overlay 不复制 base runtime / 字节不重复 / evals 职责分离」）。

## 阶段 F：验证

- [ ] F1 `npm test` 全绿（重点 drawio-academic-skill.test.js、integration.test.js）。
- [ ] F2 全仓非 archive grep 旧路径 = 0。
- [ ] F3 跑通 overlay 新路径 academic example 渲染（见 design 验证策略 #3）。
- [ ] F4 `wc -l` 确认 SKILL.md ≤ ~150。

## 回滚点

- 每阶段独立可回滚；A 用 git mv，异常时 `git checkout -- .` / `git mv` 反向。
- 测试在 E 后才改，F1 一旦发现非预期红，先判断是「架构变更预期内」还是「真回归」。

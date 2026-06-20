# Design — drawio 学术叠加层边界归位与去重重构

> 决策前提：用户在充分知情（架构由 `tests/drawio-academic-skill.test.js` 8 条断言 + `README:18` 显式固化）下，选择**推翻当前「shared capability in one place」架构并重写测试**。本设计据此执行。

## 新边界契约

| 资产类别                                                                        | 归属        | 理由                                                    |
| ------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------- |
| CLI / schema / 渲染器 / 通用 references / 通用 examples                         | base        | 共享执行基元                                            |
| **主题** `academic.json` / `academic-color.json`                                | **base**    | 渲染基元；被 `loadTheme` 单目录加载 + 测试钉死，留 base |
| 学术**策略文档** `academic-figure-playbook.md` / `academic-export-checklist.md` | **overlay** | 纯 academic policy                                      |
| 学术 **examples**（7 个 paper/pipeline）                                        | **overlay** | 纯 academic 输入样例                                    |
| 学术 policy/gate/preflight                                                      | overlay     | 不变                                                    |

一句话边界：**主题=base 渲染基元；策略/文档/examples=overlay**。写入 overlay `SKILL.md` 与根 `README`。

## 受影响文件清单

### 搬迁（git mv，保留历史）

- `drawio/references/docs/academic-figure-playbook.md` → `drawio-academic-skills/references/docs/`
- `drawio/references/docs/academic-export-checklist.md` → `drawio-academic-skills/references/docs/`
- `drawio/references/examples/{system-architecture-paper, yolo-model-architecture-paper, max-pooling-operation-paper, technical-roadmap-paper, ieee-network-paper, ablation-study-pipeline, research-pipeline}.yaml` → `drawio-academic-skills/references/examples/`
- **不搬** `neural-network.yaml`（通用，配套 `assets/examples/neural-network.drawio` 与 base `examples.md`）。

### 引用路径更新

- overlay `SKILL.md`：`academic-create` 路由（L112）、node-budget 引用（L71）→ overlay 本地路径。
- overlay `references/docs/publication-overlay.md`：L176-177 base 路径 → 本地路径。
- overlay `evals/evals.json`：3 个 example 路径（L35/49/65）→ overlay 路径。
- overlay `README.md` / `README_CN.md`：L55-62 example 路径 → overlay 路径。
- 根 `README.md`：L16/L18 边界描述更新为新契约（academic policy/docs/examples 归 overlay；主题等共享基元留 base）。
- base `references/workflows/create.md` L51 引用的是 `academic-color`**主题**（留 base），**无需改**。
- base `design-system/themes.md`：主题留 base，**无需改**。

### P0 去重

- overlay `SKILL.md` 瘦身为路由器（目标 ≤ ~150 行）：将 Academic Preflight / Source Understanding / Diagram Plan Gate / Optional Image Preview / Create Flow 的展开说明压成指向 `publication-overlay.md` 的指针；保留 frontmatter、intro、Required Sibling Base、Non-Negotiable Contract、Task Routing、Academic Defaults(yaml 块)、Quality Gate、Completion Report。
- `publication-overlay.md`（策略/gate/隐私/evidence chain）与 `academic-figure-playbook.md`（figure 模式库 + node budget）去重，互相只引用不复制。
- node-budget 上限数字唯一权威点 = playbook 的 `Node Budget Management`；SKILL.md/overlay 改为引用，不硬编码 40/60。

### P2 契约对齐

- 新增 `drawio/agents/interface.yaml`（display_name / short_description / capabilities / prerequisites）。
- overlay 新增 vendor-neutral `agents/interface.yaml`（与 `openai.yaml` 同义；保留 `openai.yaml` 以兼容 OpenAI 装载，二者并存）。
- `darwin-results.tsv`：判定为历史 eval 结果记录，**保留**，不在本次处理。

### 测试重写（唯一受影响测试文件）

`tests/drawio-academic-skill.test.js`：

- **1.3**：SKILL.md 段落断言（`## Source Understanding` 等）→ 改为匹配瘦身后保留的章节/指针文本。
- **1.5**：overlay `references/` 白名单 `deepEqual` → 扩为：`docs/academic-export-checklist.md`、`docs/academic-figure-playbook.md`、`docs/publication-overlay.md`、`examples/<7 个>.yaml`、`templates/<2 个>.yaml`（按排序）。
- **step3（L169）**：input 路径 → `SKILL_DIR/references/examples/system-architecture-paper.yaml`。
- **step4（L224）**：input 根目录 → `SKILL_DIR/references/examples`。
- **1.6 字节相同检查**：搬迁用 mv（base 侧删除），overlay 文件不会与 base 字节相同，断言仍成立，无需改逻辑。
- **step5 evals**：仅校验 id，不校验路径，无需改。

## 兼容性与风险

- **base 单独使用 academic examples 的旧路径会失效**（如 `node drawio/scripts/cli.js drawio/references/examples/system-architecture-paper.yaml`）。这是本次有意的边界变更后果；overlay 内文档全部指向新路径。根 `README` 注明。
- 主题不动 → `loadTheme('academic')`、`--theme academic`、所有主题相关测试不受影响。
- `integration.test.js` 的 example 列表全为留 base 项，不受影响（已核）。
- 搬迁后 base `references/docs` 不再含 academic 文档；已核非 archive 区无其他引用。

## 验证策略

1. `npm test`（`node scripts/run-tests.js`）全绿。
2. 全仓非 archive `grep` 旧路径 = 0 悬空引用。
3. 用 overlay 新路径跑通一条 academic example：`node skills/drawio/scripts/cli.js skills/drawio-academic-skills/references/examples/system-architecture-paper.yaml /tmp/x.svg --validate --write-sidecars --sidecar-dir /tmp/.dt` → 生成 `.drawio`+`.svg`，validate 通过。
4. overlay `SKILL.md` 行数 ≤ ~150。

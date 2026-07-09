# 精简 drawio skills description 降低常驻 token 占用

## Goal

`skills/drawio` 与 `skills/drawio-academic-skills` 两条 frontmatter description 常驻每个会话的系统提示（skill 路由列表），当前合计约 230 tokens。在**触发评测不回退**的前提下精简 30% 以上。

## 现状测量（2026-07-09 基线）

会话系统提示只加载每个 skill 的 `name` + `description`；frontmatter 其余字段（`compatibility`、`metadata.tags` 等）不进入会话，**没有常驻成本，不需要精简**。

| 文件 | description 字符 | 词数 | 估算 tokens |
| --- | --- | --- | --- |
| `skills/drawio/SKILL.md` | 552 | 65 | ≈110 |
| `skills/drawio-academic-skills/SKILL.md` | 585 | 74 | ≈120 |
| **合计（常驻）** | **1137** | 139 | **≈230** |

SKILL.md 正文为触发后成本：drawio ≈16.5k 字符（≈4.1k tokens）、academic ≈14.3k 字符（≈3.6k tokens）。本任务不动正文，列入"排除项/后续方向"。

复测命令（改动前后各跑一次）：

```bash
python - <<'EOF'
import re
for p in ["skills/drawio/SKILL.md", "skills/drawio-academic-skills/SKILL.md"]:
    t = open(p, encoding="utf-8").read()
    d = re.search(r'^description:\s*"(.*?)"\s*$', t, re.M | re.S).group(1)
    print(p, len(d), "chars", len(d.split()), "words")
EOF
```

## 冗余分析

三处可精简点（按收益排序）：

1. **资源清单双份**（≈35 tokens）：`CLI, references, themes, schemas, styles, (optional) Desktop export` 在两条 description 各枚举一次。属实现细节，对路由无贡献；正文已覆盖（drawio SKILL.md 第 30 行、academic §Boundary）。
2. **出版关键词双份枚举**（≈25 tokens）：drawio 侧负向边界列了 paper/thesis/journal/conference/IEEE-ACM/manuscript/camera-ready 共 7 个词，academic 侧正向又列 9 个。路由主要靠 academic 的正向列表；drawio 侧可缩为短指针 + 少量代表词。
3. **academic 实现细节句**（≈35 tokens，与第 1 点部分重叠）：`Runs offline and YAML-first through the sibling ../drawio base ... never requires MCP or a live backend` 整句是行为约束而非触发信号，正文 §Non-Negotiable Contract 已有同等强度规定。

**保留不动（负向清单）**：

- 两侧的正向触发关键词枚举（图类型：architecture/network/UML…；出版场景：paper/thesis/IEEE…）——每个词都是触发面，未经评测证明冗余不得删除。
- drawio→academic 的互斥边界指针与 academic 的 `Use instead of the general drawio skill`——这是刻意工程化的路由边界，语义必须保留。

## 改写方向

- **方向 A（保守，合计 ≈185 tokens，约 -20%）**：只删两侧资源清单 + academic 实现细节句；出版关键词双份保留。
- **方向 B（推荐，合计 ≈175 tokens 以内，约 -30%~-35%）**：A 基础上，drawio 侧负向出版词缩为 4 个代表词。
- **方向 C（激进，可选，合计 ≈120 tokens，约 -48%）**：B 基础上再删 academic 的 gates/图型枚举。触发风险最高，仅当 B 评测零回退且仍想继续压缩时再评估，默认不做。

### 方向 B 草案（实施时以评测结果为准微调）

`drawio`（≈420 字符）：

```text
Create, edit, replicate, import, and export draw.io diagrams with an offline YAML-first workflow. Use for general engineering and product diagrams: architecture, network topologies, flowcharts, UML/ER, org charts, Mermaid/CSV conversion, existing .drawio bundles, style presets, themes, and non-publication formula diagrams. For publication figures (paper, thesis, IEEE, camera-ready) use drawio-academic-skills instead.
```

`drawio-academic-skills`（≈455 字符）：

```text
Publication-figure overlay for draw.io. Use instead of the general drawio skill whenever a diagram is for a paper, thesis, dissertation, journal, conference, IEEE/ACM submission, manuscript, camera-ready, Word/LaTeX figure, or other publication. Applies venue, figure-type, color, caption/legend, formula, and paper-readability gates for architecture, workflow, roadmap, network-topology, and replicated paper figures; offline via the sibling ../drawio base.
```

## Requirements

- 仅修改两个 SKILL.md 的 frontmatter `description` 字段；正文、其余 frontmatter、`references/`、`scripts/` 一律不动。
- description 保持英文（路由面向英文系统提示）；不改 `name`，不合并两个 skill。
- 路由/边界改动必须走触发评测（yao-meta 规则）；评测先建基线、后验证改写。
- Windows 环境注意：skill-creator 的 run_loop/run_eval 存在 select-on-pipe 缺陷会报假 0% 召回，必须改用 classification-probe 法（把候选 skill 列表 + 用户 query 交给模型判路由，人工/脚本统计命中）。

## Acceptance Criteria

- [ ] 改动前建立探针基线：≥20 条 probe（drawio 正例 ≥8、academic 正例 ≥8 且含 ≥4 组 drawio↔academic 互斥对——如"画一张系统架构图" vs "画一张论文里的系统架构图"，无关负例 ≥4），基线 recall/precision 数字落盘到任务 `research/`。
- [ ] 改写后同一探针集 recall/precision 均不低于基线；互斥对 100% 路由正确；若某词删除导致回退，恢复该词并在报告中标注其为 load-bearing 关键词。
- [ ] 两条 description 合计 ≤800 字符（当前 1137，≥30% 缩减），用上方复测命令验证。
- [ ] 评测证据（探针集、前后结果对比）保存在任务 `research/` 或 `reports/` 下。

## 排除项（本任务不做）

- SKILL.md 正文精简（≈7.7k tokens 触发后成本）→ 收益更大但改动面广，另立任务评估。
- frontmatter `tags`/`compatibility` 精简（不进入会话提示，零常驻收益）。
- 仓库外的用户级 skills（drawio-localize、paper-to-chapter-zh 等）。

## Notes

- 版本号/CHANGELOG 是否递增遵循仓库既有发布习惯（近期有 2.5.0 质量更新先例），提交时决定。
- 若评测过程沉淀出"description 关键词 × 探针用例"的对应规范，走 trellis-update-spec 固化。

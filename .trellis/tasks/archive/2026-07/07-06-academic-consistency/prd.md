# 学术规则、模板与文档一致性修复

## Goal

消除"照文档做必然触发告警/失败"的自相矛盾，使学术 playbook、校验器、模板三者一致，并补齐版面尺寸与投稿格式两处标准缺口。本任务以文档/模板/校验阈值为主，代码改动限于校验器阈值与告警逻辑。

## Problem Evidence（见父任务 research/audit-findings.md #5 #10 #11 #12 #13 #14 #15 #17）

1. **模板过不了自家门**：`neural-network-architecture-compact.yaml` 在 `--validate` 下 26 条告警（11 条边质量、1 条 -60px 重叠），而 overlay 标准命令是 `--strict-warnings` → 旗舰模板在推荐管线下硬失败。
2. **密度阈值矛盾**：`validateAcademicProfile` 在 >18 节点（无模块 >12）告警 dense，playbook 预算表说 30-40 理想、41+ 才警告。
3. **紧凑图例矛盾**：playbook 推荐单节点多行图例（示例 8 行），校验器对 >3 手动行告警"labels should stay concise"。
4. **schema 漂移**：模板/playbook 使用 `style.shape`、`style.rounded`、`meta.canvasSize`、`meta.gridSize`、module `bounds` 等渲染器不消费的键（grep 证实零消费点），静默失效；playbook 图例示例 `shape: text` 实际会退化为 service 彩盒。
5. **版面映射缺失**：IEEE 单栏 3.5in/双栏 7.16in、成品字号 8-10pt（已核实），skill 从不换算"画布 px → 印刷 pt"，1200px 宽图缩到单栏后 11px 字 ≈3pt 不可读也无告警。
6. **投稿格式**：IEEE 矢量只收 PS/EPS/PDF，SVG 不在名单；overlay 默认交付 .drawio+.svg 而不提示 PDF。
7. **杂项**：academic evals.json 版本 0.1.0 vs SKILL.md 2.3.0；>14 字符标签逐节点 info 告警噪音淹没真实问题（模板一次 13 条）。

## Requirements

- R1 统一节点密度阈值：validateAcademicProfile 与 playbook 预算表对齐（按 figureType 分档或统一 41/61/100 三档），文档与代码引用同一张表。
- R2 图例豁免：`type: text` 的图例/说明节点不受 3 行与 40 字符限制（或单独上限），playbook 紧凑图例示例改为可通过 strict 的写法。
- R3 清理 schema 漂移：模板与 playbook 全部示例只用受支持字段（type/bounds/meta.canvas 等）；`validateSpec` 对未知的 node.style/meta 键输出 warning，防止再次静默漂移。
- R4 修复三个 compact 模板与 `references/examples/` 中学术示例的坐标/间距，使 `--validate --strict-warnings` 全部通过；将该命令纳入根测试或 CI。
- R5 新增"版面尺寸"指引与校验：preflight/checklist/playbook 给出单栏/双栏目标画布宽度建议与 px→pt 换算规则；`validateAcademicProfile` 在画布宽超阈值时按缩放后有效字号告警。
- R6 IEEE/期刊 venue 提示：checklist 与 export policy 注明 SVG 非 IEEE 提交格式，Desktop 可用时建议附 PDF；不改默认交付契约。
- R7 杂项清理：同步 academic evals.json 版本号；标注 evals 运行方式；归档或注明 darwin-results.tsv / test-prompts.json / baseline-prompts.json 状态；label 长度 info 告警聚合为单条摘要。

## Acceptance Criteria

- [ ] 三个学术模板 + 学术示例 YAML 全部 `--validate --strict-warnings` 零告警通过，并有测试守护。
- [ ] 30 节点、带 modules、含 8 行图例的合规架构图 spec：`--validate` 无密度/图例告警。
- [ ] 故意写 `style.shape: box` 能得到未知字段 warning。
- [ ] 1600px 宽 + fontSize 11 的 academic spec 在目标单栏场景触发有效字号告警（阈值以 R5 定稿为准）。
- [ ] playbook/checklist/publication-overlay 中不再存在与校验器行为相悖的示例或数值；文档互引一致。
- [ ] `node --test` 全部通过；evals 版本号与 SKILL.md 一致。

## Constraints

- 不改 YAML 对外 schema 的既有受支持字段语义；只做"文档对齐代码 + 校验器对齐文档"。
- 阈值调整需在 prd/design 评审时给出依据（IEEE 指南 + playbook 预算表），避免拍脑袋数字。

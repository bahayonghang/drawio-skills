# 离线自动布局引擎与边路由升级

## Goal

让"不手写 bounds 也能得到可读的学术流程图/网络架构图"。当前 `calculateLayout` 完全不感知边：`hierarchical` 实为按 YAML 顺序的 4 列网格，horizontal/vertical 只是模块内按序堆叠；工作流图的"流向"与边无关，任何非平凡图都被迫整图手工 bounds（官方模板即如此，且仍有 11 条边质量告警）。

## Problem Evidence

- `spec-to-drawio.js` calculateLayout：hierarchical 分支为 maxCols=4 的网格填充，无拓扑排序、无分层、无交叉最小化。
- 单条边默认挂 `FACE_SLOTS[0]=0.25` 偏心槽位（实证 exitY=0.25/entryY=0.25），一进一出箭头系统性不居中。
- 除 star/mesh 外不生成任何 waypoints，避障完全依赖 Desktop 打开后的 jetty 效果。
- 参考仓库用 Graphviz `splines=ortho` 航点回放 + `--tune` 双向评分解决同类问题；外部调研结论：elkjs layered 原生支持复合图（modules）+ ORTHOGONAL 边路由 + bendPoints，dagre 有复合图致命 bug 不可选（依据见父任务 research/audit-findings.md）。

## Requirements

- R1 新增边感知分层布局（建议 elkjs layered，`layout: hierarchical` 时启用；具体选型在 design.md 定稿）：按边方向分层、交叉最小化、支持 modules 作为复合节点整体布局。
- R2 布局产出的正交 bend points 回放为 draw.io `<Array as="points">` waypoints，使 .drawio 与 SVG 均能表达避障路由。
- R3 修复挂点分配：每面仅 1 条边时用 0.5 居中；≥2 条时按 0.25/0.5/0.75… 分布（同步更新 edge-quality-rules.md 措辞）。
- R4 新增 `layout: tiered` 网络分层布局：按 `network.role` 或 zone 将 core/distribution/access（或 DMZ/internal 等自定义层）分行放置，外部（internet/WAN）在最上，符合 North-South 惯例。
- R5 保留现有 horizontal/vertical/star/mesh 与手工 bounds 行为不变（向后兼容）；显式 bounds/position 的节点不被自动布局移动。
- R6 spec.schema.json、specification.md、SKILL.md 路由表同步新增布局值；示例库补 1 个自动布局工作流示例 + 1 个 tiered 网络拓扑示例。
- R7 布局质量可回归：为布局结果增加可读性度量（如穿框数/交叉数/总边长），在 --validate 输出中报告，测试断言不劣化。

## Acceptance Criteria

- [ ] 一个 12 节点带分支/汇聚的 workflow YAML（无任何 bounds）在 `layout: hierarchical` 下：无节点重叠、边不穿过无关节点、阅读方向单一，`--validate` 无边质量告警。
- [ ] `mod-test.yaml` 单边挂点为 0.5/0.5（居中）。
- [ ] tiered 示例：internet→firewall→core→distribution→access→server 分行呈现，`--validate --strict-warnings` 通过。
- [ ] 现有全部示例 YAML 输出与旧版兼容（显式 bounds 的图坐标不变），`node --test` 通过。
- [ ] 若引入 npm 依赖：离线安装路径与 package.json 更新有据，install.sh/install.bat 同步；无网络时给出降级行为（回退现有网格并告警）。

## Constraints

- 离线优先：依赖必须可 vendored/离线安装，禁止运行时网络请求。
- 这是最大改动的子任务：必须先有 design.md（布局库选型对比、复合图映射、waypoint 坐标系换算）与 implement.md 再 start。
- 建议在 svg-renderer-fidelity 完成后实施，以便用修复后的 SVG 做视觉验证。

# 修复 SVG 渲染器保真问题（容器坐标/边路由/多行文本）

## Goal

`skills/drawio/scripts/svg/drawio-to-svg.js` 生成的 SVG 必须忠实反映 .drawio 内容。SVG 是默认学术交付物、也是离线视觉自检的唯一依据；当前三类保真缺陷使"用 SVG 自检"这条质量门形同虚设，且 modules 场景下用户拿到的 .svg 是坏的。

## Problem Evidence（复现步骤见父任务 `../07-06-drawio-figure-quality/research/audit-findings.md` § 实证记录）

1. **容器子节点坐标不换算**：子节点 geometry 相对父容器，渲染时按绝对坐标画 → modules 内节点全部堆到画布原点附近互相重叠；跨模块边随之退化为零长度线段（箭头消失）。
2. **边路由失真**：一律"源中心→目标中心"直线；忽略 `orthogonalEdgeStyle`、`<Array as="points">` waypoints、`exitX/exitY/entryX/entryY`；箭头落在目标节点中心（穿透节点内部）。
3. **多行文本折行失效**：`<text>` 内裸换行被 SVG 规范折叠为空格 → 多行标签/紧凑图例渲染成一行溢出。

## Requirements

- R1 渲染 vertex/edge 前按 parent 链解析绝对坐标（容器可嵌套；`relative="1"` 的 edgeLabel 子节点保持现有定位逻辑并适配绝对坐标）。
- R2 边端点从"节点中心"改为：优先使用 exitX/exitY/entryX/entryY 挂点；无挂点时裁剪到节点边界（矩形边界近似即可）。
- R3 支持 waypoints 折线回放：有 waypoints 时按挂点→points 序列→挂点画折线，箭头方向取最后一段。
- R4 无 waypoints 的 `orthogonalEdgeStyle` 边至少用 L 形/Z 形两三段近似，不得穿过源/目标节点主体；与 Desktop 完全一致不作要求。
- R5 标签按 `\n` 与 `<br>` 拆分为 `<tspan>` 行（行高约 1.4em），保持 align/verticalAlign 语义；节点标签与独立 text 节点都要覆盖。
- R6 补充 `cube`（tensor3d）形状的近似绘制，避免画成普通矩形。
- R7 `drawio-to-svg.test.js` 扩展覆盖以上全部场景（嵌套容器、waypoint 边、挂点边、多行图例、cube）。

## Acceptance Criteria

- [ ] 复现用例 mod-test.yaml（2 modules + 跨模块边）：SVG 中两节点分别位于各自容器内部（与 .drawio 绝对坐标一致），边为可见折线且箭头落在目标节点边界上。
- [ ] 带 3 个 waypoints 的边在 SVG 中呈现为对应折线。
- [ ] 8 行紧凑图例 text 节点在 SVG 中渲染为 8 个 tspan 行。
- [ ] `references/examples/` 与学术 `references/templates/` 全量 YAML 渲染 SVG 无异常、无重叠（抽样目视）。
- [ ] `node --test`（根 tests/ + scripts 单测）全部通过。
- [ ] base SKILL.md 第 12 条"straight-line edge previews"限制声明按新能力如实改写。

## Constraints

- 纯 Node、零新增运行时依赖（本任务不引入布局库，正交近似用简单几何）。
- 不改变 .drawio XML 生成逻辑（那是 auto-layout-engine / theme-style-fidelity 的范围）。
- .js 编辑注意 format-hook 单引号问题（项目 memory：必要时经 Bash 编辑）。

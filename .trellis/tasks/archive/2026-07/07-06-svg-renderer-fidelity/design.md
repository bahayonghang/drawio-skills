# Design — SVG 渲染器保真修复

## 范围

单文件为主的渲染器改造：`skills/drawio/scripts/svg/drawio-to-svg.js`（+ 其测试、SKILL.md/xml-format.md/create.md 中的限制声明措辞）。不改 XML 生成逻辑、不引入依赖、不做通用正交避障（那是 auto-layout-engine 的事）。

## 现状架构

- `shared/xml-utils.js` 已解析出渲染所需的全部数据：`cell.parent`、`geometry.relative`、`geometry.points`（waypoints）、`geometry.offset`——渲染器只是没用。
- `drawioToSvg` 主循环把 raw geometry 直接交给 `renderVertex` / `renderEdge`；`cellCenter` 也用 raw geometry。
- 标签渲染是单 `<text>` 节点，`escapeXml(label)` 保留字面 `\n`（SVG 折叠为空格）；生成侧多行标签（网络边标签、图例）都以字面 `\n` 存进 value。
- 复现基线（mod-test.yaml）：子节点画在相对坐标 (24,64)，边 `x1=x2=84, y1=y2=94` 零长度。

## 设计

### 1. 绝对坐标解析（R1）

新增预计算阶段：`resolveAbsoluteGeometry(cells, cellMap)` 返回 `Map<id, {x,y,width,height}>`。

- 对每个 vertex 沿 `parent` 链累加父 geometry 的 x/y，直到 parent 为 `0`/`1`/未知 id；memoize + visited 集合防环，深度上限 32。
- `relative="1"` 的 vertex（edgeLabel 子节点）不参与该表，保持 `renderEdgeLabel` 沿边定位逻辑。
- 主循环、viewBox 扩展、`cellCenter` 全部改用该表；`renderVertex` 接收注入的绝对 geometry（签名加参，默认回退 `cell.geometry` 以兼容单测直接调用）。

### 2. 边几何管线（R2/R3/R4）

新增 `resolveEdgePoints(edge, style, absGeo)` → `[{x,y}, ...]`（≥2 点），renderEdge 只负责把点列画出来：

1. **端点锚定**：`exitX/exitY`（+`exitDx/exitDy`）存在 → 起点 = 源绝对矩形上的锚点；`entryX/entryY` 同理。缺锚点时先取中心，待第 3 步裁剪。
2. **waypoints 回放**：`geometry.points` 非空 → 中间点序列（edge parent="1"，坐标本就绝对；若 edge 挂在容器下，同样按 parent 链平移）。
3. **边界裁剪**：无锚点的一端，以"中心 → 相邻点（首个 waypoint 或对端点）"的线段与节点矩形求交，端点移到边界（参数化 t 取最大入射交点；退化时保持中心）。
4. **正交近似**：`edgeStyle=orthogonalEdgeStyle` 且无 waypoints 时合成折弯点：
   - 由锚点推面（exitX=0→west、=1→east、exitY=0→north、=1→south；无锚点按 dx/dy 主导方向推面）。
   - 水平出+水平入 → Z 形（经 midX）；垂直出+垂直入 → Z 形（经 midY）；混合 → L 形（拐点取 (x2,y1) 或 (x1,y2)，与出面正交一致）。
   - 共线（y1==y2 或 x1==x2）→ 退化为直线。不做避障，不追求与 Desktop jetty 一致。
5. **渲染**：2 点 → 保持 `<line>`（兼容既有断言），≥3 点 → `<polyline fill="none">`；marker-end 方向由最后一段决定（SVG 原生行为）。行内边标签取点列折半处中点；`renderEdgeLabel`（edgeLabel 子 cell）沿用"源中心→目标中心 + labelX 比例 + offset"公式，仅换成绝对中心。

### 3. 多行文本（R5）

新增 `splitLabelLines(label)`：按字面 `\n` 与 `<br>`/`<br/>`（大小写不敏感）拆行，并新增 `renderTextElement({x, y, lines, ...})` 供三处复用（vertex 标签、edge 行内标签、edgeLabel cell）：

- 1 行：输出与现状相同的裸 `<text>`（保持既有测试 `>Hello<`、`x="200" y="82"` 等断言与输出稳定）。
- ≥2 行：`<text>` 内每行一个 `<tspan x="<textX>" dy="...">`；行高 `1.4 × fontSize`。
- 垂直对齐：middle → 首行 `dy = -(n-1)/2 × lineHeight`；top → 首行 dy=0（hanging 基线）；bottom → 首行 `dy = -(n-1) × lineHeight`。水平对齐由 text-anchor 继承，无需逐行处理。

### 4. cube 近似绘制（R6）

`classifyShape` 增加 `shape=cube` → `'cube'`。绘制：深度 `d = clamp(Number(style.size) || 20, 4, min(w,h)/2)`，前面矩形 (x, y+d, w−d, h−d) + 顶面/侧面平行四边形三段 path（direction 仅实现默认/south 视角，其余方向按默认处理）。

### 5. viewBox 修正

扩展循环改用绝对 geometry，并纳入 waypoints 极值，`+20` 余量不变。

## 兼容性

- 单行标签与 2 点直边的输出结构不变（既有 26 个单测断言首选保持绿灯，语义变更仅限坐标数值）。
- `renderVertex(cell, style)` 旧签名仍可用（无 absGeo 时回退 raw geometry）。
- 输出仍是无依赖 standalone SVG，`data-drawio` round-trip 不变。

## 测试策略

- `drawio-to-svg.test.js` 新增夹具：模块含子节点（断言绝对坐标）、二级嵌套容器、waypoints 边（断言 polyline 点列）、exit/entry 锚点边（断言端点在边界）、正交无 waypoint 边（断言折线且不穿节点）、8 行图例（断言 8 个 tspan）、cube。
- CLI 端到端：mod-test.yaml → SVG 断言 Encoder(64,104)/Decoder(264,104)、边可见且箭头落在 Decoder 左边界。
- 全量回归：`references/examples/` 与学术 `references/templates/` 逐个渲染 SVG 无抛错；`node --test`（根 tests/ + scripts）全绿。

## 回滚

改动集中于 1 个源文件 + 1 个测试文件 + 3 处文档措辞；git revert 单提交即可回滚。

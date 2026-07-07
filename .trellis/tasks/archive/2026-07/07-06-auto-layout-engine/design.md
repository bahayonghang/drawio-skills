# Design — 离线自动布局引擎与边路由升级

## 选型定稿（R1）

**elkjs 0.11.1，vendored 单文件集成。**

| 候选                              | 结论    | 依据                                                                                                                 |
| --------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| elkjs layered                     | ✅ 采用 | 原生复合图（modules 作容器整体布局）、`ORTHOGONAL` 边路由产出 bendPoints、纯 JS 可离线 vendor；audit-findings 已核实 |
| dagre                             | ❌      | 复合图支持有致命 bug（audit 结论），且长期无维护                                                                     |
| Graphviz 航点回放（ref 仓库方案） | ❌      | 依赖原生二进制，违反离线/免安装约束                                                                                  |
| 自研 Sugiyama                     | ❌      | 交叉最小化+正交路由工作量≫收益，质量不可控                                                                           |

**Vendoring**：`npm pack elkjs@0.11.1` 取 `lib/elk.bundled.js`（UMD，~1.4MB，接受该体积成本）落到
`skills/drawio/scripts/vendor/elkjs/elk.bundled.cjs`（**改 .cjs 后缀**——scripts/package.json 为
`{"type":"module"}`，UMD 必须走 CJS 通道），同目录放 `LICENSE`（EPL-2.0 原文）与 `README.md`
（版本、来源、再生成命令）。**不新增 package.json 依赖、install.sh/install.bat 不变**（文件随仓库分发，
无任何运行时网络请求）。加载：`createRequire(import.meta.url)` 同步 require，失败返回 null 走降级。

## 集成架构（异步边界）

`ELK#layout()` 返回 Promise（无同步 API），而 `specToDrawioXml` 是同步契约。采用**异步前置 pass**：

- 新模块 `scripts/dsl/auto-layout.js` 导出 `applyAutoLayout(spec) -> Promise<spec'>`：
  运行 elk，把结果**写回 spec 副本**——每个节点注入 `bounds: {x,y,width,height}`、每条边注入
  `waypoints: [{x,y}...]`——随后现有同步管线把它们当作手工 bounds/waypoints 消费，核心零改动。
- `cli.js` 已是顶层 await ESM：转换前若满足启用条件则 `spec = await applyAutoLayout(spec)`。
- 同步直调 `specToDrawioXml`（测试/库用户）不受影响：hierarchical 无注入时仍走旧网格并输出一条
  warning 提示走 CLI/异步 API 获得真分层。

**启用条件（R5 兼容闸门）**：`meta.layout === 'hierarchical'` 且 **所有节点均无显式 bounds/position**
（目标场景即"不手写 bounds"；混合模式 v1 不支持——只要有一个显式节点就整图跳过 elk 保持现状，
显式节点永不被移动）。`star`/`mesh` 归一化仍走旧网格路径，行为不变。elk 加载失败/布局异常 →
回退旧网格 + warning（AC 降级要求）。

## 复合图映射（R2 前半）

```
ELK graph = {
  id: 'root',
  layoutOptions: {
    'elk.algorithm': 'layered',
    'elk.direction': 'RIGHT',            // 对齐现网格的从左到右阅读方向
    'elk.edgeRouting': 'ORTHOGONAL',
    'elk.hierarchyHandling': 'INCLUDE_CHILDREN',  // 跨模块边全局路由
    'elk.layered.spacing.nodeNodeBetweenLayers': '64',
    'elk.spacing.nodeNode': '32',
    'elk.spacing.edgeNode': '24'
  },
  children: [
    { id: moduleId, layoutOptions: { 'elk.padding': '[top=56,left=24,bottom=24,right=24]' },
      children: [成员节点] },   // top 预留模块标题条（headerHeight 40 + 16）
    ...无模块节点
  ],
  edges: [{ id, sources: [from], targets: [to] }]   // 全部声明在 root 层
}
```

节点尺寸沿用 `getNodeSize(node.size, semanticType, label)`（语义尺寸不变）。

## 坐标与 waypoint 换算（R2 后半）

- elk 子节点坐标相对父容器：自根向下累加偏移得绝对坐标，整体加 `MARGIN = 40` 原点余量，
  `Math.round` 取整；**不做 8px snap**（避免 snap 重新引入重叠/短末段；与手工 bounds 同等对待）。
- 边取 `sections[0]`：边声明在 root 层，其 startPoint/bendPoints/endPoint 相对 root，直接 +MARGIN
  即页面绝对坐标。**只回放 bendPoints** 为 `edge.waypoints`（首末端点交给 draw.io 浮动吸附），
  相邻重复点（<1px）去重。
- 带 waypoints 的边在 `buildRoutedEdges` 第 1572 行既有短路：自动跳过挂点槽位分配 → elk 边为
  浮动端点 + 显式航点（与 star/mesh 航点先例一致，校验器已兼容）。
- `<Array as="points">` XML 发射与 SVG 渲染器航点回放（子任务 1 已修）为现成通道，无需改动。

## tiered 网络分层布局（R4，纯同步，不依赖 elk）

`calculateLayout` 新增 `tiered` 分支：

- 层级定序：`node.network.tier`（显式数字，最高优先）→ `ROLE_TIERS[node.network.role]` →
  `TYPE_TIERS[node.type]` → 默认中间层。
  `ROLE_TIERS = { internet: 0, wan: 0, isp: 0, firewall: 1, dmz: 1, router: 1, core: 2,
distribution: 3, access: 4, switch: 4, server: 5, endpoint: 5, host: 5, storage: 5 }`
  （external 在最上，North-South 惯例）。
- 每层一行自上而下：行距 96、行内间距 48、行内按（module 分组 → YAML 顺序）排列、整行水平居中；
  显式 bounds/position 节点保持原位不参与（与现有手工优先一致）。
- 边走既有默认面向/槽位逻辑（垂直主导 + R3 修复后的居中槽位），不生成航点。
- 模块框仍按成员自适应（现状机制）；跨行模块框允许拉高（网络分区通常与层对齐，可接受）。

## 挂点槽位修复（R3）

`buildRoutedEdges` 两个分配循环（源/目标组，行 1631-1643）：
`const slot = group.length === 1 ? 0.5 : getSlot(index)`。
FACE_SLOTS 常量与 ≥2 条时的 0.25/0.5/0.75… 分布保持不变。
同步更新 `edge-quality-rules.md` 措辞与受影响断言（mod-test 单边 0.5/0.5 为 AC）。

## 布局质量度量（R7）

新函数 `computeLayoutQualityMetrics(spec, layout, routedEdges)` →
`{ edgeNodeCrossings, edgeEdgeCrossings, totalEdgeLength }`：

- 每条边折线 = 起终点（面中点近似/浮动时取中心投影）+ waypoints；
- edgeNodeCrossings：线段与**非关联**节点矩形求交计数（穿框数）；
- edgeEdgeCrossings：折线段两两求交（共享端点的边对不计）；
- totalEdgeLength：折线长度和（px，取整）。

CLI `--validate` 追加一行 info：`Layout metrics: crossings(node)=X, crossings(edge)=Y, total-length=Z`。
测试断言：新 workflow 示例 `edgeNodeCrossings === 0`；两个既有代表示例的三项指标 pin 快照不劣化。

## 文档与示例（R6）

- **PRD 勘误**：`spec.schema.json` 在仓库中不存在（仅 theme.schema.json）——R6 实际落点为
  `references/docs/specification.md` 的 layout 枚举 + `SKILL.md` 布局/路由表，新增
  `hierarchical`（升级说明）与 `tiered` 条目及启用条件、降级行为。
- 新示例 ×2：`references/examples/auto-layout-workflow.yaml`（12 节点带分支/汇聚，无任何 bounds，
  `layout: hierarchical`）、`references/examples/tiered-network-topology.yaml`
  （internet→firewall→core→distribution→access→server）。均须过 `--validate --strict-warnings`。

## 兼容性（R5）

- horizontal/vertical/star/mesh：代码路径不动，输出逐字节不变（回归测试守护）。
- 全显式 bounds 的图（官方模板、学术示例）：elk 闸门直接跳过，坐标不变。
- hierarchical 无 bounds 的图经 CLI 输出改变——这是修复目标本身；同步 API 直调维持旧网格 + 提示。
- 新 warning 均 warning/info 级，strict 语义不变。

## 测试策略

- 单测（auto-layout.test.js）：elk 图映射（模块→children/padding/尺寸）、坐标换算（嵌套偏移+MARGIN）、
  bendPoints→waypoints（去重、取整）、闸门（显式节点跳过、star/mesh 不进）、降级（mock 加载失败）。
- R3：mod-test 单边 exitY/entryY=0.5；两条同面边仍 0.25/0.75 起分布。
- tiered：rank 定序、行内排序、显式节点不动。
- metrics：手工构造穿框/交叉用例断言计数；示例快照不劣化。
- 集成：12 节点 workflow AC（无重叠、无边质量告警）、tiered AC strict 通过、`npm test` 全绿、
  全示例渲染回归（既有示例输出坐标不变 diff 校验）。

## 回滚

- vendor 目录 + auto-layout.js 为纯新增；spec-to-drawio.js 改动集中在 R3 两行、tiered 分支、
  metrics 接线三处。单提交 revert 即整体回滚；elk 不可用时运行时自动降级等价于回滚后行为。

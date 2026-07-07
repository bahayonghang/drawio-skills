# Design — 主题样式保真与网络图标修正

## 事实基础（本次核实）

用 ref/drawio-skill 的 shape-index.json.gz（10446 条，draw.io 默认库全量）核实：

- `switch`、`cube`、`document`、`cylinder3`、`parallelogram`、`hexagon`、`cloud` 均为真实内置形状名（审计 #9 的怀疑对这些不成立）。
- **假名确认**：`mxgraph.cisco.firewalls.firewall`、`mxgraph.cisco.wireless.access_point`、`mxgraph.aws4.ec2_instance` 不存在（Desktop 空白框）。
  - 防火墙正名：`mxgraph.cisco.security.firewall`
  - AP 正名：`mxgraph.cisco.misc.access_point`（cisco.wireless.* 无 access_point）
  - EC2：aws4 无普通 `ec2*` stencil，正确形式为复合样式 `shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.ec2`（resIcon 目录 554 个）
  - `mxgraph.aws4.rds_instance`、`application_load_balancer`、`internet_gateway` 为真实普通 stencil。
- 内置（非 mxgraph.）形状名共 78 个；我方 6 个 ICON_PREFIXES 对应的 stencil 共约 1125 个。

## 改动点（全部在 `skills/drawio/scripts/dsl/spec-to-drawio.js` + 新目录模块）

### 1. R1 falsy 修复（`||` → `??`，仅数值/布尔主题读取）

- `generateModuleStyleWithSpec`: strokeWidth / rounded / labelFontSize / labelFontWeight
- `generateNodeStyleWithSpec`: strokeWidth 内层链、fontSize 全链
- `generateConnectorStyle`: strokeWidth 两层
- 字符串类（颜色/dashPattern）保持 `||`（空串无效语义不变）

### 2. R2 主题圆角消费

- 新增 `applyThemeRounding(shapeStyle, themeRounded)`：仅当 shapeStyle 含 `rounded=` 令牌时生效；`themeRounded>0` → `rounded=1;arcSize=min(themeRounded,50)`，`=0` → `rounded=0`（去掉 arcSize）。
- 例外：`arcSize>=50` 的 stadium（terminal 语义形状）不受主题圆角影响——胶囊是形状语义而非装饰。
- 节点侧 `nodeTheme.rounded ?? defaultTheme.rounded`；模块侧 `moduleTheme.rounded ?? 12`，0 输出 `rounded=0`（不再输出 arcSize）。

### 3. R3 字体解析链

`meta.font.<bucket>`（强制，AC 要求保持最高）> `node.style.fontFamily` > `theme.typography.fontFamily.<bucket>` > `getDefaultFontPolicy`。
bucket=cjk 在主题 typography 中缺失时落回内置策略（academic-paper 的 SimSun 回退保留）。

### 4. R4 图标映射修正

- `NETWORK_VENDOR_DEVICE_ICONS.aws.subnet` 删除 → deriveNodeIcon 返回 null → 语义类型 `subnet` 的 swimlane 组框（正确语义，且离线可验证）。
- `server/ec2/ec2_instance` → `aws.ec2`（经 resIcon 复合样式发出）。
- `ICON_ALIASES` 与 `NETWORK_VENDOR_DEVICE_ICONS.cisco`、`SHAPE_STYLES.firewall/ap` 换用正名。
- `generateNodeStyleWithSpec` icon 路径：iconShape 为 aws4 名且不在普通 stencil 目录但在 resIcon 目录 → 发 `shape=mxgraph.aws4.resourceIcon;resIcon=<name>;aspect=fixed`。
- SVG 渲染器 classifyShape 同步：新旧名都归类 firewall/wirelessAp（旧 .drawio 预览兼容）；测试夹具换正名。

### 5. R5 形状目录校验

- 新数据文件 `skills/drawio/assets/catalog/shape-catalog.json.gz`（gzip JSON：`builtin[78]` + `stencils[~1125]`（aws4/gcp2/azure/kubernetes/cisco/cisco19/networks 前缀）+ `aws4ResourceIcons[554]`，源注记 ref shape-index，≈15KB）。
- 新模块 `scripts/dsl/shape-catalog.js`：懒加载（首次调用才 fs+zlib），导出 `isKnownShapeName` / `isKnownAws4ResourceIcon` / `loadShapeCatalog`。
- `validateSpec` 增加逐节点检查：解析后的 iconShape 若为 `mxgraph.*` 需在 stencil 或 aws4 resIcon 目录，非 mxgraph 名需在 builtin 目录，否则 warning（"unknown shape"）。
- 单测自检：SHAPE_STYLES 发出的全部 `shape=` 令牌必须在目录内（防再次硬编码假名）。

### 6. R7 文档同步

- `references/docs/design-system/themes.md`：明确被消费的 token（typography.fontFamily.{primary,formula,cjk?}、node.<type>.rounded、module.rounded 含 0、strokeWidth 数值语义）。
- `assets/themes/theme.schema.json`：核对 rounded/typography 字段已在 schema；缺则补。
- `references/examples/aws-vpc-topology.yaml` 的 `icon: aws.ec2_instance` → `aws.ec2`；`references/official/style-reference.md` firewall 示例换正名。

## 兼容性

- 主题 JSON schema 不破坏（只是让既有字段生效）。
- 输出 XML 变化面：academic 主题（直角、字体栈）、tech-blue 等主题字体、cisco/aws 图标名——这些正是要修的行为；受影响断言随修复更新。
- 旧 .drawio 中的旧假名在 SVG 预览侧保持可渲染（classifyShape 双名兼容）。

## 测试策略

- spec-to-drawio.test.js：R1 rounded=0 断言（module+service）、字体链四级优先级、subnet 无 rds、ec2 resIcon 复合样式、正名映射、SHAPE_STYLES×目录自检、未知 icon warning。
- integration.test.js / drawio-to-svg.test.js 旧名断言更新为正名。
- 全主题 × 全示例渲染回归 + `npm test`。

## 回滚

代码集中在 spec-to-drawio.js + 新增独立模块/数据文件；revert 单提交即可。

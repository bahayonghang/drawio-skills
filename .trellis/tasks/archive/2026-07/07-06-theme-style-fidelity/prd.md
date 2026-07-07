# 主题样式保真与网络图标修正

## Goal

让主题 JSON 里声明的视觉意图真实生效，网络设备图标正确映射。当前 academic 主题声明的 IEEE 直角矩形、Latin Modern 公式字体栈全部被代码层吞掉或忽略；AWS 子网映射到 RDS 图标；发出的 stencil 形状名从未校验过是否真实存在。

## Problem Evidence（实证见父任务 research/audit-findings.md #7 #8 #9）

1. `generateModuleStyleWithSpec`：`moduleTheme.rounded || 12` 把 academic 主题 `module.rounded: 0` 当 falsy 吞掉 → 输出 `rounded=1;arcSize=12`（实测 XML 证实）。
2. `theme.node.*.rounded` 无任何消费点；SHAPE_STYLES 对 service 等类型硬编码 `rounded=1;arcSize=20` → academic 主题"直角"意图整体失效。
3. `resolveFontFamily` 只看 `spec.meta.font` 与 `node.style.fontFamily`，回退 `getDefaultFontPolicy`（硬编码 Times New Roman/SimSun）；`theme.typography.fontFamily`（tech-blue 的 Inter、academic 的 Latin Modern formula 栈）是死配置。
4. `NETWORK_VENDOR_DEVICE_ICONS.aws.subnet → 'aws.rds_instance'`：子网错映射为 RDS 实例图标。
5. 发出的形状名（`shape=switch`、`shape=cube;direction=south`、`mxgraph.cisco.firewalls.firewall`、`mxgraph.aws4.*` 拼接）无目录校验，拼错即 Desktop 渲染空白框；参考仓库以 shape-index.json.gz（10k+ 形状）+ shapesearch 解决。

## Requirements

- R1 falsy 修复：主题数值读取统一改 `??`（rounded/strokeWidth/padding/fontSize 等全部排查一遍）。
- R2 节点样式生成消费主题圆角：`theme.node.<type>.rounded`（含 default）能覆盖 SHAPE_STYLES 的硬编码 arcSize；academic 主题下 service/module 输出直角（rounded=0）。
- R3 字体解析链改为：`node.style.fontFamily` > `meta.font.<bucket>` > `theme.typography.fontFamily.<bucket>` > 内置默认；academic-paper 的 CJK 回退（SimSun）保留。
- R4 修正 aws.subnet 映射（用子网组框/正确图标，不得再指向 rds_instance）；vendor-device 映射表补单测。
- R5 建立形状名目录校验：维护一份本仓库允许发出的 mxgraph 形状清单（可借鉴 ref 仓库 shape-index 数据源），`validateSpec`/`--validate` 对 icon 与 SHAPE_STYLES 产出的 `shape=` 名做存在性检查，未知名报 warning。
- R6 对照 draw.io 实际 stencil 核实并修正现有可疑形状名（`shape=switch`、`shape=cube`、cisco/aws 前缀拼接结果），有 Desktop 时人工目检一次。
- R7 主题文档（design-system/themes.md、theme.schema.json）与新行为同步；明确哪些 token 会被消费。

## Acceptance Criteria

- [ ] academic 主题渲染 mod-test.yaml：module 与 service 节点样式为直角（无 arcSize 圆角），XML 断言进单测。
- [ ] tech-blue 主题节点 fontFamily 输出 Inter 栈；academic formula 节点输出主题声明的公式字体栈；meta.font 覆盖仍最高优先。
- [ ] `network.vendor: aws` + `device: subnet` 不再产出 rds_instance 图标。
- [ ] 用故意拼错的 icon 名跑 `--validate` 能得到"未知形状"warning。
- [ ] 全部主题 JSON × 全部示例 YAML 渲染无回归（快照或断言测试），`node --test` 通过。

## Constraints

- 主题 JSON 的对外 schema 尽量不破坏兼容；确需新增字段时同步 theme.schema.json。
- 形状清单数据文件的体积与加载方式要克制（懒加载/压缩），不拖慢 CLI 启动。

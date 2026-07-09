# 规格格式

YAML 规格是 Draw.io Skill 2.2.0 的规范表示方式。

Mermaid、CSV 和导入的 `.drawio` 都只是输入适配层，进入渲染前都应该先归一化成这个结构。

## 最小示例

```yaml
meta:
  theme: tech-blue
  layout: horizontal

nodes:
  - id: api
    label: API Gateway
    type: service
  - id: db
    label: PostgreSQL
    type: database

edges:
  - from: api
    to: db
    type: data
    label: Query
```

## 顶层结构

### `meta`

图表级设置。

```yaml
meta:
  theme: tech-blue
  layout: horizontal
  routing: orthogonal
  profile: default
  figureType: architecture
  title: Example Diagram
  source: generated
```

常见字段：

- `theme`：`tech-blue`、`academic`、`academic-color`、`nature`、`dark`、`high-contrast`
- `layout`：`horizontal`、`vertical`、`hierarchical`
- `routing`：`orthogonal`、`rounded`
- `profile`：`default`、`academic-paper`、`engineering-review`
- `figureType`：当 `profile=academic-paper` 时使用 `architecture`、`roadmap`、`workflow`
- `source`：`generated`、`replicated` 或 `edited`

字体策略：

```yaml
meta:
  font:
    primary: Times New Roman
    cjk: Times New Roman,SimSun
    formula: Times New Roman
```

- `meta.font` 会自动启用强制字体模式。
- `primary` 用于拉丁文本，`cjk` 用于中文/日文/韩文文本，`formula` 用于公式面。
- 支持逗号分隔的回退字体栈：`Times New Roman,SimSun` 让同一标签内的西文/数字落 Times New Roman、汉字落宋体（SimSun），符合中文论文排版惯例。
- 当 `meta.font` 存在时，它会覆盖受支持文本面的下层 `fontFamily` 设置。
- 当 `meta.font` 缺失时，所有 profile 对拉丁/公式文本使用 `Times New Roman`，对含 CJK 的文本使用 `Times New Roman,SimSun` 回退栈。
- 未显式指定 `style.fontSize` 时按字号梯子取值：模块标题 22、节点 20、边标签 18、独立文本 16（下限 12）；盒子随标签内容增长，显式 `bounds` 的盒子则按类统一收缩字号以保证不超框。
- `meta.print` 开启印刷可读性检查：`{ target: cn-thesis | ieee-single | ieee-double }` 或自定义 `widthPt`/`minPt`。当最小标签换算后低于下限（cn-thesis 440pt/9pt、ieee-single 252pt/8pt、ieee-double 516pt/8pt）时输出告警。

### `modules`

相关节点的逻辑容器。

```yaml
modules:
  - id: backend
    label: Backend
```

### `nodes`

必需。每个节点都需要稳定的 `id` 和 `label`。

```yaml
nodes:
  - id: api
    label: API Gateway
    type: service
    module: backend
    position:
      x: 160
      y: 96
    icon: aws.api-gateway
```

### `edges`

可选，但大多数图都会用到。

```yaml
edges:
  - from: api
    to: db
    type: data
    label: Query
    labelPosition: center
```

## 复刻元数据

复刻图通常会额外记录：

```yaml
meta:
  source: replicated
  replication:
    colorMode: preserve-original
    background: "#FFF7ED"
    palette:
      - hex: "#FDBA74"
        role: service fill
        appliesTo: nodes
        confidence: high
```

`colorMode` 可取值：

- `preserve-original`
- `theme-first`

## 文字保真字段

复刻图常常不只需要颜色元数据。只要文字位置有意义，就可以使用这些字段：

- `type: text`：用于独立标题、说明、callout、图例和注释；
- `bounds`：用于需要精确 top-left 几何的文本框；
- `type: formula` 或带官方公式分隔符的 `type: text`：用于公式注释；
- `labelPosition` 和 `labelOffset`：用于需要离开连线的边标签；
- `align`、`verticalAlign`、`spacing*`：用于可见的排版和内边距覆盖。

当 `position` 和 `bounds` 同时存在时，应该把 `bounds` 视为保真几何。

## 自动类型检测

当 `type` 省略时，标签仍可能自动映射到：

- `database`
- `decision`
- `terminal`
- `queue`
- `user`
- `document`
- `formula`
- 默认兜底：`service`

公式检测只应依赖：

- `$$...$$`
- `\(...\)`
- `` `...` ``

## 校验预期

编译器会检查：

- schema 与 ID 正确性
- 主题、profile、布局字段是否合法
- 开启 paper 模式时 academic `figureType` 是否有效
- 布局一致性
- 连线质量
- 开启 `academic-paper` 时的附加要求
- 复刻标签与公式的文字位置规则

如果你希望 warning 直接阻断输出，启用 strict 模式。

## 从 A-H 格式迁移

A-H 现在是历史格式。规范映射关系如下：

| 旧概念 | YAML 位置 |
|--------|-----------|
| 布局 | `meta.layout` |
| 模块 | `modules[]` |
| 节点 | `nodes[]` |
| 边 | `edges[]` |
| 视觉风格 | `meta.theme` 与 `style` 覆盖 |
| 导出意图 | 本地 CLI 或 Desktop 导出路径 |

## 相关

- [设计系统](./design-system.md)
- [CLI 工具](./cli.md)
- [复刻图表](./scientific-workflows.md)

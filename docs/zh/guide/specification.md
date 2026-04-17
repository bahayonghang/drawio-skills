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

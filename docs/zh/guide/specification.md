# 规格格式

YAML 规格格式是 Draw.io 技能 2.0 中定义图表的新标准。它用更直观、主题感知的结构替代了旧的 A-H 格式。

## 快速示例

```yaml
meta:
  theme: tech-blue
  layout: horizontal

modules:
  - id: backend
    label: 后端服务

nodes:
  - id: api
    label: API Gateway
    type: service
    module: backend
  - id: db
    label: PostgreSQL
    type: database
    module: backend

edges:
  - from: api
    to: db
    type: data
    label: 查询
```

## 结构

### meta（必需）

图表级别设置。

```yaml
meta:
  theme: tech-blue      # 主题名称（必需）
  layout: horizontal    # 布局方向（可选，默认：horizontal）
  routing: orthogonal   # 连接器路由（可选，默认：orthogonal）
  title: 我的图表       # 图表标题（可选）
```

**主题选项：** `tech-blue`、`academic`、`nature`、`dark`

**布局选项：** `horizontal`、`vertical`、`hierarchical`

**路由选项：** `orthogonal`、`rounded`、`curved`

### modules（可选）

节点的逻辑分组/容器。

```yaml
modules:
  - id: frontend        # 唯一标识符
    label: 前端         # 显示标签
    color: "#E0F2FE"    # 可选背景颜色覆盖
```

### nodes（必需）

图表元素。

```yaml
nodes:
  - id: api             # 唯一标识符（必需）
    label: API Gateway  # 显示标签（必需）
    type: service       # 语义类型（可选，自动检测）
    module: backend     # 父模块（可选）
    size: medium        # 尺寸预设（可选，默认：medium）
    style:              # 样式覆盖（可选）
      fillColor: "#custom"
```

**类型选项：** `service`、`database`、`decision`、`terminal`、`queue`、`user`、`document`、`formula`

**尺寸选项：** `small` (80×40)、`medium` (120×60)、`large` (160×80)、`xl` (200×100)

### edges（可选）

节点之间的连接。

```yaml
edges:
  - from: api           # 源节点 id（必需）
    to: db              # 目标节点 id（必需）
    type: data          # 连接器类型（可选，默认：primary）
    label: 查询         # 边标签（可选）
    style:              # 样式覆盖（可选）
      strokeColor: "#custom"
```

**类型选项：** `primary`、`data`、`optional`、`dependency`、`bidirectional`

## 完整示例

```yaml
meta:
  theme: tech-blue
  layout: horizontal
  title: 电商架构

modules:
  - id: frontend
    label: 前端层
  - id: backend
    label: 后端服务
  - id: data
    label: 数据层

nodes:
  # 前端
  - id: web
    label: Web 应用
    type: service
    module: frontend
  - id: mobile
    label: 移动应用
    type: service
    module: frontend

  # 后端
  - id: api
    label: API Gateway
    type: service
    module: backend
  - id: auth
    label: 认证服务
    type: service
    module: backend
  - id: order
    label: 订单服务
    type: service
    module: backend

  # 数据
  - id: postgres
    label: PostgreSQL
    type: database
    module: data
  - id: redis
    label: Redis 缓存
    type: database
    module: data
  - id: kafka
    label: Kafka
    type: queue
    module: data

edges:
  # 前端到 API
  - from: web
    to: api
    type: primary
  - from: mobile
    to: api
    type: primary

  # API 到服务
  - from: api
    to: auth
    type: primary
    label: 认证
  - from: api
    to: order
    type: primary
    label: 订单

  # 服务到数据
  - from: auth
    to: postgres
    type: data
  - from: order
    to: postgres
    type: data
  - from: order
    to: redis
    type: data
    label: 缓存
  - from: order
    to: kafka
    type: data
    label: 事件
```

## 类型自动检测

如果未指定 `type`，将从标签自动检测：

| 关键词 | 检测类型 |
|--------|----------|
| database, db, sql, storage, redis, mongo, postgresql, mysql, cache | `database` |
| decision, condition, branch, switch, route 或 `?` | `decision` |
| start, begin, end, finish, stop, terminate | `terminal` |
| queue, buffer, kafka, rabbitmq, stream, sqs, message | `queue` |
| user, actor, client, person, customer | `user` |
| document, doc, file, report, log | `document` |
| `$$`、`\(`、`\[` | `formula` |
| （默认） | `service` |

## 从 A-H 格式迁移

### 之前（A-H 格式）

```
【A 布局】3:2，左→右
【B 模块】Frontend | Backend | Data
【C 节点】
- n1: API Gateway
- n2: PostgreSQL
【D 连线】n1→n2(数据)
【G 视觉】蓝色主题
```

### 之后（YAML 规格）

```yaml
meta:
  theme: tech-blue
  layout: horizontal

modules:
  - id: frontend
    label: Frontend
  - id: backend
    label: Backend
  - id: data
    label: Data

nodes:
  - id: n1
    label: API Gateway
    type: service
    module: backend
  - id: n2
    label: PostgreSQL
    type: database
    module: data

edges:
  - from: n1
    to: n2
    type: data
```

### 迁移映射

| A-H 节 | YAML 对应 |
|--------|-----------|
| A（布局） | `meta.layout` |
| B（模块） | `modules[]` |
| C（节点） | `nodes[]` |
| D（连线） | `edges[]` |
| E（分组） | `modules[]` + `nodes[].module` |
| F（方法） | 节点标签 |
| G（视觉） | `meta.theme` + `style` 覆盖 |
| H（导出） | 由 MCP 工具处理 |

## 验证规则

1. **必需字段：**
   - `meta.theme`
   - `nodes` 数组至少包含一个节点
   - 每个节点必须有 `id` 和 `label`

2. **唯一 ID：**
   - 所有节点 ID 必须唯一
   - 所有模块 ID 必须唯一

3. **有效引用：**
   - `edges.from` 和 `edges.to` 必须引用现有节点 ID
   - `nodes.module` 必须引用现有模块 ID

4. **复杂度限制：**
   - 超过 20 个节点警告
   - 超过 30 个节点错误
   - 超过 30 条边警告

## 相关

- [设计系统](./design-system.md) - 主题、形状、连接器
- [工作流](./workflows.md) - 如何使用规格
- [数学公式排版](./math-typesetting.md) - 规格中的 LaTeX

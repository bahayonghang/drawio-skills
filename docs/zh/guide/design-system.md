# 设计系统

Draw.io 技能设计系统 2.0 提供统一的主题、语义形状和类型化连接器，用于专业图表创建。

## 概览

```
┌─────────────────────────────────────────────────────────────┐
│                    设计系统 2.0                              │
├─────────────────┬─────────────────┬────────────────────────┤
│  4 个主题       │  8 种形状       │  5 种连接器            │
│  - tech-blue    │  - service      │  - primary             │
│  - academic     │  - database     │  - data                │
│  - nature       │  - decision     │  - optional            │
│  - dark         │  - terminal     │  - dependency          │
│                 │  - queue        │  - bidirectional       │
│                 │  - user         │                        │
│                 │  - document     │  8px 网格系统          │
│                 │  - formula      │  自动对齐              │
└─────────────────┴─────────────────┴────────────────────────┘
```

## 主题

### tech-blue（默认）

**使用场景：** 技术文档、软件架构、仪表板

| 令牌 | 值 |
|------|-----|
| 主色 | `#2563EB` |
| 主色浅 | `#DBEAFE` |
| 副色 | `#059669` |
| 背景 | `#FFFFFF` |
| 文字 | `#1E293B` |

```
/drawio-create --theme tech-blue
```

### academic

**使用场景：** IEEE 论文、学术出版、打印就绪图表

| 令牌 | 值 |
|------|-----|
| 主色 | `#1F2937` |
| 主色浅 | `#F3F4F6` |
| 副色 | `#4B5563` |
| 背景 | `#FFFFFF` |
| 文字 | `#111827` |

特点：
- 打印高对比度
- 灰度友好
- 衬线字体支持

```
/drawio-create --theme academic
```

### nature

**使用场景：** 环境图表、生命周期流程、可持续发展

| 令牌 | 值 |
|------|-----|
| 主色 | `#059669` |
| 主色浅 | `#D1FAE5` |
| 副色 | `#0D9488` |
| 背景 | `#F0FDF4` |
| 文字 | `#064E3B` |

```
/drawio-create --theme nature
```

### dark

**使用场景：** 演示文稿、暗色模式 UI、视频内容

| 令牌 | 值 |
|------|-----|
| 主色 | `#60A5FA` |
| 主色浅 | `#1E3A5F` |
| 背景 | `#0F172A` |
| 表面 | `#1E293B` |
| 文字 | `#F1F5F9` |

```
/drawio-create --theme dark
```

## 语义形状

形状从标签自动检测或用 `type:` 显式指定。

### service（默认）

圆角矩形，用于组件、服务和流程。

```yaml
nodes:
  - id: api
    label: API Gateway
    type: service  # 可选，自动检测
```

**自动检测关键词：** 无（未识别标签的默认值）

### database

圆柱体形状，用于数据存储。

```yaml
nodes:
  - id: db
    label: PostgreSQL
    type: database
```

**自动检测关键词：** database, db, sql, storage, redis, mongo, postgresql, mysql, cache

### decision

菱形，用于条件和分支。

```yaml
nodes:
  - id: check
    label: 是否有效？
    type: decision
```

**自动检测关键词：** decision, condition, branch, switch, route，或以 `?` 结尾的标签

### terminal

体育场/药丸形状，用于开始/结束点。

```yaml
nodes:
  - id: start
    label: 开始
    type: terminal
```

**自动检测关键词：** start, begin, end, finish, stop, terminate

### queue

平行四边形，用于消息队列和缓冲区。

```yaml
nodes:
  - id: mq
    label: Kafka
    type: queue
```

**自动检测关键词：** queue, buffer, kafka, rabbitmq, stream, sqs, message

### user

椭圆，用于参与者和用户。

```yaml
nodes:
  - id: actor
    label: 客户
    type: user
```

**自动检测关键词：** user, actor, client, person, customer

### document

文档形状，用于报告和文件。

```yaml
nodes:
  - id: report
    label: 报告
    type: document
```

**自动检测关键词：** document, doc, file, report, log

### formula

白色框，优化 LaTeX 数学公式。

```yaml
nodes:
  - id: eq
    label: "$$E = mc^2$$"
    type: formula
```

**自动检测：** 包含 `$$`、`\(` 或 `\[` 的标签

## 连接器

### primary

主流程连接。

```yaml
edges:
  - from: a
    to: b
    type: primary
```

| 属性 | 值 |
|------|-----|
| 线条 | 2px 实线 |
| 箭头 | 实心块状 |
| 颜色 | 主题文字颜色 |

### data

数据传输连接。

```yaml
edges:
  - from: api
    to: db
    type: data
```

| 属性 | 值 |
|------|-----|
| 线条 | 2px 虚线 (6 4) |
| 箭头 | 实心块状 |
| 颜色 | 主题文字颜色 |

### optional

可选或条件路径。

```yaml
edges:
  - from: a
    to: b
    type: optional
```

| 属性 | 值 |
|------|-----|
| 线条 | 1px 虚线 (2 2) |
| 箭头 | 开放 |
| 颜色 | 主题弱化颜色 |

### dependency

依赖关系。

```yaml
edges:
  - from: a
    to: b
    type: dependency
```

| 属性 | 值 |
|------|-----|
| 线条 | 1px 实线 |
| 箭头 | 菱形 |
| 颜色 | 主题文字颜色 |

### bidirectional

双向连接。

```yaml
edges:
  - from: a
    to: b
    type: bidirectional
```

| 属性 | 值 |
|------|-----|
| 线条 | 1.5px 实线 |
| 箭头 | 无 |
| 颜色 | 主题弱化颜色 |

## 8px 网格系统

所有位置对齐到 8px 增量：

| 间距 | 值 | 用途 |
|------|-----|------|
| 1 单位 | 8px | 最小边距 |
| 2 单位 | 16px | 小间距 |
| 3 单位 | 24px | 模块内边距 |
| 4 单位 | 32px | 节点间距 |
| 5 单位 | 40px | 分区间距 |

## 复杂度护栏

设计系统包含自动复杂度检查：

| 指标 | 警告 | 错误 |
|------|------|------|
| 节点 | >20 | >30 |
| 边 | >30 | >50 |
| 模块 | >5 | - |
| 标签长度 | >14 字符 | - |

超过阈值时：
- **警告：** 建议简化
- **错误：** 需要确认后继续

## 自定义主题

通过扩展基础结构创建自定义主题：

```json
{
  "name": "my-theme",
  "colors": {
    "primary": "#your-color",
    "primaryLight": "#your-light",
    "secondary": "#your-secondary",
    "background": "#ffffff",
    "text": "#000000"
  },
  "node": {
    "default": {
      "fillColor": "#your-fill",
      "strokeColor": "#your-stroke"
    }
  }
}
```

## 相关

- [规格格式](./specification.md) - YAML 规格参考
- [工作流](./workflows.md) - 如何使用设计系统
- [数学公式排版](./math-typesetting.md) - LaTeX 支持

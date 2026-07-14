# 架构图

软件架构、云系统、微服务和部署视图使用 Base Skill；如果同一张图用于论文出版，则使用 Academic Overlay。

## 选择视觉风格

- `tech-blue`：通用浅色工程文档
- `arch-dark`：按角色着色的深色架构图与云架构图
- `blueprint`：正式架构、UML 和网络拓扑
- `academic` 或 `academic-color`：通过 Overlay 生成出版图

```yaml
meta:
  title: Order Platform Architecture
  theme: arch-dark
  layout: horizontal
```

## 将角色映射为语义类型

| 角色 | 节点类型 |
|---|---|
| 客户端或前端 | `user` |
| 后端 API 或 worker | `service` 或 `process` |
| 数据库或持久化存储 | `database` |
| 云托管服务 | `cloud` |
| 事件总线或队列 | `queue` |
| 第三方系统 | `terminal` 或 `document` |

让主题负责角色颜色。只有源图或产品身份确实要求时，才显式覆盖填充色。

## 边界与标签

Region、account、network 和 security group 使用透明 `modules` 表示。模块标签放在成员节点上方，并为标题预留足够空间。

技术栈需要呈现时，可使用简短的双行标签：

```yaml
nodes:
  - id: api
    label: "API Server\nFastAPI :8000"
    type: service
    module: app
```

## 连接语义

| 含义 | 边类型 |
|---|---|
| 主要请求路径 | `primary` |
| 数据或异步流 | `data` |
| 鉴权或可选关系 | `optional` |
| 基础设施依赖 | `dependency` |

每条连接线都必须绑定 source 与 target 节点 id。协议和端口写在边标签中，并通过校验发现交叉、重叠和标签间距问题。

## 架构图检查表

1. 使用云厂商图标前先搜索 bundled stencil catalog。
2. 只有身份确实重要的组件才使用 provider icon。
3. 消息总线节点放在生产者与消费者行之间。
4. 图例必须位于所有模块边界之外。
5. 优先使用自动布局，再考虑手工位置。
6. 交付前运行校验并检查导出图像。

## 相关内容

- [图标与 Stencil 搜索](./icons-stencils.md)
- [主题与样式预设](./themes-presets.md)
- [连接线与边质量](./connectors.md)
- [架构图示例](/zh/examples/architecture.md)

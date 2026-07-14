# 设计系统

设计系统把语义 YAML 转换为一致的节点、模块、字体、连接线和 canvas 样式。优先使用语义类型与主题；只有很小的 XML 例外才使用 raw Draw.io style。

## 编写层次

1. **Profile** 设置工作流策略：`default`、`academic-paper` 或 `engineering-review`。
2. **Theme** 设置 canvas、字体、节点、模块和连接线 token。
3. **语义类型** 表达 service、database、Agent、memory 或 tool 等角色。
4. **Typed connector** 表达 primary、data、dependency、control、memory 和 feedback flow。
5. **显式覆盖** 在复刻或品牌确有要求时保留源图细节。

## Bundled Themes

| 主题 | 主要用途 |
|---|---|
| `tech-blue` | 通用技术图 |
| `notion-clean` | 极简文档和结构化表格 |
| `blueprint` | 正式架构、UML 和网络 |
| `arch-dark` | 按角色着色的云和服务架构 |
| `dark-terminal` | 开发者与 Agent 系统 |
| `dark-luxury` | 编辑式或 keynote 图表 |
| `nature` | 生命周期和自然主题 |
| `dark` | 通用演示工作 |
| `high-contrast` | 无障碍与最大可读性 |
| `academic` | 灰度安全出版图 |
| `academic-color` | 彩色出版图 |

选择或定制主题前先阅读[主题与样式预设](./themes-presets.md)。

## 语义节点类型

核心类型包括 `service`、`process`、`database`、`decision`、`terminal`、`queue`、`user`、`document`、`cloud`、`formula` 和透明 `text`。

Agent 图增加 `llm`、`agent`、`vector_store`、`memory`、`tool` 与 `gateway`。厂商身份通过经过校验的 icon 或 stencil 表达，不能编造 shape 名称。

## Modules 与布局

Region、layer、network、swimlane、account 和 security boundary 使用 `modules`。添加显式位置前，优先尝试 `horizontal`、`vertical`、`hierarchical`、`tiered` 或 `star`。复刻源图或保留文字位置时使用显式 `bounds`。

Base grid 以 8 个单位递增，常用 node gap 约 32，module padding 约 24。这些是默认值，不应强迫所有图使用同一种密度。

## Typed Connectors

通用 flow 类型包括 `primary`、`data`、`optional`、`dependency` 和 `bidirectional`。Agent 与记忆系统增加 `control`、`memory_read`、`memory_write`、`async` 和 `feedback`。

每条连接线都必须绑定 node id。路由与校验规则见[连接线与边质量](./connectors.md)。

## 文字、公式与复刻

- `text` 节点透明，并根据内容确定尺寸。
- `formula` 节点和标签使用支持的 MathJax 或 AsciiMath 定界符。
- 复刻使用 `bounds`、`labelOffset`、alignment 和 spacing 保留可见文字几何。
- 显式源图颜色不会随之后的主题切换改变。

## 按任务查看指南

- [架构图](./architecture-diagrams.md)
- [Agent 与记忆图](./agent-diagrams.md)
- [图标与 Stencil 搜索](./icons-stencils.md)
- [数学公式排版](./math-typesetting.md)
- [学术出版 Overlay](./academic-overlay.md)

## 自定义主题与预设

自定义主题是经过 schema 校验的 JSON token set。修改 user style preset 前，应先复制 bundled preset。不能直接修改 bundled base preset，也不能把主题复制到 Academic Overlay。

## 相关内容

- [规格格式](./specification.md)
- [创建图表](./creating-diagrams.md)
- [复刻图表](./scientific-workflows.md)

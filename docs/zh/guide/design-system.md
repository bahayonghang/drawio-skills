# 设计系统

Draw.io 设计系统为工程图、学术图和演示图提供统一、稳定的视觉语言。

## 核心概念

### Profile

| Profile | 作用 |
|---------|------|
| `default` | 常规图表 |
| `academic-paper` | IEEE、学位论文、期刊论文和 paper-ready figure |
| `engineering-review` | 架构图或网络图等高密度评审场景，带更严格的连线路由审查 |

### 6 个内置主题

| 主题 | 最适合的场景 |
|------|--------------|
| `tech-blue` | 软件架构、DevOps、常规技术图 |
| `academic` | 灰度安全论文图、IEEE 配图 |
| `academic-color` | 彩色论文图、研究演示 |
| `nature` | 生命周期、生物、环境、可持续议题 |
| `dark` | 演示文稿和深色资产 |
| `high-contrast` | 无障碍优先和极致可读性 |

### 语义节点类型

| 类型 | 形状 |
|------|------|
| `service` | 圆角矩形 |
| `database` | 圆柱体 |
| `decision` | 菱形 |
| `terminal` | 胶囊形 |
| `queue` | 平行四边形 |
| `user` | 椭圆 |
| `document` | 文档形 |
| `formula` | 适合承载数学内容的矩形 |

### 类型化连接器

| 类型 | 用途 |
|------|------|
| `primary` | 主流程 |
| `data` | 数据或异步流 |
| `optional` | 弱关系 |
| `dependency` | 依赖标注 |
| `bidirectional` | 双向关系 |

### 8px 网格默认值

- 节点间距：`32px`
- 模块内边距：`24px`
- 画布边距：`32px`

## 主题切换

修改规格中的主题字段并重新渲染后，基于 theme token 的样式会自动跟随新主题。

显式写死的颜色覆盖不会随着主题切换而变化。

## 复刻颜色模式

| 模式 | 含义 |
|------|------|
| `preserve-original` | 把提取到的源图颜色保留为显式覆盖 |
| `theme-first` | 让重绘结果优先服从目标主题 |

## 学术图注意事项

当输出使用 `academic-paper` 时：

- 除非明确要求彩色，否则优先 `academic`
- 建议补全 `title`，必要时补 `legend`
- 不要仅靠颜色表达语义差异

## 自定义主题

自定义主题是扩展主题 schema 的 JSON 文件，至少应定义：

- `name`
- `displayName`
- `colors`
- `spacing`
- `typography`
- `node`
- `connector`
- `module`
- `canvas`

具体字段见 `skills/drawio/references/docs/design-system/`。

## 相关

- [规格格式](./specification.md)
- [创建图表](./creating-diagrams.md)
- [复刻图表](./scientific-workflows.md)
- [数学公式排版](./math-typesetting.md)

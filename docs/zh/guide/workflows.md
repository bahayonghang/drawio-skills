# 工作流概览

Draw.io 技能提供 3 个清晰的工作流，与设计系统 2.0 完美集成。

## 快速参考

| 命令 | 说明 | 主题 | 语义类型 |
|------|------|------|----------|
| `/drawio-create` | 从自然语言创建 | ✅ 可选择 | ✅ 自动检测 |
| `/drawio-replicate` | 复刻现有图片 | ✅ 基于领域 | ✅ 映射 |
| `/drawio-edit` | 修改现有图表 | ✅ 可切换 | ✅ 保留 |

## `/drawio-create` - 从零开始创建

从自然语言创建图表，完整支持设计系统。

### 基本用法

```
/drawio-create
创建一个带验证和错误处理的登录流程图
```

### 带主题选择

```
/drawio-create --theme tech-blue
微服务架构：
- API Gateway 连接 User Service 和 Order Service
- 两个服务都使用 PostgreSQL 数据库
- Redis Cache 用于会话存储
```

### 带显式类型

```
/drawio-create --theme academic
神经网络架构：
- Input Layer（service）
- Hidden Layer 1（service）
- Hidden Layer 2（service）
- Output Layer（terminal）
- 损失函数：$$L = -\sum y \log(\hat{y})$$（formula）
```

### 设计系统特性

| 特性 | 行为 |
|------|------|
| 主题 | 用 `--theme` 选择，默认 `tech-blue` |
| 形状 | 从标签自动检测（database、queue 等） |
| 连接器 | 从上下文推断（data、optional、dependency） |
| 网格 | 所有位置对齐到 8px 网格 |
| 布局 | 默认水平，用 `--layout vertical` 垂直 |

**复杂度护栏：**
- 超过 20 个节点警告（建议拆分）
- 超过 30 个节点错误（需要确认）
- 标签超过 14 个字符提示

→ [详细文档](./creating-diagrams.md)

## `/drawio-replicate` - 复刻现有图片

使用结构化提取从图片重建图表，支持主题映射。

### 基本用法

```
/drawio-replicate
[上传图片]
```

### 带主题覆盖

```
/drawio-replicate --theme academic
[上传架构截图]
```

### 基于领域的主题选择

| 领域 | 推荐主题 |
|------|----------|
| 软件架构 | `tech-blue` |
| 商业流程 | `tech-blue` |
| 科研流程 | `academic` |
| 工业流程 | `nature` |
| 演示文稿 | `dark` |

### 提取过程

1. **分析** - 从图片提取视觉元素
2. **映射** - 转换为语义形状和类型化连接器
3. **应用主题** - 使用选择或推断的主题样式化
4. **生成** - 创建 YAML 规格然后 draw.io XML
5. **预览** - 在浏览器实时显示

### 语义映射

| 视觉元素 | 语义类型 |
|----------|----------|
| 圆角矩形 | `service` |
| 圆柱体/数据库图标 | `database` |
| 菱形 | `decision` |
| 圆形 | `terminal` 或 `user` |
| 平行四边形 | `queue` |
| 文档形状 | `document` |

→ [详细文档](./scientific-workflows.md)

## `/drawio-edit` - 修改图表

编辑现有图表，同时保持设计系统一致性。

### 基本用法

```
/drawio-edit
将 "用户服务" 改为 "认证服务"
```

### 主题切换

```
/drawio-edit --theme dark
转换为演示模式
```

### 样式操作

```
/drawio-edit
- 将 API Gateway 改为强调色
- 将所有服务节点转换为数据库类型
- 异步连接使用数据流样式
```

### 添加元素

```
/drawio-edit
在 API 和数据库之间添加 "Redis Cache" 节点（service 类型）
用数据流箭头连接
```

### 结构变更

```
/drawio-edit --restructure --theme academic
重组为 3 个模块：
- 输入层
- 处理层
- 输出层
```

### 保留规则

| 编辑类型 | 主题行为 |
|----------|----------|
| 添加节点 | 使用当前主题样式 |
| 添加边 | 使用当前主题连接器 |
| 修改样式 | 建议主题兼容颜色 |
| 切换主题 | 重新应用所有样式 |
| 移动节点 | 对齐到 8px 网格 |

→ [详细文档](./editing-diagrams.md)

## 设计系统集成

所有三个工作流共享相同的设计系统：

### 4 个内置主题

```
tech-blue   # 默认，专业蓝色
academic    # IEEE 就绪灰度
nature      # 绿色环保
dark        # 演示模式
```

### 8 种语义节点类型

```yaml
service    # 圆角矩形（默认）
database   # 圆柱体形状
decision   # 菱形
terminal   # 体育场形状
queue      # 平行四边形
user       # 椭圆
document   # 文档形状
formula    # 白色框支持数学
```

### 5 种连接器类型

```yaml
primary      # 实线 2px，块状箭头
data         # 虚线，数据流
optional     # 细虚线，可选路径
dependency   # 菱形箭头末端
bidirectional # 无箭头
```

### 8px 网格系统

所有位置对齐到 8px 增量：
- 节点间距：32px（4 单位）
- 模块内边距：24px（3 单位）
- 最小边距：8px（1 单位）

## YAML 规格格式

内部使用的新规格格式：

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

edges:
  - from: api
    to: db
    type: data
    label: 查询
```

→ [规格格式](./specification.md)

## 下一步

- [创建图表](./creating-diagrams.md) - 完整 `/drawio-create` 指南
- [科研工作流](./scientific-workflows.md) - 完整 `/drawio-replicate` 指南
- [编辑图表](./editing-diagrams.md) - 完整 `/drawio-edit` 指南
- [设计系统](./design-system.md) - 主题、形状、连接器
- [规格格式](./specification.md) - YAML 规格参考
- [示例](/zh/examples/) - 真实图表示例

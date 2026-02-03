# 创建图表 (`/drawio create`)

学习如何使用自然语言结合设计系统 2.0 创建各种类型的图表。

## 快速开始

```
/drawio create
创建一个带验证和错误处理的登录流程图
```

指定主题：

```
/drawio create with tech-blue theme
微服务架构，包含 API Gateway、User Service 和 PostgreSQL
```

## 基本工作流

1. **触发**：使用 `/drawio create` 命令或关键词"创建"、"生成"、"画"
2. **启动会话**：Claude 调用 `start_session` 打开浏览器
3. **生成规格**：Claude 创建带设计系统样式的 YAML 规格
4. **转换为 XML**：通过 `spec-to-drawio.js` 转换规格
5. **实时预览**：图表在浏览器中即时显示
6. **迭代修改**：使用 `/drawio edit` 进行调整

## 设计系统支持

### 主题选择

| 主题 | 使用场景 | 命令 |
|------|----------|------|
| `tech-blue`（默认） | 软件架构、DevOps | 无需标志 |
| `academic-color` ⭐ | 学术论文、研究（彩色） | "with academic-color theme" |
| `academic` | IEEE 灰度打印 | "with academic theme" |
| `nature` | 环境、生命周期 | "with nature theme" |
| `dark` | 演示、幻灯片 | "with dark theme" |

> ⭐ **学术推荐**：数字文档使用 `academic-color`，仅在严格灰度要求时使用 `academic`。

### 语义节点类型

形状从标签自动检测或显式指定：

| 类型 | 形状 | 自动检测关键词 |
|------|------|----------------|
| `service` | 圆角矩形 | API、service、gateway、backend |
| `database` | 圆柱体 | DB、SQL、storage、redis、mongo |
| `decision` | 菱形 | if、check、condition，或标签含 `?` |
| `terminal` | 体育场形 | start、end、begin、finish |
| `queue` | 平行四边形 | queue、buffer、kafka、stream |
| `user` | 圆形 | user、actor、client、customer |
| `document` | 波浪矩形 | doc、file、report、document |
| `formula` | 白色矩形 | equation、formula、`$$` |

### 连接器类型

| 类型 | 样式 | 使用场景 |
|------|------|----------|
| `primary` | 实线 2px，填充箭头 | 主流程（默认） |
| `data` | 虚线 2px，填充箭头 | 数据/异步流 |
| `optional` | 点线 1px，空心箭头 | 弱关系 |
| `dependency` | 实线 1px，菱形箭头 | 依赖关系 |
| `bidirectional` | 实线 1.5px，无箭头 | 关联 |

### 8px 网格系统

所有位置对齐到 8px 增量：
- 节点间距：32px（4 单位）
- 模块内边距：24px（3 单位）
- 画布边距：32px（4 单位）

## 示例

### 流程图

```
/drawio create
创建用户登录流程：
- 开始（terminal）
- 输入凭据
- 验证检查（decision）
- 成功 → 仪表板
- 错误 → 返回登录
```

### AWS 架构

```
/drawio create with tech-blue theme
AWS 无服务器架构：
- API Gateway（service）入口
- Lambda（service）业务逻辑
- DynamoDB（database）存储
- S3（storage）静态文件
使用 AWS 图标，显示数据流
```

### 学术图表

```
/drawio create with academic theme
神经网络训练流程：
- 数据预处理
- 模型训练（损失函数：$$L = -\sum y_i \log(\hat{y}_i)$$）
- 验证
- 部署
```

## YAML 规格格式

对于复杂图表，使用结构化格式显式 YAML 规格：

```yaml
meta:
  theme: tech-blue
  layout: horizontal

modules:
  - id: frontend
    label: 前端层
  - id: backend
    label: 后端服务

nodes:
  - id: web
    label: Web 应用
    type: service
    module: frontend
  - id: api
    label: API Gateway
    type: service
    module: backend
  - id: db
    label: PostgreSQL
    type: database
    module: backend

edges:
  - from: web
    to: api
    type: primary
  - from: api
    to: db
    type: data
    label: 查询
```

请求结构化格式：
```
/drawio create with structured format
创建微服务架构...
```

## 复杂度护栏

| 指标 | 警告 | 错误 |
|------|------|------|
| 节点 | >20 | >30 |
| 边 | >30 | >50 |
| 模块 | >5 | - |
| 标签长度 | >14 字符 | - |

超过阈值时，Claude 会建议拆分为子图表。

## 最佳实践

1. **内容在组件中** - 优先将文字和公式嵌入节点（形状），而非独立文本框
2. **指定主题** - 使用 "with [theme] theme" 保持图表样式一致
3. **使用语义类型** - 让设计系统自动选择形状
4. **保持简单** - 每个图表目标 ≤20 个节点
5. **使用模块** - 分组相关组件以便更好组织

## 下一步

- [复刻图表](./scientific-workflows.md) - `/drawio replicate` 工作流
- [编辑图表](./editing-diagrams.md) - `/drawio edit` 工作流
- [设计系统](./design-system.md) - 主题、形状、连接器参考
- [规格格式](./specification.md) - YAML 规格参考
- [导出与保存](./export.md) - 保存图表
- [示例](/zh/examples/) - 更多示例

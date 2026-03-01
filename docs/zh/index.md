---
layout: home

hero:
  name: "Draw.io 技能"
  text: "Claude Code 专用"
  tagline: AI 驱动的图表创建，内置设计系统，提供实时浏览器预览
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: 在 GitHub 查看
      link: https://github.com/bahayonghang/drawio-skills

features:
  - icon: 🎨
    title: 设计系统 2.0
    details: 5 个内置主题（tech-blue、academic、academic-color、nature、dark），8px 网格系统，语义形状，类型化连接器。

  - icon: 🚀
    title: 3 个清晰的工作流
    details: /drawio create 创建新图表，/drawio replicate 复刻图片，/drawio edit 修改图表

  - icon: 📝
    title: YAML 规格格式
    details: 简单、可读的规格格式，支持主题选择、语义节点和类型化边。

  - icon: 🔄
    title: 实时预览
    details: Claude 创建图表时，在浏览器中实时查看更新。

  - icon: ☁️
    title: 云架构支持
    details: AWS、GCP、Azure 图标，使用官方图标库（mxgraph.aws4.*、mxgraph.gcp2.*、mxgraph.azure.*）。

  - icon: ∑
    title: 数学公式排版
    details: LaTeX/AsciiMath 公式，MathJax 渲染。IEEE/学术出版就绪。

  - icon: 🛡️
    title: 复杂度护栏
    details: 超过 20 个节点、30 条边、14 字符标签时自动警告，保持图表可读性。

  - icon: 💾
    title: 导出与保存
    details: 保存为 .drawio 文件或转换为独立 SVG（内嵌 XML 支持双向编辑）。支持 CLI 工具。

  - icon: 🔧
    title: CLI 工具
    details: 通过命令行将 YAML 转换为 draw.io XML 或 SVG。支持主题选择、严格模式和 XML 验证。

  - icon: 🏷️
    title: 云图标
    details: 通过 node.icon 字段支持 AWS、GCP、Azure、Kubernetes 图标。自动映射到 mxgraph 图标库。

  - icon: ✅
    title: XML 验证
    details: 生成 XML 的结构验证。检查 ID 唯一性、边引用完整性和根节点存在性。
---

## 快速开始 - 3 个工作流

| 命令 | 说明 | 主题支持 |
|------|------|----------|
| `/drawio create` | 从自然语言创建图表 | ✅ 自动主题 |
| `/drawio replicate` | 复刻现有图片 | ✅ 领域主题 |
| `/drawio edit` | 修改现有图表 | ✅ 主题切换 |

### 示例：使用设计系统创建

```
/drawio create with tech-blue theme
微服务架构：
- API Gateway（service）
- User Service（service）
- Order Service（service）
- PostgreSQL（database）
- Redis Cache（database）
所有服务通过数据流箭头连接
```

### 示例：带主题复刻

```
/drawio replicate with academic theme
[上传架构图片]
```

### 示例：切换主题编辑

```
/drawio edit with dark theme
转换为演示模式
```

## 设计系统特性

### 5 个内置主题

| 主题 | 使用场景 | 颜色 |
|------|----------|------|
| `tech-blue` | 技术文档、仪表板 | 蓝色主色调，现代风格 |
| `academic` | IEEE 论文、学术出版 | 灰度，高对比度 |
| `academic-color` | 学术彩色版、会议海报 | 蓝绿色调，Times New Roman |
| `nature` | 环境、生命周期 | 绿色调色板 |
| `dark` | 演示、暗色模式 | 深色背景 |

### 语义形状

形状从标签自动检测或显式指定：

- `service` → 圆角矩形（API Gateway、User Service）
- `database` → 圆柱体（PostgreSQL、Redis、MongoDB）
- `decision` → 菱形（条件、分支）
- `queue` → 平行四边形（Kafka、SQS、RabbitMQ）
- `user` → 椭圆（参与者、客户端）
- `formula` → 白色框，支持数学公式

### 类型化连接器

| 类型 | 样式 | 使用场景 |
|------|------|----------|
| `primary` | 实线，块状箭头 | 主流程 |
| `data` | 虚线 | 数据传输 |
| `optional` | 细虚线 | 可选路径 |
| `dependency` | 菱形箭头 | 依赖关系 |
| `bidirectional` | 无箭头 | 双向 |

## 工作原理

```
Claude Code <--stdio--> MCP 服务器 <--http--> 浏览器 (draw.io)
```

1. 请求 Claude 创建带主题的图表
2. Claude 生成 YAML 规格 → draw.io XML
3. XML 通过 MCP 服务器发送到浏览器
4. 实时预览，带设计系统样式！

## 什么是 Draw.io 技能？

Draw.io 技能是一个 Claude Code 技能，支持 AI 驱动的图表创建，带有专业设计系统。它提供：

- **设计系统 2.0**：统一主题、语义形状、类型化连接器
- **YAML 规格**：简单、可读的图表定义
- **3 个清晰的工作流**：创建、复刻和编辑图表
- **实时预览**：在浏览器中即时查看变化

## 致谢

- **MCP Server**：[next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) by [@DayuanJiang](https://github.com/DayuanJiang)
- **技能转换**：[skill-seekers](https://github.com/modelcontextprotocol/skill-seekers)
- **Draw.io**：[diagrams.net](https://www.diagrams.net/)

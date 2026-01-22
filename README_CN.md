# Draw.io Skill - Claude Code 图表绘制技能

[![Deploy Docs](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs.yml)
[![Deploy Docs (Push)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs-push.yml/badge.svg)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs-push.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

> **说明**：本技能使用 [skill-seekers](https://github.com/modelcontextprotocol/skill-seekers) 将 [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) 项目转换为 Claude Code 技能格式。

[English](./README.md) | [中文文档](./README_CN.md) | [📚 在线文档](https://bahayonghang.github.io/drawio-skills/zh/)

一个为 Claude Code 打造的技能，支持 AI 驱动的图表创建与编辑，并提供实时浏览器预览。

## ✨ 功能特性

- 🎨 **自然语言 → 图表**：描述你的需求，获得专业图表
- 🔄 **实时预览**：在浏览器中即时查看变更
- 📊 **多种图表类型**：流程图、架构图、序列图等
- ☁️ **云架构支持**：支持 AWS、GCP 和 Azure 官方图标
- ✏️ **编辑现有图表**：基于 ID 的精确修改操作
- 💾 **导出功能**：保存为 `.drawio` 文件
- 🎬 **动画连接器**：创建动态和动画连接线
- 📚 **版本历史**：通过可视化缩略图恢复之前的图表版本

## 🔗 与上游项目的关系

本技能基于 [@DayuanJiang](https://github.com/DayuanJiang) 开发的 **[next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io)** 项目构建。

| 项目 | 作用 |
|------|------|
| [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) | 提供 draw.io 图表工具的 MCP Server |
| **本项目 (drawio-skills)** | Claude Code 技能，封装 MCP server 并提供工作流指导、XML 格式参考和图表示例 |

### 本技能的增强内容

- ✅ **完整文档**：详细的各类图表创建指南
- ✅ **XML 格式参考**：完整的 draw.io XML 格式和样式属性文档
- ✅ **图表示例**：流程图、架构图等即用示例
- ✅ **MCP 工具参考**：所有可用 MCP 工具的详细文档
- ✅ **自动 MCP 配置**：预配置的 `.mcp.json` 实现无缝集成
- ✅ **安装脚本**：支持 Windows、Linux 和 macOS 的简易安装

## 📦 安装方法

### 前置要求

- 已安装 [Claude Code CLI](https://github.com/anthropics/claude-code)
- 已安装 [Node.js](https://nodejs.org/)（用于 npx 命令）

### 从 GitHub 安装

**方法 1：使用稀疏检出（推荐）**

```bash
# 创建技能目录（如果不存在）
mkdir -p ~/.claude/skills/drawio

# 初始化 git 并配置稀疏检出
cd ~/.claude/skills/drawio
git init
git remote add origin https://github.com/bahayonghang/drawio-skills.git
git config core.sparseCheckout true

# 只检出 skills/drawio 目录
echo "skills/drawio/*" >> .git/info/sparse-checkout

# 拉取文件
git pull origin main

# 移动文件到正确位置
mv skills/drawio/* .
rm -rf skills
```

**方法 2：使用 SVN（更简单）**

```bash
# 使用 SVN 只导出 skills/drawio 目录
svn export https://github.com/bahayonghang/drawio-skills/trunk/skills/drawio ~/.claude/skills/drawio
```

**方法 3：手动下载**

1. 从 GitHub 下载 [skills/drawio 目录](https://github.com/bahayonghang/drawio-skills/tree/main/skills/drawio)
2. 解压到 `~/.claude/skills/drawio`

安装完成后，技能将在 Claude Code 中自动可用。

### 验证安装

```bash
# 检查技能是否已安装
ls ~/.claude/skills/drawio
```

你应该看到以下结构：
```
drawio/
├── .mcp.json
├── SKILL.md
├── scripts/
│   ├── install.sh
│   └── install.bat
└── references/
    ├── mcp-tools.md
    ├── xml-format.md
    └── examples.md
```

## 🚀 使用方法

安装技能后，直接向 Claude 描述你的需求即可：

### 基础示例

```
"创建一个用户登录流程图"
```

```
"绘制一个三层架构图"
```

```
"生成一个电商系统的微服务架构图"
```

### 高级示例

#### AWS 架构

```
"生成一个 AWS 架构图，包含 Lambda、API Gateway、DynamoDB 和 S3，
用于无服务器 REST API。使用 AWS 图标。"
```

#### GCP 架构

```
"生成一个 GCP 架构图，包含 Cloud Run、Cloud SQL 和 Cloud Storage，
用于 Web 应用。使用 GCP 图标。"
```

#### 序列图

```
"创建一个序列图，展示 OAuth 2.0 授权码流程，
包括用户、客户端应用、授权服务器和资源服务器"
```

#### 动画连接器

```
"给我一个带动画连接器的 Transformer 架构图"
```

## 🛠️ MCP 工具

本技能使用 `@next-ai-drawio/mcp-server` 提供的以下 MCP 工具：

| 工具 | 用途 |
|------|------|
| `start_session` | 打开浏览器实时预览 |
| `create_new_diagram` | 从 XML 创建新图表 |
| `get_diagram` | 获取当前图表 XML |
| `edit_diagram` | 通过 cell ID 修改图表 |
| `export_diagram` | 保存为 .drawio 文件 |

详细的工具文档请参见 [references/mcp-tools.md](./skills/drawio/references/mcp-tools.md)。

## 📖 文档

### 参考文档

- **[MCP 工具参考](./skills/drawio/references/mcp-tools.md)**：所有可用 MCP 工具的详细文档
- **[XML 格式参考](./skills/drawio/references/xml-format.md)**：draw.io XML 格式和样式属性完整指南
- **[图表示例](./skills/drawio/references/examples.md)**：各类图表的即用示例

### 支持的图表类型

本技能支持创建以下图表类型：

- **流程图**：流程、决策树、工作流
- **架构图**：系统架构、微服务、部署图
- **序列图**：交互流程、API 调用、消息序列
- **网络图**：网络拓扑、VPC 架构、安全区域
- **数据流图**：数据管道、ETL 流程、分析工作流
- **UML 图**：类图、状态图、组件图
- **云架构**：AWS、GCP、Azure 官方图标

## 📁 项目结构

```
drawio-skills/
├── skills/
│   └── drawio/
│       ├── .mcp.json                 # MCP server 配置
│       ├── SKILL.md                  # 主技能文档
│       ├── scripts/
│       │   ├── install.sh           # Linux/macOS 安装脚本
│       │   └── install.bat          # Windows 安装脚本
│       └── references/
│           ├── mcp-tools.md         # MCP 工具参考
│           ├── xml-format.md        # Draw.io XML 格式参考
│           └── examples.md          # 图表示例
├── README.md                         # 英文文档
└── README_CN.md                      # 中文文档
```

## 🔧 配置

技能使用以下默认配置：

```json
{
  "mcpServers": {
    "drawio": {
      "command": "npx",
      "args": ["@next-ai-drawio/mcp-server@latest"]
    }
  }
}
```

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `6002` | 嵌入式 HTTP 服务器端口 |
| `DRAWIO_BASE_URL` | `https://embed.diagrams.net` | draw.io 基础 URL（用于自托管部署）|

## 🐛 故障排除

### 端口已被占用

如果端口 6002 已被占用，服务器会自动尝试下一个可用端口（最多到 6020）。

### "No active session"（无活动会话）

请先调用 `start_session` 打开浏览器窗口。

### 浏览器未更新

检查浏览器 URL 是否包含 `?mcp=` 查询参数。MCP 会话 ID 将浏览器连接到服务器。

### 找不到 MCP 服务器

确保已安装 Node.js 和 npx：

```bash
node --version
npx --version
```

## 🙏 致谢

- **MCP Server**：[next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) by [@DayuanJiang](https://github.com/DayuanJiang)
- **技能转换**：[skill-seekers](https://github.com/modelcontextprotocol/skill-seekers)
- **Draw.io**：[diagrams.net](https://www.diagrams.net/)

## 📄 许可证

本技能按原样提供。底层 MCP server 采用 [Apache-2.0](https://github.com/DayuanJiang/next-ai-draw-io/blob/main/LICENSE) 许可证。

## 🔗 链接

- [主页](https://next-ai-drawio.jiang.jp)
- [GitHub 仓库](https://github.com/DayuanJiang/next-ai-draw-io)
- [MCP Server 文档](https://github.com/DayuanJiang/next-ai-draw-io/tree/main/packages/mcp-server)

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

## ⭐ Star 历史

如果你觉得这个技能有用，请考虑给它一个 star！

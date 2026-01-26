# Draw.io Skill - 支持 Claude、Gemini 和 Codex 的图表绘制技能

[![Deploy Docs](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs.yml)
[![Deploy Docs (Push)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs-push.yml/badge.svg)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs-push.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

> **说明**：本技能使用 [skill-seekers](https://github.com/modelcontextprotocol/skill-seekers) 将 [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) 项目转换为 Claude Code 技能格式。

[English](./README.md) | [中文文档](./README_CN.md) | [📚 在线文档](https://bahayonghang.github.io/drawio-skills/zh/)

一个 MCP 技能，支持 AI 驱动的图表创建与编辑，并提供实时浏览器预览。兼容 Claude Desktop、Gemini CLI 和 Codex。

## ✨ 功能特性

- 🎨 **自然语言 → 图表**：描述你的需求，获得专业图表
- 🔄 **实时预览**：在浏览器中即时查看变更
- 📊 **多种图表类型**：流程图、架构图、序列图等
- ☁️ **云架构支持**：支持 AWS、GCP 和 Azure 官方图标
- ✏️ **编辑现有图表**：基于 ID 的精确修改操作
- 💾 **导出功能**：保存为 `.drawio` 文件
- 🎬 **动画连接器**：创建动态和动画连接线
- 📚 **版本历史**：通过可视化缩略图恢复之前的图表版本
- 🧮 **数学公式**：支持 LaTeX/AsciiMath 公式的 MathJax 渲染
- 📐 **A-H 格式提取**：从文本或图片中提取结构化图表

## 🚀 快速开始 - 3 个工作流

| 命令 | 说明 | A-H 格式 |
|------|------|----------|
| `/drawio-create` | 从自然语言创建图表 | 可选 |
| `/drawio-replicate` | 复刻现有图片 | 必需 |
| `/drawio-edit` | 修改现有图表 | 可选 |

### `/drawio-create` - 从零开始创建

```
/drawio-create 创建一个带验证和错误处理的登录流程图
```

### `/drawio-replicate` - 复刻现有图片

```
/drawio-replicate
【领域】软件架构
[上传图片]
```

### `/drawio-edit` - 修改图表

```
/drawio-edit
将 "用户服务" 改为 "认证服务"
将数据库节点改为绿色
```

## 🔗 与上游项目的关系

本技能基于 [@DayuanJiang](https://github.com/DayuanJiang) 开发的 **[next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io)** 项目构建。

| 项目 | 作用 |
|------|------|
| [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) | 提供 draw.io 图表工具的 MCP Server |
| **本项目 (drawio-skills)** | MCP 技能，封装 MCP server 并提供工作流指导、XML 格式参考和图表示例。兼容 Claude Desktop、Gemini CLI 和 Codex |

### 本技能的增强内容

- ✅ **3 个清晰的工作流**：`/drawio-create`、`/drawio-replicate`、`/drawio-edit`
- ✅ **A-H 格式**：从文本/图片中提取结构化图表
- ✅ **完整文档**：详细的各类图表创建指南
- ✅ **XML 格式参考**：完整的 draw.io XML 格式和样式属性文档
- ✅ **图表示例**：流程图、架构图等即用示例
- ✅ **自动 MCP 配置**：预配置的 `.mcp.json` 实现无缝集成
- ✅ **安装脚本**：支持 Windows、Linux 和 macOS 的简易安装

## 📦 安装方法

### 前置要求

- 已安装 [Node.js](https://nodejs.org/)（用于 npx 命令）
- 以下 AI 平台之一：
  - [Claude Desktop](https://claude.ai/download)
  - [Gemini CLI](https://ai.google.dev/gemini-api/docs/cli)
  - [Codex CLI](https://github.com/openai/codex-cli)

### 快速安装

**步骤 1：克隆仓库**

```bash
git clone https://github.com/bahayonghang/drawio-skills.git
cd drawio-skills
```

**步骤 2：复制到你的 AI 平台配置目录**

根据你使用的平台选择对应的命令：

#### Claude Desktop

**macOS:**
```bash
cp -r skills/drawio ~/Library/Application\ Support/Claude/skills/
```

**Windows (PowerShell):**
```powershell
Copy-Item -Recurse skills/drawio "$env:APPDATA\Claude\skills\"
```

**Linux:**
```bash
cp -r skills/drawio ~/.config/Claude/skills/
```

然后在 `claude_desktop_config.json` 中添加：

**macOS/Linux:**
```json
{
  "mcpServers": {
    "drawio": {
      "command": "npx",
      "args": ["--yes", "@next-ai-drawio/mcp-server@latest"]
    }
  }
}
```

**Windows:**
```json
{
  "mcpServers": {
    "drawio": {
      "type": "stdio",
      "command": "cmd",
      "args": ["/c", "npx", "--yes", "@next-ai-drawio/mcp-server@latest"]
    }
  }
}
```

#### Gemini CLI

**macOS:**
```bash
cp -r skills/drawio ~/Library/Application\ Support/gemini/skills/
```

**Windows (PowerShell):**
```powershell
Copy-Item -Recurse skills/drawio "$env:APPDATA\gemini\skills\"
```

**Linux:**
```bash
cp -r skills/drawio ~/.gemini/skills/
```

然后在 `settings.json` 中添加：

**macOS/Linux:**
```json
{
  "mcpServers": {
    "drawio": {
      "command": "npx",
      "args": ["--yes", "@next-ai-drawio/mcp-server@latest"]
    }
  }
}
```

**Windows:**
```json
{
  "mcpServers": {
    "drawio": {
      "type": "stdio",
      "command": "cmd",
      "args": ["/c", "npx", "--yes", "@next-ai-drawio/mcp-server@latest"]
    }
  }
}
```

#### Codex

**macOS/Linux:**
```bash
cp -r skills/drawio ~/.codex/skills/
```

**Windows (PowerShell):**
```powershell
Copy-Item -Recurse skills/drawio "$env:USERPROFILE\.codex\skills\"
```

然后在 `~/.codex/config.toml` 中添加：

**macOS/Linux:**
```toml
[mcp_servers.drawio]
command = "npx"
args = ["--yes", "@next-ai-drawio/mcp-server@latest"]
```

**Windows:**
```toml
[mcp_servers.drawio]
type = "stdio"
command = "cmd"
args = ["/c", "npx", "--yes", "@next-ai-drawio/mcp-server@latest"]
```

重启你的 AI 客户端后，技能将自动可用。

## 🛠️ MCP 工具

本技能使用 `@next-ai-drawio/mcp-server` 提供的以下 MCP 工具：

| 工具 | 用途 |
|------|------|
| `start_session` | 打开浏览器实时预览 |
| `create_new_diagram` | 从 XML 创建新图表 |
| `get_diagram` | 获取当前图表 XML |
| `edit_diagram` | 通过 cell ID 修改图表 |
| `export_diagram` | 保存为 .drawio 文件 |

详细的工具文档请参见 [docs/mcp-tools.md](./skills/drawio/docs/mcp-tools.md)。

## 📖 文档

### 技能文档

| 主题 | 文件 |
|------|------|
| **工作流** | |
| 从零开始创建 | [workflows/create.md](./skills/drawio/workflows/create.md) |
| 复刻现有图片 | [workflows/replicate.md](./skills/drawio/workflows/replicate.md) |
| 编辑图表 | [workflows/edit.md](./skills/drawio/workflows/edit.md) |
| **参考文档** | |
| A-H 格式 | [docs/ah-format.md](./skills/drawio/docs/ah-format.md) |
| MCP 工具 | [docs/mcp-tools.md](./skills/drawio/docs/mcp-tools.md) |
| 样式预设 | [docs/style-presets.md](./skills/drawio/docs/style-presets.md) |
| 数学公式 | [docs/math-typesetting.md](./skills/drawio/docs/math-typesetting.md) |
| IEEE 图表 | [docs/ieee-network-diagrams.md](./skills/drawio/docs/ieee-network-diagrams.md) |
| XML 格式 | [docs/xml-format.md](./skills/drawio/docs/xml-format.md) |
| 示例 | [docs/examples.md](./skills/drawio/docs/examples.md) |

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
│       ├── SKILL.md                  # 主技能导航
│       ├── .mcp.json                 # MCP server 配置
│       │
│       ├── workflows/                # 工作流定义
│       │   ├── create.md             # /drawio-create 工作流
│       │   ├── replicate.md          # /drawio-replicate 工作流
│       │   └── edit.md               # /drawio-edit 工作流
│       │
│       ├── docs/                     # 参考文档
│       │   ├── ah-format.md          # A-H 格式参考
│       │   ├── mcp-tools.md          # MCP 工具参考
│       │   ├── style-presets.md      # 视觉样式预设
│       │   ├── math-typesetting.md   # LaTeX/AsciiMath 指南
│       │   ├── ieee-network-diagrams.md # IEEE 学术图表
│       │   ├── xml-format.md         # Draw.io XML 格式
│       │   └── examples.md           # 使用示例
│       │
│       ├── scripts/                  # 安装脚本
│       │   ├── install.sh            # Linux/macOS
│       │   └── install.bat           # Windows
│       │
│       └── src/                      # 源代码
│           ├── dsl/                  # A-H → XML 转换器
│           │   └── ah-to-drawio.js
│           └── math/                 # 数学工具
│               └── index.js
│
├── docs/                             # VitePress 文档站点
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
      "args": ["--yes", "@next-ai-drawio/mcp-server@latest"]
    }
  }
}
```

### Windows 特殊配置

> ⚠️ **Windows 用户注意**：在 Windows 上，直接使用 `npx` 作为命令可能会导致问题。请使用 `cmd /c` 来包装 npx 调用：

```json
{
  "mcpServers": {
    "drawio": {
      "type": "stdio",
      "command": "cmd",
      "args": ["/c", "npx", "--yes", "@next-ai-drawio/mcp-server@latest"]
    }
  }
}
```

此配置适用于 Windows 上的所有 AI 平台（Claude Desktop、Gemini CLI、Claude Code 等）。

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

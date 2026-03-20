# Draw.io Skill - 支持 Claude、Gemini 和 Codex 的图表绘制技能

[![Deploy Docs](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs.yml)
[![Deploy Docs (Push)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs-push.yml/badge.svg)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs-push.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

> **重要说明**：本技能目前使用 [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) MCP 服务器（`@next-ai-drawio/mcp-server`），而非 draw.io 官方 MCP 服务器（`@drawio/mcp`）。由于官方服务器暂时不支持本技能所需的实时浏览器预览、自然语言图表编辑和图片复刻等核心功能，我们将在官方版本功能完善后考虑切换。

> **说明**：本技能使用 [skill-seekers](https://github.com/modelcontextprotocol/skill-seekers) 将 [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) 项目转换为 Claude Code 技能格式。

[English](./README.md) | [中文文档](./README_CN.md) | [📚 在线文档](https://bahayonghang.github.io/drawio-skills/zh/)

专为学术与技术流程图设计的 AI 原生、可迭代的 Draw.io 技能。有别于官方基于原生 XML 的无状态 MCP，它采用语义化 YAML DSL 搭配双向同步服务器，实现了图表的实时预览与交互式精调。

## ✨ 功能特性

- 🎨 **YAML 优先工作流**：通过结构化规格而不是原始 XML 来创建、编辑、验证和导出图表
- 🔀 **三条核心路线**：`create`、`edit`、`replicate`，按需加载对应参考文档
- 🔄 **实时浏览器预览**：基于 `@next-ai-drawio/mcp-server` 进行可视化迭代编辑
- 🧠 **多种输入形式**：支持自然语言、Mermaid、CSV、YAML，并统一归一化到 draw.io 工作流
- 🧮 **数学与学术护栏**：支持 LaTeX/AsciiMath 标签、IEEE 风格图和研究流程图
- ☁️ **云与模板图标支持**：适用于 AWS、GCP、Azure、Kubernetes，以及网络/厂商图标场景
- 🖼️ **图片复刻与结构化编辑**：可复刻上传图片，也可对现有图表做增量修改
- 🧪 **CLI 验证**：在导出 `.drawio` 或 `.svg` 之前检查结构、布局和质量规则
- 📦 **可移植输出**：导出可继续编辑的 `.drawio` 文件，以及可选的 `.svg` 产物

## 🔌 MCP 配置

本技能依赖 `@next-ai-drawio/mcp-server` 这个 MCP 服务器。

仓库中自带的 [`skills/drawio/.mcp.json`](./skills/drawio/.mcp.json) 更适合作为参考模板，但大多数客户端仍然需要你显式注册 MCP。建议先完成 MCP 配置，再安装 skill。

### Claude Desktop / Claude Code

将以下内容加入 Claude 的 MCP 配置：

**macOS/Linux**

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

**Windows**

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

### Gemini CLI

将以下内容加入 `settings.json`：

**macOS/Linux**

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

**Windows**

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

### Codex

将以下内容加入 `~/.codex/config.toml`：

**macOS/Linux**

```toml
[mcp_servers.drawio]
command = "npx"
args = ["--yes", "@next-ai-drawio/mcp-server@latest"]
```

**Windows**

```toml
[mcp_servers.drawio]
type = "stdio"
command = "cmd"
args = ["/c", "npx", "--yes", "@next-ai-drawio/mcp-server@latest"]
```

## 📦 安装 Skill

### 推荐方式

推荐直接使用 `skills` 从 GitHub 安装：

```bash
npx skills add bahayonghang/drawio-skills
```

这是推荐安装方式，会把 `drawio` skill 安装到对应客户端的技能目录。安装后请重启 AI 客户端，让它重新加载 skill 与 MCP 工具。

## 📦 手动安装

### 前置要求

- 已安装 [Node.js](https://nodejs.org/)（用于 npx 命令）
- 以下 AI 平台之一：
  - [Claude Desktop](https://claude.ai/download)
  - [Gemini CLI](https://ai.google.dev/gemini-api/docs/cli)
  - [Codex CLI](https://github.com/openai/codex-cli)

### 手动安装

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

然后将上文的 MCP 配置加入 `claude_desktop_config.json`：

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

然后将上文的 MCP 配置加入 `settings.json`：

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

然后将上文的 MCP 配置加入 `~/.codex/config.toml`。

重启你的 AI 客户端后，技能将自动可用。

## 🚀 快速开始

完成 MCP 和 skill 安装后，你可以显式调用 `drawio`，也可以让客户端根据请求自动匹配该 skill。

- 在 Codex 中，最稳妥的显式写法是 `$drawio <请求内容>`。
- 在其他客户端中，可以使用其提供的 skill 命令，或直接描述你的 draw.io 图表需求。

### 路线选择

| 路线 | 适用场景 | 示例 |
|------|----------|------|
| `create` | 从文本、Mermaid、CSV 或 YAML 新建图表 | `$drawio create 生成一个 IEEE 风格的训练流程图，包含各阶段标签和一个损失函数公式` |
| `edit` | 对现有图表做增量修改 | `$drawio edit 修改当前图表：把 User Service 改成 Auth Service，把数据库节点改成绿色，并清理重叠连线` |
| `replicate` | 复刻上传的图片或截图 | `$drawio replicate 将这张上传的 AWS 架构图截图复刻成结构化 draw.io 图表，并保留云厂商图标` |

### Skill 会自动做什么

- 自动把请求路由到 `create`、`edit` 或 `replicate`
- 当提示中包含公式、LaTeX 或 AsciiMath 时，自动加载数学相关参考
- 当提示中涉及论文插图、IEEE 风格、学位论文或研究流程时，自动加载学术相关参考
- 当提示中涉及云架构、网络设备或厂商图标时，自动加载模板与图标相关参考

### 本地 CLI 验证

如果你是在这个仓库里本地迭代，可以使用下面的命令做输出验证：

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --validate
node skills/drawio/scripts/cli.js input.yaml output.svg --validate
```

## 🔗 与上游项目的关系

本技能基于 [@DayuanJiang](https://github.com/DayuanJiang) 开发的 **[next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io)** 项目构建。

| 项目 | 作用 |
|------|------|
| [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) | 提供 draw.io 图表工具的 MCP Server |
| **本项目 (drawio-skills)** | MCP 技能，封装 MCP server 并提供工作流指导、XML 格式参考和图表示例。兼容 Claude Desktop、Gemini CLI 和 Codex |

### 本技能的增强内容

- ✅ **3 个清晰的工作流**：`/drawio create`、`/drawio replicate`、`/drawio edit`
- ✅ **A-H 格式**：从文本/图片中提取结构化图表
- ✅ **完整文档**：详细的各类图表创建指南
- ✅ **XML 格式参考**：完整的 draw.io XML 格式和样式属性文档
- ✅ **图表示例**：流程图、架构图等即用示例
- ✅ **内置 MCP 模板**：附带 `.mcp.json` 参考文件，便于 MCP 感知型环境复用
- ✅ **安装脚本**：支持 Windows、Linux 和 macOS 的简易安装
- ✅ **SVG 导出**：JavaScript SVG 转换器（零外部依赖）
- ✅ **CLI 工具**：`node cli.js input.yaml [output]` 支持 `--theme`、`--strict`、`--validate` 选项
- ✅ **XML 验证**：生成 XML 的结构完整性检查
- ✅ **云图标支持**：通过 `node.icon` 实现 AWS/GCP/Azure/K8s 图标映射
- ✅ **5 个设计主题**：tech-blue、academic、academic-color、nature、dark

## 🛠️ MCP 工具

本技能使用 `@next-ai-drawio/mcp-server` 提供的以下 MCP 工具：

| 工具 | 用途 |
|------|------|
| `start_session` | 打开浏览器实时预览 |
| `create_new_diagram` | 从 XML 创建新图表 |
| `get_diagram` | 获取当前图表 XML |
| `edit_diagram` | 通过 cell ID 修改图表 |
| `export_diagram` | 保存为 .drawio 文件 |

详细的工具文档请参见 [docs/mcp-tools.md](./skills/drawio/references/docs/mcp-tools.md)。

## 🔧 CLI 工具

通过命令行将 YAML 规格转换为 draw.io XML 或 SVG：

```bash
node skills/drawio/scripts/cli.js input.yaml                    # → 标准输出 XML
node skills/drawio/scripts/cli.js input.yaml output.drawio       # → .drawio 文件
node skills/drawio/scripts/cli.js input.yaml output.svg          # → .svg 文件
node skills/drawio/scripts/cli.js input.yaml --theme academic    # 指定主题
node skills/drawio/scripts/cli.js input.yaml --strict            # 超过30个节点时报错
node skills/drawio/scripts/cli.js input.yaml --validate          # XML 验证
```

详细文档请参见 [CLI 工具指南](https://bahayonghang.github.io/drawio-skills/zh/guide/cli)。

## 🖼️ SVG 导出

以编程方式将 draw.io XML 转换为独立 SVG：

```javascript
import { drawioToSvg } from './skills/drawio/scripts/svg/drawio-to-svg.js'
const svg = drawioToSvg(xmlString)
```

功能特性：

- 8 种形状类型（圆角矩形、胶囊形、圆柱体、菱形、椭圆、平行四边形、文档形、云形）
- 4 种箭头标记（block、open、classic、diamond），支持 startArrow + endArrow
- 将原始 XML 以 `data-drawio` 属性嵌入，支持在 draw.io 中双向编辑

## 📖 文档

### 技能文档

| 主题 | 文件 |
|------|------|
| **工作流** | |
| 从零开始创建 | [workflows/create.md](./skills/drawio/references/workflows/create.md) |
| 复刻现有图片 | [workflows/replicate.md](./skills/drawio/references/workflows/replicate.md) |
| 编辑图表 | [workflows/edit.md](./skills/drawio/references/workflows/edit.md) |
| **参考文档** | |
| A-H 格式 | [docs/ah-format.md](./skills/drawio/references/docs/ah-format.md) |
| MCP 工具 | [docs/mcp-tools.md](./skills/drawio/references/docs/mcp-tools.md) |
| 样式预设 | [docs/style-presets.md](./skills/drawio/references/docs/style-presets.md) |
| 数学公式 | [docs/math-typesetting.md](./skills/drawio/references/docs/math-typesetting.md) |
| IEEE 图表 | [docs/ieee-network-diagrams.md](./skills/drawio/references/docs/ieee-network-diagrams.md) |
| XML 格式 | [docs/xml-format.md](./skills/drawio/references/docs/xml-format.md) |
| 示例 | [docs/examples.md](./skills/drawio/references/docs/examples.md) |

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
│       ├── SKILL.md                  # 主技能导航 (v3.0.0)
│       ├── .mcp.json                 # MCP 服务器配置
│       │
│       ├── workflows/                # 工作流定义
│       │   ├── create.md             # /drawio create 工作流
│       │   ├── replicate.md          # /drawio replicate 工作流
│       │   └── edit.md               # /drawio edit 工作流
│       │
│       ├── references/               # 知识与参考文档
│       │   ├── docs/                 # 参考文档
│       │   │   ├── ah-format.md          # A-H 格式参考
│       │   │   ├── mcp-tools.md          # MCP 工具参考
│       │   │   ├── style-presets.md      # 视觉样式预设
│       │   │   ├── math-typesetting.md   # LaTeX/AsciiMath 指南
│       │   │   ├── ieee-network-diagrams.md # IEEE 学术图表
│       │   │   ├── xml-format.md         # Draw.io XML 格式
│       │   │   └── examples.md           # 使用示例
│       │   ├── examples/             # YAML 示例
│       │   │   ├── microservices.yaml    # 微服务架构
│       │   │   ├── login-flow.yaml       # 登录流程（含决策）
│       │   │   └── neural-network.yaml   # 学术神经网络
│       │   └── theme.schema.json     # JSON Schema 验证
│       │
│       ├── assets/                   # 静态图形资源
│       │   ├── themes/               # 设计系统主题
│       │   │   ├── tech-blue.json        # 默认技术主题
│       │   │   ├── academic.json         # IEEE 灰度主题
│       │   │   ├── academic-color.json   # IEEE 彩色主题
│       │   │   ├── nature.json           # 环境主题
│       │   │   └── dark.json             # 深色模式主题
│       │   └── examples/             # Draw.io 示例
│       │       ├── microservices.drawio
│       │       ├── login-flow.drawio
│       │       └── neural-network.drawio
│       │
│       └── scripts/                  # 脚本和源码
│           ├── install.sh            # Linux/macOS 安装脚本
│           ├── install.bat           # Windows 安装脚本
│           ├── dsl/                  # DSL 转换器
│           │   ├── spec-to-drawio.js # YAML → draw.io XML（设计系统 2.0）
│           │   ├── spec-to-drawio.test.js
│           │   ├── ah-to-drawio.js   # 旧版 A-H → XML
│           │   └── ah-to-drawio.test.js
│           ├── svg/                  # SVG 导出
│           │   ├── drawio-to-svg.js  # draw.io XML → SVG 转换器
│           │   └── drawio-to-svg.test.js
│           ├── math/                 # 数学工具
│           │   └── index.js
│           └── cli.js                # CLI 工具
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

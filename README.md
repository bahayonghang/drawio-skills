# Draw.io Skill for Claude, Gemini & Codex

[![Deploy Docs](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs.yml)
[![Deploy Docs (Push)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs-push.yml/badge.svg)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs-push.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

> **Important Note**: This skill currently uses the [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) MCP server (`@next-ai-drawio/mcp-server`) instead of the official draw.io MCP server (`@drawio/mcp`). The official server currently lacks several key features required for this skill's workflow, such as real-time browser preview, natural language diagram editing, and image replication. We continue to monitor the official server and may switch once it achieves feature parity.

> **Note**: This skill was created using [skill-seekers](https://github.com/modelcontextprotocol/skill-seekers) to convert the [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) project into a Claude Code skill format.

[English](./README.md) | [中文文档](./README_CN.md) | [📚 Documentation](https://bahayonghang.github.io/drawio-skills/)

An AI-native, iterative Draw.io skill designed for academic and technical flowcharts. Unlike the stateless official MCP that writes raw XML, it uses a semantic YAML DSL and a custom two-way sync server for real-time preview and interactive refinement.（专为学术与技术流程图设计的 AI 原生、可迭代的 Draw.io 技能。有别于官方基于原生 XML 的无状态 MCP，它采用语义化 YAML DSL 搭配双向同步服务器，实现了图表的实时预览与交互式精调。）

## ✨ Features

- 🎨 **Natural Language → Diagram**: Describe what you need, get a professional diagram
- 🔄 **Real-time Preview**: See changes instantly in your browser
- 📊 **Multiple Diagram Types**: Flowcharts, architecture diagrams, sequence diagrams, and more
- ☁️ **Cloud Architecture Support**: AWS, GCP, and Azure with official icons
- ✏️ **Edit Existing Diagrams**: Modify diagrams using ID-based operations
- 💾 **Export**: Save diagrams as `.drawio` files
- 🎬 **Animated Connectors**: Create dynamic and animated connectors between elements
- 📚 **Version History**: Restore previous diagram versions with visual thumbnails
- 🧮 **Math Typesetting**: LaTeX/AsciiMath equations with MathJax rendering
- 📐 **A-H Format Extraction**: Structured diagram extraction from text or images
- 🖼️ **SVG Export**: Convert diagrams to standalone SVG with embedded XML for round-trip editing
- 🔧 **CLI Tool**: Command-line YAML → draw.io XML/SVG conversion with theme and validation support
- ✅ **XML Validation**: Structural validation for ID uniqueness, edge references, and root cells
- 🏷️ **Cloud Icons**: AWS, GCP, Azure, Kubernetes icon support via `node.icon` field
- 🎨 **5 Design Themes**: tech-blue, academic, academic-color, nature, dark with full token systems

## 🚀 Quick Start - 3 Workflows

| Command | Description | A-H Format |
|---------|-------------|------------|
| `/drawio create` | Create diagrams from natural language | Optional |
| `/drawio replicate` | Replicate existing images | Required |
| `/drawio edit` | Modify existing diagrams | Optional |

### `/drawio create` - Create from Scratch

```
/drawio create a login flowchart with validation and error handling
```

### `/drawio replicate` - Replicate Existing Image

```
/drawio replicate
【领域】软件架构
[Upload image]
```

### `/drawio edit` - Modify Diagram

```
/drawio edit
Change "User Service" to "Auth Service"
Make database nodes green
```

## 🔗 Relationship with Upstream Project

This skill is built on top of **[next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io)** by [@DayuanJiang](https://github.com/DayuanJiang).

| Project | Purpose |
|---------|---------|
| [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) | MCP Server that provides draw.io diagram tools |
| **This Project (drawio-skills)** | MCP skill that wraps the MCP server with workflow guidance, XML format references, and diagram examples. Compatible with Claude Desktop, Gemini CLI, and Codex |

### What This Skill Adds

- ✅ **3 Clear Workflows**: `/drawio create`, `/drawio replicate`, `/drawio edit`
- ✅ **A-H Format**: Structured diagram extraction from text/images
- ✅ **Comprehensive Documentation**: Detailed guides for creating various diagram types
- ✅ **XML Format Reference**: Complete documentation of draw.io XML format and style properties
- ✅ **Diagram Examples**: Ready-to-use examples for flowcharts, architecture diagrams, and more
- ✅ **Automatic MCP Configuration**: Pre-configured `.mcp.json` for seamless integration
- ✅ **Installation Scripts**: Easy setup for Windows, Linux, and macOS
- ✅ **SVG Export**: JavaScript SVG converter (zero external dependencies)
- ✅ **CLI Tool**: `node cli.js input.yaml [output]` with `--theme`, `--strict`, `--validate` options
- ✅ **XML Validation**: Structural integrity checks for generated XML
- ✅ **Cloud Icon Support**: AWS/GCP/Azure/K8s icon mapping via `node.icon`
- ✅ **5 Design Themes**: tech-blue, academic, academic-color, nature, dark

## 📦 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (for npx command)
- One of the following AI platforms:
  - [Claude Desktop](https://claude.ai/download)
  - [Gemini CLI](https://ai.google.dev/gemini-api/docs/cli)
  - [Codex CLI](https://github.com/openai/codex-cli)

### Quick Install

**Step 1: Clone the repository**

```bash
git clone https://github.com/bahayonghang/drawio-skills.git
cd drawio-skills
```

**Step 2: Copy to your AI platform's config directory**

Choose your platform and run the corresponding command:

#### For Claude Desktop

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

Then add to `claude_desktop_config.json`:

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

#### For Gemini CLI

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

Then add to `settings.json`:

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

#### For Codex

**macOS/Linux:**

```bash
cp -r skills/drawio ~/.codex/skills/
```

**Windows (PowerShell):**

```powershell
Copy-Item -Recurse skills/drawio "$env:USERPROFILE\.codex\skills\"
```

Then add to `~/.codex/config.toml`:

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

The skill will be available automatically after restarting your AI client.

## 🛠️ MCP Tools

This skill uses the following MCP tools from `@next-ai-drawio/mcp-server`:

| Tool | Purpose |
|------|---------|
| `start_session` | Open browser with real-time preview |
| `create_new_diagram` | Create new diagram from XML |
| `get_diagram` | Retrieve current diagram XML |
| `edit_diagram` | Modify diagram by cell ID |
| `export_diagram` | Save as .drawio file |

For detailed documentation of each tool, see [docs/mcp-tools.md](./skills/drawio/references/docs/mcp-tools.md).

## 🔧 CLI Tool

Convert YAML specifications to draw.io XML or SVG from the command line:

```bash
node skills/drawio/scripts/cli.js input.yaml                    # → stdout XML
node skills/drawio/scripts/cli.js input.yaml output.drawio       # → .drawio file
node skills/drawio/scripts/cli.js input.yaml output.svg          # → .svg file
node skills/drawio/scripts/cli.js input.yaml --theme academic    # specify theme
node skills/drawio/scripts/cli.js input.yaml --strict            # error on >30 nodes
node skills/drawio/scripts/cli.js input.yaml --validate          # XML validation
```

For more details, see the [CLI Tool Guide](https://bahayonghang.github.io/drawio-skills/guide/cli).

## 🖼️ SVG Export

Convert draw.io XML to standalone SVG programmatically:

```javascript
import { drawioToSvg } from './skills/drawio/scripts/svg/drawio-to-svg.js'
const svg = drawioToSvg(xmlString)
```

Features:

- 8 shape types (roundedRect, stadium, cylinder, rhombus, ellipse, parallelogram, document, cloud)
- 4 arrow markers (block, open, classic, diamond) with startArrow + endArrow support
- Embeds original XML as `data-drawio` attribute for round-trip editing in draw.io

## 📖 Documentation

### Skill Documentation

| Topic | File |
|-------|------|
| **Workflows** | |
| Create from scratch | [workflows/create.md](./skills/drawio/references/workflows/create.md) |
| Replicate existing | [workflows/replicate.md](./skills/drawio/references/workflows/replicate.md) |
| Edit diagram | [workflows/edit.md](./skills/drawio/references/workflows/edit.md) |
| **References** | |
| A-H Format | [docs/ah-format.md](./skills/drawio/references/docs/ah-format.md) |
| MCP Tools | [docs/mcp-tools.md](./skills/drawio/references/docs/mcp-tools.md) |
| Style Presets | [docs/style-presets.md](./skills/drawio/references/docs/style-presets.md) |
| Math Typesetting | [docs/math-typesetting.md](./skills/drawio/references/docs/math-typesetting.md) |
| IEEE Diagrams | [docs/ieee-network-diagrams.md](./skills/drawio/references/docs/ieee-network-diagrams.md) |
| XML Format | [docs/xml-format.md](./skills/drawio/references/docs/xml-format.md) |
| Examples | [docs/examples.md](./skills/drawio/references/docs/examples.md) |

### Diagram Types

This skill supports creating the following diagram types:

- **Flowcharts**: Process flows, decision trees, workflows
- **Architecture Diagrams**: System architecture, microservices, deployment diagrams
- **Sequence Diagrams**: Interaction flows, API calls, message sequences
- **Network Diagrams**: Network topology, VPC architecture, security zones
- **Data Flow Diagrams**: Data pipelines, ETL processes, analytics workflows
- **UML Diagrams**: Class diagrams, state diagrams, component diagrams
- **Cloud Architecture**: AWS, GCP, Azure with official icons

## 📁 Project Structure

```
drawio-skills/
├── skills/
│   └── drawio/
│       ├── SKILL.md                  # Main skill navigation (v3.0.0)
│       ├── .mcp.json                 # MCP server configuration
│       │
│       ├── workflows/                # Workflow definitions
│       │   ├── create.md             # /drawio create workflow
│       │   ├── replicate.md          # /drawio replicate workflow
│       │   └── edit.md               # /drawio edit workflow
│       │
│       ├── references/               # Knowledge & Documentations
│       │   ├── docs/                 # Reference documentation
│       │   │   ├── ah-format.md          # A-H format reference
│       │   │   ├── mcp-tools.md          # MCP tools reference
│       │   │   ├── style-presets.md      # Visual style presets
│       │   │   ├── math-typesetting.md   # LaTeX/AsciiMath guide
│       │   │   ├── ieee-network-diagrams.md # IEEE academic diagrams
│       │   │   ├── xml-format.md         # Draw.io XML format
│       │   │   └── examples.md           # Usage examples
│       │   ├── examples/             # YAML Examples
│       │   │   ├── microservices.yaml    # Microservices architecture
│       │   │   ├── login-flow.yaml       # Login flow with decisions
│       │   │   └── neural-network.yaml   # Academic neural network
│       │   └── theme.schema.json     # JSON Schema for theme validation
│       │
│       ├── assets/                   # Static Graphics & Assets
│       │   ├── themes/               # Design System themes
│       │   │   ├── tech-blue.json        # Default technical theme
│       │   │   ├── academic.json         # IEEE grayscale theme
│       │   │   ├── academic-color.json   # IEEE with color accents
│       │   │   ├── nature.json           # Environmental theme
│       │   │   └── dark.json             # Dark mode theme
│       │   └── examples/             # Draw.io Examples
│       │       ├── microservices.drawio
│       │       ├── login-flow.drawio
│       │       └── neural-network.drawio
│       │
│       └── scripts/                  # Source code & Scripts
│           ├── install.sh            # Linux/macOS installation
│           ├── install.bat           # Windows installation
│           ├── dsl/                  # DSL converters
│           │   ├── spec-to-drawio.js # YAML → draw.io XML (Design System 2.0)
│           │   ├── spec-to-drawio.test.js
│           │   ├── ah-to-drawio.js   # Legacy A-H → XML
│           │   └── ah-to-drawio.test.js
│           ├── svg/                  # SVG export
│           │   ├── drawio-to-svg.js  # draw.io XML → SVG converter
│           │   └── drawio-to-svg.test.js
│           ├── math/                 # Math utilities
│           │   └── index.js
│           └── cli.js                # CLI tool
│
├── docs/                             # VitePress documentation site
├── README.md                         # English documentation
└── README_CN.md                      # Chinese documentation
```

## 🔧 Configuration

The skill uses the following default configuration:

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

### Windows-Specific Configuration

> ⚠️ **Windows Users**: On Windows, using `npx` directly as the command may cause issues. Use `cmd /c` to wrap the npx call:

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

This configuration applies to all AI platforms on Windows (Claude Desktop, Gemini CLI, Claude Code, etc.).

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `6002` | Port for the embedded HTTP server |
| `DRAWIO_BASE_URL` | `https://embed.diagrams.net` | Base URL for draw.io (for self-hosted deployments) |

## 🐛 Troubleshooting

### Port already in use

If port 6002 is in use, the server will automatically try the next available port (up to 6020).

### "No active session"

Call `start_session` first to open the browser window.

### Browser not updating

Check that the browser URL has the `?mcp=` query parameter. The MCP session ID connects the browser to the server.

### MCP server not found

Make sure Node.js and npx are installed:

```bash
node --version
npx --version
```

## 🙏 Credits

- **MCP Server**: [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) by [@DayuanJiang](https://github.com/DayuanJiang)
- **Skill Conversion**: [skill-seekers](https://github.com/modelcontextprotocol/skill-seekers)
- **Draw.io**: [diagrams.net](https://www.diagrams.net/)

## 📄 License

This skill is provided as-is. The underlying MCP server is licensed under [Apache-2.0](https://github.com/DayuanJiang/next-ai-draw-io/blob/main/LICENSE).

## 🔗 Links

- [Homepage](https://next-ai-drawio.jiang.jp)
- [GitHub Repository](https://github.com/DayuanJiang/next-ai-draw-io)
- [MCP Server Documentation](https://github.com/DayuanJiang/next-ai-draw-io/tree/main/packages/mcp-server)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⭐ Star History

If you find this skill useful, please consider giving it a star!

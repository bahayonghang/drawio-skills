# Draw.io Skill for Claude Code

[![Deploy Docs](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs.yml)
[![Deploy Docs (Push)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs-push.yml/badge.svg)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs-push.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

> **Note**: This skill was created using [skill-seekers](https://github.com/modelcontextprotocol/skill-seekers) to convert the [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) project into a Claude Code skill format.

[English](./README.md) | [中文文档](./README_CN.md) | [📚 Documentation](https://bahayonghang.github.io/drawio-skills/)

A Claude Code skill that enables AI-powered diagram creation and editing with real-time browser preview.

## ✨ Features

- 🎨 **Natural Language → Diagram**: Describe what you need, get a professional diagram
- 🔄 **Real-time Preview**: See changes instantly in your browser
- 📊 **Multiple Diagram Types**: Flowcharts, architecture diagrams, sequence diagrams, and more
- ☁️ **Cloud Architecture Support**: AWS, GCP, and Azure with official icons
- ✏️ **Edit Existing Diagrams**: Modify diagrams using ID-based operations
- 💾 **Export**: Save diagrams as `.drawio` files
- 🎬 **Animated Connectors**: Create dynamic and animated connectors between elements
- 📚 **Version History**: Restore previous diagram versions with visual thumbnails

## 🔗 Relationship with Upstream Project

This skill is built on top of **[next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io)** by [@DayuanJiang](https://github.com/DayuanJiang).

| Project | Purpose |
|---------|---------|
| [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) | MCP Server that provides draw.io diagram tools |
| **This Project (drawio-skills)** | Claude Code skill that wraps the MCP server with workflow guidance, XML format references, and diagram examples |

### What This Skill Adds

- ✅ **Comprehensive Documentation**: Detailed guides for creating various diagram types
- ✅ **XML Format Reference**: Complete documentation of draw.io XML format and style properties
- ✅ **Diagram Examples**: Ready-to-use examples for flowcharts, architecture diagrams, and more
- ✅ **MCP Tools Reference**: Detailed documentation of all available MCP tools
- ✅ **Automatic MCP Configuration**: Pre-configured `.mcp.json` for seamless integration
- ✅ **Installation Scripts**: Easy setup for Windows, Linux, and macOS

## 📦 Installation

### Prerequisites

- [Claude Code CLI](https://github.com/anthropics/claude-code) installed
- [Node.js](https://nodejs.org/) (for npx command)

### Install from GitHub

**Option 1: Using sparse checkout (Recommended)**

```bash
# Create the skills directory if it doesn't exist
mkdir -p ~/.claude/skills/drawio

# Initialize git and configure sparse checkout
cd ~/.claude/skills/drawio
git init
git remote add origin https://github.com/bahayonghang/drawio-skills.git
git config core.sparseCheckout true

# Only checkout the skills/drawio directory
echo "skills/drawio/*" >> .git/info/sparse-checkout

# Pull the files
git pull origin main

# Move files to the correct location
mv skills/drawio/* .
rm -rf skills
```

**Option 2: Using SVN (Simpler)**

```bash
# Use SVN to export only the skills/drawio directory
svn export https://github.com/bahayonghang/drawio-skills/trunk/skills/drawio ~/.claude/skills/drawio
```

**Option 3: Manual Download**

1. Download the [skills/drawio directory](https://github.com/bahayonghang/drawio-skills/tree/main/skills/drawio) from GitHub
2. Extract to `~/.claude/skills/drawio`

The skill will be available automatically in Claude Code.

### Verify Installation

```bash
# Check if the skill is installed
ls ~/.claude/skills/drawio
```

You should see the following structure:
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

## 🚀 Usage

Once the skill is installed, simply ask Claude to create a diagram:

### Basic Examples

```
"Create a flowchart for user login process"
```

```
"Draw a three-tier architecture diagram"
```

```
"Generate a microservices architecture for an e-commerce system"
```

### 🎯 Real Example: E-Commerce Microservices Architecture

![E-Commerce Microservices Architecture](imgs/电商示例.png)

**Prompt used:**
```
Design a microservices e-commerce system architecture diagram with the following components:

API Gateway
├── User Service (authentication, user profiles)
├── Product Catalog Service (inventory management, product search, categories)
├── Shopping Cart Service (cart management, session handling)
├── Order Service (order processing, order history)
├── Payment Service (payment gateway, transactions)
└── Notification Service (emails, SMS, push notifications)

Infrastructure:
- API Gateway (entry point for all requests)
- Service Mesh (service-to-service communication)
- Message Queue (RabbitMQ/Kafka for async events)
- Cache Layer (Redis for session and product caching)
- Databases (PostgreSQL per service)
- CDN/Load Balancer
- Monitoring (Prometheus, Grafana)
```

**Result:** `examples/ecommerce-microservices.drawio`

This example demonstrates:
- ✅ **Clear layering** (KISS principle): Client → CDN → API Gateway → Microservices → Database
- ✅ **Service independence** (SOLID): Each service has its own database
- ✅ **Async communication**: Message queue for order/payment → notification events
- ✅ **Observability**: Prometheus + Grafana monitoring
- ✅ **Optimized routing**: Non-overlapping connection lines with Chinese labels

### Advanced Examples

#### AWS Architecture

```
"Generate an AWS architecture diagram with Lambda, API Gateway, DynamoDB,
and S3 for a serverless REST API. Use AWS icons."
```

#### GCP Architecture

```
"Generate a GCP architecture diagram with Cloud Run, Cloud SQL, and
Cloud Storage for a web application. Use GCP icons."
```

#### Sequence Diagram

```
"Create a sequence diagram showing OAuth 2.0 authorization code flow
between user, client app, auth server, and resource server"
```

#### Animated Connectors

```
"Give me an animated connector diagram of transformer's architecture"
```

## 🛠️ MCP Tools

This skill uses the following MCP tools from `@next-ai-drawio/mcp-server`:

| Tool | Purpose |
|------|---------|
| `start_session` | Open browser with real-time preview |
| `create_new_diagram` | Create new diagram from XML |
| `get_diagram` | Retrieve current diagram XML |
| `edit_diagram` | Modify diagram by cell ID |
| `export_diagram` | Save as .drawio file |

For detailed documentation of each tool, see [references/mcp-tools.md](./skills/drawio/references/mcp-tools.md).

## 📖 Documentation

### References

- **[MCP Tools Reference](./skills/drawio/references/mcp-tools.md)**: Detailed documentation of all available MCP tools
- **[XML Format Reference](./skills/drawio/references/xml-format.md)**: Complete guide to draw.io XML format and style properties
- **[Diagram Examples](./skills/drawio/references/examples.md)**: Ready-to-use examples for various diagram types

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
│       ├── .mcp.json                 # MCP server configuration
│       ├── SKILL.md                  # Main skill documentation
│       ├── scripts/
│       │   ├── install.sh           # Linux/macOS installation script
│       │   └── install.bat          # Windows installation script
│       └── references/
│           ├── mcp-tools.md         # MCP tools reference
│           ├── xml-format.md        # Draw.io XML format reference
│           └── examples.md          # Diagram examples
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
      "args": ["@next-ai-drawio/mcp-server@latest"]
    }
  }
}
```

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

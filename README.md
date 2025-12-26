# Draw.io Skill for Claude Code

A Claude Code skill that enables AI-powered diagram creation and editing with real-time browser preview.

## Relationship with Upstream Project

This skill is built on top of **[next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io)** by [@DayuanJiang](https://github.com/DayuanJiang).

| Project | Purpose |
|---------|---------|
| [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) | MCP Server that provides draw.io diagram tools |
| **This Project (drawio-skills)** | Claude Code skill that wraps the MCP server with workflow guidance, XML format references, and diagram patterns |

### What This Skill Adds

- **Workflow guidance** for creating and editing diagrams
- **XML format reference** with style properties and common shapes
- **Diagram patterns** for flowcharts and architecture diagrams
- **Automatic MCP configuration** via `.mcp.json`

## Installation

### Install from GitHub

```bash
# Clone this repository to your Claude Code skills directory
git clone https://github.com/bahayonghang/drawio-skills.git ~/.claude/skills/drawio
```

The skill will be available automatically in Claude Code.

## Features

| Feature | Description |
|---------|-------------|
| **Natural Language → Diagram** | Describe what you need, get a professional diagram |
| **Real-time Preview** | See changes instantly in your browser |
| **Flowcharts** | Process flows, decision trees, workflows |
| **Architecture Diagrams** | System architecture, microservices, deployment |
| **Edit Existing Diagrams** | Modify diagrams using ID-based operations |
| **Export** | Save diagrams as `.drawio` files |

## Usage

Once the skill is installed, simply ask Claude to create a diagram:

```
"Create a flowchart for user login process"
"Draw a three-tier architecture diagram"
"Generate a microservices architecture for an e-commerce system"
```

## MCP Tools

This skill uses the following MCP tools from \`@next-ai-drawio/mcp-server\`:

| Tool | Purpose |
|------|---------|
| \`start_session\` | Open browser with real-time preview |
| \`display_diagram\` | Create new diagram from XML |
| \`get_diagram\` | Retrieve current diagram XML |
| \`edit_diagram\` | Modify diagram by cell ID |
| \`export_diagram\` | Save as .drawio file |

## Project Structure

```
drawio-skills/
├── drawio/
│   ├── .mcp.json                 # MCP server configuration
│   ├── SKILL.md                  # Main skill file
│   └── references/
│       ├── xml-format.md         # Draw.io XML format reference
│       └── diagram-patterns.md   # Flowchart & architecture patterns
├── README.md                     # English documentation
└── README_CN.md                  # Chinese documentation
```

## Credits

- **MCP Server**: [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) by [@DayuanJiang](https://github.com/DayuanJiang)
- **Draw.io**: [diagrams.net](https://www.diagrams.net/)

## License

This skill is provided as-is. The underlying MCP server is licensed under [Apache-2.0](https://github.com/DayuanJiang/next-ai-draw-io/blob/main/LICENSE).

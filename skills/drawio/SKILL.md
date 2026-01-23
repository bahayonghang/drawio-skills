---
name: drawio
version: 1.0.0
description: AI-powered Draw.io diagram generation with real-time browser preview. Create flowcharts, architecture diagrams, sequence diagrams, and cloud infrastructure diagrams (AWS/GCP/Azure) using natural language. Supports animated connectors, real-time editing, and structured A–H format extraction from text or images.
---

# Next AI Draw.io Skill

AI-powered Draw.io diagram generation with real-time browser preview for Claude Code.

## Description

This skill enables Claude Code to create, edit, and manage draw.io diagrams through natural language commands. It provides real-time browser preview, version history, and supports various diagram types including flowcharts, architecture diagrams, sequence diagrams, and more.

## Features

- **Real-time Preview**: Diagrams appear and update in your browser as Claude creates them
- **Version History**: Restore previous diagram versions with visual thumbnails
- **Natural Language**: Describe diagrams in plain text - flowcharts, architecture diagrams, etc.
- **Edit Support**: Modify existing diagrams with natural language instructions
- **Export**: Save diagrams as `.drawio` files
- **Self-contained**: Embedded server, no external dependencies required
- **Cloud Architecture Support**: Specialized support for AWS, GCP, and Azure architecture diagrams with official icons
- **Animated Connectors**: Create dynamic and animated connectors between diagram elements
- **Structured Diagram Extraction**: Extract structured diagrams from text or images using the A–H format with domain-specific configurations (software, business, industrial, research, etc.)

## Installation

This skill uses the Next AI Draw.io MCP server. The MCP server will be automatically installed when you use this skill.

### MCP Server Configuration

The skill automatically configures the MCP server with:
- **Command**: `npx`
- **Args**: `["@next-ai-drawio/mcp-server@latest"]`
- **Default Port**: `6002` (automatically finds next available port if in use)

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `6002` | Port for the embedded HTTP server |
| `DRAWIO_BASE_URL` | `https://embed.diagrams.net` | Base URL for draw.io (for self-hosted deployments) |

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `start_session` | Opens browser with real-time diagram preview |
| `create_new_diagram` | Create a new diagram from XML |
| `edit_diagram` | Edit diagram by ID-based operations |
| `get_diagram` | Get the current diagram XML |
| `export_diagram` | Save diagram to a `.drawio` file |

## Usage Examples

### 1. Create Architecture Diagrams

```
Generate an AWS architecture diagram with Lambda, API Gateway, DynamoDB,
and S3 for a serverless REST API
```

### 2. Flowchart Generation

```
Create a flowchart showing the CI/CD pipeline: code commit -> build ->
test -> staging deploy -> production deploy with approval gates
```

### 3. System Design Documentation

```
Design a microservices e-commerce system with user service, product catalog,
shopping cart, order processing, and payment gateway
```

### 4. Cloud Architecture (AWS/GCP/Azure)

```
Generate a GCP architecture diagram with Cloud Run, Cloud SQL, and
Cloud Storage for a web application
```

### 5. Sequence Diagrams

```
Create a sequence diagram showing OAuth 2.0 authorization code flow
between user, client app, auth server, and resource server
```

### 6. Animated Connectors

```
Give me an animated connector diagram of transformer's architecture
```

### 7. Structured Diagram Extraction

```
【领域】科研流程
Extract a workflow diagram from my research paper about
continuous stirred tank reactors using the A–H format.
```

```
【领域】软件架构
Extract an architecture diagram from this technical spec document.
Include API gateway, microservices, and databases.
```

```
【领域】商业流程
Recreate this expense approval flowchart image in A–H format
for standardized documentation.
```

## How It Works

```
Claude Code <--stdio--> MCP Server <--http--> Browser (draw.io)
```

1. Ask Claude to create a diagram
2. Claude calls `start_session` to open a browser window
3. Claude generates diagram XML and sends it to the browser
4. You see the diagram update in real-time!

## Workflow

When you ask Claude to create or edit a diagram:

1. **Session Start**: Claude calls `start_session` to open a browser window with the draw.io editor
2. **Diagram Creation**: Claude generates the diagram XML based on your description
3. **Real-time Update**: The diagram appears in your browser immediately
4. **Iterative Editing**: You can ask Claude to modify the diagram, and changes appear in real-time
5. **Export**: When satisfied, Claude can export the diagram to a `.drawio` file

## Best Practices

### Creating Diagrams

- Be specific about the type of diagram you want (flowchart, architecture, sequence, etc.)
- Mention if you want specific icons (AWS, GCP, Azure)
- Specify if you want animated connectors
- Describe the relationships and flow between elements

### Editing Diagrams

- Use natural language to describe changes
- Reference specific elements by their labels
- Ask for incremental changes rather than complete rewrites

### Cloud Architecture Diagrams

- Specify the cloud provider (AWS, GCP, Azure)
- Mention that you want official icons
- Describe the services and their connections
- Include security groups, VPCs, or other infrastructure elements

### Structured Diagram Extraction

- Specify domain using 【领域】parameter (软件架构/商业流程/工业流程/项目管理/教学设计/科研流程/通用)
- Specify input type: text only, image only, or image + text
- Specify language preference (中文/English/auto-detect)
- Labels should be short phrases (≤14 characters) without symbols, numbers, or brackets
- All content must come from input source - never add inferred content
- Keep modules ≤4 and nodes 3–5 per module
- Mark missing information as "未提及" instead of inferring
- Use `references/structured-diagram-prompts.md` for complete template
- Validate with `references/structured-diagram-quality.md` before finalizing

## Troubleshooting

### Port already in use

If port 6002 is in use, the server will automatically try the next available port (up to 6020).

### "No active session"

Call `start_session` first to open the browser window.

### Browser not updating

Check that the browser URL has the `?mcp=` query parameter. The MCP session ID connects the browser to the server.

## Links

- [Homepage](https://next-ai-drawio.jiang.jp)
- [GitHub Repository](https://github.com/DayuanJiang/next-ai-draw-io)
- [MCP Server Documentation](https://github.com/DayuanJiang/next-ai-draw-io/tree/main/packages/mcp-server)

## License

Apache-2.0

## Author

DayuanJiang

## Version

1.0.0

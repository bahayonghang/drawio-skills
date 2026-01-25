# Installation

This guide will walk you through installing the Draw.io Skill for Claude Code.

## Prerequisites

Before installing, ensure you have:

- **Claude Code CLI**: [Installation Guide](https://github.com/anthropics/claude-code)
- **Node.js**: Version 14 or higher ([Download](https://nodejs.org/))
- **npx**: Comes with Node.js

Verify your installation:

```bash
node --version
npx --version
```

## Installation Methods

### Method 1: Install from GitHub (Recommended)

Clone the repository to your Claude Code skills directory:

```bash
# Clone to skills directory
git clone https://github.com/bahayonghang/drawio-skills.git ~/.claude/skills/drawio
```

The skill will be automatically available in Claude Code.

### Method 2: Manual Installation

1. Download the repository as a ZIP file
2. Extract to `~/.claude/skills/drawio`
3. Restart Claude Code

## Verify Installation

Check if the skill is installed correctly:

```bash
ls ~/.claude/skills/drawio
```

You should see:

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

## MCP Server Configuration

The skill automatically configures the MCP server with:

```json
{
  "mcpServers": {
    "drawio": {
      "command": "npx",
      "args": ["--yes", "@next-ai-drawio/mcp-server@0.1.15"]
    }
  }
}
```

The MCP server will be automatically installed on first use via npx.

## Environment Variables

You can customize the MCP server behavior with environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `6002` | Port for the embedded HTTP server |
| `DRAWIO_BASE_URL` | `https://embed.diagrams.net` | Base URL for draw.io (for self-hosted deployments) |

### Setting Environment Variables

**Linux/macOS**:

```bash
export PORT=6003
export DRAWIO_BASE_URL=https://your-drawio-instance.com
```

**Windows**:

```cmd
set PORT=6003
set DRAWIO_BASE_URL=https://your-drawio-instance.com
```

## Testing the Installation

Test the skill by asking Claude:

```
"Create a simple flowchart with start, process, and end nodes"
```

If successful, you should see:
1. A browser window opens automatically
2. The draw.io editor loads
3. Your diagram appears in real-time

## Troubleshooting

### Port Already in Use

**Problem**: Port 6002 is already in use.

**Solution**: The server will automatically try the next available port (up to 6020). You can also set a custom port:

```bash
export PORT=6003
```

### "No active session"

**Problem**: Error message "No active session" when trying to create a diagram.

**Solution**: Make sure to call `start_session` first. Claude should do this automatically, but if not, ask:

```
"Start a new diagram session"
```

### Browser Not Opening

**Problem**: Browser window doesn't open automatically.

**Solution**:
1. Check if your default browser is set correctly
2. Try manually opening the URL shown in the console
3. Check firewall settings

### Browser Not Updating

**Problem**: Diagram doesn't appear or update in the browser.

**Solution**:
1. Check that the browser URL has the `?mcp=` query parameter
2. Refresh the browser page
3. Restart the session

### MCP Server Not Found

**Problem**: Error message about MCP server not being found.

**Solution**:
1. Verify Node.js and npx are installed:
   ```bash
   node --version
   npx --version
   ```
2. Try manually installing the MCP server:
   ```bash
   npm view @next-ai-drawio/mcp-server version
   ```
3. Check your internet connection

### Permission Denied

**Problem**: Permission denied when accessing the skills directory.

**Solution**:
1. Check directory permissions:
   ```bash
   ls -la ~/.claude/skills/
   ```
2. Fix permissions if needed:
   ```bash
   chmod -R 755 ~/.claude/skills/drawio
   ```

## Updating the Skill

To update to the latest version:

```bash
cd ~/.claude/skills/drawio
git pull origin main
```

The MCP server will automatically update to the latest version on next use (via `@latest` tag).

## Uninstalling

To remove the skill:

```bash
rm -rf ~/.claude/skills/drawio
```

## Next Steps

- [Getting Started](./getting-started.md) - Learn the basics
- [Creating Diagrams](./creating-diagrams.md) - Create your first diagram
- [API Reference](/api/mcp-tools.md) - Explore available tools

## Getting Help

If you're still having issues:

1. Check the [GitHub Issues](https://github.com/bahayonghang/drawio-skills/issues)
2. Review the [MCP Server Documentation](https://github.com/DayuanJiang/next-ai-draw-io/tree/main/packages/mcp-server)
3. Open a new issue with details about your problem

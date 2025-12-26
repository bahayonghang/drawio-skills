# Installation Guide

This guide provides detailed instructions for installing and configuring Draw.io Skill.

## System Requirements

### Required Software

- **Node.js**: v18 or higher
- **Claude Code**: Latest version
- **Draw.io Desktop**: For real-time preview
- **Git**: For cloning the repository

### Check Your Environment

\`\`\`bash
# Check Node.js version
node -v

# Check Git version
git -v

# Check Claude Code
claude -v
\`\`\`

## Installation Steps

### Method 1: Install from GitHub (Recommended)

\`\`\`bash
# Clone repository to Claude Code skills directory
git clone https://github.com/bahayonghang/drawio-skills.git ~/.claude/skills/drawio
\`\`\`

### Method 2: Manual Download

1. Visit [GitHub Releases](https://github.com/bahayonghang/drawio-skills/releases)
2. Download the latest release archive
3. Extract to `~/.claude/skills/drawio`

## Configuration

### MCP Server Configuration

The skill includes a pre-configured `.mcp.json` file, which usually requires no additional configuration.

If your Draw.io desktop is installed in a non-standard location, you can modify the configuration:

\`\`\`json
{
  "mcpServers": {
    "drawio": {
      "command": "npx",
      "args": ["-y", "@next-ai-drawio/mcp-server"],
      "env": {
        "DRAWIO_DESKTOP_PATH": "/path/to/your/drawio"
      }
    }
  }
}
\`\`\`

### Verify Configuration

Start Claude Code and test:

> "Test drawio skill"

If configured correctly, Claude will confirm the skill is loaded.

## Upgrading

\`\`\`bash
cd ~/.claude/skills/drawio
git pull origin main
\`\`\`

## Uninstallation

\`\`\`bash
# Remove skills directory
rm -rf ~/.claude/skills/drawio
\`\`\`

## Troubleshooting

### Issue 1: Skill Not Loading

**Symptoms**: Claude Code doesn't recognize the drawio skill

**Solutions**:
1. Verify directory path: `~/.claude/skills/drawio`
2. Check that `drawio/SKILL.md` exists
3. Restart Claude Code

### Issue 2: MCP Server Won't Start

**Symptoms**: Cannot connect to Draw.io MCP server

**Solutions**:
1. Confirm network connection is working
2. Install MCP server manually: `npm install -g @next-ai-drawio/mcp-server`
3. Check firewall settings

### Issue 3: Draw.io Desktop Won't Launch

**Symptoms**: Browser preview opens but Draw.io app doesn't start

**Solutions**:
1. Verify Draw.io desktop is properly installed
2. Check application path configuration
3. Try launching Draw.io desktop manually

## Next Steps

After installation, check out [Getting Started](./getting-started) to create your first diagram!

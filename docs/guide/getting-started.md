# Getting Started

Welcome to Draw.io Skill for Claude Code! This guide will help you get started quickly.

## Prerequisites

- [Claude Code](https://claude.ai/code) installed
- [Draw.io Desktop](https://www.diagrams.net/) installed (for real-time preview)
- Git installed

## Installation

### Install from GitHub

\`\`\`bash
# Clone this repository to your Claude Code skills directory
git clone https://github.com/bahayonghang/drawio-skills.git ~/.claude/skills/drawio
\`\`\`

Restart Claude Code after installation. The skill will be loaded automatically.

## Verify Installation

In Claude Code, try the following conversation:

> You: Help me draw a simple flowchart with three steps: start, process, and end

If the skill is installed correctly, Claude will:
1. Open Draw.io desktop and create a session
2. Generate a flowchart with three nodes
3. Display the result in your browser in real-time

## Your First Diagram

Let's create a simple user login flowchart:

### Step 1: Describe Your Requirements

In Claude Code, type:

> "Create a user login flowchart with the following steps:
> - Enter username and password
> - Validate credentials
> - Login success or failure"

### Step 2: View Results

Claude will:
1. Analyze your requirements
2. Generate diagram in Draw.io XML format
3. Open browser preview
4. Display the generated flowchart

### Step 3: Iterate and Refine

You can continue telling Claude:

> "Add a red background to the login failure node"
> "Add a decision node to check if the account exists before validation"

## Next Steps

- Read [Creating Diagrams](./creating-diagrams) to learn about more diagram types
- Check [API Reference](../api/mcp-tools) for available MCP tools
- Browse [Examples](../examples/) for more inspiration

## FAQ

### Q: Draw.io desktop didn't open automatically?

A: Make sure Draw.io desktop is properly installed and can be launched from the command line.

### Q: The diagram is not showing in the browser?

A: Check the browser console for error messages and ensure the MCP server is running.

### Q: How do I save my diagram?

A: Read the [Export & Save](./export) section to learn how to save as `.drawio` files.

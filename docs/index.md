---
layout: home

hero:
  name: Draw.io Skill
  text: AI-powered diagram creation for Claude Code
  tagline: Create professional diagrams with natural language and real-time browser preview
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/bahayonghang/drawio-skills

features:
  - title: Natural Language → Diagram
    details: Describe what you need in plain English, and get professional diagrams instantly.
  - title: Real-time Preview
    details: See your changes instantly in your browser as you iterate on your designs.
  - title: Multiple Diagram Types
    details: Support for flowcharts, architecture diagrams, sequence diagrams, and more.
  - title: Edit Existing Diagrams
    details: Modify diagrams with precision using ID-based operations.
  - title: Export & Save
    details: Save your work as .drawio files for future editing.
  - title: MCP Integration
    details: Seamless integration with Claude Code through Model Context Protocol.
---

## Quick Start

\`\`\`bash
# Install the skill
git clone https://github.com/bahayonghang/drawio-skills.git ~/.claude/skills/drawio
\`\`\`

Once installed, simply ask Claude:

> "Create a flowchart for user authentication"

## What This Skill Adds

This skill extends the powerful [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) MCP server with:

- **Workflow guidance** for creating and editing diagrams
- **XML format reference** with style properties and common shapes
- **Diagram patterns** for flowcharts and architecture diagrams
- **Automatic MCP configuration** via `.mcp.json`

## Example Diagrams

### Flowchart

Ask Claude: *"Create a flowchart showing the order processing workflow"*

### Architecture Diagram

Ask Claude: *"Draw a three-tier web application architecture"*

## Credits

- **MCP Server**: [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) by [@DayuanJiang](https://github.com/DayuanJiang)
- **Draw.io**: [diagrams.net](https://www.diagrams.net/)

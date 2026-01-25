---
layout: home

hero:
  name: "Draw.io Skill"
  text: "for Claude Code"
  tagline: AI-powered diagram creation and editing with real-time browser preview
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/bahayonghang/drawio-skills

features:
  - icon: 🎨
    title: Natural Language → Diagram
    details: Describe what you need in plain text, and get a professional diagram instantly.

  - icon: 🔄
    title: Real-time Preview
    details: See your diagrams appear and update in your browser as Claude creates them.

  - icon: 📊
    title: Multiple Diagram Types
    details: Flowcharts, architecture diagrams, sequence diagrams, network diagrams, and more.

  - icon: ☁️
    title: Cloud Architecture Support
    details: Specialized support for AWS, GCP, and Azure with official icons.

  - icon: ✏️
    title: Edit Existing Diagrams
    details: Modify diagrams using ID-based operations with natural language instructions.

  - icon: 💾
    title: Export & Save
    details: Save your diagrams as .drawio files for use in draw.io desktop or web.

  - icon: 🎬
    title: Animated Connectors
    details: Create dynamic and animated connectors between diagram elements.

  - icon: 📚
    title: Version History
    details: Restore previous diagram versions with visual thumbnails.

  - icon: 🚀
    title: Self-contained
    details: Embedded server with no external dependencies required.

  - icon: ∑
    title: Math Typesetting
    details: LaTeX/AsciiMath equations with MathJax rendering. IEEE/academic publication ready with grayscale support.

  - icon: 🧩
    title: Structured A–H Workflow
    details: Extract strict A–H specs and convert them into starter draw.io XML.
---

## Quick Example

```
"Create a flowchart for user login process with username/password input,
validation, and success/error paths"
```

Claude will:
1. Open a browser window with the draw.io editor
2. Generate the diagram XML based on your description
3. Display the diagram in real-time
4. Allow you to make iterative changes with natural language

## What is Draw.io Skill?

Draw.io Skill is a Claude Code skill that enables AI-powered diagram creation and editing. It wraps the [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) MCP server and provides:

- **Comprehensive Documentation**: Detailed guides for creating various diagram types
- **XML Format Reference**: Complete documentation of draw.io XML format and style properties
- **Diagram Examples**: Ready-to-use examples for flowcharts, architecture diagrams, and more
- **MCP Tools Reference**: Detailed documentation of all available MCP tools

## How It Works

```
Claude Code <--stdio--> MCP Server <--http--> Browser (draw.io)
```

1. Ask Claude to create a diagram
2. Claude calls `start_session` to open a browser window
3. Claude generates diagram XML and sends it to the browser
4. You see the diagram update in real-time!

## Credits

- **MCP Server**: [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) by [@DayuanJiang](https://github.com/DayuanJiang)
- **Skill Conversion**: [skill-seekers](https://github.com/modelcontextprotocol/skill-seekers)
- **Draw.io**: [diagrams.net](https://www.diagrams.net/)

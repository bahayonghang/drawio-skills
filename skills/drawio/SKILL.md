---
name: drawio
description: "AI-powered Draw.io diagram creation with Design System 2.0. Use when creating architecture diagrams, flowcharts, neural network visualizations, ER diagrams, or any technical diagram with real-time browser preview."
metadata:
  category: visual-design
  tags:
    - diagram
    - flowchart
    - architecture
    - drawio
    - design-system
argument-hint: [diagram-description-or-instruction]
allowed-tools: Read, Write, RunCommand, Browser
---

# Draw.io Skill

Create, edit, and export architecture, flowchart, and technical diagrams using Draw.io XML and Design System 2.0.

## Steps

1. Parse the user's diagram request.
2. Read `$SKILL_DIR/references/docs/design-system/README.md` to understand the available themes, semantic shapes, and connector types.
3. Read `$SKILL_DIR/references/docs/design-system/specification.md` to understand the standard YAML specification format for this skill.
4. For reference, review pattern examples in `$SKILL_DIR/references/examples/` if unsure about the syntax.
5. Generate the diagram YAML strictly following the specification.
6. Validate and compile the YAML into `.drawio` XML or `.svg` using the CLI tool:
   - `node $SKILL_DIR/scripts/cli.js input.yaml output.drawio`
   - `node $SKILL_DIR/scripts/cli.js input.yaml --validate`
7. Explain to the user how to use MCP tools (e.g., `drawio:start_session`) if they want real-time preview (refer to `$SKILL_DIR/references/docs/mcp-tools.md` for tool usage).

## Resources Distribution

- **Knowledge & Docs**: `$SKILL_DIR/references/`
- **Static Graphics & Assets**: `$SKILL_DIR/assets/`

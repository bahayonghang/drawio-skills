---
name: drawio
description: "AI-powered Draw.io diagram creation with Design System. Use when creating architecture diagrams, flowcharts, neural network visualizations, ER diagrams, or any technical diagram with real-time browser preview."
metadata:
  category: visual-design
  tags:
    - diagram
    - flowchart
    - architecture
    - drawio
    - design-system
argument-hint: [diagram-description-or-instruction]
allowed-tools: Read, Write, RunCommand, Browser, AskUserQuestion
---

# Draw.io Skill

Create, edit, and export architecture, flowchart, and technical diagrams using Draw.io XML and Design System 2.0.

## Steps

1. Parse the user's diagram request.
2. **Design Consultation** — When the request lacks explicit visual specifications (no theme, layout, or complexity stated), use `AskUserQuestion` to collect design intent across up to 4 dimensions **in a single call**:

   - **Q1 — Target Audience & Use Case** (single-select):
     - Academic paper / research report → suggests `academic-color`
     - Engineering doc / system architecture → suggests `tech-blue`
     - Presentation / slides → suggests `dark`
     - Developer reference / internal doc → suggests `tech-blue`

   - **Q2 — Visual Style** (single-select, with markdown previews showing color swatches):
     - `tech-blue` — Professional blue, ideal for architecture diagrams
     - `academic-color` — Colorful academic style, ideal for papers/research
     - `dark` — Dark presentation style, ideal for slides
     - `nature` — Natural green, ideal for lifecycle/process flows
     - `academic` — Grayscale print, ideal for IEEE submissions

   - **Q3 — Layout Direction** (single-select):
     - Horizontal (left → right) — recommended for pipelines/flows
     - Vertical (top → bottom) — recommended for API call stacks/hierarchies
     - Hierarchical (tree) — recommended for module organization/decision trees
     - Auto (let AI decide based on node count and relationships)

   - **Q4 — Expected Complexity** (single-select):
     - Simple (< 10 nodes, single page)
     - Medium (10–20 nodes, may need module grouping)
     - Complex (> 20 nodes — split into sub-diagrams recommended)

   > **Skip any question** where the user has already specified the answer in their request. Store answers in a `designIntent` object to pre-configure the YAML `meta` section.
   > **Refer to** `$SKILL_DIR/references/docs/design-system/color-guide.md` for theme selection rationale.

3. Read `$SKILL_DIR/references/docs/design-system/README.md` to understand the available themes, semantic shapes, and connector types.
4. Read `$SKILL_DIR/references/docs/design-system/specification.md` to understand the standard YAML specification format for this skill.
5. For reference, review pattern examples in `$SKILL_DIR/references/examples/` if unsure about the syntax.
6. Generate the diagram YAML strictly following the specification.
   > **⚠️ CRITICAL - Layout & Aesthetics**: The built-in script layout engine is extremely basic and only outputs nodes in a straight line. Do NOT rely on `layout: horizontal|vertical` alone. You MUST explicitly calculate mental grid coordinates for each node and assign `position: { x: ..., y: ... }` fields in the YAML. Use geometric constraints (e.g. `dx = 160`, `dy = 120` from the center) and consider routing paths for branches/loops to achieve a visually stunning, non-overlapping design.
6. Validate and compile the YAML into `.drawio` XML or `.svg` using the CLI tool:
   - `node $SKILL_DIR/scripts/cli.js input.yaml output.drawio`
   - `node $SKILL_DIR/scripts/cli.js input.yaml --validate`
7. **Clean up**: Delete the intermediate `.yaml` file after the diagram generation is complete to keep the workspace clean.
8. Explain to the user how to use MCP tools (e.g., `drawio:start_session`) if they want real-time preview (refer to `$SKILL_DIR/references/docs/mcp-tools.md` for tool usage).

## Resources Distribution

- **Knowledge & Docs**: `$SKILL_DIR/references/`
- **Static Graphics & Assets**: `$SKILL_DIR/assets/`

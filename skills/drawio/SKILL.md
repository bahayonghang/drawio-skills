---
name: drawio
version: 1.0.0
description: AI-powered Draw.io diagram generation with real-time browser preview. Create flowcharts, architecture diagrams, sequence diagrams, and cloud infrastructure diagrams (AWS/GCP/Azure) using natural language. Supports animated connectors, real-time editing, and structured A–H format extraction from text or images.
category: visual-design
tags: [diagram, flowchart, architecture, drawio]
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
- **Math Typesetting**: Put LaTeX/AsciiMath equations in shape labels (MathJax rendering in draw.io)

## Installation

This skill uses the Next AI Draw.io MCP server. The MCP server will be automatically installed when you use this skill.

### MCP Server Configuration

The skill automatically configures the MCP server with:
- **Command**: `npx`
- **Args**: `["--yes", "@next-ai-drawio/mcp-server@0.1.15"]`
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

### 8. Math Formulas in Labels (LaTeX / AsciiMath)

```
Create a diagram with two nodes:
1) "Model" with label: LaTeX \(y=Wx+b\)
2) "Loss" with label: $$\mathcal{L}=\sum_i (y_i-\hat y_i)^2$$
Make sure the equations render cleanly and are readable.
```

### 9. IEEE Academic Paper Diagram

```
Create an IEEE-style neural network architecture diagram:
1) Input: \(x \in \mathbb{R}^{H \times W \times C}\)
2) Conv Block: \(f = \sigma(W * x + b)\)
3) Pooling: \(\text{MaxPool}_{2 \times 2}\)
4) FC Layer: \(y = \text{softmax}(Wh + b)\)
Use grayscale-compatible styling (black borders, white fill).
Add caption: "Fig. 1. Architecture of the proposed model."
Export as PDF for LaTeX integration.
```

### 10. IEEE Network Diagram

```
Generate an IEEE-standard network architecture diagram for a campus network.
Include Core (Redundant Routers), Distribution (L3 Switches), and Access layers.
Use standard symbols (Router=Circle+X, Switch=Square+Arrows).
Ensure orthogonal lines and high contrast for academic paper publication.
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
- Prefer batching multiple changes into one `edit_diagram` call and minimize `get_diagram` usage for large diagrams

### Adding Math Formulas

- Use LaTeX or AsciiMath delimiters inside a text shape label
- If you need to edit the raw equation source, temporarily disable Mathematical Typesetting in the draw.io menu
- Prefer left or right text alignment for formula labels, and keep them away from diagram edges to avoid extra whitespace during export

### ⚠️ MANDATORY: LaTeX Format Rules (Hard Constraints)

When creating diagrams with mathematical expressions, you **MUST** follow these rules:

**1. ALWAYS use LaTeX delimiters for math:**
- Block equations (standalone): `$$\frac{a}{b}$$`
- Inline equations (within text): `\(\frac{a}{b}\)`
- AsciiMath alternative: `` `a/b` ``

**2. NEVER output bare LaTeX commands without delimiters:**
```
❌ WRONG: \frac{a}{b}
❌ WRONG: \alpha + \beta
❌ WRONG: x^2 + y^2

✅ CORRECT: $$\frac{a}{b}$$
✅ CORRECT: \(\alpha + \beta\)
✅ CORRECT: $$x^2 + y^2$$
```

**3. Use appropriate delimiter type:**
| Content Type | Delimiter | Example |
|--------------|-----------|---------|
| Standalone equation | `$$...$$` | `$$E = mc^2$$` |
| Equation in text | `\(...\)` | `Model: \(y = Wx + b\)` |
| Simple inline | `` `...` `` | `` `x^2` `` (AsciiMath) |

**4. For XML generation:**
- Use `prepareMathLabel()` from `src/math/index.js` to auto-detect and wrap unwrapped math
- Always escape XML special characters in `value="..."` attributes

**5. Validation checklist before output:**
- [ ] Every `\frac`, `\sqrt`, `\sum`, `\int` etc. is inside `$$` or `\(...\)`
- [ ] Greek letters like `\alpha`, `\beta` are delimited
- [ ] Superscripts `^` and subscripts `_` are delimited
- [ ] No bare backslash commands in label text

### XML Label Safety (Recommended for Math)

- When generating raw draw.io XML, escape XML attribute characters and avoid HTML tags inside labels
- Keep LaTeX/AsciiMath delimiters balanced (paired backticks, paired `$$`, paired `\(` and `\)`)
- Use `skills/drawio/src/math/index.js` helpers to wrap/validate/escape labels before placing them into `value="..."`
- See `references/math-typesetting.md` for XML examples and export notes

### Visual Styling (Consistency)

- Reuse style string presets from `references/style-presets.md` instead of generating styles from scratch
- Follow layout and connector rules in `references/drawio-aesthetic-guide.md`

### A–H to XML (Deterministic Starter)

- Generate a strict A–H spec with `references/structured-diagram-prompts.md`
- Convert it into starter XML with `references/ah-to-xml.md`, then refine via `edit_diagram`

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

### IEEE / Academic Publication Diagrams

When creating diagrams for IEEE, ACM, Elsevier, Springer, or other academic publications:

**LaTeX Formatting (MANDATORY for equations):**
- **Always use LaTeX format** for mathematical expressions in diagram labels
- Use inline LaTeX `\(...\)` for simple expressions within text
- Use block LaTeX `$$...$$` for standalone equations
- Refer to `references/math-typesetting.md` for complete LaTeX quick reference and IEEE domain formulas

**Figure Standards:**
- Use "Fig. N." format for figure numbers (e.g., "Fig. 1. Proposed architecture.")
- Place captions below figures with sentence case and period at end
- Match font size to journal requirements (typically 8-10pt)

**Grayscale Compatibility:**
- Use black borders with white/light gray fills
- Avoid color-only encoding; use line styles (solid, dashed, dotted) for differentiation
- Test by exporting to grayscale PDF before submission

**Export for LaTeX Integration:**
- Export as PDF or SVG for vector quality
- Use `math-output=html` parameter for selectable math in exported PDFs
- Enable "Crop" to remove excess whitespace
- Resolution: minimum 300 DPI for any rasterized elements

**Reference Documents:**
- `references/math-typesetting.md` - Complete LaTeX reference with IEEE formulas
- `references/ieee-network-diagrams.md` - IEEE network diagram standards

## Troubleshooting

### "d.setId is not a function" when opening `.drawio`

Some draw.io builds/plugins are strict about `mxCell id="..."` requiring numeric IDs (e.g. `id="2"`). If a generated XML uses custom string IDs (e.g. `id="plant"`, `id="edge_N1_N2"`), the editor may error while loading.

- Ensure all `mxCell` IDs are numeric and that `source`/`target` references point to those numeric IDs.
- The built-in A–H → XML generator in this skill outputs numeric cell IDs and keeps the original logical IDs (like `N1`) in `data-id="..."`.

### Port already in use

If port 6002 is in use, the server will automatically try the next available port (up to 6020).

### "No active session"

Call `start_session` first to open the browser window.

### Browser not updating

Check that the browser URL has the `?mcp=` query parameter. The MCP session ID connects the browser to the server.

### Math not rendered

1. In draw.io, enable: `Extras > Mathematical Typesetting`
2. If the equation still does not render, select the text, click `</>` to reveal hidden HTML formatting tags, delete extra tags, then re-enable Mathematical Typesetting

### Math overflows or exports with whitespace

- Set `Text Overflow` to `Block` or `Width` (sometimes `Hidden`) and resize the shape to match the rendered equation
- Use left or right text alignment and keep formula shapes away from diagram edges to avoid extra whitespace when exporting

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

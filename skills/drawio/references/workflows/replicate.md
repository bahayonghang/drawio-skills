# Workflow: /drawio replicate

Replicate existing images or diagrams using structured extraction with design-system styling and explicit live-backend boundaries.

## Trigger

- **Command**: `/drawio replicate ...`
- **Keywords**: `replicate`, `recreate`, `复刻`, `复现`, `重绘`

## Procedure

```text
Step 1: Receive Input
├── Image upload (required)
└── Optional: accompanying text description

Step 2: Configuration
├── Select domain (software architecture, research, etc.)
├── Select theme (tech-blue default, academic for papers)
├── Select color mode (preserve-original default, theme-first optional)
└── Specify language (Chinese/English)

Step 3: Structured Extraction
├── Analyze image structure
├── Extract source color summary:
│   ├── background/canvas color
│   ├── 3-6 dominant flat colors
│   ├── node / edge / module color assignments
│   └── confidence notes for uncertain regions
├── Text Fidelity Pass:
│   ├── extract every text-bearing element as shape label, edge label, standalone text, or formula annotation
│   ├── record text bounds, baseline/anchor, alignment, font family, font size, italic/bold state, and spacing
│   ├── record relative offset from the nearest arrow, connector, node, module, or canvas boundary
│   └── preserve math delimiters for formulas (`$$...$$`, `\(...\)`, or AsciiMath backticks)
├── Extract to YAML specification format:
│   ├── nodes with semantic types
│   ├── edges with connector types
│   ├── modules for grouping
│   ├── standalone text/formula nodes with explicit `bounds` when needed
│   ├── edge labels with `labelPosition` and `labelOffset` when needed
│   └── explicit style overrides for high-confidence colors
├── Apply semantic shape mapping
└── Mark missing info as "Not specified" (未提及)

Step 4: Logic Verification (Mandatory)
├── Translate structural analysis into a pure ASCII logical flow graph
├── Summarize the extracted palette and where each color will be applied
├── Summarize text placement: boxes, formulas, edge-label offsets, and any uncertain baselines
└── Pause for user's confirmation to ensure no misinterpretation

Step 5: Stencil Decision
├── If the diagram is vendor/device heavy:
│   ├── use `search_shape_catalog` when available
│   └── otherwise fall back to documented icon mappings or semantic shapes
└── If the diagram is conceptual or academic, skip shape search and stay semantic

Step 6: Convert to Diagram
├── Parse specification via scripts/dsl/spec-to-drawio.js
├── Apply selected theme
├── Keep `meta.replication.background` as canvas background when provided
├── Calculate 8px grid positions for structure
├── Preserve explicit top-left `bounds` for high-fidelity text boxes and formula annotations
├── Apply `labelOffset` so connector labels sit 12-20px off the line by default
├── Generate .drawio + .spec.yaml + .arch.json offline first
├── Export standalone SVG or desktop preview if available
└── Only use a live backend for preview/refinement when the user explicitly wants it

Step 7: Review and Refine
├── Compare with original image
├── Compare text placement: no labels on top of lines, no formulas touching borders, matching relative title/caption/callout positions
├── Default to /drawio edit in offline mode
├── Live providers with `render_inline_preview` may help review
└── Providers without `read_diagram_xml + patch_diagram_cells` still do not replace the offline edit path

Step 8: Validate
├── Check cell ID uniqueness
├── Check edge source/target reference validity
├── Check required root cells present
├── Check text-label clearance: no edge label overlaps its connector, no formula is clipped or pasted to a boundary
├── For screenshot/academic replication, record at least one original-vs-export visual comparison when vision or a rendered preview is available
└── Use --validate CLI flag or validateXml() from DSL converter
```

## Design-System Integration

### Theme Selection by Domain

| Domain | Recommended Theme | Reason |
|--------|-------------------|--------|
| 软件架构 (Software Architecture) | tech-blue | Professional technical style |
| 商业流程 (Business Process) | tech-blue | Clean corporate look |
| 科研流程 (Research Workflow) | academic | IEEE-compatible, grayscale-safe |
| 工业流程 (Industrial Process) | tech-blue | Clear technical diagrams |
| 项目管理 (Project Management) | tech-blue | Standard project visuals |
| 教学设计 (Teaching Design) | nature | Friendly, accessible colors |

### Semantic Shape Mapping

During extraction, map visual elements to semantic types:

| Visual Element | Semantic Type | Draw.io Shape |
|----------------|---------------|---------------|
| Rectangle/Box | `service` | Rounded rectangle |
| Cylinder/Drum | `database` | Cylinder |
| Diamond | `decision` | Rhombus |
| Oval/Rounded rect | `terminal` | Stadium |
| Parallelogram | `queue` | Parallelogram |
| Person/Stick figure | `user` | Circle |
| Document shape | `document` | Wave rect |
| Math formula | `formula` | White rect with border |
| Caption, callout, legend note | `text` | Standalone text box |

### Connector Type Mapping

| Visual Style | Connector Type | Output Style |
|--------------|----------------|--------------|
| Solid arrow | `primary` | Solid 2px, filled arrow |
| Dashed arrow | `data` | Dashed 2px, filled arrow |
| Dotted line | `optional` | Dotted 1px, open arrow |
| Diamond end | `dependency` | Solid 1px, diamond |
| Double-headed | `bidirectional` | Solid 1.5px, no arrow |

## Extraction Rules

1. Only use content from the input. Never invent missing labels or structures.
2. Mark missing facts as `Not specified` / `未提及`.
3. Keep YAML spec as the canonical result, even if a live preview is opened later.
4. Preserve the source palette by default and store it in `meta.replication`.
5. If a live provider is used, treat it as preview/refinement only unless it also satisfies the edit-session capability gate from `/drawio edit`.
6. Treat standalone text, captions, callouts, legends, and formula annotations as first-class replicated elements; do not force them into nearby shapes when their separate position carries meaning.
7. Use `bounds: {x, y, width, height}` for high-fidelity text boxes. `bounds` uses top-left coordinates; `position` remains a center-point convenience for ordinary nodes.
8. For labeled connectors, prefer an off-line offset: horizontal connectors usually use `labelOffset: {x: 0, y: -12}` to `-20`, and vertical connectors usually use `{x: 12, y: 0}` to `{x: 20, y: 0}`. Adjust the sign to match the source side.
9. Fix failures in this order: (a) wrong/missing text, (b) formula delimiters/font, (c) `bounds` and baselines, (d) `labelOffset`, (e) connector waypoints/routing, (f) color/style polish.

## Related

- [Migration Readiness](../docs/migration-readiness.md)
- [Live Backend Reference](../docs/mcp-tools.md)
- [Design System Overview](../docs/design-system/README.md)
- [Specification Format](../docs/design-system/specification.md)
- [Stencil Library Guide](../docs/stencil-library-guide.md)

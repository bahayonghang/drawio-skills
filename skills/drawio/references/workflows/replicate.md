# Workflow: /drawio replicate

Replicate existing images or diagrams using structured extraction with design-system styling, native editable draw.io geometry, and explicit live-backend boundaries.

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
├── Record source canvas:
│   ├── source image width and height
│   ├── background/canvas color
│   └── intended `meta.canvas` value (`auto` or WIDTHxHEIGHT)
├── Extract source color summary:
│   ├── background/canvas color
│   ├── 3-6 dominant flat colors
│   ├── node / edge / module color assignments
│   └── confidence notes for uncertain regions
├── Native Reference Inventory:
│   ├── panel or region bounds in top-left coordinates
│   ├── native shapes, labels, styles, and uncertainty notes
│   ├── connector endpoints, waypoints, labels, and offsets
│   ├── dense motifs that will be approximated with native simplified shapes
│   └── any temporary tracing image that must not remain as final full-page content
├── Text Fidelity Pass:
│   ├── extract every text-bearing element as shape label, edge label, standalone text, or formula annotation
│   ├── record text bounds, baseline/anchor, alignment, font family, font size, italic/bold state, and spacing
│   ├── record relative offset from the nearest arrow, connector, node, module, or canvas boundary
│   └── preserve math delimiters for formulas (`$$...$$`, `\(...\)`, or AsciiMath backticks)
├── Extract to YAML specification format:
│   ├── `meta.source: replicated`
│   ├── `meta.canvas` from the source page size when coordinate fidelity matters
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
├── Use `meta.canvas: WIDTHxHEIGHT` as the minimum draw.io page size when mapping reference coordinates
├── Calculate 8px grid positions for structure
├── Preserve explicit top-left `bounds` for high-fidelity text boxes and formula annotations
├── Apply `labelOffset` so connector labels sit 12-20px off the line by default
├── Generate .drawio + .spec.yaml + .arch.json offline first
├── Export standalone SVG first; if a raster/final-fidelity check is needed and draw.io Desktop is available, export PNG/PDF/JPG or embedded SVG through the CLI
├── Do not create browser or Playwright screenshots when an exported SVG/PNG/PDF/JPG exists
└── Only use a live backend for preview/refinement when the user explicitly wants it

Step 7: Review and Refine
├── Compare the original image with the exported SVG or Desktop-exported image when a viewer or vision path can inspect it
├── Compare text placement: no labels on top of lines, no formulas touching borders, matching relative title/caption/callout positions
├── For scientific figures, compare stage grouping, formula/callout placement, legend/caption fidelity, and whether model/operation elements are native editable cells
├── Default to /drawio edit in offline mode
├── Live providers with `render_inline_preview` may help review only after exported-artifact verification is unavailable or insufficient
└── Providers without `read_diagram_xml + patch_diagram_cells` still do not replace the offline edit path

Step 8: Validate
├── Check cell ID uniqueness
├── Check edge source/target reference validity
├── Check required root cells present
├── Check `--validate` does not report a full-page embedded image cell
├── Check text-label clearance: no edge label overlaps its connector, no formula is clipped or pasted to a boundary
├── For screenshot/academic replication, record at least one original-vs-export visual comparison from exported SVG/PNG/PDF/JPG when vision or a viewer can inspect it
├── Use browser/live screenshots only as a last-resort review aid when the user explicitly requested live review and no exported artifact can be inspected
└── Use --validate CLI flag or validateXml() from DSL converter
```

## Design-System Integration

### Native Reference Rebuild Contract

Do not satisfy a reference rebuild by placing the uploaded image as the whole draw.io page. The final `.drawio` must be editable native content: shapes, text, connectors, modules/groups, waypoints, labels, styles, and simplified motifs.

Temporary image use is allowed only for analysis or tracing. If an image layer is used while drafting, remove it before delivery or keep it clearly outside the final page. The final validation pass should reject a full-page image cell that covers the canvas.

Use this inventory shape for complex rebuilds:

```yaml
source:
  file: reference.png
  canvas: 1200x800
  background: "#FFFFFF"
regions:
  - id: left-panel
    label: Data preparation
    bounds: { x: 32, y: 72, width: 336, height: 560 }
shapes:
  - id: extract
    label: Extract
    type: service
    bounds: { x: 80, y: 144, width: 168, height: 56 }
connectors:
  - from: extract
    to: train
    label: features
    waypoints:
      - { x: 320, y: 172 }
    labelOffset: { x: 0, y: -16 }
palette:
  - hex: "#FDBA74"
    role: warm process fill
    appliesTo: nodes
    confidence: high
approximations:
  - "Heatmap thumbnail becomes a 5x4 grid of small native rectangles."
```

Convert that inventory into the canonical YAML spec. Use `meta.canvas` to preserve the reference coordinate system:

```yaml
meta:
  source: replicated
  canvas: 1200x800
  replication:
    colorMode: preserve-original
    background: "#FFFFFF"
```

`meta.canvas` is a minimum page size, not a crop. If native shapes extend beyond it, the renderer expands the page to keep content editable and visible.

### Theme Selection by Domain

| Domain | Recommended Theme | Reason |
|--------|-------------------|--------|
| 软件架构 (Software Architecture) | tech-blue | Professional technical style |
| 商业流程 (Business Process) | tech-blue | Clean corporate look |
| 科研流程 (Research Workflow) | academic | IEEE-compatible, grayscale-safe |
| 工业流程 (Industrial Process) | tech-blue | Clear technical diagrams |
| 项目管理 (Project Management) | tech-blue | Standard project visuals |
| 教学设计 (Teaching Design) | nature | Friendly, accessible colors |

### Scientific Redraw Priorities

For research-framework screenshots, model architecture figures, operation diagrams, or algorithm illustrations, preserve meaning before decoration:

1. Rebuild the figure as native editable cells, not a pasted page image.
2. Preserve text-bearing regions: title, caption, legend, section headers, formula blocks, callouts, and edge labels.
3. Use `bounds` for standalone labels, formulas, small grid cells, matrix cells, heatmap motifs, or annotations whose location carries meaning.
4. Use semantic deep-learning types when they match the source: `input`, `tensor3d`, `conv`, `pool`, `attention`, `feature`, `operator`, `loss`, and `output`.
5. Use modules for visual sections such as Backbone, Fusion, Head, Experiment Setup, Validation, or Metrics.
6. Preserve or normalize the source palette intentionally. If exact colors are uncertain, record confidence in `meta.replication.palette` and keep the final figure grayscale-safe for academic use.
7. Keep connector labels off the line with `labelOffset`; give formula and legend boxes breathing room before polishing colors.

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
| CNN/Transformer layer | `conv`, `pool`, `attention`, `norm`, `matrix` | Deep-learning semantic block |
| Feature map / tensor | `tensor3d` | Cube-like feature-map block |
| Add/concat/gate operator | `operator` | Small circular operator |

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
5. Use `meta.canvas: WIDTHxHEIGHT` when the source coordinate system matters; keep `auto` for ordinary regenerated diagrams.
6. Never deliver the final rebuild as a full-page embedded image.
7. If a live provider is used, treat it as preview/refinement only unless it also satisfies the edit-session capability gate from `/drawio edit`.
8. Treat standalone text, captions, callouts, legends, and formula annotations as first-class replicated elements; do not force them into nearby shapes when their separate position carries meaning.
9. Use `bounds: {x, y, width, height}` for high-fidelity text boxes. `bounds` uses top-left coordinates; `position` remains a center-point convenience for ordinary nodes.
10. For labeled connectors, prefer an off-line offset: horizontal connectors usually use `labelOffset: {x: 0, y: -12}` to `-20`, and vertical connectors usually use `{x: 12, y: 0}` to `{x: 20, y: 0}`. Adjust the sign to match the source side.
11. Fix failures in this order: (a) wrong/missing text, (b) formula delimiters/font, (c) `bounds` and baselines, (d) `labelOffset`, (e) connector waypoints/routing, (f) color/style polish, (g) accidental full-page image cells.

## Related

- [Migration Readiness](../docs/migration-readiness.md)
- [Live Backend Reference](../docs/mcp-tools.md)
- [Design System Overview](../docs/design-system/README.md)
- [Specification Format](../docs/design-system/specification.md)
- [Stencil Library Guide](../docs/stencil-library-guide.md)

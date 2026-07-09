# Specification Format

The YAML specification is the canonical representation for Draw.io Skill 2.2.0.

Mermaid, CSV, and imported `.drawio` files are convenience inputs. They should all normalize into this structure before rendering.

## Minimal Example

```yaml
meta:
  theme: tech-blue
  layout: horizontal

nodes:
  - id: api
    label: API Gateway
    type: service
  - id: db
    label: PostgreSQL
    type: database

edges:
  - from: api
    to: db
    type: data
    label: Query
```

## Top-Level Sections

### `meta`

Diagram-wide settings.

```yaml
meta:
  theme: tech-blue
  layout: horizontal
  routing: orthogonal
  profile: default
  figureType: architecture
  title: Example Diagram
  source: generated
  canvas: auto
```

Common fields:

- `theme`: `tech-blue`, `academic`, `academic-color`, `nature`, `dark`, `high-contrast`
- `layout`: `horizontal`, `vertical`, `hierarchical`
- `routing`: `orthogonal`, `rounded`
- `profile`: `default`, `academic-paper`, `engineering-review`
- `figureType`: `architecture`, `roadmap`, `workflow` when `profile=academic-paper`
- `source`: `generated`, `replicated`, or `edited`
- `canvas`: `auto` or `WIDTHxHEIGHT`, such as `1200x800`

Font policy:

```yaml
meta:
  font:
    primary: Times New Roman
    cjk: Times New Roman,SimSun
    formula: Times New Roman
```

- `meta.font` activates force mode automatically.
- `primary` is for Latin text, `cjk` is for Chinese/Japanese/Korean text, and `formula` is for formula surfaces.
- Comma-separated fallback stacks are supported: `Times New Roman,SimSun` renders Latin glyphs in Times New Roman and CJK glyphs in SimSun inside one label.
- When `meta.font` is present, it overrides lower-priority font-family settings on the covered text surfaces.
- When `meta.font` is absent, every profile uses `Times New Roman` for Latin/formula text and the `Times New Roman,SimSun` stack for CJK-bearing text.
- Font sizes follow the converter ladder when `style.fontSize` is absent: module title 22, node 20, edge label 18, text 16 (floor 12). Boxes grow to fit their labels; explicit-bounds boxes shrink each class uniformly instead.
- `meta.print` opts into the print-readability gate: `{ target: cn-thesis | ieee-single | ieee-double }` or custom `widthPt`/`minPt`. The validator warns when the smallest label would print below the floor (cn-thesis 440pt/9pt, ieee-single 252pt/8pt, ieee-double 516pt/8pt).

`meta.canvas` sets the minimum draw.io page size. Omit it or use `auto` for content-derived sizing. Use `WIDTHxHEIGHT` for reference-image replication when you are mapping visible elements from source-image coordinates. The renderer expands beyond the explicit canvas if native content exceeds the page, so shapes are not clipped.

### `modules`

Logical containers for related nodes.

```yaml
modules:
  - id: backend
    label: Backend
```

### `nodes`

Required. Each node needs a stable `id` and `label`.

```yaml
nodes:
  - id: api
    label: API Gateway
    type: service
    module: backend
    position:
      x: 160
      y: 96
    icon: aws.api-gateway
```

### `edges`

Optional, but most diagrams use them.

```yaml
edges:
  - from: api
    to: db
    type: data
    label: Query
    labelPosition: center
```

## Replication Metadata

Replicated diagrams usually include:

```yaml
meta:
  source: replicated
  canvas: 1200x800
  replication:
    colorMode: preserve-original
    background: "#FFF7ED"
    palette:
      - hex: "#FDBA74"
        role: service fill
        appliesTo: nodes
        confidence: high
```

`colorMode` can be:

- `preserve-original`
- `theme-first`

Do not replicate a reference by embedding the whole source image as the page. The final `.drawio` should be native editable content, and validation flags full-page embedded image cells.

## Text Fidelity Fields

Replicated diagrams may need more than color metadata. Use these fields when text placement matters:

- `type: text` for standalone titles, captions, callouts, legends, and notes;
- `bounds` for exact top-left text-box geometry when the box itself is part of the design;
- `type: formula` or `type: text` with official math delimiters for dedicated formula annotations;
- `labelPosition` and `labelOffset` for edge labels that need to sit off the connector line;
- `align`, `verticalAlign`, and `spacing*` for visible typography and padding overrides.

When both `position` and `bounds` are present, treat `bounds` as the fidelity-preserving geometry.

## Type Auto-Detection

When `type` is omitted, labels can still map to:

- `database`
- `decision`
- `terminal`
- `queue`
- `user`
- `document`
- `formula`
- default fallback: `service`

Formula detection should only rely on:

- `$$...$$`
- `\(...\)`
- `` `...` ``

## Validation Expectations

The compiler validates:

- schema and ID correctness
- theme, profile, and layout values
- academic `figureType` when paper mode is enabled
- layout consistency
- edge quality
- academic-paper requirements when enabled
- text-position rules for replicated labels and formulas
- full-page embedded image cells in validated draw.io XML

Use strict mode when warnings should fail the build.

## Migration from A-H Format

The old A-H format is legacy guidance. The canonical mapping is now:

| Legacy idea   | YAML location                      |
| ------------- | ---------------------------------- |
| layout        | `meta.layout`                      |
| modules       | `modules[]`                        |
| nodes         | `nodes[]`                          |
| edges         | `edges[]`                          |
| visual style  | `meta.theme` and `style` overrides |
| export intent | local CLI or Desktop export path   |

## Related

- [Design System](./design-system.md)
- [CLI Tool](./cli.md)
- [Replicating Diagrams](./scientific-workflows.md)

# Replicating Diagrams (`/drawio replicate`)

Use `/drawio replicate` when you want to recreate an uploaded image, screenshot, or reference diagram as a structured draw.io bundle.

Use `drawio-academic-skills` when the reference is a paper/thesis/manuscript figure or publication constraints matter.

## What Replication Optimizes For

- cleaner redraws than raw screenshot tracing
- editable YAML-first artifacts
- palette-aware restyling
- text-position fidelity for captions, callouts, formulas, and edge labels
- native editable draw.io shapes instead of a full-page embedded reference image
- academic-safe exports through the overlay when needed

## Replication Flow

1. Receive the uploaded image and any text hints
2. Choose domain, theme, and color mode
3. Run a text-fidelity pass for labels, captions, formulas, and edge labels
4. Write a native reference inventory for source canvas, regions, shapes, connectors, palette, and approximations
5. Extract structure into YAML with `meta.source: replicated` and `meta.canvas` when source coordinates matter
6. Summarize logic, palette, and text placement when needed
7. Render the offline bundle
8. Compare and refine with `/drawio edit`

## Academic Replication Overlay

When the source is publication-facing, the overlay adds:

- venue/audience preflight
- `meta.profile: academic-paper`
- `meta.figureType`: `architecture`, `roadmap`, or `workflow`
- caption, legend, and A4/Word/LaTeX export checks
- default final `.drawio + 300dpi .png` delivery, with SVG fallback when Desktop is unavailable and `.spec.yaml + .arch.json` in a project-local work directory
- no MCP/live backend requirement

The overlay still executes through the sibling base CLI at `../drawio/scripts/cli.js`.

## Text Fidelity Pass

When the source image depends on typography or placement, replication should capture:

- shape labels, edge labels, standalone text, and formula annotations separately;
- source canvas size as `meta.canvas: WIDTHxHEIGHT` when coordinates are copied from the reference;
- explicit text-box bounds when the original box position matters;
- font family, font size, italic/bold state, alignment, and spacing where visible;
- edge-label offsets so labels sit off the connector line instead of on top of it.

Do not satisfy a rebuild by placing the whole reference image as the final draw.io page. The final `.drawio` should use native editable shapes, text, connectors, modules/groups, waypoints, and styles. Validation flags full-page embedded image cells; small icons or motif images are still allowed when they are not the whole diagram.

For self-checking, compare the source and export for:

- title, caption, and callout placement;
- formula spacing and clipping;
- edge-label clearance from arrows and lines.

## Color Modes

| Mode | Default | Behavior |
| --- | --- | --- |
| `preserve-original` | Yes | Preserve source background and dominant palette through explicit style overrides |
| `theme-first` | No | Normalize the redraw to the selected theme and treat source colors as hints |

Replicated specs should usually record:

- `meta.source: replicated`
- `meta.canvas` when source coordinates matter
- `meta.replication.colorMode`
- `meta.replication.background`
- `meta.replication.palette`

## Theme Defaults by Domain

| Domain | Recommended theme |
| --- | --- |
| software architecture | `tech-blue` |
| business process | `tech-blue` |
| research workflow | `academic` |
| environmental / lifecycle | `nature` |
| accessibility-first review | `high-contrast` |
| presentation slides | `dark` |

## Logic Confirmation

Replication should pause for confirmation when semantics are uncertain.

The review draft should include:

- a pure ASCII logic graph
- the extracted palette summary
- which colors will be preserved explicitly
- which parts will fall back to theme tokens

## Example Requests

### Preserve the source palette

```text
/drawio replicate
Color mode: preserve-original
[upload image]
Keep the warm nodes and dark connectors instead of normalizing everything to tech-blue
```

### Use the academic overlay

```text
/drawio-academic-skills replicate
[upload paper figure]
Redraw this for IEEE submission, keep it grayscale-safe, deliver an editable .drawio plus a submission PDF, and keep sidecars in a work directory
```

### Normalize to a presentation theme

```text
/drawio replicate with dark theme
[upload architecture screenshot]
Redraw this for a keynote slide
```

## Output Artifacts

Base replication should produce the final editable and visual-check artifacts:

- `.drawio`
- `.svg`

Work-dir sidecars:

- `.spec.yaml`
- `.arch.json`

Optional outputs:

- desktop PNG / PDF / JPG when draw.io Desktop is available
- diagrams.net URL fallback generated from the `.drawio` file

## Troubleshooting

### The redraw is too literal

Switch to `theme-first` if you want brand or paper normalization instead of source-color fidelity.

### The redraw is too generic

Stay on `preserve-original` and make sure the extracted palette summary is accepted before rendering.

### The source image is too dense

Split the figure into sub-diagrams or reduce the redraw scope before regeneration.

### Text labels sit on connector lines

Add or adjust `labelOffset` for the affected edge labels, then re-render and compare again.

## Next Steps

- [Workflows](./workflows.md)
- [Editing Diagrams](./editing-diagrams.md)
- [Design System](./design-system.md)
- [Specification Format](./specification.md)

# Replicating Diagrams (`/drawio replicate`)

Use `/drawio replicate` when you want to recreate an uploaded image, screenshot, or reference diagram as a structured draw.io bundle.

## What Replication Optimizes For

- cleaner redraws than raw screenshot tracing
- editable YAML-first artifacts
- palette-aware restyling
- academic-safe exports when needed

## Replication Flow

1. Receive the uploaded image and any text hints
2. Choose domain, theme, and color mode
3. Extract structure into YAML
4. Summarize logic and palette when needed
5. Render the offline bundle
6. Compare and refine with `/drawio edit`

## Color Modes

| Mode | Default | Behavior |
|------|---------|----------|
| `preserve-original` | Yes | Preserve source background and dominant palette through explicit style overrides |
| `theme-first` | No | Normalize the redraw to the selected theme and treat source colors as hints |

Replicated specs should usually record:

- `meta.source: replicated`
- `meta.replication.colorMode`
- `meta.replication.background`
- `meta.replication.palette`

## Theme Defaults by Domain

| Domain | Recommended theme |
|--------|-------------------|
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

### Normalize to an academic paper palette

```text
/drawio replicate with academic theme
[upload paper figure]
Redraw this for IEEE submission and keep it grayscale-safe
```

### Normalize to a presentation theme

```text
/drawio replicate with dark theme
[upload architecture screenshot]
Redraw this for a keynote slide
```

## Output Artifacts

Replication should produce the same editable trio as other routes:

- `.drawio`
- `.spec.yaml`
- `.arch.json`

Optionally add:

- standalone SVG
- desktop PNG / PDF / JPG when draw.io Desktop is available

## Troubleshooting

### The redraw is too literal

Switch to `theme-first` if you want brand or paper normalization instead of source-color fidelity.

### The redraw is too generic

Stay on `preserve-original` and make sure the extracted palette summary is accepted before rendering.

### The source image is too dense

Split the figure into sub-diagrams or reduce the redraw scope before regeneration.

## Next Steps

- [Workflows](./workflows.md)
- [Editing Diagrams](./editing-diagrams.md)
- [Design System](./design-system.md)
- [Specification Format](./specification.md)

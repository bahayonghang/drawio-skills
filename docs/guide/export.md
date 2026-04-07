# Export & Save

Draw.io Skill treats export as part of the offline bundle workflow, not as a browser-only step.

## Canonical Artifact Bundle

Keep these files together whenever the diagram may be edited again:

- `<name>.drawio`
- `<name>.spec.yaml`
- `<name>.arch.json`

This bundle supports local iteration without requiring a live session.

## Common Export Commands

### Generate a `.drawio` file

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --validate --write-sidecars
```

### Generate a standalone SVG

```bash
node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars
```

### Generate PNG, PDF, or JPG with draw.io Desktop

```bash
node skills/drawio/scripts/cli.js input.yaml output.pdf --validate --use-desktop
node skills/drawio/scripts/cli.js input.yaml output.png --validate --use-desktop
```

## Import an Existing `.drawio` File

If you receive an existing `.drawio` file and want to edit it via the YAML-first workflow:

```bash
node skills/drawio/scripts/cli.js existing.drawio --input-format drawio --export-spec --write-sidecars
```

That generates an editable bundle you can version and re-render.

## Embedded vs Standalone SVG

- **Standalone SVG** works fully offline
- **Embedded `.drawio.svg`** requires draw.io Desktop and keeps round-trip editing metadata in the export path

Use `--use-desktop` when embedded export matters.

## Optional MCP Export

If you are already in a live browser session, `export_diagram` can still save `.drawio`, `.png`, or `.svg`.

That path is optional. The default export model remains local CLI generation.

## Recommended Export Choices

| Need | Best output |
|------|-------------|
| ongoing editing | `.drawio` bundle |
| paper figure | `.svg` |
| slide deck image | `.png` or `.jpg` with Desktop |
| printable handoff | `.pdf` with Desktop |

## Tips

- use `--strict-warnings` for paper-quality review
- keep SVG for vector workflows
- standalone SVG covers the built-in node families and the supported network semantic shapes; Desktop export is still the full-fidelity path for other draw.io stencil libraries
- keep the sidecars if the diagram will be edited later

## Next Steps

- [CLI Tool](./cli.md)
- [Editing Diagrams](./editing-diagrams.md)
- [SVG Converter](/api/svg-converter.md)

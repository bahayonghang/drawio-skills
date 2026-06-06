# Export & Save

Draw.io Skill treats export as part of the offline bundle workflow, not as a browser-only step.

## Final Artifacts And Work Sidecars

Keep final delivery directories focused on the files users normally keep:

- `<name>.drawio`
- `<name>.svg`

Keep sidecars in a project-local work directory such as `.drawio-tmp/<name>/` unless the user explicitly asks for a persistent sidecar bundle beside the output:

- `<name>.spec.yaml`
- `<name>.arch.json`

This split supports local iteration without polluting final figure directories. Add `.png` only when the request is thesis, A4, Word, raster-first, screenshot rebuild, or explicitly asks for PNG, and only when draw.io Desktop export is available.

## Common Export Commands

### Generate a `.drawio` file

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --validate --write-sidecars --sidecar-dir .drawio-tmp/output
```

### Generate a standalone SVG

```bash
node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars --sidecar-dir .drawio-tmp/output
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

## Visual Verification Order

Use exported artifacts for visual checks before any browser screenshot:

1. Check the generated SVG when the environment can view SVG.
2. If a raster or final-fidelity check is needed and draw.io Desktop is available, check the Desktop-exported PNG/PDF/JPG or embedded `.drawio.svg`.
3. Use browser or Playwright screenshots only as a live-refinement fallback when explicitly requested and no exported artifact can be inspected.

## Recommended Export Choices

| Need | Best output |
|------|-------------|
| ongoing editing | `.drawio` + work-dir sidecars |
| paper figure | `.svg` |
| paper figure + editable source | final `.drawio` + `.svg`, sidecars in `.drawio-tmp/<name>/` |
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

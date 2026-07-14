# Academic Publication Overlay

Use `drawio-academic-skills` instead of the base skill whenever a diagram is intended for a paper, thesis, dissertation, journal, conference, IEEE/ACM submission, manuscript, camera-ready package, or Word/LaTeX publication.

## Boundary

The overlay is deliberately thin:

- `../drawio` owns the CLI, schema, renderer, themes, general workflows, examples, style presets, and Desktop export.
- `drawio-academic-skills` owns publication decisions, paper-readability gates, academic examples, and export checks.

Install both skills side by side. If `../drawio/scripts/cli.js` is missing, stop and install the base skill; do not copy its runtime into the overlay.

## Academic Preflight

Decide these points before rendering:

1. Venue and audience.
2. Figure type: `architecture`, `roadmap`, or `workflow`.
3. Color policy: monochrome, grayscale-safe accent, or color PDF.
4. Caption, title, legend, and abbreviation requirements.
5. Formula and text-position fidelity.
6. Print target and requested exports.
7. Node budget and whether the figure should be split.

```yaml
meta:
  profile: academic-paper
  figureType: workflow
  theme: academic
  title: Experimental workflow
  print: { target: ieee-single }
```

## Source Understanding And Plan Gate

For a paper, extract the research problem, evidence chain, method, mechanism, validation, findings, and contribution needed by the figure. For a reference image, inventory visible containers, labels, formulas, connectors, legends, colors, and uncertainty.

Present a concise diagram plan before rendering complex paper-derived figures or academic redraws. A simple, fully specified figure can proceed directly to YAML.

## Optional Image Preview

An external image model may provide a concept preview after the plan is confirmed. It is optional and never becomes the final artifact.

- Ask before sending unpublished, confidential, proprietary, or sensitive material.
- Prefer a compact plan, short labels, layout intent, and style constraints over raw source documents.
- Treat generated text and formulas as approximate; correct them in YAML.
- Verify the exported Draw.io artifact, not the concept preview.

## Delivery

The default academic final set is:

- editable `<name>.drawio`
- 300 DPI `<name>.png` from draw.io Desktop

When Desktop is unavailable, PNG export falls back to standalone SVG and must be reported. Keep `.spec.yaml`, `.arch.json`, normalized YAML, and diagnostics in a work directory.

```bash
node skills/drawio/scripts/cli.js input.yaml figure.drawio --validate --write-sidecars --sidecar-dir .drawio-tmp/figure --strict-warnings
node skills/drawio/scripts/cli.js input.yaml figure.png --validate --use-desktop
```

For IEEE or another vector submission, explicitly export PDF (or the venue-supported vector format). The default raster PNG is for review, Word, thesis, and raster-first delivery; it is not a substitute for a required vector submission.

## Quality Gate

Before reporting completion, confirm:

- labels remain readable at the target print width
- node count is within the academic playbook budget
- formulas use supported delimiters
- CJK and Latin fonts resolve to the intended Times New Roman and SimSun stack
- colors are not the only carrier of meaning
- captions, legends, labels, and formulas are not clipped
- connector labels clear their lines and arrows do not cross text or nodes
- the exported PNG, fallback SVG, or requested Desktop artifact was inspected
- any visible defect was corrected in YAML and rerendered

The Academic Overlay never requires MCP or a live backend.

## Related

- [Workflows](./workflows.md)
- [Replicating Diagrams](./scientific-workflows.md)
- [Math Typesetting](./math-typesetting.md)
- [Export and Artifacts](./export.md)

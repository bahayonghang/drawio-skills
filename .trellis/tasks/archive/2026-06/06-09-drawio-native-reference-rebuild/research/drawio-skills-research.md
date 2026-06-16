# Draw.io skills and native rebuild research

Date: 2026-06-09

## Local References

- `ref/codex-visio-paper-figure-skill/SKILL.md`
  - Rebuild reference images as native editable Visio shapes.
  - Do not deliver a full-page embedded image.
  - Temporary tracing images must be removed or hidden before final delivery.
  - Final package checks include no full-page raster reference in `visio/media`.
- `ref/codex-visio-paper-figure-skill/references/rebuild-guidelines.md`
  - Write an inventory before coding complex figures.
  - Use top-left bounds like `RectTL(x, y, w, h)`.
  - Prefer native motifs for dense details.
- `skills/drawio/references/workflows/replicate.md`
  - Already supports source palette extraction, text bounds, formula/text nodes, `labelOffset`, exported SVG verification, and sidecar separation.
- `skills/drawio/scripts/dsl/spec-to-drawio.js`
  - Already supports `bounds`, `waypoints`, `labelOffset`, and `meta.replication.background`.
  - Currently computes canvas size from content bounds and does not apply documented `meta.canvas`.
- `.trellis/tasks/archive/2026-06/06-08-optimize-academic-overlay-from-visio-skill`
  - Academic overlay optimization from Visio skill is already complete, so this task should target base replication/runtime behavior.

## Network References

- Agents365 drawio-skill: https://github.com/Agents365-ai/drawio-skill
  - Generates `.drawio` XML and exports locally through draw.io Desktop CLI.
  - Emphasizes exported image self-checks and embedded XML for final PNG/SVG/PDF.
  - Useful as an export/self-check reference, but it is XML-first and Desktop-CLI-first, while this repo is YAML-first and offline-first.
- jgraph drawio-mcp skill CLI README: https://github.com/jgraph/drawio-mcp/blob/main/skill-cli/README.md
  - Describes a skill that generates native `.drawio` files with optional PNG/SVG/PDF export and browser URL fallback.
  - Confirms native `.drawio` plus optional export is a common draw.io skill pattern.
- jgraph drawio-mcp shared XML reference: https://github.com/jgraph/drawio-mcp/blob/main/shared/xml-reference.md
  - Documents mxGraph XML generation concepts such as `mxCell`, `mxGeometry`, styles, and edge routing.
  - Supports keeping this repo's renderer aligned with native mxGraph concepts.
- jgraph drawio-desktop README: https://github.com/jgraph/drawio-desktop
  - Confirms draw.io Desktop is a local Electron wrapper around the core editor and publishes desktop builds.
  - Supports treating Desktop as an optional local export enhancer rather than a required browser/live backend.

## Synthesis

The strongest implementation direction is not to copy another draw.io skill. It is to add the missing native reference rebuild guardrails to this repo's existing YAML-first base:

- an inventory-based replicate workflow;
- active `meta.canvas` page sizing for reference-coordinate fidelity;
- full-page image audit in the existing validation path;
- tests and evals that prove the final diagram is native editable draw.io content, not a pasted screenshot.

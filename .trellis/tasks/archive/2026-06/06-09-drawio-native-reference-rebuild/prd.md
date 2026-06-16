# Draw.io native reference rebuild

## Goal

Strengthen the base `skills/drawio` replication workflow so it can rebuild a reference image, screenshot, or paper figure as native editable draw.io content instead of a flat embedded image.

The Visio reference skill's useful pattern is not its Visio COM automation. The useful pattern is: inventory the reference, map visible objects to native editable shapes, draw from top-left reference coordinates, export a preview, and verify the final package does not contain a full-page raster copy. This task adapts that pattern to the existing draw.io architecture: YAML-first, offline CLI, `.drawio` plus `.svg` final artifacts, work-dir sidecars, optional Desktop export, and academic overlay reuse through the sibling base skill.

## Confirmed Facts

- The Trellis task exists at `.trellis/tasks/06-09-drawio-native-reference-rebuild` and moved from `planning` to `in_progress` after the user approved implementation.
- A previous archived task, `.trellis/tasks/archive/2026-06/06-08-optimize-academic-overlay-from-visio-skill`, already optimized `drawio-academic-skills` using Visio-inspired academic source understanding, confirmation gates, preview semantics, and one-pass QA. This task should not duplicate that overlay work.
- `ref/codex-visio-paper-figure-skill` requires native editable reconstruction, permits a reference image only as a temporary tracing layer, uses top-left bounds such as `RectTL(x, y, w, h)`, and checks that the final `.vsdx` package does not contain a full-page raster reference image.
- `skills/drawio/references/workflows/replicate.md` already includes source palette extraction, text bounds, formulas, `labelOffset`, generated `.drawio` plus sidecars, exported SVG verification, and browser screenshots only as a last-resort review aid.
- `skills/drawio/scripts/dsl/spec-to-drawio.js` already supports explicit node `bounds`, edge `labelOffset`, edge `waypoints`, and `meta.replication.background`.
- `skills/drawio/references/docs/design-system/specification.md` documents `meta.canvas: auto | 800x600 | 1200x800`, but the renderer currently calculates `pageWidth` and `pageHeight` from content bounds plus padding. There is no effective `meta.canvas` parser or validator.
- Existing tests cover sidecar separation, exported-artifact-first visual checks, academic overlay boundaries, replication metadata in `arch.json`, bounds, and label offsets. They do not yet lock explicit canvas sizing or full-page embedded image rejection.
- Network research found related draw.io skills and upstream references that emphasize native `.drawio` XML generation, optional Desktop export, embedded XML exports, and mxGraph cell geometry. These support the local direction but do not replace this repo's YAML-first base architecture.
- Existing repo policy requires clean final deliverable directories by default: final `.drawio` and `.svg` stay in the output directory; `.spec.yaml`, `.arch.json`, raw YAML, diagnostics, and inventory files belong in `.drawio-tmp/<name>/` unless explicitly requested beside the output.

## Requirements

- Update the base draw.io replication guidance to state the native rebuild principle clearly:
  - do not satisfy a rebuild by embedding the whole reference image as the final page;
  - use native draw.io shapes, text, connectors, groups/modules, labels, waypoints, styles, and simplified motifs;
  - allow a reference image only as temporary analysis/tracing material, not as the final full-page content.
- Add a reusable reference inventory contract for `/drawio replicate`:
  - source size and canvas/background;
  - panels or major regions with top-left bounds;
  - native shape inventory with labels, styles, geometry, and uncertainty notes;
  - connector inventory with endpoints, waypoints, labels, and offsets;
  - palette summary and native approximation choices for dense visual motifs.
- Implement renderer-level `meta.canvas` support so reference-image coordinates can map to draw.io page dimensions:
  - `meta.canvas: auto` or absent preserves current behavior;
  - `meta.canvas: <width>x<height>` sets explicit minimum `pageWidth` and `pageHeight`;
  - explicit canvas values must be validated as positive finite integer dimensions;
  - generated XML still expands beyond the explicit canvas when content exceeds it, avoiding hidden off-page objects.
- Add full-page embedded-image audit coverage in the existing validation path:
  - reject or report image cells that cover the draw.io page like a pasted reference image;
  - allow small image cells or icon-like image uses when they do not function as the whole diagram;
  - reuse `--validate` and `validateXml(xml)` rather than adding a separate command.
- Update base docs, examples, tests, and evals so native reference rebuild is testable.
- Keep `drawio-academic-skills` as a publication overlay that inherits the base capability. Only update overlay docs/evals when needed to point at the strengthened base behavior.
- Preserve the current clean-artifact and exported-artifact-first verification policies.

## Acceptance Criteria

- [ ] `skills/drawio/references/workflows/replicate.md` describes native reference rebuild, reference inventory, top-left coordinate mapping, and no final full-page raster image.
- [ ] The specification docs describe `meta.canvas` in the same shape the renderer actually accepts.
- [ ] `specToDrawioXml` emits `pageWidth` and `pageHeight` from `meta.canvas` when provided, while preserving current auto sizing when it is absent or `auto`.
- [ ] `validateSpec` rejects invalid `meta.canvas` values with explicit error messages.
- [ ] `validateXml` or the existing validation chain flags full-page image cells in generated/imported draw.io XML.
- [ ] Tests cover valid explicit canvas, auto canvas compatibility, invalid canvas values, full-page image rejection, and small image allowance.
- [ ] Base evals include a native reference rebuild case with explicit canvas, inventory, native shapes, exported-artifact verification, and no full-page image embed.
- [ ] Academic evals remain aligned without duplicating base runtime requirements.
- [ ] Final outputs remain `.drawio` plus `.svg` by default, with inventory/spec/arch sidecars in `.drawio-tmp/<name>/`.
- [ ] `node --test skills/drawio/scripts/dsl/spec-to-drawio.test.js` passes.
- [ ] `node --test tests/integration.test.js tests/visual-verification-policy.test.js tests/drawio-academic-skill.test.js` passes.
- [ ] `npm test` passes.
- [ ] `just lint` and `just ci` are run before final completion unless blocked by local dependency or environment issues.

## Out of Scope

- No Visio COM automation, `.vsdx` generation, or PowerShell drawing scripts.
- No computer-vision object detection pipeline, OCR engine, automatic image segmentation, or model-specific image-generation client.
- No new parallel JSON diagram spec.
- No required MCP/live backend, browser automation, or diagrams.net session for normal replication.
- No redesign of the full renderer layout system.
- No change to the academic overlay's identity or base/overlay ownership boundary.
- No broad docs rewrite outside the affected base replication/spec/eval surfaces.

## Decision

- The user approved the code-level MVP on 2026-06-09: implement both renderer-level `meta.canvas` support and full-page image audit.

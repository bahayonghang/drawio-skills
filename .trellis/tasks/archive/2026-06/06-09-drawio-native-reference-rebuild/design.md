# Draw.io native reference rebuild design

## Architecture Boundary

Keep implementation in the base skill:

- `skills/drawio` owns CLI, YAML DSL, renderer, validation, workflows, examples, and base evals.
- `skills/drawio-academic-skills` stays a thin publication overlay. It may mention that paper figures inherit the strengthened base replication path, but it should not copy base scripts or define a second runtime.

This follows the existing sibling-skill architecture and avoids repeating the previous academic overlay optimization task.

## Workflow Design

The `/drawio replicate` workflow should add a native reference rebuild phase before YAML rendering:

1. Inspect the reference image or existing diagram.
2. Write a compact inventory in the work directory, normally `.drawio-tmp/<name>/reference-inventory.yaml` or as a visible planning block before final YAML.
3. Map the inventory to the existing YAML DSL:
   - panels and large regions become modules or grouped native shapes;
   - rectangles, diamonds, ovals, documents, databases, users, formulas, labels, callouts, legends, and captions become native nodes;
   - connectors use existing edge types, `waypoints`, `labelPosition`, and `labelOffset`;
   - source colors use `meta.replication.background` and `meta.replication.palette`;
   - source page size uses `meta.canvas`.
4. Render `.drawio` and `.svg` through the existing CLI.
5. Verify exported artifacts first and run XML validation.
6. Confirm the final `.drawio` does not rely on a full-page image cell.

The inventory is a workflow contract, not a new runtime format. YAML remains the canonical diagram spec.

## `meta.canvas` Contract

Supported values:

```yaml
meta:
  canvas: auto
```

```yaml
meta:
  canvas: 1200x800
```

Behavior:

- `undefined`, `null`, or `auto` preserves the current auto sizing behavior.
- `<width>x<height>` is parsed as positive integer page dimensions.
- The rendered `pageWidth` is `max(autoWidth, explicitWidth)`.
- The rendered `pageHeight` is `max(autoHeight, explicitHeight)`.
- The explicit canvas is a minimum page size, not a clipping rectangle.
- The existing 8px snap behavior for auto layout stays unchanged.

Validation:

- Accept only strings matching `auto` or `<positive integer>x<positive integer>`.
- Reject zero, negative, decimal, missing, object, array, and malformed values.
- Keep error text specific, for example: `Invalid meta.canvas "wide": use "auto" or WIDTHxHEIGHT`.

Compatibility:

- Existing specs without `meta.canvas` must produce the same output shape except for unrelated deterministic formatting.
- Specs that already included documented `meta.canvas` values now become active instead of silently ignored.
- No `arch.json` schema change is required for MVP; the `.spec.yaml` sidecar remains the canonical place to preserve canvas metadata.

## Full-Page Image Audit

Add this to the existing XML validation path because `cli.js --validate` already calls `validateXml(xml)`.

Detection rules:

- Parse `pageWidth` and `pageHeight` from `<mxGraphModel>`.
- Inspect vertex image cells, especially styles containing `shape=image`, `image=`, or embedded `data:image`.
- Inspect the cell's `mxGeometry` `x`, `y`, `width`, and `height`.
- Flag an image cell when it covers most of the page, for example:
  - width is at least 90 percent of page width,
  - height is at least 90 percent of page height,
  - area is at least 80 percent of page area,
  - and origin is near the page origin.
- Do not flag smaller logos, icons, or local motif images that are clearly not a full-page reference.

Implementation should stay conservative and test-driven. The audit targets the known failure mode: a pasted reference screenshot used as the whole diagram.

## Documentation Placement

Use progressive disclosure:

- Keep `skills/drawio/SKILL.md` short: one or two lines that state native rebuild and point to `references/workflows/replicate.md`.
- Put the inventory template and detailed mapping rules in `skills/drawio/references/workflows/replicate.md`, or in a new `references/docs/native-reference-rebuild.md` linked from replicate if the section becomes too long.
- Update `skills/drawio/references/docs/design-system/specification.md` so `meta.canvas` examples match the real renderer.
- Keep docs in `docs/guide/specification.md` and `docs/guide/scientific-workflows.md` synchronized only where they already mirror the affected feature.

## Tests And Evals

Focused tests:

- DSL rendering test for `meta.canvas: 1200x800`.
- DSL rendering test that explicit canvas is a minimum and content can expand beyond it.
- Validation tests for invalid `meta.canvas` values.
- XML validation test that a full-page image cell fails.
- XML validation test that a small image cell passes.
- Integration test if CLI sidecar/export behavior needs coverage beyond unit tests.

Eval updates:

- Add a base eval for native reference rebuild from a flowchart screenshot or SVG fixture.
- Expected output should require an inventory, explicit canvas, native shapes, `.drawio` plus `.svg`, sidecars in a work directory, exported-artifact verification, and no full-page reference image.
- Academic evals should reference inherited base native rebuild behavior only if a current eval needs tightening.

## Trade-Offs

- Renderer support plus XML audit is slightly more work than docs-only, but it makes the core fidelity gap testable.
- A regex-based XML audit is consistent with the current `validateXml` style. A full XML parser would be cleaner but larger and unnecessary for this narrow failure mode.
- Treating `meta.canvas` as a minimum page size avoids hidden content. Strict clipping would better match some screenshot dimensions, but draw.io pages should remain editable and safe by default.

## Rollback

The change should be easy to revert because it is localized:

- remove `meta.canvas` parsing and tests;
- remove full-page image audit from `validateXml`;
- revert doc/eval additions.

Existing specs without `meta.canvas` should be unaffected.

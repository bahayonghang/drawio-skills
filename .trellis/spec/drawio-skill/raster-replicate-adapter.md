# Raster Replicate Adapter Contract

Executable contract for the offline structured-input branch of replicate.

## Scope

- `raster-extraction` consumes JSON already extracted by a model or human. It
  does not read images, run OCR, invoke a model, or claim extraction accuracy.
- The adapter emits one legacy-flat canonical spec. Existing validation,
  vendored JavaScript ELK, rendering, sidecars, and visual review remain the
  only downstream path.
- The base skill owns runtime and tests. The academic overlay does not copy the
  adapter, schema, fixture, or review workflow.

## Input And Mapping

- Require `schemaVersion: 1`, a non-empty `nodes` array, an `edges` array, and
  optional `{ width, height, background }` canvas metadata.
- Require caller-provided safe, unique node and edge IDs. Labels are bounded
  plain text; control characters and tag-shaped raw HTML are rejected.
- Explicit canonical node `type` wins. Otherwise map only the documented shape
  vocabulary to existing semantic types; do not add raw draw.io styles or a
  second shape vocabulary.
- Preserve only canonical fields: node bounds and narrow style colors/font
  fields; edge endpoints, label, dashed/arrow/stroke style, waypoints, and
  label offset. Unknown fields are hard errors.
- If every node supplies `x/y/w/h`, preserve all top-left bounds. If any node
  supplies no geometry, omit all source bounds and let the existing JS ELK
  path place the whole graph. Partial node geometry is an error.
- Plain text nodes always use transparent fill and stroke. Opaque text styles
  are rejected instead of being silently ignored.

## Errors And Limits

- Malformed JSON, unknown fields, unsafe values, duplicates, dangling edges,
  invalid colors, partial geometry, or excessive counts/dimensions use
  `ADAPTER_PARSE` with adapter and field-path context.
- Unsupported schema versions use `ADAPTER_UNSUPPORTED`.
- Reuse the shared JSON byte/depth/entry/prototype-key validation. Keep node,
  edge, canvas, coordinate, font, and label bounds deterministic and finite.
- Never accept raw style, image data, arbitrary links, HTML fields, Python,
  Graphviz, network, Desktop, browser, MCP, or model execution at this boundary.

## Required Tests

- Exact explicit-bounds/style mapping and all-or-none geometry behavior.
- Good/base/bad error matrix including pollution keys and oversize values.
- File-backed adapter -> `validateSpec` -> actual JS ELK -> renderer ->
  `validateXml`, with deterministic output and escaped legal text.
- CLI stdin/file, `.drawio`, `--export-spec`, and canonical sidecars.
- Focused tests first, then repository tests and `just ci`.

Deterministic fixture and command execution are not Desktop, human, or visual
model evidence. Those states remain `missing evidence` until run separately.

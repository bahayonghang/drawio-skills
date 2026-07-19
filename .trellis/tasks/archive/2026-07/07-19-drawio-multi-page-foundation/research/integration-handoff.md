# Multi-page foundation handoff

## Verified contract

- Canonical bundle v1 uses explicit `schemaVersion: 1`, ordered `pages`, and structured `{ from, to }` page links.
- Legacy flat YAML remains on the existing single-page path; its YAML and arch v1 shape are unchanged.
- Multi-page rendering produces one ordered `<mxfile>`, validates each decoded page independently, and stores canonical page/object metadata in `UserObject` wrappers.
- `--all-pages` is explicit for draw.io import; default import remains the first-page flat spec. Binary output from a bundle requires `--page <index|id|name>`.
- Document sidecars remain one bundle `.spec.yaml` and one arch v2 `.arch.json`; page order and author order are serialized without timestamps or absolute paths.

## Command-executed evidence

- Focused document, renderer/import, artifact, integration, and security tests: passed.
- Legacy single-page examples and CLI matrix: passed.
- Multi-page uncompressed, compressed, and mixed-page semantic round-trip: passed.
- `npm test`, `just ci`, and `git diff --check`: passed in this worktree.
- Injection regression covers unsafe page names and confirms no raw `<script>`, `javascript:`, or event attributes in generated XML.

## Scope-limited evidence

- Draw.io Desktop export, browser, MCP, visual model, network access, and external binary execution: `missing evidence` by approved task scope; no substitute claim is made.
- Large third-party `.drawio` corpus and arbitrary unknown XML attribute preservation: `missing evidence` and outside the canonical round-trip contract.

## Consumer handoff

Future C4/compress children may consume the bundle v1 helpers and arch v2 shape. They must preserve page order, `(pageId, objectId)` identity, structured links, per-page validation, and the legacy flat compatibility boundary. C4 presets, compression semantics, raster export, and integration routing remain separate work.

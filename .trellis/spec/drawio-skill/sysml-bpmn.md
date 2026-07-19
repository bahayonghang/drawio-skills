# Draw.io Skill: SysML/BPMN Stencil Contract

> Recorded from task `07-19-drawio-sysml-bpmn-delta` (2026-07-19).

## Ownership and Data Flow

- `skills/drawio/assets/catalog/shape-index.json.gz` is the single vendored draw.io shape source. Do not copy it into another runtime or the academic overlay.
- `COVERED_PREFIXES` in `scripts/dsl/shape-catalog.js` is the single allowlist used by catalog generation and unknown-shape validation. SysML and BPMN coverage is `mxgraph.sysml.` and `mxgraph.bpmn.`.
- `scripts/tools/build-shape-catalog.js` generates the committed catalog. Duplicate source rows with the same `shape=` are one stencil entry; merge and sort their tags so variant vocabulary remains searchable.
- Search, `resolveShapeNameKind()`, `validateShapeReferences()`, and `specToDrawioXml()` must consume the same generated catalog and existing renderer.

## Supported Contract

- Offline search may return vendored SysML/BPMN stencil base names, including raw canonical icon syntax such as `icon: mxgraph.sysml.port` or `icon: mxgraph.bpmn.task2`.
- Known names validate as `stencil`; misspellings under either covered namespace are `unknown` and fail normal strict conversion.
- Generic canonical nodes, edges, labels, layout, sidecars, and visual-review behavior remain shared with all other diagrams.
- Source row counts are not capability counts. The vendored index currently has 27 SysML and 196 BPMN rows but only 19 and 6 unique `shape=` names because many rows are style variants.

## Deferred Contract

Do not claim end-to-end support for structures that the flat canonical spec cannot preserve:

- relative SysML IBD or parametric ports;
- BPMN pool/lane parent-child containment;
- BPMN message, sequence, conditional, or default flow semantics and cross-pool constraints;
- style parameters that distinguish source rows sharing one stencil base name.

These require a separately reviewed canonical containment/geometry/connector contract. Do not encode them as new semantic types merely to match an upstream preset list.

## Change Checklist

1. Add a failing generator test before changing a covered prefix or metadata merge rule.
2. Rebuild `shape-catalog.json.gz` and prove two consecutive builds have the same hash.
3. Verify source-row and unique-stencil counts separately.
4. Cover search ranking, explicit prefix filtering, known/unknown validation, and canonical icon XML output.
5. Run the adjacent catalog/DSL tests, `npm test`, `just ci`, and `git diff --check`.
6. Keep Desktop, model, human semantic review, and deferred nested constructs as `missing evidence` unless those paths were actually executed.

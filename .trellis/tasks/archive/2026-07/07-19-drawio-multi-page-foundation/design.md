# Design - Canonical 多页基础

## 1. Boundary and Source of Truth

本 child 在现有单页 DSL 外增加一个 document-level orchestration layer，不复制 theme、layout、renderer、SVG 或 XML parser：

```text
legacy YAML -------------------------------> existing single-page path (unchanged)
multi-page YAML
  -> classify/normalize document
  -> validate document + links
  -> for each ordered page:
       validateSpec -> applyAutoLayout -> specToDrawioXml -> validateXml
  -> wrap ordered <diagram id name> pages into one <mxfile>
  -> document sidecars

multi-page .drawio --all-pages
  -> extract/decode each <diagram>
  -> page-local drawioToSpec projection
  -> restore canonical object metadata
  -> validate document + links
  -> one canonical bundle
```

The legacy path is deliberately not routed through the new XML wrapper. This is the compatibility boundary that protects byte-sensitive single-page output.

## 2. Canonical Bundle v1

```yaml
schemaVersion: 1
meta:
  title: Internet Banking
  source: generated
pages:
  - id: context
    name: System Context
    meta:
      theme: tech-blue
      layout: hierarchical
    nodes:
      - id: banking
        label: Internet Banking
        type: service
    edges: []
    modules: []
  - id: containers
    name: Containers
    meta:
      theme: tech-blue
      layout: hierarchical
    nodes:
      - id: api
        label: API
        type: service
    edges: []
    modules: []
links:
  - from: { pageId: context, objectId: banking }
    to: { pageId: containers, objectId: api }
```

Contract decisions:

- `schemaVersion: 1` is mandatory only for the new bundle. Legacy flat YAML remains unversioned and is not rewritten.
- top-level `meta` is document metadata (`title`, `description`, `source`) only. It does not implicitly merge into page `meta`; every page uses the existing single-page defaults when fields are omitted.
- each page directly embeds the current single-page fields so existing validation/render helpers can be reused without a parallel page schema.
- page order and all object-array order are preserved. No locale or ID sorting is introduced during author serialization or round-trip.
- names are display-only; IDs are identity. Duplicate names are allowed because tools can address pages by ID.

## 3. Normalization and Compatibility

Introduce a narrow document helper (planned name `scripts/dsl/document-spec.js`) with seams equivalent to:

```js
classifyDocumentSpec(value) // 'legacy-single-page' | 'multi-page-v1'
normalizeDocumentSpec(value)
validateDocumentSpec(document)
selectDocumentPage(document, selector)
resolveDocumentObject(document, { pageId, objectId })
```

- legacy normalization creates an internal one-page view `{id: 'page-1', name: 'Page-1'}` only for shared checks. It retains the original flat object and an explicit `legacy` discriminator so default serialization/rendering calls the current functions unchanged.
- semantic no-loss means supported parsed fields, values, array order and metadata survive. YAML comments, anchors, whitespace and source bytes remain outside the contract because the existing parser already normalizes them.
- unknown `schemaVersion`, a `pages` field without the discriminator, or a multi-page discriminator mixed with top-level `nodes/edges/modules` is rejected instead of guessed.

## 4. Identity and Ordering

### Page identity

- `page.id`: `^[A-Za-z][A-Za-z0-9_-]*$`, maximum 128 characters, unique case-sensitively.
- `page.name`: non-empty Unicode string, maximum 256 characters, no C0/C1 controls. It is XML-escaped and may repeat.
- `pages[index]` is authoritative order. Page IDs and names never reorder the document.

### Object identity

- multi-page node/module/edge IDs use the existing safe ID pattern; edge IDs become mandatory only in multi-page documents.
- a single page has one object namespace across node, module and edge IDs. Reusing `api` for a node and module in the same page is rejected.
- the global canonical address is `(pageId, objectId)`. The same `api` objectId may exist on multiple pages without collision.
- generated mxCell IDs are page-local implementation IDs. Each canonical object is emitted with safe custom data on an `object`/`UserObject` wrapper: `dataPageId`, `dataObjectId`, and `dataObjectKind`. The wrapper owns the renderer cell ID; source/target continue to reference that ID.
- link-capable node/module wrappers additionally own the escaped draw.io `link` attribute. The importer reads canonical metadata first and falls back to current cell-id-derived IDs only for third-party diagrams.

This wrapper mode is multi-page-only. Legacy XML remains the current bare `mxCell` representation.

## 5. Link Contract

`links` is a document-level ordered array. Each entry has exactly `from` and `to`, and each endpoint has exactly `pageId` and `objectId`.

- source and target must resolve to node or module. Edges are stable review objects but not click-link carriers in v1.
- source may have at most one page link in v1. Exact duplicate links and multiple destinations from one source are rejected.
- target page/object must exist at validation time. No label fallback and no implicit first object.
- renderer value is exactly `data:page/id,<escaped-target-page-id>`. `to.objectId` stays in wrapper metadata, YAML and arch v2; viewer focus is explicitly not promised.
- raw URI fields are not part of the schema. IDs cannot contain commas, colons, quotes, angle brackets or controls, so they cannot escape the fixed link template.

## 6. Import and Round-Trip

Extend draw.io import without changing its default:

- no `--all-pages`: current first-page or `--page` flat spec behavior.
- `--all-pages`: extract every `<diagram>` in source order, decode compressed/uncompressed content independently, and return bundle v1.
- `--all-pages` and `--page` are mutually exclusive.
- safe unique `<diagram id>` is preserved. Missing IDs become `page-<1-based-index>`; present unsafe or duplicate IDs fail with `pages[index]` context.
- canonical wrapper metadata restores exact page/object IDs. A third-party diagram without metadata uses current cell-id projection, then document validation rejects post-normalization collisions rather than suffixing them silently.
- imported page links are accepted only when they match the fixed `data:page/id,<safe-id>` form and both endpoint metadata and target object metadata resolve. Other URI links are not promoted into canonical `links`.

Round-trip equality compares normalized supported data, not raw XML bytes. Page order, page id/name, page meta, node/module/edge data, explicit edge IDs, links and arch identity must match.

## 7. Per-Page Validation and Error Location

Document validation returns ordered diagnostics with:

```json
{
  "code": "MULTI_PAGE_INVALID",
  "path": "pages[1].edges[2].to",
  "pageIndex": 1,
  "pageId": "containers",
  "message": "..."
}
```

- call existing `validateSpec` once per page and prefix its error with the page path.
- validate cross-kind object uniqueness, explicit edge IDs and document links after page-local spec validation.
- extract each rendered `<diagram>` and call existing `validateXml` on its decoded `<mxGraphModel>`, never on the concatenated `<mxfile>`.
- aggregate per-page XML errors/warnings in page order. `0/1` duplicates across pages are valid; duplicates within one page remain errors.
- CLI errors may summarize the count but must print every diagnostic path. Unsafe raw payload values are not echoed.

## 8. Renderer and Artifact Boundaries

Planned focused helpers:

```js
renderDocumentPages(document, options)
createMultiPageDrawioFileContent(renderedPages, { version })
validateDrawioDocument(xml)
drawioToDocumentSpec(xml, options)
buildMultiPageArchMetadata(document, { outputFile })
```

- each page gets an isolated `applyAutoLayout` call and current `specToDrawioXml`; no shared ID allocator or layout Map.
- `<mxfile>` host/agent/version remain the current constants. Each `<diagram>` gets escaped `id/name` and appears in canonical order.
- legacy `createDrawioFileContent`, `serializeSpecYaml` and `buildArchMetadata` stay behaviorally unchanged.
- multi-page spec sidecar is one bundle. Multi-page arch v2 contains document summary, ordered page records, page-local objects/counts, total counts and structured links. No generated timestamp or absolute path.

## 9. CLI Matrix

| Input | Flags/output | Result |
| --- | --- | --- |
| legacy YAML | existing commands | unchanged single-page behavior |
| multi-page YAML | `.drawio` | all pages |
| multi-page YAML | SVG/PNG/PDF/JPG + `--page` | selected page only |
| multi-page YAML | SVG/PNG/PDF/JPG without `--page` | explicit ambiguity error |
| multi-page YAML | no output path | explicit error; legacy stdout unchanged |
| `.drawio` | default / `--page` | unchanged flat first/selected page |
| `.drawio` | `--all-pages` | canonical bundle v1 |
| `.drawio` | `--all-pages --export-spec` | bundle YAML and optional arch v2 |
| any | `--all-pages --page` | explicit conflict error |

The child does not add per-page filename templates, directory fan-out, combined multi-page SVG, Desktop batch export or visual evidence.

## 10. Security and Dependency Decisions

- no new runtime dependency. Use current `js-yaml`, `node:zlib`, XML utilities, renderer and JS ELK.
- untrusted YAML/XML remains data. All page display text is escaped; all identity/link fields are allowlisted and bounded.
- tests include closing tags, quotes, controls, comma/colon URI escapes, `javascript:`, `data:text/html`, duplicate normalized IDs and compressed payload failures.
- Desktop, network, browser, MCP, visual model and binary evidence are unnecessary for this deterministic foundation. No prior child approval is inherited.

## 11. Consumers and Ownership

- future C4 may author page content and links against bundle v1, but cannot change this child into a C4 preset task.
- future `compress` may add summary/detail pages against bundle v1, but clustering, naming and narrative correctness remain in its own child.
- skill routing, interfaces, mirrored docs and output scorecard remain owned by a future integration/promotion child that is not created here.
- after implementation passes, `trellis-update-spec` records the executable multi-page contract under `.trellis/spec/drawio-skill/` and updates its index. Planning alone does not modify specs.

## 12. Rollback Shape

1. schema/normalization/identity is isolated from legacy functions and can be reverted without touching the renderer.
2. multi-page wrapper/import is guarded by the bundle discriminator/`--all-pages`; reverting it leaves legacy import/render intact.
3. CLI/artifact branches are additive and can be reverted independently after removing their tests/docs.

No migration is required for existing files because legacy flat specs remain valid and unchanged.

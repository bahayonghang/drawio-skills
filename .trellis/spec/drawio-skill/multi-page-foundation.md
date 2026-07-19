# Multi-page Foundation Contract

## 1. Scope / Trigger

Use this contract when changing canonical multi-page YAML, page/object identity,
structured page links, multi-page `.drawio` import/export, or document-level
arch/spec sidecars under `skills/drawio/scripts/`.

## 2. Signatures

```js
parseDocumentYaml(yamlText)
classifyDocumentSpec(value)
normalizeDocumentSpec(value)
validateDocumentSpec(document)
selectDocumentPage(document, selector)
renderDocumentPages(document, options)
validateDrawioDocument(drawioFileText)
drawioToDocumentSpec(drawioFileText)
serializeDocumentSpecYaml(document)
buildMultiPageArchMetadata(document, { outputFile })
```

CLI boundaries:

```text
<bundle.yaml> <bundle.drawio>
<bundle.yaml> <page.svg|png|pdf|jpg> --page <index|id|unique-name>
<bundle.drawio> <bundle.spec.yaml> --input-format drawio --all-pages --export-spec
```

## 3. Contracts

- Bundle input has `schemaVersion: 1`, document `meta`, ordered `pages`, and
  ordered structured `links`. Page order and object-array order are authoritative.
- Page IDs and object IDs are safe ASCII identities (`^[A-Za-z][A-Za-z0-9_-]*$`,
  max 128); page names are non-empty Unicode display labels (max 256, no controls).
- Object identity is `(pageId, objectId)`. Node/module/edge IDs share one namespace
  within a page, while IDs may repeat across pages. Multi-page edges require IDs.
- Links contain exactly `from` and `to` endpoints with `pageId` and `objectId` and
  resolve only to nodes/modules. A source has at most one link; raw URI fallback is
  not accepted. Rendered page links are `data:page/id,<targetPageId>`.
- Legacy flat YAML remains unversioned and continues through the existing
  single-page parser/renderer/arch v1 path; it is never rewritten as a bundle.
- Multi-page rendering runs layout, rendering, and XML validation per page, then
  wraps the ordered XML pages in one `<mxfile>`. Canonical `UserObject` metadata
  restores page/object identity on import.
- `--all-pages` is explicit and mutually exclusive with `--page`; default draw.io
  import remains first-page flat. Binary output from a bundle requires `--page`.
- Multi-page sidecars are one deterministic bundle `.spec.yaml` and one arch v2
  `.arch.json`; no timestamps, absolute paths, or per-page sidecar fan-out.

## 4. Validation & Error Matrix

| Condition | Result |
| --- | --- |
| Missing/unsafe/duplicate page ID | `MULTI_PAGE_INVALID`, `pages[index].id` |
| Missing/unsafe/duplicate same-page object ID | `MULTI_PAGE_INVALID`, page/object path |
| Missing edge ID or dangling edge endpoint | `MULTI_PAGE_INVALID`, edge path |
| Missing/wrong-kind/duplicate link endpoint | `MULTI_PAGE_INVALID`, link path |
| Duplicate page name selector | `--page ... is ambiguous; candidates: <ids>` |
| Unknown page selector or out-of-range index | explicit `--page` error with available IDs/index range |
| Multi-page binary/stdout ambiguity | explicit output/`--page` error |
| Invalid XML on one page | page-scoped XML validation error; other page root IDs do not collide |
| Unsafe YAML/XML labels or URI payloads | reject or XML-escape; never echo executable markup |

## 5. Good / Base / Bad Cases

- Good: normalize a bundle, render pages in author order, import all pages with
  `--all-pages`, and compare normalized page/object/link data.
- Base: import a third-party page without canonical wrappers; generate deterministic
  `page-N` and cell-derived IDs, then apply normal document validation.
- Bad: sort pages by name, infer a missing link target by label, make object IDs
  globally unique across pages, or validate the concatenated `<mxfile>` as one cell
  namespace.

## 6. Tests Required

- Document tests cover discriminator, legacy no-drift, page/object identity, links,
  selector precedence/bounds, duplicate-name ambiguity, and injection rejection.
- Renderer/import tests cover per-page XML validation, repeated root cells,
  canonical metadata restoration, missing/unsafe/duplicate page IDs, and
  uncompressed/compressed/mixed page round-trips.
- Artifact/CLI tests cover deterministic YAML/arch v2, sidecar placement,
  default first-page import, `--all-pages`, binary selection, stdin ambiguity,
  and generated XML injection scans.
- Run focused tests, the legacy single-page matrix, `npm test`, `just ci`, and
  `git diff --check`. Desktop/browser/MCP/network/visual-model runs remain
  separately reported as `missing evidence` when not executed.

## 7. Wrong vs Correct

Wrong:

```js
pages.sort((a, b) => a.name.localeCompare(b.name))
const target = page.nodes.find((node) => node.label === link.toLabel)
validateXml(fullMxfileText)
```

Correct:

```js
for (const page of document.pages) renderAndValidatePage(page)
const selected = selectDocumentPage(document, selector)
const target = resolveDocumentObject(document, link.to)
validateDrawioDocument(bundleXml) // decodes and validates each page independently
```

# Multi-page Canonical Bundles (`/drawio multi-page`)

Canonical bundle v1 authors, imports, validates, and transforms multi-page `.drawio` documents with stable page and object identity and structured page links. Legacy single-page YAML keeps its existing unversioned parser, renderer, and arch v1 path — it is never rewritten as a bundle.

## Bundle v1 Shape

A bundle input has `schemaVersion: 1`, document `meta`, an ordered `pages` array, and ordered structured `links`. Page order and object-array order are authoritative.

- Page IDs and object IDs are safe ASCII identities (`^[A-Za-z][A-Za-z0-9_-]*$`, max 128); page names are non-empty Unicode display labels (max 256, no control characters).
- Object identity is `(pageId, objectId)`. Node, module, and edge IDs share one namespace within a page, and IDs may repeat across pages. Multi-page edges require IDs.
- Links contain exactly `from` and `to` endpoints, each with `pageId` and `objectId`, and resolve only to nodes or modules. A source has at most one link; a raw URI fallback is not accepted. Rendered page links are `data:page/id,<targetPageId>`.

## CLI

```bash
# Render the whole bundle to a multi-page .drawio
node skills/drawio/scripts/cli.js bundle.yaml bundle.drawio --validate

# Render one page to a binary export (requires --page)
node skills/drawio/scripts/cli.js bundle.yaml page.png --page context --use-desktop

# Import every page of a .drawio as canonical bundle v1
node skills/drawio/scripts/cli.js existing.drawio bundle.spec.yaml --input-format drawio --all-pages --export-spec
```

`--all-pages` is explicit and mutually exclusive with `--page`. Default draw.io import remains first-page flat; binary output from a bundle requires `--page`. Multi-page sidecars are one deterministic bundle `.spec.yaml` and one arch v2 `.arch.json` — no timestamps, absolute paths, or per-page sidecar fan-out.

## Rendering and Round-trip

Multi-page rendering runs layout, rendering, and XML validation per page, then wraps the ordered XML pages in one `<mxfile>`. Canonical `UserObject` metadata restores page/object identity on import, so an `--all-pages` export followed by a re-import compares equal on normalized page, object, and link data. A third-party page without canonical wrappers imports with deterministic `page-N` and cell-derived IDs, then passes normal document validation.

## Errors

| Condition                                    | Result                                                           |
| -------------------------------------------- | ---------------------------------------------------------------- |
| Missing/unsafe/duplicate page ID             | `MULTI_PAGE_INVALID` at `pages[index].id`                        |
| Missing/unsafe/duplicate same-page object ID | `MULTI_PAGE_INVALID` at the page/object path                     |
| Missing edge ID or dangling edge endpoint    | `MULTI_PAGE_INVALID` at the edge path                            |
| Missing/wrong-kind/duplicate link endpoint   | `MULTI_PAGE_INVALID` at the link path                            |
| Duplicate page-name selector                 | ambiguous `--page` error listing candidate IDs                   |
| Unknown selector or out-of-range index       | explicit `--page` error with available IDs/index range           |
| Invalid XML on one page                      | page-scoped validation error; other page root IDs do not collide |

## Evidence Boundary

Document, renderer/import, and artifact/CLI tests are command evidence. Desktop, browser, MCP, network, and visual-model runs remain separately reported as `missing evidence` when not executed.

## Related

- [Postprocess suite](./postprocess.md)
- [Upstream capability map](/api/upstream-capability-map.md)
- [CLI Reference](./cli.md)

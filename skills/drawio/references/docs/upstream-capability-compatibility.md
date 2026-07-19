# Upstream Capability Compatibility

This is the authoritative functional-equivalence map from the 37 Python scripts in upstream `drawio-skill` 1.34.0 to this repository's 2.7.0 base skill. It maps jobs, not command names or intermediate formats.

Mapping meanings:

- `bridge`: an existing base capability already owns the job.
- `adapt`: the useful input or transform semantics were retained behind the canonical boundary.
- `replace`: the job was rebuilt around canonical YAML, offline execution, stable identity, or a stricter trust boundary.
- `defer`: the job is not shipped; the reason and evidence gap remain explicit.

Evidence labels are deliberately narrow. `command-executed` means the checked-in deterministic path ran. It does not prove Desktop, Graphviz, a provider environment, a visual model, a browser/MCP provider, or PR automation unless that executor is named.

## Authoritative Matrix

| Upstream script | Mapping | Owner or replacement entry | Reason | Evidence state |
| --- | --- | --- | --- | --- |
| `aiicons.py` | `replace` | base AI icon catalog and `icon-resolver.js` | Replaces CDN lookup with 309 fixed, licensed, offline canonical SVG brands and deterministic aliases. | catalog, security, render, and Desktop fixture checks command-executed; model review missing evidence |
| `autolayout.py` | `replace` | canonical renderer and vendored JavaScript ELK | Removes the default Graphviz XML generator and keeps one layout and renderer path. | canonical ELK and XML suites command-executed; Graphviz parity missing evidence |
| `buildup.py` | `defer` | no shipped entry | Animation and GIF export require a separate vocabulary, optional image tooling, and visual evidence. | missing evidence |
| `c4.py` | `replace` | canonical page bundle v1 and structured page links | Replaces direct Python XML generation with stable page and object identity plus round-trip validation. | multi-page schema, import, render, sidecar, and round-trip suites command-executed; Desktop multi-page export missing evidence |
| `ciimports.py` | `adapt` | `ci.js` through canonical graph projection | Retains GitHub Actions and GitLab job relationships with stable provider, workflow, and job identity. | saved fixture and canonical render tests command-executed; includes and real-repository corpus missing evidence |
| `composeimports.py` | `adapt` | `compose.js` through canonical graph projection | Retains service, dependency, and volume semantics with shared project and service identity. | saved fixture and canonical render tests command-executed; profiles and includes missing evidence |
| `compress.py` | `defer` | no shipped entry | Heuristic clustering cannot honestly claim a semantically correct executive narrative without a separate contract and review evidence. | missing evidence |
| `dockerimports.py` | `adapt` | `docker-inspect.js` and graph drift | Normalizes saved inspect JSON to shared Compose service identity without daemon capture or container-instance persistence. | saved snapshot, drift, sentinel, ELK, and XML tests command-executed; real daemon and swarm evidence missing evidence |
| `drawio2mermaid.py` | `adapt` | `postprocess mermaid` | Projects canonical single-page or selected bundle content to deterministic Mermaid without parallel XML parsing. | postprocess projection and CLI tests command-executed |
| `drawio2pptx.py` | `defer` | no shipped entry | PPTX needs draw.io Desktop images, presentation layout rules, and an optional presentation library. | missing evidence |
| `drawiodiff.py` | `replace` | stable projection drift and canonical drift rendering | Replaces cell-id or label matching with stable node, edge, and important-attribute identity states. | file-backed report, canonical spec, ELK, XML, and sentinel tests command-executed; provider, Desktop, and model evidence missing evidence |
| `drawiohtml.py` | `replace` | `postprocess html` | Produces script-free, self-contained HTML from canonical pages with escaping and no external assets. | deterministic HTML, injection, and CLI tests command-executed; browser execution missing evidence |
| `encode_drawio_url.py` | `bridge` | `scripts/runtime/diagrams-net-url.js` | The existing fragment encoder already creates a diagrams.net handoff without a server query payload. | URL unit tests command-executed; live browser handoff missing evidence |
| `explain.py` | `adapt` | `postprocess explain` | Reports only observable canonical structure and metadata as deterministic Markdown. | postprocess projection and CLI tests command-executed |
| `goimports.py` | `adapt` | `go-code.js` through canonical graph projection | Uses an optional pinned Node parser and never invokes the Go toolchain or Graphviz. | small source fixtures and parser integration command-executed; workspace and build-tag corpus missing evidence |
| `heatmap.py` | `adapt` | `postprocess heatmap` | Applies bounded local metrics by stable address or identity while preserving canonical metadata. | mutation, safety, renderer, and CLI tests command-executed |
| `jsimports.py` | `adapt` | `js-code.js` through canonical graph projection | Uses the pinned ESM lexer, stable project-relative identity, and the existing ELK path. | small source fixtures and parser integration command-executed; CJS and path-alias corpus missing evidence |
| `k8simports.py` | `adapt` | `kubernetes.js` for declared and saved live JSON | Shares scope, namespace, kind, and name identity across declared and live projections. | JSON, YAML, live snapshot, identity, and render tests command-executed; real cluster and CRD scope evidence missing evidence |
| `openapiimports.py` | `adapt` | `openapi.js` through canonical graph projection | Uses method and normalized path identity instead of traversal ordinals. | saved fixture and canonical render tests command-executed; callbacks, webhooks, and external refs missing evidence |
| `prdiff.py` | `defer` | no shipped entry | Git refs, rendering providers, permissions, dependency downloads, and PR comments require a governed opt-in workflow. | missing evidence |
| `pyclasses.py` | `adapt` | `python-code.js` and fixed Python AST worker | Retains class inheritance with qualified module identity and an isolated optional parser. | small source fixtures and worker integration command-executed; large and ambiguous corpus missing evidence |
| `pyimports.py` | `adapt` | `python-code.js` and fixed Python AST worker | Retains intra-project imports while removing Graphviz and mutable graph-JSON coupling. | small source fixtures and worker integration command-executed; large repository corpus missing evidence |
| `raster2drawio.py` | `adapt` | `--input-format raster-extraction` | Accepts strict versioned visual-extraction JSON, then reuses canonical validation, ELK, renderer, and sidecars. | file-backed parser, CLI, geometry, and canonical render tests command-executed; OCR and model fidelity missing evidence |
| `relabel.py` | `adapt` | `postprocess relabel` | Updates labels by stable page and object address without changing identity, geometry, links, or endpoints. | mutation, preservation, error, and CLI tests command-executed |
| `repair_png.py` | `adapt` | vision-preview PNG inspector and exact IEND repair | Keeps repair only for the known valid truncated-IEND shape after structural PNG validation. | five Desktop previews and PNG structure checks command-executed; provider-backed visual model missing evidence |
| `restyle.py` | `adapt` | `postprocess restyle` | Applies allowlisted style tokens and presets while preserving icons, identity, geometry, links, and metadata. | mutation, safety, renderer, and CLI tests command-executed |
| `runbook.py` | `defer` | no shipped entry | Click-through flows need explicit start, branch, decision, and ambiguity semantics beyond a generic HTML viewer. | missing evidence |
| `rustimports.py` | `adapt` | `rust-code.js` through canonical graph projection | Uses an optional pinned Node parser and never invokes Cargo, rustc, or Graphviz. | small source fixtures and parser integration command-executed; workspace, cfg, and inline-module corpus missing evidence |
| `seqlayout.py` | `defer` | no shipped entry | A sequence authoring model needs its own UML semantics and validation rather than a postprocess shortcut. | missing evidence |
| `shapesearch.py` | `bridge` | existing bundled catalog search | Reuses the single 10,446-entry shape index and existing ranking, validation, and suggestions. | catalog search and validation suites command-executed |
| `sqlerd.py` | `adapt` | `sql-ddl.js` through canonical graph projection | Retains tables, keys, and relationships with schema-qualified identity and a bounded parser contract. | saved DDL fixture and canonical render tests command-executed; broad dialect corpus missing evidence |
| `svgflow.py` | `defer` | no shipped entry | Animated SVG needs a sanitizer, animation vocabulary, provider export contract, and visual evidence. | missing evidence |
| `tfimports.py` | `adapt` | `terraform-config.js` through canonical graph projection | Retains resource, module, and reference semantics with module-qualified stable addresses. | saved fixture and canonical render tests command-executed; multi-module corpus and real provider evidence missing evidence |
| `tfstate.py` | `adapt` | `terraform-state.js` and graph drift | Parses saved state or plan JSON with declared identity and allowlisted attributes, without provider capture. | saved snapshot, exact identity, drift, and render tests command-executed; real provider state and aggregation evidence missing evidence |
| `timelapse.py` | `defer` | no shipped entry | Git history checkout, importer replay, rendering, cleanup, and runtime cost need a governed isolated workflow. | missing evidence |
| `tubemap.py` | `defer` | no shipped entry | This is a new semantic authoring and layout tool, not an existing-diagram postprocess transform. | missing evidence |
| `validate.py` | `bridge` | `validateSpec`, document validation, and `validateXml` | The canonical pipeline already validates specs, page bundles, links, layouts, and rendered XML. | validation, schema, bundle, and XML suites command-executed |

## Shared Boundaries

- All adapters end at canonical spec or page bundle before JavaScript ELK and `specToDrawioXml`.
- The base owns runtime, catalogs, schemas, identity, layout, renderer, and detailed references. The academic overlay owns publication policy only.
- Offline authoring does not require Python, Graphviz, network, Desktop, browser, MCP, or a model. Optional parsers and export providers fail or fall back explicitly.
- The shipped postprocess surface is exactly `mermaid`, `explain`, `relabel`, `restyle`, `heatmap`, and `html`. Deferred rows above are not implicit or hidden commands.

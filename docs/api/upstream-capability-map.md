# Upstream Capability Map

This page summarizes how the 37 Python scripts in upstream `drawio-skill` map onto this repository's offline base skill. It maps **jobs, not command names or intermediate formats**. The authoritative, per-script matrix lives in the base skill at `skills/drawio/references/docs/upstream-capability-compatibility.md`.

## Mapping Semantics

| Mapping   | Meaning                                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| `bridge`  | an existing base capability already owns the job                                                            |
| `adapt`   | the useful input or transform semantics were retained behind the canonical boundary                         |
| `replace` | the job was rebuilt around canonical YAML, offline execution, stable identity, or a stricter trust boundary |
| `defer`   | the job is not shipped; the reason and evidence gap remain explicit                                         |

Evidence labels are deliberately narrow. `command-executed` means the checked-in deterministic path ran. It does not prove Desktop, Graphviz, a provider environment, a visual model, a browser/MCP provider, or PR automation unless that executor is named.

## Shipped Capabilities

| Capability family                   | Upstream jobs covered                                                                    | Entry point                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Declared config / IaC import        | `tfimports`, `k8simports`, `composeimports`, `sqlerd`, `openapiimports`, `ciimports`     | [Config and IaC importers](/guide/config-importers.md)  |
| Code relationship import            | `pyimports`, `pyclasses`, `jsimports`, `goimports`, `rustimports`                        | [Code relationship importers](/guide/code-importers.md) |
| Saved live snapshots + drift        | `tfstate`, `dockerimports`, `k8simports` (live), `drawiodiff`, `prdiff` (declared parts) | [Live snapshots and drift](/guide/live-drift.md)        |
| Multi-page bundles                  | `c4`, `validate` (page bundles)                                                          | [Multi-page bundles](/guide/multi-page.md)              |
| Postprocess                         | `drawio2mermaid`, `explain`, `relabel`, `restyle`, `heatmap`, `drawiohtml`               | [Postprocess suite](/guide/postprocess.md)              |
| Structured raster redraw            | `raster2drawio`                                                                          | [Replicate workflow](/guide/scientific-workflows.md)    |
| Icons and stencils                  | `aiicons`, `shapesearch`                                                                 | [Icons and stencil search](/guide/icons-stencils.md)    |
| Layout, validation, URL, PNG repair | `autolayout`, `validate`, `encode_drawio_url`, `repair_png`                              | [CLI Reference](/guide/cli.md)                          |

All adapters end at a canonical spec or page bundle before JavaScript ELK and the renderer. The base owns runtime, catalogs, schemas, identity, layout, renderer, and detailed references; the academic overlay owns publication policy only. Offline authoring does not require Python, Graphviz, network, Desktop, browser, MCP, or a model — optional parsers and export providers fail or fall back explicitly.

## Deferred Jobs

The following upstream jobs are **deferred, not hidden commands**. Each needs a separate vocabulary, contract, and evidence before it could ship honestly:

`buildup` (animation/GIF), `compress` (executive narrative), `drawio2pptx`, `prdiff` (Git provider automation), `runbook` (click-through flows), `seqlayout` (sequence authoring), `svgflow` (animated SVG), `timelapse` (Git history replay), `tubemap` (new semantic layout).

## Related

- Authoritative matrix: `skills/drawio/references/docs/upstream-capability-compatibility.md`
- [Config and IaC importers](/guide/config-importers.md)
- [Code relationship importers](/guide/code-importers.md)
- [Live snapshots and drift](/guide/live-drift.md)
- [Postprocess suite](/guide/postprocess.md)

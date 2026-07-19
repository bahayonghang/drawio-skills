# Postprocess Suite (`/drawio postprocess`)

Postprocess projects or transforms canonical input offline. It normalizes YAML or an imported `.drawio` once into the existing legacy flat spec or canonical multi-page bundle v1, then runs one operation. It is not an XML-to-XML editor and does not introduce a second page schema.

The shipped operation set is exactly `mermaid`, `explain`, `relabel`, `restyle`, `heatmap`, and `html`.

## Operations

| Operation | Kind       | Output                                                        |
| --------- | ---------- | ------------------------------------------------------------- |
| `mermaid` | projection | deterministic Mermaid                                         |
| `explain` | projection | deterministic Markdown of observable structure/metadata       |
| `relabel` | mutator    | canonical YAML/`.drawio` with updated labels                  |
| `restyle` | mutator    | canonical YAML/`.drawio` with allowlisted style tokens/preset |
| `heatmap` | mutator    | canonical YAML/`.drawio` with bounded local metrics           |
| `html`    | projection | self-contained, script-free HTML viewer                       |

- **Projections** (`mermaid`, `explain`, `html`) are deterministic outputs, not canonical authoring sources.
- **Mutators** (`relabel`, `restyle`, `heatmap`) return existing YAML or `.drawio` and preserve page order, `(pageId, objectId)`, links, adapter identity, icons, stencils, geometry, and academic metadata unless the selected mutator owns a bounded field.
- `relabel` resolves stable page/object addresses; `restyle` accepts only allowlisted style tokens; `heatmap` resolves identity, then address, then an explicitly enabled unambiguous label fallback.
- The `html` output is self-contained and script-free: tabs, zoom controls, generated search results, and page links use HTML/CSS controls only — no remote assets, browser runtime, or inline script.

## CLI

```bash
node skills/drawio/scripts/cli.js postprocess <operation> <input> <output> [options]

# Project one page to Mermaid
node skills/drawio/scripts/cli.js postprocess mermaid bundle.yaml architecture.mmd --page context

# Build a script-free HTML viewer for every page
node skills/drawio/scripts/cli.js postprocess html bundle.yaml viewer.html --all-pages

# Explain observable structure as Markdown
node skills/drawio/scripts/cli.js postprocess explain diagram.drawio diagram.md
```

`--page` and `--all-pages` are mutually exclusive. Each run also writes an adjacent `*.postprocess.json` provenance sidecar recording version, operation, input kind/digest, selected pages, normalized options, auxiliary digests, output kind, diagnostics, and an honest evidence kind — with no paths, secrets, timestamps, or raw auxiliary content. Source and auxiliary inputs must not alias the output or the sidecar.

## Errors

| Condition                                                                  | Result                                            |
| -------------------------------------------------------------------------- | ------------------------------------------------- |
| Unsupported operation, input format, flag, or output extension             | explicit CLI error, non-zero exit                 |
| `--page` together with `--all-pages`                                       | explicit conflict error                           |
| Missing/duplicate relabel address                                          | error unless missing keys were explicitly allowed |
| Unsafe/unknown restyle token or preset                                     | hard error before mutation                        |
| Non-finite metric, duplicate key, unknown palette, or ambiguous label      | hard error before mutation                        |
| Executable HTML/SVG text, remote asset, event attribute, or unsafe page ID | hard error; no partial HTML                       |
| Output or sidecar aliases source/auxiliary input                           | hard error; input bytes unchanged                 |

## Deferred, Not Hidden

Runbook, animated SVG, tube/sequence layout, compression, buildup, PPTX, timelapse, and PR diff are **deferred**, not hidden commands. Calling a deferred operation from the ordinary offline route is rejected. Desktop, browser, model, Python shell, Git provider, and network runs remain `missing evidence`; they are never inferred from fixtures.

## Related

- [Multi-page canonical bundles](./multi-page.md)
- [Upstream capability map](/api/upstream-capability-map.md)
- [CLI Reference](./cli.md)

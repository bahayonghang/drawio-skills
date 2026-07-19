# Canonical Postprocess Contract

## 1. Scope / Trigger

Use this contract when adding or changing offline projections, canonical
mutators, self-contained HTML output, postprocess provenance, or the
`cli.js postprocess` route under `skills/drawio/scripts/postprocess/`.

## 2. Signatures

```js
normalizePostprocessInput(value, { inputFormat })
renderMermaid(value, options)
explainDocument(value, options)
applyRelabel(value, labelMap, options)
applyRestyle(value, preset, options)
applyHeatmap(value, metrics, options)
renderHtml(value, options)
buildPostprocessMetadata({ operation, input, options, auxiliaryInputs, outputKind, evidence })
writePostprocessArtifact(outputPath, content, { inputPath })
```

```text
node skills/drawio/scripts/cli.js postprocess <operation> <input> <output> [options]
```

The supported operation set is exactly `mermaid`, `explain`, `relabel`,
`restyle`, `heatmap`, and `html`.

## 3. Contracts

- Normalize YAML or imported `.drawio` once into the existing legacy flat spec
  or canonical multi-page bundle v1. Do not introduce an XML-to-XML editor or
  another page schema.
- Preserve page order, `(pageId, objectId)`, links, adapter identity, icons,
  stencils, geometry, and academic metadata unless the selected mutator owns a
  bounded field.
- Relabel resolves stable page/object addresses; restyle accepts only
  allowlisted style tokens; heatmap resolves identity, then address, then an
  explicitly enabled unambiguous label fallback.
- Mermaid, Markdown, and HTML are deterministic projections, not canonical
  authoring sources. Canonical mutators return existing YAML or `.drawio`.
- HTML is self-contained and script-free. Tabs, zoom controls, generated
  search results, and page links use HTML/CSS controls; no remote assets,
  browser runtime, or inline script is required.
- Adjacent `*.postprocess.json` provenance records version, operation, input
  kind/digest, selected pages, normalized options, auxiliary digests, output
  kind, diagnostics, and honest evidence kind. Omit paths, secrets, timestamps,
  and raw auxiliary content.
- Writes are explicit and temporary-sibling based. Source and auxiliary inputs
  must not alias either the output or provenance sidecar.

## 4. Validation & Error Matrix

| Condition | Result |
| --- | --- |
| Unsupported operation, input format, flag, or output extension | explicit CLI error and non-zero exit |
| `--page` with `--all-pages` | explicit conflict error |
| Missing/duplicate relabel address | error unless missing keys were explicitly allowed |
| Unsafe/unknown restyle token or preset | hard error before canonical mutation |
| Non-finite metric, duplicate key, unknown palette, or ambiguous label | hard error before canonical mutation |
| Executable HTML/SVG text, remote asset, event attribute, or unsafe page ID | hard error; no partial HTML |
| Output or sidecar aliases source/auxiliary input | hard error; input bytes unchanged |
| Desktop, browser, model, Python shell, Git provider, or network not run | `missing evidence`, never inferred from fixtures |

## 5. Good / Base / Bad Cases

- Good: relabel `detail/api` in a bundle, preserve all identity/link metadata,
  validate the returned bundle, and render through the existing multi-page path.
- Base: project one legacy flat spec to Mermaid or Markdown without changing
  its canonical serialization.
- Bad: match a multi-page object by mutable label by default, mutate raw XML,
  embed a remote viewer asset, add a hidden subprocess, or call a deferred
  operation from the ordinary offline route.

## 6. Tests Required

- Input tests cover legacy no-drift, multi-page order/identity/link retention,
  selectors, and immutable selected-page mapping.
- Projection tests cover deterministic ordering, escaping, downgrade warnings,
  structured links, observable-only explanations, and selected pages.
- Mutator tests cover identity/address precedence, explicit label fallback,
  bounded style/metric options, protected fields, and validated Draw.io
  round-trip.
- HTML tests cover script-free tabs/zoom/search/page links, escaping, unsafe
  labels/SVG rejection, selected pages, and byte determinism.
- Artifact/CLI tests cover all six operations, provenance digests, source and
  auxiliary alias rejection, atomic temp cleanup, deferred-operation rejection,
  and deterministic repeated output.
- Run focused postprocess and multi-page tests, then `npm test`, `just ci`, and
  `git diff --check`.

## 7. Wrong vs Correct

Wrong:

```js
const target = page.nodes.find((node) => node.label === metric.key)
writeFileSync(outputPath, rewriteDrawioXml(xml))
```

Correct:

```js
const result = applyHeatmap(document, metrics, { labelFallback: false })
const validated = normalizePostprocessInput(result)
// Existing canonical serializers and renderers own YAML and Draw.io output.
```

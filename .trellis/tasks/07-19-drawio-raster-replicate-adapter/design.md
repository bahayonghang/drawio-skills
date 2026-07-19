# Design - Raster 与 replicate canonical adapter

## 1. Boundary

```text
versioned extraction JSON
  -> parseRasterExtraction (strict allowlist + normalization)
  -> legacy-flat canonical spec
  -> validateSpec
  -> applyAutoLayout only when extraction geometry is absent
  -> specToDrawioXml
  -> validateXml / existing artifacts and sidecars
```

`parseRasterExtraction` owns input validation and field mapping only. It never imports renderer/runtime modules and never emits XML. The existing CLI owns orchestration. The academic overlay has no runtime role.

## 2. Input Contract

Top-level v1 shape:

```json
{
  "schemaVersion": 1,
  "canvas": { "width": 1200, "height": 800, "background": "#FFFFFF" },
  "nodes": [
    {
      "id": "api",
      "label": "API Gateway",
      "shape": "rounded",
      "x": 120,
      "y": 80,
      "w": 180,
      "h": 64,
      "fill": "#DAE8FC",
      "stroke": "#6C8EBF"
    }
  ],
  "edges": [
    {
      "id": "api-db",
      "source": "api",
      "target": "db",
      "label": "SQL",
      "dashed": false,
      "arrow": true
    }
  ]
}
```

Allowed node keys: `id`, `label`, `type`, `shape`, `x`, `y`, `w`, `h`, `fill`, `stroke`, `fontSize`, `fontColor`. Allowed edge keys: `id`, `source`, `target`, `label`, `dashed`, `arrow`, `stroke`, `waypoints`, `labelOffset`. Unknown keys fail with a path.

Limits reuse canonical caps (`100` nodes, `200` edges) and add canvas dimension `1..100000`, string length bounds, finite numeric checks, and JSON source byte limit from shared adapter parsing. All maps are rebuilt into plain objects; forbidden prototype keys fail during structured-value validation.

## 3. Field Mapping

Shape fallback map (explicit canonical `type` wins):

| extraction shape | canonical type |
| --- | --- |
| `rect`, `rectangle`, `rounded`, `hexagon` | `service` |
| `ellipse`, `oval` | `terminal` |
| `diamond`, `rhombus` | `decision` |
| `cylinder` | `database` |
| `parallelogram` | `queue` |
| `cloud` | `cloud` |
| `document` | `document` |
| `text` | `text` |
| `formula` | `formula` |

The adapter does not claim pixel-identical primitive preservation. It follows the existing replicate semantic mapping and lets explicit canonical `type` resolve ambiguous visuals.

Geometry is document-wide:

- every node has `x/y/w/h` -> copy to `bounds` unchanged;
- a node has none of those keys -> select ELK mode for the whole document and omit bounds from every node;
- a node has a non-empty strict subset -> fail at that node path.

This avoids mixed coordinate systems and the upstream behavior where one missing coordinate re-layouts the entire graph without making the decision explicit.

Style mapping is narrow. Colors accept `#RGB`, `#RRGGBB`, or `none` where canonical semantics allow it. Plain `text` nodes always emit transparent fill/stroke; a non-`none` fill or stroke on a text node fails rather than being silently ignored. Edge `arrow: false` becomes `style.endArrow: none`; `arrow: true` uses the canonical default. `dashed` and `stroke` become edge style fields.

## 4. Files and Ownership

- `skills/drawio/scripts/adapters/raster-extraction.js`: parser/normalizer.
- `skills/drawio/scripts/adapters/raster-extraction.test.js`: unit/error/ELK contract tests.
- `skills/drawio/scripts/adapters/fixtures/raster-extraction.json`: file-backed good case.
- `skills/drawio/scripts/adapters/index.js`: narrow public export.
- `skills/drawio/scripts/cli.js`: input-format help and one parser branch.
- `tests/integration.test.js`: CLI canonical/render/sidecar evidence.
- `.trellis/spec/drawio-skill/raster-replicate-adapter.md`: executable contract captured after implementation.

No files under either `SKILL.md`, `agents/`, global `evals/`, compatibility, scorecard, docs site, academic overlay, package manifests, or lockfiles belong to this child.

## 5. Error Contract

The adapter name is `raster-extraction`. `parseJsonDocument` and `adapterError` provide existing `AdapterContractError` behavior.

| Condition | Code |
| --- | --- |
| malformed/empty JSON, wrong root, unknown field, unsafe value, bad refs | `ADAPTER_PARSE` |
| `schemaVersion` other than `1` | `ADAPTER_UNSUPPORTED` |

Messages use paths such as `nodes[1].x` or `edges[0].target`. They do not echo the full source or absolute paths.

## 6. Compatibility and Rollback

- Existing YAML/Mermaid/CSV/drawio/config/code input routing is unchanged unless the new format is explicitly selected.
- Output is ordinary legacy-flat canonical spec, so existing YAML and artifact compatibility remains authoritative.
- Rollback is removal of the new adapter/export/CLI branch/tests/spec only; no schema migration or asset regeneration is involved.
- If implementation reveals canonical fields cannot preserve a required extraction fact, return to planning. Do not add raw style/XML or extend the schema inside this child.

## 7. Evidence Status

- `command-executed`: parser, canonical validation, JS ELK, renderer, XML validation, CLI and sidecars.
- `file-backed`: checked-in extraction fixture and deterministic generated canonical/XML assertions.
- `missing evidence`: actual raster interpretation, OCR/vision accuracy, Desktop export, model comparison, human fidelity review.

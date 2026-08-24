# Local Image Assets Contract

## 1. Scope / Trigger

Use this contract when adding or changing top-level `assets`, `node.image`,
`--asset-root`, `--extract-assets`, raster size diagnostics, or the academic
raster audit gate under `skills/drawio`.

## 2. Signatures

```js
inspectAssetFile(assetId, record, { assetRoot })
resolveAssetImageStyle(assetId, assets, { assetRoot })
resolveSpecAssets(spec, { assetRoot })
writeExtractedAsset(bytes, mime, { extractDir, assetRoot, byHash })
```

```text
node skills/drawio/scripts/cli.js in.yaml out.drawio --asset-root <dir>
node skills/drawio/scripts/cli.js in.drawio out.yaml --input-format drawio --export-spec --extract-assets <dir>
```

## 3. Contracts

- Mandatory runtime uses `node:` built-ins and files inside `skills/drawio`
  only. No image codec package.
- `assets.<id>.path` is relative to the asset root (cwd or `--asset-root`),
  never to the spec file. Path is the only byte source.
- Ownership chain keeps `assets`: `parseDocumentYaml` →
  `normalizeDocumentSpec` → `validateDocumentSpec` → `pageSpec` (document-spec
  and postprocess copies) → renderer → `serializeSpecYaml`.
- v1 PNG/JPEG only. SVG is a hard error with a v1-unsupported message.
- Multi-page bundles reject `assets` with `MULTI_PAGE_INVALID`.
- Round-trip carrier is one `UserObject` with `dataAssetId`, `dataAssetPath`,
  `dataAssetSha256`, `dataAssetRasterReason`, `dataAssetAtomic`,
  `dataAssetReconstructable`, `dataAssetDecomposition`.
- Foreign images require `--extract-assets`. Do not invent a `data` field.
- Do not modify `VALID_ICON` or `KNOWN_NODE_STYLE_KEYS`.
- Academic audit fields are optional in the Draw.io Base Skill. The Academic
  Overlay gate lives in `validateAcademicProfile` for `academic-paper`.
- Size diagnostics use `info` / `warning` / `error`, MiB units, and
  citation-weighted source bytes before base64. Recipe path:
  `references/docs/local-image-assets.md`.

## 4. Validation & Error Matrix

| Condition | Result |
| --- | --- |
| Absolute path, realpath escape, bad extension, magic mismatch, directory, missing file | hard error at `assets.<id>.path` |
| SVG path | hard error, v1 unsupported |
| stdin YAML with `assets` and no `--asset-root` | hard error naming the flag |
| `node.icon` and `node.image` together | hard error |
| Unknown asset field such as `data` | hard error |
| Same asset id, disagreeing XML carriers | hard error |
| Foreign `shape=image` without `--extract-assets` | hard error naming the flag |
| Single asset > 2 MiB | `warning` (`ASSET_SIZE`) |
| Single asset > 8 MiB or weighted total > 24 MiB | `error` (`ASSET_SIZE`) |
| Bundle top-level or page `assets` | `MULTI_PAGE_INVALID` |
| Academic referenced asset missing audit fields | academic `warning` (strict fails) |

## 5. Good / Base / Bad Cases

- Good: two nodes cite one `assets` id; XML inlines the same PNG twice; `--export-spec` restores all six carrier fields and the original `path` string even when `--sidecar-dir` redirects output.
- Base: a flat YAML with `assets` and `node.image` renders under `--validate --strict-warnings` with `shape=image` and `data:image/png;base64,`.
- Bad: putting a filesystem path in `node.icon`, inventing a `data` field, accepting SVG because the file starts with `<?xml`, or dropping `assets` in `normalizeDocumentSpec`.

## 6. Tests Required

- `parseDocumentYaml(text).spec.assets` is non-empty.
- Path safety matrix, including Windows symlink `missing evidence` when
  Developer Mode is unavailable.
- Threshold ±1 B for 2 / 8 / 24 MiB with level and exit code.
- Round-trip six fields, sidecar-dir path stability, academic-paper re-strict.
- Postprocess mutator retention and mermaid/explain/html degradation.
- Copied `skills/drawio` install without `NODE_PATH`.
- Unchanged `VALID_ICON` slash rejection and raster-extraction `ADAPTER_PARSE`.

## 7. Wrong vs Correct

#### Wrong
Rebuild `{ meta, nodes, edges, modules }` in `normalizeDocumentSpec` / `pageSpec` and leave `assets` off the object. Resolve `assets.<id>.path` relative to the spec file or `--sidecar-dir`. Treat `node.icon` as a local path.

#### Correct
Copy `assets` through parse → normalize → validate → both `pageSpec` copies → renderer → `serializeSpecYaml`. Keep `path` relative to the asset root (`cwd` or `--asset-root`). Use `node.image` for registry ids. Leave `VALID_ICON` unchanged.

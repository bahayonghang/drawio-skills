# State Management

This project has no frontend store. State is represented by files and pure
data objects in the offline diagram workflow.

## State Categories

- Canonical authoring state: the YAML spec object with `meta`, `nodes`,
  `edges`, and `modules`.
- Derived render state: layout positions, Draw.io XML, SVG preview markup, and
  validation warnings produced from the canonical spec.
- Persisted artifacts: final `.drawio` and `.svg`, plus work-dir sidecars
  `.spec.yaml` and `.arch.json`.
- Provider state: optional draw.io Desktop detection result and command args.
- Documentation state: VitePress page content and navigation in
  `docs/.vitepress/config.ts`.
- Version state: synchronized package, lockfile, skill, and eval versions
  managed by `scripts/version-sync.js`.

## Canonical Source Rules

- YAML is the source of truth for create, edit, replicate, import, Mermaid, and
  CSV workflows.
- Imported `.drawio` files should be normalized with `drawioToSpec` before
  iterative editing.
- `.arch.json` is derived metadata. It should summarize stable graph facts and
  omit raw XML or style blobs, as tested in `tests/arch-json.test.js`.
- Final delivery directories should contain final artifacts by default, while
  `.spec.yaml` and `.arch.json` belong in an explicit work directory such as
  `.drawio-tmp/<name>/` unless the user asks for beside-output sidecars.

Example local pattern:

```js
const paths = deriveArtifactPaths('research-figure.svg')
const arch = buildArchMetadata(spec, { outputFile: 'research-figure.svg' })
```

## Derived State Rules

- Derive artifact paths through `deriveArtifactPaths`; do not hand-roll
  `.drawio`, `.spec.yaml`, or `.arch.json` names in new code.
- Derive layout through `calculateLayout` and validated `position`, `bounds`,
  `waypoints`, and `labelOffset` fields.
- Derive semantic node type through explicit `type`, network metadata, or
  `detectSemanticType`; do not duplicate local keyword maps.
- Derive provider export arguments through `buildDrawioExportArgs`; do not
  construct draw.io Desktop shell strings.

## Global State

Use module-level state only for stable constants or bounded caches:

- `DEFAULT_THEME` and the theme cache in `spec-to-drawio.js`.
- constant maps such as supported Mermaid types, shape styles, and exportable
  Desktop formats.

Do not promote request-specific spec data, output paths, validation warnings,
or provider failures to mutable globals.

## Server State

There is no server state in the default runtime. The optional live refinement
backend is documented as a provider, not as the source of truth. If a future
feature adds a server or network cache, keep it separate from the offline
YAML/CLI path and document the new boundary before using it from core modules.

## Common Mistakes

- Do not treat SVG, `.drawio`, or `.arch.json` as editable source when a YAML
  sidecar exists.
- Do not duplicate sidecar path logic in tests or docs; use the same contract
  as `runtime/artifacts.js`.
- Do not store temporary analysis or scratch outputs in `skills/` as if they
  were maintained source.
- Do not update version metadata in only one file; run `just version-check` or
  `node scripts/version-sync.js --check` after version changes.

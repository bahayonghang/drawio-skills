# Component Guidelines

This project does not have UI components. Treat "component" as a composable
ESM module, skill document, workflow document, or VitePress page.

## Module Structure

- Keep CLI orchestration thin in `skills/drawio/scripts/cli.js`: parse
  arguments, choose the input path, call validation/rendering helpers, and
  write outputs.
- Keep reusable behavior in exported functions under focused modules:
  `parseSpecYaml`, `validateSpec`, `specToDrawioXml`, `validateXml` in
  `skills/drawio/scripts/dsl/spec-to-drawio.js`; `parseMermaidToSpec` and
  `parseCsvToSpec` in `skills/drawio/scripts/adapters/index.js`;
  `deriveArtifactPaths` and `buildArchMetadata` in
  `skills/drawio/scripts/runtime/artifacts.js`.
- Keep shared XML parsing/escaping in `skills/drawio/scripts/shared/xml-utils.js`
  instead of duplicating regex helpers across import and SVG modules.
- Let the academic overlay compose the sibling base by path (`../drawio`),
  not by copying runtime modules into `skills/drawio-academic-skills/`.

## Option Object Conventions

Use option objects when a function has optional behavior or test injection
points. This keeps call sites readable and makes tests deterministic.

Examples already in the repo:

```js
specToDrawioXml(spec, { strict, returnWarnings: true, silent: true })
parseMermaidToSpec(text, { profile: 'academic-paper' })
buildArchMetadata(spec, { outputFile: 'figure.svg' })
detectDrawioDesktop({ platform, env, exists, probeCommand })
```

Avoid adding positional boolean arguments such as
`render(spec, true, false, true)`.

## Composition Flow

Follow the existing data flow:

1. Input adapter or importer normalizes YAML, Mermaid, CSV, or `.drawio` into
   the canonical spec object.
2. `validateSpec` rejects invalid structure and unsafe values before rendering.
3. `specToDrawioXml` builds Draw.io XML from the validated spec.
4. Runtime helpers derive `.drawio`, `.spec.yaml`, `.arch.json`, and SVG paths.
5. Tests assert both the generated output and the artifact contract.

This flow is demonstrated by `tests/integration.test.js`.

## Styling Patterns

- Prefer semantic node types, connector types, theme JSON, and style override
  objects over hand-built style strings at call sites.
- Put built-in themes under `skills/drawio/assets/themes/`.
- Put built-in style presets under `skills/drawio/styles/built-in/`.
- Validate theme names, icon names, and style fields before they reach
  `generateNodeStyle`, `generateConnectorStyle`, or Draw.io XML.

Example local pattern:

```js
const theme = loadTheme(spec.meta?.theme)
const style = generateNodeStyle({ id: 'api', label: 'API', type: 'service' }, theme)
```

## Documentation Surface

- Update `docs/.vitepress/config.ts` when adding or renaming a public docs page.
- Keep source-of-truth runtime docs in the skill/reference files first:
  `skills/drawio/SKILL.md`, `skills/drawio/references/workflows/*.md`, and
  `skills/drawio/references/docs/**`.
- When a docs page describes behavior that exists in both English and Chinese,
  keep the corresponding `docs/zh/` page aligned.

## Common Mistakes

- Do not hide invalid input with silent fallbacks. Existing validation throws
  explicit errors for bad specs, IDs, icons, canvas values, math text, and XML.
- Do not introduce a browser or MCP dependency for normal create/edit/export
  flows; the base CLI is the default path and live refinement is optional.
- Do not treat generated raster previews as canonical. YAML remains the source,
  with `.drawio` and SVG as final deliverables by default.
- Do not add broad abstractions for one route. Existing modules are narrow:
  adapters normalize inputs, DSL compiles specs, runtime helpers handle
  artifacts and providers.

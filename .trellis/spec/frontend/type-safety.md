# Type Safety

The runtime code is ESM JavaScript. Type safety is enforced with explicit
runtime validation, clear object contracts, deterministic tests, and a small
amount of JSDoc where it clarifies structured data. The VitePress config is
TypeScript (`docs/.vitepress/config.ts`), but the skill runtime is not a
TypeScript package.

## Type Organization

- The canonical spec shape is local to the DSL: `meta`, `nodes`, `edges`, and
  `modules`.
- Supported values are kept as module constants near their validators, for
  example valid layouts, profiles, sources, alignments, theme names, icon
  patterns, and complexity limits in `spec-to-drawio.js`.
- Runtime helper object shapes are documented by function names and tests:
  artifact paths from `deriveArtifactPaths`, arch metadata from
  `buildArchMetadata`, Desktop detection results from `detectDrawioDesktop`,
  and parsed XML cells from `shared/xml-utils.js`.
- Use short JSDoc only where it helps readers understand an object shape, as
  in `drawio-to-svg.js` and `xml-utils.js`.

## Validation

Validate external or user-controlled input at the boundary:

- YAML text: `parseSpecYaml` parses and then calls `validateSpec`.
- Theme names: must match the safe lowercase kebab-case pattern.
- Node, edge, and module IDs: must match the local ID pattern.
- Icons and network device names: must reject style-injection characters.
- Positions, bounds, waypoints, label offsets, and style numeric fields: must
  be finite numbers where required.
- Math labels: must use official delimiters and must not contain HTML tags.
- Imported `.drawio`: must contain parseable diagrams and a valid
  `<mxGraphModel>`.
- XML output: validate full-page image abuse and structural issues before
  claiming success.

Representative tests:

- `tests/security.test.js`
- `tests/math-typesetting.test.js`
- `skills/drawio/scripts/math/index.test.js`
- `skills/drawio/scripts/dsl/spec-to-drawio.test.js`
- `tests/desktop-detection.test.js`

## Common Patterns

Use defensive JS checks instead of assuming a shape:

```js
if (typeof drawioFileText !== 'string' || drawioFileText.trim() === '') {
  throw new Error('drawioToSpec: input must be a non-empty string')
}
```

Use option objects for test seams:

```js
detectDrawioDesktop({ platform: 'win32', env, exists, probeCommand })
```

Use `Array.isArray`, `Number.isFinite`, optional chaining, and object checks
before reading nested fields from YAML, XML, or environment data.

## Error Handling

- Throw explicit `Error` or `TypeError` in reusable modules.
- In `cli.js`, catch boundary errors, print a useful message to stderr, and
  exit non-zero.
- Do not silently coerce invalid user input into a valid diagram. Fallbacks are
  acceptable only when they are documented, safe, and tested, such as returning
  the default theme for an invalid theme name in `loadTheme`.

## Forbidden Patterns

- Do not use `eval`, dynamic function construction, shell strings, or raw user
  labels as commands.
- Do not trust YAML tags, XML attributes, icon names, theme names, file paths,
  or environment variables without validation.
- Do not add unchecked `JSON.parse`, `yaml.load`, or filesystem path logic when
  the input can come from the user.
- Do not pass raw `process.env.DRAWIO_CMD` directly to a shell. Keep Desktop
  export on `execFileSync` with validated executable candidates.
- Do not add TypeScript-only assumptions to runtime modules unless the repo is
  actually migrated to TypeScript and the build/test scripts enforce it.

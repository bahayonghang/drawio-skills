# Palette Policy

Draw.io diagrams in this repository may apply a metadata-backed color palette
on top of an existing theme. The runtime owner is
`skills/drawio/scripts/dsl/palette.js`; validation gates live in
`palette-validate.js` and are integrated by `spec-to-drawio.js`.

## 1. Scope / Trigger

- Trigger: changes to `meta.palette`, palette JSON/schema, palette tokens,
  semantic color mapping, palette diagnostics, generated swatches, palette
  selection policy, or publication print gates.
- Palette and theme are separate dimensions. Theme owns typography, spacing,
  shapes, line styles, modules, and canvas; palette owns semantic/category
  fill, stroke, text, and an optional default connector color.
- The academic overlay consumes the sibling base catalog and runtime. Do not
  copy palette code or data into `skills/drawio-academic-skills/`.

## 2. Signatures

- YAML: `meta.palette?: string`
- Tokens: `$paletteN`, `$paletteN-fill`, `$paletteN-stroke`,
  `$paletteN-text`, where `N` is 1-based.
- `validatePaletteDefinition(palette)`
- `loadPalette(name, { theme, userDir? }) -> { palette, diagnostics }`
- `applyPalette(theme, palette, { semanticTypes?, tokenIndexes? }) ->
{ theme, usage, diagnostics }`
- `resolvePaletteToken(value, palette, fallback) -> string | null`
- `validatePaletteUsage(palette, usage, {
canvasBackground?, printTarget?, profile?, strict? }) -> diagnostics[]`
- Diagnostic: `{ level: 'info' | 'warning' | 'error', code, message }`

Required palette JSON fields are exported as `PALETTE_REQUIRED_FIELDS` and
must stay aligned with `references/palette.schema.json`:

```json
{
  "name": "okabe-ito",
  "displayName": "Okabe-Ito (CUD)",
  "category": "academic",
  "colorblindSafe": true,
  "grayscaleSafe": false,
  "maxCategories": 8,
  "source": "https://example.com/source",
  "venues": ["generic-journal"],
  "notes": "Source and safety notes",
  "entries": [{ "name": "orange", "base": "#E69F00" }]
}
```

Each entry may also define `fill`, `stroke`, and `text`. Optional `roles` map
semantic type names to 0-based entry indexes; optional `connector.default` is
a `#RRGGBB` color.

## 3. Contracts

### Runtime composition

- `loadPalette(null)` returns `{ palette: null, diagnostics: [] }`.
- A missing palette makes `applyPalette` an identity operation and returns the
  original theme reference unchanged. This preserves legacy output.
- Loaded entries are materialized to `{ name, base, fill, stroke, text }`.
  Missing fills are light tints unless the base is dark; missing strokes are
  darkened until they reach 3:1 canvas contrast; missing text uses white on a
  dark fill and otherwise inherits theme text.
- `applyPalette` clones the theme before changing semantic node colors. It
  records only actually used semantic entries and token entries in `usage`.
- Content-neutral node types (`text`, `formula`) never join palette mapping:
  they always inherit theme styling and stay out of palette `usage`, so they
  cannot trigger usage-based diagnostics.
- Palette tokens are valid only when the selected palette contains that entry.
  Out-of-range tokens warn through color validation and render with the theme
  primary fallback.

### Loading and extension

- Built-ins live under `skills/drawio/assets/palettes/`.
- User palettes load from `~/.drawio-skill/palettes/` by default. A valid user
  definition overrides the same built-in name and emits
  `PALETTE_USER_OVERRIDE` at `info` level.
- Names must match `^[a-z][a-z0-9-]*$`; the JSON filename and `palette.name`
  must match. Explicit unknown, malformed, or invalid selections are hard
  errors and list available palette names. Never silently fall back.

### Diagnostics and interaction

- Legacy string validators are wrapped as warning diagnostics. Palette
  validators emit structured diagnostics directly.
- Strict mode ignores `info`, blocks `warning`, and treats `error` as fatal.
  `PALETTE_PRINT_GATE` is a warning normally and an error under strict mode.
- The base skill asks once only when palette/color, colorblind, grayscale or
  black-and-white print, or multi-category intent is explicit and no palette
  was named. Otherwise it omits `meta.palette`.
- Replication preserves source colors and skips palette selection unless the
  user explicitly asks to normalize or recolor the source.
- The academic overlay asks once after venue selection, puts the venue
  recommendation first with `(Recommended)`, and skips the question when the
  user already named a palette. Completion reports include safety flags.

### Release surfaces

When the public palette contract changes, update both SKILL files, the relevant
reference docs, both `agents/interface.yaml` files, academic `agents/openai.yaml`,
both eval sets, README/CHANGELOG surfaces, and version metadata. Run
`scripts/version-sync.js`, then set the academic eval version explicitly until
that file becomes a managed target of the sync script.

## 4. Validation & Error Matrix

- Invalid palette name or path traversal -> hard error with available names.
- Unknown palette -> hard error with available names.
- JSON parse failure -> hard error with parse detail and available names.
- Missing required field, invalid category/HEX, duplicate entry name, more
  than 16 entries, or out-of-range role -> hard error.
- `$paletteN*` without `meta.palette` -> color warning; strict mode fails.
- `$paletteN*` beyond the selected palette -> warning plus theme-primary
  rendering fallback.
- Used fills with luminance difference below 0.20 ->
  `PALETTE_GRAYSCALE_PAIR` warning.
- Used stroke below 3:1 canvas contrast ->
  `PALETTE_BOUNDARY_CONTRAST` warning.
- Used entry count above `maxCategories` ->
  `PALETTE_MAX_CATEGORIES` warning.
- `printTarget` plus `grayscaleSafe: false` -> `PALETTE_PRINT_GATE` warning,
  or error under strict mode; recommend `ieee-bw` or `tol-high-contrast`.
- Academic profile plus `colorblindSafe: false` -> non-blocking
  `PALETTE_CVD_NOTICE` info.

## 5. Good / Base / Bad Cases

- Good: `theme: academic` plus `palette: okabe-ito` changes category colors
  while academic fonts, shapes, spacing, and line styles remain intact.
- Base: omit `meta.palette`; rendering follows the selected theme exactly as
  before and the base skill does not ask an unrelated color question.
- Good replication: preserve extracted source colors and omit `meta.palette`
  unless normalization was explicitly requested.
- Bad: copy an academic palette into the overlay, accept a broken custom JSON
  with a fallback, or treat a non-colorblind-safe aesthetic palette as safe.

## 6. Tests Required

- `palette.test.js`: definition validation, materialization, user override,
  identity composition, structured diagnostics, and hard-error messages.
- `palette-integration.test.js`: schema/runtime alignment, theme independence,
  token validation, strict/info behavior, print escalation, and unknown names.
- `palette-catalog.test.js`: exactly 15 built-ins, research HEX anchors,
  metadata boundaries, and byte-for-byte swatch regeneration.
- `tests/palette-skill-policy.test.js`: base/academic question policy, replicate
  exception, venue mapping, release surfaces, eval IDs, and version 2.7.0.
- Final gate: `just version-check`, `npm test`, `just lint`,
  `npm run docs:build`, then `just ci`.

## 7. Wrong vs Correct

Wrong: changing layout policy to obtain a different color set, or silently
accepting a misspelled palette.

```yaml
meta:
  theme: okabe-ito
  palette: okabe_itto
```

Correct: keep structural styling in the theme and category color in the
palette; use strict validation for print deliverables.

```yaml
meta:
  theme: academic
  palette: ieee-bw
  print:
    target: ieee-single
```

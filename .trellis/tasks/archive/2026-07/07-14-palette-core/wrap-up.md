# Palette Core Contract Freeze

## Runtime contract

- Palette JSON uses one ordered `entries[]` collection. Runtime validation and `references/palette.schema.json` share the required field list.
- `loadPalette(name, { theme, userDir? })` returns `{ palette, diagnostics }`. Every loaded entry is materialized to `{ name, base, fill, stroke, text }`.
- `applyPalette(theme, palette, { semanticTypes?, tokenIndexes? })` returns `{ theme, usage, diagnostics }`. With no palette, the original theme reference is returned unchanged.
- `usage` contains unique rendered entries shaped as `{ index, name, base, fill, stroke, text }`; validation gates consume these final colors.
- Explicit unknown, malformed, or invalid palettes throw and list available names. A valid user palette in `~/.drawio-skill/palettes/` overrides a bundled palette with an info diagnostic.
- `$paletteN`, `$paletteN-fill`, `$paletteN-stroke`, and `$paletteN-text` are valid only when the selected palette contains entry `N`.
- Palette diagnostics use `{ level, code, message }`; strict mode ignores `info`, blocks warnings, and escalates an unsafe print palette through `PALETTE_PRINT_GATE`.

## Verification

- `cd skills/drawio/scripts && node --test`: 313 passed.
- `npm test`: 434 passed.
- `just lint`: passed.
- Targeted Prettier check and `git diff --check`: passed.

The entries and usage shapes are frozen for `07-14-palette-catalog` and `07-14-palette-skill-integration`.

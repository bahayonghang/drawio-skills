# Palette Catalog Freeze

## Delivered catalog

- 15 validated palettes: 12 academic, 2 engineering, and 1 general-purpose palette.
- All definitions use the frozen core `entries[]` contract and include source, venue, safety, category, and capacity metadata.
- Research HEX anchors are asserted for Tol, NPG, JAMA, MATLAB, Seaborn, C4, AWS, Azure, and GCP references.

## Swatch generation

- `skills/drawio/scripts/generate-palette-swatches.js` reads one standard YAML template and all bundled palette JSON files.
- It deterministically generates 15 editable `.drawio` files, 15 `.svg` previews, and the metadata-backed README index.
- Repeated generation in a temporary directory is byte-for-byte identical.

## Verification

- Palette catalog tests: 5 passed.
- `npm test`: 439 passed.
- `just lint`: passed.
- Exported SVG visual review: `morandi`, `c4-blue`, and `okabe-ito` passed after correcting low-contrast text on the two light C4 external-node colors.

The complete catalog and safety metadata are frozen for `07-14-palette-skill-integration`.

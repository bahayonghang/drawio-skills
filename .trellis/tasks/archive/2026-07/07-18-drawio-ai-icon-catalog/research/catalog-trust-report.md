# AI Icon Catalog Trust Report

## Fixed Source

- Package: `@lobehub/icons-static-svg@1.91.0`
- Registry: `https://registry.npmjs.org`
- License metadata: `MIT`
- Registry integrity: `sha512-ZDflEq0uUvAkH4WK4h3qNvvY09ts4OqUb5azD7A0xKfcuYhffGwB1Q/As2RguZYq4Gh4v925CJ8iodiClzc4zw==`
- Tarball bytes: `718623`
- Tarball SHA-256: `33db0b8bd13ba45565acb294d18c75f63e4fe0322e83a1ec3fb866a17e45f29a`

`npm view` and `npm pack --ignore-scripts` were restricted to the fixed package and official registry. The tarball SHA-512 SRI was recomputed from its bytes and matched the pinned registry value.

## Extraction Boundary

- Tar entries: `873`
- Entries outside `package/`: `0`
- Absolute or parent-traversal paths: `0`
- Symlink, hardlink, or other non-file/non-directory entries: `0`
- Extracted SVG variants: `871`

The tarball, npm cache, and extracted package remained under repo-root `.drawio-tmp/` and are excluded from commits and release packaging.

## Generated Catalog

- Asset: `skills/drawio/assets/catalog/ai-icons.json.gz`
- Schema: `1`
- Base brands: `309`
- Variant selection: `209` color, `1` brand-color, `99` base
- Uncompressed JSON bytes: `768548`
- Gzip bytes: `246958`
- Gzip header: `31,139,8,0,0,0,0,0,2,255`
- Gzip SHA-256: `6b5950e5e49c085369773a885659e3986a6eae657d1c85ea7642be9bd3e488b2`
- Independent second generation: byte-identical with the same SHA-256

The catalog is ASCII-sorted from `ace` through `zhipu`, has no duplicate slug, and contains neither `civitai-text` nor `kwaikat-text` as a base brand.

## SVG Security And Rendering Features

The generator rejected scripts, event attributes, `foreignObject`, embedded `image`, declarations/processing instructions, external resource references, missing `viewBox`, oversized SVG, and non-SVG roots. Only local `#id` fragment references are allowed for `href` and CSS `url(...)`.

Selected catalog feature counts:

- linear gradient: `58`
- radial gradient: `11`
- clipPath: `2`
- mask: `2`
- filter: `2`
- currentColor: `116`
- maximum normalized SVG bytes: `101603`

These static results are command-executed evidence. They do not constitute Desktop-executed or model-executed visual evidence.

## Runtime And Release Boundary

- The source package is not present in `package.json` or `package-lock.json`.
- The generator accepts an explicit source directory and does not perform network access.
- Runtime consumers use only the checked-in gzip asset.
- The MIT text is preserved in `skills/drawio/assets/licenses/lobe-icons-MIT.txt`; brand marks remain trademarks of their owners and are used for identification only.

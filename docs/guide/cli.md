# CLI Reference

The offline CLI converts YAML, Mermaid, CSV, or existing Draw.io bundles into native `.drawio`, standalone SVG, Desktop exports, or canonical YAML.

## Usage

```bash
node skills/drawio/scripts/cli.js <input> [output] [options]
node skills/drawio/scripts/cli.js search <query> [--prefix <library>] [--limit <n>] [--json]
```

## Inputs

| Input | Option |
|---|---|
| YAML | default |
| Mermaid | `--input-format mermaid` |
| CSV | `--input-format csv` |
| `.drawio` | `--input-format drawio` |
| Python modules/classes | `--input-format python-imports` or `python-classes` |
| JavaScript/TypeScript ESM | `--input-format js-imports` |
| Go packages | `--input-format go-imports` |
| Rust modules | `--input-format rust-imports` |
| stdin | use `-` as the input path |

Code importer inputs must be local project directories and do not support
stdin. They parse source structure only; Go and Rust routes never invoke their
language toolchains.

## Rendering And Import Options

| Option | Purpose |
|---|---|
| `--theme <name>` | override the YAML theme |
| `--page <selector>` | select an imported Draw.io page by index or name |
| `--export-spec` | write canonical YAML instead of rendering |
| `--validate` | report spec and XML validation results |
| `--strict` | fail on warnings and strict quality findings |
| `--strict-warnings` | alias of `--strict` |
| `--allow-unknown-shapes` | temporarily downgrade unknown covered stencils to warnings |

## Artifact And Desktop Options

| Option | Purpose |
|---|---|
| `--write-sidecars` | emit `.spec.yaml` and `.arch.json` |
| `--sidecar-dir <dir>` | place sidecars in an explicit work directory |
| `--use-desktop` | use draw.io Desktop for PNG/PDF/JPG or embedded SVG |
| `--dpi <n>` | raster export DPI; defaults to 300 |

`--sidecar-dir` requires `--write-sidecars`. Keep sidecars outside the final delivery directory unless a beside-output reproducible bundle is explicitly requested.

## Output Formats

| Output | Result |
|---|---|
| no output path | Draw.io XML on stdout |
| `.drawio` | editable Draw.io XML |
| `.svg` | standalone SVG, or Desktop SVG with `--use-desktop` |
| `.png` | Desktop raster export at 300 DPI by default |
| `.pdf` | Desktop PDF export |
| `.jpg` | Desktop raster export |

## Search The Bundled Catalog

```bash
node skills/drawio/scripts/cli.js search "s3, lambda" --prefix aws4 --limit 5
node skills/drawio/scripts/cli.js search pod --prefix kubernetes --json
```

Search requires no network or MCP. Use returned aliases in YAML. Unknown covered stencil names are rejected with suggestions.

## Common Commands

Render an editable final artifact and keep sidecars in a work directory:

```bash
node skills/drawio/scripts/cli.js input.yaml final/diagram.drawio --validate --write-sidecars --sidecar-dir .drawio-tmp/diagram
```

Create the default 300 DPI PNG:

```bash
node skills/drawio/scripts/cli.js input.yaml final/diagram.png --validate --use-desktop
```

Import an existing Draw.io page into canonical YAML:

```bash
node skills/drawio/scripts/cli.js existing.drawio --input-format drawio --page 0 --export-spec --write-sidecars --sidecar-dir .drawio-tmp/existing
```

Convert Mermaid with strict validation:

```bash
node skills/drawio/scripts/cli.js flow.mmd final/flow.drawio --input-format mermaid --validate --strict
```

Render a JavaScript/TypeScript ESM dependency view:

```bash
node skills/drawio/scripts/cli.js packages/web final/web-imports.drawio --input-format js-imports --validate
```

## Upstream Capability Promotion

The offline base also supports declared config and saved live-snapshot adapters, structured raster extraction, canonical multi-page bundles, and six postprocess operations. Every adapter returns canonical YAML or bundle v1 before validation, JavaScript ELK layout, and the existing renderer.

```bash
# Import every page as canonical bundle v1
node skills/drawio/scripts/cli.js existing.drawio --input-format drawio --all-pages --export-spec

# Normalize a trusted structured visual extraction
node skills/drawio/scripts/cli.js extraction.json final/redraw.drawio --input-format raster-extraction --validate

# Project or transform canonical input
node skills/drawio/scripts/cli.js postprocess mermaid bundle.yaml architecture.mmd --page context
node skills/drawio/scripts/cli.js postprocess html bundle.yaml viewer.html --all-pages
```

The shipped postprocess operations are `mermaid`, `explain`, `relabel`, `restyle`, `heatmap`, and script-free `html`. Runbook, animated SVG, tube/sequence layout, compression, buildup, PPTX, timelapse, and PR diff are deferred, not hidden commands. Offline authoring does not require Python, Graphviz, network, Desktop, browser, MCP, or a model; selected optional parsers and exports report precise missing dependencies or fallbacks.

## Failure Semantics

Invalid YAML, malformed XML, unknown covered stencils, missing flag values, unsafe icon names, and failed requested exports produce explicit errors. When draw.io Desktop is unavailable, image export falls back to standalone SVG where supported and reports the fallback; do not claim a missing PNG/PDF/JPG was produced.

## Related

- [Icons and Stencil Search](./icons-stencils.md)
- [Specification](./specification.md)
- [Export and Artifacts](./export.md)
- [SVG Converter](/api/svg-converter.md)

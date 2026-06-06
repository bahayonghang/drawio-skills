# CLI Tool

The CLI converts diagram sources into `.drawio`, SVG, or imported YAML bundles.

## Usage

```bash
node skills/drawio/scripts/cli.js <input> [output] [options]
```

## Inputs

| Input | How to use it |
|-------|---------------|
| YAML | default input format |
| Mermaid | `--input-format mermaid` |
| CSV | `--input-format csv` |
| `.drawio` | `--input-format drawio --export-spec` |
| stdin | use `-` as the input path |

## Key Options

| Flag | Description |
|------|-------------|
| `--input-format <f>` | `yaml`, `mermaid`, `csv`, or `drawio` |
| `--theme <name>` | Override the theme: `tech-blue`, `academic`, `academic-color`, `nature`, `dark`, `high-contrast` |
| `--page <selector>` | Select a page by index or diagram name during drawio import |
| `--export-spec` | Export canonical YAML instead of rendering XML/SVG |
| `--write-sidecars` | Emit `.spec.yaml` and `.arch.json` next to the output, or into `--sidecar-dir` when provided |
| `--sidecar-dir <dir>` | Write sidecars to a separate work directory instead of the final output directory |
| `--use-desktop` | Use draw.io Desktop for PNG, PDF, JPG, or embedded SVG exports |
| `--validate` | Print spec warnings and run XML validation |
| `--strict` | Fail on validation warnings and strict complexity errors |
| `--strict-warnings` | Alias of `--strict` |

## Output Formats

| Output | Result |
|--------|--------|
| no output path | XML to stdout |
| `.drawio` | draw.io XML file |
| `.svg` | standalone SVG |
| `.png` | desktop export |
| `.pdf` | desktop export |
| `.jpg` | desktop export |

## Examples

### Render a clean `.drawio` final artifact with work-dir sidecars

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --validate --write-sidecars --sidecar-dir .drawio-tmp/output
```

### Render a strict SVG

```bash
node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars --sidecar-dir .drawio-tmp/output --strict-warnings
```

### Override the theme

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --theme high-contrast
```

### Import an existing `.drawio` file

```bash
node skills/drawio/scripts/cli.js existing.drawio --input-format drawio --export-spec --write-sidecars --sidecar-dir .drawio-tmp/existing
```

### Convert Mermaid

```bash
node skills/drawio/scripts/cli.js flow.mmd output.drawio --input-format mermaid --validate
```

## Validation Output

`--validate` reports two layers:

1. spec warnings
2. XML validation results

Use `--strict` or `--strict-warnings` when those warnings should block the output.

## Related

- [Specification Format](./specification.md)
- [Export & Save](./export.md)
- [SVG Converter](/api/svg-converter.md)

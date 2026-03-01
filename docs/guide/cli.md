# CLI Tool

The Draw.io Skill includes a command-line tool for converting YAML specifications to draw.io XML or SVG files.

## Overview

The CLI tool allows you to:

- Convert YAML specifications to draw.io XML
- Generate SVG files from YAML
- Apply different design themes
- Validate generated XML structure
- Enforce complexity guardrails in strict mode

## Prerequisites

- Node.js installed
- Project dependencies installed (`npm install` in project root)

## Usage

```bash
node skills/drawio/scripts/cli.js <input.yaml> [output] [options]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `input.yaml` | Yes | YAML specification file |
| `output` | No | Output file path. Omit for stdout |

### Options

| Flag | Description |
|------|-------------|
| `--theme <name>` | Override theme from YAML (tech-blue, academic, academic-color, nature, dark) |
| `--strict` | Error mode: throw on >30 nodes or >50 edges |
| `--validate` | Run XML structural validation after conversion |
| `--help` | Show usage help |

## Output Formats

The output format is determined by the file extension:

| Extension | Format | Description |
|-----------|--------|-------------|
| (none) | XML | Print draw.io XML to stdout |
| `.drawio` | XML | Save as draw.io XML file |
| `.svg` | SVG | Convert to standalone SVG file |

## Examples

### Basic Conversion

```bash
# Convert to stdout
node cli.js microservices.yaml

# Save as .drawio file
node cli.js microservices.yaml output.drawio

# Convert to SVG
node cli.js microservices.yaml output.svg
```

### With Theme Override

```bash
# Use academic theme instead of YAML-specified theme
node cli.js diagram.yaml output.drawio --theme academic

# Dark theme SVG
node cli.js diagram.yaml presentation.svg --theme dark
```

### With Validation

```bash
# Validate XML structure
node cli.js diagram.yaml output.drawio --validate

# Strict mode (error on complex diagrams)
node cli.js large-diagram.yaml output.drawio --strict

# Combine options
node cli.js diagram.yaml output.svg --theme nature --validate --strict
```

## XML Validation

The `--validate` flag runs structural validation on the generated XML:

| Check | Description |
|-------|-------------|
| ID Uniqueness | All mxCell IDs must be unique |
| Edge References | Edge source/target must reference existing cell IDs |
| Root Cells | Root cells (id=0, id=1) must be present |

Validation errors are printed to stderr and the process exits with code 1.

## Complexity Guardrails

| Mode | Nodes | Edges | Behavior |
|------|-------|-------|----------|
| Default | >20 warning | >30 warning | Warnings printed, conversion continues |
| `--strict` | >30 error | >50 error | Process exits with error |

## Related

- [Specification Format](./specification.md) - YAML spec reference
- [Design System](./design-system.md) - Themes and shapes
- [Export & Save](./export.md) - Export options including SVG

#!/usr/bin/env node
/**
 * CLI tool for converting YAML specifications to draw.io XML or SVG
 * Usage: node cli.js input.yaml [output.drawio|output.svg] [--theme name] [--strict] [--validate]
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, extname } from 'node:path'
import { parseSpecYaml, specToDrawioXml, validateXml } from './dsl/spec-to-drawio.js'

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2)

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
draw.io YAML → XML/SVG Converter

Usage:
  node cli.js <input.yaml> [output.drawio|output.svg] [options]

Arguments:
  input.yaml          Path to YAML specification file (required)
  output file         Optional output file. Extension determines format:
                        .drawio  → draw.io XML file format
                        .svg     → SVG (requires drawio-to-svg module)
                      If omitted, XML is printed to stdout.

Options:
  --theme <name>      Override theme (e.g. tech-blue, academic, nature, dark)
  --strict            Fail on complexity errors
  --validate          Run XML validation and print results
  --help, -h          Show this help message
`.trim())
  process.exit(0)
}

// Extract positional arguments (non-flag args)
const positional = args.filter(a => !a.startsWith('--'))
const inputFile = positional[0]
const outputFile = positional[1] || null

// Extract flags
const themeIndex = args.indexOf('--theme')
const themeName = themeIndex !== -1 ? args[themeIndex + 1] : null
const strict = args.includes('--strict')
const doValidate = args.includes('--validate')

if (!inputFile) {
  console.error('Error: input YAML file is required.')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// SVG module (optional)
// ---------------------------------------------------------------------------

let drawioToSvg = null
try {
  const svgModule = await import('../svg/drawio-to-svg.js')
  drawioToSvg = svgModule.drawioToSvg
} catch {
  // SVG export not available
}

// ---------------------------------------------------------------------------
// Read and convert
// ---------------------------------------------------------------------------

let yamlText
try {
  yamlText = readFileSync(resolve(inputFile), 'utf-8')
} catch (err) {
  console.error(`Error: Could not read input file "${inputFile}": ${err.message}`)
  process.exit(1)
}

let spec
try {
  spec = parseSpecYaml(yamlText)
} catch (err) {
  console.error(`Error: Failed to parse YAML: ${err.message}`)
  process.exit(1)
}

// Apply CLI theme override
if (themeName) {
  spec.meta = spec.meta || {}
  spec.meta.theme = themeName
}

let xml
try {
  xml = specToDrawioXml(spec, { strict })
} catch (err) {
  console.error(`Error: Conversion failed: ${err.message}`)
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

if (doValidate) {
  const result = validateXml(xml)
  if (result.valid) {
    console.error('Validation: PASSED (no errors)')
  } else {
    console.error('Validation: FAILED')
    for (const e of result.errors) {
      console.error(`  - ${e}`)
    }
    process.exit(1)
  }
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

if (!outputFile) {
  // Print XML to stdout
  process.stdout.write(xml)
  process.stdout.write('\n')
  process.exit(0)
}

const ext = extname(outputFile).toLowerCase()

if (ext === '.svg') {
  if (!drawioToSvg) {
    console.error('Error: SVG export is not available (drawio-to-svg module not found).')
    process.exit(1)
  }
  let svg
  try {
    svg = drawioToSvg(xml)
  } catch (err) {
    console.error(`Error: SVG conversion failed: ${err.message}`)
    process.exit(1)
  }
  try {
    writeFileSync(resolve(outputFile), svg, 'utf-8')
    console.error(`Saved SVG: ${outputFile}`)
  } catch (err) {
    console.error(`Error: Could not write output file "${outputFile}": ${err.message}`)
    process.exit(1)
  }
} else {
  // Default: .drawio or any other extension → draw.io file format (XML wrapper)
  const drawioContent =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<mxfile host="cli" modified="" agent="drawio-skill-cli" version="21.0.0">\n' +
    '  <diagram name="Page-1">\n' +
    '    ' + xml + '\n' +
    '  </diagram>\n' +
    '</mxfile>\n'

  try {
    writeFileSync(resolve(outputFile), drawioContent, 'utf-8')
    console.error(`Saved: ${outputFile}`)
  } catch (err) {
    console.error(`Error: Could not write output file "${outputFile}": ${err.message}`)
    process.exit(1)
  }
}

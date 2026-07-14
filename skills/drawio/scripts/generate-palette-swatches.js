import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadPalette } from './dsl/palette.js'
import { loadTheme, parseSpecYaml, specToDrawioXml } from './dsl/spec-to-drawio.js'
import { createDrawioFileContent } from './runtime/artifacts.js'
import { drawioToSvg } from './svg/drawio-to-svg.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PALETTES_DIR = resolve(__dirname, '../assets/palettes')
const DEFAULT_OUTPUT_DIR = resolve(__dirname, '../references/examples/palettes')
const DEFAULT_TEMPLATE_PATH = resolve(DEFAULT_OUTPUT_DIR, 'palette-swatch.template.yaml')

function listPaletteNames() {
  return readdirSync(PALETTES_DIR)
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.slice(0, -5))
    .sort()
}

function buildIndex(rows) {
  const lines = [
    '# Palette Swatches',
    '',
    'Regenerate every preview from the shared YAML template:',
    '',
    '```bash',
    'node skills/drawio/scripts/generate-palette-swatches.js',
    '```',
    '',
    'The committed SVG is the deterministic local preview. A Draw.io Desktop PNG export may be added beside it when raster review is required.',
    '',
    '| Palette | Category | CVD safe | Grayscale safe | Max categories | Venues | Preview | Source |',
    '| --- | --- | --- | --- | ---: | --- | --- | --- |'
  ]
  for (const row of rows) {
    lines.push(
      `| \`${row.name}\` | ${row.category} | ${row.colorblindSafe ? 'yes' : 'no'} | ${row.grayscaleSafe ? 'yes' : 'no'} | ${row.maxCategories} | ${row.venues.join(', ')} | [SVG](./${row.name}.svg) / [draw.io](./${row.name}.drawio) | [source](${row.source}) |`
    )
  }
  return `${lines.join('\n')}\n`
}

function buildSwatchSpec(template, name, palette) {
  const spec = structuredClone(template)
  spec.meta.palette = name
  spec.meta.title = `${palette.displayName} swatch`
  spec.nodes.forEach((node, index) => {
    const paletteIndex = (index % palette.entries.length) + 1
    const entry = palette.entries[paletteIndex - 1]
    node.label = `${paletteIndex}. ${entry.name}`
    node.style = {
      ...(node.style || {}),
      fillColor: `$palette${paletteIndex}-fill`,
      strokeColor: `$palette${paletteIndex}-stroke`,
      fontColor: `$palette${paletteIndex}-text`
    }
  })
  return spec
}

export function generatePaletteSwatches(options = {}) {
  const outputDir = resolve(options.outputDir || DEFAULT_OUTPUT_DIR)
  const templatePath = resolve(options.templatePath || DEFAULT_TEMPLATE_PATH)
  const template = parseSpecYaml(readFileSync(templatePath, 'utf8'))
  const theme = loadTheme(template.meta.theme)
  const rows = []

  mkdirSync(outputDir, { recursive: true })
  for (const name of listPaletteNames()) {
    const { palette } = loadPalette(name, { theme })
    const spec = buildSwatchSpec(template, name, palette)
    const xml = specToDrawioXml(spec, { silent: true })
    writeFileSync(resolve(outputDir, `${name}.drawio`), createDrawioFileContent(xml), 'utf8')
    writeFileSync(resolve(outputDir, `${name}.svg`), drawioToSvg(xml), 'utf8')
    rows.push(palette)
  }

  writeFileSync(resolve(outputDir, 'README.md'), buildIndex(rows), 'utf8')
  return rows.map((row) => row.name)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const names = generatePaletteSwatches()
  console.log(`Generated ${names.length} palette swatch bundles in ${DEFAULT_OUTPUT_DIR}`)
}

import { afterEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { loadPalette, validatePaletteDefinition } from './palette.js'
import { loadTheme, validateXml } from './spec-to-drawio.js'
import { generatePaletteSwatches } from '../generate-palette-swatches.js'

const PALETTES_DIR = new URL('../../assets/palettes/', import.meta.url)
const EXAMPLES_DIR = new URL('../../references/examples/palettes/', import.meta.url)
const EXPECTED_PALETTES = [
  'c4-blue',
  'cloud-aws',
  'drawio-classic',
  'ieee-bw',
  'ieee-color',
  'journal-jama',
  'journal-npg',
  'matlab-lines',
  'morandi',
  'okabe-ito',
  'seaborn-colorblind',
  'tol-bright',
  'tol-high-contrast',
  'tol-light-fill',
  'tol-muted'
]
const tempDirs = []

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

function readRawPalette(name) {
  return JSON.parse(readFileSync(new URL(`${name}.json`, PALETTES_DIR), 'utf8'))
}

describe('palette catalog data', () => {
  it('contains exactly 15 valid built-in palette definitions with complete metadata', () => {
    const files = readdirSync(PALETTES_DIR)
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.slice(0, -5))
      .sort()
    assert.deepEqual(files, EXPECTED_PALETTES)

    for (const name of EXPECTED_PALETTES) {
      const raw = readRawPalette(name)
      assert.doesNotThrow(() => validatePaletteDefinition(raw), name)
      assert.equal(raw.name, name)
      assert.ok(raw.source.startsWith('https://'), `${name} should cite an HTTPS source`)
      assert.ok(raw.venues.length > 0, `${name} should identify at least one venue`)
      assert.ok(raw.notes.length > 0, `${name} should include usage notes`)
      assert.doesNotThrow(() => loadPalette(name, { theme: loadTheme() }))
    }
  })

  it('matches the researched HEX anchors for Tol, NPG, C4, AWS, MATLAB, and Seaborn', () => {
    assert.deepEqual(
      readRawPalette('tol-bright').entries.map((entry) => entry.base),
      ['#4477AA', '#EE6677', '#228833', '#CCBB44', '#66CCEE', '#AA3377', '#BBBBBB']
    )
    assert.equal(readRawPalette('tol-muted').entries.at(0).base, '#CC6677')
    assert.equal(readRawPalette('tol-muted').entries.at(-1).base, '#AA4499')
    assert.equal(readRawPalette('tol-light-fill').entries.at(0).fill, '#77AADD')
    assert.equal(readRawPalette('tol-light-fill').entries.at(-1).fill, '#DDDDDD')

    const npg = readRawPalette('journal-npg')
    assert.equal(npg.entries.length, 10)
    assert.equal(npg.entries[0].base, '#E64B35')
    assert.equal(npg.entries.at(-1).base, '#B09C85')

    const c4 = readRawPalette('c4-blue')
    assert.deepEqual(
      c4.entries.slice(0, 4).map((entry) => entry.base),
      ['#08427B', '#1168BD', '#438DD5', '#85BBF0']
    )
    assert.equal(c4.entries[0].text, '#FFFFFF')

    const aws = readRawPalette('cloud-aws')
    assert.deepEqual(
      aws.entries.map((entry) => entry.base),
      ['#ED7100', '#7AA116', '#C925D1', '#8C4FFF', '#DD344C', '#E7157B', '#01A88D', '#232F3E']
    )
    assert.match(aws.notes, /#0078D4/)
    assert.match(aws.notes, /#4285F4/)

    assert.equal(readRawPalette('matlab-lines').entries.length, 7)
    assert.equal(readRawPalette('seaborn-colorblind').entries.length, 10)
  })

  it('keeps Morandi boundaries explicit and marks journal aesthetics as unsafe', () => {
    const morandi = readRawPalette('morandi')
    assert.ok(morandi.entries.every((entry) => entry.stroke === '#555555'))
    assert.equal(morandi.colorblindSafe, false)
    assert.equal(morandi.grayscaleSafe, false)

    for (const name of ['journal-npg', 'journal-jama']) {
      const palette = readRawPalette(name)
      assert.equal(palette.colorblindSafe, false)
    }
  })
})

describe('palette swatch catalog', () => {
  it('regenerates all swatch bundles byte-for-byte', () => {
    const outputDir = mkdtempSync(join(tmpdir(), 'drawio-palette-swatches-'))
    tempDirs.push(outputDir)

    assert.deepEqual(generatePaletteSwatches({ outputDir }), EXPECTED_PALETTES)
    const first = new Map(
      readdirSync(outputDir)
        .sort()
        .map((file) => [file, readFileSync(join(outputDir, file), 'utf8')])
    )
    assert.deepEqual(generatePaletteSwatches({ outputDir }), EXPECTED_PALETTES)
    const second = new Map(
      readdirSync(outputDir)
        .sort()
        .map((file) => [file, readFileSync(join(outputDir, file), 'utf8')])
    )
    assert.deepEqual(second, first)
  })

  it('contains reproducible drawio and image artifacts for all palettes', () => {
    const index = readFileSync(new URL('README.md', EXAMPLES_DIR), 'utf8')
    for (const name of EXPECTED_PALETTES) {
      const drawioPath = new URL(`${name}.drawio`, EXAMPLES_DIR)
      assert.ok(existsSync(drawioPath), `${name}.drawio is missing`)
      const hasImage = existsSync(new URL(`${name}.png`, EXAMPLES_DIR)) || existsSync(new URL(`${name}.svg`, EXAMPLES_DIR))
      assert.ok(hasImage, `${name} image preview is missing`)
      assert.equal(validateXml(readFileSync(drawioPath, 'utf8')).valid, true, `${name}.drawio should contain valid XML`)
      assert.match(readFileSync(new URL(`${name}.svg`, EXAMPLES_DIR), 'utf8'), /<svg\b/)
      assert.match(index, new RegExp(`\\b${name}\\b`))
    }
  })
})

import { afterEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  PALETTE_REQUIRED_FIELDS,
  applyPalette,
  loadPalette,
  validatePaletteDefinition
} from './palette.js'
import { contrastRatio, relativeLuminance, validatePaletteUsage } from './palette-validate.js'
import { loadTheme } from './spec-to-drawio.js'

const tempDirs = []

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

function makeTempPaletteDir() {
  const dir = mkdtempSync(join(tmpdir(), 'drawio-palette-'))
  tempDirs.push(dir)
  return dir
}

describe('palette definition and loader', () => {
  it('loads and validates the three representative built-in palettes', () => {
    const theme = loadTheme('academic')
    const okabe = loadPalette('okabe-ito', { theme }).palette
    const ieee = loadPalette('ieee-bw', { theme }).palette
    const classic = loadPalette('drawio-classic', { theme }).palette

    assert.equal(okabe.entries.length, 8)
    assert.deepEqual(
      okabe.entries.map((entry) => entry.base),
      ['#E69F00', '#56B4E9', '#009E73', '#F0E442', '#0072B2', '#D55E00', '#CC79A7', '#000000']
    )
    assert.ok(ieee.entries.length >= 4)
    assert.equal(classic.entries.length, 8)
    assert.deepEqual(classic.entries[0], {
      name: 'blue',
      base: '#6C8EBF',
      fill: '#DAE8FC',
      stroke: '#6C8EBF',
      text: '#000000'
    })
  })

  it('keeps the documented schema required list aligned with runtime validation', () => {
    const schema = JSON.parse(readFileSync(new URL('../../references/palette.schema.json', import.meta.url), 'utf8'))
    assert.deepEqual(schema.required, PALETTE_REQUIRED_FIELDS)

    const valid = {
      name: 'test-palette',
      displayName: 'Test Palette',
      category: 'general',
      colorblindSafe: true,
      grayscaleSafe: true,
      maxCategories: 1,
      source: 'https://example.com/palette',
      venues: [],
      notes: 'Test palette',
      entries: [{ name: 'test', base: '#123456' }]
    }
    for (const field of PALETTE_REQUIRED_FIELDS) {
      const candidate = { ...valid }
      delete candidate[field]
      assert.throws(() => validatePaletteDefinition(candidate), new RegExp(`palette\\.${field}`))
    }

    assert.doesNotThrow(() =>
      validatePaletteDefinition({ ...valid, roles: { vector_store: 0 } })
    )
  })

  it('materializes complete entry colors without mutating the source theme', () => {
    const theme = loadTheme('academic')
    const { palette, diagnostics } = loadPalette('okabe-ito', { theme })

    assert.ok(palette.entries.every((entry) => entry.base && entry.fill && entry.stroke && entry.text))
    assert.equal(palette.entries.at(-1).fill, '#000000')
    assert.equal(palette.entries.at(-1).text, '#FFFFFF')
    assert.equal(theme.node.service.fillColor, '#FFFFFF')
    assert.ok(diagnostics.every((diagnostic) => diagnostic.level === 'info'))
  })

  it('uses a valid user palette override and reports it as info', () => {
    const userDir = makeTempPaletteDir()
    const custom = {
      name: 'okabe-ito',
      displayName: 'Local Okabe',
      category: 'academic',
      colorblindSafe: true,
      grayscaleSafe: true,
      maxCategories: 1,
      source: 'https://example.com/local',
      venues: ['local'],
      notes: 'Local test override',
      entries: [{ name: 'local', base: '#123456' }]
    }
    writeFileSync(join(userDir, 'okabe-ito.json'), JSON.stringify(custom))

    const { palette, diagnostics } = loadPalette('okabe-ito', { theme: loadTheme(), userDir })
    assert.equal(palette.entries[0].base, '#123456')
    assert.ok(diagnostics.some((diagnostic) => diagnostic.code === 'PALETTE_USER_OVERRIDE'))
  })

  it('throws actionable hard errors for unknown, malformed, and invalid palettes', () => {
    const theme = loadTheme()
    assert.throws(() => loadPalette('missing', { theme, userDir: makeTempPaletteDir() }), /Available palettes:.*okabe-ito/)

    const malformedDir = makeTempPaletteDir()
    writeFileSync(join(malformedDir, 'broken.json'), '{')
    assert.throws(() => loadPalette('broken', { theme, userDir: malformedDir }), /Could not parse palette "broken".*Available palettes:/)

    const invalidDir = makeTempPaletteDir()
    writeFileSync(
      join(invalidDir, 'invalid.json'),
      JSON.stringify({
        name: 'invalid',
        displayName: 'Invalid',
        category: 'general',
        colorblindSafe: false,
        grayscaleSafe: false,
        maxCategories: 1,
        source: 'https://example.com/invalid',
        venues: [],
        notes: 'Invalid role',
        entries: [{ name: 'only', base: '#000000' }],
        roles: { service: 1 }
      })
    )
    assert.throws(() => loadPalette('invalid', { theme, userDir: invalidDir }), /roles\.service.*Available palettes:/)
  })
})

describe('applyPalette', () => {
  it('is an identity operation when no palette is selected', () => {
    const theme = loadTheme('academic')
    const result = applyPalette(theme, null)
    assert.strictEqual(result.theme, theme)
    assert.deepEqual(result.usage, [])
    assert.deepEqual(result.diagnostics, [])
  })

  it('overrides semantic colors while preserving typography and connector geometry', () => {
    const theme = loadTheme('academic')
    const palette = loadPalette('okabe-ito', { theme }).palette
    const result = applyPalette(theme, palette, { semanticTypes: ['service', 'database', 'service'] })

    assert.notStrictEqual(result.theme, theme)
    assert.deepEqual(result.theme.typography, theme.typography)
    assert.equal(result.theme.connector.primary.strokeWidth, theme.connector.primary.strokeWidth)
    assert.equal(result.theme.node.service.strokeColor, palette.entries[0].stroke)
    assert.equal(result.theme.node.database.strokeColor, palette.entries[1].stroke)
    assert.deepEqual(
      result.usage.map((item) => item.index),
      [0, 1]
    )
  })
})

describe('palette validation gate', () => {
  it('implements WCAG luminance and contrast calculations', () => {
    assert.equal(relativeLuminance('#000000'), 0)
    assert.equal(relativeLuminance('#FFFFFF'), 1)
    assert.equal(contrastRatio('#000000', '#FFFFFF'), 21)
  })

  it('emits structured usage diagnostics with strict print escalation', () => {
    const palette = {
      name: 'unsafe',
      displayName: 'Unsafe',
      colorblindSafe: false,
      grayscaleSafe: false,
      maxCategories: 1
    }
    const usage = [
      { index: 0, name: 'a', fill: '#777777', stroke: '#888888' },
      { index: 1, name: 'b', fill: '#888888', stroke: '#EEEEEE' }
    ]
    const diagnostics = validatePaletteUsage(palette, usage, {
      canvasBackground: '#FFFFFF',
      profile: 'academic-paper',
      printTarget: 'ieee-single',
      strict: true
    })

    assert.ok(diagnostics.some((item) => item.code === 'PALETTE_GRAYSCALE_PAIR'))
    assert.ok(diagnostics.some((item) => item.code === 'PALETTE_BOUNDARY_CONTRAST'))
    assert.ok(diagnostics.some((item) => item.code === 'PALETTE_MAX_CATEGORIES'))
    assert.equal(diagnostics.find((item) => item.code === 'PALETTE_PRINT_GATE').level, 'error')
    assert.equal(diagnostics.find((item) => item.code === 'PALETTE_CVD_NOTICE').level, 'info')
  })
})

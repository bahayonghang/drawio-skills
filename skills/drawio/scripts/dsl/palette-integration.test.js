import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { loadPalette } from './palette.js'
import { loadTheme, specToDrawioXml, validateColorScheme, validateSpec } from './spec-to-drawio.js'

function academicMeta(palette) {
  return {
    theme: 'academic',
    palette,
    profile: 'academic-paper',
    figureType: 'architecture',
    title: 'Palette integration',
    description: 'Palette integration test figure'
  }
}

describe('palette spec contract', () => {
  it('keeps meta.palette aligned between the JSON schema and runtime validation', () => {
    const schema = JSON.parse(
      readFileSync(new URL('../../assets/schemas/spec.schema.json', import.meta.url), 'utf8')
    )
    assert.deepEqual(schema.properties.meta.properties.palette, {
      type: 'string',
      pattern: '^[a-z][a-z0-9-]*$',
      description: 'Palette name layered over the selected theme colors'
    })

    const spec = { meta: { palette: 'okabe-ito' }, nodes: [{ id: 'a', label: 'A' }], edges: [], modules: [] }
    assert.doesNotThrow(() => validateSpec(spec))
    assert.throws(() => validateSpec({ ...spec, meta: { palette: '../escape' } }), /Invalid meta\.palette/)
  })

  it('accepts palette tokens only when a selected palette provides the entry', () => {
    const theme = loadTheme('academic')
    const palette = loadPalette('okabe-ito', { theme }).palette
    const spec = {
      nodes: [{ id: 'a', label: 'A', style: { fillColor: '$palette2-fill', strokeColor: '$palette2-stroke' } }],
      edges: [],
      modules: []
    }

    assert.deepEqual(validateColorScheme(spec, theme, palette), [])
    assert.equal(validateColorScheme(spec, theme).length, 2)
    assert.equal(validateColorScheme(spec, theme, palette).length, 0)

    spec.nodes[0].style.fillColor = '$palette99'
    assert.equal(validateColorScheme(spec, theme, palette).length, 1)
  })
})

describe('palette renderer integration', () => {
  it('layers Okabe-Ito colors over the academic theme without changing typography or connector style', () => {
    const theme = loadTheme('academic')
    const palette = loadPalette('okabe-ito', { theme }).palette
    const spec = {
      meta: academicMeta('okabe-ito'),
      nodes: [
        { id: 'service', label: 'Service', type: 'service' },
        { id: 'database', label: 'Database', type: 'database' }
      ],
      edges: [{ from: 'service', to: 'database' }],
      modules: []
    }

    const xml = specToDrawioXml(spec, { silent: true })
    assert.ok(xml.includes(`fillColor=${palette.entries[0].fill}`))
    assert.ok(xml.includes(`strokeColor=${palette.entries[1].stroke}`))
    assert.ok(xml.includes('fontFamily=Times New Roman'))
    assert.ok(xml.includes(`strokeWidth=${theme.connector.primary.strokeWidth}`))
  })

  it('resolves palette tokens and rejects them under strict mode without meta.palette', () => {
    const selected = {
      meta: { theme: 'tech-blue', palette: 'ieee-bw' },
      nodes: [{ id: 'a', label: 'A', style: { fillColor: '$palette1-fill', strokeColor: '$palette1-stroke' } }],
      edges: [],
      modules: []
    }
    const xml = specToDrawioXml(selected, { strict: true, silent: true })
    assert.ok(xml.includes('fillColor=#000000'))

    const unselected = { ...selected, meta: { theme: 'tech-blue' } }
    assert.throws(() => specToDrawioXml(unselected, { strict: true, silent: true }), /Invalid color.*\$palette1/)
  })

  it('falls back to the theme primary color for out-of-range palette tokens', () => {
    const theme = loadTheme('academic')
    const spec = {
      meta: { theme: 'academic', palette: 'okabe-ito' },
      nodes: [{ id: 'a', label: 'A', style: { fillColor: '$palette9' } }],
      edges: [],
      modules: []
    }

    const { xml, warnings } = specToDrawioXml(spec, { silent: true, returnWarnings: true })
    assert.ok(xml.includes(`fillColor=${theme.colors.primary}`))
    assert.ok(warnings.some((item) => item.message.includes('"$palette9"')))
  })

  it('keeps info diagnostics non-blocking under strict mode', () => {
    const spec = {
      meta: academicMeta('drawio-classic'),
      nodes: [{ id: 'a', label: 'A', type: 'service' }],
      edges: [],
      modules: []
    }

    const result = specToDrawioXml(spec, { strict: true, silent: true, returnWarnings: true })
    assert.ok(result.warnings.some((item) => item.code === 'PALETTE_CVD_NOTICE' && item.level === 'info'))
  })

  it('escalates a grayscale-unsafe print palette only in strict mode', () => {
    const spec = {
      meta: { ...academicMeta('okabe-ito'), print: { target: 'ieee-single' } },
      nodes: [{ id: 'a', label: 'A', type: 'service' }],
      edges: [],
      modules: []
    }

    const result = specToDrawioXml(spec, { silent: true, returnWarnings: true })
    assert.equal(result.warnings.find((item) => item.code === 'PALETTE_PRINT_GATE').level, 'warning')
    assert.throws(() => specToDrawioXml(spec, { strict: true, silent: true }), /PALETTE_PRINT_GATE/)

    const safeSpec = { ...spec, meta: { ...spec.meta, palette: 'ieee-bw' } }
    assert.doesNotThrow(() => specToDrawioXml(safeSpec, { strict: true, silent: true }))
  })

  it('throws an actionable error for an explicitly selected unknown palette', () => {
    const spec = {
      meta: { theme: 'academic', palette: 'not-installed' },
      nodes: [{ id: 'a', label: 'A' }],
      edges: [],
      modules: []
    }
    assert.throws(() => specToDrawioXml(spec, { silent: true }), /Unknown palette.*Available palettes:/)
  })

  it('keeps plain text nodes transparent with theme font color under any palette', () => {
    const spec = {
      meta: { theme: 'academic', palette: 'ieee-bw', profile: 'academic-paper' },
      nodes: [
        { id: 'cap', label: 'Figure 1 caption', type: 'text' },
        { id: 'store', label: 'Store', type: 'database' }
      ],
      edges: [],
      modules: []
    }

    const bare = { ...spec, meta: { theme: 'academic', profile: 'academic-paper' } }
    const captionStyle = (xml) => /value="Figure 1 caption"[^>]*style="([^"]*)"/.exec(xml)[1]
    const withPalette = captionStyle(specToDrawioXml(spec, { silent: true, returnWarnings: true }).xml)
    const withoutPalette = captionStyle(specToDrawioXml(bare, { silent: true, returnWarnings: true }).xml)
    assert.equal(withPalette, withoutPalette)
    assert.match(withPalette, /fillColor=none/)

    const { warnings } = specToDrawioXml(spec, { silent: true, returnWarnings: true })
    assert.ok(!warnings.some((item) => item.code === 'PALETTE_GRAYSCALE_PAIR'))
  })

  it('keeps formula nodes on theme styling and out of palette usage under any palette', () => {
    const spec = {
      meta: { theme: 'academic', palette: 'okabe-ito', profile: 'academic-paper' },
      nodes: [
        { id: 'eq', label: 'E = mc^2', type: 'formula' },
        { id: 'actor', label: 'Reviewer', type: 'user' }
      ],
      edges: [],
      modules: []
    }

    const bare = { ...spec, meta: { theme: 'academic', profile: 'academic-paper' } }
    const formulaStyle = (xml) => /value="[^"]*mc[^"]*"[^>]*style="([^"]*)"/.exec(xml)[1]
    const withPalette = formulaStyle(specToDrawioXml(spec, { silent: true, returnWarnings: true }).xml)
    const withoutPalette = formulaStyle(specToDrawioXml(bare, { silent: true, returnWarnings: true }).xml)
    assert.equal(withPalette, withoutPalette)

    const { warnings } = specToDrawioXml(spec, { silent: true, returnWarnings: true })
    assert.ok(!warnings.some((item) => item.code === 'PALETTE_GRAYSCALE_PAIR'))
  })
})

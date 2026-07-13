import { describe, it } from 'node:test'
import assert from 'node:assert'
import { buildDrawioExportArgs } from './desktop.js'

describe('buildDrawioExportArgs scale (300dpi PNG default)', () => {
  it('adds -s scale for png raster export', () => {
    const args = buildDrawioExportArgs({ inputFile: 'in.drawio', outputFile: 'out.png', format: 'png', scale: 300 / 96 })
    const i = args.indexOf('-s')
    assert.ok(i !== -1, 'png export should include -s scale')
    assert.equal(args[i + 1], String(300 / 96))
  })

  it('adds -s scale for jpg raster export', () => {
    const args = buildDrawioExportArgs({ inputFile: 'in.drawio', outputFile: 'out.jpg', format: 'jpg', scale: 2 })
    assert.ok(args.includes('-s'), 'jpg export should include -s scale')
  })

  it('omits scale for svg (vector) export', () => {
    const args = buildDrawioExportArgs({ inputFile: 'in.drawio', outputFile: 'out.svg', format: 'svg', scale: 3 })
    assert.ok(!args.includes('-s'), 'svg export must not include -s')
  })

  it('omits scale for pdf (vector) export', () => {
    const args = buildDrawioExportArgs({ inputFile: 'in.drawio', outputFile: 'out.pdf', format: 'pdf', scale: 3 })
    assert.ok(!args.includes('-s'), 'pdf export must not include -s')
  })

  it('omits scale when none is provided', () => {
    const args = buildDrawioExportArgs({ inputFile: 'in.drawio', outputFile: 'out.png', format: 'png' })
    assert.ok(!args.includes('-s'), 'no scale arg → no -s')
  })
})

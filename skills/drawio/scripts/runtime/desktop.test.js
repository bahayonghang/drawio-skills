import { describe, it } from 'node:test'
import assert from 'node:assert'
import { buildDrawioExportArgs, exportWithDrawioDesktop } from './desktop.js'

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

describe('buildDrawioExportArgs export profiles', () => {
  it('preserves embedded scaled PNG behavior for the default final profile', () => {
    const args = buildDrawioExportArgs({
      inputFile: 'in.drawio',
      outputFile: 'out.png',
      format: 'png',
      scale: 300 / 96
    })

    assert.ok(args.includes('-e'))
    assert.ok(args.includes('-s'))
    assert.ok(!args.includes('--width'))
    assert.ok(!args.includes('--height'))
  })

  it('builds a width-bounded vision preview without embed or scale', () => {
    const args = buildDrawioExportArgs({
      inputFile: 'in.drawio',
      outputFile: 'out.png',
      format: 'png',
      profile: 'vision-preview',
      width: 2000,
      scale: 300 / 96
    })

    assert.ok(!args.includes('-e'))
    assert.ok(!args.includes('-s'))
    assert.deepEqual(args.slice(args.indexOf('--width'), args.indexOf('--width') + 2), ['--width', '2000'])
    assert.ok(!args.includes('--height'))
  })

  it('builds a height-bounded vision preview', () => {
    const args = buildDrawioExportArgs({
      inputFile: 'in.drawio',
      outputFile: 'out.png',
      format: 'png',
      profile: 'vision-preview',
      height: 2000
    })

    assert.deepEqual(args.slice(args.indexOf('--height'), args.indexOf('--height') + 2), ['--height', '2000'])
    assert.ok(!args.includes('--width'))
  })

  it('rejects invalid vision preview combinations', () => {
    const base = { inputFile: 'in.drawio', outputFile: 'out.png', profile: 'vision-preview' }

    assert.throws(() => buildDrawioExportArgs({ ...base, format: 'svg', width: 2000 }), /PNG/i)
    assert.throws(() => buildDrawioExportArgs({ ...base, format: 'png' }), /width.*height/i)
    assert.throws(() => buildDrawioExportArgs({ ...base, format: 'png', width: 2000, height: 2000 }), /width.*height/i)
    assert.throws(
      () => buildDrawioExportArgs({ ...base, format: 'png', width: 0 }),
      /positive integer/i
    )
    assert.throws(
      () => buildDrawioExportArgs({ ...base, format: 'png', profile: 'unknown', width: 2000 }),
      /profile/i
    )
  })
})

describe('exportWithDrawioDesktop output stabilization', () => {
  it('waits for the exported file after Desktop returns', async () => {
    const events = []
    const stableFile = { path: 'C:\\tmp\\out.png', size: 128, polls: 2, waitedMs: 25 }

    const result = await exportWithDrawioDesktop({
      inputFile: 'C:\\tmp\\in.drawio',
      outputFile: 'C:\\tmp\\out.png',
      format: 'png',
      profile: 'vision-preview',
      width: 2000,
      platform: 'win32',
      env: { DRAWIO_CMD: 'C:\\Tools\\draw.io.exe' },
      exists: () => true,
      execute: (executable, args) => events.push({ executable, args }),
      waitForStable: async (path) => {
        events.push({ stable: path })
        return stableFile
      }
    })

    assert.equal(events.length, 2)
    assert.equal(events[0].executable, 'C:\\Tools\\draw.io.exe')
    assert.deepEqual(events[1], { stable: 'C:\\tmp\\out.png' })
    assert.deepEqual(result.file, stableFile)
  })
})

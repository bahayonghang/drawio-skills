import test from 'node:test'
import assert from 'node:assert/strict'

import { exportVisionPreview } from './vision-preview.js'

test('exportVisionPreview keeps a width-bounded PNG when both dimensions fit', async () => {
  const exports = []
  const removed = []
  const result = await exportVisionPreview({
    inputFile: 'diagram.drawio',
    outputFile: 'diagram.preview.png',
    exportDesktop: async (options) => {
      exports.push(options)
      return { executable: 'drawio', args: ['--width', '2000'] }
    },
    inspectFile: () => ({
      status: 'unchanged',
      metadata: { width: 2000, height: 1200, hasIend: true, knownTruncation: false }
    }),
    removeFile: (path, options) => removed.push({ path, options })
  })

  assert.equal(exports.length, 1)
  assert.deepEqual(removed, [{ path: 'diagram.preview.png', options: { force: true } }])
  assert.equal(exports[0].profile, 'vision-preview')
  assert.equal(exports[0].width, 2000)
  assert.equal(exports[0].height, undefined)
  assert.deepEqual(result, {
    profile: 'vision-preview',
    outputFile: 'diagram.preview.png',
    width: 2000,
    height: 1200,
    maxDimension: 2000,
    reexported: false,
    repairStatus: 'unchanged',
    exports: [{ executable: 'drawio', args: ['--width', '2000'] }]
  })
})

test('exportVisionPreview removes and re-exports tall output by height', async () => {
  const exports = []
  const inspections = [
    { status: 'unchanged', metadata: { width: 2000, height: 2300, hasIend: true } },
    { status: 'repaired', metadata: { width: 1740, height: 2000, hasIend: true } }
  ]
  const removed = []

  const result = await exportVisionPreview({
    inputFile: 'diagram.drawio',
    outputFile: 'diagram.preview.png',
    exportDesktop: async (options) => {
      exports.push(options)
      return { args: options.width ? ['--width', '2000'] : ['--height', '2000'] }
    },
    inspectFile: () => inspections.shift(),
    removeFile: (path, options) => removed.push({ path, options })
  })

  assert.equal(exports.length, 2)
  assert.equal(exports[0].width, 2000)
  assert.equal(exports[1].height, 2000)
  assert.deepEqual(removed, [
    { path: 'diagram.preview.png', options: { force: true } },
    { path: 'diagram.preview.png', options: { force: true } }
  ])
  assert.equal(result.width, 1740)
  assert.equal(result.height, 2000)
  assert.equal(result.reexported, true)
  assert.equal(result.repairStatus, 'repaired')
})

test('exportVisionPreview rejects invalid output and failed dimension enforcement', async () => {
  await assert.rejects(
    exportVisionPreview({ inputFile: 'diagram.drawio', outputFile: 'diagram.svg' }),
    /\.png/i
  )

  await assert.rejects(
    exportVisionPreview({
      inputFile: 'diagram.drawio',
      outputFile: 'diagram.png',
      exportDesktop: async () => ({ args: [] }),
      inspectFile: () => ({ status: 'unchanged', metadata: { width: 2100, height: 2200, hasIend: true } }),
      removeFile: () => {}
    }),
    /longest edge.*2000/i
  )
})

test('exportVisionPreview rejects a structurally incomplete inspected PNG', async () => {
  await assert.rejects(
    exportVisionPreview({
      inputFile: 'diagram.drawio',
      outputFile: 'diagram.png',
      exportDesktop: async () => ({ args: [] }),
      inspectFile: () => ({
        status: 'unchanged',
        metadata: { width: 1000, height: 900, hasIend: false, knownTruncation: false }
      })
    }),
    /IEND/i
  )
})

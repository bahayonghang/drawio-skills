import test from 'node:test'
import assert from 'node:assert/strict'

import {
  inspectPng,
  repairKnownIendTruncation,
  repairKnownIendTruncationFile
} from './png-inspection.js'

const PNG_SIGNATURE = Buffer.from('89504e470d0a1a0a', 'hex')

function chunk(type, data = Buffer.alloc(0)) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const crc = type === 'IEND' ? Buffer.from('ae426082', 'hex') : Buffer.alloc(4)
  return Buffer.concat([length, Buffer.from(type, 'ascii'), data, crc])
}

function png({ width = 640, height = 480 } = {}) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([PNG_SIGNATURE, chunk('IHDR', ihdr), chunk('IDAT', Buffer.from([1, 2, 3])), chunk('IEND')])
}

test('inspectPng returns dimensions and terminal IEND for a complete PNG', () => {
  const metadata = inspectPng(png({ width: 2000, height: 1200 }))

  assert.equal(metadata.width, 2000)
  assert.equal(metadata.height, 1200)
  assert.equal(metadata.hasIend, true)
  assert.equal(metadata.knownTruncation, false)
  assert.deepEqual(metadata.chunks.map((entry) => entry.type), ['IHDR', 'IDAT', 'IEND'])
})

test('repairKnownIendTruncation leaves complete PNG bytes unchanged', () => {
  const complete = png()
  const result = repairKnownIendTruncation(complete)

  assert.equal(result.status, 'unchanged')
  assert.strictEqual(result.buffer, complete)
  assert.deepEqual(result.metadata, inspectPng(complete))
})

test('repairKnownIendTruncation repairs only the missing IEND type and CRC', () => {
  const complete = png({ width: 1200, height: 2000 })
  const truncated = complete.subarray(0, complete.length - 8)
  const before = inspectPng(truncated)

  assert.equal(before.hasIend, false)
  assert.equal(before.knownTruncation, true)

  const repaired = repairKnownIendTruncation(truncated)
  assert.equal(repaired.status, 'repaired')
  assert.equal(repaired.metadata.hasIend, true)
  assert.deepEqual(repaired.buffer, complete)

  const second = repairKnownIendTruncation(repaired.buffer)
  assert.equal(second.status, 'unchanged')
  assert.strictEqual(second.buffer, repaired.buffer)
})

test('inspectPng rejects non-PNG input and malformed IHDR', () => {
  assert.throws(() => inspectPng(Buffer.from('not a png')), /signature/i)

  const malformed = Buffer.concat([PNG_SIGNATURE, chunk('IHDR', Buffer.alloc(12)), chunk('IDAT'), chunk('IEND')])
  assert.throws(() => inspectPng(malformed), /IHDR.*13/i)
})

test('inspectPng rejects a truncated non-IEND chunk', () => {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(100, 0)
  ihdr.writeUInt32BE(100, 4)
  const claimedLength = Buffer.alloc(4)
  claimedLength.writeUInt32BE(10)
  const truncated = Buffer.concat([
    PNG_SIGNATURE,
    chunk('IHDR', ihdr),
    claimedLength,
    Buffer.from('IDAT', 'ascii'),
    Buffer.from([1, 2])
  ])

  assert.throws(() => inspectPng(truncated), /truncated.*IDAT/i)
  const repair = repairKnownIendTruncation(truncated)
  assert.equal(repair.status, 'rejected')
  assert.match(repair.error.message, /truncated.*IDAT/i)
})

test('inspectPng rejects trailing garbage after IEND', () => {
  const withGarbage = Buffer.concat([png(), Buffer.from('garbage')])
  assert.throws(() => inspectPng(withGarbage), /trailing/i)
})

test('repairKnownIendTruncationFile writes a sibling temp file before atomic rename', () => {
  const complete = png()
  const truncated = complete.subarray(0, complete.length - 8)
  const events = []

  const result = repairKnownIendTruncationFile('preview.png', {
    readFile: () => truncated,
    writeFile: (path, buffer) => events.push({ action: 'write', path, buffer }),
    rename: (from, to) => events.push({ action: 'rename', from, to }),
    remove: (path) => events.push({ action: 'remove', path }),
    temporaryPath: () => 'preview.png.repair.tmp'
  })

  assert.equal(result.status, 'repaired')
  assert.equal(events.length, 2)
  assert.equal(events[0].action, 'write')
  assert.equal(events[0].path, 'preview.png.repair.tmp')
  assert.deepEqual(events[0].buffer, complete)
  assert.deepEqual(events[1], {
    action: 'rename',
    from: 'preview.png.repair.tmp',
    to: 'preview.png'
  })
})

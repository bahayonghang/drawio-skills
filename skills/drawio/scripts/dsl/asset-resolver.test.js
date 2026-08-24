import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import {
  ASSET_SIZE_ERROR_BYTES,
  ASSET_SIZE_WARNING_BYTES,
  ASSET_TOTAL_ERROR_BYTES,
  collectAssetSizeDiagnostics,
  inspectAssetFile,
  isPathInsideRoot,
  resolveAssetImageStyle
} from './asset-resolver.js'

const PNG_1X1 = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082',
  'hex'
)
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01])

function makeRoot() {
  return mkdtempSync(join(tmpdir(), 'drawio-asset-'))
}

test('isPathInsideRoot uses separator boundaries rather than bare prefix', () => {
  assert.equal(isPathInsideRoot(resolve('/tmp/root-evil/x'), resolve('/tmp/root')), false)
  assert.equal(isPathInsideRoot(resolve('/tmp/root/child'), resolve('/tmp/root')), true)
})

test('inspectAssetFile accepts a PNG relative to the asset root', () => {
  const root = makeRoot()
  try {
    mkdirSync(join(root, 'ref', 'materials'), { recursive: true })
    writeFileSync(join(root, 'ref', 'materials', 'a.png'), PNG_1X1)
    const inspected = inspectAssetFile('photo', { path: 'ref/materials/a.png' }, { assetRoot: root })
    assert.equal(inspected.mime, 'image/png')
    assert.equal(inspected.byteLength, PNG_1X1.length)
    assert.match(inspected.sha256, /^[0-9A-F]{64}$/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('absolute paths are hard errors with a field path', () => {
  const root = makeRoot()
  try {
    assert.throws(
      () => inspectAssetFile('photo', { path: join(root, 'a.png') }, { assetRoot: root }),
      (error) => error.path === 'assets.photo.path' && /absolute path/.test(error.message)
    )
    assert.throws(
      () => inspectAssetFile('photo', { path: 'D:/outside.png' }, { assetRoot: root }),
      /assets\.photo\.path/
    )
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('parent-directory traversal that leaves the asset root is rejected', () => {
  const parent = makeRoot()
  const root = join(parent, 'root')
  mkdirSync(root, { recursive: true })
  writeFileSync(join(parent, 'secret.png'), PNG_1X1)
  try {
    assert.throws(
      () => inspectAssetFile('photo', { path: '../secret.png' }, { assetRoot: root }),
      (error) => error.path === 'assets.photo.path' && /outside the asset root/.test(error.message)
    )
  } finally {
    rmSync(parent, { recursive: true, force: true })
  }
})

test('symlink escape is a hard error or missing evidence on Windows', (t) => {
  const parent = makeRoot()
  const root = join(parent, 'root')
  mkdirSync(root, { recursive: true })
  writeFileSync(join(parent, 'secret.png'), PNG_1X1)
  const linkPath = join(root, 'escape.png')
  try {
    try {
      symlinkSync(join(parent, 'secret.png'), linkPath)
    } catch (error) {
      if (error.code === 'EPERM' || error.code === 'EACCES' || error.code === 'EUNKNOWN') {
        t.skip('missing evidence: Windows symlink requires Developer Mode or administrator')
        return
      }
      throw error
    }
    assert.throws(
      () => inspectAssetFile('photo', { path: 'escape.png' }, { assetRoot: root }),
      (error) => error.path === 'assets.photo.path' && /outside the asset root/.test(error.message)
    )
  } finally {
    rmSync(parent, { recursive: true, force: true })
  }
})

test('extension whitelist, SVG v1 message, directory, missing file, and magic mismatch', () => {
  const root = makeRoot()
  try {
    mkdirSync(join(root, 'dir.png'), { recursive: true })
    writeFileSync(join(root, 'ok.png'), PNG_1X1)
    writeFileSync(join(root, 'pic.gif'), PNG_1X1)
    writeFileSync(join(root, 'vector.svg'), Buffer.from('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"></svg>'))
    writeFileSync(join(root, 'lie.png'), Buffer.from('<?xml version="1.0"?><root/>'))
    writeFileSync(join(root, 'photo.jpg'), JPEG_MAGIC)

    assert.throws(() => inspectAssetFile('a', { path: 'pic.gif' }, { assetRoot: root }), /whitelist/)
    assert.throws(
      () => inspectAssetFile('a', { path: 'vector.svg' }, { assetRoot: root }),
      (error) => /SVG local assets are not supported in v1/.test(error.message) && error.path === 'assets.a.path'
    )
    assert.throws(() => inspectAssetFile('a', { path: 'dir.png' }, { assetRoot: root }), /regular file/)
    assert.throws(() => inspectAssetFile('a', { path: 'missing.png' }, { assetRoot: root }), /does not exist/)
    assert.throws(() => inspectAssetFile('a', { path: 'lie.png' }, { assetRoot: root }), /magic/)
    const jpeg = inspectAssetFile('a', { path: 'photo.jpg' }, { assetRoot: root })
    assert.equal(jpeg.mime, 'image/jpeg')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('declared sha256 mismatch is a hard error', () => {
  const root = makeRoot()
  try {
    writeFileSync(join(root, 'a.png'), PNG_1X1)
    assert.throws(
      () =>
        inspectAssetFile(
          'photo',
          { path: 'a.png', sha256: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
          { assetRoot: root }
        ),
      /assets\.photo\.sha256/
    )
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('resolveAssetImageStyle emits a PNG data URI using the shared image prefix', () => {
  const root = makeRoot()
  try {
    writeFileSync(join(root, 'a.png'), PNG_1X1)
    const resolved = resolveAssetImageStyle('photo', { photo: { path: 'a.png' } }, { assetRoot: root })
    assert.match(resolved.style, /^shape=image;/)
    assert.match(resolved.dataUri, /^data:image\/png;base64,/)
    assert.equal(resolved.path, 'a.png')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('size diagnostics use warning at 2 MiB+1, error at 8 MiB+1, and error at 24 MiB+1 weighted', () => {
  const item = (id, byteLength) => [id, { byteLength }]
  const totalDiag = (diagnostics) => diagnostics.find((d) => d.level === 'error' && /24 MiB/.test(d.message))

  const at2 = collectAssetSizeDiagnostics(new Map([item('a', ASSET_SIZE_WARNING_BYTES)]), ['a'])
  assert.deepEqual(at2, [])
  const over2 = collectAssetSizeDiagnostics(new Map([item('a', ASSET_SIZE_WARNING_BYTES + 1)]), ['a'])
  assert.equal(over2.length, 1)
  assert.equal(over2[0].level, 'warning')
  assert.equal(over2[0].code, 'ASSET_SIZE')

  const at8 = collectAssetSizeDiagnostics(new Map([item('a', ASSET_SIZE_ERROR_BYTES)]), ['a'])
  assert.equal(at8.length, 1)
  assert.equal(at8[0].level, 'warning')
  assert.equal(at8[0].code, 'ASSET_SIZE')
  const over8 = collectAssetSizeDiagnostics(new Map([item('a', ASSET_SIZE_ERROR_BYTES + 1)]), ['a'])
  assert.equal(over8.length, 1)
  assert.equal(over8[0].level, 'error')
  assert.equal(over8[0].code, 'ASSET_SIZE')

  const oneMib = ASSET_TOTAL_ERROR_BYTES / 24
  const citations24 = Array(24).fill('a')
  const at24 = collectAssetSizeDiagnostics(new Map([item('a', oneMib)]), citations24)
  assert.equal(totalDiag(at24), undefined)
  assert.deepEqual(at24, [])
  const over24 = collectAssetSizeDiagnostics(new Map([item('a', oneMib + 1)]), citations24)
  const over24Total = totalDiag(over24)
  assert.equal(over24Total?.level, 'error')
  assert.equal(over24Total?.code, 'ASSET_SIZE')
})

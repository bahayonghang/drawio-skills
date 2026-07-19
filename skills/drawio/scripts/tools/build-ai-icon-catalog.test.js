import test from 'node:test'
import assert from 'node:assert/strict'
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'

import { buildAiIconCatalog } from './build-ai-icon-catalog.js'

const FIXTURE_DIR = new URL('./fixtures/ai-icons-package/', import.meta.url)
const INTEGRITY = 'sha512-ZDflEq0uUvAkH4WK4h3qNvvY09ts4OqUb5azD7A0xKfcuYhffGwB1Q/As2RguZYq4Gh4v925CJ8iodiClzc4zw=='
const EXPECTED = { variants: 6, brands: 3, distribution: { color: 1, brandColor: 1, base: 1 } }

function copyFixture() {
  const source = join(mkdtempSync(join(tmpdir(), 'drawio-ai-icons-source-')), 'package')
  cpSync(FIXTURE_DIR, source, { recursive: true })
  return source
}

test('buildAiIconCatalog selects canonical variants and writes deterministic gzip metadata', () => {
  const output = join(mkdtempSync(join(tmpdir(), 'drawio-ai-icons-')), 'catalog.json.gz')
  const result = buildAiIconCatalog({
    sourceDir: FIXTURE_DIR,
    output,
    integrity: INTEGRITY,
    expected: EXPECTED
  })

  const bytes = readFileSync(output)
  assert.deepEqual([...bytes.subarray(0, 10)], [31, 139, 8, 0, 0, 0, 0, 0, 2, 255])
  const catalog = JSON.parse(gunzipSync(bytes).toString('utf8'))
  assert.deepEqual(catalog.icons.map(({ slug, variant }) => ({ slug, variant })), [
    { slug: 'alpha', variant: 'alpha-color' },
    { slug: 'beta', variant: 'beta-brand-color' },
    { slug: 'civitai', variant: 'civitai' }
  ])
  assert.equal(catalog.icons[0].svg.includes('width="24" height="24"'), true)
  assert.equal(result.sha256.length, 64)
})

test('buildAiIconCatalog rejects external SVG resource URLs', () => {
  const sourceDir = copyFixture()
  writeFileSync(
    join(sourceDir, 'icons', 'alpha-color.svg'),
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="url(https://example.com/a.svg#x)"/></svg>'
  )
  assert.throws(
    () => buildAiIconCatalog({ sourceDir, output: join(sourceDir, 'out.gz'), integrity: INTEGRITY, expected: EXPECTED }),
    /external|local fragment/i
  )
})

test('buildAiIconCatalog rejects unsafe SVG structures through the source boundary', () => {
  const unsafe = [
    ['script', '<script>alert(1)</script>'],
    ['event', '<path onclick="alert(1)"/>'],
    ['foreignObject', '<foreignObject/>'],
    ['image', '<image href="#local"/>'],
    ['external href', '<use href="https://example.com/icon.svg#x"/>'],
    ['doctype', '<!DOCTYPE svg>']
  ]
  for (const [name, fragment] of unsafe) {
    const sourceDir = copyFixture()
    writeFileSync(
      join(sourceDir, 'icons', 'alpha-color.svg'),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${fragment}</svg>`
    )
    assert.throws(
      () => buildAiIconCatalog({ sourceDir, output: join(sourceDir, 'out.gz'), integrity: INTEGRITY, expected: EXPECTED }),
      /forbidden|event|external/i,
      name
    )
  }
})

test('buildAiIconCatalog rejects source metadata, integrity, and count mismatches', () => {
  const sourceDir = copyFixture()
  writeFileSync(join(sourceDir, 'package.json'), '{"name":"wrong","version":"1.91.0","license":"MIT"}')
  assert.throws(
    () => buildAiIconCatalog({ sourceDir, output: join(sourceDir, 'out.gz'), integrity: INTEGRITY, expected: EXPECTED }),
    /package name/i
  )
  assert.throws(
    () => buildAiIconCatalog({ sourceDir: FIXTURE_DIR, output: join(sourceDir, 'out.gz'), integrity: 'sha512-wrong', expected: EXPECTED }),
    /integrity/i
  )
  assert.throws(
    () => buildAiIconCatalog({ sourceDir: FIXTURE_DIR, output: join(sourceDir, 'out.gz'), integrity: INTEGRITY }),
    /871 SVG variants/i
  )
})

test('buildAiIconCatalog reproduces bytes and leaves an existing output intact on failure', () => {
  const directory = mkdtempSync(join(tmpdir(), 'drawio-ai-icons-output-'))
  const first = join(directory, 'first.gz')
  const second = join(directory, 'second.gz')
  const options = { sourceDir: FIXTURE_DIR, integrity: INTEGRITY, expected: EXPECTED }
  const firstResult = buildAiIconCatalog({ ...options, output: first })
  const secondResult = buildAiIconCatalog({ ...options, output: second })
  assert.deepEqual(readFileSync(first), readFileSync(second))
  assert.equal(firstResult.sha256, secondResult.sha256)

  const protectedOutput = join(directory, 'protected.gz')
  writeFileSync(protectedOutput, 'keep-me')
  assert.throws(() => buildAiIconCatalog({ ...options, output: protectedOutput, integrity: 'sha512-wrong' }), /integrity/i)
  assert.equal(readFileSync(protectedOutput, 'utf8'), 'keep-me')
})

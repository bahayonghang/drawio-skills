import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { applyAutoLayout } from '../dsl/auto-layout.js'
import { specToDrawioXml, validateSpec, validateXml } from '../dsl/spec-to-drawio.js'
import { createCodeClassIdentity, createCodeIdentity } from './identity.js'
import { projectGraphToSpec } from './projection-to-spec.js'
import { loadOptionalParser, MAX_CODE_FILE_BYTES, scanCodeProject } from './code-common.js'
import { parseJavaScriptImportsProject } from './js-code.js'

function projectFixture() {
  const root = mkdtempSync(join(tmpdir(), 'drawio-code-'))
  writeFileSync(join(root, 'a.js'), "import './b.js'\n")
  writeFileSync(join(root, 'b.js'), 'export const b = 1\n')
  return root
}

test('code class identity extends the canonical module identity', () => {
  const moduleIdentity = createCodeIdentity({ language: 'python', modulePath: 'pkg/model.py' })
  assert.deepEqual(createCodeClassIdentity({ moduleIdentity, qualifiedClassName: 'Order' }), {
    scheme: 'code-class',
    key: '["code-module\\u0000python/pkg/model.py","Order"]'
  })
  assert.throws(
    () => createCodeClassIdentity({ moduleIdentity, qualifiedClassName: '../Order' }),
    (error) => error.code === 'IDENTITY_INVALID'
  )
})

test('code project scanning is sorted, bounded, and rejects non-directories', () => {
  const root = projectFixture()
  try {
    mkdirSync(join(root, 'node_modules'))
    writeFileSync(join(root, 'node_modules', 'ignored.js'), 'export {}\n')
    const scan = scanCodeProject(root, { extensions: ['.js'] })
    assert.deepEqual(scan.files.map((file) => file.path), ['a.js', 'b.js'])
    assert.throws(() => scanCodeProject(join(root, 'a.js'), { extensions: ['.js'] }), /directory/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('code project scanning enforces the per-file capacity bound', () => {
  const root = mkdtempSync(join(tmpdir(), 'drawio-code-'))
  try {
    writeFileSync(join(root, 'large.js'), Buffer.alloc(MAX_CODE_FILE_BYTES + 1, 0x61))
    assert.throws(
      () => scanCodeProject(root, { extensions: ['.js'] }),
      (error) => error.code === 'ADAPTER_PARSE' && /file limit/.test(error.message)
    )
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('optional parser loading maps a missing package without affecting adapter imports', async () => {
  await assert.rejects(
    () => loadOptionalParser('drawio-parser-that-does-not-exist', 'missing parser'),
    (error) => error.code === 'OPTIONAL_DEPENDENCY_MISSING'
  )
})

test('code projection crosses validation, JavaScript ELK, renderer, and XML validation', async () => {
  const root = projectFixture()
  try {
    const projection = await parseJavaScriptImportsProject(root, {
      parseModule: (source) => (source.includes("'./b.js'") ? ['./b.js'] : [])
    })
    const spec = projectGraphToSpec(projection)
    validateSpec(spec)
    const layout = await applyAutoLayout(spec)
    const xml = specToDrawioXml(layout.spec)
    assert.deepEqual(validateXml(xml), { valid: true, errors: [], warnings: [] })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

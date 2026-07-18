import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { parseJavaScriptImportsProject } from './js-code.js'

test('JS/TS adapter resolves ESM static and string-literal dynamic imports', async () => {
  const root = mkdtempSync(join(tmpdir(), 'drawio-js-'))
  try {
    writeFileSync(join(root, 'a.ts'), "import './b.js'\nimport('./c.ts')\nimport 'react'\n")
    writeFileSync(join(root, 'b.js'), 'export const b = 1\n')
    writeFileSync(join(root, 'c.ts'), 'export const c = 1\n')
    const projection = await parseJavaScriptImportsProject(root, {
      parseModule: (source) => (source.includes('react') ? ['./b.js', './c.ts', 'react'] : [])
    })

    assert.deepEqual(projection.nodes.map((node) => node.identity.key), [
      'javascript/b.js',
      'typescript/a.ts',
      'typescript/c.ts'
    ])
    assert.deepEqual(projection.edges.map((edge) => edge.to.key), ['javascript/b.js', 'typescript/c.ts'])
    assert.ok(projection.diagnostics.some((entry) => entry.code === 'JS_NON_RELATIVE_IMPORTS_IGNORED'))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('JS/TS unresolved relative imports fail instead of silently dropping an edge', async () => {
  const root = mkdtempSync(join(tmpdir(), 'drawio-js-'))
  try {
    writeFileSync(join(root, 'a.js'), "import './missing.js'\n")
    await assert.rejects(
      () => parseJavaScriptImportsProject(root, { parseModule: () => ['./missing.js'] }),
      (error) => error.code === 'ADAPTER_UNSUPPORTED' && error.context.path === 'a.js'
    )
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

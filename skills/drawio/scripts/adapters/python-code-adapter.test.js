import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'

import { parsePythonClassesProject, parsePythonImportsProject } from './python-code.js'
import { runOptionalPythonCodeParser } from './optional-python-code.js'

function pythonProject() {
  const root = mkdtempSync(join(tmpdir(), 'drawio-python-'))
  writeFileSync(join(root, 'a.py'), 'import b\n')
  writeFileSync(join(root, 'b.py'), 'class A: pass\nclass B(A): pass\n')
  return root
}

test('Python imports use stdlib AST records and stable file identities', async () => {
  const root = pythonProject()
  try {
    const projection = await parsePythonImportsProject(root, {
      runParser: () => ({
        files: [
          { path: 'a.py', imports: [{ module: 'b', level: 0, names: [], line: 1, column: 0 }] },
          { path: 'b.py', imports: [] }
        ]
      })
    })
    assert.deepEqual(projection.nodes.map((node) => node.identity.key), ['python/a.py', 'python/b.py'])
    assert.equal(projection.edges[0].relation, 'imports')
    assert.equal(projection.edges[0].from.key, 'python/a.py')
    assert.equal(projection.edges[0].to.key, 'python/b.py')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('Python classes produce code-class identities and inheritance edges', async () => {
  const root = pythonProject()
  try {
    const projection = await parsePythonClassesProject(root, {
      runParser: () => ({
        files: [
          { path: 'a.py', classes: [] },
          {
            path: 'b.py',
            classes: [
              { qualifiedName: 'A', bases: [], line: 1, column: 0 },
              { qualifiedName: 'B', bases: ['A'], line: 2, column: 0 }
            ]
          }
        ]
      })
    })
    assert.deepEqual(projection.nodes.map((node) => node.identity.key), [
      '["code-module\\u0000python/b.py","A"]',
      '["code-module\\u0000python/b.py","B"]'
    ])
    assert.equal(projection.edges[0].relation, 'inherits')
    assert.equal(projection.edges[0].from.key, '["code-module\\u0000python/b.py","B"]')
    assert.equal(projection.edges[0].to.key, '["code-module\\u0000python/b.py","A"]')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('Python parser failures preserve safe source location context', async () => {
  const root = pythonProject()
  try {
    await assert.rejects(
      () =>
        parsePythonImportsProject(root, {
          runParser: () => {
            const error = new Error('invalid syntax')
            error.code = 'ADAPTER_PARSE'
            error.context = { path: 'a.py', line: 1, column: 7 }
            throw error
          }
        }),
      (error) => error.code === 'ADAPTER_PARSE' && error.context.path === 'a.py' && error.context.line === 1
    )
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('Python code worker uses a fixed bounded subprocess envelope', () => {
  let invocation
  const result = runOptionalPythonCodeParser(
    { adapter: 'python-imports', files: [{ path: 'a.py', source: 'import b\n' }] },
    {
      pythonCommand: 'python-test',
      workerPath: 'untrusted-worker.py',
      allowedAdapters: ['anything'],
      spawn: (...args) => {
        invocation = args
        return { status: 0, stdout: '{"ok":true,"result":{"files":[]}}', stderr: '' }
      }
    }
  )
  assert.deepEqual(result, { files: [] })
  assert.equal(invocation[0], 'python-test')
  assert.equal(invocation[1][0], '-I')
  assert.match(invocation[1][1], /python[\\/]code-parser-worker\.py$/)
  assert.equal(invocation[2].shell, false)
  assert.equal(invocation[2].windowsHide, true)
  assert.equal(invocation[2].timeout, 10_000)
  assert.equal(invocation[2].maxBuffer, 1024 * 1024)
  assert.equal(basename(resolve(invocation[2].cwd)), 'adapters')
  assert.deepEqual(
    Object.keys(invocation[2].env).filter((key) => !['PATH', 'SYSTEMROOT', 'WINDIR', 'TEMP', 'TMP'].includes(key)).sort(),
    ['PYTHONIOENCODING', 'PYTHONUTF8']
  )
})

test('Python classes report a distinct empty graph diagnostic', async () => {
  const root = mkdtempSync(join(tmpdir(), 'drawio-python-'))
  try {
    writeFileSync(join(root, 'empty.py'), 'VALUE = 1\n')
    const projection = await parsePythonClassesProject(root, {
      runParser: () => ({ files: [{ path: 'empty.py', classes: [] }] })
    })
    assert.equal(projection.nodes.length, 0)
    assert.ok(projection.diagnostics.some((entry) => entry.code === 'CODE_EMPTY_GRAPH'))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

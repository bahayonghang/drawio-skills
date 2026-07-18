import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { parseGoImportsProject } from './go-code.js'
import { parseJavaScriptImportsProject } from './js-code.js'
import { parsePythonImportsProject } from './python-code.js'
import { parseRustImportsProject } from './rust-code.js'

const integrationTest = process.env.DRAWIO_TEST_CODE_PARSERS === '1' ? test : test.skip

function project(prefix, setup) {
  const root = mkdtempSync(join(tmpdir(), prefix))
  setup(root)
  return root
}

integrationTest('real optional code parsers enforce their approved syntax subsets', async () => {
  const roots = []
  try {
    const pythonRoot = project('drawio-parser-python-', (root) => {
      writeFileSync(join(root, 'a.py'), 'import b\n')
      writeFileSync(join(root, 'b.py'), 'VALUE = 1\n')
    })
    roots.push(pythonRoot)
    assert.equal((await parsePythonImportsProject(pythonRoot)).edges.length, 1)
    writeFileSync(join(pythonRoot, 'a.py'), 'def broken(:\n')
    await assert.rejects(() => parsePythonImportsProject(pythonRoot), (error) => error.code === 'ADAPTER_PARSE')

    const jsRoot = project('drawio-parser-js-', (root) => {
      writeFileSync(join(root, 'a.ts'), "export { value } from './b.js'\nimport('./b.js')\n")
      writeFileSync(join(root, 'b.js'), 'export const value = 1\n')
    })
    roots.push(jsRoot)
    assert.equal((await parseJavaScriptImportsProject(jsRoot)).edges.length, 1)
    writeFileSync(join(jsRoot, 'a.ts'), 'import(`./${name}.js`)\n')
    await assert.rejects(
      () => parseJavaScriptImportsProject(jsRoot),
      (error) => error.code === 'ADAPTER_UNSUPPORTED'
    )

    const goRoot = project('drawio-parser-go-', (root) => {
      writeFileSync(join(root, 'go.mod'), 'module example.com/parser\n')
      mkdirSync(join(root, 'a'))
      mkdirSync(join(root, 'b'))
      writeFileSync(join(root, 'a', 'a.go'), 'package a\nimport "example.com/parser/b"\n')
      writeFileSync(join(root, 'b', 'b.go'), 'package b\n')
    })
    roots.push(goRoot)
    assert.equal((await parseGoImportsProject(goRoot)).edges.length, 1)
    writeFileSync(join(goRoot, 'a', 'a.go'), 'package a\nimport (\n')
    await assert.rejects(() => parseGoImportsProject(goRoot), (error) => error.code === 'ADAPTER_PARSE')

    const rustRoot = project('drawio-parser-rust-', (root) => {
      mkdirSync(join(root, 'src'))
      writeFileSync(join(root, 'src', 'a.rs'), 'use crate::b;\n')
      writeFileSync(join(root, 'src', 'b.rs'), 'pub fn value() {}\n')
    })
    roots.push(rustRoot)
    assert.equal((await parseRustImportsProject(rustRoot)).edges.length, 1)
    writeFileSync(join(rustRoot, 'src', 'a.rs'), '#[cfg(unix)]\nuse crate::b;\n')
    await assert.rejects(
      () => parseRustImportsProject(rustRoot),
      (error) => error.code === 'ADAPTER_UNSUPPORTED'
    )
  } finally {
    for (const root of roots) rmSync(root, { recursive: true, force: true })
  }
})

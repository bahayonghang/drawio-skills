import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { parseGoImportsProject } from './go-code.js'

test('Go adapter projects intra-module package imports without a Go toolchain', async () => {
  const root = mkdtempSync(join(tmpdir(), 'drawio-go-'))
  try {
    writeFileSync(join(root, 'go.mod'), 'module example.com/m\n\ngo 1.21\n')
    mkdirSync(join(root, 'a'))
    mkdirSync(join(root, 'b'))
    writeFileSync(join(root, 'a', 'a.go'), 'package a\nimport (\n  "example.com/m/b"\n  "fmt"\n)\n')
    writeFileSync(join(root, 'b', 'b.go'), 'package b\n')
    const projection = await parseGoImportsProject(root, {
      parseFile: (source) => ({
        imports: source.includes('example.com/m/b') ? ['example.com/m/b', 'fmt'] : [],
        hasBuildConstraints: false
      })
    })

    assert.deepEqual(projection.nodes.map((node) => node.identity.key), ['go/a', 'go/b'])
    assert.equal(projection.edges[0].relation, 'imports')
    assert.equal(projection.edges[0].to.key, 'go/b')
    assert.ok(projection.diagnostics.some((entry) => entry.code === 'CODE_EXTERNAL_IMPORTS_IGNORED'))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('Go adapter requires one explicit go.mod module directive', async () => {
  const root = mkdtempSync(join(tmpdir(), 'drawio-go-'))
  try {
    writeFileSync(join(root, 'main.go'), 'package main\n')
    await assert.rejects(
      () => parseGoImportsProject(root, { parseFile: () => ({ imports: [], hasBuildConstraints: false }) }),
      (error) => error.code === 'ADAPTER_PARSE' && /go\.mod/.test(error.message)
    )
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('Go adapter rejects workspace roots instead of treating them as one module', async () => {
  const root = mkdtempSync(join(tmpdir(), 'drawio-go-'))
  try {
    writeFileSync(join(root, 'go.mod'), 'module example.com/m\n')
    writeFileSync(join(root, 'go.work'), 'go 1.21\nuse .\n')
    writeFileSync(join(root, 'main.go'), 'package main\n')
    await assert.rejects(
      () => parseGoImportsProject(root, { parseFile: () => ({ imports: [], hasBuildConstraints: false }) }),
      (error) => error.code === 'ADAPTER_UNSUPPORTED' && /workspace/.test(error.message)
    )
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

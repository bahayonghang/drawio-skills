import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { parseRustImportsProject } from './rust-code.js'

test('Rust adapter projects crate/self/super use edges without a Rust toolchain', async () => {
  const root = mkdtempSync(join(tmpdir(), 'drawio-rust-'))
  try {
    mkdirSync(join(root, 'src'))
    writeFileSync(join(root, 'src', 'a.rs'), 'use crate::b;\n')
    writeFileSync(join(root, 'src', 'b.rs'), 'use std::fmt;\n')
    const projection = await parseRustImportsProject(root, {
      parseFile: (source) => ({
        uses: source.includes('crate::b') ? ['crate::b'] : source.includes('std::fmt') ? ['std::fmt'] : [],
        hasCfg: false,
        hasInlineModules: false
      })
    })

    assert.deepEqual(projection.nodes.map((node) => node.identity.key), ['rust/src/a.rs', 'rust/src/b.rs'])
    assert.equal(projection.edges[0].relation, 'uses')
    assert.equal(projection.edges[0].to.key, 'rust/src/b.rs')
    assert.ok(projection.diagnostics.some((entry) => entry.code === 'RUST_NON_CRATE_USES_IGNORED'))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('Rust cfg and inline modules are reported as unsupported syntax', async () => {
  const root = mkdtempSync(join(tmpdir(), 'drawio-rust-'))
  try {
    mkdirSync(join(root, 'src'))
    writeFileSync(join(root, 'src', 'lib.rs'), '#[cfg(unix)] mod platform { use crate::other; }\n')
    await assert.rejects(
      () =>
        parseRustImportsProject(root, {
          parseFile: () => ({ uses: [], hasCfg: true, hasInlineModules: true })
        }),
      (error) => error.code === 'ADAPTER_UNSUPPORTED' && error.context.path === 'src/lib.rs'
    )
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('Rust super paths cannot escape the selected crate', async () => {
  const root = mkdtempSync(join(tmpdir(), 'drawio-rust-'))
  try {
    mkdirSync(join(root, 'src'))
    writeFileSync(join(root, 'src', 'a.rs'), 'use super::super::outside;\n')
    await assert.rejects(
      () =>
        parseRustImportsProject(root, {
          parseFile: () => ({ uses: ['super::super::outside'], hasCfg: false, hasInlineModules: false })
        }),
      (error) => error.code === 'ADAPTER_UNSUPPORTED' && /escapes/.test(error.message)
    )
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

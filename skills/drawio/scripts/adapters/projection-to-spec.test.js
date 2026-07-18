import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { applyAutoLayout } from '../dsl/auto-layout.js'
import { parseSpecYaml, specToDrawioXml, validateSpec, validateXml } from '../dsl/spec-to-drawio.js'
import { buildArchMetadata, serializeSpecYaml } from '../runtime/artifacts.js'
import { createCodeIdentity, createGroupIdentity } from './identity.js'
import { finalizeGraphProjection } from './graph-projection.js'
import { projectGraphToSpec } from './projection-to-spec.js'

function finalizedFixture(label = 'API', { mode = 'code', locator = 'src', reverse = false } = {}) {
  const moduleIdentity = createGroupIdentity({ domain: 'code', key: 'src' })
  const api = createCodeIdentity({ language: 'typescript', modulePath: 'src/api.ts' })
  const db = createCodeIdentity({ language: 'typescript', modulePath: 'src/db.ts' })
  const nodes = [
    { identity: api, label, semanticType: 'service', moduleIdentity, attributes: {} },
    { identity: db, label: 'Database', semanticType: 'database', moduleIdentity, attributes: {} }
  ]
  if (reverse) nodes.reverse()
  return finalizeGraphProjection({
    version: 1,
    source: { adapter: 'typescript-imports', domain: 'code', mode, locator },
    nodes,
    edges: [{ from: api, to: db, relation: 'imports', label: 'imports', attributes: {} }],
    modules: [{ identity: moduleIdentity, label: 'src', attributes: {} }],
    diagnostics: []
  })
}

test('projectGraphToSpec emits stable renderer-safe ids and identity metadata', () => {
  const first = projectGraphToSpec(finalizedFixture('API'))
  const renamed = projectGraphToSpec(finalizedFixture('Gateway', { reverse: true }))

  assert.equal(first.meta.layout, 'hierarchical')
  assert.deepEqual(first.meta.adapter, {
    projectionVersion: 1,
    name: 'typescript-imports',
    domain: 'code',
    mode: 'code',
    locator: 'src'
  })
  assert.match(first.nodes[0].id, /^n-[a-f0-9]{20}$/)
  assert.equal(first.nodes[0].id, renamed.nodes[0].id)
  assert.deepEqual(first.nodes[0].identity, renamed.nodes[0].identity)
  assert.match(first.edges[0].id, /^e-[a-f0-9]{20}$/)
  assert.match(first.modules[0].id, /^m-[a-f0-9]{20}$/)
  assert.equal(first.nodes[0].module, first.modules[0].id)
  assert.equal('attributes' in first.nodes[0], false)
})

test('declared and live projections reuse the same identity factory across source metadata changes', () => {
  const declared = projectGraphToSpec(finalizedFixture('Declared API', { mode: 'declared', locator: 'src' }))
  const live = projectGraphToSpec(
    finalizedFixture('Running API', { mode: 'live', locator: 'snapshots/runtime', reverse: true })
  )

  assert.deepEqual(
    declared.nodes.map(({ id, identity }) => ({ id, identity })),
    live.nodes.map(({ id, identity }) => ({ id, identity }))
  )
  assert.deepEqual(
    declared.edges.map(({ id, identity }) => ({ id, identity })),
    live.edges.map(({ id, identity }) => ({ id, identity }))
  )
})

test('projectGraphToSpec detects renderer hash collisions without traversal-order suffixes', () => {
  assert.throws(
    () => projectGraphToSpec(finalizedFixture(), { hash: () => 'a'.repeat(64) }),
    (error) => error.code === 'IDENTITY_COLLISION' && /collision/.test(error.message)
  )
})

test('projectGraphToSpec rejects candidates that did not cross the finalization boundary', () => {
  assert.throws(
    () => projectGraphToSpec({ version: 1, source: {}, nodes: [], edges: [] }),
    (error) => error.code === 'PROJECTION_INVALID' && /finalized/.test(error.message)
  )
})

test('projected specs round-trip through YAML, arch metadata, JS ELK, and XML validation', async () => {
  const projected = projectGraphToSpec(finalizedFixture())
  validateSpec(projected)

  const roundTripped = parseSpecYaml(serializeSpecYaml(projected))
  assert.deepEqual(roundTripped.nodes[0].identity, projected.nodes[0].identity)
  assert.deepEqual(roundTripped.meta.adapter, projected.meta.adapter)

  const arch = buildArchMetadata(projected, { outputFile: 'code-graph.drawio' })
  assert.deepEqual(arch.adapter, projected.meta.adapter)
  assert.deepEqual(arch.nodes[0].identity, projected.nodes[0].identity)
  assert.deepEqual(arch.edges[0].identity, projected.edges[0].identity)
  assert.deepEqual(arch.modules[0].identity, projected.modules[0].identity)

  const layout = await applyAutoLayout(projected)
  assert.equal(layout.applied, true)
  assert.ok(layout.spec.nodes.every((node) => node.bounds))
  assert.deepEqual(layout.spec.nodes[0].identity, projected.nodes[0].identity)

  const xml = specToDrawioXml(layout.spec)
  assert.deepEqual(validateXml(xml), { valid: true, errors: [], warnings: [] })
})

test('legacy specs without identity remain valid', () => {
  assert.doesNotThrow(() =>
    validateSpec({
      meta: { layout: 'horizontal' },
      nodes: [{ id: 'api', label: 'API', type: 'service' }],
      edges: [],
      modules: []
    })
  )
})

test('canonical schema and runtime validation enforce adapter identity metadata', () => {
  const schema = JSON.parse(readFileSync(new URL('../../assets/schemas/spec.schema.json', import.meta.url), 'utf8'))
  assert.equal(schema.properties.meta.properties.adapter.$ref, '#/$defs/adapter')
  assert.equal(schema.properties.nodes.items.properties.identity.$ref, '#/$defs/identity')
  assert.equal(schema.properties.edges.items.properties.identity.$ref, '#/$defs/identity')
  assert.equal(schema.properties.modules.items.properties.identity.$ref, '#/$defs/identity')

  const projected = projectGraphToSpec(finalizedFixture())
  const missingIdentity = structuredClone(projected)
  delete missingIdentity.nodes[0].identity
  assert.throws(() => validateSpec(missingIdentity), /requires identity/)

  const badAdapter = structuredClone(projected)
  badAdapter.meta.adapter.locator = 'C:\\private\\source'
  assert.throws(() => validateSpec(badAdapter), /safe relative path/)

  const escapingAdapter = structuredClone(projected)
  escapingAdapter.meta.adapter.locator = 'infra/../../private/source'
  assert.throws(() => validateSpec(escapingAdapter), /safe relative path/)

  const duplicateIdentity = structuredClone(projected)
  duplicateIdentity.nodes[1].identity = duplicateIdentity.nodes[0].identity
  assert.throws(() => validateSpec(duplicateIdentity), /Duplicate node identity/)
})

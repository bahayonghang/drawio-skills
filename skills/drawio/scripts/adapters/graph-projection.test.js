import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { ERROR_CODES, createComposeIdentity, createGroupIdentity } from './identity.js'
import { finalizeGraphProjection } from './graph-projection.js'

function projectionFixture() {
  const moduleIdentity = createGroupIdentity({ domain: 'compose', key: 'shop' })
  const api = createComposeIdentity({ project: 'shop', service: 'api' })
  const db = createComposeIdentity({ project: 'shop', service: 'db' })
  return {
    version: 1,
    source: { adapter: 'compose-config', domain: 'compose', mode: 'declared', locator: 'infra/compose.yml' },
    nodes: [
      {
        identity: db,
        label: 'Database',
        semanticType: 'database',
        moduleIdentity,
        attributes: { image: 'postgres:16' }
      },
      {
        identity: api,
        label: 'API',
        semanticType: 'service',
        moduleIdentity,
        attributes: { image: 'api:1' }
      }
    ],
    edges: [{ from: api, to: db, relation: 'depends-on', attributes: { required: true } }],
    modules: [{ identity: moduleIdentity, label: 'shop', attributes: { project: 'shop' } }],
    diagnostics: [{ level: 'info', code: 'COMPOSE_PROJECT_EXPLICIT', message: 'Project identity is explicit.' }]
  }
}

const attributeAllowlist = {
  node: ['image'],
  edge: ['required'],
  module: ['project']
}

test('finalizeGraphProjection validates, enriches, and deterministically sorts a projection', () => {
  const result = finalizeGraphProjection(projectionFixture(), { attributeAllowlist })

  assert.equal(result.version, 1)
  assert.deepEqual(
    result.nodes.map((node) => node.label),
    ['API', 'Database']
  )
  assert.equal(result.edges[0].identity.scheme, 'graph-edge')
  assert.equal(result.modules[0].identity.scheme, 'compose-group')
  assert.deepEqual(result.source, {
    adapter: 'compose-config',
    domain: 'compose',
    mode: 'declared',
    locator: 'infra/compose.yml'
  })
})

test('projection schema declares the same required top-level contract', () => {
  const schema = JSON.parse(
    readFileSync(new URL('../../assets/schemas/graph-projection.schema.json', import.meta.url), 'utf8')
  )
  assert.equal(schema.properties.version.const, 1)
  assert.deepEqual(schema.required, ['version', 'source', 'nodes', 'edges', 'modules', 'diagnostics'])
  assert.equal(schema.additionalProperties, false)
})

test('projection validation rejects unknown versions, duplicate identities, and dangling edges', () => {
  assert.throws(
    () => finalizeGraphProjection({ ...projectionFixture(), version: 2 }, { attributeAllowlist }),
    (error) => error.code === ERROR_CODES.PROJECTION_INVALID && /version/.test(error.message)
  )

  const duplicate = projectionFixture()
  duplicate.nodes.push({ ...duplicate.nodes[0], label: 'Duplicate' })
  assert.throws(
    () => finalizeGraphProjection(duplicate, { attributeAllowlist }),
    (error) => error.code === ERROR_CODES.PROJECTION_INVALID && /duplicate node identity/.test(error.message)
  )

  const dangling = projectionFixture()
  dangling.edges[0].to = createComposeIdentity({ project: 'shop', service: 'missing' })
  assert.throws(
    () => finalizeGraphProjection(dangling, { attributeAllowlist }),
    (error) => error.code === ERROR_CODES.PROJECTION_INVALID && /unknown target/.test(error.message)
  )
})

test('projection validation rejects raw styles, absolute locators, and non-allowlisted or secret attributes', () => {
  const styled = projectionFixture()
  styled.nodes[0].style = 'fillColor=#fff;'
  assert.throws(
    () => finalizeGraphProjection(styled, { attributeAllowlist }),
    (error) => error.code === ERROR_CODES.PROJECTION_INVALID && /unknown field "style"/.test(error.message)
  )

  const absolute = projectionFixture()
  absolute.source.locator = 'C:\\private\\infra.yml'
  assert.throws(
    () => finalizeGraphProjection(absolute, { attributeAllowlist }),
    (error) => error.code === ERROR_CODES.PROJECTION_INVALID && /relative/.test(error.message)
  )

  const unknown = projectionFixture()
  unknown.nodes[0].attributes.region = 'us-east-1'
  assert.throws(
    () => finalizeGraphProjection(unknown, { attributeAllowlist }),
    (error) => error.code === ERROR_CODES.PROJECTION_INVALID && /not allowlisted/.test(error.message)
  )

  const secret = projectionFixture()
  secret.nodes[0].attributes.token = 'do-not-copy'
  assert.throws(
    () => finalizeGraphProjection(secret, { attributeAllowlist: { node: ['image', 'token'] } }),
    (error) => error.code === ERROR_CODES.PROJECTION_INVALID && /sensitive attribute/.test(error.message)
  )

  const credentials = projectionFixture()
  credentials.nodes[0].attributes.credentials = { username: 'admin' }
  assert.throws(
    () => finalizeGraphProjection(credentials, { attributeAllowlist: { node: ['image', 'credentials'] } }),
    (error) => error.code === ERROR_CODES.PROJECTION_INVALID && /sensitive attribute/.test(error.message)
  )
})

test('parallel edges require stable discriminators while a single relation does not', () => {
  const duplicateEdge = projectionFixture()
  duplicateEdge.edges.push({ ...duplicateEdge.edges[0] })
  assert.throws(
    () => finalizeGraphProjection(duplicateEdge, { attributeAllowlist }),
    (error) => error.code === ERROR_CODES.PROJECTION_INVALID && /discriminator/.test(error.message)
  )

  duplicateEdge.edges[0].discriminator = 'declared:0'
  duplicateEdge.edges[1].discriminator = 'declared:1'
  const finalized = finalizeGraphProjection(duplicateEdge, { attributeAllowlist })
  assert.equal(finalized.edges.length, 2)
  assert.notEqual(finalized.edges[0].identity.key, finalized.edges[1].identity.key)
})

import test from 'node:test'
import assert from 'node:assert/strict'

import { ERROR_CODES } from './identity.js'
import { COMPOSE_ATTRIBUTE_ALLOWLIST, parseComposeConfig } from './compose.js'

const source = `
name: shop
services:
  api:
    image: example/api:1
    depends_on: [db]
    networks: [backend]
  db:
    image: postgres:16
    volumes: [data:/var/lib/postgresql/data]
networks: { backend: {} }
volumes: { data: {} }
`

test('parseComposeConfig emits services, named resources, and stable relations', () => {
  const projection = parseComposeConfig(source, { locator: 'compose.yaml' })

  assert.equal(projection.nodes.length, 4)
  assert.ok(projection.nodes.some((node) => node.identity.scheme === 'compose-volume'))
  assert.ok(projection.nodes.some((node) => node.identity.scheme === 'compose-network'))
  assert.deepEqual(new Set(projection.edges.map((edge) => edge.relation)), new Set(['depends-on', 'uses-network', 'mounts']))
  assert.equal(projection.nodes.find((node) => node.label === 'api').attributes.image, 'example/api:1')
  assert.deepEqual(COMPOSE_ATTRIBUTE_ALLOWLIST.node, ['image', 'kind', 'project', 'service'])
})

test('parseComposeConfig requires an explicit or top-level project identity', () => {
  assert.throws(
    () => parseComposeConfig('services: { api: { image: app:1 } }', { locator: 'compose.yaml' }),
    (error) => error.code === ERROR_CODES.ADAPTER_PARSE && /project/.test(error.message)
  )
})

test('parseComposeConfig never projects environment or build args', () => {
  const projection = parseComposeConfig(
    'name: shop\nservices:\n  api:\n    image: app:1\n    environment: { TOKEN: secret }\n    build: { args: { PASSWORD: secret } }',
    { locator: 'compose.yaml' }
  )
  assert.deepEqual(Object.keys(projection.nodes[0].attributes).sort(), ['image', 'kind', 'project', 'service'])
})

test('parseComposeConfig does not treat bind mounts as named volumes', () => {
  const projection = parseComposeConfig(
    'name: shop\nservices:\n  api:\n    volumes: ["C:\\\\work:/app", "./src:/src"]',
    { locator: 'compose.yaml' }
  )
  assert.equal(projection.edges.length, 0)
})

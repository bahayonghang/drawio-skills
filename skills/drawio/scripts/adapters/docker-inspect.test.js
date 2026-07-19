import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { parseComposeConfig } from './compose.js'
import { parseDockerInspectSnapshot } from './docker-inspect.js'

const fixture = readFileSync(
  new URL('../../references/examples/importers/live/docker-inspect.json', import.meta.url),
  'utf8'
)

test('Docker inspect aggregates Compose replicas using declared identity and attributes', () => {
  const live = parseDockerInspectSnapshot(fixture, { locator: 'snapshots/docker-inspect.json' })
  const declared = parseComposeConfig(
    'name: shop\nservices:\n  web:\n    image: example/web:1\n    deploy: { replicas: 2 }\n    depends_on: [db]\n  db:\n    image: postgres:16',
    { locator: 'compose.yaml' }
  )

  assert.equal(live.source.mode, 'live')
  assert.deepEqual(live.nodes.map((node) => node.identity), declared.nodes.map((node) => node.identity))
  assert.deepEqual(live.nodes.map((node) => node.attributes), declared.nodes.map((node) => node.attributes))
  assert.equal(live.edges.length, 1)
  assert.ok(live.diagnostics.some((entry) => entry.code === 'DOCKER_STANDALONE_EXCLUDED'))

  const serialized = JSON.stringify(live)
  for (const secret of [
    'docker-secret-must-not-cross',
    'docker-label-secret-must-not-cross',
    'host-path-must-not-cross',
    'container-web-1-must-not-cross',
    'standalone-container-must-not-cross'
  ]) {
    assert.equal(serialized.includes(secret), false, secret)
  }
})

test('Docker inspect output is deterministic across container order and instance names', () => {
  const containers = JSON.parse(fixture).reverse().map((container, index) => ({
    ...container,
    Id: `changed-${index}`,
    Name: `/changed-${index}`
  }))
  const first = parseDockerInspectSnapshot(fixture, { locator: 'snapshots/first.json' })
  const second = parseDockerInspectSnapshot(JSON.stringify(containers), { locator: 'snapshots/second.json' })

  assert.deepEqual(first.nodes, second.nodes)
  assert.deepEqual(first.edges, second.edges)
})

test('Docker inspect rejects ambiguous replicas and invalid top-level input', () => {
  const containers = JSON.parse(fixture)
  containers[1].Config.Image = 'example/web:2'
  assert.throws(
    () => parseDockerInspectSnapshot(JSON.stringify(containers), { locator: 'snapshot.json' }),
    (error) => error.code === 'ADAPTER_PARSE' && /inconsistent image/.test(error.message)
  )
  assert.throws(
    () => parseDockerInspectSnapshot('{}', { locator: 'snapshot.json' }),
    (error) => error.code === 'ADAPTER_PARSE' && /array/.test(error.message)
  )
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { parseKubernetesManifests, parseKubernetesLiveSnapshot } from './kubernetes.js'
import { projectGraphToSpec } from './projection-to-spec.js'

const fixture = readFileSync(
  new URL('../../references/examples/importers/live/kubernetes-live.json', import.meta.url),
  'utf8'
)

test('Kubernetes declared/live wrappers reuse identities while preserving live mode', () => {
  const declared = parseKubernetesManifests(fixture, { scope: 'prod', locator: 'k8s/app.json' })
  const live = parseKubernetesLiveSnapshot(fixture, { scope: 'prod', locator: 'snapshots/kubernetes.json' })

  assert.equal(declared.source.mode, 'declared')
  assert.equal(live.source.mode, 'live')
  assert.deepEqual(live.nodes.map((node) => node.identity), declared.nodes.map((node) => node.identity))
  assert.deepEqual(
    projectGraphToSpec(live).nodes.map(({ id, identity }) => ({ id, identity })),
    projectGraphToSpec(declared).nodes.map(({ id, identity }) => ({ id, identity }))
  )

  const serialized = JSON.stringify(live)
  for (const secret of [
    'annotation-secret-must-not-cross',
    'private-manager-must-not-cross',
    'literal-env-secret-must-not-cross',
    'kubernetes-secret-must-not-cross',
    'binary-secret-must-not-cross'
  ]) {
    assert.equal(serialized.includes(secret), false, secret)
  }
})

test('Kubernetes live wrapper requires explicit scope and rejects malformed input', () => {
  assert.throws(
    () => parseKubernetesLiveSnapshot(fixture, { locator: 'snapshot.json' }),
    (error) => error.code === 'IDENTITY_INVALID' && /scope/.test(error.message)
  )
  assert.throws(
    () => parseKubernetesLiveSnapshot('{', { scope: 'prod', locator: 'snapshot.json' }),
    (error) => error.code === 'ADAPTER_PARSE'
  )
})

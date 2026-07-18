import test from 'node:test'
import assert from 'node:assert/strict'

import { finalizeGraphProjection } from './graph-projection.js'
import { createComposeIdentity } from './identity.js'
import {
  compareGraphProjections,
  createDriftProjection,
  projectDriftReportToSpec,
  renderDriftGraph
} from './graph-drift.js'

const ATTRIBUTE_ALLOWLIST = {
  node: ['image', 'replicas'],
  edge: ['protocol']
}

function projection(mode, nodes, edges = [], domain = 'compose') {
  return finalizeGraphProjection(
    {
      version: 1,
      source: { adapter: `test-${mode}`, domain, mode, locator: `${mode}.json` },
      nodes,
      edges,
      modules: [],
      diagnostics: []
    },
    { attributeAllowlist: ATTRIBUTE_ALLOWLIST }
  )
}

test('drift compares nodes by identity and reports display label changes', () => {
  const identity = createComposeIdentity({ project: 'shop', service: 'api' })
  const baseline = projection('declared', [
    { identity, label: 'API', semanticType: 'service', attributes: { image: 'api:1', replicas: 1 } }
  ])
  const observed = projection('live', [
    { identity, label: 'Gateway', semanticType: 'service', attributes: { image: 'api:1', replicas: 1 } }
  ])

  const report = compareGraphProjections(baseline, observed, {
    baselineContext: 'production',
    observedContext: 'production'
  })

  assert.equal(report.version, 1)
  assert.deepEqual(report.nodes.added, [])
  assert.deepEqual(report.nodes.removed, [])
  assert.deepEqual(report.nodes.unchanged, [])
  assert.deepEqual(report.nodes.changed, [
    {
      identity,
      before: { label: 'API', attributes: { image: 'api:1', replicas: 1 } },
      after: { label: 'Gateway', attributes: { image: 'api:1', replicas: 1 } },
      changedKeys: ['label']
    }
  ])
})

test('drift rejects mismatched explicit comparison contexts without echoing values', () => {
  const identity = createComposeIdentity({ project: 'shop', service: 'api' })
  const baseline = projection('declared', [{ identity, label: 'API', attributes: {} }])
  const observed = projection('live', [{ identity, label: 'API', attributes: {} }])

  assert.throws(
    () =>
      compareGraphProjections(baseline, observed, {
        baselineContext: 'baseline-private-must-not-cross',
        observedContext: 'observed-private-must-not-cross'
      }),
    (error) =>
      error.code === 'DRIFT_INCOMPATIBLE' &&
      !error.message.includes('baseline-private-must-not-cross') &&
      !error.message.includes('observed-private-must-not-cross')
  )
})

test('drift rejects incompatible versions, domains, and duplicate identities', () => {
  const identity = createComposeIdentity({ project: 'shop', service: 'api' })
  const baseline = projection('declared', [{ identity, label: 'API', attributes: {} }])
  const observed = projection('live', [{ identity, label: 'API', attributes: {} }])
  const options = { baselineContext: 'production', observedContext: 'production' }

  assert.throws(
    () => compareGraphProjections({ ...baseline, version: 2 }, observed, options),
    (error) => error.code === 'DRIFT_INCOMPATIBLE' && /version/i.test(error.message)
  )
  assert.throws(
    () => compareGraphProjections(baseline, { ...observed, source: { ...observed.source, domain: 'kubernetes' } }, options),
    (error) => error.code === 'DRIFT_INCOMPATIBLE' && /domain/i.test(error.message)
  )
  assert.throws(
    () => compareGraphProjections({ ...baseline, nodes: [baseline.nodes[0], baseline.nodes[0]] }, observed, options),
    (error) => error.code === 'IDENTITY_COLLISION'
  )
})

test('drift reports deterministic four-state node, edge, and attribute buckets', () => {
  const api = createComposeIdentity({ project: 'shop', service: 'api' })
  const db = createComposeIdentity({ project: 'shop', service: 'db' })
  const cache = createComposeIdentity({ project: 'shop', service: 'cache' })
  const worker = createComposeIdentity({ project: 'shop', service: 'worker' })
  const baselineNodes = [
    { identity: cache, label: 'Cache', attributes: { image: 'redis:7' } },
    { identity: api, label: 'API', attributes: { image: 'api:1', replicas: 1 } },
    { identity: db, label: 'DB', attributes: { image: 'postgres:16' } }
  ]
  const observedNodes = [
    { identity: worker, label: 'Worker', attributes: { image: 'worker:1' } },
    { identity: db, label: 'DB', attributes: { image: 'postgres:16' } },
    { identity: api, label: 'API', attributes: { image: 'api:1', replicas: 2 } }
  ]
  const baselineEdges = [
    { from: api, to: cache, relation: 'uses', attributes: { protocol: 'tcp' } },
    { from: db, to: api, relation: 'reports-to', attributes: { protocol: 'https' } },
    { from: api, to: db, relation: 'depends-on', attributes: { protocol: 'tcp' } }
  ]
  const observedEdges = [
    { from: api, to: worker, relation: 'uses', attributes: { protocol: 'tcp' } },
    { from: api, to: db, relation: 'depends-on', attributes: { protocol: 'tls' } },
    { from: db, to: api, relation: 'reports-to', attributes: { protocol: 'https' } }
  ]
  const options = { baselineContext: 'production', observedContext: 'production' }
  const report = compareGraphProjections(
    projection('declared', baselineNodes, baselineEdges),
    projection('live', observedNodes, observedEdges),
    options
  )

  for (const section of ['nodes', 'edges']) {
    assert.deepEqual(Object.fromEntries(Object.entries(report[section]).map(([status, values]) => [status, values.length])), {
      added: 1,
      removed: 1,
      changed: 1,
      unchanged: 1
    })
  }
  assert.deepEqual(
    Object.fromEntries(Object.entries(report.attributes).map(([status, values]) => [status, values.length])),
    { added: 2, removed: 2, changed: 2, unchanged: 3 }
  )
  assert.deepEqual(report.nodes.changed[0].changedKeys, ['attributes.replicas'])
  assert.deepEqual(report.edges.changed[0].changedKeys, ['attributes.protocol'])
  assert.deepEqual(report.attributes.changed[0], {
    owner: 'node',
    identity: api,
    key: 'replicas',
    before: 1,
    after: 2
  })

  const reordered = compareGraphProjections(
    projection('declared', [...baselineNodes].reverse(), [...baselineEdges].reverse()),
    projection('live', [...observedNodes].reverse(), [...observedEdges].reverse()),
    options
  )
  assert.deepEqual(reordered, report)
})

test('drift treats an edge relation change as removed plus added', () => {
  const api = createComposeIdentity({ project: 'shop', service: 'api' })
  const db = createComposeIdentity({ project: 'shop', service: 'db' })
  const nodes = [
    { identity: api, label: 'API', attributes: {} },
    { identity: db, label: 'DB', attributes: {} }
  ]
  const baseline = projection('declared', nodes, [{ from: api, to: db, relation: 'reads', attributes: {} }])
  const observed = projection('live', nodes, [{ from: api, to: db, relation: 'queries', attributes: {} }])

  const report = compareGraphProjections(baseline, observed, {
    baselineContext: 'production',
    observedContext: 'production'
  })

  assert.equal(report.edges.added.length, 1)
  assert.equal(report.edges.removed.length, 1)
  assert.equal(report.edges.changed.length, 0)
  assert.equal(report.edges.unchanged.length, 0)
})

test('drift sorts attribute buckets globally by serialized identity across owners', () => {
  const first = { scheme: 'z-resource', key: 'first' }
  const second = { scheme: 'z-resource', key: 'second' }
  const baseline = projection(
    'declared',
    [
      { identity: first, label: 'First', attributes: { image: 'v1' } },
      { identity: second, label: 'Second', attributes: {} }
    ],
    [{ from: first, to: second, relation: 'calls', attributes: { protocol: 'http' } }]
  )
  const observed = projection(
    'live',
    [
      { identity: first, label: 'First', attributes: { image: 'v2' } },
      { identity: second, label: 'Second', attributes: {} }
    ],
    [{ from: first, to: second, relation: 'calls', attributes: { protocol: 'https' } }]
  )

  const report = compareGraphProjections(baseline, observed, {
    baselineContext: 'production',
    observedContext: 'production'
  })

  assert.deepEqual(report.attributes.changed.map((record) => record.identity.scheme), ['graph-edge', 'z-resource'])
})

test('drift report creates a finalized status-labeled projection and rejects unknown report versions', () => {
  const api = createComposeIdentity({ project: 'shop', service: 'api' })
  const db = createComposeIdentity({ project: 'shop', service: 'db' })
  const cache = createComposeIdentity({ project: 'shop', service: 'cache' })
  const worker = createComposeIdentity({ project: 'shop', service: 'worker' })
  const baseline = projection('declared', [
    { identity: api, label: 'API', attributes: { replicas: 1 } },
    { identity: db, label: 'DB', attributes: {} },
    { identity: cache, label: 'Cache', attributes: {} }
  ])
  const observed = projection('live', [
    { identity: api, label: 'Gateway', attributes: { replicas: 2 } },
    { identity: db, label: 'DB', attributes: {} },
    { identity: worker, label: 'Worker', attributes: {} }
  ])
  const report = compareGraphProjections(baseline, observed, {
    baselineContext: 'production',
    observedContext: 'production'
  })

  const drift = createDriftProjection(report, baseline, observed)
  assert.equal(drift.source.adapter, 'graph-drift')
  assert.equal(drift.source.mode, 'drift')
  assert.ok(drift.nodes.some((node) => node.label === '[ADDED] Worker'))
  assert.ok(drift.nodes.some((node) => node.label === '[REMOVED] Cache'))
  assert.ok(drift.nodes.some((node) => node.label === '[UNCHANGED] DB'))
  assert.ok(drift.nodes.some((node) => node.label === '[CHANGED: attributes.replicas, label] Gateway'))
  assert.ok(drift.nodes.some((node) => node.label.startsWith('Legend: [ADDED]')))

  assert.throws(
    () => createDriftProjection({ ...report, version: 2 }, baseline, observed),
    (error) => error.code === 'DRIFT_INCOMPATIBLE' && /report version/i.test(error.message)
  )
})

test('drift presentation uses shared projection, JavaScript ELK, renderer, and XML validation', async () => {
  const api = createComposeIdentity({ project: 'shop', service: 'api' })
  const db = createComposeIdentity({ project: 'shop', service: 'db' })
  const nodes = [
    { identity: api, label: 'API', attributes: {} },
    { identity: db, label: 'DB', attributes: {} }
  ]
  const baseline = projection('declared', nodes, [
    { from: api, to: db, relation: 'depends-on', attributes: {} }
  ])
  const observed = projection('live', nodes)
  const report = compareGraphProjections(baseline, observed, {
    baselineContext: 'production',
    observedContext: 'production'
  })

  const projected = projectDriftReportToSpec(report, baseline, observed)
  assert.equal(projected.meta.adapter.mode, 'drift')
  assert.match(projected.meta.legend, /\[REMOVED\].*dashed/)
  assert.equal(projected.edges[0].style.dashed, true)
  assert.match(projected.edges[0].label, /^\[REMOVED\]/)

  const rendered = await renderDriftGraph(report, baseline, observed)
  assert.equal(rendered.layoutApplied, true)
  assert.ok(rendered.spec.nodes.every((node) => node.bounds))
  assert.deepEqual(rendered.xmlValidation, { valid: true, errors: [], warnings: [] })
  assert.match(rendered.xml, /dashed=1/)
  assert.match(rendered.xml, /\[REMOVED\]/)
})

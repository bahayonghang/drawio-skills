import test from 'node:test'
import assert from 'node:assert/strict'
import { buildCatalog } from './build-shape-catalog.js'

test('buildCatalog extracts deterministic flat and parameterized entries', () => {
  const rows = [
    { style: 'shape=mxgraph.kubernetes.icon2;prIcon=pod;', title: 'Pod', tags: 'kubernetes pod' },
    { style: 'shape=mxgraph.mscae.vm;', title: 'VM', tags: 'azure vm' },
    { style: 'shape=rectangle;', title: 'Rectangle', tags: 'rect' }
  ]
  const catalog = buildCatalog(rows)
  assert.deepEqual(catalog.builtin, ['rectangle'])
  assert.ok(catalog.entries.some((entry) => entry.n === 'mxgraph.mscae.vm'))
  assert.deepEqual(catalog.families[0].values[0], { v: 'pod', t: 'Pod', g: ['kubernetes', 'pod'] })
})

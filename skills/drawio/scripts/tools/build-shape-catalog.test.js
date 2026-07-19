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

test('buildCatalog includes SysML and BPMN stencils while merging variant search tags', () => {
  const rows = [
    { style: 'shape=mxgraph.bpmn.task2;taskMarker=abstract;', title: 'Generic Task', tags: 'bpmn task generic' },
    { style: 'shape=mxgraph.bpmn.task2;taskMarker=manual;', title: 'Manual', tags: 'bpmn task manual' },
    { style: 'shape=mxgraph.sysml.port;sysMLPortType=flowN;', title: 'Flow Port', tags: 'sysml port flow' },
    { style: 'shape=mxgraph.sysml.package;', title: 'Package', tags: 'sysml block package' },
    {
      style: 'shape=mxgraph.sysml.package;sysMLType=requirement;',
      title: 'Requirement Diagram',
      tags: 'sysml requirement diagram'
    }
  ]

  const catalog = buildCatalog(rows)
  assert.deepEqual(
    catalog.entries.map((entry) => entry.n),
    ['mxgraph.bpmn.task2', 'mxgraph.sysml.package', 'mxgraph.sysml.port']
  )
  assert.deepEqual(
    catalog.entries.find((entry) => entry.n === 'mxgraph.bpmn.task2').g,
    ['bpmn', 'generic', 'manual', 'task']
  )
  assert.deepEqual(
    catalog.entries.find((entry) => entry.n === 'mxgraph.sysml.package').g,
    ['block', 'diagram', 'package', 'requirement', 'sysml']
  )
})

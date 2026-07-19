import test from 'node:test'
import assert from 'node:assert/strict'
import { loadShapeCatalog, resolveShapeNameKind } from './shape-catalog.js'

test('v2 catalog loads parameterized families and mscae entries', () => {
  const catalog = loadShapeCatalog()
  assert.equal(catalog.families.get('mxgraph.kubernetes.icon2:prIcon').values.length, 39)
  assert.equal(catalog.entries.filter((entry) => entry.n.startsWith('mxgraph.mscae.')).length, 148)
  assert.equal(resolveShapeNameKind('mxgraph.kubernetes.icon2:prIcon=pod'), 'k8sParamIcon')
  assert.equal(resolveShapeNameKind('mxgraph.kubernetes.icon2:prIcon=podd'), 'unknown')
})

test('catalog covers the vendored SysML and BPMN stencil namespaces', () => {
  const catalog = loadShapeCatalog()
  assert.equal(catalog.entries.filter((entry) => entry.n.startsWith('mxgraph.sysml.')).length, 19)
  assert.equal(catalog.entries.filter((entry) => entry.n.startsWith('mxgraph.bpmn.')).length, 6)
  assert.equal(resolveShapeNameKind('mxgraph.sysml.port'), 'stencil')
  assert.equal(resolveShapeNameKind('mxgraph.bpmn.task2'), 'stencil')
  assert.equal(resolveShapeNameKind('mxgraph.sysml.not_real'), 'unknown')
  assert.equal(resolveShapeNameKind('mxgraph.bpmn.not_real'), 'unknown')
})

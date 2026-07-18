import test from 'node:test'
import assert from 'node:assert/strict'
import { searchShapeCatalog, searchShapeCatalogBatch } from './catalog-search.js'

test('catalog search finds k8s parameter values with skill syntax', () => {
  const result = searchShapeCatalog('pod', { prefix: 'kubernetes' })
  assert.ok(result.some((entry) => entry.spec === 'k8s.pod'))
})

test('catalog search supports comma-separated batches and no-result output', () => {
  const groups = searchShapeCatalogBatch('s3, lambda, zzz_not_exist')
  assert.equal(groups.length, 3)
  assert.ok(groups[0].results.length > 0)
  assert.ok(groups[1].results.length > 0)
  assert.equal(groups[2].results.length, 0)
})

test('catalog search ranks exact last-segment matches first', () => {
  const [first] = searchShapeCatalog('s3')
  assert.equal(first.name, 'mxgraph.aws4.s3')
  assert.equal(first.spec, 'aws.s3')
})

test('catalog search finds kubernetes entries through natural-word aliases', () => {
  const results = searchShapeCatalog('deployment', { prefix: 'kubernetes' })
  assert.ok(results.some((entry) => entry.spec === 'k8s.deploy'))
})

test('catalog search routes the lobe prefix to canonical offline AI icons', () => {
  const [result] = searchShapeCatalog('openai', { prefix: 'lobe', limit: 1 })
  assert.equal(result.name, 'lobe.openai')
  assert.equal(result.spec, 'icon: lobe.openai')
  assert.doesNotMatch(JSON.stringify(result), /https?:\/\//)
})

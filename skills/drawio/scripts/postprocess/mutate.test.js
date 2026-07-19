import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { normalizePostprocessInput } from './input.js'
import { serializeDocumentSpecYaml } from '../runtime/artifacts.js'
import { specToDrawioXml, validateXml } from '../dsl/spec-to-drawio.js'
import { drawioToDocumentSpec, renderDocumentFile, validateDrawioDocument } from '../dsl/multi-page.js'
import { applyHeatmap, applyRelabel, applyRestyle, parseHeatmapMetrics } from './mutate.js'

const fixture = normalizePostprocessInput(
  readFileSync(new URL('./fixtures/bundle.yaml', import.meta.url), 'utf8')
)

test('relabels bundle objects by stable page/object address without mutating identity, geometry, links, or source', () => {
  const original = structuredClone(fixture)
  const result = applyRelabel(fixture, {
    'context/gateway': 'Gateway renamed',
    'detail/gateway': 'Detail renamed'
  })

  assert.equal(result.pages[0].nodes[0].label, 'Gateway renamed')
  assert.equal(result.pages[1].nodes[0].label, 'Detail renamed')
  assert.equal(result.pages[0].nodes[0].id, 'gateway')
  assert.deepEqual(result.pages[0].nodes[0].bounds, original.pages[0].nodes[0].bounds)
  assert.deepEqual(result.pages[0].edges, original.pages[0].edges)
  assert.deepEqual(result.links, original.links)
  assert.deepEqual(fixture, original)
})

test('supports legacy object-id maps and returns deterministic match diagnostics', () => {
  const legacy = normalizePostprocessInput('nodes:\n  - id: api\n    label: API\nedges: []\nmodules: []\n')
  const result = applyRelabel(legacy, { api: 'HTTP API' }, { returnDiagnostics: true })

  assert.equal(result.value.nodes[0].label, 'HTTP API')
  assert.deepEqual(result.diagnostics, { matched: ['page-1/api'], missing: [], changed: ['page-1/api'] })
})

test('rejects duplicate and missing map addresses unless explicitly allowed', () => {
  assert.throws(
    () => applyRelabel(fixture, [
      { pageId: 'context', objectId: 'gateway', label: 'A' },
      { pageId: 'context', objectId: 'gateway', label: 'B' }
    ]),
    /duplicate relabel map key.*context\/gateway/i
  )
  assert.throws(() => applyRelabel(fixture, { 'context/missing': 'Nope' }), /relabel map key.*not found/i)
  const allowed = applyRelabel(fixture, { 'context/missing': 'Nope' }, { allowMissing: true, returnDiagnostics: true })
  assert.deepEqual(allowed.diagnostics.missing, ['context/missing'])
})

test('page selection limits relabeling to the selected page', () => {
  const result = applyRelabel(fixture, { 'detail/gateway': 'Only detail' }, { page: 'detail' })

  assert.equal(result.pages[0].nodes[0].label, 'Gateway')
  assert.equal(result.pages[1].nodes[0].label, 'Only detail')
})

test('restyles through a bundled preset while preserving protected canonical fields', () => {
  const original = structuredClone(fixture)
  const result = applyRestyle(fixture, 'corporate')

  assert.equal(result.pages[0].nodes[0].style.fillColor, '#e3f2fd')
  assert.equal(result.pages[0].nodes[0].style.strokeColor, '#1565c0')
  assert.equal(result.pages[0].nodes[1].style.fillColor, '#e8f5e9')
  assert.equal(result.pages[0].nodes[0].icon, 'lucide.server-cog')
  assert.equal(result.pages[0].nodes[1].icon, 'redis.server')
  assert.equal(result.pages[0].nodes[2].icon, 'lobe.openai')
  assert.equal(result.pages[0].nodes[3].icon, 'aws.lambda')
  assert.deepEqual(result.pages[0].nodes[0].identity, original.pages[0].nodes[0].identity)
  assert.deepEqual(result.pages[0].nodes[0].bounds, original.pages[0].nodes[0].bounds)
  assert.deepEqual(result.pages[0].meta, original.pages[0].meta)
  assert.deepEqual(result.pages[1].meta, original.pages[1].meta)
  assert.deepEqual(result.links, original.links)
  assert.deepEqual(fixture, original)
  assert.equal(serializeDocumentSpecYaml(result), serializeDocumentSpecYaml(applyRestyle(fixture, 'corporate')))
})

test('accepts bounded user style tokens and rejects shape, icon, and unsafe preset text', () => {
  const legacy = normalizePostprocessInput('nodes:\n  - id: api\n    label: API\nedges: []\nmodules: []\n')
  const result = applyRestyle(legacy, {
    node: { fillColor: '#112233', strokeColor: '#445566', fontSize: 14 },
    edge: { strokeWidth: 2 },
    module: { fontColor: '#000000' }
  })

  assert.equal(result.nodes[0].style.fillColor, '#112233')
  assert.throws(() => applyRestyle(legacy, { node: { shape: 'image' } }), /unsupported restyle token.*shape/i)
  assert.throws(() => applyRestyle(legacy, { node: { icon: 'lobe.openai' } }), /unsupported restyle token.*icon/i)
  assert.throws(
    () => applyRestyle(legacy, { node: { fontFamily: 'Arial;html=1' } }),
    /restyle.*fontFamily.*safe/i
  )
})

test('restyled legacy output renders and validates through the existing XML path', () => {
  const legacy = normalizePostprocessInput(readFileSync(new URL('./fixtures/legacy.yaml', import.meta.url), 'utf8'))
  const result = applyRestyle(legacy, 'corporate')
  const xml = specToDrawioXml(result, { silent: true })

  assert.match(xml, /fillColor=#e3f2fd/)
  assert.equal(validateXml(xml).valid, true)
})

test('applies heatmap metrics by identity, address, then explicit label fallback', () => {
  const original = structuredClone(fixture)
  const result = applyHeatmap(
    fixture,
    {
      'fixture:context/gateway': 0,
      'context/cache': 50,
      'Detail gateway': 100,
      unmatched: 25
    },
    { palette: 'heat', labelFallback: true, returnDiagnostics: true }
  )

  assert.equal(result.value.pages[0].nodes[0].style.fillColor, '#FFF7EC')
  assert.equal(result.value.pages[0].nodes[1].style.fillColor, '#FC8D59')
  assert.equal(result.value.pages[1].nodes[0].style.fillColor, '#7F0000')
  assert.deepEqual(result.value.links, original.links)
  assert.equal(result.value.pages[0].nodes[0].icon, original.pages[0].nodes[0].icon)
  assert.deepEqual(result.value.pages[0].nodes[0].identity, original.pages[0].nodes[0].identity)
  assert.deepEqual(result.diagnostics.unmatched, ['unmatched'])
  assert.deepEqual(result.diagnostics.range, { min: 0, max: 100 })
  assert.deepEqual(fixture, original)
})

test('parses bounded JSON and CSV heatmap metrics deterministically', () => {
  assert.deepEqual(parseHeatmapMetrics('{"context/gateway": 5}'), [{ key: 'context/gateway', value: 5 }])
  assert.deepEqual(parseHeatmapMetrics('pageId,objectId,value\ncontext,gateway,5\ndetail,gateway,9\n'), [
    { key: 'context/gateway', value: 5 },
    { key: 'detail/gateway', value: 9 }
  ])
  assert.throws(() => parseHeatmapMetrics('key,value\na,NaN\n'), /finite numeric value/i)
  assert.throws(() => parseHeatmapMetrics([{ key: 'a', value: 1 }, { key: 'a', value: 2 }]), /duplicate heatmap metric key.*a/i)
})

test('rejects unknown palettes and ambiguous label fallback', () => {
  assert.throws(() => applyHeatmap(fixture, { 'context/gateway': 1 }, { palette: 'unknown' }), /unknown heatmap palette/i)
  const duplicateLabels = normalizePostprocessInput({
    meta: {},
    nodes: [
      { id: 'a', label: 'Same' },
      { id: 'b', label: 'Same' }
    ],
    edges: [],
    modules: []
  })
  assert.throws(
    () => applyHeatmap(duplicateLabels, { Same: 1 }, { labelFallback: true }),
    /heatmap label.*ambiguous/i
  )
})

test('bounds optional heatmap geometry scaling and keeps center stable', () => {
  const result = applyHeatmap(
    fixture,
    { 'context/gateway': 0, 'context/cache': 10 },
    { sizeScale: { min: 0.5, max: 1.5 }, page: 'context' }
  )
  const originalBounds = fixture.pages[0].nodes[0].bounds
  const scaledBounds = result.pages[0].nodes[0].bounds

  assert.equal(scaledBounds.width, originalBounds.width * 0.5)
  assert.equal(scaledBounds.x + scaledBounds.width / 2, originalBounds.x + originalBounds.width / 2)
  assert.throws(
    () => applyHeatmap(fixture, { 'context/gateway': 1 }, { sizeScale: { min: 0.1, max: 3 } }),
    /sizeScale.*bounded/i
  )
})

test('canonical mutators round-trip through validated multi-page Draw.io and restore stable links', async () => {
  const roundTripFixture = structuredClone(fixture)
  delete roundTripFixture.pages[0].meta.adapter
  for (const object of roundTripFixture.pages[0].nodes) delete object.identity
  for (const object of roundTripFixture.pages[0].edges) delete object.identity
  const outputs = [
    applyRelabel(roundTripFixture, { 'context/gateway': 'Gateway round-trip', 'detail/gateway': 'Detail round-trip' }),
    applyRestyle(roundTripFixture, 'corporate'),
    applyHeatmap(roundTripFixture, { 'context/gateway': 1, 'detail/gateway': 2 }, { palette: 'heat' })
  ]

  for (const output of outputs) {
    const drawio = await renderDocumentFile(output, { silent: true })
    assert.equal(validateDrawioDocument(drawio).valid, true)
    const imported = drawioToDocumentSpec(drawio)
    assert.deepEqual(imported.pages.map((page) => page.id), ['context', 'detail'])
    assert.deepEqual(imported.pages.map((page) => page.nodes[0].id), ['gateway', 'gateway'])
    assert.deepEqual(imported.links, roundTripFixture.links)
    assert.equal(serializeDocumentSpecYaml(imported).includes('schemaVersion: 1'), true)
  }
})

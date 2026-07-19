import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { applyAutoLayout } from '../dsl/auto-layout.js'
import { specToDrawioXml, validateSpec, validateXml } from '../dsl/spec-to-drawio.js'
import { parseRasterExtraction } from './raster-extraction.js'

test('raster extraction maps explicit geometry and styles to one canonical spec', () => {
  const source = JSON.stringify({
    schemaVersion: 1,
    canvas: { width: 1200, height: 800, background: '#FFFFFF' },
    nodes: [
      {
        id: 'api',
        label: 'API Gateway',
        shape: 'rounded',
        x: 120,
        y: 80,
        w: 180,
        h: 64,
        fill: '#DAE8FC',
        stroke: '#6C8EBF',
        fontSize: 18,
        fontColor: '#1F2937'
      },
      { id: 'db', label: 'Orders', shape: 'cylinder', x: 420, y: 80, w: 140, h: 80 }
    ],
    edges: [
      {
        id: 'api-db',
        source: 'api',
        target: 'db',
        label: 'SQL',
        dashed: true,
        arrow: false,
        stroke: '#334155',
        waypoints: [{ x: 340, y: 112 }],
        labelOffset: { x: 0, y: -16 }
      }
    ]
  })

  assert.deepEqual(parseRasterExtraction(source), {
    meta: {
      source: 'replicated',
      layout: 'hierarchical',
      canvas: '1200x800',
      replication: { colorMode: 'preserve-original', background: '#FFFFFF' }
    },
    nodes: [
      {
        id: 'api',
        label: 'API Gateway',
        type: 'service',
        bounds: { x: 120, y: 80, width: 180, height: 64 },
        style: {
          fillColor: '#DAE8FC',
          strokeColor: '#6C8EBF',
          fontSize: 18,
          fontColor: '#1F2937'
        }
      },
      {
        id: 'db',
        label: 'Orders',
        type: 'database',
        bounds: { x: 420, y: 80, width: 140, height: 80 }
      }
    ],
    edges: [
      {
        id: 'api-db',
        from: 'api',
        to: 'db',
        label: 'SQL',
        style: { dashed: true, endArrow: 'none', strokeColor: '#334155' },
        waypoints: [{ x: 340, y: 112 }],
        labelOffset: { x: 0, y: -16 }
      }
    ],
    modules: []
  })
})

test('raster extraction rejects control characters with adapter path evidence', () => {
  const source = '{"schemaVersion":1,"nodes":[{"id":"node","label":"bad\\u0000label","shape":"rect"}],"edges":[]}'

  assert.throws(
    () => parseRasterExtraction(source),
    (error) =>
      error.code === 'ADAPTER_PARSE' &&
      error.adapter === 'raster-extraction' &&
      error.path === 'nodes[0].label' &&
      /control characters/.test(error.message)
  )
})

test('raster extraction rejects raw HTML labels at the adapter boundary', () => {
  const source = JSON.stringify({
    schemaVersion: 1,
    nodes: [{ id: 'node', label: '<script>alert(1)</script>', shape: 'rect' }],
    edges: []
  })

  assert.throws(
    () => parseRasterExtraction(source),
    (error) =>
      error.code === 'ADAPTER_PARSE' &&
      error.path === 'nodes[0].label' &&
      /HTML/.test(error.message)
  )
})

test('raster extraction drops all source bounds when any node has no geometry', async () => {
  const source = JSON.stringify({
    schemaVersion: 1,
    nodes: [
      { id: 'placed', label: 'Placed', shape: 'rect', x: 10, y: 20, w: 120, h: 60 },
      { id: 'unplaced', label: 'Unplaced', shape: 'rect' }
    ],
    edges: [{ id: 'edge', source: 'placed', target: 'unplaced' }]
  })

  const spec = parseRasterExtraction(source)
  assert.ok(spec.nodes.every((node) => node.bounds == null))
  const layout = await applyAutoLayout(spec)
  assert.equal(layout.applied, true)
  assert.ok(layout.spec.nodes.every((node) => node.bounds != null))
})

test('raster extraction fixture uses the canonical ELK and renderer pipeline deterministically', async () => {
  const source = readFileSync(new URL('./fixtures/raster-extraction.json', import.meta.url), 'utf8')
  const render = async () => {
    const spec = parseRasterExtraction(source)
    validateSpec(spec)
    assert.ok(spec.nodes.every((node) => node.bounds == null))
    const layout = await applyAutoLayout(spec)
    assert.equal(layout.applied, true)
    assert.ok(layout.spec.nodes.every((node) => node.bounds != null))
    const xml = specToDrawioXml(layout.spec)
    assert.deepEqual(validateXml(xml), { valid: true, errors: [], warnings: [] })
    assert.doesNotMatch(xml, /Source & ingress/)
    assert.match(xml, /Source &amp; ingress/)
    return xml
  }

  assert.equal(await render(), await render())
})

test('raster extraction rejects malformed, ambiguous, or unsafe records', () => {
  const valid = {
    schemaVersion: 1,
    nodes: [{ id: 'node', label: 'Node', shape: 'rect' }],
    edges: []
  }
  const cases = [
    {
      name: 'unsupported version',
      value: { ...valid, schemaVersion: 2 },
      code: 'ADAPTER_UNSUPPORTED',
      path: 'schemaVersion'
    },
    {
      name: 'unknown root field',
      value: { ...valid, image: 'data:image/png;base64,AAAA' },
      code: 'ADAPTER_PARSE',
      path: 'raster-extraction.image'
    },
    {
      name: 'partial geometry',
      value: { ...valid, nodes: [{ ...valid.nodes[0], x: 1 }] },
      code: 'ADAPTER_PARSE',
      path: 'nodes[0]'
    },
    {
      name: 'oversize geometry',
      value: {
        ...valid,
        nodes: [{ ...valid.nodes[0], x: 0, y: 0, w: 100001, h: 60 }]
      },
      code: 'ADAPTER_PARSE',
      path: 'nodes[0].w'
    },
    {
      name: 'unsafe node id',
      value: { ...valid, nodes: [{ ...valid.nodes[0], id: '../node' }] },
      code: 'ADAPTER_PARSE',
      path: 'nodes[0].id'
    },
    {
      name: 'duplicate node id',
      value: { ...valid, nodes: [valid.nodes[0], valid.nodes[0]] },
      code: 'ADAPTER_PARSE',
      path: 'nodes[1].id'
    },
    {
      name: 'unknown shape',
      value: { ...valid, nodes: [{ ...valid.nodes[0], shape: 'image' }] },
      code: 'ADAPTER_PARSE',
      path: 'nodes[0].shape'
    },
    {
      name: 'unknown canonical type',
      value: { ...valid, nodes: [{ id: 'node', label: 'Node', type: 'not-a-type' }] },
      code: 'ADAPTER_PARSE',
      path: 'nodes[0].type'
    },
    {
      name: 'raw style field',
      value: { ...valid, nodes: [{ ...valid.nodes[0], style: 'shape=image;image=data:image/png;base64,AAAA' }] },
      code: 'ADAPTER_PARSE',
      path: 'nodes[0].style'
    },
    {
      name: 'invalid color',
      value: { ...valid, nodes: [{ ...valid.nodes[0], fill: 'url(javascript:alert(1))' }] },
      code: 'ADAPTER_PARSE',
      path: 'nodes[0].fill'
    },
    {
      name: 'opaque text',
      value: { ...valid, nodes: [{ id: 'node', label: 'Note', shape: 'text', fill: '#FFFFFF' }] },
      code: 'ADAPTER_PARSE',
      path: 'nodes[0].fill'
    },
    {
      name: 'dangling edge',
      value: {
        ...valid,
        edges: [{ id: 'edge', source: 'node', target: 'missing' }]
      },
      code: 'ADAPTER_PARSE',
      path: 'edges[0].target'
    },
    {
      name: 'duplicate edge id',
      value: {
        ...valid,
        edges: [
          { id: 'edge', source: 'node', target: 'node' },
          { id: 'edge', source: 'node', target: 'node' }
        ]
      },
      code: 'ADAPTER_PARSE',
      path: 'edges[1].id'
    },
    {
      name: 'oversize canvas',
      value: { ...valid, canvas: { width: 100001, height: 100 } },
      code: 'ADAPTER_PARSE',
      path: 'canvas.width'
    },
    {
      name: 'too many nodes',
      value: {
        ...valid,
        nodes: Array.from({ length: 101 }, (_, index) => ({
          id: `node${index}`,
          label: `Node ${index}`,
          shape: 'rect'
        }))
      },
      code: 'ADAPTER_PARSE',
      path: 'nodes'
    },
    {
      name: 'too many edges',
      value: {
        ...valid,
        edges: Array.from({ length: 201 }, (_, index) => ({
          id: `edge${index}`,
          source: 'node',
          target: 'node'
        }))
      },
      code: 'ADAPTER_PARSE',
      path: 'edges'
    }
  ]

  for (const fixture of cases) {
    assert.throws(
      () => parseRasterExtraction(JSON.stringify(fixture.value)),
      (error) => error.code === fixture.code && error.path === fixture.path,
      fixture.name
    )
  }

  assert.throws(
    () => parseRasterExtraction('{not json'),
    (error) => error.code === 'ADAPTER_PARSE' && error.adapter === 'raster-extraction'
  )
  assert.throws(
    () =>
      parseRasterExtraction(
        '{"schemaVersion":1,"nodes":[{"id":"node","label":"Node","shape":"rect","__proto__":{}}],"edges":[]}'
      ),
    (error) => error.code === 'ADAPTER_PARSE' && /nodes\[0\].*forbidden key/.test(error.message)
  )
  assert.throws(
    () =>
      parseRasterExtraction(
        '{"schemaVersion":1,"nodes":[{"id":"node","label":"Node","shape":"rect","x":0,"y":0,"w":1e309,"h":1}],"edges":[]}'
      ),
    (error) => error.code === 'ADAPTER_PARSE' && error.path === 'nodes[0].w'
  )
})

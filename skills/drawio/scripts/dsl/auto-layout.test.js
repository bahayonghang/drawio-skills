/**
 * auto-layout.test.js
 * Unit tests for the elkjs-backed auto-layout pre-pass
 */

import { describe, it } from 'node:test'
import assert from 'node:assert'
import { applyAutoLayout, buildElkGraph, canAutoLayout, convertElkResult, hasExplicitPosition } from './auto-layout.js'
import {
  calculateLayout,
  computeLayoutQualityMetrics,
  loadTheme,
  specToDrawioXml,
  validateEdgeQuality
} from './spec-to-drawio.js'

const WORKFLOW_SPEC = {
  meta: { title: 'Auto workflow', layout: 'hierarchical' },
  modules: [
    { id: 'prep', label: 'Preparation' },
    { id: 'delivery', label: 'Delivery' }
  ],
  nodes: [
    { id: 'start', label: 'Start', type: 'terminal' },
    { id: 'validate', label: 'Validate', module: 'prep' },
    { id: 'enrich_a', label: 'Enrich A', module: 'prep' },
    { id: 'enrich_b', label: 'Enrich B', module: 'prep' },
    { id: 'merge', label: 'Merge', module: 'prep' },
    { id: 'transform', label: 'Transform' },
    { id: 'review', label: 'Review' },
    { id: 'approve', label: 'Auto Approve' },
    { id: 'publish', label: 'Publish', module: 'delivery' },
    { id: 'notify', label: 'Notify', module: 'delivery' },
    { id: 'archive', label: 'Archive', module: 'delivery' },
    { id: 'end', label: 'End', type: 'terminal' }
  ],
  edges: [
    { from: 'start', to: 'validate' },
    { from: 'validate', to: 'enrich_a' },
    { from: 'validate', to: 'enrich_b' },
    { from: 'enrich_a', to: 'merge' },
    { from: 'enrich_b', to: 'merge' },
    { from: 'merge', to: 'transform' },
    { from: 'transform', to: 'review' },
    { from: 'transform', to: 'approve' },
    { from: 'review', to: 'publish' },
    { from: 'approve', to: 'publish' },
    { from: 'publish', to: 'notify' },
    { from: 'publish', to: 'archive' },
    { from: 'notify', to: 'end' },
    { from: 'archive', to: 'end' }
  ]
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

describe('auto-layout gate', () => {
  it('accepts fully unpositioned hierarchical specs', () => {
    assert.equal(canAutoLayout(WORKFLOW_SPEC), true)
  })

  it('rejects non-hierarchical layouts', () => {
    assert.equal(canAutoLayout({ ...WORKFLOW_SPEC, meta: { layout: 'horizontal' } }), false)
    assert.equal(canAutoLayout({ ...WORKFLOW_SPEC, meta: {} }), false)
  })

  it('rejects specs with any explicit bounds or position', () => {
    const withBounds = {
      ...WORKFLOW_SPEC,
      nodes: [
        { ...WORKFLOW_SPEC.nodes[0], bounds: { x: 0, y: 0, width: 100, height: 40 } },
        ...WORKFLOW_SPEC.nodes.slice(1)
      ]
    }
    assert.equal(canAutoLayout(withBounds), false)
    const withPosition = {
      ...WORKFLOW_SPEC,
      nodes: [{ ...WORKFLOW_SPEC.nodes[0], position: { x: 10, y: 10 } }, ...WORKFLOW_SPEC.nodes.slice(1)]
    }
    assert.equal(canAutoLayout(withPosition), false)
    assert.equal(hasExplicitPosition({ id: 'n', bounds: { x: 0, y: 0, width: 1, height: 1 } }), true)
    assert.equal(hasExplicitPosition({ id: 'n' }), false)
  })
})

describe('buildElkGraph', () => {
  it('maps modules to compound containers with padding and membership', () => {
    const graph = buildElkGraph(WORKFLOW_SPEC)
    const prep = graph.children.find((child) => child.id === 'prep')
    assert.ok(prep, 'prep container exists')
    assert.match(prep.layoutOptions['elk.padding'], /top=56/)
    assert.deepEqual(prep.children.map((child) => child.id).sort(), ['enrich_a', 'enrich_b', 'merge', 'validate'])
    const topIds = graph.children.map((child) => child.id)
    assert.ok(topIds.includes('start') && topIds.includes('transform'))
    assert.ok(graph.children.every((child) => child.children?.length || (child.width > 0 && child.height > 0)))
  })

  it('drops empty modules and keeps orphan-module nodes at top level', () => {
    const spec = {
      meta: { layout: 'hierarchical' },
      modules: [{ id: 'ghost', label: 'Ghost' }],
      nodes: [{ id: 'a', label: 'A', module: 'missing' }],
      edges: []
    }
    const graph = buildElkGraph(spec)
    assert.deepEqual(
      graph.children.map((child) => child.id),
      ['a']
    )
  })

  it('filters self-loops and dangling edges while keeping original indices', () => {
    const spec = {
      meta: { layout: 'hierarchical' },
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' }
      ],
      edges: [
        { from: 'a', to: 'ghost' },
        { from: 'a', to: 'a' },
        { from: 'a', to: 'b' }
      ]
    }
    const graph = buildElkGraph(spec)
    assert.deepEqual(
      graph.edges.map((edge) => edge.id),
      ['e2']
    )
  })
})

describe('convertElkResult', () => {
  it('resolves absolute bounds through nested containers and offsets waypoints by edge container', () => {
    const spec = {
      meta: { layout: 'hierarchical' },
      modules: [{ id: 'mod', label: 'M' }],
      nodes: [
        { id: 'leaf', label: 'L', module: 'mod' },
        { id: 'top', label: 'T' }
      ],
      edges: [{ from: 'leaf', to: 'top' }]
    }
    const result = {
      id: 'root',
      children: [
        {
          id: 'mod',
          x: 10,
          y: 20,
          children: [{ id: 'leaf', x: 5, y: 6, width: 100, height: 40 }]
        },
        { id: 'top', x: 200, y: 30, width: 80, height: 40 }
      ],
      edges: [
        {
          id: 'e0',
          container: 'mod',
          sections: [
            {
              bendPoints: [
                { x: 1, y: 2 },
                { x: 1.4, y: 2.4 }
              ]
            }
          ]
        }
      ]
    }
    const laid = convertElkResult(spec, result)
    assert.deepEqual(laid.nodes[0].bounds, { x: 55, y: 66, width: 100, height: 40 })
    assert.deepEqual(laid.nodes[1].bounds, { x: 240, y: 70, width: 80, height: 40 })
    assert.deepEqual(laid.edges[0].waypoints, [{ x: 51, y: 62 }])
  })
})

describe('applyAutoLayout', () => {
  it('lays out a 12-node branching workflow without overlaps, flowing left to right', async () => {
    const { spec: laid, applied, warning } = await applyAutoLayout(WORKFLOW_SPEC)
    assert.equal(applied, true)
    assert.equal(warning, undefined)
    for (const node of laid.nodes) {
      assert.ok(node.bounds, `node ${node.id} has bounds`)
    }
    for (let i = 0; i < laid.nodes.length; i++) {
      for (let j = i + 1; j < laid.nodes.length; j++) {
        assert.ok(
          !rectsOverlap(laid.nodes[i].bounds, laid.nodes[j].bounds),
          `${laid.nodes[i].id} overlaps ${laid.nodes[j].id}`
        )
      }
    }
    const boundsById = new Map(laid.nodes.map((node) => [node.id, node.bounds]))
    for (const edge of laid.edges) {
      const source = boundsById.get(edge.from)
      const target = boundsById.get(edge.to)
      assert.ok(
        source.x + source.width / 2 < target.x + target.width / 2,
        `edge ${edge.from}->${edge.to} flows left to right`
      )
    }
    assert.ok(
      laid.edges.some((edge) => edge.waypoints?.length),
      'orthogonal routing produced at least one waypointed edge'
    )
  })

  it('produces a spec that passes edge-quality validation and converts to XML', async () => {
    const { spec: laid } = await applyAutoLayout(WORKFLOW_SPEC)
    const theme = loadTheme('tech-blue')
    const layout = calculateLayout(laid, theme)
    assert.deepEqual(validateEdgeQuality(laid, layout), [])
    assert.equal(computeLayoutQualityMetrics(laid).edgeNodeCrossings, 0)
    const xml = specToDrawioXml(laid, { silent: true })
    assert.ok(xml.includes('<mxGraphModel'))
  })

  it('passes through specs that fail the gate', async () => {
    const explicit = {
      meta: { layout: 'horizontal' },
      nodes: [{ id: 'a', label: 'A' }],
      edges: []
    }
    const result = await applyAutoLayout(explicit)
    assert.equal(result.applied, false)
    assert.equal(result.spec, explicit)
    assert.equal(result.warning, undefined)
  })

  it('degrades with a warning when the engine is unavailable or fails', async () => {
    const unavailable = await applyAutoLayout(WORKFLOW_SPEC, { elk: null })
    assert.equal(unavailable.applied, false)
    assert.match(unavailable.warning, /unavailable/)
    assert.equal(unavailable.spec, WORKFLOW_SPEC)

    const failing = await applyAutoLayout(WORKFLOW_SPEC, {
      elk: {
        layout: async () => {
          throw new Error('boom')
        }
      }
    })
    assert.equal(failing.applied, false)
    assert.match(failing.warning, /boom/)
    assert.equal(failing.spec, WORKFLOW_SPEC)
  })
})

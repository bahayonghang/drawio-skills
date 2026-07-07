# -*- coding: utf-8 -*-
"""Phase 1 tests: straight orthogonal routing suite appended to spec-to-drawio.test.js."""

import io

path = "skills/drawio/scripts/dsl/spec-to-drawio.test.js"
src = io.open(path, encoding="utf-8").read()

suite = """
describe('straight orthogonal routing', () => {
  function extractEdges(xml) {
    const edges = []
    const re = /<mxCell [^>]*style="([^"]*)"[^>]*edge="1"[^>]*>/g
    let match
    while ((match = re.exec(xml)) !== null) {
      const style = match[1]
      const get = (key) => {
        const found = new RegExp(`${key}=(-?[0-9.]+)`).exec(style)
        return found ? Number(found[1]) : undefined
      }
      edges.push({
        style,
        exitX: get('exitX'),
        exitY: get('exitY'),
        entryX: get('entryX'),
        entryY: get('entryY')
      })
    }
    return edges
  }

  it('aligns a vertical edge between different-width boxes into one straight line', () => {
    const spec = {
      meta: {},
      nodes: [
        { id: 'wide', label: 'Wide', bounds: { x: 80, y: 40, width: 880, height: 64 } },
        { id: 'narrow', label: 'Narrow', bounds: { x: 120, y: 280, width: 344, height: 64 } }
      ],
      edges: [{ from: 'narrow', to: 'wide' }]
    }
    const xml = specToDrawioXml(spec, { silent: true })
    const [edge] = extractEdges(xml)
    const absExit = 120 + edge.exitX * 344
    const absEntry = 80 + edge.entryX * 880
    assert.ok(Math.abs(absExit - absEntry) < 0.1, `expected collinear, delta=${Math.abs(absExit - absEntry)}`)
    assert.equal(absExit, 120 + 344 / 2)
    assert.equal(edge.exitY, 0)
    assert.equal(edge.entryY, 1)
  })

  it('keeps multiple edges into a wide bar aligned with each counterpart center', () => {
    const spec = {
      meta: {},
      nodes: [
        { id: 'bar', label: 'Bar', bounds: { x: 80, y: 400, width: 880, height: 56 } },
        { id: 'a', label: 'A', bounds: { x: 120, y: 560, width: 160, height: 48 } },
        { id: 'b', label: 'B', bounds: { x: 600, y: 560, width: 160, height: 48 } }
      ],
      edges: [
        { from: 'a', to: 'bar' },
        { from: 'b', to: 'bar' }
      ]
    }
    const xml = specToDrawioXml(spec, { silent: true })
    const edges = extractEdges(xml)
    const coords = []
    for (const [index, source] of [
      [0, { x: 120, width: 160 }],
      [1, { x: 600, width: 160 }]
    ]) {
      const edge = edges[index]
      const absExit = source.x + edge.exitX * source.width
      const absEntry = 80 + edge.entryX * 880
      assert.ok(Math.abs(absExit - absEntry) < 0.1, `edge ${index} not collinear`)
      assert.equal(absExit, source.x + source.width / 2)
      coords.push(absExit)
    }
    assert.ok(Math.abs(coords[0] - coords[1]) >= 30)
  })

  it('separates a bidirectional pair into two parallel straight lines', () => {
    const spec = {
      meta: {},
      nodes: [
        { id: 'top', label: 'Top', bounds: { x: 100, y: 0, width: 300, height: 60 } },
        { id: 'bottom', label: 'Bottom', bounds: { x: 100, y: 240, width: 300, height: 60 } }
      ],
      edges: [
        { from: 'top', to: 'bottom' },
        { from: 'bottom', to: 'top' }
      ]
    }
    const xml = specToDrawioXml(spec, { silent: true })
    const edges = extractEdges(xml)
    const downCoord = 100 + edges[0].exitX * 300
    const downEntry = 100 + edges[0].entryX * 300
    const upCoord = 100 + edges[1].exitX * 300
    const upEntry = 100 + edges[1].entryX * 300
    assert.ok(Math.abs(downCoord - downEntry) < 0.1, 'downward edge must stay straight')
    assert.ok(Math.abs(upCoord - upEntry) < 0.1, 'upward edge must stay straight')
    assert.ok(Math.abs(downCoord - upCoord) >= 29.9, `parallel pair too close: ${Math.abs(downCoord - upCoord)}`)
  })

  it('falls back to face slots when no collinear interval exists', () => {
    const spec = {
      meta: {},
      nodes: [
        { id: 'a', label: 'A', bounds: { x: 0, y: 0, width: 100, height: 60 } },
        { id: 'b', label: 'B', bounds: { x: 300, y: 200, width: 100, height: 60 } }
      ],
      edges: [{ from: 'a', to: 'b' }]
    }
    const xml = specToDrawioXml(spec, { silent: true })
    const [edge] = extractEdges(xml)
    assert.equal(edge.exitX, 1)
    assert.equal(edge.exitY, 0.5)
    assert.equal(edge.entryX, 0)
    assert.equal(edge.entryY, 0.5)
  })

  it('keeps explicit user connection points untouched', () => {
    const spec = {
      meta: {},
      nodes: [
        { id: 'wide', label: 'Wide', bounds: { x: 80, y: 40, width: 880, height: 64 } },
        { id: 'narrow', label: 'Narrow', bounds: { x: 120, y: 280, width: 344, height: 64 } }
      ],
      edges: [
        {
          from: 'narrow',
          to: 'wide',
          style: { exitX: 0.25, exitY: 0, entryX: 0.75, entryY: 1, exitDx: 0, exitDy: 0, entryDx: 0, entryDy: 0 }
        }
      ]
    }
    const xml = specToDrawioXml(spec, { silent: true })
    const [edge] = extractEdges(xml)
    assert.equal(edge.exitX, 0.25)
    assert.equal(edge.entryX, 0.75)
  })

  it('routes overlapping wide/narrow boxes vertically instead of through their bodies', () => {
    const spec = {
      meta: {},
      nodes: [
        { id: 'browser', label: 'Browser', bounds: { x: 80, y: 40, width: 880, height: 64 } },
        { id: 'web', label: 'Web', bounds: { x: 600, y: 280, width: 360, height: 64 } }
      ],
      edges: [{ from: 'browser', to: 'web' }]
    }
    const { warnings } = specToDrawioXml(spec, { silent: true, returnWarnings: true })
    const xml = specToDrawioXml(spec, { silent: true })
    const [edge] = extractEdges(xml)
    assert.equal(edge.exitY, 1, 'edge should leave the bottom face')
    assert.equal(edge.entryY, 0, 'edge should enter the top face')
    const segmentWarnings = warnings.filter((w) => String(w.message || w).includes('short final segment'))
    assert.equal(segmentWarnings.length, 0)
  })

  it('warns when explicit points bend an edge that could be straight', () => {
    const spec = {
      meta: {},
      nodes: [
        { id: 'top', label: 'Top', bounds: { x: 100, y: 0, width: 300, height: 60 } },
        { id: 'bottom', label: 'Bottom', bounds: { x: 100, y: 240, width: 300, height: 60 } }
      ],
      edges: [
        {
          from: 'top',
          to: 'bottom',
          style: { exitX: 0.2, exitY: 1, entryX: 0.8, entryY: 0, exitDx: 0, exitDy: 0, entryDx: 0, entryDy: 0 }
        }
      ]
    }
    const { warnings } = specToDrawioXml(spec, { silent: true, returnWarnings: true })
    const bendWarnings = warnings.filter((w) => String(w.message || w).includes('off a straight vertical line'))
    assert.equal(bendWarnings.length, 1)
  })
})
"""

io.open(path, "a", encoding="utf-8", newline="\n").write(suite)
print("tests appended OK")

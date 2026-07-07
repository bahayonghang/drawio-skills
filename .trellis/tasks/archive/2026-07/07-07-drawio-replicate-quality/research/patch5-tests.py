# -*- coding: utf-8 -*-
"""Phase 2+3 tests: transparency, arrow size, validateXml warnings, br labels, collisions."""

import io

path = "skills/drawio/scripts/dsl/spec-to-drawio.test.js"
src = io.open(path, encoding="utf-8").read()

suite = """
describe('replicate quality gates', () => {
  it('forces plain text nodes transparent even when the spec asks for white', () => {
    const spec = {
      meta: {},
      nodes: [
        {
          id: 'note',
          label: 'note',
          type: 'text',
          bounds: { x: 0, y: 0, width: 120, height: 40 },
          style: { fillColor: '#FFFFFF', strokeColor: '#FF0000' }
        }
      ],
      edges: []
    }
    const { xml, warnings } = specToDrawioXml(spec, { silent: true, returnWarnings: true })
    const styleMatch = /<mxCell[^>]*value="note"[^>]*style="([^"]*)"/.exec(xml)
    assert.ok(styleMatch, 'text cell should exist')
    assert.match(styleMatch[1], /fillColor=none/)
    assert.match(styleMatch[1], /strokeColor=none/)
    assert.match(styleMatch[1], /labelBackgroundColor=none/)
    assert.ok(!styleMatch[1].includes('overflow=hidden'), 'text nodes must not clip their content')
    const overrideWarnings = warnings.filter((w) => String(w.message || w).includes('always render transparent'))
    assert.equal(overrideWarnings.length, 2)
  })

  it('warns when text bounds are smaller than the content estimate', () => {
    const spec = {
      meta: {},
      nodes: [
        {
          id: 'clipped',
          label: '过程数据报表汇总说明',
          type: 'text',
          bounds: { x: 0, y: 0, width: 40, height: 16 }
        }
      ],
      edges: []
    }
    const { warnings } = specToDrawioXml(spec, { silent: true, returnWarnings: true })
    const clipWarnings = warnings.filter((w) => String(w.message || w).includes('smaller than the estimated content size'))
    assert.equal(clipWarnings.length, 1)
  })

  it('adds a bold default endSize to block arrows and honors overrides', () => {
    const theme = loadTheme('tech-blue')
    const defaultStyle = generateConnectorStyle({ from: 'a', to: 'b' }, theme)
    assert.match(defaultStyle, /endArrow=block/)
    assert.match(defaultStyle, /endSize=12/)
    const overridden = generateConnectorStyle({ from: 'a', to: 'b', style: { endSize: 6 } }, theme)
    assert.match(overridden, /endSize=6/)
  })

  it('converts label newlines to <br> so vertical CJK labels survive XML attributes', () => {
    const spec = {
      meta: {},
      nodes: [
        { id: 'v', label: '可\\n视\\n化', type: 'text', bounds: { x: 0, y: 0, width: 32, height: 80 } },
        { id: 'a', label: 'A', bounds: { x: 100, y: 200, width: 80, height: 40 } },
        { id: 'b', label: 'B', bounds: { x: 100, y: 400, width: 80, height: 40 } }
      ],
      edges: [{ from: 'a', to: 'b', label: '上\\n位' }]
    }
    const xml = specToDrawioXml(spec, { silent: true })
    assert.ok(xml.includes('可&lt;br&gt;视&lt;br&gt;化'), 'node label newlines become <br>')
    assert.ok(xml.includes('上&lt;br&gt;位'), 'edge label newlines become <br>')
  })

  it('keeps math labels free of injected <br> tags', () => {
    const spec = {
      meta: {},
      nodes: [{ id: 'f', label: '$$a=b\\nc=d$$', type: 'formula', bounds: { x: 0, y: 0, width: 120, height: 60 } }],
      edges: []
    }
    const xml = specToDrawioXml(spec, { silent: true })
    assert.ok(!xml.includes('&lt;br&gt;'), 'math labels keep raw newlines')
  })

  it('reports floating edges and arrow-shape connectors as validateXml warnings', () => {
    const xml =
      '<mxGraphModel><root>' +
      '<mxCell id="0"/>' +
      '<mxCell id="1" parent="0"/>' +
      '<mxCell id="2" value="A" style="rounded=1" vertex="1" parent="1"><mxGeometry x="0" y="0" width="80" height="40" as="geometry"/></mxCell>' +
      '<mxCell id="3" value="" style="edgeStyle=orthogonalEdgeStyle" edge="1" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>' +
      '<mxCell id="4" value="" style="shape=singleArrow;fillColor=#000000" vertex="1" parent="1"><mxGeometry x="100" y="0" width="60" height="20" as="geometry"/></mxCell>' +
      '<mxCell id="5" value="t" style="text;html=1;fillColor=#FFFFFF" vertex="1" parent="1"><mxGeometry x="0" y="100" width="60" height="20" as="geometry"/></mxCell>' +
      '</root></mxGraphModel>'
    const result = validateXml(xml)
    assert.equal(result.valid, true)
    const floating = result.warnings.filter((w) => w.includes('not bound to nodes'))
    const arrowShapes = result.warnings.filter((w) => w.includes('arrow shape'))
    const whiteText = result.warnings.filter((w) => w.includes('white background'))
    assert.equal(floating.length, 1)
    assert.equal(arrowShapes.length, 1)
    assert.equal(whiteText.length, 1)
  })

  it('flags edge labels that sit on their own connector', () => {
    const spec = {
      meta: {},
      nodes: [
        { id: 'a', label: 'A', bounds: { x: 100, y: 0, width: 120, height: 40 } },
        { id: 'b', label: 'B', bounds: { x: 100, y: 300, width: 120, height: 40 } }
      ],
      edges: [{ from: 'a', to: 'b', label: '很长的水平标签文字', labelOffset: { x: 0, y: 0 } }]
    }
    const { warnings } = specToDrawioXml(spec, { silent: true, returnWarnings: true })
    const onLine = warnings.filter((w) => String(w.message || w).includes('sits on its own connector'))
    assert.equal(onLine.length, 1)
  })

  it('accepts none as an explicit transparent module fill', () => {
    const spec = {
      meta: {},
      modules: [{ id: 'm', label: 'M', style: { fillColor: 'none', strokeColor: '#000000' } }],
      nodes: [{ id: 'a', label: 'A', module: 'm', bounds: { x: 0, y: 0, width: 80, height: 40 } }],
      edges: []
    }
    const { warnings } = specToDrawioXml(spec, { silent: true, returnWarnings: true })
    const colorWarnings = warnings.filter((w) => String(w.message || w).includes('Invalid color "none"'))
    assert.equal(colorWarnings.length, 0)
  })
})
"""

io.open(path, "a", encoding="utf-8", newline="\n").write(suite)
print("phase2+3 tests appended OK")

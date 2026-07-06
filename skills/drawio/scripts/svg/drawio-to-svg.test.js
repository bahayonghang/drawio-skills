/**
 * drawio-to-svg.test.js
 * Unit tests for the draw.io XML to SVG converter
 * Uses Node.js built-in test runner
 */

import { describe, it } from 'node:test'
import assert from 'node:assert'
import { drawioToSvg } from './drawio-to-svg.js'

// ============================================================================
// Test Fixtures
// ============================================================================

const BASIC_TWO_NODES_ONE_EDGE = `
<mxGraphModel dx="0" dy="0" pageWidth="800" pageHeight="600">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Node A" style="rounded=1;fillColor=#DBEAFE;strokeColor=#2563EB;" vertex="1" parent="1">
      <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="Node B" style="rounded=1;fillColor=#D1FAE5;strokeColor=#059669;" vertex="1" parent="1">
      <mxGeometry x="400" y="100" width="120" height="60" as="geometry"/>
    </mxCell>
    <mxCell id="4" style="endArrow=block;" edge="1" source="2" target="3" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const SERVICE_NODE = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="API Gateway" style="rounded=1;fillColor=#DBEAFE;strokeColor=#2563EB;" vertex="1" parent="1">
      <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const DATABASE_NODE = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="PostgreSQL" style="shape=cylinder3;fillColor=#D1FAE5;strokeColor=#059669;" vertex="1" parent="1">
      <mxGeometry x="100" y="100" width="100" height="80" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const EDGE_WITH_BLOCK_ARROW = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="A" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="50" y="50" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="B" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="250" y="50" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="4" style="endArrow=block;" edge="1" source="2" target="3" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const NODE_WITH_LABEL = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Hello" style="rounded=0;" vertex="1" parent="1">
      <mxGeometry x="50" y="50" width="100" height="50" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const NODE_WITH_COLOR = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Red Box" style="fillColor=#FF0000;strokeColor=#CC0000;" vertex="1" parent="1">
      <mxGeometry x="50" y="50" width="100" height="50" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const SWITCH_NODE = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Core Switch" style="shape=switch;fillColor=#DBEAFE;strokeColor=#2563EB;" vertex="1" parent="1">
      <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const LOAD_BALANCER_NODE = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Reverse Proxy" style="shape=hexagon;perimeter=hexagonPerimeter2;fillColor=#DBEAFE;strokeColor=#2563EB;" vertex="1" parent="1">
      <mxGeometry x="100" y="100" width="140" height="80" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const FIREWALL_NODE = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Firewall" style="shape=mxgraph.cisco.security.firewall;fillColor=#FDE68A;strokeColor=#B45309;" vertex="1" parent="1">
      <mxGeometry x="100" y="100" width="120" height="80" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const AP_NODE = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Wireless AP" style="shape=mxgraph.cisco.misc.access_point;fillColor=#DBEAFE;strokeColor=#2563EB;" vertex="1" parent="1">
      <mxGeometry x="100" y="100" width="100" height="100" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const EDGE_WITH_START_ARROW = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="X" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="50" y="50" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="Y" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="250" y="50" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="4" style="startArrow=diamond;endArrow=block;" edge="1" source="2" target="3" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const MULTI_EDGE_TRIANGLE = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="A" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="50" y="50" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="B" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="250" y="50" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="4" value="C" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="150" y="200" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="5" style="endArrow=block;" edge="1" source="2" target="3" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
    <mxCell id="6" style="endArrow=block;" edge="1" source="3" target="4" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
    <mxCell id="7" style="endArrow=block;" edge="1" source="4" target="2" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const MODULE_WITH_CHILD = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Module" style="rounded=1;fillColor=#F8FAFC;strokeColor=#E2E8F0;" vertex="1" parent="1">
      <mxGeometry x="20" y="20" width="300" height="200" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="Child Node" style="rounded=1;fillColor=#DBEAFE;strokeColor=#2563EB;" vertex="1" parent="2">
      <mxGeometry x="40" y="60" width="120" height="60" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const EDGE_WITH_OPEN_ARROW = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="X" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="50" y="50" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="Y" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="250" y="50" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="4" style="endArrow=open;" edge="1" source="2" target="3" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const EDGE_WITH_NO_ARROW = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="P" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="50" y="50" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="Q" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="250" y="50" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="4" style="endArrow=none;" edge="1" source="2" target="3" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const EDGE_WITH_LABEL = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Src" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="50" y="50" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="Dst" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="250" y="50" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="4" value="connects" style="endArrow=block;" edge="1" source="2" target="3" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

// ============================================================================
// Tests
// ============================================================================

describe('drawioToSvg', () => {
  it('should convert basic 2-node 1-edge diagram to SVG', () => {
    const svg = drawioToSvg(BASIC_TWO_NODES_ONE_EDGE)
    assert.ok(svg.startsWith('<svg'), 'Output should start with <svg')
    assert.ok(svg.includes('</svg>'), 'Output should contain closing </svg>')
  })

  it('should render service node as rounded rect', () => {
    const svg = drawioToSvg(SERVICE_NODE)
    assert.ok(svg.includes('<rect'), 'Service node should produce a <rect element')
    assert.ok(svg.includes('rx='), 'Rounded rect should have rx attribute')
  })

  it('should render database shape as cylinder with ellipse', () => {
    const svg = drawioToSvg(DATABASE_NODE)
    assert.ok(
      svg.includes('<ellipse') || svg.includes('<path'),
      'Database/cylinder shape should contain <ellipse or <path'
    )
  })

  it('should render edges between nodes', () => {
    const svg = drawioToSvg(BASIC_TWO_NODES_ONE_EDGE)
    assert.ok(svg.includes('<line') || svg.includes('<path'), 'Edge should produce a <line or <path element')
  })

  it('should include arrow marker definition for endArrow=block', () => {
    const svg = drawioToSvg(EDGE_WITH_BLOCK_ARROW)
    assert.ok(svg.includes('<marker'), 'Output should contain <marker for arrow definition')
    assert.ok(svg.includes('arrow-block'), 'Output should contain arrow-block marker id')
  })

  it('should render text label from node value', () => {
    const svg = drawioToSvg(NODE_WITH_LABEL)
    assert.ok(svg.includes('>Hello<'), 'Output should contain the label text Hello')
  })

  it('should apply fill color from style', () => {
    const svg = drawioToSvg(NODE_WITH_COLOR)
    assert.ok(
      svg.includes('fill="#FF0000"') || svg.includes('fill: #FF0000'),
      'Output should contain the fill color #FF0000'
    )
  })

  it('should embed original XML as data-drawio attribute', () => {
    const svg = drawioToSvg(SERVICE_NODE)
    assert.ok(svg.includes('data-drawio='), 'Output should contain data-drawio attribute')
  })

  it('should throw on empty input', () => {
    assert.throws(() => drawioToSvg(''), Error, 'Empty string should throw Error')
    assert.throws(() => drawioToSvg('   '), Error, 'Whitespace-only string should throw Error')
  })

  it('should include marker-start when startArrow is specified', () => {
    const svg = drawioToSvg(EDGE_WITH_START_ARROW)
    assert.ok(svg.includes('marker-start'), 'Output should contain marker-start attribute when startArrow is set')
  })

  // --- Multi-edge and arrow type tests ---

  it('should render multi-edge diagram with 3+ edges', () => {
    const svg = drawioToSvg(MULTI_EDGE_TRIANGLE)
    assert.ok(svg.startsWith('<svg'), 'Output should start with <svg')
    const edgeMatches = svg.match(/<(line|path)\b/g) || []
    assert.ok(edgeMatches.length >= 3, `Should have at least 3 edge elements, found ${edgeMatches.length}`)
  })

  it('should render module/container and child node', () => {
    const svg = drawioToSvg(MODULE_WITH_CHILD)
    assert.ok(svg.includes('Module'), 'Output should contain module label')
    assert.ok(svg.includes('Child Node'), 'Output should contain child node label')
  })

  it('should handle open arrow type', () => {
    const svg = drawioToSvg(EDGE_WITH_OPEN_ARROW)
    assert.ok(svg.includes('<marker'), 'Output should contain marker for arrow')
    assert.ok(svg.includes('arrow-open'), 'Output should contain arrow-open marker id')
  })

  it('should handle none arrow type (no marker-end)', () => {
    const svg = drawioToSvg(EDGE_WITH_NO_ARROW)
    assert.ok(svg.startsWith('<svg'), 'Output should start with <svg')
    assert.ok(!svg.includes('marker-end'), 'endArrow=none should not produce marker-end attribute')
  })

  it('should render edge label text', () => {
    const svg = drawioToSvg(EDGE_WITH_LABEL)
    assert.ok(svg.includes('>connects<'), 'Output should contain the edge label text')
  })

  // --- Shape type rendering tests ---

  it('should render rhombus shape as <polygon>', () => {
    const xml = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Decision" style="rhombus;fillColor=#FEF9C3;strokeColor=#CA8A04;" vertex="1" parent="1">
      <mxGeometry x="100" y="100" width="120" height="80" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`
    const svg = drawioToSvg(xml)
    assert.ok(svg.includes('<polygon'), 'Rhombus shape should render as <polygon>')
  })

  it('should render ellipse shape as <ellipse>', () => {
    const xml = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Oval" style="ellipse;fillColor=#DBEAFE;strokeColor=#2563EB;" vertex="1" parent="1">
      <mxGeometry x="100" y="100" width="120" height="80" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`
    const svg = drawioToSvg(xml)
    assert.ok(svg.includes('<ellipse'), 'Ellipse shape should render as <ellipse>')
  })

  it('should render roundedRect with rx attribute on <rect>', () => {
    const xml = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Box" style="rounded=1;fillColor=#DBEAFE;strokeColor=#2563EB;" vertex="1" parent="1">
      <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`
    const svg = drawioToSvg(xml)
    assert.ok(svg.includes('<rect'), 'Rounded rect should render as <rect>')
    assert.ok(svg.includes('rx='), 'Rounded rect should have rx attribute')
  })

  it('should render cylinder shape with <ellipse> elements', () => {
    const svg = drawioToSvg(DATABASE_NODE)
    assert.ok(svg.includes('<ellipse'), 'Cylinder shape should contain <ellipse> for top/bottom caps')
  })

  it('should render switch shapes without falling back to plain rectangles', () => {
    const svg = drawioToSvg(SWITCH_NODE)
    assert.ok(svg.includes('<path'), 'Switch shape should render as a path-based stencil')
  })

  it('should render load balancer hexagons as polygons', () => {
    const svg = drawioToSvg(LOAD_BALANCER_NODE)
    assert.ok(svg.includes('<polygon'), 'Hexagon shape should render as <polygon>')
  })

  it('should render firewall stencils as composed SVG shapes', () => {
    const svg = drawioToSvg(FIREWALL_NODE)
    const pathCount = (svg.match(/<path\b/g) || []).length
    assert.ok(pathCount >= 2, 'Firewall shape should render multiple path elements')
  })

  it('should render wireless access points with antenna arcs', () => {
    const svg = drawioToSvg(AP_NODE)
    assert.ok(svg.includes('<ellipse'), 'AP shape should include a base ellipse')
    assert.ok(svg.includes('<path'), 'AP shape should include antenna arcs')
  })

  it('should render edge as <line> element', () => {
    const svg = drawioToSvg(EDGE_WITH_BLOCK_ARROW)
    assert.ok(svg.includes('<line'), 'Edge should render as <line> element')
  })

  it('should render standalone text cells without drawing a surrounding rectangle', () => {
    const xml = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="World Model" style="text;html=1;align=left;verticalAlign=top;fontFamily=Times New Roman, serif;fontSize=16;fontStyle=2;spacingLeft=4;spacingTop=2;" vertex="1" parent="1">
      <mxGeometry x="24" y="32" width="180" height="36" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`
    const svg = drawioToSvg(xml)
    assert.ok(!svg.includes('<rect x="24" y="32"'), 'Text-only cells should not draw a shape rectangle')
    assert.ok(svg.includes('text-anchor="start"'), 'Text-only cells should honor left alignment')
    assert.ok(svg.includes('font-style="italic"'), 'Text-only cells should honor italic font style')
  })

  it('should render edgeLabel child cells using their explicit offset', () => {
    const xml = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="h" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="40" y="80" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="z" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="280" y="80" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="4" value="s(t)" style="endArrow=block;" edge="1" source="2" target="3" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
    <mxCell id="5" value="s(t)" style="edgeLabel;html=1;fontSize=11;fontColor=#64748B;" vertex="1" connectable="0" parent="4">
      <mxGeometry x="0.5" relative="1" as="geometry"><mxPoint x="0" y="-18" as="offset"/></mxGeometry>
    </mxCell>
  </root>
</mxGraphModel>`
    const svg = drawioToSvg(xml)
    assert.ok(svg.includes('x="200" y="82"'), 'Edge label should render at midpoint plus explicit offset')
    assert.equal((svg.match(/s\(t\)/g) || []).length, 1, 'Edge label should not be duplicated')
  })

  it('should render background color from graph attributes', () => {
    const xml = `
<mxGraphModel background="#E0F2FE">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Node" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="50" y="50" width="100" height="50" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`
    const svg = drawioToSvg(xml)
    assert.ok(svg.includes('fill="#E0F2FE"'), 'Background color should render as <rect> with matching fill')
  })

  it('should throw Error on null input', () => {
    assert.throws(() => drawioToSvg(null), Error, 'null input should throw Error')
  })

  it('should throw Error on non-string input', () => {
    assert.throws(() => drawioToSvg(42), Error, 'Number input should throw Error')
    assert.throws(() => drawioToSvg(undefined), Error, 'undefined input should throw Error')
  })
})

// ============================================================================
// Fidelity Fixtures: absolute coordinates, edge routing, multi-line labels
// ============================================================================

const TWO_MODULES_CROSS_EDGE = `
<mxGraphModel dx="0" dy="0" pageWidth="488" pageHeight="272">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Encoder Stack" style="rounded=1;fillColor=#FAFAFA;strokeColor=#1E1E1E;" vertex="1" parent="1">
      <mxGeometry x="40" y="40" width="168" height="152" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="Decoder Stack" style="rounded=1;fillColor=#FAFAFA;strokeColor=#1E1E1E;" vertex="1" parent="1">
      <mxGeometry x="240" y="40" width="168" height="152" as="geometry"/>
    </mxCell>
    <mxCell id="4" value="Encoder" style="rounded=1;" vertex="1" parent="2">
      <mxGeometry x="24" y="64" width="120" height="60" as="geometry"/>
    </mxCell>
    <mxCell id="5" value="Decoder" style="rounded=1;" vertex="1" parent="3">
      <mxGeometry x="24" y="64" width="120" height="60" as="geometry"/>
    </mxCell>
    <mxCell id="6" style="edgeStyle=orthogonalEdgeStyle;endArrow=block;exitX=1;exitY=0.25;exitDx=0;exitDy=0;entryX=0;entryY=0.25;entryDx=0;entryDy=0;" edge="1" parent="1" source="4" target="5">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const NESTED_TWO_LEVEL_CONTAINER = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Outer" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="20" y="20" width="400" height="300" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="Inner" style="rounded=1;" vertex="1" parent="2">
      <mxGeometry x="30" y="40" width="300" height="200" as="geometry"/>
    </mxCell>
    <mxCell id="4" value="Leaf" style="rounded=0;" vertex="1" parent="3">
      <mxGeometry x="10" y="10" width="100" height="50" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const EDGE_WITH_WAYPOINTS = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="A" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="40" y="80" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="B" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="280" y="80" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="4" style="endArrow=block;" edge="1" source="2" target="3" parent="1">
      <mxGeometry relative="1" as="geometry">
        <Array as="points">
          <mxPoint x="160" y="40"/>
          <mxPoint x="200" y="40"/>
          <mxPoint x="240" y="40"/>
        </Array>
      </mxGeometry>
    </mxCell>
  </root>
</mxGraphModel>`

const EDGE_WITH_CENTER_ANCHORS = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="A" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="40" y="40" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="B" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="240" y="40" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="4" style="endArrow=block;exitX=1;exitY=0.5;entryX=0;entryY=0.5;" edge="1" source="2" target="3" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const ORTHOGONAL_Z_EDGE = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="A" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="40" y="40" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="B" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="240" y="160" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="4" style="edgeStyle=orthogonalEdgeStyle;endArrow=block;exitX=1;exitY=0.5;entryX=0;entryY=0.5;" edge="1" source="2" target="3" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const ORTHOGONAL_BACKWARD_EDGE = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="A" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="240" y="40" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="B" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="40" y="40" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="4" style="edgeStyle=orthogonalEdgeStyle;endArrow=block;exitX=1;exitY=0.5;entryX=0;entryY=0.5;" edge="1" source="2" target="3" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const EIGHT_LINE_LEGEND = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Legend
Conv 3x3
BatchNorm
ReLU
MaxPool 2x2
Dropout 0.5
Dense 128
Softmax" style="text;html=1;align=left;verticalAlign=top;fontSize=12;" vertex="1" parent="1">
      <mxGeometry x="40" y="40" width="160" height="180" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const CUBE_NODE = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Tensor" style="shape=cube;size=10;direction=south;fillColor=#DBEAFE;strokeColor=#2563EB;" vertex="1" parent="1">
      <mxGeometry x="100" y="100" width="120" height="80" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

describe('drawioToSvg fidelity', () => {
  it('should place container children at absolute canvas coordinates', () => {
    const svg = drawioToSvg(MODULE_WITH_CHILD)
    assert.ok(svg.includes('<rect x="60" y="80"'), 'Child at (40,60) inside module at (20,20) should render at (60,80)')
  })

  it('should accumulate offsets across nested containers', () => {
    const svg = drawioToSvg(NESTED_TWO_LEVEL_CONTAINER)
    assert.ok(svg.includes('<rect x="60" y="70"'), 'Leaf should render at 20+30+10, 20+40+10')
  })

  it('should render cross-container edges with non-degenerate anchored endpoints', () => {
    const svg = drawioToSvg(TWO_MODULES_CROSS_EDGE)
    assert.ok(svg.includes('<rect x="64" y="104"'), 'Encoder child should be at absolute (64,104)')
    assert.ok(svg.includes('<rect x="264" y="104"'), 'Decoder child should be at absolute (264,104)')
    assert.ok(
      svg.includes('x1="184" y1="119" x2="264" y2="119"'),
      'Edge should run from source east anchor to target west boundary'
    )
  })

  it('should replay edge waypoints as a polyline path', () => {
    const svg = drawioToSvg(EDGE_WITH_WAYPOINTS)
    assert.ok(svg.includes('L 160 40 L 200 40 L 240 40'), 'Waypoints should appear as path segments in order')
  })

  it('should honor exit/entry anchors for straight edges', () => {
    const svg = drawioToSvg(EDGE_WITH_CENTER_ANCHORS)
    assert.ok(
      svg.includes('x1="120" y1="60" x2="240" y2="60"'),
      'Edge should run between the anchored border midpoints'
    )
  })

  it('should clip floating straight edges to node boundaries instead of centers', () => {
    const svg = drawioToSvg(EDGE_WITH_BLOCK_ARROW)
    assert.ok(svg.includes('x1="130" y1="70" x2="250" y2="70"'), 'Edge endpoints should sit on the facing node borders')
  })

  it('should approximate orthogonal edges with Z-shaped bends', () => {
    const svg = drawioToSvg(ORTHOGONAL_Z_EDGE)
    assert.ok(svg.includes('M 120 60 L 180 60 L 180 180 L 240 180'), 'Orthogonal edge should bend at the midpoint x')
  })

  it('should detour orthogonal backward edges around node bodies', () => {
    const svg = drawioToSvg(ORTHOGONAL_BACKWARD_EDGE)
    assert.ok(svg.includes('L 340 100 L 20 100'), 'Backward edge should detour below both nodes')
    const segments = (svg.match(/ L /g) || []).length
    assert.ok(segments >= 5, `Backward edge should have at least 5 segments, found ${segments}`)
  })

  it('should render multi-line labels as one tspan per line', () => {
    const svg = drawioToSvg(EIGHT_LINE_LEGEND)
    const tspans = (svg.match(/<tspan/g) || []).length
    assert.equal(tspans, 8, 'Eight-line legend should produce eight tspan rows')
    assert.ok(svg.includes('>MaxPool 2x2</tspan>'), 'Each line should keep its own text content')
  })

  it('should split labels on <br> tags into tspan rows', () => {
    const xml = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Alpha&lt;br&gt;Beta" style="rounded=1;fontSize=12;" vertex="1" parent="1">
      <mxGeometry x="40" y="40" width="120" height="60" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`
    const svg = drawioToSvg(xml)
    assert.ok(svg.includes('>Alpha</tspan>'), 'First br-separated line should render as tspan')
    assert.ok(svg.includes('>Beta</tspan>'), 'Second br-separated line should render as tspan')
  })

  it('should keep single-line labels as plain text without tspans', () => {
    const svg = drawioToSvg(NODE_WITH_LABEL)
    assert.ok(svg.includes('>Hello<'), 'Single-line label should stay inline')
    assert.ok(!svg.includes('<tspan'), 'Single-line label should not introduce tspans')
  })

  it('should render multi-line edge label children as tspans', () => {
    const xml = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="h" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="40" y="80" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="z" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="280" y="80" width="80" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="4" style="endArrow=block;" edge="1" source="2" target="3" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
    <mxCell id="5" value="eth0 - eth1
VLAN 10" style="edgeLabel;html=1;fontSize=11;" vertex="1" connectable="0" parent="4">
      <mxGeometry x="0.5" relative="1" as="geometry"><mxPoint x="0" y="-18" as="offset"/></mxGeometry>
    </mxCell>
  </root>
</mxGraphModel>`
    const svg = drawioToSvg(xml)
    assert.ok(svg.includes('>VLAN 10</tspan>'), 'Edge label lines should render as tspans')
  })

  it('should render cube shapes as extruded paths instead of plain rectangles', () => {
    const svg = drawioToSvg(CUBE_NODE)
    assert.ok(svg.includes('M 100 110 L 110 100'), 'Cube should start with its top-left extrusion diagonal')
    assert.ok(!svg.includes('<rect x="100" y="100"'), 'Cube should not fall back to a plain rectangle')
  })

  it('should expand the viewBox using absolute child coordinates', () => {
    const xml = `
<mxGraphModel dx="0" dy="0" pageWidth="200" pageHeight="150">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Box" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="100" y="60" width="400" height="200" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="Child" style="rounded=1;" vertex="1" parent="2">
      <mxGeometry x="350" y="150" width="120" height="60" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`
    const svg = drawioToSvg(xml)
    assert.ok(svg.includes('width="590"'), 'viewBox should cover the absolute child extent (100+350+120+20)')
  })
})

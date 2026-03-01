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
    assert.ok(
      svg.includes('<line') || svg.includes('<path'),
      'Edge should produce a <line or <path element'
    )
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
    assert.ok(
      svg.includes('marker-start'),
      'Output should contain marker-start attribute when startArrow is set'
    )
  })
})

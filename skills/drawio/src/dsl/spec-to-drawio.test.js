/**
 * spec-to-drawio.test.js
 * Unit tests for the Design System specification converter
 * Uses Node.js built-in test runner
 */

import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  specToDrawioXml,
  parseSpecYaml,
  detectSemanticType,
  getNodeSize,
  snapToGrid,
  calculateLayout,
  generateNodeStyle,
  generateConnectorStyle,
  generateModuleStyle,
  checkComplexity
} from './spec-to-drawio.js'

// ============================================================================
// Semantic Type Detection Tests
// ============================================================================

describe('detectSemanticType', () => {
  it('should return explicit type when provided', () => {
    assert.strictEqual(detectSemanticType('API Gateway', 'service'), 'service')
    assert.strictEqual(detectSemanticType('Users', 'database'), 'database')
  })

  it('should detect database from label keywords', () => {
    assert.strictEqual(detectSemanticType('User Database', null), 'database')
    assert.strictEqual(detectSemanticType('PostgreSQL', null), 'database')
    assert.strictEqual(detectSemanticType('Redis Cache', null), 'database')
    assert.strictEqual(detectSemanticType('Data Storage', null), 'database')
  })

  it('should detect decision from label keywords', () => {
    assert.strictEqual(detectSemanticType('Is Valid?', null), 'decision')
    assert.strictEqual(detectSemanticType('Check Condition', null), 'decision')
    assert.strictEqual(detectSemanticType('Decision Point', null), 'decision')
  })

  it('should detect terminal from label keywords', () => {
    assert.strictEqual(detectSemanticType('Start', null), 'terminal')
    assert.strictEqual(detectSemanticType('End Process', null), 'terminal')
    assert.strictEqual(detectSemanticType('Begin Flow', null), 'terminal')
  })

  it('should detect queue from label keywords', () => {
    assert.strictEqual(detectSemanticType('Message Queue', null), 'queue')
    assert.strictEqual(detectSemanticType('Kafka Topic', null), 'queue')
    assert.strictEqual(detectSemanticType('SQS Queue', null), 'queue')
  })

  it('should detect formula from delimiters', () => {
    assert.strictEqual(detectSemanticType('$$E = mc^2$$', null), 'formula')
    assert.strictEqual(detectSemanticType('Linear: \\(y = mx + b\\)', null), 'formula')
  })

  it('should default to service for unknown labels', () => {
    assert.strictEqual(detectSemanticType('API Gateway', null), 'service')
    assert.strictEqual(detectSemanticType('Unknown Component', null), 'service')
  })

  // Deep learning type detection tests
  it('should detect deep learning temporal types', () => {
    assert.strictEqual(detectSemanticType('LSTM Layer', null), 'temporal')
    assert.strictEqual(detectSemanticType('BiLSTM', null), 'temporal')
    assert.strictEqual(detectSemanticType('GRU Cell', null), 'temporal')
    assert.strictEqual(detectSemanticType('RNN Block', null), 'temporal')
  })

  it('should detect deep learning attention types', () => {
    assert.strictEqual(detectSemanticType('Self-Attention', null), 'attention')
    assert.strictEqual(detectSemanticType('Multi-Head Attention', null), 'attention')
    assert.strictEqual(detectSemanticType('Transformer Block', null), 'attention')
    assert.strictEqual(detectSemanticType('Softmax Layer', null), 'attention')
  })

  it('should detect deep learning feature extraction types', () => {
    assert.strictEqual(detectSemanticType('Feature Extractor', null), 'feature')
    assert.strictEqual(detectSemanticType('Encoder Block', null), 'feature')
    assert.strictEqual(detectSemanticType('Conv2D Layer', null), 'conv')
    assert.strictEqual(detectSemanticType('Convolutional Block', null), 'conv')
  })

  it('should detect deep learning normalization types', () => {
    assert.strictEqual(detectSemanticType('BatchNorm', null), 'norm')
    assert.strictEqual(detectSemanticType('LayerNorm', null), 'norm')
    assert.strictEqual(detectSemanticType('Normalization', null), 'norm')
  })

  it('should detect deep learning graph types', () => {
    assert.strictEqual(detectSemanticType('GCN Layer', null), 'graph')
    assert.strictEqual(detectSemanticType('Graph Conv', null), 'graph')
    assert.strictEqual(detectSemanticType('GNN Block', null), 'graph')
  })

  it('should detect deep learning matrix operation types', () => {
    assert.strictEqual(detectSemanticType('MatMul', null), 'matrix')
    assert.strictEqual(detectSemanticType('Linear Layer', null), 'matrix')
    assert.strictEqual(detectSemanticType('FC Layer', null), 'matrix')
    assert.strictEqual(detectSemanticType('Dense Layer', null), 'matrix')
  })

  it('should detect 3D tensor/feature map types', () => {
    assert.strictEqual(detectSemanticType('Feature Map', null), 'tensor3d')
    assert.strictEqual(detectSemanticType('Tensor 224×224×64', null), 'tensor3d')
    assert.strictEqual(detectSemanticType('NCHW', null), 'tensor3d')
    assert.strictEqual(detectSemanticType('Activation Map', null), 'tensor3d')
    assert.strictEqual(detectSemanticType('3D Block', null), 'tensor3d')
  })
})

// ============================================================================
// Grid Snapping Tests
// ============================================================================

describe('snapToGrid', () => {
  it('should snap values to 8px grid', () => {
    assert.strictEqual(snapToGrid(0), 0)
    assert.strictEqual(snapToGrid(4), 8)
    assert.strictEqual(snapToGrid(7), 8)
    assert.strictEqual(snapToGrid(8), 8)
    assert.strictEqual(snapToGrid(12), 16)
    assert.strictEqual(snapToGrid(100), 104)
  })

  it('should support custom grid sizes', () => {
    assert.strictEqual(snapToGrid(5, 10), 10)
    assert.strictEqual(snapToGrid(7, 4), 8)
  })
})

// ============================================================================
// Node Size Tests
// ============================================================================

describe('getNodeSize', () => {
  it('should return correct preset sizes', () => {
    assert.deepStrictEqual(getNodeSize('tiny'), { width: 32, height: 32 })
    assert.deepStrictEqual(getNodeSize('small'), { width: 80, height: 40 })
    assert.deepStrictEqual(getNodeSize('medium'), { width: 120, height: 60 })
    assert.deepStrictEqual(getNodeSize('large'), { width: 160, height: 80 })
    assert.deepStrictEqual(getNodeSize('xl'), { width: 200, height: 100 })
  })

  it('should return correct tensor3d preset sizes', () => {
    assert.deepStrictEqual(getNodeSize('tensor_sm'), { width: 40, height: 48 })
    assert.deepStrictEqual(getNodeSize('tensor_md'), { width: 60, height: 72 })
    assert.deepStrictEqual(getNodeSize('tensor_lg'), { width: 80, height: 96 })
    assert.deepStrictEqual(getNodeSize('tensor_xl'), { width: 100, height: 120 })
  })

  it('should default to medium for unknown sizes', () => {
    assert.deepStrictEqual(getNodeSize(), { width: 120, height: 60 })
    assert.deepStrictEqual(getNodeSize('unknown'), { width: 120, height: 60 })
  })

  it('should use type-based default size when no explicit size', () => {
    // Operator nodes should default to tiny (32x32)
    assert.deepStrictEqual(getNodeSize(null, 'operator'), { width: 32, height: 32 })
    assert.deepStrictEqual(getNodeSize(undefined, 'operator'), { width: 32, height: 32 })
    // Decision nodes default to medium
    assert.deepStrictEqual(getNodeSize(null, 'decision'), { width: 120, height: 60 })
    // tensor3d nodes default to tensor_md
    assert.deepStrictEqual(getNodeSize(null, 'tensor3d'), { width: 60, height: 72 })
  })

  it('should prioritize explicit size over type default', () => {
    // Even if operator defaults to tiny, explicit large should be used
    assert.deepStrictEqual(getNodeSize('large', 'operator'), { width: 160, height: 80 })
    assert.deepStrictEqual(getNodeSize('small', 'operator'), { width: 80, height: 40 })
  })
})

// ============================================================================
// Style Generation Tests
// ============================================================================

describe('generateNodeStyle', () => {
  const theme = {
    node: {
      default: {
        fillColor: '#DBEAFE',
        strokeColor: '#2563EB',
        strokeWidth: 1.5,
        fontColor: '#1E293B',
        fontSize: 13
      },
      database: {
        fillColor: '#D1FAE5',
        strokeColor: '#059669'
      }
    },
    typography: {
      fontFamily: { primary: 'Inter, sans-serif' }
    }
  }

  it('should generate style for service node', () => {
    const style = generateNodeStyle({ id: 'n1', label: 'API Gateway', type: 'service' }, theme)
    assert.ok(style.includes('rounded=1'), 'should contain rounded=1')
    assert.ok(style.includes('fillColor=#DBEAFE'), 'should contain fillColor=#DBEAFE')
    assert.ok(style.includes('strokeColor=#2563EB'), 'should contain strokeColor=#2563EB')
  })

  it('should generate style for database node', () => {
    const style = generateNodeStyle({ id: 'n2', label: 'User DB', type: 'database' }, theme)
    assert.ok(style.includes('shape=cylinder3'), 'should contain shape=cylinder3')
    assert.ok(style.includes('fillColor=#D1FAE5'), 'should contain fillColor=#D1FAE5')
    assert.ok(style.includes('strokeColor=#059669'), 'should contain strokeColor=#059669')
  })

  it('should allow style overrides', () => {
    const style = generateNodeStyle({
      id: 'n3',
      label: 'Custom',
      style: { fillColor: '#FF0000' }
    }, theme)
    assert.ok(style.includes('fillColor=#FF0000'), 'should contain custom fillColor')
  })
})

describe('generateConnectorStyle', () => {
  const theme = {
    connector: {
      primary: { strokeColor: '#1E293B', strokeWidth: 2, dashed: false, endArrow: 'block', endFill: true },
      data: { strokeColor: '#1E293B', strokeWidth: 2, dashed: true, dashPattern: '6 4', endArrow: 'block', endFill: true },
      optional: { strokeColor: '#64748B', strokeWidth: 1, dashed: true, dashPattern: '2 2', endArrow: 'open', endFill: false }
    }
  }

  it('should generate primary connector style', () => {
    const style = generateConnectorStyle({ from: 'a', to: 'b', type: 'primary' }, theme)
    assert.ok(style.includes('strokeWidth=2'), 'should contain strokeWidth=2')
    assert.ok(style.includes('endArrow=block'), 'should contain endArrow=block')
    assert.ok(!style.includes('dashed=1'), 'should not contain dashed=1')
  })

  it('should generate data connector style with dashes', () => {
    const style = generateConnectorStyle({ from: 'a', to: 'b', type: 'data' }, theme)
    assert.ok(style.includes('dashed=1'), 'should contain dashed=1')
    assert.ok(style.includes('dashPattern=6 4'), 'should contain dashPattern=6 4')
  })

  it('should generate optional connector style', () => {
    const style = generateConnectorStyle({ from: 'a', to: 'b', type: 'optional' }, theme)
    assert.ok(style.includes('strokeWidth=1'), 'should contain strokeWidth=1')
    assert.ok(style.includes('endArrow=open'), 'should contain endArrow=open')
    assert.ok(style.includes('endFill=0'), 'should contain endFill=0')
  })
})

// ============================================================================
// Module Style Tests (IEEE dashed border support)
// ============================================================================

describe('generateModuleStyle', () => {
  it('should generate solid border by default', () => {
    const theme = {
      module: {
        fillColor: '#F8FAFC',
        strokeColor: '#E2E8F0',
        strokeWidth: 1,
        rounded: 12,
        dashed: false
      }
    }
    const style = generateModuleStyle({ id: 'm1', label: 'Module' }, theme)
    assert.ok(style.includes('fillColor=#F8FAFC'), 'should contain fillColor')
    assert.ok(!style.includes('dashed=1'), 'should not contain dashed=1')
  })

  it('should generate dashed border for IEEE style', () => {
    const theme = {
      module: {
        fillColor: '#FAFAFA',
        strokeColor: '#BDBDBD',
        strokeWidth: 1.5,
        rounded: 8,
        dashed: true,
        dashPattern: '8 4'
      }
    }
    const style = generateModuleStyle({ id: 'm1', label: 'TDE Module' }, theme)
    assert.ok(style.includes('dashed=1'), 'should contain dashed=1')
    assert.ok(style.includes('dashPattern=8 4'), 'should contain dashPattern=8 4')
  })

  it('should allow module-level style override', () => {
    const theme = {
      module: {
        fillColor: '#FAFAFA',
        strokeColor: '#BDBDBD',
        dashed: false
      }
    }
    const moduleWithStyle = {
      id: 'm1',
      label: 'Custom Module',
      style: {
        dashed: true,
        dashPattern: '4 2'
      }
    }
    const style = generateModuleStyle(moduleWithStyle, theme)
    assert.ok(style.includes('dashed=1'), 'should contain dashed=1 from module style')
    assert.ok(style.includes('dashPattern=4 2'), 'should use module dashPattern')
  })
})

// ============================================================================
// Layout Tests
// ============================================================================

describe('calculateLayout', () => {
  it('should calculate horizontal layout positions', () => {
    const spec = {
      meta: { layout: 'horizontal' },
      nodes: [
        { id: 'n1', label: 'Node 1' },
        { id: 'n2', label: 'Node 2' }
      ]
    }
    const theme = { canvas: { gridSize: 8 }, module: { padding: 24 } }
    const { positions } = calculateLayout(spec, theme)

    assert.strictEqual(positions.has('n1'), true, 'should have position for n1')
    assert.strictEqual(positions.has('n2'), true, 'should have position for n2')

    const pos1 = positions.get('n1')
    const pos2 = positions.get('n2')

    // Both should be grid-aligned
    assert.strictEqual(pos1.x % 8, 0, 'n1.x should be grid-aligned')
    assert.strictEqual(pos1.y % 8, 0, 'n1.y should be grid-aligned')
    assert.strictEqual(pos2.x % 8, 0, 'n2.x should be grid-aligned')
    assert.strictEqual(pos2.y % 8, 0, 'n2.y should be grid-aligned')
  })

  it('should group nodes by module', () => {
    const spec = {
      meta: { layout: 'horizontal' },
      modules: [
        { id: 'm1', label: 'Module 1' },
        { id: 'm2', label: 'Module 2' }
      ],
      nodes: [
        { id: 'n1', label: 'Node 1', module: 'm1' },
        { id: 'n2', label: 'Node 2', module: 'm1' },
        { id: 'n3', label: 'Node 3', module: 'm2' }
      ]
    }
    const theme = { canvas: { gridSize: 8 }, module: { padding: 24 } }
    const { modulePositions } = calculateLayout(spec, theme)

    assert.strictEqual(modulePositions.has('m1'), true, 'should have position for m1')
    assert.strictEqual(modulePositions.has('m2'), true, 'should have position for m2')
  })
})

// ============================================================================
// Complexity Check Tests
// ============================================================================

describe('checkComplexity', () => {
  it('should warn when node count exceeds threshold', () => {
    const spec = {
      nodes: Array(25).fill(null).map((_, i) => ({ id: `n${i}`, label: `Node ${i}` })),
      edges: []
    }
    const warnings = checkComplexity(spec)
    assert.ok(
      warnings.some(w => w.level === 'warning' && w.message.includes('nodes')),
      'should have warning about nodes'
    )
  })

  it('should error when node count is very high', () => {
    const spec = {
      nodes: Array(35).fill(null).map((_, i) => ({ id: `n${i}`, label: `Node ${i}` })),
      edges: []
    }
    const warnings = checkComplexity(spec)
    assert.ok(
      warnings.some(w => w.level === 'error' && w.message.includes('nodes')),
      'should have error about nodes'
    )
  })

  it('should warn about long labels', () => {
    const spec = {
      nodes: [{ id: 'n1', label: 'This is a very long label that exceeds the recommended length' }],
      edges: []
    }
    const warnings = checkComplexity(spec)
    assert.ok(
      warnings.some(w => w.level === 'info' && w.message.includes('long')),
      'should have info about long labels'
    )
  })

  it('should return empty array for simple diagrams', () => {
    const spec = {
      nodes: [
        { id: 'n1', label: 'Node 1' },
        { id: 'n2', label: 'Node 2' }
      ],
      edges: [{ from: 'n1', to: 'n2' }]
    }
    const warnings = checkComplexity(spec)
    assert.strictEqual(warnings.length, 0, 'should have no warnings')
  })
})

// ============================================================================
// XML Generation Tests
// ============================================================================

describe('specToDrawioXml', () => {
  it('should generate valid XML from simple spec', () => {
    const spec = {
      meta: { theme: 'tech-blue' },
      nodes: [
        { id: 'n1', label: 'API Gateway', type: 'service' },
        { id: 'n2', label: 'Database', type: 'database' }
      ],
      edges: [
        { from: 'n1', to: 'n2', type: 'data', label: 'Query' }
      ]
    }

    const xml = specToDrawioXml(spec)

    assert.ok(xml.includes('<mxGraphModel'), 'should contain mxGraphModel')
    assert.ok(xml.includes('gridSize="8"'), 'should contain gridSize=8')
    assert.ok(xml.includes('math="1"'), 'should contain math=1')
    assert.ok(xml.includes('API Gateway'), 'should contain API Gateway')
    assert.ok(xml.includes('Database'), 'should contain Database')
    assert.ok(xml.includes('Query'), 'should contain Query')
  })

  it('should throw error for invalid spec', () => {
    assert.throws(() => specToDrawioXml(null), 'should throw for null')
    assert.throws(() => specToDrawioXml({}), 'should throw for empty object')
    assert.throws(() => specToDrawioXml({ nodes: [] }), 'should throw for empty nodes')
  })

  it('should include module containers', () => {
    const spec = {
      meta: { theme: 'tech-blue' },
      modules: [{ id: 'm1', label: 'Backend' }],
      nodes: [
        { id: 'n1', label: 'Service', module: 'm1' }
      ],
      edges: []
    }

    const xml = specToDrawioXml(spec)
    assert.ok(xml.includes('Backend'), 'should contain module label Backend')
  })
})

// ============================================================================
// YAML Parser Tests
// ============================================================================

describe('parseSpecYaml', () => {
  it('should parse simple YAML specification', () => {
    const yaml = `
meta:
  theme: tech-blue
  layout: horizontal

nodes:
  - id: n1
    label: API Gateway
    type: service
  - id: n2
    label: Database
    type: database

edges:
  - from: n1
    to: n2
    type: data
`
    const spec = parseSpecYaml(yaml)

    assert.strictEqual(spec.meta.theme, 'tech-blue', 'theme should be tech-blue')
    assert.strictEqual(spec.meta.layout, 'horizontal', 'layout should be horizontal')
    assert.strictEqual(spec.nodes.length, 2, 'should have 2 nodes')
    assert.strictEqual(spec.nodes[0].id, 'n1', 'first node id should be n1')
    assert.strictEqual(spec.edges.length, 1, 'should have 1 edge')
  })
})

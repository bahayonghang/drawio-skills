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
  checkComplexity,
  loadTheme,
  resolveIconShape,
  validateXml,
  validateColorScheme,
  validateLayoutConsistency
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

  it('should detect formula from official delimiters', () => {
    assert.strictEqual(detectSemanticType('$$E = mc^2$$', null), 'formula')
    assert.strictEqual(detectSemanticType('Linear: \\(y = mx + b\\)', null), 'formula')
    assert.strictEqual(detectSemanticType('Simple relation: `x^2 + y^2`', null), 'formula')
  })

  it('should detect standalone unlabeled equations as formula without converting mixed prose labels', () => {
    assert.strictEqual(detectSemanticType('E = mc^2', null), 'formula')
    assert.strictEqual(detectSemanticType('\\sum_{i=1}^{n} x_i', null), 'formula')
    assert.strictEqual(detectSemanticType('Linear: y = mx + b', null), 'service')
  })

  it('should not treat discouraged delimiters as official formula signals', () => {
    assert.strictEqual(detectSemanticType('\\[E = mc^2\\]', null), 'service')
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

  it('default behavior: 25 nodes returns a string (no error)', () => {
    const nodes = Array.from({ length: 25 }, (_, i) => ({ id: `n${i}`, label: `Node ${i}` }))
    const spec = { meta: { theme: 'tech-blue' }, nodes, edges: [] }
    const result = specToDrawioXml(spec)
    assert.strictEqual(typeof result, 'string', 'should return a string')
    assert.ok(result.includes('<mxGraphModel'), 'should contain mxGraphModel')
  })

  it('strict mode with 35 nodes: should throw containing "Complexity check failed"', () => {
    const nodes = Array.from({ length: 35 }, (_, i) => ({ id: `n${i}`, label: `Node ${i}` }))
    const spec = { meta: { theme: 'tech-blue' }, nodes, edges: [] }
    assert.throws(
      () => specToDrawioXml(spec, { strict: true }),
      (err) => {
        assert.ok(err instanceof Error)
        assert.ok(err.message.includes('Complexity check failed'), `Expected "Complexity check failed" in: ${err.message}`)
        return true
      }
    )
  })

  it('strict mode with 2 nodes: should NOT throw', () => {
    const spec = {
      meta: { theme: 'tech-blue' },
      nodes: [
        { id: 'n1', label: 'API' },
        { id: 'n2', label: 'DB' }
      ],
      edges: []
    }
    assert.doesNotThrow(() => specToDrawioXml(spec, { strict: true }))
  })

  it('returnWarnings with 25 nodes: returns { xml, warnings } with warning-level items', () => {
    const nodes = Array.from({ length: 25 }, (_, i) => ({ id: `n${i}`, label: `Node ${i}` }))
    const spec = { meta: { theme: 'tech-blue' }, nodes, edges: [] }
    const result = specToDrawioXml(spec, { returnWarnings: true })
    assert.ok(result && typeof result === 'object', 'should return an object')
    assert.ok(typeof result.xml === 'string', 'result.xml should be a string')
    assert.ok(Array.isArray(result.warnings), 'result.warnings should be an array')
    assert.ok(result.warnings.length > 0, 'should have at least one warning')
    assert.ok(result.warnings.every(w => w.level === 'warning' || w.level === 'error'), 'warnings should have level field')
  })

  it('returnWarnings with 2 nodes: returns { xml, warnings } where warnings.length === 0', () => {
    const spec = {
      meta: { theme: 'tech-blue' },
      nodes: [
        { id: 'n1', label: 'API' },
        { id: 'n2', label: 'DB' }
      ],
      edges: []
    }
    const result = specToDrawioXml(spec, { returnWarnings: true })
    assert.ok(result && typeof result === 'object', 'should return an object')
    assert.ok(typeof result.xml === 'string', 'result.xml should be a string')
    assert.ok(Array.isArray(result.warnings), 'result.warnings should be an array')
    assert.strictEqual(result.warnings.length, 0, 'warnings should be empty for simple spec')
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

  it('should parse nested style object on a node', () => {
    const yamlText = `
nodes:
  - id: n1
    label: Box
    style:
      fillColor: "#FF0000"
      strokeColor: "#000000"
`
    const spec = parseSpecYaml(yamlText)
    assert.strictEqual(spec.nodes[0].style.fillColor, '#FF0000', 'fillColor should be #FF0000')
    assert.strictEqual(spec.nodes[0].style.strokeColor, '#000000', 'strokeColor should be #000000')
  })

  it('should parse nested position object on a node', () => {
    const yamlText = `
nodes:
  - id: n1
    label: Box
    position:
      x: 100
      y: 200
`
    const spec = parseSpecYaml(yamlText)
    assert.strictEqual(spec.nodes[0].position.x, 100, 'x should be 100')
    assert.strictEqual(spec.nodes[0].position.y, 200, 'y should be 200')
  })

  it('should parse nested meta.grid object', () => {
    const yamlText = `
meta:
  theme: tech-blue
  grid:
    size: 8
    snap: true
`
    const spec = parseSpecYaml(yamlText)
    assert.strictEqual(spec.meta.grid.size, 8, 'grid.size should be 8')
    assert.strictEqual(spec.meta.grid.snap, true, 'grid.snap should be true')
  })

  it('should return default empty spec for empty string', () => {
    const spec = parseSpecYaml('')
    assert.deepStrictEqual(spec.meta, {}, 'meta should be empty object')
    assert.deepStrictEqual(spec.nodes, [], 'nodes should be empty array')
    assert.deepStrictEqual(spec.edges, [], 'edges should be empty array')
    assert.deepStrictEqual(spec.modules, [], 'modules should be empty array')
  })

  it('should throw TypeError for null input', () => {
    assert.throws(() => parseSpecYaml(null), TypeError, 'should throw TypeError for null')
  })

  it('should throw Error for invalid YAML', () => {
    assert.throws(() => parseSpecYaml('key: [unclosed'), Error, 'should throw Error for invalid YAML')
  })
})

// ============================================================================
// loadTheme Tests
// ============================================================================

describe('loadTheme', () => {
  it('loadTheme("tech-blue") returns object with name: "tech-blue"', () => {
    const theme = loadTheme('tech-blue')
    assert.strictEqual(theme.name, 'tech-blue', 'should have name tech-blue')
  })

  it('loadTheme("academic") returns object with Times New Roman font family', () => {
    const theme = loadTheme('academic')
    assert.ok(
      theme.typography.fontFamily.primary.includes('Times New Roman'),
      'academic theme should use Times New Roman'
    )
  })

  it('loadTheme("dark") returns object with dark background color', () => {
    const theme = loadTheme('dark')
    assert.ok(
      theme.colors.background === '#0F172A' || theme.canvas?.background === '#0F172A',
      'dark theme should have dark background'
    )
  })

  it('loadTheme("nonexistent") returns DEFAULT_THEME fallback', () => {
    const theme = loadTheme('nonexistent')
    assert.strictEqual(theme.name, 'tech-blue', 'fallback should be tech-blue DEFAULT_THEME')
  })

  it('loadTheme() with no args returns tech-blue theme', () => {
    const theme = loadTheme()
    assert.strictEqual(theme.name, 'tech-blue', 'no-arg call should return tech-blue theme')
  })
})

// ============================================================================
// Integration: specToDrawioXml respects theme selection
// ============================================================================

describe('specToDrawioXml theme integration', () => {
  it('specifying meta.theme: "academic" produces XML that does NOT contain tech-blue primary color #2563EB', () => {
    const spec = {
      meta: { theme: 'academic' },
      nodes: [
        { id: 'n1', label: 'Service A', type: 'service' },
        { id: 'n2', label: 'Service B', type: 'service' }
      ],
      edges: [{ from: 'n1', to: 'n2' }]
    }
    const xml = specToDrawioXml(spec)
    assert.ok(!xml.includes('#2563EB'), 'academic theme XML should not contain tech-blue primary color #2563EB')
  })
})

// ============================================================================
// Phase 1.4: DEFAULT_THEME loaded from tech-blue.json
// ============================================================================

describe('Phase 1.4: DEFAULT_THEME from tech-blue.json', () => {
  it('loadTheme("tech-blue") returns full structure from tech-blue.json including canvas.gridColor', () => {
    const theme = loadTheme('tech-blue')
    assert.strictEqual(theme.name, 'tech-blue', 'should have name tech-blue')
    assert.ok(theme.canvas, 'should have canvas section')
    assert.strictEqual(theme.canvas.gridSize, 8, 'should have canvas.gridSize = 8')
    assert.ok(theme.canvas.gridColor, 'should have canvas.gridColor from tech-blue.json (not in hardcoded fallback)')
    assert.strictEqual(theme.module.padding, 24, 'should have module.padding = 24')
  })
})

// ============================================================================
// Phase 2.1: startArrow/startFill rendering
// ============================================================================

describe('Phase 2.1: startArrow/startFill rendering', () => {
  it('bidirectional edge with academic-color theme should contain startArrow=block', () => {
    const theme = loadTheme('academic-color')
    const style = generateConnectorStyle({ from: 'a', to: 'b', type: 'bidirectional' }, theme)
    assert.ok(style.includes('startArrow=block'), 'should contain startArrow=block')
    assert.ok(style.includes('startFill=1'), 'should contain startFill=1')
  })

  it('primary edge should NOT contain startArrow', () => {
    const theme = loadTheme('tech-blue')
    const style = generateConnectorStyle({ from: 'a', to: 'b', type: 'primary' }, theme)
    assert.ok(!style.includes('startArrow'), 'primary edge should not contain startArrow')
  })

  it('edge with style override for startArrow should use it', () => {
    const theme = loadTheme('tech-blue')
    const style = generateConnectorStyle({
      from: 'a', to: 'b', type: 'primary',
      style: { startArrow: 'oval', startFill: false }
    }, theme)
    assert.ok(style.includes('startArrow=oval'), 'should contain startArrow=oval')
    assert.ok(style.includes('startFill=0'), 'should contain startFill=0')
  })
})

// ============================================================================
// Phase 2.2: Manual node positioning
// ============================================================================

describe('Phase 2.2: manual node positioning', () => {
  it('node with position should be snapped to grid at specified coordinates', () => {
    const spec = {
      meta: { layout: 'horizontal' },
      nodes: [
        { id: 'n1', label: 'Manual Node', position: { x: 100, y: 200 } }
      ]
    }
    const theme = { canvas: { gridSize: 8 }, module: { padding: 24 } }
    const { positions } = calculateLayout(spec, theme)

    assert.ok(positions.has('n1'), 'should have position for n1')
    const pos = positions.get('n1')
    assert.strictEqual(pos.x, 40, 'x should be snapped to 40 (center - width/2)')
    assert.strictEqual(pos.y, 168, 'y should be snapped to 168 (center - height/2 snapped)')
  })

  it('mixed manual and auto-positioned nodes both get positions', () => {
    const spec = {
      meta: { layout: 'horizontal' },
      nodes: [
        { id: 'n1', label: 'Manual', position: { x: 300, y: 400 } },
        { id: 'n2', label: 'Auto Node' }
      ]
    }
    const theme = { canvas: { gridSize: 8 }, module: { padding: 24 } }
    const { positions } = calculateLayout(spec, theme)

    assert.ok(positions.has('n1'), 'should have position for manual n1')
    assert.ok(positions.has('n2'), 'should have position for auto n2')
    const pos1 = positions.get('n1')
    assert.strictEqual(pos1.x, 240, 'manual n1 x should be snapped to 240 (center - width/2)')
    assert.strictEqual(pos1.y, 368, 'manual n1 y should be snapped to 368 (center - height/2 snapped)')
  })

  it('node without position property is auto-laid out as usual', () => {
    const spec = {
      meta: { layout: 'horizontal' },
      nodes: [
        { id: 'n1', label: 'Auto Only' }
      ]
    }
    const theme = { canvas: { gridSize: 8 }, module: { padding: 24 } }
    const { positions } = calculateLayout(spec, theme)
    const pos = positions.get('n1')
    assert.ok(pos.x % 8 === 0, 'auto position x should be grid-aligned')
    assert.ok(pos.y % 8 === 0, 'auto position y should be grid-aligned')
  })
})

// ============================================================================
// Phase 2.3: Edge label position
// ============================================================================

describe('Phase 2.3: edge labelPosition', () => {
  it('edge with labelPosition "start" should produce x="0.2" in XML', () => {
    const spec = {
      meta: { theme: 'tech-blue' },
      nodes: [
        { id: 'n1', label: 'A' },
        { id: 'n2', label: 'B' }
      ],
      edges: [{ from: 'n1', to: 'n2', label: 'flow', labelPosition: 'start' }]
    }
    const xml = specToDrawioXml(spec)
    assert.ok(xml.includes('x="0.2"'), 'should contain x="0.2" for start labelPosition')
  })

  it('edge with labelPosition "end" should produce x="0.8" in XML', () => {
    const spec = {
      meta: { theme: 'tech-blue' },
      nodes: [
        { id: 'n1', label: 'A' },
        { id: 'n2', label: 'B' }
      ],
      edges: [{ from: 'n1', to: 'n2', label: 'flow', labelPosition: 'end' }]
    }
    const xml = specToDrawioXml(spec)
    assert.ok(xml.includes('x="0.8"'), 'should contain x="0.8" for end labelPosition')
  })

  it('edge with no labelPosition should produce x="0.5" in XML', () => {
    const spec = {
      meta: { theme: 'tech-blue' },
      nodes: [
        { id: 'n1', label: 'A' },
        { id: 'n2', label: 'B' }
      ],
      edges: [{ from: 'n1', to: 'n2', label: 'flow' }]
    }
    const xml = specToDrawioXml(spec)
    assert.ok(xml.includes('x="0.5"'), 'should contain x="0.5" for default center labelPosition')
  })
})

// ============================================================================
// Phase 2.4: Icon support
// ============================================================================

describe('Phase 2.4: resolveIconShape', () => {
  it('should resolve aws.lambda to mxgraph.aws4.lambda', () => {
    assert.strictEqual(resolveIconShape('aws.lambda'), 'mxgraph.aws4.lambda')
  })

  it('should resolve gcp.functions to mxgraph.gcp2.functions', () => {
    assert.strictEqual(resolveIconShape('gcp.functions'), 'mxgraph.gcp2.functions')
  })

  it('should resolve azure.vm to mxgraph.azure.vm', () => {
    assert.strictEqual(resolveIconShape('azure.vm'), 'mxgraph.azure.vm')
  })

  it('should resolve k8s.pod to mxgraph.kubernetes.pod', () => {
    assert.strictEqual(resolveIconShape('k8s.pod'), 'mxgraph.kubernetes.pod')
  })

  it('should pass through mxgraph. prefix directly', () => {
    assert.strictEqual(resolveIconShape('mxgraph.custom.shape'), 'mxgraph.custom.shape')
  })

  it('should return null for null/undefined', () => {
    assert.strictEqual(resolveIconShape(null), null)
    assert.strictEqual(resolveIconShape(undefined), null)
  })

  it('should treat unknown prefix as direct shape reference', () => {
    assert.strictEqual(resolveIconShape('customShape'), 'customShape')
  })
})

describe('Phase 2.4: generateNodeStyle with icon', () => {
  const theme = {
    node: {
      default: {
        fillColor: '#DBEAFE',
        strokeColor: '#2563EB',
        strokeWidth: 1.5,
        fontColor: '#1E293B',
        fontSize: 13
      }
    },
    typography: {
      fontFamily: { primary: 'Inter, sans-serif' }
    }
  }

  it('node with icon aws.lambda should have shape=mxgraph.aws4.lambda in style', () => {
    const style = generateNodeStyle({ id: 'n1', label: 'Lambda', icon: 'aws.lambda' }, theme)
    assert.ok(style.includes('shape=mxgraph.aws4.lambda'), 'should contain shape=mxgraph.aws4.lambda')
    assert.ok(style.includes('verticalLabelPosition=bottom'), 'should contain verticalLabelPosition=bottom')
    assert.ok(style.includes('labelBackgroundColor=none'), 'should contain labelBackgroundColor=none')
  })

  it('node with icon gcp.functions should have shape=mxgraph.gcp2.functions in style', () => {
    const style = generateNodeStyle({ id: 'n1', label: 'Functions', icon: 'gcp.functions' }, theme)
    assert.ok(style.includes('shape=mxgraph.gcp2.functions'), 'should contain shape=mxgraph.gcp2.functions')
  })

  it('node without icon should NOT contain shape=mxgraph', () => {
    const style = generateNodeStyle({ id: 'n1', label: 'API Gateway', type: 'service' }, theme)
    assert.ok(!style.includes('shape=mxgraph'), 'should not contain shape=mxgraph for non-icon node')
  })
})

// ============================================================================
// Phase 4.3: validateXml
// ============================================================================

describe('validateXml', () => {
  const VALID_XML =
    '<mxGraphModel>' +
    '<root>' +
    '<mxCell id="0"/>' +
    '<mxCell id="1" parent="0"/>' +
    '<mxCell id="2" value="A" style="" vertex="1" parent="1">' +
    '<mxGeometry x="40" y="40" width="120" height="60" as="geometry"/>' +
    '</mxCell>' +
    '<mxCell id="3" value="B" style="" vertex="1" parent="1">' +
    '<mxGeometry x="200" y="40" width="120" height="60" as="geometry"/>' +
    '</mxCell>' +
    '<mxCell id="4" style="" edge="1" parent="1" source="2" target="3">' +
    '<mxGeometry relative="1" as="geometry"/>' +
    '</mxCell>' +
    '</root>' +
    '</mxGraphModel>'

  it('should return valid:true and empty errors for well-formed XML', () => {
    const result = validateXml(VALID_XML)
    assert.strictEqual(result.valid, true, 'should be valid')
    assert.deepStrictEqual(result.errors, [], 'should have no errors')
  })

  it('should return errors when root cells are missing', () => {
    const xml =
      '<mxGraphModel>' +
      '<root>' +
      '<mxCell id="2" value="A" vertex="1" parent="1">' +
      '<mxGeometry as="geometry"/>' +
      '</mxCell>' +
      '</root>' +
      '</mxGraphModel>'
    const result = validateXml(xml)
    assert.strictEqual(result.valid, false, 'should be invalid')
    assert.ok(result.errors.some(e => e.includes('id="0"')), 'should report missing id=0 cell')
    assert.ok(result.errors.some(e => e.includes('id="1"')), 'should report missing id=1 cell')
  })

  it('should return errors for duplicate cell IDs', () => {
    const xml =
      '<mxGraphModel>' +
      '<root>' +
      '<mxCell id="0"/>' +
      '<mxCell id="1" parent="0"/>' +
      '<mxCell id="2" value="A" vertex="1" parent="1"><mxGeometry as="geometry"/></mxCell>' +
      '<mxCell id="2" value="B" vertex="1" parent="1"><mxGeometry as="geometry"/></mxCell>' +
      '</root>' +
      '</mxGraphModel>'
    const result = validateXml(xml)
    assert.strictEqual(result.valid, false, 'should be invalid')
    assert.ok(result.errors.some(e => e.includes('Duplicate') && e.includes('"2"')), 'should report duplicate ID 2')
  })

  it('should return errors when edge references nonexistent source', () => {
    const xml =
      '<mxGraphModel>' +
      '<root>' +
      '<mxCell id="0"/>' +
      '<mxCell id="1" parent="0"/>' +
      '<mxCell id="2" value="A" vertex="1" parent="1"><mxGeometry as="geometry"/></mxCell>' +
      '<mxCell id="4" style="" edge="1" parent="1" source="999" target="2">' +
      '<mxGeometry relative="1" as="geometry"/>' +
      '</mxCell>' +
      '</root>' +
      '</mxGraphModel>'
    const result = validateXml(xml)
    assert.strictEqual(result.valid, false, 'should be invalid')
    assert.ok(
      result.errors.some(e => e.includes('source') && e.includes('"999"')),
      'should report nonexistent source ID'
    )
  })
})

// ============================================================================
// Additional loadTheme Tests
// ============================================================================

describe('loadTheme additional themes', () => {
  it('loadTheme("nature") returns object with green primary color', () => {
    const theme = loadTheme('nature')
    assert.strictEqual(theme.name, 'nature', 'should have name nature')
    assert.ok(
      theme.colors.primary === '#059669' || theme.node?.default?.strokeColor === '#059669',
      'nature theme should have green primary color #059669'
    )
  })

  it('loadTheme("academic-color") returns object with skip, residual, and attention connector types', () => {
    const theme = loadTheme('academic-color')
    assert.ok(theme.connector.skip, 'should have skip connector type')
    assert.ok(theme.connector.residual, 'should have residual connector type')
    assert.ok(theme.connector.attention, 'should have attention connector type')
  })
})

// ============================================================================
// Additional calculateLayout Tests
// ============================================================================

describe('calculateLayout additional layouts', () => {
  it('vertical layout: 2 nodes in separate modules have different Y positions', () => {
    // In vertical layout, modules are stacked vertically (different Y per module group)
    const spec = {
      meta: { layout: 'vertical' },
      modules: [
        { id: 'm1', label: 'Module 1' },
        { id: 'm2', label: 'Module 2' }
      ],
      nodes: [
        { id: 'n1', label: 'Node 1', module: 'm1' },
        { id: 'n2', label: 'Node 2', module: 'm2' }
      ]
    }
    const theme = { canvas: { gridSize: 8 }, module: { padding: 24 } }
    const { positions } = calculateLayout(spec, theme)

    const pos1 = positions.get('n1')
    const pos2 = positions.get('n2')

    assert.ok(pos1, 'should have position for n1')
    assert.ok(pos2, 'should have position for n2')
    // In vertical layout, modules are stacked: Y values differ between modules
    assert.notStrictEqual(pos1.y, pos2.y, 'vertical layout nodes in different modules should have different Y positions')
  })

  it('hierarchical layout: 4 nodes are arranged in a grid pattern', () => {
    const spec = {
      meta: { layout: 'hierarchical' },
      nodes: [
        { id: 'n1', label: 'Node 1' },
        { id: 'n2', label: 'Node 2' },
        { id: 'n3', label: 'Node 3' },
        { id: 'n4', label: 'Node 4' }
      ]
    }
    const theme = { canvas: { gridSize: 8 }, module: { padding: 24 } }
    const { positions } = calculateLayout(spec, theme)

    assert.ok(positions.has('n1'), 'should have position for n1')
    assert.ok(positions.has('n2'), 'should have position for n2')
    assert.ok(positions.has('n3'), 'should have position for n3')
    assert.ok(positions.has('n4'), 'should have position for n4')

    // All positions should be grid-aligned
    for (const [, pos] of positions) {
      assert.strictEqual(pos.x % 8, 0, 'x should be grid-aligned')
      assert.strictEqual(pos.y % 8, 0, 'y should be grid-aligned')
    }

    // Should have at least 2 distinct X or Y values (grid pattern)
    const xs = new Set([...positions.values()].map(p => p.x))
    const ys = new Set([...positions.values()].map(p => p.y))
    assert.ok(xs.size > 1 || ys.size > 1, 'hierarchical layout should use multiple X or Y positions')
  })
})

// ============================================================================
// Additional specToDrawioXml Integration Tests
// ============================================================================

describe('specToDrawioXml additional integration tests', () => {
  it('nature theme produces XML with green stroke color (#059669) not tech-blue (#2563EB)', () => {
    const spec = {
      meta: { theme: 'nature' },
      nodes: [
        { id: 'n1', label: 'Service A', type: 'service' },
        { id: 'n2', label: 'Service B', type: 'service' }
      ],
      edges: [{ from: 'n1', to: 'n2' }]
    }
    const xml = specToDrawioXml(spec)
    assert.ok(xml.includes('#059669'), 'nature theme XML should contain green color #059669')
    assert.ok(!xml.includes('#2563EB'), 'nature theme XML should not contain tech-blue color #2563EB')
  })

  it('dark theme produces XML with dark background color (#0F172A)', () => {
    const spec = {
      meta: { theme: 'dark' },
      nodes: [
        { id: 'n1', label: 'Service A', type: 'service' }
      ],
      edges: []
    }
    const xml = specToDrawioXml(spec)
    assert.ok(xml.includes('#0F172A'), 'dark theme XML should contain dark background color #0F172A')
  })

  it('modules produce XML containing module container with correct label', () => {
    const spec = {
      meta: { theme: 'tech-blue' },
      modules: [{ id: 'm1', label: 'MyBackend' }],
      nodes: [
        { id: 'n1', label: 'Service', module: 'm1' }
      ],
      edges: []
    }
    const xml = specToDrawioXml(spec)
    assert.ok(xml.includes('MyBackend'), 'XML should contain module label MyBackend')
  })

  it('each of the 5 connector types produces the correct endArrow in XML', () => {
    // tech-blue theme defaults: primary=block, data=block, optional=open, dependency=diamond, bidirectional=none
    const edgeTypes = [
      { type: 'primary', expectedArrow: 'endArrow=block' },
      { type: 'data', expectedArrow: 'endArrow=block' },
      { type: 'optional', expectedArrow: 'endArrow=open' },
      { type: 'dependency', expectedArrow: 'endArrow=diamond' },
      { type: 'bidirectional', expectedArrow: 'endArrow=none' }
    ]

    for (const { type, expectedArrow } of edgeTypes) {
      const spec = {
        meta: { theme: 'tech-blue' },
        nodes: [
          { id: 'n1', label: 'A' },
          { id: 'n2', label: 'B' }
        ],
        edges: [{ from: 'n1', to: 'n2', type }]
      }
      const xml = specToDrawioXml(spec)
      assert.ok(
        xml.includes(expectedArrow),
        `edge type "${type}" should produce "${expectedArrow}" in XML`
      )
    }
  })
})

// ============================================================================
// Edge label presence/absence in XML
// ============================================================================

describe('edge label in XML', () => {
  it('edge with label produces XML containing that label text', () => {
    const spec = {
      meta: { theme: 'tech-blue' },
      nodes: [
        { id: 'n1', label: 'A' },
        { id: 'n2', label: 'B' }
      ],
      edges: [{ from: 'n1', to: 'n2', label: 'MyEdgeLabel' }]
    }
    const xml = specToDrawioXml(spec)
    assert.ok(xml.includes('MyEdgeLabel'), 'XML should contain edge label text "MyEdgeLabel"')
  })

  it('edge without label does NOT produce edgeLabel cell in XML', () => {
    const spec = {
      meta: { theme: 'tech-blue' },
      nodes: [
        { id: 'n1', label: 'A' },
        { id: 'n2', label: 'B' }
      ],
      edges: [{ from: 'n1', to: 'n2' }]
    }
    const xml = specToDrawioXml(spec)
    assert.ok(!xml.includes('edgeLabel'), 'XML should NOT contain edgeLabel when edge has no label')
  })
})

// ============================================================================
// validateColorScheme — color validation
// ============================================================================

describe('validateColorScheme', () => {
  const theme = loadTheme('tech-blue')

  it('returns no warnings for a spec with no style overrides', () => {
    const spec = {
      nodes: [{ id: 'n1', label: 'Node' }],
      edges: [],
      modules: []
    }
    assert.deepStrictEqual(validateColorScheme(spec, theme), [])
  })

  it('returns no warnings for valid hex color overrides (#RGB)', () => {
    const spec = {
      nodes: [{ id: 'n1', label: 'Node', style: { fillColor: '#ABC', strokeColor: '#123456' } }],
      edges: [],
      modules: []
    }
    assert.deepStrictEqual(validateColorScheme(spec, theme), [])
  })

  it('returns no warnings for valid hex color overrides (#RRGGBB)', () => {
    const spec = {
      nodes: [{ id: 'n1', label: 'Node', style: { fillColor: '#DBEAFE', strokeColor: '#2563EB' } }],
      edges: [],
      modules: []
    }
    assert.deepStrictEqual(validateColorScheme(spec, theme), [])
  })

  it('returns no warnings for valid theme token overrides', () => {
    const spec = {
      nodes: [{ id: 'n1', label: 'Node', style: { fillColor: '$primaryLight', strokeColor: '$primary' } }],
      edges: [],
      modules: []
    }
    assert.deepStrictEqual(validateColorScheme(spec, theme), [])
  })

  it('returns a warning for an invalid color value on a node', () => {
    const spec = {
      nodes: [{ id: 'n1', label: 'Node', style: { fillColor: 'blue' } }],
      edges: [],
      modules: []
    }
    const warnings = validateColorScheme(spec, theme)
    assert.strictEqual(warnings.length, 1)
    assert.ok(warnings[0].includes('node "n1"'), 'warning should identify the node')
    assert.ok(warnings[0].includes('"blue"'), 'warning should quote the invalid value')
  })

  it('returns a warning for an invalid strokeColor on an edge', () => {
    const spec = {
      nodes: [{ id: 'n1', label: 'A' }, { id: 'n2', label: 'B' }],
      edges: [{ from: 'n1', to: 'n2', style: { strokeColor: 'red' } }],
      modules: []
    }
    const warnings = validateColorScheme(spec, theme)
    assert.strictEqual(warnings.length, 1)
    assert.ok(warnings[0].includes('n1→n2'), 'warning should identify the edge')
  })

  it('returns a warning for an invalid color on a module', () => {
    const spec = {
      nodes: [{ id: 'n1', label: 'A' }],
      edges: [],
      modules: [{ id: 'm1', label: 'Mod', style: { fillColor: 'not-a-color' } }]
    }
    const warnings = validateColorScheme(spec, theme)
    assert.strictEqual(warnings.length, 1)
    assert.ok(warnings[0].includes('module "m1"'), 'warning should identify the module')
  })

  it('returns multiple warnings for multiple invalid values', () => {
    const spec = {
      nodes: [
        { id: 'n1', label: 'A', style: { fillColor: 'bad1', strokeColor: 'bad2' } }
      ],
      edges: [],
      modules: []
    }
    const warnings = validateColorScheme(spec, theme)
    assert.strictEqual(warnings.length, 2)
  })

  it('ignores undefined / null style color values without warning', () => {
    const spec = {
      nodes: [{ id: 'n1', label: 'Node', style: { fillColor: null, strokeColor: undefined } }],
      edges: [],
      modules: []
    }
    assert.deepStrictEqual(validateColorScheme(spec, theme), [])
  })
})

// ============================================================================
// validateLayoutConsistency — coordinate / layout direction checks
// ============================================================================

describe('validateLayoutConsistency', () => {
  it('returns no warnings when fewer than 2 positioned nodes', () => {
    const spec = {
      meta: { layout: 'horizontal' },
      nodes: [{ id: 'n1', label: 'A', position: { x: 100, y: 100 } }]
    }
    assert.deepStrictEqual(validateLayoutConsistency(spec), [])
  })

  it('returns no warnings when layout and positions are consistent (horizontal)', () => {
    const spec = {
      meta: { layout: 'horizontal' },
      nodes: [
        { id: 'n1', label: 'A', position: { x: 100, y: 100 } },
        { id: 'n2', label: 'B', position: { x: 400, y: 120 } }
      ]
    }
    // xRange=300, yRange=20 — clearly horizontal
    assert.deepStrictEqual(validateLayoutConsistency(spec), [])
  })

  it('returns no warnings when layout and positions are consistent (vertical)', () => {
    const spec = {
      meta: { layout: 'vertical' },
      nodes: [
        { id: 'n1', label: 'A', position: { x: 100, y: 100 } },
        { id: 'n2', label: 'B', position: { x: 110, y: 500 } }
      ]
    }
    // xRange=10, yRange=400 — clearly vertical
    assert.deepStrictEqual(validateLayoutConsistency(spec), [])
  })

  it('warns when horizontal layout has disproportionately large vertical span', () => {
    const spec = {
      meta: { layout: 'horizontal' },
      nodes: [
        { id: 'n1', label: 'A', position: { x: 100, y: 100 } },
        { id: 'n2', label: 'B', position: { x: 120, y: 800 } }
      ]
    }
    // xRange=20, yRange=700 — vertical span >> horizontal
    const warnings = validateLayoutConsistency(spec)
    assert.strictEqual(warnings.length, 1)
    assert.ok(warnings[0].includes('"horizontal"'), 'warning should mention layout direction')
  })

  it('warns when vertical layout has disproportionately large horizontal span', () => {
    const spec = {
      meta: { layout: 'vertical' },
      nodes: [
        { id: 'n1', label: 'A', position: { x: 100, y: 100 } },
        { id: 'n2', label: 'B', position: { x: 900, y: 120 } }
      ]
    }
    // xRange=800, yRange=20 — horizontal span >> vertical
    const warnings = validateLayoutConsistency(spec)
    assert.strictEqual(warnings.length, 1)
    assert.ok(warnings[0].includes('"vertical"'), 'warning should mention layout direction')
  })

  it('warns when two positioned nodes are too close together (overlap)', () => {
    const spec = {
      meta: { layout: 'horizontal' },
      nodes: [
        { id: 'n1', label: 'A', position: { x: 100, y: 100 } },
        { id: 'n2', label: 'B', position: { x: 105, y: 105 } }
      ]
    }
    const warnings = validateLayoutConsistency(spec)
    const overlapWarning = warnings.find(w => w.includes('overlap'))
    assert.ok(overlapWarning, 'should warn about node overlap')
    assert.ok(overlapWarning.includes('"n1"') && overlapWarning.includes('"n2"'))
  })

  it('does not warn when nodes are sufficiently separated', () => {
    const spec = {
      meta: { layout: 'horizontal' },
      nodes: [
        { id: 'n1', label: 'A', position: { x: 100, y: 100 } },
        { id: 'n2', label: 'B', position: { x: 300, y: 100 } }
      ]
    }
    // distance = 200px — well above MIN_CLEARANCE
    const warnings = validateLayoutConsistency(spec).filter(w => w.includes('overlap'))
    assert.deepStrictEqual(warnings, [])
  })

  it('skips overlap check when nodes exceed 30 (performance guard)', () => {
    const nodes = Array.from({ length: 31 }, (_, i) => ({
      id: `n${i}`, label: `N${i}`,
      position: { x: i * 5, y: i * 5 }  // would overlap if checked
    }))
    const spec = { meta: { layout: 'horizontal' }, nodes }
    const warnings = validateLayoutConsistency(spec).filter(w => w.includes('overlap'))
    assert.deepStrictEqual(warnings, [], 'overlap check should be skipped for > 30 nodes')
  })
})

// ============================================================================
// specToDrawioXml validation integration
// ============================================================================

describe('specToDrawioXml validation integration', () => {
  it('includes color warnings in returnWarnings output', () => {
    const spec = {
      meta: { theme: 'tech-blue' },
      nodes: [
        { id: 'n1', label: 'A', style: { fillColor: 'invalid-color' } },
        { id: 'n2', label: 'B' }
      ]
    }
    const result = specToDrawioXml(spec, { returnWarnings: true, silent: true })
    assert.ok(result.xml, 'should still produce XML despite warnings')
    const colorWarning = result.warnings.find(w => w.message?.includes('invalid-color'))
    assert.ok(colorWarning, 'should include color warning in returned warnings')
  })

  it('throws in strict mode when color validation fails', () => {
    const spec = {
      meta: { theme: 'tech-blue' },
      nodes: [
        { id: 'n1', label: 'A', style: { fillColor: 'not-a-color' } },
        { id: 'n2', label: 'B' }
      ]
    }
    assert.throws(
      () => specToDrawioXml(spec, { strict: true, silent: true }),
      /Spec validation failed/,
      'strict mode should throw on invalid color'
    )
  })

  it('does not throw in non-strict mode with invalid colors', () => {
    const spec = {
      meta: { theme: 'tech-blue' },
      nodes: [
        { id: 'n1', label: 'A', style: { fillColor: 'not-a-color' } },
        { id: 'n2', label: 'B' }
      ]
    }
    assert.doesNotThrow(
      () => specToDrawioXml(spec, { silent: true }),
      'non-strict mode should not throw on invalid color'
    )
  })
})

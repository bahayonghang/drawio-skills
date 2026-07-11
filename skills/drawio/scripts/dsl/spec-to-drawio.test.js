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
  deriveNodeIcon,
  validateXml,
  validateSpec,
  validateColorScheme,
  validateLayoutConsistency,
  validateShapeReferences,
  validateAcademicProfile,
  validateSchemaDrift,
  computeLayoutQualityMetrics,
  SHAPE_STYLES
} from './spec-to-drawio.js'
import { resolveImageIconStyle } from './icon-resolver.js'
import { resolveShapeNameKind } from './shape-catalog.js'

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

  it('should detect network topology types', () => {
    assert.strictEqual(detectSemanticType('Core Router', null), 'router')
    assert.strictEqual(detectSemanticType('Access Switch', null), 'switch')
    assert.strictEqual(detectSemanticType('Edge Firewall', null), 'firewall')
    assert.strictEqual(detectSemanticType('Wireless AP', null), 'ap')
  })

  it('should preserve legacy decision inference for bare "Switch" labels', () => {
    assert.strictEqual(detectSemanticType('Switch', null), 'decision')
    assert.strictEqual(detectSemanticType('Switch', 'switch'), 'switch')
  })

  it('should respect network.device metadata for semantic type', () => {
    assert.strictEqual(detectSemanticType('Gateway', null, { device: 'router' }), 'router')
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

  it('fits text node width to content when no explicit size is given', () => {
    // Short CJK label should be far narrower than the old fixed medium width (120)
    const shortText = getNodeSize(null, 'text', '有效频带')
    assert.ok(shortText.width < 120, 'short CJK text should be narrower than the medium default')
    assert.ok(shortText.width >= 48, 'width should respect the minimum')
    // Longer labels widen, but width is capped so the box wraps instead of overflowing
    const longText = getNodeSize(null, 'text', 'Conv1D-ResNet + FiLM + Cross-Attention')
    assert.ok(longText.width > shortText.width, 'longer label should produce a wider box')
    assert.ok(getNodeSize(null, 'text', 'x'.repeat(200)).width <= 320, 'width is clamped at 320')
    // Explicit size and the no-label fallback keep their existing behavior
    assert.deepStrictEqual(getNodeSize('large', 'text', '短'), { width: 160, height: 80 })
    assert.deepStrictEqual(getNodeSize(null, 'text'), { width: 120, height: 60 })
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
    const style = generateNodeStyle(
      {
        id: 'n3',
        label: 'Custom',
        style: { fillColor: '#FF0000' }
      },
      theme
    )
    assert.ok(style.includes('fillColor=#FF0000'), 'should contain custom fillColor')
  })

  it('uses theme typography for generic diagrams and Times New Roman when the theme has none', () => {
    const style = generateNodeStyle({ id: 'n4', label: 'API Gateway', type: 'service' }, theme)
    assert.ok(style.includes('fontFamily=Inter, sans-serif'), 'themed diagrams should use theme typography')
    const bare = generateNodeStyle({ id: 'n4b', label: 'API Gateway', type: 'service' }, { node: {} })
    assert.ok(bare.includes('fontFamily=Times New Roman'), 'themes without typography fall back to Times New Roman')
  })

  it('keeps text nodes transparent with no label background', () => {
    const style = generateNodeStyle({ id: 'n5', label: '有效频带', type: 'text' }, theme)
    assert.ok(style.includes('fillColor=none'), 'text fill should be transparent')
    assert.ok(style.includes('labelBackgroundColor=none'), 'text should have no white label halo')
    assert.ok(!style.includes('fillColor=#FFFFFF'), 'text should not use a white fill')
  })
})

describe('generateConnectorStyle', () => {
  const theme = {
    connector: {
      primary: { strokeColor: '#1E293B', strokeWidth: 2, dashed: false, endArrow: 'block', endFill: true },
      data: {
        strokeColor: '#1E293B',
        strokeWidth: 2,
        dashed: true,
        dashPattern: '6 4',
        endArrow: 'block',
        endFill: true
      },
      optional: {
        strokeColor: '#64748B',
        strokeWidth: 1,
        dashed: true,
        dashPattern: '2 2',
        endArrow: 'open',
        endFill: false
      }
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

  it('should resolve theme tokens in module color fields', () => {
    const theme = {
      colors: {
        accentLight: '#EDE9FE',
        accent: '#7C3AED',
        text: '#1E293B'
      },
      module: {
        fillColor: '#FAFAFA',
        strokeColor: '#BDBDBD',
        labelFontColor: '#111827'
      }
    }
    const style = generateModuleStyle(
      {
        id: 'm1',
        label: 'Token Module',
        color: '$accentLight',
        style: {
          strokeColor: '$accent',
          fontColor: '$text'
        }
      },
      theme
    )
    assert.ok(style.includes('fillColor=#EDE9FE'), 'module fill should resolve token values')
    assert.ok(style.includes('strokeColor=#7C3AED'), 'module stroke should resolve token values')
    assert.ok(style.includes('fontColor=#1E293B'), 'module font color should resolve token values')
  })

  it('defaults module titles to Times New Roman when no explicit font is provided', () => {
    const theme = {
      module: {
        fillColor: '#FAFAFA',
        strokeColor: '#BDBDBD'
      }
    }
    const style = generateModuleStyle({ id: 'm1', label: 'Backend Layer' }, theme)
    assert.ok(style.includes('fontFamily=Times New Roman'), 'module titles should default to Times New Roman')
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

  it('should calculate star layout with a central network node', () => {
    const spec = {
      meta: { layout: 'star' },
      nodes: [
        { id: 'core', label: 'Core Switch', type: 'switch' },
        { id: 'fw', label: 'Firewall', type: 'firewall' },
        { id: 'ap', label: 'Wireless AP', type: 'ap' }
      ]
    }
    const theme = { canvas: { gridSize: 8 }, module: { padding: 24 } }
    const { positions } = calculateLayout(spec, theme)

    const core = positions.get('core')
    const fw = positions.get('fw')
    const ap = positions.get('ap')
    assert.ok(core.x > fw.x, 'core should not be placed left of every spoke')
    assert.ok(core.x < ap.x || core.y !== ap.y, 'core should act as central anchor')
  })

  it('should calculate mesh layout with dispersed nodes', () => {
    const spec = {
      meta: { layout: 'mesh' },
      nodes: [
        { id: 'a', label: 'Node A' },
        { id: 'b', label: 'Node B' },
        { id: 'c', label: 'Node C' },
        { id: 'd', label: 'Node D' }
      ]
    }
    const theme = { canvas: { gridSize: 8 }, module: { padding: 24 } }
    const { positions } = calculateLayout(spec, theme)

    const xs = [...positions.values()].map((pos) => pos.x)
    const ys = [...positions.values()].map((pos) => pos.y)
    assert.ok(new Set(xs).size > 2, 'mesh layout should spread x positions')
    assert.ok(new Set(ys).size > 2, 'mesh layout should spread y positions')
  })

  it('should calculate module containers for star layouts', () => {
    const spec = {
      meta: { layout: 'star' },
      modules: [{ id: 'vpc', label: 'AWS VPC' }],
      nodes: [
        { id: 'internet', label: 'Internet Gateway', type: 'internet', module: 'vpc' },
        { id: 'core', label: 'Core Switch', type: 'switch', module: 'vpc' },
        { id: 'app', label: 'App Server', type: 'server', module: 'vpc' }
      ]
    }
    const theme = { canvas: { gridSize: 8 }, module: { padding: 24 } }
    const { positions, modulePositions } = calculateLayout(spec, theme)

    assert.ok(modulePositions.has('vpc'), 'star layout should include module bounds')
    const modulePos = modulePositions.get('vpc')
    const nodeBounds = ['internet', 'core', 'app'].map((id) => positions.get(id))
    assert.ok(modulePos.width > 0, 'module width should be positive')
    assert.ok(modulePos.height > 0, 'module height should be positive')
    assert.ok(modulePos.x <= Math.min(...nodeBounds.map((pos) => pos.x)), 'module should start before child nodes')
    assert.ok(modulePos.y <= Math.min(...nodeBounds.map((pos) => pos.y)), 'module should start above child nodes')
  })

  it('should calculate module containers for mesh layouts with manual nodes', () => {
    const spec = {
      meta: { layout: 'mesh' },
      modules: [
        { id: 'dmz', label: 'DMZ' },
        { id: 'internal', label: 'Internal Network' }
      ],
      nodes: [
        { id: 'fw', label: 'Perimeter Firewall', type: 'firewall', module: 'dmz' },
        { id: 'proxy', label: 'Reverse Proxy', type: 'load_balancer', module: 'dmz' },
        { id: 'app', label: 'App Server', type: 'server', module: 'internal' },
        { id: 'db', label: 'Database Segment', type: 'subnet', module: 'internal', position: { x: 520, y: 240 } }
      ]
    }
    const theme = { canvas: { gridSize: 8 }, module: { padding: 24 } }
    const { positions, modulePositions } = calculateLayout(spec, theme)

    assert.ok(modulePositions.has('dmz'), 'mesh layout should include DMZ module bounds')
    assert.ok(modulePositions.has('internal'), 'mesh layout should include Internal module bounds')
    const internalPos = modulePositions.get('internal')
    const dbPos = positions.get('db')
    assert.ok(internalPos.x <= dbPos.x, 'internal module should include manually positioned nodes')
    assert.ok(internalPos.y <= dbPos.y, 'internal module should extend above manually positioned nodes')
  })
})

// ============================================================================
// Complexity Check Tests
// ============================================================================

describe('checkComplexity', () => {
  it('should warn when node count exceeds threshold', () => {
    const spec = {
      nodes: Array(41)
        .fill(null)
        .map((_, i) => ({ id: `n${i}`, label: `Node ${i}` })),
      edges: []
    }
    const warnings = checkComplexity(spec)
    assert.ok(
      warnings.some((w) => w.level === 'warning' && w.message.includes('nodes')),
      'should have warning about nodes'
    )
  })

  it('should error when node count is very high', () => {
    const spec = {
      nodes: Array(61)
        .fill(null)
        .map((_, i) => ({ id: `n${i}`, label: `Node ${i}` })),
      edges: []
    }
    const warnings = checkComplexity(spec)
    assert.ok(
      warnings.some((w) => w.level === 'error' && w.message.includes('nodes')),
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
      warnings.some((w) => w.level === 'info' && w.message.includes('abbreviation') && w.message.includes('"n1"')),
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
      edges: [{ from: 'n1', to: 'n2', type: 'data', label: 'Query' }]
    }

    const xml = specToDrawioXml(spec)

    assert.ok(xml.includes('<mxGraphModel'), 'should contain mxGraphModel')
    assert.ok(xml.includes('gridSize="8"'), 'should contain gridSize=8')
    assert.ok(xml.includes('math="1"'), 'should contain math=1')
    assert.ok(xml.includes('API Gateway'), 'should contain API Gateway')
    assert.ok(xml.includes('Database'), 'should contain Database')
    assert.ok(xml.includes('Query'), 'should contain Query')
  })

  it('should use explicit meta.canvas dimensions as minimum page size', () => {
    const spec = {
      meta: { theme: 'tech-blue', canvas: '1200x800' },
      nodes: [{ id: 'n1', label: 'Reference Node', bounds: { x: 40, y: 40, width: 160, height: 80 } }]
    }

    const xml = specToDrawioXml(spec)

    assert.ok(xml.includes('pageWidth="1200"'), 'should use explicit canvas width')
    assert.ok(xml.includes('pageHeight="800"'), 'should use explicit canvas height')
  })

  it('should expand beyond explicit meta.canvas when content exceeds the page', () => {
    const spec = {
      meta: { theme: 'tech-blue', canvas: '400x300' },
      nodes: [{ id: 'n1', label: 'Wide Reference Node', bounds: { x: 440, y: 360, width: 160, height: 80 } }]
    }

    const xml = specToDrawioXml(spec)

    assert.ok(xml.includes('pageWidth="680"'), 'content width should expand beyond explicit canvas')
    assert.ok(xml.includes('pageHeight="520"'), 'content height should expand beyond explicit canvas')
  })

  it('should throw error for invalid spec', () => {
    assert.throws(() => specToDrawioXml(null), 'should throw for null')
    assert.throws(() => specToDrawioXml({}), 'should throw for empty object')
    assert.throws(() => specToDrawioXml({ nodes: [] }), 'should throw for empty nodes')
  })

  it('should generate network edge labels from metadata', () => {
    const spec = {
      meta: { theme: 'tech-blue', layout: 'star' },
      nodes: [
        { id: 'fw', label: 'Firewall', type: 'firewall' },
        { id: 'core', label: 'Core Switch', type: 'switch' }
      ],
      edges: [
        {
          from: 'fw',
          to: 'core',
          srcInterface: 'ge-0/0/0',
          dstInterface: 'ge-0/0/1',
          vlan: 10,
          bandwidth: '1G'
        }
      ]
    }

    const xml = specToDrawioXml(spec)
    assert.ok(xml.includes('ge-0/0/0 ↔ ge-0/0/1'), 'should include derived interface label')
    assert.ok(xml.includes('VLAN 10'), 'should include VLAN label')
    assert.ok(xml.includes('1G'), 'should include bandwidth label')
  })

  it('should emit module containers for star and mesh topology examples', () => {
    const starSpec = {
      meta: { theme: 'tech-blue', layout: 'star' },
      modules: [{ id: 'vpc', label: 'AWS VPC' }],
      nodes: [
        { id: 'internet', label: 'Internet Gateway', type: 'internet', module: 'vpc' },
        { id: 'core', label: 'Core Switch', type: 'switch', module: 'vpc' },
        { id: 'app', label: 'App Server', type: 'server', module: 'vpc' }
      ],
      edges: [{ from: 'internet', to: 'core' }]
    }
    const starXml = specToDrawioXml(starSpec)
    const starModuleId = starXml.match(/<mxCell id="(\d+)" value="AWS VPC"[^>]*parent="1">/)?.[1]
    assert.ok(starModuleId, 'star layout should render AWS VPC module cell')
    assert.match(
      starXml,
      new RegExp(`<mxCell id="\\d+" value="App Server"[^>]*parent="${starModuleId}">`),
      'star layout should parent module nodes under the module cell'
    )

    const meshSpec = {
      meta: { theme: 'tech-blue', layout: 'mesh' },
      modules: [{ id: 'dmz', label: 'DMZ' }],
      nodes: [
        { id: 'fw', label: 'Perimeter Firewall', type: 'firewall', module: 'dmz' },
        { id: 'proxy', label: 'Reverse Proxy', type: 'load_balancer', module: 'dmz' }
      ],
      edges: [{ from: 'fw', to: 'proxy' }]
    }
    const meshXml = specToDrawioXml(meshSpec)
    assert.ok(meshXml.includes('value="DMZ"'), 'mesh layout should render DMZ module cell')
  })

  it('should resolve Cisco icon prefixes', () => {
    assert.strictEqual(resolveIconShape('cisco.firewalls.firewall'), 'mxgraph.cisco.firewalls.firewall')
  })

  it('should resolve documented icon aliases', () => {
    assert.strictEqual(resolveIconShape('aws.alb'), 'mxgraph.aws4.application_load_balancer')
    assert.strictEqual(resolveIconShape('aws.ec2'), 'mxgraph.aws4.ec2')
    assert.strictEqual(resolveIconShape('aws.ec2_instance'), 'mxgraph.aws4.ec2')
    assert.strictEqual(resolveIconShape('cisco.ap'), 'mxgraph.cisco.misc.access_point')
  })

  it('should derive node icons from network vendor/device metadata', () => {
    assert.strictEqual(
      deriveNodeIcon({ network: { vendor: 'aws', device: 'load_balancer' } }),
      'aws.application_load_balancer'
    )
    assert.strictEqual(
      deriveNodeIcon({ network: { vendor: 'cisco', device: 'firewall' } }),
      'mxgraph.cisco.security.firewall'
    )
  })

  it('should generate vendor-derived icon shapes when icon field is absent', () => {
    const theme = {
      node: {
        default: { fillColor: '#DBEAFE', strokeColor: '#2563EB', strokeWidth: 1.5, fontColor: '#1E293B', fontSize: 13 }
      },
      typography: { fontFamily: { primary: 'Inter, sans-serif' } }
    }
    const style = generateNodeStyle(
      {
        id: 'fw',
        label: 'Cisco Firewall',
        type: 'firewall',
        network: { vendor: 'cisco', device: 'firewall' }
      },
      theme
    )
    assert.ok(style.includes('shape=mxgraph.cisco.security.firewall'), 'should use vendor-derived stencil shape')
  })

  it('default behavior: 25 nodes returns a string (no error)', () => {
    const nodes = Array.from({ length: 25 }, (_, i) => ({ id: `n${i}`, label: `Node ${i}` }))
    const spec = { meta: { theme: 'tech-blue' }, nodes, edges: [] }
    const result = specToDrawioXml(spec)
    assert.strictEqual(typeof result, 'string', 'should return a string')
    assert.ok(result.includes('<mxGraphModel'), 'should contain mxGraphModel')
  })

  it('strict mode with 61 nodes: should throw containing "Complexity check failed"', () => {
    const nodes = Array.from({ length: 61 }, (_, i) => ({ id: `n${i}`, label: `Node ${i}` }))
    const spec = { meta: { theme: 'tech-blue' }, nodes, edges: [] }
    assert.throws(
      () => specToDrawioXml(spec, { strict: true }),
      (err) => {
        assert.ok(err instanceof Error)
        assert.ok(
          err.message.includes('Complexity check failed'),
          `Expected "Complexity check failed" in: ${err.message}`
        )
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

  it('returnWarnings with 41 nodes: returns { xml, warnings } with warning-level items', () => {
    const nodes = Array.from({ length: 41 }, (_, i) => ({ id: `n${i}`, label: `Node ${i}` }))
    const spec = { meta: { theme: 'tech-blue' }, nodes, edges: [] }
    const result = specToDrawioXml(spec, { returnWarnings: true })
    assert.ok(result && typeof result === 'object', 'should return an object')
    assert.ok(typeof result.xml === 'string', 'result.xml should be a string')
    assert.ok(Array.isArray(result.warnings), 'result.warnings should be an array')
    assert.ok(result.warnings.length > 0, 'should have at least one warning')
    assert.ok(
      result.warnings.every((w) => w.level === 'warning' || w.level === 'error'),
      'warnings should have level field'
    )
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

  it('should parse replication metadata for replicated specs', () => {
    const yamlText = `
meta:
  source: replicated
  theme: tech-blue
  replication:
    colorMode: preserve-original
    background: "#FFF7ED"
    palette:
      - hex: "#FDBA74"
        role: service fill
        appliesTo: nodes
        confidence: high
    confidenceNotes:
      - "Flattened a gradient footer into a solid background"
nodes:
  - id: n1
    label: Box
`
    const spec = parseSpecYaml(yamlText)
    assert.strictEqual(spec.meta.source, 'replicated')
    assert.strictEqual(spec.meta.replication.colorMode, 'preserve-original')
    assert.strictEqual(spec.meta.replication.palette[0].hex, '#FDBA74')
  })

  it('should parse explicit canvas metadata', () => {
    const yamlText = `
meta:
  canvas: 1200x800
nodes:
  - id: n1
    label: Box
`
    const spec = parseSpecYaml(yamlText)
    assert.strictEqual(spec.meta.canvas, '1200x800')
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

  it('should reject invalid replication color modes', () => {
    const yamlText = `
meta:
  source: replicated
  replication:
    colorMode: rainbow
nodes:
  - id: n1
    label: Box
`
    assert.throws(
      () => parseSpecYaml(yamlText),
      /meta\.replication\.colorMode/,
      'invalid replication color modes should be rejected'
    )
  })

  it('should reject invalid canvas metadata', () => {
    const yamlText = `
meta:
  canvas: wide
nodes:
  - id: n1
    label: Box
`
    assert.throws(
      () => parseSpecYaml(yamlText),
      /Invalid meta\.canvas "wide": use "auto" or WIDTHxHEIGHT/,
      'invalid canvas metadata should be rejected'
    )
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
    const style = generateConnectorStyle(
      {
        from: 'a',
        to: 'b',
        type: 'primary',
        style: { startArrow: 'oval', startFill: false }
      },
      theme
    )
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
      nodes: [{ id: 'n1', label: 'Manual Node', position: { x: 100, y: 200 } }]
    }
    const theme = { canvas: { gridSize: 8 }, module: { padding: 24 } }
    const { positions } = calculateLayout(spec, theme)

    assert.ok(positions.has('n1'), 'should have position for n1')
    const pos = positions.get('n1')
    assert.strictEqual(pos.x, 24, 'x should be snapped to 24 (center - grown width/2)')
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
      nodes: [{ id: 'n1', label: 'Auto Only' }]
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
// Phase 2.3b: Text fidelity
// ============================================================================

describe('Phase 2.3b: text fidelity', () => {
  it('should preserve explicit bounds for standalone text nodes and text styling', () => {
    const spec = {
      meta: { theme: 'academic' },
      nodes: [
        {
          id: 'title',
          label: 'World Model',
          type: 'text',
          bounds: { x: 24, y: 32, width: 180, height: 36 },
          style: {
            fontFamily: 'Times New Roman, serif',
            fontSize: 16,
            italic: true,
            align: 'left',
            verticalAlign: 'top',
            spacingLeft: 4,
            spacingTop: 2
          }
        }
      ]
    }

    const xml = specToDrawioXml(spec)
    assert.ok(xml.includes('style="text;'), 'text nodes should use the text shape')
    assert.ok(xml.includes('x="24" y="32" width="180" height="36"'), 'text nodes should preserve explicit bounds')
    assert.ok(xml.includes('fontFamily=Times New Roman, serif'), 'text nodes should preserve font family')
    assert.ok(xml.includes('fontStyle=2'), 'italic text should be exported with the italic fontStyle bit')
    assert.ok(xml.includes('align=left'), 'text nodes should preserve horizontal alignment')
    assert.ok(xml.includes('verticalAlign=top'), 'text nodes should preserve vertical alignment')
    assert.ok(xml.includes('spacingLeft=4'), 'text nodes should preserve left spacing')
  })

  it('should keep formula nodes as dedicated annotations with explicit font styling', () => {
    const spec = {
      meta: { theme: 'academic' },
      nodes: [
        {
          id: 'formula',
          label: '$$h(t)=f(z(t))$$',
          type: 'formula',
          bounds: { x: 260, y: 48, width: 220, height: 56 },
          style: {
            fontFamily: 'Times New Roman, serif',
            fontSize: 15,
            italic: true,
            align: 'center',
            verticalAlign: 'middle'
          }
        }
      ]
    }

    const xml = specToDrawioXml(spec)
    assert.ok(
      xml.includes('shape=text') || /rounded=[01]/.test(xml),
      'formula nodes should remain dedicated annotation nodes'
    )
    assert.ok(xml.includes('fontFamily=Times New Roman, serif'), 'formula nodes should preserve serif typography')
    assert.ok(xml.includes('fontStyle=2'), 'formula nodes should preserve italic styling')
  })

  it('should export explicit edge label offsets away from the connector line', () => {
    const spec = {
      meta: { theme: 'tech-blue' },
      nodes: [
        { id: 'h', label: 'h(t)', bounds: { x: 48, y: 80, width: 96, height: 40 } },
        { id: 'z', label: 'z(t)', bounds: { x: 300, y: 80, width: 96, height: 40 } }
      ],
      edges: [
        {
          from: 'h',
          to: 'z',
          label: 's(t)',
          labelPosition: 'center',
          labelOffset: { x: 0, y: -18 }
        }
      ]
    }

    const xml = specToDrawioXml(spec)
    assert.ok(xml.includes('<mxPoint x="0" y="-18" as="offset"/>'), 'edge labels should preserve the explicit offset')
    assert.match(
      xml,
      /<mxCell id="\d+" value="" style="[^"]*" edge="1"/,
      'parent edge cell should not store duplicate label text'
    )
    assert.equal((xml.match(/value="s\(t\)"/g) || []).length, 1, 'edge label text should be stored once')
    assert.ok(
      xml.includes('fontFamily=Inter, Roboto, system-ui, -apple-system, sans-serif'),
      'edge labels should emit the theme typography font family'
    )
  })

  it('should force all covered text surfaces from meta.font and override node-level fontFamily', () => {
    const spec = {
      meta: {
        theme: 'tech-blue',
        font: {
          primary: 'Times New Roman',
          cjk: 'Simsun',
          formula: 'Cambria Math'
        }
      },
      modules: [{ id: 'm1', label: 'Module Title' }],
      nodes: [
        {
          id: 'n1',
          label: 'English Label',
          module: 'm1',
          style: { fontFamily: 'Arial' }
        },
        {
          id: 'n2',
          label: '$$h(t)=f(z(t))$$',
          type: 'formula'
        }
      ],
      edges: [{ from: 'n1', to: 'n2', label: 'flow' }]
    }

    const xml = specToDrawioXml(spec)
    assert.ok(xml.includes('fontFamily=Times New Roman'), 'primary text surfaces should use meta.font.primary')
    assert.ok(!xml.includes('fontFamily=Arial'), 'node-level fontFamily should be overridden by meta.font')
    assert.ok(xml.includes('fontFamily=Cambria Math'), 'formula surfaces should use meta.font.formula')
  })

  it('should fall back to a Times New Roman + SimSun stack for Chinese text when meta.font is absent', () => {
    const spec = {
      meta: {
        theme: 'academic',
        title: 'Test Figure',
        description: 'Test description',
        figureType: 'architecture'
      },
      modules: [{ id: 'm1', label: '中文模块' }],
      nodes: [
        { id: 'n1', label: '中文标签', module: 'm1' },
        { id: 'n2', label: 'English Label' }
      ],
      edges: [{ from: 'n1', to: 'n2', label: '中文连线' }]
    }

    const xml = specToDrawioXml(spec)
    assert.ok(
      xml.includes('fontFamily=Times New Roman, SimSun'),
      'academic Chinese surfaces should use the theme Times New Roman + SimSun stack'
    )
    assert.ok(
      xml.includes('fontFamily=Times New Roman, Georgia, serif'),
      'non-CJK academic surfaces should keep the theme serif stack'
    )

    const generalXml = specToDrawioXml({
      meta: { theme: 'tech-blue' },
      nodes: [{ id: 'n1', label: '中文标签' }],
      edges: []
    })
    assert.ok(
      generalXml.includes('fontFamily=Times New Roman,SimSun'),
      'general-profile Chinese text should use the built-in Times New Roman,SimSun policy'
    )
  })

  it('should validate meta.font as a complete safe object', () => {
    assert.throws(
      () =>
        validateSpec({
          meta: { font: { primary: 'Times New Roman', cjk: 'Simsun' } },
          nodes: [{ id: 'n1', label: 'Note' }],
          edges: [],
          modules: []
        }),
      /meta\.font\.formula must be a safe font-family string/
    )

    assert.throws(
      () =>
        validateSpec({
          meta: { font: { primary: 'Times;Roman', cjk: 'Simsun', formula: 'Cambria Math' } },
          nodes: [{ id: 'n1', label: 'Note' }],
          edges: [],
          modules: []
        }),
      /meta\.font\.primary must be a safe font-family string/
    )
  })

  it('should validate explicit text bounds and label offsets', () => {
    assert.throws(
      () =>
        validateSpec({
          meta: {},
          nodes: [{ id: 'n1', label: 'Note', bounds: { x: 10, y: 10, width: 0, height: 20 } }],
          edges: [],
          modules: []
        }),
      /bounds width and height must be greater than 0/
    )

    assert.throws(
      () =>
        validateSpec({
          meta: {},
          nodes: [{ id: 'n1', label: 'Note' }],
          edges: [{ from: 'n1', to: 'n2', label: 'flow', labelOffset: { x: 'bad', y: 8 } }],
          modules: []
        }),
      /labelOffset must have numeric x and y/
    )

    assert.throws(
      () =>
        validateSpec({
          meta: { canvas: '0x600' },
          nodes: [{ id: 'n1', label: 'Note' }],
          edges: [],
          modules: []
        }),
      /Invalid meta\.canvas "0x600": width and height must be positive integers/
    )
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

  it('should resolve supported image icons to self-contained data URI styles', () => {
    assert.strictEqual(resolveIconShape('brand.openai'), null)
    const supported = [
      'brand.openai',
      'brand.redis',
      'openai',
      'redis',
      'lobe.openai',
      'lobe.claude',
      'lobe.gemini',
      'lobe.chatgpt',
      'lobe.open-ai',
      'ai.anthropic',
      'lucide.alarm-clock',
      'lucide.bot',
      'lucide.brain-circuit',
      'lucide.cloud',
      'lucide.cpu',
      'lucide.database',
      'lucide.database-zap',
      'lucide.file-text',
      'lucide.layers',
      'lucide.network',
      'lucide.search',
      'lucide.server',
      'lucide.server-cog',
      'lucide.shield',
      'lucide.ai',
      'lucide.cache',
      'lucide.workflow'
    ]
    for (const icon of supported) {
      const style = resolveImageIconStyle(icon)
      assert.match(style, /^shape=image;.*image=data:image\/svg\+xml,/, `${icon} should be embedded`)
      assert.doesNotMatch(style, /https?:\/\//, `${icon} should not require network access`)
    }
  })

  it('should reject unsupported image icon names', () => {
    assert.strictEqual(resolveImageIconStyle('lobe.mistral'), null)
    assert.strictEqual(resolveImageIconStyle('lobe.definitely-not-real'), null)
    assert.strictEqual(resolveImageIconStyle('brand.not-real'), null)
    assert.strictEqual(resolveImageIconStyle('lucide.not-a-real-icon'), null)
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

  it('node with icon aws.lambda should emit the aws4 resourceIcon compound style', () => {
    const style = generateNodeStyle({ id: 'n1', label: 'Lambda', icon: 'aws.lambda' }, theme)
    assert.ok(
      style.includes('shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.lambda'),
      'resource-only aws4 icons must use shape=resourceIcon;resIcon=<name>'
    )
    assert.ok(style.includes('verticalLabelPosition=bottom'), 'should contain verticalLabelPosition=bottom')
    assert.ok(style.includes('labelBackgroundColor=none'), 'should contain labelBackgroundColor=none')
  })

  it('node with icon gcp.functions should have shape=mxgraph.gcp2.functions in style', () => {
    const style = generateNodeStyle({ id: 'n1', label: 'Functions', icon: 'gcp.functions' }, theme)
    assert.ok(style.includes('shape=mxgraph.gcp2.functions'), 'should contain shape=mxgraph.gcp2.functions')
  })

  it('node with icon brand.openai should emit a Lobe Icons image style', () => {
    const style = generateNodeStyle({ id: 'n1', label: 'OpenAI', icon: 'brand.openai' }, theme)
    assert.ok(style.includes('shape=image'), 'should render brand icons as draw.io image cells')
    assert.ok(style.includes('image=data:image/svg+xml,'), 'OpenAI should resolve through embedded normalized Lobe SVG')
    assert.ok(style.includes('verticalLabelPosition=bottom'), 'should label image icons below the icon')
  })

  it('node with icon lobe.gemini should emit a Lobe Icons image style', () => {
    const style = generateNodeStyle({ id: 'n1', label: 'Gemini', icon: 'lobe.gemini' }, theme)
    assert.ok(style.includes('shape=image'), 'should render lobe icons as draw.io image cells')
    assert.ok(style.includes('image=data:image/svg+xml,'))
  })

  it('node with icon lucide.database-zap should emit an embedded image style', () => {
    const style = generateNodeStyle({ id: 'n1', label: 'Cache', icon: 'lucide.database-zap' }, theme)
    assert.ok(style.includes('shape=image'), 'should render lucide icons as draw.io image cells')
    assert.ok(style.includes('image=data:image/svg+xml,'), 'lucide icon should be self-contained SVG data')
  })

  it('node with icon lucide.server-cog should resolve from the bundled icon set', () => {
    const style = generateNodeStyle({ id: 'n1', label: 'Server Ops', icon: 'lucide.server-cog' }, theme)
    assert.ok(style.includes('shape=image'), 'should render bundled Lucide icons as draw.io image cells')
    assert.ok(style.includes('image=data:image/svg+xml,'), 'should embed the bundled SVG content')
    assert.ok(style.includes('%231E293B'), 'should use the normalized draw.io icon color')
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
    assert.ok(
      result.errors.some((e) => e.includes('id="0"')),
      'should report missing id=0 cell'
    )
    assert.ok(
      result.errors.some((e) => e.includes('id="1"')),
      'should report missing id=1 cell'
    )
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
    assert.ok(
      result.errors.some((e) => e.includes('Duplicate') && e.includes('"2"')),
      'should report duplicate ID 2'
    )
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
      result.errors.some((e) => e.includes('source') && e.includes('"999"')),
      'should report nonexistent source ID'
    )
  })

  it('should reject a full-page embedded image cell', () => {
    const xml =
      '<mxGraphModel pageWidth="1200" pageHeight="800">' +
      '<root>' +
      '<mxCell id="0"/>' +
      '<mxCell id="1" parent="0"/>' +
      '<mxCell id="2" value="" style="shape=image;image=data:image/png;base64,abc;" vertex="1" parent="1">' +
      '<mxGeometry x="0" y="0" width="1200" height="800" as="geometry"/>' +
      '</mxCell>' +
      '</root>' +
      '</mxGraphModel>'
    const result = validateXml(xml)
    assert.strictEqual(result.valid, false, 'full-page image should be invalid')
    assert.ok(
      result.errors.some((e) => e.includes('full-page embedded image')),
      'should report full-page embedded image'
    )
  })

  it('should allow small embedded image icon cells', () => {
    const xml =
      '<mxGraphModel pageWidth="1200" pageHeight="800">' +
      '<root>' +
      '<mxCell id="0"/>' +
      '<mxCell id="1" parent="0"/>' +
      '<mxCell id="2" value="" style="shape=image;image=data:image/png;base64,abc;" vertex="1" parent="1">' +
      '<mxGeometry x="40" y="40" width="80" height="80" as="geometry"/>' +
      '</mxCell>' +
      '</root>' +
      '</mxGraphModel>'
    const result = validateXml(xml)
    assert.strictEqual(result.valid, true, 'small image icon should be valid')
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
    assert.notStrictEqual(
      pos1.y,
      pos2.y,
      'vertical layout nodes in different modules should have different Y positions'
    )
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
    const xs = new Set([...positions.values()].map((p) => p.x))
    const ys = new Set([...positions.values()].map((p) => p.y))
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
      nodes: [{ id: 'n1', label: 'Service A', type: 'service' }],
      edges: []
    }
    const xml = specToDrawioXml(spec)
    assert.ok(xml.includes('#0F172A'), 'dark theme XML should contain dark background color #0F172A')
  })

  it('modules produce XML containing module container with correct label', () => {
    const spec = {
      meta: { theme: 'tech-blue' },
      modules: [{ id: 'm1', label: 'MyBackend' }],
      nodes: [{ id: 'n1', label: 'Service', module: 'm1' }],
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
      assert.ok(xml.includes(expectedArrow), `edge type "${type}" should produce "${expectedArrow}" in XML`)
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
    assert.match(xml, /<mxCell id="\d+" value="" style="[^"]*" edge="1"/, 'parent edge cell should keep value empty')
    assert.equal((xml.match(/value="MyEdgeLabel"/g) || []).length, 1, 'edge label should not be duplicated in XML')
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
      nodes: [
        { id: 'n1', label: 'A' },
        { id: 'n2', label: 'B' }
      ],
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

  it('returns no warnings for valid module.color token values', () => {
    const spec = {
      nodes: [{ id: 'n1', label: 'A' }],
      edges: [],
      modules: [{ id: 'm1', label: 'Mod', color: '$accent' }]
    }
    assert.deepStrictEqual(validateColorScheme(spec, theme), [])
  })

  it('returns multiple warnings for multiple invalid values', () => {
    const spec = {
      nodes: [{ id: 'n1', label: 'A', style: { fillColor: 'bad1', strokeColor: 'bad2' } }],
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

  it('validates replication metadata colors', () => {
    const spec = {
      meta: {
        source: 'replicated',
        replication: {
          background: '#FFF7ED',
          palette: [
            { hex: '#FDBA74', role: 'node fill', appliesTo: 'nodes', confidence: 'high' },
            { hex: '#7C2D12', role: 'connector stroke', appliesTo: 'edges', confidence: 'medium' }
          ]
        }
      },
      nodes: [{ id: 'n1', label: 'A' }],
      edges: [],
      modules: []
    }
    assert.deepStrictEqual(validateColorScheme(spec, theme), [])
  })

  it('warns when replication palette colors are not flat hex values', () => {
    const spec = {
      meta: {
        source: 'replicated',
        replication: {
          background: '#FFF7ED',
          palette: [{ hex: '$primary', role: 'bad extracted color', appliesTo: 'nodes' }]
        }
      },
      nodes: [{ id: 'n1', label: 'A' }],
      edges: [],
      modules: []
    }
    const warnings = validateColorScheme(spec, theme)
    assert.strictEqual(warnings.length, 1)
    assert.ok(warnings[0].includes('meta.replication.palette[0].hex'))
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
    const overlapWarning = warnings.find((w) => w.includes('overlap'))
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
    const warnings = validateLayoutConsistency(spec).filter((w) => w.includes('overlap'))
    assert.deepStrictEqual(warnings, [])
  })

  it('skips overlap check when nodes exceed 30 (performance guard)', () => {
    const nodes = Array.from({ length: 31 }, (_, i) => ({
      id: `n${i}`,
      label: `N${i}`,
      position: { x: i * 5, y: i * 5 } // would overlap if checked
    }))
    const spec = { meta: { layout: 'horizontal' }, nodes }
    const warnings = validateLayoutConsistency(spec).filter((w) => w.includes('overlap'))
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
    const colorWarning = result.warnings.find((w) => w.message?.includes('invalid-color'))
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

// ============================================================================
// Theme Style Fidelity Tests (rounded corners, typography, shape catalog)
// ============================================================================

describe('theme style fidelity', () => {
  const academic = loadTheme('academic')
  const techBlue = loadTheme('tech-blue')

  it('academic theme renders service nodes with square corners', () => {
    const style = generateNodeStyle({ id: 's1', label: 'Encoder', type: 'service' }, academic)
    assert.ok(style.includes('rounded=0'), 'academic service nodes should be square')
    assert.ok(!style.includes('arcSize='), 'square corners should not carry an arcSize')
  })

  it('academic theme renders modules with square corners', () => {
    const style = generateModuleStyle({ id: 'm1', label: 'Encoder Stack' }, academic)
    assert.ok(style.includes('rounded=0'), 'academic modules should be square (module.rounded: 0)')
    assert.ok(!style.includes('arcSize='), 'square modules should not carry an arcSize')
  })

  it('terminal stadium shapes keep their semantic rounding under square themes', () => {
    const style = generateNodeStyle({ id: 't1', label: 'Start', type: 'terminal' }, academic)
    assert.ok(style.includes('arcSize=50'), 'stadium rounding is shape semantics, not decoration')
  })

  it('tech-blue theme rounded token overrides SHAPE_STYLES arcSize', () => {
    const style = generateNodeStyle({ id: 's2', label: 'API Gateway', type: 'service' }, techBlue)
    assert.ok(style.includes('rounded=1'), 'tech-blue keeps rounded corners')
    assert.ok(style.includes('arcSize=8'), 'tech-blue node.default.rounded=8 should win over the hardcoded 20')
  })

  it('theme typography supplies node fonts with meta.font staying strongest', () => {
    const themed = generateNodeStyle({ id: 'f1', label: 'API Gateway', type: 'service' }, techBlue)
    assert.ok(themed.includes('fontFamily=Inter, Roboto, system-ui, -apple-system, sans-serif'))

    const formula = generateNodeStyle({ id: 'f2', label: '$$y=mx+b$$', type: 'formula' }, academic)
    assert.ok(
      formula.includes('fontFamily=Latin Modern, STIX Two Math, Times New Roman, serif'),
      'academic formula nodes should use the theme formula stack'
    )

    const xml = specToDrawioXml(
      {
        meta: { theme: 'tech-blue', font: { primary: 'Georgia', cjk: 'SimHei', formula: 'STIX Two Math' } },
        nodes: [{ id: 'n1', label: 'Gateway' }],
        edges: [],
        modules: []
      },
      { silent: true }
    )
    assert.ok(xml.includes('fontFamily=Georgia'), 'meta.font must override theme typography')
    assert.ok(!xml.includes('fontFamily=Inter'), 'meta.font leaves no theme font on covered surfaces')
  })

  it('maps aws subnet devices to the swimlane group instead of an RDS icon', () => {
    assert.strictEqual(deriveNodeIcon({ network: { vendor: 'aws', device: 'subnet' } }), null)
    const style = generateNodeStyle(
      { id: 'sn1', label: 'Public Subnet', network: { vendor: 'aws', device: 'subnet' } },
      techBlue
    )
    assert.ok(style.includes('swimlane'), 'subnet nodes should render as swimlane group boxes')
    assert.ok(!style.includes('rds_instance'), 'subnet must not map to the RDS icon')
  })

  it('emits aws4 resource icons through the compound resourceIcon style', () => {
    const style = generateNodeStyle(
      { id: 'ec1', label: 'App Server', network: { vendor: 'aws', device: 'ec2' } },
      techBlue
    )
    assert.ok(
      style.includes('shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.ec2'),
      'aws4 resource-only icons need shape=resourceIcon;resIcon=<name>'
    )
  })

  it('keeps every SHAPE_STYLES stencil reference inside the shape catalog', () => {
    for (const [type, style] of Object.entries(SHAPE_STYLES)) {
      const match = /(?:^|;)shape=([^;]+)/.exec(style)
      if (!match) continue
      const kind = resolveShapeNameKind(match[1])
      assert.ok(
        kind === 'stencil' || kind === 'builtin' || kind === 'unchecked',
        `SHAPE_STYLES.${type} emits unknown shape "${match[1]}" (${kind})`
      )
    }
  })

  it('warns on icons that resolve to unknown shape names', () => {
    const warnings = validateShapeReferences({
      nodes: [
        { id: 'bad', label: 'Broken', icon: 'cisco.wireless.access_point' },
        { id: 'good', label: 'DB', icon: 'aws.rds' },
        { id: 'brand', label: 'OpenAI', icon: 'brand.openai' },
        { id: 'lucide', label: 'Cache', icon: 'lucide.database-zap' },
        { id: 'badLobe', label: 'Missing Lobe', icon: 'lobe.definitely-not-real' },
        { id: 'badBrand', label: 'Missing Brand', icon: 'brand.not-real' },
        { id: 'badLucide', label: 'Missing Lucide', icon: 'lucide.not-a-real-icon' }
      ]
    })
    assert.equal(warnings.length, 4, 'every unknown shape should warn')
    assert.match(warnings[0], /unknown shape "mxgraph\.cisco\.wireless\.access_point"/)
    assert.match(warnings[1], /unknown shape "lobe\.definitely-not-real"/)
    assert.match(warnings[2], /unknown shape "brand\.not-real"/)
    assert.match(warnings[3], /unknown shape "lucide\.not-a-real-icon"/)
  })
})

describe('academic consistency', () => {
  const academicMeta = {
    profile: 'academic-paper',
    theme: 'academic',
    figureType: 'architecture',
    title: 'Figure',
    description: 'Test figure'
  }

  it('exempts explicit text nodes from the verbose-label warning', () => {
    const spec = {
      meta: { ...academicMeta },
      nodes: [
        {
          id: 'legend',
          type: 'text',
          label: 'Solid: data flow / Dashed: gradients / Dotted: control / Bold: main path / Thin: aux path'
        }
      ],
      edges: []
    }
    const warnings = validateAcademicProfile(spec)
    assert.ok(!warnings.some((w) => w.includes('concise')), 'text nodes must be exempt from the verbose-label rule')
  })

  it('measures label verbosity by visible length, not raw TeX source length', () => {
    const spec = {
      meta: { ...academicMeta },
      nodes: [
        { id: 'math', label: String.raw`$$\mathbf{X} \in \mathbb{R}^{B \times D \times L}$$` },
        { id: 'plain', label: 'A genuinely verbose plain-text label that keeps going well past forty characters' }
      ],
      edges: []
    }
    const verbose = validateAcademicProfile(spec).find((w) => w.includes('concise'))
    assert.ok(verbose, 'plain long label still warns')
    assert.ok(verbose.includes('"plain"'), 'plain node is named')
    assert.ok(!verbose.includes('"math"'), 'TeX label with short visible text is not flagged')
  })

  it('no longer emits the academic density warning (checkComplexity owns density)', () => {
    const spec = {
      meta: { ...academicMeta },
      nodes: Array.from({ length: 30 }, (_, i) => ({ id: `n${i}`, label: `N${i}` })),
      edges: []
    }
    assert.ok(!validateAcademicProfile(spec).some((w) => w.includes('dense')))
  })

  it('warns when a wide canvas drops labels below 8pt at single-column width', () => {
    const spec = {
      meta: { ...academicMeta, canvas: '1600x900' },
      nodes: [{ id: 'a', label: 'A', style: { fontSize: 10 } }],
      edges: []
    }
    const sizeWarning = validateAcademicProfile(spec).find((w) => w.includes('252pt'))
    assert.ok(sizeWarning, 'expected layout-size warning for 1600px canvas')
    assert.ok(sizeWarning.includes('1600px'), 'mentions canvas width')
    assert.ok(sizeWarning.includes('>= 51'), 'prescribes ceil(1600 / 31.5) = 51')
  })

  it('keeps existing-scale canvases (<= 1500px) silent', () => {
    const spec = {
      meta: { ...academicMeta, canvas: '1200x800' },
      nodes: [{ id: 'a', label: 'A', style: { fontSize: 10 } }],
      edges: []
    }
    assert.ok(!validateAcademicProfile(spec).some((w) => w.includes('252pt')))
  })

  it('flags unknown meta keys but accepts template metadata', () => {
    const warnings = validateSchemaDrift({
      meta: { title: 't', template: 'compact', canvasSize: '1200x800', gridSize: 8 },
      nodes: [{ id: 'n1', label: 'L' }]
    })
    assert.equal(warnings.length, 1)
    assert.ok(warnings[0].includes('"canvasSize"'))
    assert.ok(warnings[0].includes('"gridSize"'))
    assert.ok(!warnings[0].includes('"template"'))
  })

  it('flags unknown node.style keys such as shape and rounded', () => {
    const warnings = validateSchemaDrift({
      meta: { title: 't' },
      nodes: [{ id: 'n1', label: 'L', style: { shape: 'box', rounded: false, fillColor: '#FFFFFF' } }]
    })
    assert.equal(warnings.length, 1)
    assert.ok(warnings[0].includes('"n1"'))
    assert.ok(warnings[0].includes('"shape"'))
    assert.ok(warnings[0].includes('"rounded"'))
    assert.ok(!warnings[0].includes('"fillColor"'))
  })

  it('flags unknown module keys such as bounds', () => {
    const warnings = validateSchemaDrift({
      meta: { title: 't' },
      nodes: [{ id: 'n1', label: 'L' }],
      modules: [{ id: 'm1', label: 'M', bounds: { x: 0, y: 0, width: 100, height: 100 } }]
    })
    assert.equal(warnings.length, 1)
    assert.ok(warnings[0].includes('"m1"'))
    assert.ok(warnings[0].includes('"bounds"'))
  })

  it('fails strict conversion when schema drift is present', () => {
    const spec = {
      meta: { title: 't', canvasSize: '1200x800' },
      nodes: [{ id: 'n1', label: 'L' }],
      edges: []
    }
    assert.throws(() => specToDrawioXml(spec, { strict: true, silent: true }), /canvasSize/)
    assert.doesNotThrow(() => specToDrawioXml(spec, { silent: true }))
  })

  it('aggregates long-label infos and keeps the 200-char fatal per node', () => {
    const longLabel = 'This label is definitely longer than fourteen characters'
    const spec = {
      nodes: [
        { id: 'a', label: longLabel },
        { id: 'b', label: longLabel },
        { id: 'c', label: longLabel },
        { id: 'd', label: longLabel },
        { id: 'e', label: 'x'.repeat(201) }
      ],
      edges: []
    }
    const warnings = checkComplexity(spec)
    const infos = warnings.filter((w) => w.level === 'info')
    assert.equal(infos.length, 1)
    assert.ok(infos[0].message.includes('4 node label(s)'))
    assert.ok(infos[0].message.includes('"a", "b", "c" +1 more'))
    const fatals = warnings.filter((w) => w.level === 'fatal')
    assert.equal(fatals.length, 1)
    assert.ok(fatals[0].message.includes('"e"'))
  })
})

describe('tiered layout and centered slots', () => {
  it('places network tiers in North-South rows', () => {
    const spec = {
      meta: { layout: 'tiered' },
      nodes: [
        { id: 'net', label: 'Internet', network: { role: 'internet' } },
        { id: 'fw', label: 'Edge FW', network: { role: 'firewall' } },
        { id: 'core', label: 'Core SW', network: { role: 'core' } },
        { id: 'dist', label: 'Dist SW', network: { role: 'distribution' } },
        { id: 'acc1', label: 'Access 1', network: { role: 'access' } },
        { id: 'acc2', label: 'Access 2', network: { role: 'access' } },
        { id: 'srv', label: 'App Server', network: { role: 'server' } }
      ],
      edges: []
    }
    const layout = calculateLayout(spec, loadTheme('tech-blue'))
    const y = (id) => layout.positions.get(id).y
    assert.ok(y('net') < y('fw'))
    assert.ok(y('fw') < y('core'))
    assert.ok(y('core') < y('dist'))
    assert.ok(y('dist') < y('acc1'))
    assert.equal(y('acc1'), y('acc2'))
    assert.ok(y('acc1') < y('srv'))
  })

  it('keeps explicitly positioned nodes untouched in tiered layout', () => {
    const spec = {
      meta: { layout: 'tiered' },
      nodes: [
        {
          id: 'pinned',
          label: 'Pinned',
          bounds: { x: 500, y: 500, width: 100, height: 40 },
          network: { role: 'core' }
        },
        { id: 'auto', label: 'Auto', network: { role: 'access' } }
      ],
      edges: []
    }
    const layout = calculateLayout(spec, loadTheme('tech-blue'))
    assert.deepEqual(layout.positions.get('pinned'), { x: 500, y: 500, width: 100, height: 40 })
  })

  it('validateSpec accepts tiered and still rejects unknown layouts', () => {
    assert.doesNotThrow(() =>
      validateSpec({ meta: { layout: 'tiered' }, nodes: [{ id: 'a', label: 'A' }], edges: [], modules: [] })
    )
    assert.throws(() =>
      validateSpec({ meta: { layout: 'diagonal' }, nodes: [{ id: 'a', label: 'A' }], edges: [], modules: [] })
    )
  })

  it('centers the connection point when a face has a single edge', () => {
    const spec = {
      meta: { layout: 'horizontal' },
      modules: [{ id: 'm1', label: 'M1' }],
      nodes: [
        { id: 'a', label: 'A', module: 'm1' },
        { id: 'b', label: 'B' }
      ],
      edges: [{ from: 'a', to: 'b' }]
    }
    const xml = specToDrawioXml(spec, { silent: true })
    assert.ok(xml.includes('exitY=0.5'), 'single-edge source face centers at 0.5')
    assert.ok(xml.includes('entryY=0.5'), 'single-edge target face centers at 0.5')
    assert.ok(!xml.includes('exitY=0.25'))
  })

  it('distributes multiple edges on a shared face across slots', () => {
    const spec = {
      meta: { layout: 'horizontal' },
      nodes: [
        { id: 'a', label: 'A', position: { x: 100, y: 200 } },
        { id: 'b', label: 'B', position: { x: 400, y: 100 } },
        { id: 'c', label: 'C', position: { x: 400, y: 300 } }
      ],
      edges: [
        { from: 'a', to: 'b' },
        { from: 'a', to: 'c' }
      ]
    }
    const xml = specToDrawioXml(spec, { silent: true })
    // Slots keep the legacy 0.25-first order but dodge to the next slot that
    // honors the 30px corridor rule (0.5 on a 60px face is only 15px away).
    assert.ok(xml.includes('exitY=0.25'))
    assert.ok(xml.includes('exitY=0.75'))
  })
})

describe('layout quality metrics', () => {
  it('counts an edge cutting through an unrelated node', () => {
    const spec = {
      meta: { layout: 'horizontal' },
      nodes: [
        { id: 'a', label: 'A', bounds: { x: 40, y: 100, width: 80, height: 40 } },
        { id: 'mid', label: 'Mid', bounds: { x: 240, y: 100, width: 80, height: 40 } },
        { id: 'c', label: 'C', bounds: { x: 440, y: 100, width: 80, height: 40 } }
      ],
      edges: [{ from: 'a', to: 'c' }]
    }
    const metrics = computeLayoutQualityMetrics(spec)
    assert.equal(metrics.edgeNodeCrossings, 1)
    assert.equal(metrics.edgeEdgeCrossings, 0)
    assert.equal(metrics.totalEdgeLength, 320)
  })

  it('counts crossing edge pairs and stays silent for clean layouts', () => {
    const crossing = {
      meta: { layout: 'horizontal' },
      nodes: [
        { id: 'a', label: 'A', bounds: { x: 40, y: 40, width: 80, height: 40 } },
        { id: 'b', label: 'B', bounds: { x: 40, y: 240, width: 80, height: 40 } },
        { id: 'c', label: 'C', bounds: { x: 440, y: 40, width: 80, height: 40 } },
        { id: 'd', label: 'D', bounds: { x: 440, y: 240, width: 80, height: 40 } }
      ],
      edges: [
        { from: 'a', to: 'd' },
        { from: 'b', to: 'c' }
      ]
    }
    assert.equal(computeLayoutQualityMetrics(crossing).edgeEdgeCrossings, 1)

    const clean = {
      meta: { layout: 'horizontal' },
      nodes: [
        { id: 'a', label: 'A', bounds: { x: 40, y: 40, width: 80, height: 40 } },
        { id: 'b', label: 'B', bounds: { x: 240, y: 40, width: 80, height: 40 } }
      ],
      edges: [{ from: 'a', to: 'b' }]
    }
    const metrics = computeLayoutQualityMetrics(clean)
    assert.equal(metrics.edgeNodeCrossings, 0)
    assert.equal(metrics.edgeEdgeCrossings, 0)
    assert.equal(metrics.totalEdgeLength, 120)
  })
})

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
        { id: 'v', label: '可\n视\n化', type: 'text', bounds: { x: 0, y: 0, width: 32, height: 80 } },
        { id: 'a', label: 'A', bounds: { x: 100, y: 200, width: 80, height: 40 } },
        { id: 'b', label: 'B', bounds: { x: 100, y: 400, width: 80, height: 40 } }
      ],
      edges: [{ from: 'a', to: 'b', label: '上\n位' }]
    }
    const xml = specToDrawioXml(spec, { silent: true })
    assert.ok(xml.includes('可&lt;br&gt;视&lt;br&gt;化'), 'node label newlines become <br>')
    assert.ok(xml.includes('上&lt;br&gt;位'), 'edge label newlines become <br>')
  })

  it('keeps math labels free of injected <br> tags', () => {
    const spec = {
      meta: {},
      nodes: [{ id: 'f', label: '$$a=b\nc=d$$', type: 'formula', bounds: { x: 0, y: 0, width: 120, height: 60 } }],
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

// ============================================================================
// Font ladder, content-aware sizing, class shrink, and print gate
// ============================================================================

describe('font ladder and fit system', () => {
  const academicMeta = {
    profile: 'academic-paper',
    figureType: 'architecture',
    theme: 'academic',
    title: 'T',
    description: 'D'
  }

  it('materializes the ladder (module 22 / node 20 / edge 18) and keeps author YAML untouched', () => {
    const spec = {
      meta: { ...academicMeta },
      modules: [{ id: 'm1', label: '服务接口层' }],
      nodes: [
        { id: 'a', label: '训练服务\n独立子进程 · GPU绑定', type: 'service', module: 'm1' },
        { id: 'b', label: 'Training API', type: 'service', module: 'm1' }
      ],
      edges: [{ from: 'a', to: 'b', label: '操作请求' }]
    }
    const xml = specToDrawioXml(spec, { silent: true })
    assert.ok(xml.includes('fontSize=22'), 'module titles should use the 22px ladder value')
    assert.ok(xml.includes('fontSize=20'), 'node labels should use the 20px ladder value')
    assert.ok(xml.includes('fontSize=18'), 'edge labels should use the 18px ladder value')
    assert.strictEqual(spec.nodes[0].style, undefined, 'font planning must not mutate the author spec')
  })

  it('grows preset boxes to fit long labels only in content-aware mode', () => {
    const label = 'APScheduler 单实例（周期触发 · 任务登记 · 作业库持久化）'
    const grown = getNodeSize(null, 'service', label, { contentAware: true, fontSize: 20 })
    assert.ok(grown.width > 400, `long CJK label should grow the box, got ${grown.width}`)
    const legacy = getNodeSize(null, 'service', label)
    assert.deepStrictEqual(legacy, { width: 120, height: 60 }, 'without options the preset is unchanged')
    const operator = getNodeSize(null, 'operator', 'max', { contentAware: true, fontSize: 20 })
    assert.deepStrictEqual(operator, { width: 32, height: 32 }, 'operators keep their size-coded preset')
  })

  it('shrinks a class uniformly to the tightest explicit bounds', () => {
    const spec = {
      meta: { ...academicMeta },
      nodes: [
        { id: 'n1', label: '统一调度层核心组件', type: 'service', bounds: { x: 0, y: 0, width: 180, height: 48 } },
        { id: 'n2', label: '短标签', type: 'service', bounds: { x: 0, y: 100, width: 300, height: 48 } }
      ],
      edges: []
    }
    const xml = specToDrawioXml(spec, { silent: true })
    const sizes = [...xml.matchAll(/fontSize=(\d+)/g)].map((m) => Number(m[1]))
    assert.deepStrictEqual(sizes, [18, 18], 'both class members should share the shrunk size')
  })

  it('clamps the shrink at the floor and reports the leftover overflow', () => {
    const spec = {
      meta: { ...academicMeta },
      nodes: [
        { id: 'x', label: '超长中文标签放不下这个盒子的情况', type: 'service', bounds: { x: 0, y: 0, width: 90, height: 30 } }
      ],
      edges: []
    }
    const { xml, warnings } = specToDrawioXml(spec, { returnWarnings: true, silent: true })
    assert.ok(xml.includes('fontSize=12'), 'shrink should stop at the 12px floor')
    assert.ok(
      warnings.some((w) => String(w.message).includes('label needs')),
      'validateLabelFit should report the overflow left at the floor'
    )
  })

  it('keeps explicit style.fontSize overrides on nodes and edges', () => {
    const spec = {
      meta: { theme: 'tech-blue' },
      nodes: [
        { id: 'e1', label: '固定字号', type: 'service', style: { fontSize: 9 } },
        { id: 'e2', label: 'B', type: 'service' }
      ],
      edges: [{ from: 'e1', to: 'e2', label: 'flow', style: { fontSize: 10 } }]
    }
    const xml = specToDrawioXml(spec, { silent: true })
    assert.ok(xml.includes('fontSize=9;'), 'node override should survive font planning')
    assert.ok(xml.includes('fontSize=10;'), 'edge override should survive font planning')
  })

  it('meta.print drives the print-readability warning', () => {
    const spec = {
      meta: { ...academicMeta, canvas: '1900x900', print: { target: 'cn-thesis' } },
      modules: [],
      nodes: [{ id: 'p1', label: '节点', type: 'service' }],
      edges: []
    }
    const { warnings } = specToDrawioXml(spec, { returnWarnings: true, silent: true })
    const printWarning = warnings.map((w) => String(w.message)).find((m) => m.includes('prints at'))
    assert.ok(printWarning, 'wide canvas with cn-thesis target should warn')
    assert.ok(printWarning.includes('440'), 'warning should use the cn-thesis 440pt width')
    assert.ok(printWarning.includes('9pt floor'), 'warning should use the cn-thesis 9pt floor')
  })

  it('validates meta.print shape', () => {
    const base = { nodes: [{ id: 'n1', label: 'Note' }], edges: [], modules: [] }
    assert.throws(
      () => validateSpec({ ...base, meta: { print: { target: 'a4' } } }),
      /Invalid meta\.print\.target/
    )
    assert.throws(
      () => validateSpec({ ...base, meta: { print: { target: 'cn-thesis', widthPt: -1 } } }),
      /meta\.print\.widthPt must be a positive number/
    )
    assert.throws(() => validateSpec({ ...base, meta: { print: {} } }), /meta\.print requires target or widthPt/)
  })

  it('no longer warns about 8-10pt labels on the academic profile', () => {
    const spec = {
      meta: { ...academicMeta },
      modules: [],
      nodes: [{ id: 'n1', label: 'Node', type: 'service', style: { fontSize: 20 } }],
      edges: []
    }
    const { warnings } = specToDrawioXml(spec, { returnWarnings: true, silent: true })
    assert.ok(
      warnings.every((w) => !String(w.message).includes('8-10pt')),
      'the misleading 8-10pt gate should be gone'
    )
  })
})

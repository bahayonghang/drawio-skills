/**
 * spec-to-drawio.js
 * Converts YAML/JSON specification to draw.io XML with Design System support
 */

import { prepareMathLabel } from '../math/index.js'

// ============================================================================
// Theme Loading
// ============================================================================

const DEFAULT_THEME = {
  name: 'tech-blue',
  colors: {
    primary: '#2563EB',
    primaryLight: '#DBEAFE',
    secondary: '#059669',
    secondaryLight: '#D1FAE5',
    accent: '#7C3AED',
    accentLight: '#EDE9FE',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    textMuted: '#64748B',
    border: '#E2E8F0'
  },
  spacing: { unit: 8 },
  typography: {
    fontFamily: {
      primary: 'Inter, Roboto, system-ui, sans-serif',
      monospace: 'JetBrains Mono, Fira Code, Consolas, monospace'
    },
    fontSize: { md: 13, sm: 11 }
  },
  borderRadius: { md: 8, lg: 12 },
  node: {
    default: {
      fillColor: '#DBEAFE',
      strokeColor: '#2563EB',
      strokeWidth: 1.5,
      fontColor: '#1E293B',
      fontSize: 13,
      rounded: 8
    },
    // Traditional types
    service: { fillColor: '#DBEAFE', strokeColor: '#2563EB' },
    database: { fillColor: '#D1FAE5', strokeColor: '#059669' },
    decision: { fillColor: '#FEF3C7', strokeColor: '#D97706' },
    terminal: { fillColor: '#F1F5F9', strokeColor: '#64748B' },
    queue: { fillColor: '#EDE9FE', strokeColor: '#7C3AED' },
    user: { fillColor: '#E0F2FE', strokeColor: '#0284C7' },
    document: { fillColor: '#FFFFFF', strokeColor: '#CBD5E1' },
    formula: { fillColor: '#FFFFFF', strokeColor: '#2563EB', strokeWidth: 1 },
    // Deep learning types
    input: { fillColor: '#FFCDD2', strokeColor: '#E57373' },
    output: { fillColor: '#CFD8DC', strokeColor: '#78909C' },
    loss: { fillColor: '#FFCCBC', strokeColor: '#FF7043' },
    feature: { fillColor: '#BBDEFB', strokeColor: '#42A5F5' },
    conv: { fillColor: '#BBDEFB', strokeColor: '#1E88E5' },
    pool: { fillColor: '#B3E5FC', strokeColor: '#039BE5' },
    embed: { fillColor: '#D1C4E9', strokeColor: '#7E57C2' },
    temporal: { fillColor: '#E1BEE7', strokeColor: '#AB47BC' },
    attention: { fillColor: '#C8E6C9', strokeColor: '#66BB6A' },
    gate: { fillColor: '#FFE0B2', strokeColor: '#FFA726' },
    norm: { fillColor: '#DCEDC8', strokeColor: '#8BC34A' },
    graph: { fillColor: '#B2EBF2', strokeColor: '#26C6DA' },
    matrix: { fillColor: '#E8EAF6', strokeColor: '#7986CB' },
    operator: { fillColor: '#FFFFFF', strokeColor: '#424242' }
  },
  connector: {
    primary: { strokeColor: '#1E293B', strokeWidth: 2, dashed: false, endArrow: 'block', endFill: true },
    data: { strokeColor: '#1E293B', strokeWidth: 2, dashed: true, dashPattern: '6 4', endArrow: 'block', endFill: true },
    optional: { strokeColor: '#64748B', strokeWidth: 1, dashed: true, dashPattern: '2 2', endArrow: 'open', endFill: false },
    dependency: { strokeColor: '#1E293B', strokeWidth: 1, dashed: false, endArrow: 'diamond', endFill: true },
    bidirectional: { strokeColor: '#64748B', strokeWidth: 1.5, dashed: false, endArrow: 'none', endFill: false }
  },
  module: {
    fillColor: '#F8FAFC',
    strokeColor: '#E2E8F0',
    strokeWidth: 1,
    rounded: 12,
    padding: 24,
    labelFontSize: 14,
    labelFontWeight: 600,
    labelFontColor: '#1E293B',
    dashed: false,
    dashPattern: '8 4'
  },
  canvas: {
    background: '#FFFFFF',
    gridSize: 8
  }
}

/**
 * Load theme by name (returns default if not found)
 */
export function loadTheme(themeName) {
  // In a real implementation, this would load from JSON files
  // For now, return default theme
  return DEFAULT_THEME
}

// ============================================================================
// Semantic Shape Mapping
// ============================================================================

const SHAPE_KEYWORDS = {
  // Traditional types (check first for backward compatibility)
  database: ['database', 'db', 'sql', 'storage', 'redis', 'mongo', 'postgresql', 'mysql', 'cache'],
  decision: ['decision', 'condition', 'branch', 'switch', 'route'],
  terminal: ['start', 'begin', 'end', 'finish', 'stop', 'terminate'],
  queue: ['queue', 'buffer', 'kafka', 'rabbitmq', 'stream', 'sqs', 'message'],
  user: ['user', 'user icon', 'client', 'person', 'customer', 'human'],
  document: ['document', 'doc', 'file', 'report', 'log'],
  formula: ['formula', 'equation', 'math', '$$'],
  cloud: ['cloud', 'internet', 'external', 'web'],

  // Deep learning - Input/Output
  input: ['input_', 'input layer', 'inputdata', 'x_train', 'x_test', 'sample batch', 'input data', 'input signal'],
  output: ['output_', 'output layer', 'prediction', 'y_hat', 'logits', 'probs', 'output data', 'reconstructed'],
  loss: ['loss', 'criterion', 'objective', 'mse loss', 'cross_entropy', 'bceloss', 'loss function', 'error'],

  // Deep learning - Feature extraction & Encoding/Decoding
  feature: ['feature extractor', 'backbone', 'encoder block', 'feature extraction'],
  conv: ['conv1d', 'conv2d', 'conv3d', 'convolution', 'convolutional', 'tcn', '1d conv', '2d conv', '3d conv'],
  pool: ['pooling', 'maxpool', 'avgpool', 'adaptive pool', 'max pooling', 'avg pooling', 'global pool'],
  embed: ['embedding', 'embeddings', 'lookup', 'token embed', 'word embed', 'positional'],

  // Deep learning - Decoder (separate from encoder for different colors if needed)
  // Using feature type for decoder as it's semantically similar

  // Deep learning - Temporal/Sequential
  temporal: ['lstm', 'rnn', 'gru', 'temporal', 'recurrent', 'sequence', 'seq2seq', 'bilstm', 'bigru', 'hidden state'],

  // Deep learning - Attention & Transformer
  attention: ['attention', 'attn', 'softmax', 'transformer', 'self-attention', 'multi-head', 'mha', 'cross-attention', 'qkv'],

  // Deep learning - Normalization & Regularization
  norm: ['batchnorm', 'layernorm', 'groupnorm', 'instancenorm', 'normalization', 'batch norm', 'layer norm', 'dropout'],

  // Deep learning - Gate & Activation
  gate: ['gating', 'gate mechanism', 'multiply gate', 'sigmoid gate', 'tanh gate', 'forget gate', 'input gate', 'output gate'],

  // Deep learning - Graph Neural Network
  graph: ['graph conv', 'gcn', 'gnn', 'graph attention', 'adjacency', 'node feature', 'edge feature', 'message passing', 'aggregation'],

  // Deep learning - Matrix operations & Linear layers
  matrix: ['matmul', 'linear layer', 'fc layer', 'dense layer', 'mlp', 'weight matrix', 'fully connected', 'projection'],

  // Deep learning - Operators (for small circular nodes)
  operator: ['⊕', '⊗', '⊙', 'concat', 'element-wise', 'hadamard', 'residual add', 'skip add', '⊞'],

  // Deep learning - 3D Feature Maps / Tensors (for CNN visualizations)
  tensor3d: ['tensor', 'feature map', '3d feature', 'activation map', 'channel', 'h×w×c', 'hwc', 'chw', 'nchw', 'nhwc', 'cube', '3d block', 'volume']
}

const SHAPE_STYLES = {
  // Traditional shapes
  service: 'rounded=1;arcSize=20',
  database: 'shape=cylinder3;boundedLbl=1;backgroundOutline=1;size=15',
  decision: 'rhombus',
  terminal: 'rounded=1;arcSize=50',
  queue: 'shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1',
  user: 'ellipse',
  document: 'shape=document;boundedLbl=1',
  formula: 'rounded=1',
  cloud: 'ellipse;shape=cloud',
  process: 'rounded=1;arcSize=20',

  // Deep learning shapes
  input: 'rounded=1;arcSize=15',
  output: 'rounded=1;arcSize=15',
  loss: 'rounded=1;arcSize=15',
  feature: 'rounded=1;arcSize=15',
  conv: 'rounded=1;arcSize=10',
  pool: 'rounded=1;arcSize=10',
  embed: 'rounded=1;arcSize=15',
  temporal: 'rounded=1;arcSize=15',
  attention: 'rounded=1;arcSize=15',
  gate: 'rounded=1;arcSize=10',
  norm: 'rounded=1;arcSize=10',
  graph: 'rounded=1;arcSize=15',
  matrix: 'rounded=1;arcSize=5',
  operator: 'ellipse',
  tensor3d: 'shape=cube;size=10;direction=south'
}

/**
 * Detect semantic type from label if not explicitly specified
 */
export function detectSemanticType(label, explicitType) {
  if (explicitType && SHAPE_STYLES[explicitType]) {
    return explicitType
  }

  const lowerLabel = label.toLowerCase()

  // Check for formula delimiters first (highest priority)
  if (label.includes('$$') || label.includes('\\(') || label.includes('\\[')) {
    return 'formula'
  }

  // Check for decision patterns: questions ending with ? or containing check/if
  if (label.includes('?') || /\b(check|if|valid)\b/i.test(label)) {
    return 'decision'
  }

  // Check keywords by type
  for (const [type, keywords] of Object.entries(SHAPE_KEYWORDS)) {
    if (keywords.some(kw => lowerLabel.includes(kw))) {
      return type
    }
  }

  return 'service' // Default
}

// ============================================================================
// Size Presets
// ============================================================================

const SIZE_PRESETS = {
  tiny: { width: 32, height: 32 },      // For operators (⊕⊗)
  small: { width: 80, height: 40 },
  medium: { width: 120, height: 60 },
  large: { width: 160, height: 80 },
  xl: { width: 200, height: 100 },
  // 3D Feature Map sizes (cube-like proportions)
  tensor_sm: { width: 40, height: 48 },   // Small feature map
  tensor_md: { width: 60, height: 72 },   // Medium feature map
  tensor_lg: { width: 80, height: 96 },   // Large feature map
  tensor_xl: { width: 100, height: 120 }  // Extra large feature map
}

// Default sizes for specific node types
const TYPE_DEFAULT_SIZES = {
  operator: 'tiny',
  decision: 'medium',
  terminal: 'small',
  user: 'small',
  tensor3d: 'tensor_md'
}

/**
 * Get node dimensions based on size preset or node type
 */
export function getNodeSize(size, nodeType = null) {
  // If explicit size is provided and valid, use it
  if (size && SIZE_PRESETS[size]) {
    return SIZE_PRESETS[size]
  }
  // If node type has a default size, use it
  if (nodeType && TYPE_DEFAULT_SIZES[nodeType]) {
    return SIZE_PRESETS[TYPE_DEFAULT_SIZES[nodeType]]
  }
  // Fallback to medium
  return SIZE_PRESETS.medium
}

// ============================================================================
// Grid Snapping
// ============================================================================

/**
 * Snap value to 8px grid
 */
export function snapToGrid(value, gridSize = 8) {
  return Math.round(value / gridSize) * gridSize
}

// ============================================================================
// Layout Engine
// ============================================================================

/**
 * Calculate positions for nodes based on layout type
 */
export function calculateLayout(spec, theme) {
  const layout = spec.meta?.layout || 'horizontal'
  const gridSize = theme.canvas?.gridSize || 8
  const nodeMargin = 32 // Minimum space between nodes
  const containerPadding = theme.module?.padding || 24

  const nodes = spec.nodes || []
  const modules = spec.modules || []
  const positions = new Map()

  // Group nodes by module
  const moduleGroups = new Map()
  moduleGroups.set('__default__', [])
  
  for (const mod of modules) {
    moduleGroups.set(mod.id, [])
  }
  
  for (const node of nodes) {
    const moduleId = node.module || '__default__'
    if (!moduleGroups.has(moduleId)) {
      moduleGroups.set(moduleId, [])
    }
    moduleGroups.get(moduleId).push(node)
  }

  let currentX = 40
  let currentY = 40
  const modulePositions = new Map()

  if (layout === 'horizontal') {
    // Horizontal: modules side by side, nodes stacked vertically
    for (const [moduleId, moduleNodes] of moduleGroups) {
      if (moduleNodes.length === 0) continue

      const moduleX = snapToGrid(currentX, gridSize)
      const moduleY = snapToGrid(40, gridSize)
      let maxWidth = 0
      let nodeY = moduleY + containerPadding + 40 // Header space

      for (const node of moduleNodes) {
        const semanticType = detectSemanticType(node.label, node.type)
        const size = getNodeSize(node.size, semanticType)
        const nodeX = snapToGrid(moduleX + containerPadding, gridSize)
        positions.set(node.id, {
          x: nodeX,
          y: snapToGrid(nodeY, gridSize),
          width: size.width,
          height: size.height
        })
        maxWidth = Math.max(maxWidth, size.width)
        nodeY += size.height + nodeMargin
      }

      const moduleWidth = maxWidth + containerPadding * 2
      const moduleHeight = nodeY - moduleY + containerPadding
      
      modulePositions.set(moduleId, {
        x: moduleX,
        y: moduleY,
        width: snapToGrid(moduleWidth, gridSize),
        height: snapToGrid(moduleHeight, gridSize)
      })

      currentX += moduleWidth + nodeMargin
    }
  } else if (layout === 'vertical') {
    // Vertical: modules stacked, nodes side by side
    for (const [moduleId, moduleNodes] of moduleGroups) {
      if (moduleNodes.length === 0) continue

      const moduleX = snapToGrid(40, gridSize)
      const moduleY = snapToGrid(currentY, gridSize)
      let nodeX = moduleX + containerPadding
      let maxHeight = 0

      for (const node of moduleNodes) {
        const semanticType = detectSemanticType(node.label, node.type)
        const size = getNodeSize(node.size, semanticType)
        positions.set(node.id, {
          x: snapToGrid(nodeX, gridSize),
          y: snapToGrid(moduleY + containerPadding + 40, gridSize),
          width: size.width,
          height: size.height
        })
        maxHeight = Math.max(maxHeight, size.height)
        nodeX += size.width + nodeMargin
      }

      const moduleWidth = nodeX - moduleX + containerPadding
      const moduleHeight = maxHeight + containerPadding * 2 + 40
      
      modulePositions.set(moduleId, {
        x: moduleX,
        y: moduleY,
        width: snapToGrid(moduleWidth, gridSize),
        height: snapToGrid(moduleHeight, gridSize)
      })

      currentY += moduleHeight + nodeMargin
    }
  } else {
    // Hierarchical or other: simple grid layout
    let row = 0
    let col = 0
    const maxCols = 4

    for (const node of nodes) {
      const semanticType = detectSemanticType(node.label, node.type)
      const size = getNodeSize(node.size, semanticType)
      positions.set(node.id, {
        x: snapToGrid(40 + col * (size.width + nodeMargin), gridSize),
        y: snapToGrid(40 + row * (size.height + nodeMargin), gridSize),
        width: size.width,
        height: size.height
      })
      col++
      if (col >= maxCols) {
        col = 0
        row++
      }
    }
  }

  return { positions, modulePositions }
}

// ============================================================================
// Style Generation
// ============================================================================

/**
 * Generate mxCell style string for a node
 */
export function generateNodeStyle(node, theme) {
  const semanticType = detectSemanticType(node.label, node.type)
  const shapeStyle = SHAPE_STYLES[semanticType] || SHAPE_STYLES.service
  
  // Get colors from theme
  const nodeTheme = theme.node?.[semanticType] || theme.node?.default || {}
  const defaultTheme = theme.node?.default || {}
  
  const fillColor = node.style?.fillColor || nodeTheme.fillColor || defaultTheme.fillColor || '#DBEAFE'
  const strokeColor = node.style?.strokeColor || nodeTheme.strokeColor || defaultTheme.strokeColor || '#2563EB'
  const strokeWidth = node.style?.strokeWidth || nodeTheme.strokeWidth || defaultTheme.strokeWidth || 1.5
  const fontColor = node.style?.fontColor || nodeTheme.fontColor || defaultTheme.fontColor || '#1E293B'
  const fontSize = node.style?.fontSize || nodeTheme.fontSize || defaultTheme.fontSize || 13
  const fontFamily = theme.typography?.fontFamily?.primary || 'Inter, sans-serif'

  const parts = [
    shapeStyle,
    'html=1',
    'whiteSpace=wrap',
    `fillColor=${fillColor}`,
    `strokeColor=${strokeColor}`,
    `strokeWidth=${strokeWidth}`,
    `fontColor=${fontColor}`,
    `fontSize=${fontSize}`,
    `fontFamily=${fontFamily}`,
    'verticalAlign=middle',
    'align=center'
  ]

  return parts.join(';')
}

/**
 * Generate mxCell style string for a connector
 */
export function generateConnectorStyle(edge, theme, routing = 'orthogonal') {
  const connectorType = edge.type || 'primary'
  const connectorTheme = theme.connector?.[connectorType] || theme.connector?.primary || {}
  
  const strokeColor = edge.style?.strokeColor || connectorTheme.strokeColor || '#1E293B'
  const strokeWidth = edge.style?.strokeWidth || connectorTheme.strokeWidth || 2
  const dashed = edge.style?.dashed ?? connectorTheme.dashed ?? false
  const dashPattern = edge.style?.dashPattern || connectorTheme.dashPattern || '6 4'
  const endArrow = edge.style?.endArrow || connectorTheme.endArrow || 'block'
  const endFill = edge.style?.endFill ?? connectorTheme.endFill ?? true

  const parts = [
    'edgeStyle=orthogonalEdgeStyle',
    routing === 'rounded' ? 'rounded=1' : 'rounded=0',
    'orthogonalLoop=1',
    'jettySize=auto',
    'html=1',
    `strokeColor=${strokeColor}`,
    `strokeWidth=${strokeWidth}`,
    `endArrow=${endArrow}`,
    `endFill=${endFill ? 1 : 0}`
  ]

  if (dashed) {
    parts.push('dashed=1')
    parts.push(`dashPattern=${dashPattern}`)
  }

  // Add jump style for crossings
  parts.push('jumpStyle=arc')
  parts.push('jumpSize=8')

  return parts.join(';')
}

/**
 * Generate mxCell style string for a module container
 */
export function generateModuleStyle(module, theme) {
  const moduleTheme = theme.module || {}

  const fillColor = module.style?.fillColor || module.color || moduleTheme.fillColor || '#F8FAFC'
  const strokeColor = module.style?.strokeColor || moduleTheme.strokeColor || '#E2E8F0'
  const strokeWidth = moduleTheme.strokeWidth || 1
  const rounded = moduleTheme.rounded || 12
  const fontColor = moduleTheme.labelFontColor || '#1E293B'
  const fontSize = moduleTheme.labelFontSize || 14
  const fontWeight = moduleTheme.labelFontWeight || 600

  // IEEE style dashed border support
  const dashed = module.style?.dashed ?? moduleTheme.dashed ?? false
  const dashPattern = module.style?.dashPattern || moduleTheme.dashPattern || '8 4'

  const parts = [
    `rounded=1`,
    `arcSize=${Math.min(rounded, 20)}`,
    'html=1',
    'whiteSpace=wrap',
    `fillColor=${fillColor}`,
    `strokeColor=${strokeColor}`,
    `strokeWidth=${strokeWidth}`,
    `fontColor=${fontColor}`,
    `fontSize=${fontSize}`,
    fontWeight >= 600 ? 'fontStyle=1' : '',
    'verticalAlign=top',
    'align=left',
    'spacingLeft=12',
    'spacingTop=10',
    dashed ? 'dashed=1' : '',
    dashed ? `dashPattern=${dashPattern}` : ''
  ].filter(Boolean)

  return parts.join(';')
}

// ============================================================================
// XML Generation
// ============================================================================

/**
 * Build draw.io XML from specification
 */
export function buildXml(spec, theme, layout) {
  const { positions, modulePositions } = layout
  const routing = spec.meta?.routing || 'orthogonal'
  
  const cells = []
  let nextId = 2
  const allocId = () => String(nextId++)
  const nodeIdMap = new Map() // logical id -> cell id

  // Calculate canvas size
  let maxX = 0
  let maxY = 0
  for (const pos of positions.values()) {
    maxX = Math.max(maxX, pos.x + pos.width)
    maxY = Math.max(maxY, pos.y + pos.height)
  }
  for (const pos of modulePositions.values()) {
    maxX = Math.max(maxX, pos.x + pos.width)
    maxY = Math.max(maxY, pos.y + pos.height)
  }
  
  const canvasWidth = snapToGrid(maxX + 80, 8)
  const canvasHeight = snapToGrid(maxY + 80, 8)

  // Generate module containers
  const moduleIdMap = new Map()
  for (const [moduleId, pos] of modulePositions) {
    if (moduleId === '__default__') continue
    
    const module = spec.modules?.find(m => m.id === moduleId)
    if (!module) continue

    const cellId = allocId()
    moduleIdMap.set(moduleId, cellId)
    
    const style = generateModuleStyle(module, theme)
    const label = prepareMathLabel(module.label || moduleId)
    
    cells.push(
      `<mxCell id="${cellId}" value="${label}" style="${style}" vertex="1" parent="1">` +
      `<mxGeometry x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}" as="geometry"/>` +
      `</mxCell>`
    )
  }

  // Generate nodes
  for (const node of spec.nodes || []) {
    const pos = positions.get(node.id)
    if (!pos) continue

    const cellId = allocId()
    nodeIdMap.set(node.id, cellId)
    
    const style = generateNodeStyle(node, theme)
    const label = prepareMathLabel(node.label)
    const parentId = node.module && moduleIdMap.has(node.module) 
      ? moduleIdMap.get(node.module) 
      : '1'

    // Adjust position relative to parent if in module
    let x = pos.x
    let y = pos.y
    if (parentId !== '1') {
      const modulePos = modulePositions.get(node.module)
      if (modulePos) {
        x = pos.x - modulePos.x
        y = pos.y - modulePos.y
      }
    }

    cells.push(
      `<mxCell id="${cellId}" value="${label}" style="${style}" vertex="1" parent="${parentId}">` +
      `<mxGeometry x="${x}" y="${y}" width="${pos.width}" height="${pos.height}" as="geometry"/>` +
      `</mxCell>`
    )
  }

  // Generate edges
  for (const edge of spec.edges || []) {
    const sourceId = nodeIdMap.get(edge.from)
    const targetId = nodeIdMap.get(edge.to)
    if (!sourceId || !targetId) continue

    const cellId = allocId()
    const style = generateConnectorStyle(edge, theme, routing)
    
    let edgeXml = `<mxCell id="${cellId}" style="${style}" edge="1" parent="1" source="${sourceId}" target="${targetId}">`
    edgeXml += `<mxGeometry relative="1" as="geometry"/>`
    
    // Add label if present
    if (edge.label) {
      const labelId = allocId()
      edgeXml += `</mxCell>`
      edgeXml += `<mxCell id="${labelId}" value="${prepareMathLabel(edge.label)}" style="edgeLabel;html=1;align=center;verticalAlign=middle;fontSize=11;fontColor=${theme.colors?.textMuted || '#64748B'};" vertex="1" connectable="0" parent="${cellId}">`
      edgeXml += `<mxGeometry x="0.5" relative="1" as="geometry"><mxPoint as="offset"/></mxGeometry>`
      edgeXml += `</mxCell>`
    } else {
      edgeXml += `</mxCell>`
    }
    
    cells.push(edgeXml)
  }

  // Build final XML
  const xml =
    `<mxGraphModel dx="1120" dy="720" grid="1" gridSize="8" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${canvasWidth}" pageHeight="${canvasHeight}" math="1" background="${theme.canvas?.background || '#FFFFFF'}">` +
    `<root>` +
    `<mxCell id="0"/>` +
    `<mxCell id="1" parent="0"/>` +
    cells.join('') +
    `</root>` +
    `</mxGraphModel>`

  return xml
}

// ============================================================================
// Main Export Functions
// ============================================================================

/**
 * Convert specification to draw.io XML
 * @param {Object} spec - Parsed specification object
 * @param {Object} options - Optional settings
 * @returns {string} draw.io XML
 */
export function specToDrawioXml(spec, options = {}) {
  // Validate spec
  if (!spec || typeof spec !== 'object') {
    throw new TypeError('Specification must be a non-null object')
  }
  if (!spec.nodes || !Array.isArray(spec.nodes) || spec.nodes.length === 0) {
    throw new Error('Specification must contain at least one node')
  }

  // Load theme
  const themeName = spec.meta?.theme || 'tech-blue'
  const theme = options.theme || loadTheme(themeName)

  // Calculate layout
  const layout = calculateLayout(spec, theme)

  // Build XML
  return buildXml(spec, theme, layout)
}

/**
 * Parse YAML string to specification object
 * Note: Requires external YAML parser (e.g., js-yaml)
 * @param {string} yamlText - YAML specification text
 * @returns {Object} Parsed specification
 */
export function parseSpecYaml(yamlText) {
  // Simple YAML-like parser for basic cases
  // In production, use a proper YAML library
  const lines = yamlText.split('\n')
  const spec = { meta: {}, nodes: [], edges: [], modules: [] }
  
  let currentSection = null
  let currentItem = null
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    
    // Detect section
    if (trimmed === 'meta:') { currentSection = 'meta'; continue }
    if (trimmed === 'nodes:') { currentSection = 'nodes'; continue }
    if (trimmed === 'edges:') { currentSection = 'edges'; continue }
    if (trimmed === 'modules:') { currentSection = 'modules'; continue }
    
    // Parse key-value in meta
    if (currentSection === 'meta' && trimmed.includes(':')) {
      const [key, ...valueParts] = trimmed.split(':')
      spec.meta[key.trim()] = valueParts.join(':').trim()
      continue
    }
    
    // Parse list item start
    if (trimmed.startsWith('- ')) {
      if (currentSection === 'nodes' || currentSection === 'edges' || currentSection === 'modules') {
        currentItem = {}
        spec[currentSection].push(currentItem)
        const rest = trimmed.slice(2)
        if (rest.includes(':')) {
          const [key, ...valueParts] = rest.split(':')
          currentItem[key.trim()] = valueParts.join(':').trim()
        }
      }
      continue
    }
    
    // Parse item properties
    if (currentItem && trimmed.includes(':')) {
      const [key, ...valueParts] = trimmed.split(':')
      currentItem[key.trim()] = valueParts.join(':').trim()
    }
  }
  
  return spec
}

/**
 * Complexity check - warn if diagram is too complex
 */
export function checkComplexity(spec) {
  const warnings = []
  
  const nodeCount = spec.nodes?.length || 0
  const edgeCount = spec.edges?.length || 0
  const moduleCount = spec.modules?.length || 0
  
  if (nodeCount > 30) {
    warnings.push({ level: 'error', message: `Too many nodes (${nodeCount}). Consider splitting into sub-diagrams.` })
  } else if (nodeCount > 20) {
    warnings.push({ level: 'warning', message: `Many nodes (${nodeCount}). Consider splitting for clarity.` })
  }
  
  if (edgeCount > 50) {
    warnings.push({ level: 'error', message: `Too many edges (${edgeCount}). Consider hierarchical layout.` })
  } else if (edgeCount > 30) {
    warnings.push({ level: 'warning', message: `Many edges (${edgeCount}). Consider simplifying.` })
  }
  
  if (moduleCount > 5) {
    warnings.push({ level: 'warning', message: `Many modules (${moduleCount}). Consider zoom layers.` })
  }
  
  // Check label lengths
  for (const node of spec.nodes || []) {
    if (node.label && node.label.length > 14) {
      warnings.push({ 
        level: 'info', 
        message: `Node "${node.id}" label is long (${node.label.length} chars). Consider abbreviation.` 
      })
    }
  }
  
  return warnings
}

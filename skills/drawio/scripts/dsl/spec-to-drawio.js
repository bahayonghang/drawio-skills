/**
 * spec-to-drawio.js
 * Converts YAML/JSON specification to draw.io XML with Design System support
 */

import { isLikelyStandaloneMathLabel, prepareMathLabel } from '../math/index.js'
import yaml from 'js-yaml'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// ============================================================================
// Theme Loading
// ============================================================================

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const THEMES_DIR = resolve(__dirname, '../../assets/themes')

let DEFAULT_THEME
try {
  DEFAULT_THEME = JSON.parse(readFileSync(resolve(THEMES_DIR, 'tech-blue.json'), 'utf-8'))
} catch {
  DEFAULT_THEME = {
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
      service: { fillColor: '#DBEAFE', strokeColor: '#2563EB' },
      database: { fillColor: '#D1FAE5', strokeColor: '#059669' },
      decision: { fillColor: '#FEF3C7', strokeColor: '#D97706' },
      terminal: { fillColor: '#F1F5F9', strokeColor: '#64748B' },
      queue: { fillColor: '#EDE9FE', strokeColor: '#7C3AED' },
      user: { fillColor: '#E0F2FE', strokeColor: '#0284C7' },
      document: { fillColor: '#FFFFFF', strokeColor: '#CBD5E1' },
      formula: { fillColor: '#FFFFFF', strokeColor: '#2563EB', strokeWidth: 1 },
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
}

const _themeCache = new Map()

/**
 * Load theme by name (returns default if not found)
 */
export function loadTheme(themeName) {
  if (!themeName || themeName === 'tech-blue') return DEFAULT_THEME
  if (_themeCache.has(themeName)) return _themeCache.get(themeName)

  // Security: reject invalid theme names (path traversal prevention)
  if (!/^[a-z][a-z0-9-]*$/.test(themeName)) {
    console.warn(`[loadTheme] Invalid theme name '${themeName}'. Falling back to default.`)
    return DEFAULT_THEME
  }

  try {
    const themePath = resolve(THEMES_DIR, `${themeName}.json`)
    // Security: verify resolved path stays within THEMES_DIR
    if (!themePath.startsWith(THEMES_DIR)) {
      console.warn(`[loadTheme] Theme path escapes themes directory. Falling back to default.`)
      return DEFAULT_THEME
    }
    const raw = readFileSync(themePath, 'utf8')
    const theme = JSON.parse(raw)
    _themeCache.set(themeName, theme)
    return theme
  } catch (err) {
    console.warn(`[loadTheme] Could not load theme '${themeName}': ${err.message}. Falling back to default.`)
    return DEFAULT_THEME
  }
}

// ============================================================================
// Semantic Shape Mapping
// ============================================================================

const SHAPE_KEYWORDS = {
  // Network topology
  router: ['router', 'core router', 'edge router', 'gateway router'],
  switch: ['core switch', 'distribution switch', 'access switch'],
  firewall: ['firewall', 'fw', 'security gateway', 'ngfw'],
  server: ['server', 'app server', 'web server', 'host', 'vm server'],
  load_balancer: ['load balancer', 'lb', 'alb', 'nlb', 'reverse proxy'],
  subnet: ['subnet', 'cidr', 'segment', 'lan segment', 'network segment'],
  internet: ['internet', 'wan', 'isp', 'public network'],
  ap: ['wireless ap', 'access point', 'wifi ap', 'wap'],

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
  router: 'ellipse',
  switch: 'shape=switch',
  firewall: 'shape=mxgraph.cisco.firewalls.firewall;sketch=0',
  server: 'rounded=1;arcSize=12',
  load_balancer: 'shape=hexagon;perimeter=hexagonPerimeter2',
  subnet: 'swimlane;startSize=24',
  internet: 'ellipse;shape=cloud',
  ap: 'shape=mxgraph.cisco.wireless.access_point;sketch=0',

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
export function detectSemanticType(label, explicitType, network = null) {
  if (explicitType && SHAPE_STYLES[explicitType]) {
    return explicitType
  }

  if (network?.device && SHAPE_STYLES[network.device]) {
    return network.device
  }

  const lowerLabel = label.toLowerCase()

  // Check for officially supported math delimiters first (highest priority)
  if (label.includes('$$') || label.includes('\\(') || /`[^`]+`/.test(label)) {
    return 'formula'
  }

  // Detect unlabeled standalone equations so they receive formula styling too.
  if (isLikelyStandaloneMathLabel(label)) {
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
  router: 'small',
  switch: 'small',
  firewall: 'small',
  server: 'medium',
  load_balancer: 'medium',
  subnet: 'large',
  internet: 'small',
  ap: 'small',
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
  const normalizedLayout = layout === 'star' || layout === 'mesh' ? 'hierarchical' : layout
  const gridSize = theme.canvas?.gridSize || 8
  const nodeMargin = 32 // Minimum space between nodes
  const containerPadding = theme.module?.padding || 24
  const moduleHeaderHeight = 40

  const nodes = spec.nodes || []
  const modules = spec.modules || []
  const positions = new Map()

  const placeNode = (node, x, y) => {
    const semanticType = detectSemanticType(node.label, node.type, node.network)
    const size = getNodeSize(node.size, semanticType)
    positions.set(node.id, {
      x: snapToGrid(x, gridSize),
      y: snapToGrid(y, gridSize),
      width: size.width,
      height: size.height
    })
    return size
  }

  const getNodeMetrics = (node) => {
    const semanticType = detectSemanticType(node.label, node.type, node.network)
    const size = getNodeSize(node.size, semanticType)
    return { semanticType, size }
  }

  // Handle manually positioned nodes first
  const manuallyPositioned = new Set()
  for (const node of nodes) {
    if (node.position && typeof node.position.x === 'number' && typeof node.position.y === 'number') {
      const semanticType = detectSemanticType(node.label, node.type, node.network)
      const size = getNodeSize(node.size, semanticType)
      positions.set(node.id, {
        x: snapToGrid(node.position.x - size.width / 2, gridSize),
        y: snapToGrid(node.position.y - size.height / 2, gridSize),
        width: size.width,
        height: size.height
      })
      manuallyPositioned.add(node.id)
    }
  }

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

  if (normalizedLayout === 'horizontal') {
    // Horizontal: modules side by side, nodes stacked vertically
    for (const [moduleId, moduleNodes] of moduleGroups) {
      if (moduleNodes.length === 0) continue

      const moduleX = snapToGrid(currentX, gridSize)
      const moduleY = snapToGrid(40, gridSize)
      let maxWidth = 0
      let nodeY = moduleY + containerPadding + moduleHeaderHeight

      for (const node of moduleNodes) {
        if (manuallyPositioned.has(node.id)) continue
        const semanticType = detectSemanticType(node.label, node.type, node.network)
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

      currentX += maxWidth + containerPadding * 2 + nodeMargin
    }
  } else if (normalizedLayout === 'vertical') {
    // Vertical: modules stacked, nodes side by side
    for (const [moduleId, moduleNodes] of moduleGroups) {
      if (moduleNodes.length === 0) continue

      const moduleX = snapToGrid(40, gridSize)
      const moduleY = snapToGrid(currentY, gridSize)
      let nodeX = moduleX + containerPadding
      let maxHeight = 0

      for (const node of moduleNodes) {
        if (manuallyPositioned.has(node.id)) continue
        const semanticType = detectSemanticType(node.label, node.type, node.network)
        const size = getNodeSize(node.size, semanticType)
        positions.set(node.id, {
          x: snapToGrid(nodeX, gridSize),
          y: snapToGrid(moduleY + containerPadding + moduleHeaderHeight, gridSize),
          width: size.width,
          height: size.height
        })
        maxHeight = Math.max(maxHeight, size.height)
        nodeX += size.width + nodeMargin
      }

      currentY += maxHeight + containerPadding * 2 + moduleHeaderHeight + nodeMargin
    }
  } else if (layout === 'star') {
    const autoNodes = nodes.filter(node => !manuallyPositioned.has(node.id))
    if (autoNodes.length > 0) {
      const centerNode = autoNodes.find(node => {
        const type = detectSemanticType(node.label, node.type, node.network)
        return ['router', 'switch', 'load_balancer', 'firewall'].includes(type)
      }) || autoNodes[0]

      const centerX = 360
      const centerY = 180
      placeNode(centerNode, centerX, centerY)

      const spokes = autoNodes.filter(node => node.id !== centerNode.id)
      const radiusX = 220
      const radiusY = 140
      spokes.forEach((node, index) => {
        const angle = (Math.PI * 2 * index) / Math.max(spokes.length, 1) - Math.PI / 2
        const { size } = getNodeMetrics(node)
        placeNode(
          node,
          centerX + Math.cos(angle) * radiusX - size.width / 2,
          centerY + Math.sin(angle) * radiusY - size.height / 2
        )
      })
    }
  } else if (layout === 'mesh') {
    const autoNodes = nodes.filter(node => !manuallyPositioned.has(node.id))
    const centerX = 340
    const centerY = 180
    const radius = Math.max(140, autoNodes.length * 18)

    autoNodes.forEach((node, index) => {
      const { size } = getNodeMetrics(node)
      const angle = (Math.PI * 2 * index) / Math.max(autoNodes.length, 1) - Math.PI / 2
      placeNode(
        node,
        centerX + Math.cos(angle) * radius - size.width / 2,
        centerY + Math.sin(angle) * radius - size.height / 2
      )
    })
  } else {
    // Hierarchical or other: simple grid layout
    let row = 0
    let col = 0
    const maxCols = 4

    for (const node of nodes) {
      if (manuallyPositioned.has(node.id)) continue
      const semanticType = detectSemanticType(node.label, node.type, node.network)
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

  const snapDown = (value) => Math.floor(value / gridSize) * gridSize
  const snapUp = (value) => Math.ceil(value / gridSize) * gridSize
  const modulePositions = new Map()

  for (const [moduleId, moduleNodes] of moduleGroups) {
    if (moduleId === '__default__' || moduleNodes.length === 0) continue

    const nodePositions = moduleNodes
      .map(node => positions.get(node.id))
      .filter(Boolean)

    if (nodePositions.length === 0) continue

    const minX = Math.min(...nodePositions.map(pos => pos.x))
    const minY = Math.min(...nodePositions.map(pos => pos.y))
    const maxX = Math.max(...nodePositions.map(pos => pos.x + pos.width))
    const maxY = Math.max(...nodePositions.map(pos => pos.y + pos.height))

    const x = snapDown(minX - containerPadding)
    const y = snapDown(minY - containerPadding - moduleHeaderHeight)
    const width = snapUp(maxX + containerPadding) - x
    const height = snapUp(maxY + containerPadding) - y

    modulePositions.set(moduleId, { x, y, width, height })
  }

  return { positions, modulePositions }
}

// ============================================================================
// Icon Support
// ============================================================================

const ICON_PREFIXES = {
  'aws.': 'mxgraph.aws4.',
  'gcp.': 'mxgraph.gcp2.',
  'azure.': 'mxgraph.azure.',
  'k8s.': 'mxgraph.kubernetes.',
  'cisco.': 'mxgraph.cisco.',
  'cisco19.': 'mxgraph.cisco19.',
  'mxgraph.': 'mxgraph.'  // pass-through for direct mxgraph references
}

const ICON_ALIASES = {
  'aws.alb': 'aws.application_load_balancer',
  'aws.app_lb': 'aws.application_load_balancer',
  'aws.internet-gateway': 'aws.internet_gateway',
  'aws.igw': 'aws.internet_gateway',
  'aws.ec2': 'aws.ec2_instance',
  'aws.rds': 'aws.rds_instance',
  'cisco.firewall': 'mxgraph.cisco.firewalls.firewall',
  'cisco.ap': 'mxgraph.cisco.wireless.access_point',
  'cisco.access-point': 'mxgraph.cisco.wireless.access_point'
}

const NETWORK_VENDOR_DEVICE_ICONS = {
  aws: {
    internet: 'aws.internet_gateway',
    internet_gateway: 'aws.internet_gateway',
    load_balancer: 'aws.application_load_balancer',
    application_load_balancer: 'aws.application_load_balancer',
    server: 'aws.ec2_instance',
    ec2: 'aws.ec2_instance',
    ec2_instance: 'aws.ec2_instance',
    subnet: 'aws.rds_instance',
    rds: 'aws.rds_instance',
    rds_instance: 'aws.rds_instance'
  },
  cisco: {
    firewall: 'mxgraph.cisco.firewalls.firewall',
    ap: 'mxgraph.cisco.wireless.access_point',
    access_point: 'mxgraph.cisco.wireless.access_point'
  }
}

/**
 * Resolve a theme token (e.g. $primary) or return the original value.
 */
function resolveThemeColor(value, theme, fallback) {
  if (!value) return fallback
  if (typeof value === 'string' && value.startsWith('$')) {
    const tokenName = value.slice(1)
    return theme.colors?.[tokenName] || fallback
  }
  return value
}

/**
 * Resolve icon name to draw.io shape identifier
 */
export function resolveIconShape(icon) {
  if (!icon) return null
  const normalizedIcon = ICON_ALIASES[icon] || icon
  for (const [prefix, mxPrefix] of Object.entries(ICON_PREFIXES)) {
    if (normalizedIcon.startsWith(prefix)) {
      return mxPrefix + normalizedIcon.slice(prefix.length)
    }
  }
  // Security: validate unprefixed icons to prevent style injection
  if (!/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(normalizedIcon)) {
    console.warn(`[resolveIconShape] Invalid icon name '${normalizedIcon}'. Ignoring.`)
    return null
  }
  return normalizedIcon
}

export function deriveNodeIcon(node) {
  if (node.icon) return node.icon

  const vendor = node.network?.vendor?.toLowerCase()
  const device = node.network?.device?.toLowerCase()
  if (!vendor || !device) return null

  return NETWORK_VENDOR_DEVICE_ICONS[vendor]?.[device] || null
}

// ============================================================================
// Style Generation
// ============================================================================

/**
 * Generate mxCell style string for a node
 */
export function generateNodeStyle(node, theme) {
  const semanticType = detectSemanticType(node.label, node.type, node.network)
  const shapeStyle = SHAPE_STYLES[semanticType] || SHAPE_STYLES.service

  // Get colors from theme
  const nodeTheme = theme.node?.[semanticType] || theme.node?.default || {}
  const defaultTheme = theme.node?.default || {}

  const fillColor = resolveThemeColor(node.style?.fillColor, theme, nodeTheme.fillColor || defaultTheme.fillColor || '#DBEAFE')
  const strokeColor = resolveThemeColor(node.style?.strokeColor, theme, nodeTheme.strokeColor || defaultTheme.strokeColor || '#2563EB')
  const strokeWidth = node.style?.strokeWidth || nodeTheme.strokeWidth || defaultTheme.strokeWidth || 1.5
  const fontColor = resolveThemeColor(node.style?.fontColor, theme, nodeTheme.fontColor || defaultTheme.fontColor || '#1E293B')
  const fontSize = node.style?.fontSize || nodeTheme.fontSize || defaultTheme.fontSize || 13
  const fontFamily = theme.typography?.fontFamily?.primary || 'Inter, sans-serif'

  // If node has an icon, override shape to use the icon
  const iconShape = resolveIconShape(node.icon || deriveNodeIcon(node))
  let effectiveShapeStyle = shapeStyle
  const parts = []
  if (iconShape) {
    effectiveShapeStyle = `shape=${iconShape}`
    parts.push(effectiveShapeStyle)
    parts.push('html=1')
    parts.push('whiteSpace=wrap')
    parts.push(`fillColor=${fillColor}`)
    parts.push(`strokeColor=${strokeColor}`)
    parts.push(`strokeWidth=${strokeWidth}`)
    parts.push(`fontColor=${fontColor}`)
    parts.push(`fontSize=${fontSize}`)
    parts.push(`fontFamily=${fontFamily}`)
    parts.push('verticalLabelPosition=bottom')
    parts.push('labelBackgroundColor=none')
    parts.push('align=center')
  } else {
    parts.push(
      effectiveShapeStyle,
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
    )
  }

  return parts.join(';')
}

/**
 * Generate mxCell style string for a connector
 */
export function generateConnectorStyle(edge, theme, routing = 'orthogonal') {
  const connectorType = edge.type || 'primary'
  const connectorTheme = theme.connector?.[connectorType] || theme.connector?.primary || {}

  const strokeColor = resolveThemeColor(edge.style?.strokeColor, theme, connectorTheme.strokeColor || '#1E293B')
  const strokeWidth = edge.style?.strokeWidth || connectorTheme.strokeWidth || 2
  const dashed = edge.style?.dashed ?? connectorTheme.dashed ?? false
  const dashPattern = edge.style?.dashPattern || connectorTheme.dashPattern || '6 4'
  const endArrow = edge.style?.endArrow || connectorTheme.endArrow || 'block'
  const endFill = edge.style?.endFill ?? connectorTheme.endFill ?? true
  const startArrow = edge.style?.startArrow || connectorTheme.startArrow
  const startFill = edge.style?.startFill ?? connectorTheme.startFill

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

  if (startArrow) {
    parts.push(`startArrow=${startArrow}`)
    parts.push(`startFill=${startFill ? 1 : 0}`)
  }

  // Edge entry/exit routing
  if (edge.style?.exitX !== undefined) parts.push(`exitX=${edge.style.exitX}`)
  if (edge.style?.exitY !== undefined) parts.push(`exitY=${edge.style.exitY}`)
  if (edge.style?.exitDx !== undefined) parts.push(`exitDx=${edge.style.exitDx}`)
  if (edge.style?.exitDy !== undefined) parts.push(`exitDy=${edge.style.exitDy}`)
  if (edge.style?.entryX !== undefined) parts.push(`entryX=${edge.style.entryX}`)
  if (edge.style?.entryY !== undefined) parts.push(`entryY=${edge.style.entryY}`)
  if (edge.style?.entryDx !== undefined) parts.push(`entryDx=${edge.style.entryDx}`)
  if (edge.style?.entryDy !== undefined) parts.push(`entryDy=${edge.style.entryDy}`)

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

  const fillColor = resolveThemeColor(module.style?.fillColor || module.color, theme, moduleTheme.fillColor || '#F8FAFC')
  const strokeColor = resolveThemeColor(module.style?.strokeColor, theme, moduleTheme.strokeColor || '#E2E8F0')
  const strokeWidth = moduleTheme.strokeWidth || 1
  const rounded = moduleTheme.rounded || 12
  const fontColor = resolveThemeColor(module.style?.fontColor, theme, moduleTheme.labelFontColor || '#1E293B')
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

function formatNetworkEdgeLabel(edge) {
  if (edge.label) return edge.label

  const parts = []
  if (edge.srcInterface || edge.dstInterface) {
    const src = edge.srcInterface || '?'
    const dst = edge.dstInterface || '?'
    parts.push(`${src} ↔ ${dst}`)
  }
  if (edge.ip) parts.push(edge.ip)
  if (edge.vlan !== undefined) parts.push(`VLAN ${edge.vlan}`)
  if (edge.bandwidth) parts.push(edge.bandwidth)
  if (edge.linkType) parts.push(edge.linkType)

  return parts.join('\n')
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
  const routedEdges = buildRoutedEdges(spec, layout)

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
  for (const edge of routedEdges) {
    const sourceId = nodeIdMap.get(edge.from)
    const targetId = nodeIdMap.get(edge.to)
    if (!sourceId || !targetId) continue

    const cellId = allocId()
    const style = generateConnectorStyle(edge, theme, routing)
    const rawEdgeLabel = formatNetworkEdgeLabel(edge)
    const edgeLabel = rawEdgeLabel ? prepareMathLabel(rawEdgeLabel) : ''

    let edgeXml = `<mxCell id="${cellId}" value="${edgeLabel}" style="${style}" edge="1" parent="1" source="${sourceId}" target="${targetId}">`
    edgeXml += `<mxGeometry relative="1" as="geometry">`
    if (edge.waypoints?.length) {
      edgeXml += '<Array as="points">'
      for (const point of edge.waypoints) {
        edgeXml += `<mxPoint x="${point.x}" y="${point.y}"/>`
      }
      edgeXml += '</Array>'
    }
    edgeXml += `</mxGeometry>`

    // Add label if present
    if (rawEdgeLabel) {
      const labelId = allocId()
      const labelX = edge.labelPosition === 'start' ? '0.2'
        : edge.labelPosition === 'end' ? '0.8'
          : '0.5'  // center (default)
      const labelOffset = edge.__routing?.orientation === 'vertical'
        ? '<mxPoint x="12" y="0" as="offset"/>'
        : '<mxPoint x="0" y="-12" as="offset"/>'
      edgeXml += `</mxCell>`
      edgeXml += `<mxCell id="${labelId}" value="${edgeLabel}" style="edgeLabel;html=1;align=center;verticalAlign=middle;fontSize=11;fontColor=${theme.colors?.textMuted || '#64748B'};" vertex="1" connectable="0" parent="${cellId}">`
      edgeXml += `<mxGeometry x="${labelX}" relative="1" as="geometry">${labelOffset}</mxGeometry>`
      edgeXml += `</mxCell>`
    } else {
      edgeXml += `</mxCell>`
    }

    cells.push(edgeXml)
  }

  // Build final XML
  const canvasBackground = resolveThemeColor(
    spec.meta?.replication?.background,
    theme,
    theme.canvas?.background || '#FFFFFF'
  )
  const xml =
    `<mxGraphModel dx="1120" dy="720" grid="1" gridSize="8" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${canvasWidth}" pageHeight="${canvasHeight}" math="1" background="${canvasBackground}">` +
    `<root>` +
    `<mxCell id="0"/>` +
    `<mxCell id="1" parent="0"/>` +
    cells.join('') +
    `</root>` +
    `</mxGraphModel>`

  return xml
}

// ============================================================================
// Spec Validation Functions
// ============================================================================

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
const ACADEMIC_FIGURE_TYPES = ['architecture', 'roadmap', 'workflow']

function normalizeLabelText(label) {
  return String(label || '').replace(/\s+/g, ' ').trim()
}

function countManualLabelLines(label) {
  return String(label || '').split(/\r?\n/).length
}

function isHexColor(value) {
  return typeof value === 'string' && HEX_COLOR_REGEX.test(value)
}

function normalizeHexColor(value) {
  if (!isHexColor(value)) return null
  const hex = value.slice(1)
  if (hex.length === 3) {
    return `#${hex.split('').map(char => char + char).join('').toUpperCase()}`
  }
  return `#${hex.toUpperCase()}`
}

function isGrayscaleHex(value) {
  const hex = normalizeHexColor(value)
  if (!hex) return false
  return hex.slice(1, 3) === hex.slice(3, 5) && hex.slice(3, 5) === hex.slice(5, 7)
}

function collectAcademicColorOverrideWarnings(spec, theme) {
  const offenders = []

  const checkColor = (value, context) => {
    if (!value) return
    const resolved = resolveThemeColor(value, theme, value)
    if (isHexColor(resolved) && !isGrayscaleHex(resolved)) {
      offenders.push(`${context}=${normalizeHexColor(resolved)}`)
    }
  }

  spec.nodes?.forEach(node => {
    checkColor(node.style?.fillColor, `node "${node.id}" fill`)
    checkColor(node.style?.strokeColor, `node "${node.id}" stroke`)
    checkColor(node.style?.fontColor, `node "${node.id}" text`)
  })

  spec.edges?.forEach(edge => {
    checkColor(edge.style?.strokeColor, `edge "${edge.from}->${edge.to}" stroke`)
  })

  spec.modules?.forEach(module => {
    checkColor(module.color, `module "${module.id}" color`)
    checkColor(module.style?.fillColor, `module "${module.id}" fill`)
    checkColor(module.style?.strokeColor, `module "${module.id}" stroke`)
    checkColor(module.style?.fontColor, `module "${module.id}" text`)
  })

  return offenders
}

/**
 * Validate all color values in spec against theme tokens and hex format.
 * Warns on invalid values; does not throw by default.
 * @param {Object} spec - Parsed YAML spec
 * @param {Object} theme - Loaded theme object
 * @returns {Array<string>} Array of validation warning messages
 */
export function validateColorScheme(spec, theme) {
  const warnings = []
  const validTokens = new Set(Object.keys(theme.colors || {}).map(k => `$${k}`))

  const checkColor = (value, context) => {
    if (!value) return
    if (validTokens.has(value)) return      // valid theme token
    if (HEX_COLOR_REGEX.test(value)) return // valid hex color
    const tokenSamples = [...validTokens].slice(0, 3).join(', ')
    warnings.push(
      `Invalid color "${value}" in ${context}. ` +
      `Use a hex code (#RGB or #RRGGBB) or a theme token (${tokenSamples}...)`
    )
  }

  // Validate node style overrides
  spec.nodes?.forEach(node => {
    const ctx = `node "${node.id}"`
    checkColor(node.style?.fillColor,   `${ctx}.style.fillColor`)
    checkColor(node.style?.strokeColor, `${ctx}.style.strokeColor`)
    checkColor(node.style?.fontColor,   `${ctx}.style.fontColor`)
  })

  // Validate edge style overrides
  spec.edges?.forEach(edge => {
    const ctx = `edge "${edge.from}→${edge.to}"`
    checkColor(edge.style?.strokeColor, `${ctx}.style.strokeColor`)
  })

  // Validate module style overrides
  spec.modules?.forEach(mod => {
    const ctx = `module "${mod.id}"`
    checkColor(mod.color,                `${ctx}.color`)
    checkColor(mod.style?.fillColor,   `${ctx}.style.fillColor`)
    checkColor(mod.style?.strokeColor, `${ctx}.style.strokeColor`)
  })

  checkColor(spec.meta?.replication?.background, 'meta.replication.background')
  spec.meta?.replication?.palette?.forEach((entry, index) => {
    if (!entry?.hex) return
    if (HEX_COLOR_REGEX.test(entry.hex)) return
    warnings.push(
      `Invalid color "${entry.hex}" in meta.replication.palette[${index}].hex. ` +
      'Use a flat hex code (#RGB or #RRGGBB) for extracted source colors.'
    )
  })

  return warnings
}

/**
 * Detect conflicts between the declared layout direction and manual node
 * position coordinates. Also checks for node overlap.
 * @param {Object} spec - Parsed YAML spec
 * @returns {Array<string>} Array of layout consistency warning messages
 */
export function validateLayoutConsistency(spec) {
  const warnings = []
  const layout = spec.meta?.layout || 'horizontal'
  const nodesWithPos = (spec.nodes || []).filter(
    n => n.position && typeof n.position.x === 'number' && typeof n.position.y === 'number'
  )

  if (nodesWithPos.length < 2) return warnings // not enough data

  const xs = nodesWithPos.map(n => n.position.x)
  const ys = nodesWithPos.map(n => n.position.y)
  const xRange = Math.max(...xs) - Math.min(...xs)
  const yRange = Math.max(...ys) - Math.min(...ys)

  if (layout === 'horizontal' && yRange > xRange * 1.5) {
    warnings.push(
      `Layout is "horizontal" but nodes span ${yRange}px vertically vs ${xRange}px horizontally. ` +
      `Consider switching meta.layout to "vertical", or recalculate node positions.`
    )
  }

  if (layout === 'vertical' && xRange > yRange * 1.5) {
    warnings.push(
      `Layout is "vertical" but nodes span ${xRange}px horizontally vs ${yRange}px vertically. ` +
      `Consider switching meta.layout to "horizontal", or recalculate node positions.`
    )
  }

  // Check for potential node overlap (skip if too many nodes — O(n²) cost)
  const MIN_CLEARANCE = 20
  if (nodesWithPos.length <= 30) {
    for (let i = 0; i < nodesWithPos.length; i++) {
      for (let j = i + 1; j < nodesWithPos.length; j++) {
        const a = nodesWithPos[i]
        const b = nodesWithPos[j]
        const dx = Math.abs(a.position.x - b.position.x)
        const dy = Math.abs(a.position.y - b.position.y)
        if (dx < MIN_CLEARANCE && dy < MIN_CLEARANCE) {
          const dist = Math.round(Math.hypot(dx, dy))
          warnings.push(
            `Nodes "${a.id}" and "${b.id}" may overlap ` +
            `(center distance ${dist}px < ${MIN_CLEARANCE}px minimum clearance)`
          )
        }
      }
    }
  }

  return warnings
}

const FACE_SLOTS = [0.25, 0.5, 0.75, 0.33, 0.66, 0.2, 0.8]

function resolveProfile(spec) {
  if (spec.meta?.profile) return spec.meta.profile
  const theme = spec.meta?.theme || ''
  if (theme === 'academic' || theme === 'academic-color') return 'academic-paper'
  return 'default'
}

function detectEdgeFaces(sourcePos, targetPos) {
  const sourceCenterX = sourcePos.x + sourcePos.width / 2
  const sourceCenterY = sourcePos.y + sourcePos.height / 2
  const targetCenterX = targetPos.x + targetPos.width / 2
  const targetCenterY = targetPos.y + targetPos.height / 2
  const dx = targetCenterX - sourceCenterX
  const dy = targetCenterY - sourceCenterY
  const horizontal = Math.abs(dx) >= Math.abs(dy)

  if (horizontal) {
    return {
      orientation: 'horizontal',
      sourceFace: dx >= 0 ? 'right' : 'left',
      targetFace: dx >= 0 ? 'left' : 'right'
    }
  }

  return {
    orientation: 'vertical',
    sourceFace: dy >= 0 ? 'bottom' : 'top',
    targetFace: dy >= 0 ? 'top' : 'bottom'
  }
}

function applyFaceSlot(style, face, slot) {
  if (face === 'left') {
    style.exitX = style.exitX ?? 0
    style.exitY = style.exitY ?? slot
  } else if (face === 'right') {
    style.exitX = style.exitX ?? 1
    style.exitY = style.exitY ?? slot
  } else if (face === 'top') {
    style.exitX = style.exitX ?? slot
    style.exitY = style.exitY ?? 0
  } else if (face === 'bottom') {
    style.exitX = style.exitX ?? slot
    style.exitY = style.exitY ?? 1
  }

  style.exitDx = style.exitDx ?? 0
  style.exitDy = style.exitDy ?? 0
}

function applyTargetFaceSlot(style, face, slot) {
  if (face === 'left') {
    style.entryX = style.entryX ?? 0
    style.entryY = style.entryY ?? slot
  } else if (face === 'right') {
    style.entryX = style.entryX ?? 1
    style.entryY = style.entryY ?? slot
  } else if (face === 'top') {
    style.entryX = style.entryX ?? slot
    style.entryY = style.entryY ?? 0
  } else if (face === 'bottom') {
    style.entryX = style.entryX ?? slot
    style.entryY = style.entryY ?? 1
  }

  style.entryDx = style.entryDx ?? 0
  style.entryDy = style.entryDy ?? 0
}

function getSlot(index) {
  return FACE_SLOTS[index % FACE_SLOTS.length]
}

function buildRoutedEdges(spec, layout) {
  const { positions } = layout
  const declaredLayout = spec.meta?.layout || 'horizontal'
  const edges = (spec.edges || []).map(edge => ({
    ...edge,
    style: { ...(edge.style || {}) },
    waypoints: edge.waypoints ? edge.waypoints.map(point => ({ ...point })) : undefined
  }))

  const sourceGroups = new Map()
  const targetGroups = new Map()

  for (const edge of edges) {
    const sourcePos = positions.get(edge.from)
    const targetPos = positions.get(edge.to)
    if (!sourcePos || !targetPos) continue

    const faces = detectEdgeFaces(sourcePos, targetPos)
    edge.__routing = faces

    if (edge.waypoints?.length) continue

    if (declaredLayout === 'star' && edge.__routing.orientation === 'horizontal') {
      const sourceCenterY = sourcePos.y + sourcePos.height / 2
      const targetCenterY = targetPos.y + targetPos.height / 2
      const midX = snapToGrid((sourcePos.x + sourcePos.width / 2 + targetPos.x + targetPos.width / 2) / 2, 8)
      const waypointCandidates = [
        { x: midX, y: snapToGrid(sourceCenterY, 8) },
        { x: midX, y: snapToGrid(targetCenterY, 8) }
      ]
      const dedupedWaypoints = []
      for (const point of waypointCandidates) {
        const prev = dedupedWaypoints[dedupedWaypoints.length - 1]
        if (!prev || Math.abs(prev.x - point.x) >= 1 || Math.abs(prev.y - point.y) >= 1) {
          dedupedWaypoints.push(point)
        }
      }
      edge.waypoints = dedupedWaypoints
      if (edge.waypoints.length > 0) {
        continue
      }
    }

    if (declaredLayout === 'mesh') {
      const sourceCenterX = sourcePos.x + sourcePos.width / 2
      const sourceCenterY = sourcePos.y + sourcePos.height / 2
      const targetCenterX = targetPos.x + targetPos.width / 2
      const targetCenterY = targetPos.y + targetPos.height / 2
      const midX = snapToGrid((sourceCenterX + targetCenterX) / 2, 8)
      const midY = snapToGrid((sourceCenterY + targetCenterY) / 2, 8)
      if (Math.abs(sourceCenterX - targetCenterX) > 80 && Math.abs(sourceCenterY - targetCenterY) > 80) {
        const waypointCandidates = [
          { x: midX, y: snapToGrid(sourceCenterY, 8) },
          { x: midX, y: midY },
          { x: midX, y: snapToGrid(targetCenterY, 8) }
        ]
        const dedupedWaypoints = []
        for (const point of waypointCandidates) {
          const prev = dedupedWaypoints[dedupedWaypoints.length - 1]
          if (!prev || Math.abs(prev.x - point.x) >= 1 || Math.abs(prev.y - point.y) >= 1) {
            dedupedWaypoints.push(point)
          }
        }
        edge.waypoints = dedupedWaypoints
        if (edge.waypoints.length > 0) {
          continue
        }
      }
    }

    const sourceKey = `${edge.from}:${faces.sourceFace}`
    const targetKey = `${edge.to}:${faces.targetFace}`

    if (!sourceGroups.has(sourceKey)) sourceGroups.set(sourceKey, [])
    if (!targetGroups.has(targetKey)) targetGroups.set(targetKey, [])
    sourceGroups.get(sourceKey).push(edge)
    targetGroups.get(targetKey).push(edge)
  }

  for (const group of sourceGroups.values()) {
    group.forEach((edge, index) => {
      const slot = getSlot(index)
      applyFaceSlot(edge.style, edge.__routing.sourceFace, slot)
    })
  }

  for (const group of targetGroups.values()) {
    group.forEach((edge, index) => {
      const slot = getSlot(index)
      applyTargetFaceSlot(edge.style, edge.__routing.targetFace, slot)
    })
  }

  return edges
}

export function validateConnectionPointPolicy(spec) {
  const warnings = []
  for (const edge of spec.edges || []) {
    const style = edge.style || {}
    const hasWaypoints = Array.isArray(edge.waypoints) && edge.waypoints.length > 0
    const cpFields = ['exitX', 'exitY', 'entryX', 'entryY']
    const dxdyFields = ['exitDx', 'exitDy', 'entryDx', 'entryDy']
    const cpCount = cpFields.filter(field => style[field] !== undefined).length
    const dxdyCount = dxdyFields.filter(field => style[field] !== undefined).length

    if (hasWaypoints && (cpCount > 0 || dxdyCount > 0)) {
      warnings.push(
        `Edge "${edge.from}->${edge.to}" mixes waypoints with explicit connection points. Remove exit/entry hints when waypoints are present.`
      )
    }
    if (!hasWaypoints && cpCount > 0 && cpCount < cpFields.length) {
      warnings.push(
        `Edge "${edge.from}->${edge.to}" defines partial connection points. Non-waypoint edges should set exitX/exitY/entryX/entryY together.`
      )
    }
    if (!hasWaypoints && dxdyCount > 0 && dxdyCount < dxdyFields.length) {
      warnings.push(
        `Edge "${edge.from}->${edge.to}" defines partial Dx/Dy offsets. Use all exitDx/exitDy/entryDx/entryDy fields or omit them.`
      )
    }
  }
  return warnings
}

export function validateAcademicProfile(spec) {
  const warnings = []
  const profile = resolveProfile(spec)
  if (profile !== 'academic-paper') return warnings

  const theme = spec.meta?.theme || 'academic'
  if (!['academic', 'academic-color'].includes(theme)) {
    warnings.push('Academic-paper profile should use academic or academic-color theme.')
  }
  if (!spec.meta?.figureType) {
    warnings.push(
      `Academic-paper profile should set meta.figureType to one of ${ACADEMIC_FIGURE_TYPES.join(', ')}.`
    )
  }
  if (!spec.meta?.title) {
    warnings.push('Academic-paper profile requires meta.title for figure captioning.')
  }
  if (!spec.meta?.description) {
    warnings.push('Academic-paper profile should include meta.description for figure context.')
  }

  const usesIcons = (spec.nodes || []).some(node => node.icon)
  const connectorTypes = new Set((spec.edges || []).map(edge => edge.type || 'primary'))
  if ((usesIcons || connectorTypes.size > 1) && !spec.meta?.legend) {
    warnings.push('Academic-paper profile should include meta.legend when icons or multiple connector styles are used.')
  }

  const smallFonts = []
  for (const node of spec.nodes || []) {
    const fontSize = node.style?.fontSize
    if (typeof fontSize === 'number' && (fontSize < 8 || fontSize > 10)) {
      smallFonts.push(`node "${node.id}"`)
    }
  }
  for (const edge of spec.edges || []) {
    const fontSize = edge.style?.fontSize
    if (typeof fontSize === 'number' && (fontSize < 8 || fontSize > 10)) {
      smallFonts.push(`edge "${edge.from}->${edge.to}"`)
    }
  }
  if (smallFonts.length > 0) {
    warnings.push(`Academic-paper profile expects 8-10pt labels. Out-of-range overrides found on ${smallFonts.join(', ')}.`)
  }

  const verboseLabels = []
  for (const node of spec.nodes || []) {
    const label = normalizeLabelText(node.label)
    const lineCount = countManualLabelLines(node.label)
    if (label.length > 40 || lineCount > 3) {
      verboseLabels.push(`node "${node.id}"`)
    }
  }
  if (verboseLabels.length > 0) {
    warnings.push(
      `Academic-paper labels should stay concise. Labels longer than 40 visible characters or 3 manual lines were found on ${verboseLabels.join(', ')}.`
    )
  }

  if (theme === 'academic') {
    const colorOverrides = collectAcademicColorOverrideWarnings(spec, loadTheme(theme))
    if (colorOverrides.length > 0) {
      warnings.push(
        `Academic theme expects grayscale-safe explicit overrides. Non-grayscale color overrides found on ${colorOverrides.join(', ')}.`
      )
    }
  }

  const nodeCount = spec.nodes?.length || 0
  const moduleCount = spec.modules?.length || 0
  if (nodeCount > 18 || (moduleCount === 0 && nodeCount > 12)) {
    warnings.push(
      `Academic-paper profile is dense for a single-page figure (${nodeCount} nodes, ${moduleCount} modules). Split the figure or add modules before export.`
    )
  }

  return warnings
}

export function validateEdgeQuality(spec, layout) {
  const warnings = []
  const routedEdges = buildRoutedEdges(spec, layout)
  const corridorMap = new Map()

  for (const edge of routedEdges) {
    const style = edge.style || {}
    const sourcePos = layout.positions.get(edge.from)
    const targetPos = layout.positions.get(edge.to)
    if (!sourcePos || !targetPos) continue

    const hasWaypoints = edge.waypoints?.length > 0
    const cpPairs = [
      ['exitX', 'exitY'],
      ['entryX', 'entryY']
    ]
    for (const [xKey, yKey] of cpPairs) {
      const x = style[xKey]
      const y = style[yKey]
      if (x === undefined || y === undefined) continue
      const corner = (x === 0 || x === 1) && (y === 0 || y === 1)
      if (corner) {
        warnings.push(`Edge "${edge.from}->${edge.to}" uses corner connection point ${xKey}/${yKey}. Use face midpoints or distributed face slots.`)
      }
    }

    if (!hasWaypoints) {
      const sourceCenterX = sourcePos.x + sourcePos.width / 2
      const sourceCenterY = sourcePos.y + sourcePos.height / 2
      const targetCenterX = targetPos.x + targetPos.width / 2
      const targetCenterY = targetPos.y + targetPos.height / 2
      const horizontalGap = Math.abs(targetCenterX - sourceCenterX) - sourcePos.width / 2 - targetPos.width / 2
      const verticalGap = Math.abs(targetCenterY - sourceCenterY) - sourcePos.height / 2 - targetPos.height / 2
      const finalSegment = edge.__routing?.orientation === 'horizontal' ? horizontalGap : verticalGap
      if (finalSegment < 30) {
        warnings.push(`Edge "${edge.from}->${edge.to}" has a short final segment (${Math.round(finalSegment)}px). Keep the last segment at least 30px.`)
      }
    }

    if (hasWaypoints) {
      for (let i = 1; i < edge.waypoints.length; i++) {
        const prev = edge.waypoints[i - 1]
        const curr = edge.waypoints[i]
        if (Math.abs(prev.x - curr.x) < 1 && Math.abs(prev.y - curr.y) < 1) {
          warnings.push(`Edge "${edge.from}->${edge.to}" contains degenerate waypoint ${i}. Consecutive waypoints must differ by at least 1px.`)
        }
      }
    }

    if (edge.__routing) {
      const faceAxis = edge.__routing.orientation === 'horizontal'
        ? `${edge.from}:${edge.__routing.sourceFace}:${style.exitY}`
        : `${edge.from}:${edge.__routing.sourceFace}:${style.exitX}`
      if (!corridorMap.has(faceAxis)) corridorMap.set(faceAxis, [])
      corridorMap.get(faceAxis).push(edge)
    }

    if (edge.label && !hasWaypoints) {
      const gap = edge.__routing?.orientation === 'horizontal'
        ? Math.abs((targetPos.x + targetPos.width / 2) - (sourcePos.x + sourcePos.width / 2))
        : Math.abs((targetPos.y + targetPos.height / 2) - (sourcePos.y + sourcePos.height / 2))
      if (gap < 60) {
        warnings.push(`Edge "${edge.from}->${edge.to}" is short for a labeled connector. Increase spacing or offset the label further from the line.`)
      }
    }
  }

  for (const [corridor, group] of corridorMap.entries()) {
    if (group.length < 2) continue
    const slots = group.map(edge => edge.__routing?.orientation === 'horizontal' ? edge.style.exitY : edge.style.exitX)
    const uniqueSlots = new Set(slots.map(slot => Number(slot).toFixed(2)))
    if (uniqueSlots.size !== group.length) {
      warnings.push(`Edges sharing corridor "${corridor}" overlap on the same face position. Distribute them across 0.25/0.5/0.75 slots.`)
    }
  }

  return warnings
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

  // Check complexity
  const warnings = checkComplexity(spec)

  // Security: always throw on fatal-level warnings regardless of strict mode
  const fatals = warnings.filter(w => w.level === 'fatal')
  if (fatals.length > 0) {
    throw new Error('Safety limit exceeded: ' + fatals.map(e => e.message).join('; '))
  }

  // Strict mode: throw on error-level warnings
  if (options.strict) {
    const errors = warnings.filter(w => w.level === 'error')
    if (errors.length > 0) {
      throw new Error('Complexity check failed: ' + errors.map(e => e.message).join('; '))
    }
  }

  // Load theme
  const themeName = spec.meta?.theme || 'tech-blue'
  const theme = options.theme || loadTheme(themeName)
  const layout = calculateLayout(spec, theme)

  // Run validation passes
  const colorWarnings = validateColorScheme(spec, theme)
  const layoutWarnings = validateLayoutConsistency(spec)
  const connectionPointWarnings = validateConnectionPointPolicy(spec)
  const edgeWarnings = validateEdgeQuality(spec, layout)
  const academicWarnings = validateAcademicProfile(spec)
  const allValidationWarnings = [
    ...colorWarnings,
    ...layoutWarnings,
    ...connectionPointWarnings,
    ...edgeWarnings,
    ...academicWarnings
  ]

  if (allValidationWarnings.length > 0) {
    if (!options.silent) {
      console.warn('\n⚠️  drawio spec validation warnings:')
      allValidationWarnings.forEach(w => console.warn(`  • ${w}`))
    }
    if (options.strict) {
      throw new Error(
        `Spec validation failed with ${allValidationWarnings.length} warning(s):\n` +
        allValidationWarnings.map(w => `  • ${w}`).join('\n')
      )
    }
  }

  // Merge all warnings for callers that requested them
  warnings.push(...allValidationWarnings.map(msg => ({ level: 'warning', message: msg })))

  // Build XML
  const xml = buildXml(spec, theme, layout)

  // Return with warnings if requested
  if (options.returnWarnings) {
    return { xml, warnings }
  }

  return xml
}

/**
 * Parse YAML string to specification object
 * @param {string} yamlText - YAML specification text
 * @returns {Object} Parsed specification
 */
export function parseSpecYaml(yamlText) {
  if (yamlText == null) {
    throw new TypeError('yamlText must be a string')
  }
  if (yamlText.trim() === '') {
    return { meta: {}, nodes: [], edges: [], modules: [] }
  }
  let parsed
  try {
    parsed = yaml.load(yamlText, { schema: yaml.DEFAULT_SCHEMA })
  } catch (err) {
    throw new Error(`Failed to parse YAML specification: ${err.message}`)
  }
  const spec = parsed || {}
  spec.meta = spec.meta || {}
  spec.nodes = spec.nodes || []
  spec.edges = spec.edges || []
  spec.modules = spec.modules || []
  validateSpec(spec)
  return spec
}

/**
 * Validate spec structure and values for safety and correctness.
 * Throws descriptive error on first validation failure.
 * @param {Object} spec - Parsed specification object
 */
export function validateSpec(spec) {
  const VALID_ID = /^[A-Za-z][A-Za-z0-9_-]*$/
  const VALID_THEME = /^[a-z][a-z0-9-]*$/
  const VALID_ICON = /^[a-zA-Z][a-zA-Z0-9._-]*$/
  const VALID_LAYOUTS = ['horizontal', 'vertical', 'hierarchical', 'star', 'mesh']
  const VALID_ROUTINGS = ['orthogonal', 'rounded']
  const VALID_PROFILES = ['default', 'academic-paper', 'engineering-review']
  const VALID_FIGURE_TYPES = ['architecture', 'roadmap', 'workflow']
  const VALID_SOURCES = ['generated', 'replicated', 'edited']
  const VALID_REPLICATION_MODES = ['preserve-original', 'theme-first']
  const VALID_REPLICATION_TARGETS = ['canvas', 'nodes', 'edges', 'modules', 'mixed']
  const VALID_CONFIDENCE_LEVELS = ['low', 'medium', 'high']

  // Hard limits
  const MAX_NODES = 100
  const MAX_EDGES = 200
  const MAX_MODULES = 20

  // meta validation
  if (spec.meta?.theme != null && !VALID_THEME.test(spec.meta.theme)) {
    throw new Error(`Invalid meta.theme "${spec.meta.theme}": must match /^[a-z][a-z0-9-]*$/`)
  }
  if (spec.meta?.layout != null && !VALID_LAYOUTS.includes(spec.meta.layout)) {
    throw new Error(`Invalid meta.layout "${spec.meta.layout}": must be one of ${VALID_LAYOUTS.join(', ')}`)
  }
  if (spec.meta?.routing != null && !VALID_ROUTINGS.includes(spec.meta.routing)) {
    throw new Error(`Invalid meta.routing "${spec.meta.routing}": must be one of ${VALID_ROUTINGS.join(', ')}`)
  }
  if (spec.meta?.profile != null && !VALID_PROFILES.includes(spec.meta.profile)) {
    throw new Error(`Invalid meta.profile "${spec.meta.profile}": must be one of ${VALID_PROFILES.join(', ')}`)
  }
  if (spec.meta?.figureType != null && !VALID_FIGURE_TYPES.includes(spec.meta.figureType)) {
    throw new Error(
      `Invalid meta.figureType "${spec.meta.figureType}": must be one of ${VALID_FIGURE_TYPES.join(', ')}`
    )
  }
  if (spec.meta?.source != null && !VALID_SOURCES.includes(spec.meta.source)) {
    throw new Error(`Invalid meta.source "${spec.meta.source}": must be one of ${VALID_SOURCES.join(', ')}`)
  }
  if (spec.meta?.replication != null) {
    if (typeof spec.meta.replication !== 'object' || Array.isArray(spec.meta.replication)) {
      throw new Error('meta.replication must be an object when provided')
    }
    if (
      spec.meta.replication.colorMode != null &&
      !VALID_REPLICATION_MODES.includes(spec.meta.replication.colorMode)
    ) {
      throw new Error(
        `Invalid meta.replication.colorMode "${spec.meta.replication.colorMode}": ` +
        `must be one of ${VALID_REPLICATION_MODES.join(', ')}`
      )
    }
    if (
      spec.meta.replication.background != null &&
      typeof spec.meta.replication.background !== 'string'
    ) {
      throw new Error('meta.replication.background must be a string when provided')
    }
    if (spec.meta.replication.palette != null) {
      if (!Array.isArray(spec.meta.replication.palette)) {
        throw new Error('meta.replication.palette must be an array when provided')
      }
      spec.meta.replication.palette.forEach((entry, index) => {
        if (typeof entry !== 'object' || entry == null || Array.isArray(entry)) {
          throw new Error(`meta.replication.palette[${index}] must be an object`)
        }
        if (entry.hex != null && typeof entry.hex !== 'string') {
          throw new Error(`meta.replication.palette[${index}].hex must be a string when provided`)
        }
        if (entry.role != null && typeof entry.role !== 'string') {
          throw new Error(`meta.replication.palette[${index}].role must be a string when provided`)
        }
        if (
          entry.appliesTo != null &&
          !VALID_REPLICATION_TARGETS.includes(entry.appliesTo)
        ) {
          throw new Error(
            `Invalid meta.replication.palette[${index}].appliesTo "${entry.appliesTo}": ` +
            `must be one of ${VALID_REPLICATION_TARGETS.join(', ')}`
          )
        }
        if (
          entry.confidence != null &&
          !VALID_CONFIDENCE_LEVELS.includes(entry.confidence)
        ) {
          throw new Error(
            `Invalid meta.replication.palette[${index}].confidence "${entry.confidence}": ` +
            `must be one of ${VALID_CONFIDENCE_LEVELS.join(', ')}`
          )
        }
        if (entry.notes != null && typeof entry.notes !== 'string') {
          throw new Error(`meta.replication.palette[${index}].notes must be a string when provided`)
        }
      })
    }
    if (spec.meta.replication.confidenceNotes != null) {
      if (!Array.isArray(spec.meta.replication.confidenceNotes)) {
        throw new Error('meta.replication.confidenceNotes must be an array when provided')
      }
      spec.meta.replication.confidenceNotes.forEach((note, index) => {
        if (typeof note !== 'string') {
          throw new Error(`meta.replication.confidenceNotes[${index}] must be a string`)
        }
      })
    }
  }

  // Hard limit checks
  if (spec.nodes.length > MAX_NODES) {
    throw new Error(`Too many nodes (${spec.nodes.length}): maximum is ${MAX_NODES}`)
  }
  if (spec.edges.length > MAX_EDGES) {
    throw new Error(`Too many edges (${spec.edges.length}): maximum is ${MAX_EDGES}`)
  }
  if (spec.modules.length > MAX_MODULES) {
    throw new Error(`Too many modules (${spec.modules.length}): maximum is ${MAX_MODULES}`)
  }

  // Node validation
  for (const node of spec.nodes) {
    if (!node.id || !VALID_ID.test(node.id)) {
      throw new Error(`Invalid node id "${node.id}": must match /^[A-Za-z][A-Za-z0-9_-]*$/`)
    }
    if (!node.label || typeof node.label !== 'string') {
      throw new Error(`Node "${node.id}" is missing a required string label`)
    }
    if (node.type != null && !SHAPE_STYLES[node.type]) {
      throw new Error(`Node "${node.id}" has unknown type "${node.type}": must be one of ${Object.keys(SHAPE_STYLES).join(', ')}`)
    }
    if (node.icon != null && !VALID_ICON.test(node.icon)) {
      throw new Error(`Node "${node.id}" has invalid icon "${node.icon}": must match /^[a-zA-Z][a-zA-Z0-9._-]*$/`)
    }
    if (node.network != null) {
      if (typeof node.network !== 'object' || Array.isArray(node.network)) {
        throw new Error(`Node "${node.id}" network must be an object when provided`)
      }
      const networkStringFields = ['device', 'role', 'vendor', 'zone', 'ip', 'cidr']
      for (const field of networkStringFields) {
        if (node.network[field] != null && typeof node.network[field] !== 'string') {
          throw new Error(`Node "${node.id}" network.${field} must be a string when provided`)
        }
      }
      if (node.network.device != null && !VALID_ICON.test(node.network.device)) {
        throw new Error(`Node "${node.id}" has invalid network.device "${node.network.device}": must match /^[a-zA-Z][a-zA-Z0-9._-]*$/`)
      }
    }
    if (node.position != null) {
      if (typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
        throw new Error(`Node "${node.id}" position must have numeric x and y`)
      }
    }
  }

  // Edge validation
  for (const edge of spec.edges) {
    if (!edge.from || !VALID_ID.test(edge.from)) {
      throw new Error(`Invalid edge.from "${edge.from}": must match node ID pattern`)
    }
    if (!edge.to || !VALID_ID.test(edge.to)) {
      throw new Error(`Invalid edge.to "${edge.to}": must match node ID pattern`)
    }
    if (edge.label != null && typeof edge.label !== 'string') {
      throw new Error(`Edge "${edge.from}->${edge.to}" label must be a string`)
    }
    if (edge.srcInterface != null && typeof edge.srcInterface !== 'string') {
      throw new Error(`Edge "${edge.from}->${edge.to}" srcInterface must be a string`)
    }
    if (edge.dstInterface != null && typeof edge.dstInterface !== 'string') {
      throw new Error(`Edge "${edge.from}->${edge.to}" dstInterface must be a string`)
    }
    if (edge.ip != null && typeof edge.ip !== 'string') {
      throw new Error(`Edge "${edge.from}->${edge.to}" ip must be a string`)
    }
    if (edge.vlan != null && typeof edge.vlan !== 'string' && !Number.isInteger(edge.vlan)) {
      throw new Error(`Edge "${edge.from}->${edge.to}" vlan must be a string or integer`)
    }
    if (edge.bandwidth != null && typeof edge.bandwidth !== 'string') {
      throw new Error(`Edge "${edge.from}->${edge.to}" bandwidth must be a string`)
    }
    if (edge.linkType != null && typeof edge.linkType !== 'string') {
      throw new Error(`Edge "${edge.from}->${edge.to}" linkType must be a string`)
    }
    if (edge.waypoints != null) {
      if (!Array.isArray(edge.waypoints)) {
        throw new Error(`Edge "${edge.from}->${edge.to}" waypoints must be an array`)
      }
      edge.waypoints.forEach((point, index) => {
        if (typeof point?.x !== 'number' || typeof point?.y !== 'number') {
          throw new Error(`Edge "${edge.from}->${edge.to}" waypoint ${index} must have numeric x and y`)
        }
      })
    }
  }

  // Module validation
  for (const mod of spec.modules) {
    if (!mod.id || !VALID_ID.test(mod.id)) {
      throw new Error(`Invalid module id "${mod.id}": must match /^[A-Za-z][A-Za-z0-9_-]*$/`)
    }
    if (!mod.label || typeof mod.label !== 'string') {
      throw new Error(`Module "${mod.id}" is missing a required string label`)
    }
  }
}

/**
 * Validate draw.io XML structure
 * @param {string} xml - draw.io XML string
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateXml(xml) {
  const errors = []

  if (typeof xml !== 'string' || xml.trim() === '') {
    return { valid: false, errors: ['XML must be a non-empty string'] }
  }

  // Check root structure
  if (!xml.includes('<mxGraphModel')) {
    errors.push('Missing <mxGraphModel element')
  }
  if (!xml.includes('<root>')) {
    errors.push('Missing <root> element')
  }
  if (!xml.includes('</root>')) {
    errors.push('Missing </root> closing tag')
  }
  if (!xml.includes('</mxGraphModel>')) {
    errors.push('Missing </mxGraphModel> closing tag')
  }

  // Check required root cells
  if (!xml.includes('<mxCell id="0"/>')) {
    errors.push('Missing required <mxCell id="0"/>')
  }
  if (!xml.includes('<mxCell id="1" parent="0"/>')) {
    errors.push('Missing required <mxCell id="1" parent="0"/>')
  }

  // Extract all mxCell id values
  const idPattern = /<mxCell\s[^>]*\bid="([^"]+)"/g
  const allIds = []
  let match
  while ((match = idPattern.exec(xml)) !== null) {
    allIds.push(match[1])
  }

  // Check ID uniqueness
  const seen = new Set()
  const duplicates = new Set()
  for (const id of allIds) {
    if (seen.has(id)) {
      duplicates.add(id)
    }
    seen.add(id)
  }
  for (const dup of duplicates) {
    errors.push(`Duplicate cell ID: "${dup}"`)
  }

  // Collect vertex cell IDs (cells with vertex="1")
  const vertexPattern = /<mxCell\s[^>]*\bid="([^"]+)"[^>]*\bvertex="1"/g
  const vertexIds = new Set()
  while ((match = vertexPattern.exec(xml)) !== null) {
    vertexIds.add(match[1])
  }
  // Also check alternate attribute order
  const vertexPattern2 = /<mxCell\s[^>]*\bvertex="1"[^>]*\bid="([^"]+)"/g
  while ((match = vertexPattern2.exec(xml)) !== null) {
    vertexIds.add(match[1])
  }

  // Check edge source/target references
  const edgePattern = /<mxCell\s[^>]*\bedge="1"[^>]*/g
  while ((match = edgePattern.exec(xml)) !== null) {
    const edgeAttr = match[0]
    const srcMatch = /\bsource="([^"]+)"/.exec(edgeAttr)
    const tgtMatch = /\btarget="([^"]+)"/.exec(edgeAttr)
    const idMatch = /\bid="([^"]+)"/.exec(edgeAttr)
    const edgeId = idMatch ? idMatch[1] : '(unknown)'

    if (srcMatch && !vertexIds.has(srcMatch[1])) {
      errors.push(`Edge "${edgeId}" references nonexistent source ID: "${srcMatch[1]}"`)
    }
    if (tgtMatch && !vertexIds.has(tgtMatch[1])) {
      errors.push(`Edge "${edgeId}" references nonexistent target ID: "${tgtMatch[1]}"`)
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Complexity check - warn if diagram is too complex
 */
export function checkComplexity(spec) {
  const warnings = []

  const nodeCount = spec.nodes?.length || 0
  const edgeCount = spec.edges?.length || 0
  const moduleCount = spec.modules?.length || 0

  // Fatal hard caps (security limits — always enforced)
  if (nodeCount > 100) {
    warnings.push({ level: 'fatal', message: `Node count (${nodeCount}) exceeds safety limit of 100` })
  } else if (nodeCount > 30) {
    warnings.push({ level: 'error', message: `Too many nodes (${nodeCount}). Consider splitting into sub-diagrams.` })
  } else if (nodeCount > 20) {
    warnings.push({ level: 'warning', message: `Many nodes (${nodeCount}). Consider splitting for clarity.` })
  }

  if (edgeCount > 200) {
    warnings.push({ level: 'fatal', message: `Edge count (${edgeCount}) exceeds safety limit of 200` })
  } else if (edgeCount > 50) {
    warnings.push({ level: 'error', message: `Too many edges (${edgeCount}). Consider hierarchical layout.` })
  } else if (edgeCount > 30) {
    warnings.push({ level: 'warning', message: `Many edges (${edgeCount}). Consider simplifying.` })
  }

  if (moduleCount > 20) {
    warnings.push({ level: 'fatal', message: `Module count (${moduleCount}) exceeds safety limit of 20` })
  } else if (moduleCount > 5) {
    warnings.push({ level: 'warning', message: `Many modules (${moduleCount}). Consider zoom layers.` })
  }

  // Check label lengths
  for (const node of spec.nodes || []) {
    if (node.label && node.label.length > 200) {
      warnings.push({
        level: 'fatal',
        message: `Node "${node.id}" label exceeds 200 characters (${node.label.length} chars)`
      })
    } else if (node.label && node.label.length > 14) {
      warnings.push({
        level: 'info',
        message: `Node "${node.id}" label is long (${node.label.length} chars). Consider abbreviation.`
      })
    }
  }

  return warnings
}

/**
 * spec-to-drawio.js
 * Converts YAML/JSON specification to draw.io XML with Design System support
 */

import { isLikelyStandaloneMathLabel, prepareMathLabel } from '../math/index.js'
import { resolveImageIconStyle } from './icon-resolver.js'
import { resolveShapeNameKind } from './shape-catalog.js'
import { resolveIconShape } from './icon-mappings.js'
import { searchShapeCatalog } from './catalog-search.js'
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
      fontSize: { md: 20, sm: 18 }
    },
    borderRadius: { md: 8, lg: 12 },
    node: {
      default: {
        fillColor: '#DBEAFE',
        strokeColor: '#2563EB',
        strokeWidth: 1.5,
        fontColor: '#1E293B',
        fontSize: 20,
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
      operator: { fillColor: '#FFFFFF', strokeColor: '#424242' },
      llm: { fillColor: '#EDE9FE', strokeColor: '#7C3AED' },
      agent: { fillColor: '#DBEAFE', strokeColor: '#2563EB' },
      vector_store: { fillColor: '#D1FAE5', strokeColor: '#059669' },
      memory: { fillColor: '#FEF9C3', strokeColor: '#CA8A04' },
      tool: { fillColor: '#F1F5F9', strokeColor: '#475569' },
      gateway: { fillColor: '#FFEDD5', strokeColor: '#EA580C' }
    },
    connector: {
      primary: { strokeColor: '#1E293B', strokeWidth: 2, dashed: false, endArrow: 'open', endFill: false },
      data: {
        strokeColor: '#1E293B',
        strokeWidth: 2,
        dashed: true,
        dashPattern: '6 4',
        endArrow: 'open',
        endFill: false
      },
      optional: {
        strokeColor: '#64748B',
        strokeWidth: 1,
        dashed: true,
        dashPattern: '2 2',
        endArrow: 'open',
        endFill: false
      },
      dependency: { strokeColor: '#1E293B', strokeWidth: 1, dashed: false, endArrow: 'diamond', endFill: true },
      bidirectional: { strokeColor: '#64748B', strokeWidth: 1.5, dashed: false, endArrow: 'none', endFill: false },
      control: { strokeColor: '#EA580C', strokeWidth: 1.5, dashed: false, endArrow: 'open', endFill: false },
      memory_read: { strokeColor: '#059669', strokeWidth: 1.5, dashed: false, endArrow: 'open', endFill: false },
      memory_write: {
        strokeColor: '#059669',
        strokeWidth: 1.5,
        dashed: true,
        dashPattern: '5 3',
        endArrow: 'open',
        endFill: false
      },
      async: {
        strokeColor: '#6B7280',
        strokeWidth: 1.5,
        dashed: true,
        dashPattern: '4 2',
        endArrow: 'open',
        endFill: false
      },
      feedback: { strokeColor: '#7C3AED', strokeWidth: 1.5, dashed: false, endArrow: 'open', endFill: false }
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
  text: ['standalone text', 'annotation', 'caption', 'legend note', 'title text'],
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
  attention: [
    'attention',
    'attn',
    'softmax',
    'transformer',
    'self-attention',
    'multi-head',
    'mha',
    'cross-attention',
    'qkv'
  ],

  // Deep learning - Normalization & Regularization
  norm: ['batchnorm', 'layernorm', 'groupnorm', 'instancenorm', 'normalization', 'batch norm', 'layer norm', 'dropout'],

  // Deep learning - Gate & Activation
  gate: [
    'gating',
    'gate mechanism',
    'multiply gate',
    'sigmoid gate',
    'tanh gate',
    'forget gate',
    'input gate',
    'output gate'
  ],

  // Deep learning - Graph Neural Network
  graph: [
    'graph conv',
    'gcn',
    'gnn',
    'graph attention',
    'adjacency',
    'node feature',
    'edge feature',
    'message passing',
    'aggregation'
  ],

  // Deep learning - Matrix operations & Linear layers
  matrix: [
    'matmul',
    'linear layer',
    'fc layer',
    'dense layer',
    'mlp',
    'weight matrix',
    'fully connected',
    'projection'
  ],

  // Deep learning - Operators (for small circular nodes)
  operator: ['⊕', '⊗', '⊙', 'concat', 'element-wise', 'hadamard', 'residual add', 'skip add', '⊞'],

  // Deep learning - 3D Feature Maps / Tensors (for CNN visualizations)
  tensor3d: [
    'tensor',
    'feature map',
    '3d feature',
    'activation map',
    'channel',
    'h×w×c',
    'hwc',
    'chw',
    'nchw',
    'nhwc',
    'cube',
    '3d block',
    'volume'
  ]
}

export const SHAPE_STYLES = {
  // Traditional shapes
  service: 'rounded=1;arcSize=20',
  database: 'shape=cylinder3;boundedLbl=1;backgroundOutline=1;size=15',
  decision: 'rhombus',
  terminal: 'rounded=1;arcSize=50',
  queue: 'shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1',
  user: 'ellipse',
  document: 'shape=document;boundedLbl=1',
  formula: 'rounded=1',
  text: 'text',
  cloud: 'ellipse;shape=cloud',
  process: 'rounded=1;arcSize=20',
  router: 'ellipse',
  switch: 'shape=switch',
  firewall: 'shape=mxgraph.cisco.security.firewall;sketch=0',
  server: 'rounded=1;arcSize=12',
  load_balancer: 'shape=hexagon;perimeter=hexagonPerimeter2',
  subnet: 'swimlane;startSize=24',
  internet: 'ellipse;shape=cloud',
  ap: 'shape=mxgraph.cisco.misc.access_point;sketch=0',

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
  tensor3d: 'shape=cube;size=10;direction=south',

  // Agentic / LLM system shapes (fireworks vocabulary) -- reuse existing
  // primitives, distinguished by theme color; no new drawing code paths.
  llm: 'rounded=1;arcSize=20',
  agent: 'shape=hexagon;perimeter=hexagonPerimeter2',
  vector_store: 'shape=cylinder3;boundedLbl=1;backgroundOutline=1;size=15',
  memory: 'rounded=1;arcSize=20;dashed=1',
  tool: 'rounded=1;arcSize=20',
  gateway: 'shape=hexagon;perimeter=hexagonPerimeter2'
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
    if (keywords.some((kw) => lowerLabel.includes(kw))) {
      return type
    }
  }

  return 'service' // Default
}

// ============================================================================
// Size Presets
// ============================================================================

// Font-size ladder: create-flow defaults per text class. Labels should fill
// their boxes (paper-readable) instead of floating in oversized containers.
// Explicit style.fontSize always wins; explicit-bounds boxes (replicate flow)
// shrink a class uniformly, never below FONT_SIZE_FLOOR.
export const FONT_LADDER = {
  moduleTitle: 22,
  node: 20,
  edgeLabel: 18,
  text: 16
}
export const FONT_SIZE_FLOOR = 12

// Shapes whose size encodes meaning (operators, 3D tensors) or whose label is
// not plain text (formula) keep preset sizes instead of growing with content.
const CONTENT_SIZE_EXEMPT_TYPES = new Set(['operator', 'tensor3d', 'formula'])

const SIZE_PRESETS = {
  tiny: { width: 32, height: 32 }, // For operators (⊕⊗)
  small: { width: 80, height: 40 },
  medium: { width: 120, height: 60 },
  large: { width: 160, height: 80 },
  xl: { width: 200, height: 100 },
  // 3D Feature Map sizes (cube-like proportions)
  tensor_sm: { width: 40, height: 48 }, // Small feature map
  tensor_md: { width: 60, height: 72 }, // Medium feature map
  tensor_lg: { width: 80, height: 96 }, // Large feature map
  tensor_xl: { width: 100, height: 120 } // Extra large feature map
}

// Default sizes for specific node types
const TYPE_DEFAULT_SIZES = {
  operator: 'tiny',
  decision: 'medium',
  terminal: 'small',
  user: 'small',
  text: 'medium',
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
 * Estimate a content-fitted size for a standalone text node so the box hugs the
 * text instead of stretching to a container width. Oversized text boxes overlap
 * neighbors and are hard to select and move, so we keep the box just wider than
 * the longest line. Latin glyphs are roughly 0.6em wide and CJK glyphs roughly
 * 1.05em; width adds horizontal padding and is clamped so an unusually long
 * label wraps via whiteSpace=wrap instead of overflowing the canvas.
 */
function estimateTextSize(label, fontSize = FONT_LADDER.text) {
  const lines = String(label).split(/\n|<br\s*\/?>/i)
  let maxLineWidth = 0
  for (const line of lines) {
    let lineWidth = 0
    for (const ch of line) {
      lineWidth += /[\u3000-\u9fff\uff00-\uffef]/.test(ch) ? fontSize * 1.05 : fontSize * 0.6
    }
    maxLineWidth = Math.max(maxLineWidth, lineWidth)
  }
  const width = Math.min(Math.max(Math.ceil(maxLineWidth) + 20, 48), 320)
  const height = Math.max(Math.ceil(lines.length * fontSize * 1.4) + 12, 24)
  return { width, height }
}

/**
 * Raw text extent without the usability floors of estimateTextSize. Used by
 * lint passes that compare declared bounds or label boxes against content.
 */
function measureLabelExtent(label, fontSize = FONT_LADDER.text, padding = 8) {
  const lines = String(label).split(/\n|<br\s*\/?>/i)
  let maxLineWidth = 0
  for (const line of lines) {
    let lineWidth = 0
    for (const ch of line) {
      lineWidth += /[\u3000-\u9fff\uff00-\uffef]/.test(ch) ? fontSize * 1.05 : fontSize * 0.6
    }
    maxLineWidth = Math.max(maxLineWidth, lineWidth)
  }
  return {
    width: Math.ceil(maxLineWidth) + padding,
    height: Math.ceil(lines.length * fontSize * 1.4) + padding
  }
}

/**
 * Get node dimensions based on size preset or node type
 */
export function getNodeSize(size, nodeType = null, label = null, options = null) {
  // Text nodes without an explicit size fit their content so the box stays just
  // wider than the text and remains easy to select, move, and transform.
  if (!(size && SIZE_PRESETS[size]) && nodeType === 'text' && label) {
    return estimateTextSize(label, options?.fontSize ?? FONT_LADDER.text)
  }

  const preset =
    size && SIZE_PRESETS[size]
      ? SIZE_PRESETS[size]
      : nodeType && TYPE_DEFAULT_SIZES[nodeType]
        ? SIZE_PRESETS[TYPE_DEFAULT_SIZES[nodeType]]
        : SIZE_PRESETS.medium

  // Presets act as minimums once a label is present: the box grows so the
  // label never paints outside the shape. Icon labels render below the shape,
  // and size-coded shapes (operators, tensors, formulas) keep their preset.
  if (
    options?.contentAware &&
    label &&
    nodeType !== 'text' &&
    !CONTENT_SIZE_EXEMPT_TYPES.has(nodeType) &&
    !hasMathMarkers(label)
  ) {
    const extent = measureLabelExtent(label, options.fontSize ?? FONT_LADDER.node, 0)
    const snapUp = (value) => Math.ceil(value / 8) * 8
    return {
      width: Math.max(preset.width, snapUp(extent.width + 28)),
      height: Math.max(preset.height, snapUp(extent.height + 20))
    }
  }

  return preset
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

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function parseCanvasSize(canvas) {
  if (canvas == null || canvas === 'auto') return null
  if (typeof canvas !== 'string') {
    throw new Error('Invalid meta.canvas: use "auto" or WIDTHxHEIGHT')
  }

  const match = /^(\d+)x(\d+)$/.exec(canvas)
  if (!match) {
    throw new Error(`Invalid meta.canvas "${canvas}": use "auto" or WIDTHxHEIGHT`)
  }

  const width = Number(match[1])
  const height = Number(match[2])
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0) {
    throw new Error(`Invalid meta.canvas "${canvas}": width and height must be positive integers`)
  }

  return { width, height }
}

function resolveCanvasSize(canvas, autoWidth, autoHeight) {
  const explicit = parseCanvasSize(canvas)
  if (!explicit) return { width: autoWidth, height: autoHeight }
  return {
    width: Math.max(autoWidth, explicit.width),
    height: Math.max(autoHeight, explicit.height)
  }
}

function normalizeNodeBounds(node) {
  const bounds = node?.bounds
  if (!bounds) return null
  if (
    !isFiniteNumber(bounds.x) ||
    !isFiniteNumber(bounds.y) ||
    !isFiniteNumber(bounds.width) ||
    !isFiniteNumber(bounds.height)
  ) {
    return null
  }
  return {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height
  }
}

// ============================================================================
// Layout Engine
// ============================================================================

// North-South tiers for layout: tiered — external systems on top, endpoints at
// the bottom. Explicit node.network.tier wins, then role, then semantic type.
const NETWORK_ROLE_TIERS = {
  internet: 0,
  wan: 0,
  isp: 0,
  external: 0,
  firewall: 1,
  dmz: 1,
  router: 1,
  core: 2,
  distribution: 3,
  aggregation: 3,
  access: 4,
  switch: 4,
  wireless: 4,
  server: 5,
  endpoint: 5,
  host: 5,
  storage: 5,
  database: 5
}

const NETWORK_TYPE_TIERS = {
  cloud: 0,
  internet: 0,
  firewall: 1,
  router: 1,
  load_balancer: 2,
  switch: 4,
  server: 5,
  database: 5,
  storage: 5,
  user: 5,
  terminal: 5
}

function resolveNetworkTier(node) {
  const explicit = node.network?.tier
  if (typeof explicit === 'number' && Number.isFinite(explicit)) return explicit
  const role = typeof node.network?.role === 'string' ? node.network.role.toLowerCase() : null
  if (role && NETWORK_ROLE_TIERS[role] !== undefined) return NETWORK_ROLE_TIERS[role]
  const semanticType = detectSemanticType(node.label, node.type, node.network)
  if (NETWORK_TYPE_TIERS[semanticType] !== undefined) return NETWORK_TYPE_TIERS[semanticType]
  return 2.5
}

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

  const sizeOptions = (node) => ({
    fontSize: node.style?.fontSize,
    contentAware: !(node.icon || deriveNodeIcon(node))
  })

  const placeNode = (node, x, y) => {
    const semanticType = detectSemanticType(node.label, node.type, node.network)
    const size = getNodeSize(node.size, semanticType, node.label, sizeOptions(node))
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
    const size = getNodeSize(node.size, semanticType, node.label, sizeOptions(node))
    return { semanticType, size }
  }

  // Handle manually positioned nodes first
  const manuallyPositioned = new Set()
  for (const node of nodes) {
    const explicitBounds = normalizeNodeBounds(node)
    if (explicitBounds) {
      positions.set(node.id, explicitBounds)
      manuallyPositioned.add(node.id)
    } else if (node.position && typeof node.position.x === 'number' && typeof node.position.y === 'number') {
      const semanticType = detectSemanticType(node.label, node.type, node.network)
      const size = getNodeSize(node.size, semanticType, node.label, sizeOptions(node))
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
        const size = getNodeSize(node.size, semanticType, node.label, sizeOptions(node))
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
        const size = getNodeSize(node.size, semanticType, node.label, sizeOptions(node))
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
    const autoNodes = nodes.filter((node) => !manuallyPositioned.has(node.id))
    if (autoNodes.length > 0) {
      const centerNode =
        autoNodes.find((node) => {
          const type = detectSemanticType(node.label, node.type, node.network)
          return ['router', 'switch', 'load_balancer', 'firewall'].includes(type)
        }) || autoNodes[0]

      const centerX = 360
      const centerY = 180
      placeNode(centerNode, centerX, centerY)

      const spokes = autoNodes.filter((node) => node.id !== centerNode.id)
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
    const autoNodes = nodes.filter((node) => !manuallyPositioned.has(node.id))
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
  } else if (layout === 'tiered') {
    // North-South rows: sort tiers ascending, center each row horizontally.
    const autoNodes = nodes.filter((node) => !manuallyPositioned.has(node.id))
    const tierBuckets = new Map()
    for (const node of autoNodes) {
      const tier = resolveNetworkTier(node)
      if (!tierBuckets.has(tier)) tierBuckets.set(tier, [])
      tierBuckets.get(tier).push(node)
    }
    const rowGap = 96
    const nodeGap = 48
    const rowMetrics = [...tierBuckets.keys()]
      .sort((a, b) => a - b)
      .map((tier) => {
        const rowNodes = tierBuckets.get(tier)
        const moduleOrder = new Map()
        for (const node of rowNodes) {
          const key = node.module || ''
          if (!moduleOrder.has(key)) moduleOrder.set(key, moduleOrder.size)
        }
        rowNodes.sort((a, b) => moduleOrder.get(a.module || '') - moduleOrder.get(b.module || ''))
        const sizes = rowNodes.map((node) => getNodeMetrics(node).size)
        const width = sizes.reduce((sum, size) => sum + size.width, 0) + nodeGap * Math.max(rowNodes.length - 1, 0)
        const height = Math.max(...sizes.map((size) => size.height))
        return { rowNodes, sizes, width, height }
      })
    const maxRowWidth = rowMetrics.reduce((max, row) => Math.max(max, row.width), 0)
    let rowY = 40
    for (const row of rowMetrics) {
      let nodeX = 40 + (maxRowWidth - row.width) / 2
      row.rowNodes.forEach((node, index) => {
        placeNode(node, nodeX, rowY)
        nodeX += row.sizes[index].width + nodeGap
      })
      rowY += row.height + rowGap
    }
  } else {
    // Hierarchical or other: simple grid layout
    let row = 0
    let col = 0
    const maxCols = 4

    for (const node of nodes) {
      if (manuallyPositioned.has(node.id)) continue
      const semanticType = detectSemanticType(node.label, node.type, node.network)
      const size = getNodeSize(node.size, semanticType, node.label, sizeOptions(node))
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

    const nodePositions = moduleNodes.map((node) => positions.get(node.id)).filter(Boolean)

    if (nodePositions.length === 0) continue

    const minX = Math.min(...nodePositions.map((pos) => pos.x))
    const minY = Math.min(...nodePositions.map((pos) => pos.y))
    const maxX = Math.max(...nodePositions.map((pos) => pos.x + pos.width))
    const maxY = Math.max(...nodePositions.map((pos) => pos.y + pos.height))

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

const NETWORK_VENDOR_DEVICE_ICONS = {
  aws: {
    internet: 'aws.internet_gateway',
    internet_gateway: 'aws.internet_gateway',
    load_balancer: 'aws.application_load_balancer',
    application_load_balancer: 'aws.application_load_balancer',
    // aws4 has no plain ec2_instance stencil; aws.ec2 resolves via the aws4 resourceIcon style
    server: 'aws.ec2',
    ec2: 'aws.ec2',
    ec2_instance: 'aws.ec2',
    // subnet intentionally unmapped: the subnet semantic type renders as a swimlane group box
    rds: 'aws.rds_instance',
    rds_instance: 'aws.rds_instance'
  },
  cisco: {
    firewall: 'mxgraph.cisco.security.firewall',
    ap: 'mxgraph.cisco.misc.access_point',
    access_point: 'mxgraph.cisco.misc.access_point'
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

function safeStyleText(value, fallback) {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  if (trimmed === '' || /[;<>"\r\n]/.test(trimmed)) return fallback
  return trimmed
}

function containsCjk(text) {
  return typeof text === 'string' && /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/.test(text)
}

// Latin glyphs resolve from Times New Roman and CJK glyphs fall through to
// SimSun (per-glyph CSS fallback), matching the thesis convention of Times New
// Roman for Western text and SimSun for Chinese text inside one label.
function getDefaultFontPolicy() {
  return {
    primary: 'Times New Roman',
    cjk: 'Times New Roman,SimSun',
    formula: 'Times New Roman'
  }
}

function resolveFontBucket({ text, semanticType, treatAsFormula = false }) {
  if (semanticType === 'formula' || treatAsFormula) return 'formula'
  if (containsCjk(text)) return 'cjk'
  return 'primary'
}

function resolveFontFamily(spec, theme, { text, semanticType, styleFontFamily = null, treatAsFormula = false }) {
  const bucket = resolveFontBucket({ text, semanticType, treatAsFormula })
  const forcedFontFamily = safeStyleText(spec.meta?.font?.[bucket], null)
  if (forcedFontFamily) return forcedFontFamily

  const themeFontFamily = safeStyleText(theme?.typography?.fontFamily?.[bucket], null)
  const fallbackFontFamily = themeFontFamily || safeStyleText(getDefaultFontPolicy()[bucket], 'Times New Roman')
  return safeStyleText(styleFontFamily, fallbackFontFamily)
}

function resolveFontStyle(style = {}) {
  let bits = Number.isInteger(style.fontStyle) ? style.fontStyle : 0
  if (style.bold || style.fontWeight >= 600) bits |= 1
  if (style.italic) bits |= 2
  return bits
}

function pushNumberStyle(parts, name, value) {
  if (isFiniteNumber(value)) parts.push(`${name}=${value}`)
}

function pushTextSpacing(parts, style = {}) {
  pushNumberStyle(parts, 'spacingLeft', style.spacingLeft)
  pushNumberStyle(parts, 'spacingRight', style.spacingRight)
  pushNumberStyle(parts, 'spacingTop', style.spacingTop)
  pushNumberStyle(parts, 'spacingBottom', style.spacingBottom)
}

/**
 * Apply a theme-declared corner radius to a SHAPE_STYLES base style.
 * Only rectangle-family styles (carrying a rounded= token) are affected, and
 * stadium shapes (arcSize>=50, e.g. terminal) keep their semantic rounding.
 * themeRounded=0 emits square corners (rounded=0, no arcSize).
 */
function applyThemeRounding(shapeStyle, themeRounded) {
  if (!isFiniteNumber(themeRounded)) return shapeStyle
  if (!/(^|;)rounded=/.test(shapeStyle)) return shapeStyle
  const arcMatch = /(?:^|;)arcSize=(\d+)/.exec(shapeStyle)
  if (arcMatch && Number(arcMatch[1]) >= 50) return shapeStyle
  const tokens = shapeStyle.split(';').filter((t) => t && !t.startsWith('rounded=') && !t.startsWith('arcSize='))
  const rounding = themeRounded > 0 ? ['rounded=1', `arcSize=${Math.min(themeRounded, 50)}`] : ['rounded=0']
  return [...rounding, ...tokens].join(';')
}

export { resolveIconShape }

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
  return generateNodeStyleWithSpec(node, theme, { meta: {} })
}

function generateNodeStyleWithSpec(node, theme, spec) {
  const semanticType = detectSemanticType(node.label, node.type, node.network)
  const shapeStyle = SHAPE_STYLES[semanticType] || SHAPE_STYLES.service

  // Get colors from theme
  const nodeTheme = theme.node?.[semanticType] || theme.node?.default || {}
  const defaultTheme = theme.node?.default || {}
  const isTextNode = semanticType === 'text'

  // Plain text boxes always render transparent: captions, callouts, and
  // vertical labels must never mask the grid or connectors behind them.
  // Explicit fills on type "text" are ignored (use a shape node or formula
  // type for a filled label); validateTextNodeStyles reports the override.
  const fillColor = isTextNode
    ? 'none'
    : resolveThemeColor(node.style?.fillColor, theme, nodeTheme.fillColor || defaultTheme.fillColor || '#DBEAFE')
  const strokeColor = isTextNode
    ? 'none'
    : resolveThemeColor(node.style?.strokeColor, theme, nodeTheme.strokeColor || defaultTheme.strokeColor || '#2563EB')
  const strokeWidth =
    node.style?.strokeWidth ?? (isTextNode ? 0 : (nodeTheme.strokeWidth ?? defaultTheme.strokeWidth ?? 1.5))
  const fontColor = resolveThemeColor(
    node.style?.fontColor,
    theme,
    nodeTheme.fontColor || defaultTheme.fontColor || '#1E293B'
  )
  const fontSize = node.style?.fontSize ?? nodeTheme.fontSize ?? defaultTheme.fontSize ?? FONT_LADDER.node
  const fontFamily = resolveFontFamily(spec, theme, {
    text: node.label,
    semanticType,
    styleFontFamily: node.style?.fontFamily
  })
  const align = safeStyleText(node.style?.align, isTextNode ? 'left' : 'center')
  const verticalAlign = safeStyleText(node.style?.verticalAlign, isTextNode ? 'top' : 'middle')
  const fontStyle = resolveFontStyle(node.style)

  if (isTextNode) {
    const parts = [
      shapeStyle,
      'html=1',
      'whiteSpace=wrap',
      'labelBackgroundColor=none',
      `fillColor=${fillColor}`,
      `strokeColor=${strokeColor}`,
      `strokeWidth=${strokeWidth}`,
      `fontColor=${fontColor}`,
      `fontSize=${fontSize}`,
      `fontFamily=${fontFamily}`,
      `align=${align}`,
      `verticalAlign=${verticalAlign}`
    ]
    if (fontStyle) parts.push(`fontStyle=${fontStyle}`)
    pushTextSpacing(parts, node.style)
    return parts.join(';')
  }

  // If node has an icon, override shape to use the icon
  const iconName = node.icon || deriveNodeIcon(node)
  const imageIconStyle = resolveImageIconStyle(iconName)
  const iconShape = imageIconStyle ? null : resolveIconShape(iconName)
  let effectiveShapeStyle = applyThemeRounding(shapeStyle, nodeTheme.rounded ?? defaultTheme.rounded)
  const parts = []
  if (imageIconStyle) {
    effectiveShapeStyle = imageIconStyle
    parts.push(effectiveShapeStyle)
    parts.push('whiteSpace=wrap')
    parts.push(`fillColor=${fillColor}`)
    parts.push(`strokeColor=${strokeColor}`)
    parts.push(`strokeWidth=${strokeWidth}`)
    parts.push(`fontColor=${fontColor}`)
    parts.push(`fontSize=${fontSize}`)
    parts.push(`fontFamily=${fontFamily}`)
    parts.push('labelBackgroundColor=none')
    parts.push(`align=${align}`)
  } else if (iconShape) {
    // aws4 service icons that only exist as resource icons need the compound style
    const iconKind = resolveShapeNameKind(iconShape)
    effectiveShapeStyle =
      iconKind === 'aws4ResourceIcon'
        ? `shape=mxgraph.aws4.resourceIcon;resIcon=${iconShape};aspect=fixed`
        : iconKind === 'k8sParamIcon'
          ? `shape=${iconShape.replace(/:prIcon=/, ';prIcon=')};aspect=fixed`
          : `shape=${iconShape}`
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
    parts.push(`align=${align}`)
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
      `verticalAlign=${verticalAlign}`,
      `align=${align}`
    )
  }

  if (fontStyle) parts.push(`fontStyle=${fontStyle}`)
  pushTextSpacing(parts, node.style)

  return parts.join(';')
}

const DEFAULT_ARROW_HEAD_SIZE = 12
// Open/none arrowheads render unfilled; block/classic/diamond render filled by convention.
const UNFILLED_ARROWS = new Set(['open', 'openThin', 'none'])
const defaultArrowFill = (arrow) => !UNFILLED_ARROWS.has(arrow)

/**
 * Generate mxCell style string for a connector
 */
export function generateConnectorStyle(edge, theme, routing = 'orthogonal') {
  const connectorType = edge.type || 'primary'
  const connectorTheme = theme.connector?.[connectorType] || theme.connector?.primary || {}

  const strokeColor = resolveThemeColor(edge.style?.strokeColor, theme, connectorTheme.strokeColor || '#1E293B')
  const strokeWidth = edge.style?.strokeWidth ?? connectorTheme.strokeWidth ?? 2
  const dashed = edge.style?.dashed ?? connectorTheme.dashed ?? false
  const dashPattern = edge.style?.dashPattern || connectorTheme.dashPattern || '6 4'
  const endArrow = edge.style?.endArrow || connectorTheme.endArrow || 'open'
  const endFill =
    edge.style?.endFill ??
    (edge.style?.endArrow
      ? defaultArrowFill(edge.style.endArrow)
      : (connectorTheme.endFill ?? defaultArrowFill(endArrow)))
  const startArrow = edge.style?.startArrow || connectorTheme.startArrow
  const startFill =
    edge.style?.startFill ??
    (edge.style?.startArrow
      ? defaultArrowFill(edge.style.startArrow)
      : (connectorTheme.startFill ?? defaultArrowFill(startArrow)))

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

  // Bold arrowheads by default (block, classic, open): small stock arrowheads read as
  // afterthoughts on 2px architecture connectors.
  const endSize =
    edge.style?.endSize ??
    connectorTheme.endSize ??
    (endArrow === 'block' || endArrow === 'classic' || endArrow === 'open' ? DEFAULT_ARROW_HEAD_SIZE : undefined)
  if (endSize !== undefined) parts.push(`endSize=${endSize}`)

  if (startArrow) {
    parts.push(`startArrow=${startArrow}`)
    parts.push(`startFill=${startFill ? 1 : 0}`)
    const startSize =
      edge.style?.startSize ??
      connectorTheme.startSize ??
      (startArrow === 'block' || startArrow === 'classic' || startArrow === 'open' ? DEFAULT_ARROW_HEAD_SIZE : undefined)
    if (startSize !== undefined) parts.push(`startSize=${startSize}`)
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
  return generateModuleStyleWithSpec(module, theme, { meta: {} })
}

function generateModuleStyleWithSpec(module, theme, spec) {
  const moduleTheme = theme.module || {}

  const fillColor = resolveThemeColor(
    module.style?.fillColor || module.color,
    theme,
    moduleTheme.fillColor || '#F8FAFC'
  )
  const strokeColor = resolveThemeColor(module.style?.strokeColor, theme, moduleTheme.strokeColor || '#E2E8F0')
  const strokeWidth = moduleTheme.strokeWidth ?? 1
  const rounded = moduleTheme.rounded ?? 12
  const fontColor = resolveThemeColor(module.style?.fontColor, theme, moduleTheme.labelFontColor || '#1E293B')
  const fontSize = moduleTheme.labelFontSize ?? FONT_LADDER.moduleTitle
  const fontWeight = moduleTheme.labelFontWeight ?? 600
  const fontFamily = resolveFontFamily(spec, theme, {
    text: module.label,
    semanticType: 'text',
    styleFontFamily: module.style?.fontFamily
  })

  // IEEE style dashed border support
  const dashed = module.style?.dashed ?? moduleTheme.dashed ?? false
  const dashPattern = module.style?.dashPattern || moduleTheme.dashPattern || '8 4'

  const parts = [
    rounded > 0 ? `rounded=1` : `rounded=0`,
    rounded > 0 ? `arcSize=${Math.min(rounded, 20)}` : '',
    'html=1',
    'whiteSpace=wrap',
    `fillColor=${fillColor}`,
    `strokeColor=${strokeColor}`,
    `strokeWidth=${strokeWidth}`,
    `fontColor=${fontColor}`,
    `fontSize=${fontSize}`,
    `fontFamily=${fontFamily}`,
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

function resolveEdgeLabelFontSize(edge) {
  return edge.style?.fontSize ?? FONT_LADDER.edgeLabel
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

function defaultEdgeLabelOffset(edge) {
  // draw.io centers an edge label on the offset point, so the offset must
  // cover half the label extent plus clearance, or wide CJK labels will sit
  // right on top of the connector they annotate. A bent fallback edge anchors
  // its label on the middle segment, which runs perpendicular to the overall
  // orientation, so the clearing axis flips.
  const label = formatNetworkEdgeLabel(edge)
  const extent = label ? measureLabelExtent(label, resolveEdgeLabelFontSize(edge), 2) : { width: 0, height: 0 }
  const vertical = edge.__routing?.orientation === 'vertical'
  const clearHorizontally = edge.__bent ? !vertical : vertical
  if (clearHorizontally) {
    return { x: 8 + Math.ceil(extent.width / 2), y: 0 }
  }
  return { x: 0, y: -(8 + Math.ceil(extent.height / 2)) }
}

function resolveEdgeLabelOffset(edge) {
  const explicit = edge.labelOffset
  if (explicit && isFiniteNumber(explicit.x) && isFiniteNumber(explicit.y)) {
    return explicit
  }
  return defaultEdgeLabelOffset(edge)
}

// ============================================================================
// XML Generation
// ============================================================================

const MATH_DELIMITER_PATTERN = /\$\$|\\\(|\\\[|`/

/**
 * XML attribute-value normalization folds literal newlines into spaces, so
 * multi-line labels (including one-character-per-line vertical CJK labels)
 * must travel as <br> tags, which html=1 labels render as real line breaks.
 * Math labels keep their newlines: <br> inside $$...$$ breaks MathJax.
 */
function toHtmlLineBreaks(escapedLabel, rawLabel) {
  if (MATH_DELIMITER_PATTERN.test(String(rawLabel))) return escapedLabel
  return escapedLabel.replace(/\n/g, '&lt;br&gt;')
}

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

  const autoCanvasWidth = snapToGrid(maxX + 80, 8)
  const autoCanvasHeight = snapToGrid(maxY + 80, 8)
  const canvas = resolveCanvasSize(spec.meta?.canvas, autoCanvasWidth, autoCanvasHeight)

  // Generate module containers
  const moduleIdMap = new Map()
  for (const [moduleId, pos] of modulePositions) {
    if (moduleId === '__default__') continue

    const module = spec.modules?.find((m) => m.id === moduleId)
    if (!module) continue

    const cellId = allocId()
    moduleIdMap.set(moduleId, cellId)

    const style = generateModuleStyleWithSpec(module, theme, spec)
    const label = toHtmlLineBreaks(prepareMathLabel(module.label || moduleId), module.label || moduleId)

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

    const style = generateNodeStyleWithSpec(node, theme, spec)
    const label = toHtmlLineBreaks(prepareMathLabel(node.label), node.label)
    const parentId = node.module && moduleIdMap.has(node.module) ? moduleIdMap.get(node.module) : '1'

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
    const edgeLabel = rawEdgeLabel ? toHtmlLineBreaks(prepareMathLabel(rawEdgeLabel), rawEdgeLabel) : ''

    const edgeCellValue = rawEdgeLabel ? '' : edgeLabel
    let edgeXml = `<mxCell id="${cellId}" value="${edgeCellValue}" style="${style}" edge="1" parent="1" source="${sourceId}" target="${targetId}">`
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
      const labelX = edge.labelPosition === 'start' ? '0.2' : edge.labelPosition === 'end' ? '0.8' : '0.5' // center (default)
      const offset = resolveEdgeLabelOffset(edge)
      const labelOffset = `<mxPoint x="${offset.x}" y="${offset.y}" as="offset"/>`
      const labelFontSize = resolveEdgeLabelFontSize(edge)
      const labelFontColor = resolveThemeColor(edge.style?.fontColor, theme, theme.colors?.textMuted || '#64748B')
      const labelFontFamily = resolveFontFamily(spec, theme, {
        text: rawEdgeLabel,
        semanticType: 'text',
        treatAsFormula: isLikelyStandaloneMathLabel(rawEdgeLabel)
      })
      edgeXml += `</mxCell>`
      edgeXml += `<mxCell id="${labelId}" value="${edgeLabel}" style="edgeLabel;html=1;align=center;verticalAlign=middle;fontSize=${labelFontSize};fontColor=${labelFontColor};fontFamily=${labelFontFamily};" vertex="1" connectable="0" parent="${cellId}">`
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
    `<mxGraphModel dx="1120" dy="720" grid="1" gridSize="8" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${canvas.width}" pageHeight="${canvas.height}" math="1" background="${canvasBackground}">` +
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
  return String(label || '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Estimate the rendered length of a label: math delimiters vanish and each
 * TeX command renders as roughly one glyph, so counting raw source length
 * would flag legitimate tensor formulas as verbose.
 */
function estimateVisibleLabelLength(label) {
  return String(label || '')
    .replace(/\$\$|\\\(|\\\)/g, '')
    .replace(/\\[a-zA-Z]+/g, 'x')
    .replace(/[{}^_]/g, '')
    .replace(/\s+/g, ' ')
    .trim().length
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
    return `#${hex
      .split('')
      .map((char) => char + char)
      .join('')
      .toUpperCase()}`
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

  spec.nodes?.forEach((node) => {
    checkColor(node.style?.fillColor, `node "${node.id}" fill`)
    checkColor(node.style?.strokeColor, `node "${node.id}" stroke`)
    checkColor(node.style?.fontColor, `node "${node.id}" text`)
  })

  spec.edges?.forEach((edge) => {
    checkColor(edge.style?.strokeColor, `edge "${edge.from}->${edge.to}" stroke`)
  })

  spec.modules?.forEach((module) => {
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
  const validTokens = new Set(Object.keys(theme.colors || {}).map((k) => `$${k}`))

  const checkColor = (value, context) => {
    if (!value) return
    if (value === 'none' || value === 'transparent') return // explicit transparency
    if (validTokens.has(value)) return // valid theme token
    if (HEX_COLOR_REGEX.test(value)) return // valid hex color
    const tokenSamples = [...validTokens].slice(0, 3).join(', ')
    warnings.push(
      `Invalid color "${value}" in ${context}. ` +
        `Use a hex code (#RGB or #RRGGBB) or a theme token (${tokenSamples}...)`
    )
  }

  // Validate node style overrides
  spec.nodes?.forEach((node) => {
    const ctx = `node "${node.id}"`
    checkColor(node.style?.fillColor, `${ctx}.style.fillColor`)
    checkColor(node.style?.strokeColor, `${ctx}.style.strokeColor`)
    checkColor(node.style?.fontColor, `${ctx}.style.fontColor`)
  })

  // Validate edge style overrides
  spec.edges?.forEach((edge) => {
    const ctx = `edge "${edge.from}→${edge.to}"`
    checkColor(edge.style?.strokeColor, `${ctx}.style.strokeColor`)
  })

  // Validate module style overrides
  spec.modules?.forEach((mod) => {
    const ctx = `module "${mod.id}"`
    checkColor(mod.color, `${ctx}.color`)
    checkColor(mod.style?.fillColor, `${ctx}.style.fillColor`)
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
    (n) => n.position && typeof n.position.x === 'number' && typeof n.position.y === 'number'
  )

  if (nodesWithPos.length < 2) return warnings // not enough data

  const xs = nodesWithPos.map((n) => n.position.x)
  const ys = nodesWithPos.map((n) => n.position.y)
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

const TRANSPARENT_STYLE_VALUES = new Set(['none', 'transparent'])

/**
 * Plain text nodes must stay transparent, and their declared bounds must be
 * large enough for the content. The style generator already forces
 * fillColor=none/strokeColor=none for type "text"; this pass surfaces ignored
 * overrides and likely clipping so specs stay honest.
 */
export function validateTextNodeStyles(spec) {
  const warnings = []
  for (const node of spec.nodes || []) {
    const semanticType = detectSemanticType(node.label, node.type, node.network)
    if (semanticType !== 'text') continue

    for (const field of ['fillColor', 'strokeColor']) {
      const value = node.style?.[field]
      if (value !== undefined && !TRANSPARENT_STYLE_VALUES.has(String(value).toLowerCase())) {
        warnings.push(
          `Text node "${node.id}" declares style.${field}="${value}", but plain text boxes always render transparent ` +
            '(fillColor=none;strokeColor=none;labelBackgroundColor=none). Use a shape node or formula type for a filled label.'
        )
      }
    }

    const bounds = node.bounds
    if (bounds && isFiniteNumber(bounds.width) && isFiniteNumber(bounds.height) && node.label) {
      const fontSize = node.style?.fontSize ?? FONT_LADDER.text
      const extent = measureLabelExtent(node.label, fontSize, 8)
      if (bounds.width + 2 < extent.width || bounds.height + 2 < extent.height) {
        warnings.push(
          `Text node "${node.id}" bounds ${bounds.width}x${bounds.height} are smaller than the estimated content size ` +
            `${extent.width}x${extent.height}; the label may clip or wrap badly. Enlarge bounds or shorten the text.`
        )
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
  // Prefer the axis whose face-to-face gap is positive: a negative gap means
  // the shapes overlap on that axis, so routing along it would immediately
  // clash with the shapes themselves (wide bars above narrow boxes, etc.).
  const horizontalGap = Math.abs(dx) - (sourcePos.width + targetPos.width) / 2
  const verticalGap = Math.abs(dy) - (sourcePos.height + targetPos.height) / 2
  let horizontal
  if (verticalGap >= 0 && horizontalGap < 0) {
    horizontal = false
  } else if (horizontalGap >= 0 && verticalGap < 0) {
    horizontal = true
  } else {
    horizontal = Math.abs(dx) >= Math.abs(dy)
  }

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

const CONNECTION_CORNER_MARGIN = 8
const CONNECTION_MIN_SEPARATION = 30

/**
 * Interval of absolute coordinates (X for vertical edges, Y for horizontal
 * edges) where both faces can host the same connection coordinate, keeping the
 * orthogonal edge a single straight segment. Null when the faces do not
 * overlap on the shared axis and a bend is genuinely required.
 */
function sharedAxisInterval(sourcePos, targetPos, orientation) {
  const vertical = orientation === 'vertical'
  const lo = vertical ? Math.max(sourcePos.x, targetPos.x) : Math.max(sourcePos.y, targetPos.y)
  const hi = vertical
    ? Math.min(sourcePos.x + sourcePos.width, targetPos.x + targetPos.width)
    : Math.min(sourcePos.y + sourcePos.height, targetPos.y + targetPos.height)
  const min = lo + CONNECTION_CORNER_MARGIN
  const max = hi - CONNECTION_CORNER_MARGIN
  return min <= max ? { lo: min, hi: max } : null
}

/**
 * Straight edges anchor on the center of the narrower face: a small box
 * connects from its own center straight into the larger box, which is how
 * hand-drawn architecture diagrams keep their vertical arrows straight.
 */
function preferredSharedCoordinate(sourcePos, targetPos, orientation, interval) {
  const vertical = orientation === 'vertical'
  const sourceSpan = vertical ? sourcePos.width : sourcePos.height
  const targetSpan = vertical ? targetPos.width : targetPos.height
  const sourceCenter = vertical ? sourcePos.x + sourcePos.width / 2 : sourcePos.y + sourcePos.height / 2
  const targetCenter = vertical ? targetPos.x + targetPos.width / 2 : targetPos.y + targetPos.height / 2
  const preferred = sourceSpan <= targetSpan ? sourceCenter : targetCenter
  return Math.min(interval.hi, Math.max(interval.lo, preferred))
}

function roundFraction(value) {
  return Math.round(value * 10000) / 10000
}

/**
 * Spread straight edges that landed within CONNECTION_MIN_SEPARATION of each
 * other on the same physical face. Moving an edge moves both endpoints
 * together, so collinearity is preserved; clamping keeps every edge inside its
 * own shared interval.
 */
function spreadSharedCoordinates(edges) {
  const faceGroups = new Map()
  for (const edge of edges) {
    if (!edge.__shared) continue
    const keys = [`${edge.from}:${edge.__routing.sourceFace}`, `${edge.to}:${edge.__routing.targetFace}`]
    for (const key of keys) {
      if (!faceGroups.has(key)) faceGroups.set(key, [])
      faceGroups.get(key).push(edge)
    }
  }
  const sortedKeys = [...faceGroups.keys()].sort()
  for (const key of sortedKeys) {
    const group = faceGroups
      .get(key)
      .slice()
      .sort((a, b) => a.__shared.coord - b.__shared.coord)
    let start = 0
    while (start < group.length) {
      let end = start
      while (
        end + 1 < group.length &&
        group[end + 1].__shared.coord - group[end].__shared.coord < CONNECTION_MIN_SEPARATION
      ) {
        end++
      }
      if (end > start) {
        const cluster = group.slice(start, end + 1)
        const mean = cluster.reduce((sum, item) => sum + item.__shared.coord, 0) / cluster.length
        cluster.forEach((item, index) => {
          const desired = mean + (index - (cluster.length - 1) / 2) * CONNECTION_MIN_SEPARATION
          item.__shared.coord = Math.min(item.__shared.interval.hi, Math.max(item.__shared.interval.lo, desired))
        })
      }
      start = end + 1
    }
  }
}

function buildRoutedEdges(spec, layout) {
  const { positions } = layout
  const declaredLayout = spec.meta?.layout || 'horizontal'
  const edges = (spec.edges || []).map((edge) => ({
    ...edge,
    style: { ...(edge.style || {}) },
    waypoints: edge.waypoints ? edge.waypoints.map((point) => ({ ...point })) : undefined
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
        edge.__bent = true
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
          edge.__bent = true
          continue
        }
      }
    }

    const hasManualPoints =
      edge.style.exitX !== undefined ||
      edge.style.exitY !== undefined ||
      edge.style.entryX !== undefined ||
      edge.style.entryY !== undefined
    const interval = hasManualPoints ? null : sharedAxisInterval(sourcePos, targetPos, faces.orientation)
    if (interval) {
      edge.__shared = {
        interval,
        coord: preferredSharedCoordinate(sourcePos, targetPos, faces.orientation, interval)
      }
      continue
    }
    edge.__bent = !hasManualPoints

    const sourceKey = `${edge.from}:${faces.sourceFace}`
    const targetKey = `${edge.to}:${faces.targetFace}`

    if (!sourceGroups.has(sourceKey)) sourceGroups.set(sourceKey, [])
    if (!targetGroups.has(targetKey)) targetGroups.set(targetKey, [])
    sourceGroups.get(sourceKey).push(edge)
    targetGroups.get(targetKey).push(edge)
  }

  spreadSharedCoordinates(edges)

  const usedFaceCoords = new Map()
  const faceCoordsFor = (nodeId, face) => {
    const key = `${nodeId}:${face}`
    if (!usedFaceCoords.has(key)) usedFaceCoords.set(key, [])
    return usedFaceCoords.get(key)
  }

  for (const edge of edges) {
    if (!edge.__shared) continue
    const sourcePos = positions.get(edge.from)
    const targetPos = positions.get(edge.to)
    const { coord } = edge.__shared
    const style = edge.style
    if (edge.__routing.orientation === 'vertical') {
      style.exitX = roundFraction((coord - sourcePos.x) / sourcePos.width)
      style.exitY = edge.__routing.sourceFace === 'bottom' ? 1 : 0
      style.entryX = roundFraction((coord - targetPos.x) / targetPos.width)
      style.entryY = edge.__routing.targetFace === 'top' ? 0 : 1
    } else {
      style.exitX = edge.__routing.sourceFace === 'right' ? 1 : 0
      style.exitY = roundFraction((coord - sourcePos.y) / sourcePos.height)
      style.entryX = edge.__routing.targetFace === 'left' ? 0 : 1
      style.entryY = roundFraction((coord - targetPos.y) / targetPos.height)
    }
    style.exitDx = 0
    style.exitDy = 0
    style.entryDx = 0
    style.entryDy = 0
    faceCoordsFor(edge.from, edge.__routing.sourceFace).push(coord)
    faceCoordsFor(edge.to, edge.__routing.targetFace).push(coord)
    delete edge.__shared
  }

  assignFallbackFaceSlots(sourceGroups, positions, faceCoordsFor, true)
  assignFallbackFaceSlots(targetGroups, positions, faceCoordsFor, false)

  return edges
}

function faceGeometry(pos, face) {
  const vertical = face === 'top' || face === 'bottom'
  return { vertical, base: vertical ? pos.x : pos.y, span: vertical ? pos.width : pos.height }
}

/**
 * Legacy slot distribution for edges without a collinear interval. Slots now
 * dodge coordinates already taken on the same physical face by straight edges
 * or manual connection points, so mixed faces stay CONNECTION_MIN_SEPARATION
 * apart instead of stacking at 0.5.
 */
function assignFallbackFaceSlots(groups, positions, faceCoordsFor, isSource) {
  for (const group of groups.values()) {
    const manualEdges = new Set()

    for (const edge of group) {
      const face = isSource ? edge.__routing.sourceFace : edge.__routing.targetFace
      const nodeId = isSource ? edge.from : edge.to
      const pos = positions.get(nodeId)
      if (!pos) continue
      const { vertical, base, span } = faceGeometry(pos, face)
      const style = edge.style
      const manual = isSource ? (vertical ? style.exitX : style.exitY) : (vertical ? style.entryX : style.entryY)
      if (manual !== undefined) {
        faceCoordsFor(nodeId, face).push(base + manual * span)
        manualEdges.add(edge)
      }
    }

    group.forEach((edge, index) => {
      const face = isSource ? edge.__routing.sourceFace : edge.__routing.targetFace
      const nodeId = isSource ? edge.from : edge.to
      const pos = positions.get(nodeId)
      const fallbackSlot = group.length === 1 ? 0.5 : getSlot(index)
      if (!pos || manualEdges.has(edge)) {
        if (isSource) applyFaceSlot(edge.style, face, fallbackSlot)
        else applyTargetFaceSlot(edge.style, face, fallbackSlot)
        return
      }
      const { base, span } = faceGeometry(pos, face)
      const used = faceCoordsFor(nodeId, face)
      // Prefer the legacy slot for this position in the group; only dodge to
      // another slot when a straight edge or manual point already occupies the
      // coordinate. Small faces cannot honor the separation at all, so the
      // exhausted case falls back to the legacy slot unchanged.
      let chosen
      for (const slot of [fallbackSlot, 0.5, ...FACE_SLOTS]) {
        const coord = base + slot * span
        if (used.every((taken) => Math.abs(taken - coord) >= CONNECTION_MIN_SEPARATION)) {
          chosen = slot
          break
        }
      }
      if (chosen === undefined) {
        // The face is too small to honor the separation; take the slot that
        // keeps the largest distance to everything already connected instead
        // of stacking exactly onto an occupied coordinate.
        let bestDistance = -1
        for (const slot of [fallbackSlot, 0.5, ...FACE_SLOTS]) {
          const coord = base + slot * span
          const minDistance = used.length ? Math.min(...used.map((taken) => Math.abs(taken - coord))) : Infinity
          if (minDistance > bestDistance) {
            bestDistance = minDistance
            chosen = slot
          }
        }
      }
      used.push(base + chosen * span)
      if (isSource) applyFaceSlot(edge.style, face, chosen)
      else applyTargetFaceSlot(edge.style, face, chosen)
    })
  }
}

export function validateConnectionPointPolicy(spec) {
  const warnings = []
  for (const edge of spec.edges || []) {
    const style = edge.style || {}
    const hasWaypoints = Array.isArray(edge.waypoints) && edge.waypoints.length > 0
    const cpFields = ['exitX', 'exitY', 'entryX', 'entryY']
    const dxdyFields = ['exitDx', 'exitDy', 'entryDx', 'entryDy']
    const cpCount = cpFields.filter((field) => style[field] !== undefined).length
    const dxdyCount = dxdyFields.filter((field) => style[field] !== undefined).length

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

/**
 * Warn when a node resolves to a shape name absent from the draw.io shape
 * catalog: such names render as empty boxes in draw.io Desktop.
 * @param {Object} spec
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateShapeReferences(spec) {
  const errors = []
  const warnings = []
  for (const node of spec.nodes || []) {
    const iconName = node.icon || deriveNodeIcon(node)
    if (resolveImageIconStyle(iconName)) continue
    const iconShape = resolveIconShape(iconName)
    if (!iconShape) continue
    if (resolveShapeNameKind(iconShape) === 'unknown') {
      const library = /^mxgraph\.([^.]+)\./.exec(iconShape)?.[1] || null
      const paramValue = /:(?:prIcon|resIcon|grIcon)=([^;]+)$/.exec(iconShape)?.[1]
      const stem = paramValue || (library ? iconShape.replace(/^mxgraph\.[^.]+\./, '') : iconName)
      const query = stem.split(/[._-]/).filter(Boolean).join(' ')
      const suggestions = searchShapeCatalog(query, { limit: 3, prefix: library })
        .map((result) => result.spec || result.name)
        .join(', ')
      const message =
        `Node "${node.id}" resolves to unknown shape "${iconShape}" (not in the draw.io shape catalog); ` +
          `it would render as an empty box in draw.io Desktop.${suggestions ? ` Did you mean: ${suggestions}?` : ''}`
      if (iconShape.startsWith('mxgraph.')) errors.push(message)
      else warnings.push(message)
    }
  }
  return { errors, warnings }
}

// Print-width targets for the paper-readability gate: `effective pt` =
// fontSize x widthPt / canvas-width-px once the figure is scaled to the target
// column. cn-thesis uses an A4 text block (~155mm = 440pt) with the CN
// xiao-wu 9pt floor; IEEE columns follow the IEEE graphics guidelines (8pt).
const PRINT_TARGETS = {
  'cn-thesis': { widthPt: 440, minPt: 9, label: 'CN thesis text width (155mm = 440pt)' },
  'ieee-single': { widthPt: 252, minPt: 8, label: 'IEEE single-column width (3.5in = 252pt)' },
  'ieee-double': { widthPt: 516, minPt: 8, label: 'IEEE double-column width (7.16in = 516pt)' }
}
const DEFAULT_PRINT_TARGET = 'ieee-single'
const ACADEMIC_CANVAS_REVIEW_WIDTH = 1500

function resolvePrintTarget(print) {
  const base = PRINT_TARGETS[print?.target] || PRINT_TARGETS[DEFAULT_PRINT_TARGET]
  const widthPt = isFiniteNumber(print?.widthPt) && print.widthPt > 0 ? print.widthPt : base.widthPt
  const minPt = isFiniteNumber(print?.minPt) && print.minPt > 0 ? print.minPt : base.minPt
  const label = widthPt === base.widthPt ? base.label : `custom print width (${widthPt}pt)`
  return { widthPt, minPt, label }
}

/**
 * Warn when an academic canvas is so wide that labels drop below 8pt after
 * the figure is scaled to IEEE single-column width (3.5in = 252pt).
 * @param {Object} spec
 * @returns {string[]} warnings
 */
function collectAcademicLayoutSizeWarning(spec) {
  let canvasWidth = null
  try {
    const explicit = parseCanvasSize(spec.meta?.canvas)
    if (explicit) canvasWidth = explicit.width
  } catch {
    return []
  }
  if (canvasWidth == null) {
    let maxX = 0
    for (const node of spec.nodes || []) {
      const bounds = normalizeNodeBounds(node)
      if (bounds) maxX = Math.max(maxX, bounds.x + bounds.width)
    }
    if (maxX > 0) canvasWidth = maxX + 80
  }
  const print = spec.meta?.print
  if (canvasWidth == null) return []
  if (!print && canvasWidth <= ACADEMIC_CANVAS_REVIEW_WIDTH) return []
  const target = resolvePrintTarget(print)

  let minFontSize = Infinity
  for (const node of spec.nodes || []) {
    const fontSize = node.style?.fontSize
    if (typeof fontSize === 'number') minFontSize = Math.min(minFontSize, fontSize)
  }
  if (!Number.isFinite(minFontSize)) minFontSize = FONT_LADDER.node

  const effectivePt = (minFontSize * target.widthPt) / canvasWidth
  if (effectivePt >= target.minPt) return []

  const requiredFontSize = Math.ceil((canvasWidth * target.minPt) / target.widthPt)
  return [
    `Academic figure canvas is ${canvasWidth}px wide. Scaled to ${target.label}, the smallest label font (${minFontSize}px) prints at ~${effectivePt.toFixed(1)}pt (fontSize x ${target.widthPt} / canvas width), below the ${target.minPt}pt floor. Raise label fontSize to >= ${requiredFontSize}, narrow the canvas, set meta.print to a wider target, or split the figure.`
  ]
}

const KNOWN_META_KEYS = new Set([
  'title',
  'description',
  'theme',
  'layout',
  'routing',
  'profile',
  'figureType',
  'source',
  'canvas',
  'font',
  'print',
  'legend',
  'replication',
  'template'
])

const KNOWN_NODE_STYLE_KEYS = new Set([
  'fillColor',
  'strokeColor',
  'strokeWidth',
  'fontColor',
  'fontSize',
  'fontFamily',
  'fontStyle',
  'fontWeight',
  'bold',
  'italic',
  'align',
  'verticalAlign',
  'spacingLeft',
  'spacingRight',
  'spacingTop',
  'spacingBottom'
])

const KNOWN_MODULE_KEYS = new Set(['id', 'label', 'color', 'style'])

/**
 * Warn about spec keys the renderer silently ignores (schema drift):
 * unknown meta keys, unknown node.style keys, unknown module keys.
 * @param {Object} spec
 * @returns {string[]} warnings
 */
export function validateSchemaDrift(spec) {
  const warnings = []

  const metaUnknown = Object.keys(spec.meta || {}).filter((key) => !KNOWN_META_KEYS.has(key))
  if (metaUnknown.length > 0) {
    warnings.push(
      `Unknown meta key(s) ${metaUnknown.map((key) => `"${key}"`).join(', ')} are ignored by the renderer. Supported keys: ${[...KNOWN_META_KEYS].join(', ')}.`
    )
  }

  for (const node of spec.nodes || []) {
    const unknown = Object.keys(node.style || {}).filter((key) => !KNOWN_NODE_STYLE_KEYS.has(key))
    if (unknown.length > 0) {
      warnings.push(
        `Node "${node.id}" style has unknown key(s) ${unknown.map((key) => `"${key}"`).join(', ')}; they are ignored. Use top-level node fields (e.g. type, icon) for shape selection.`
      )
    }
  }

  for (const module of spec.modules || []) {
    const unknown = Object.keys(module || {}).filter((key) => !KNOWN_MODULE_KEYS.has(key))
    if (unknown.length > 0) {
      warnings.push(
        `Module "${module.id}" has unknown key(s) ${unknown.map((key) => `"${key}"`).join(', ')}; they are ignored (module bounds are computed from member nodes).`
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
    warnings.push(`Academic-paper profile should set meta.figureType to one of ${ACADEMIC_FIGURE_TYPES.join(', ')}.`)
  }
  if (!spec.meta?.title) {
    warnings.push('Academic-paper profile requires meta.title for figure captioning.')
  }
  if (!spec.meta?.description) {
    warnings.push('Academic-paper profile should include meta.description for figure context.')
  }

  const usesIcons = (spec.nodes || []).some((node) => node.icon)
  const connectorTypes = new Set((spec.edges || []).map((edge) => edge.type || 'primary'))
  if ((usesIcons || connectorTypes.size > 1) && !spec.meta?.legend) {
    warnings.push('Academic-paper profile should include meta.legend when icons or multiple connector styles are used.')
  }

  const verboseLabels = []
  for (const node of spec.nodes || []) {
    // Compact legends/callouts are single text nodes by design (see the
    // playbook's node-efficient patterns); they are exempt from this rule.
    if (node.type === 'text') continue
    const visibleLength = estimateVisibleLabelLength(node.label)
    const lineCount = countManualLabelLines(node.label)
    if (visibleLength > 40 || lineCount > 3) {
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

  warnings.push(...collectAcademicLayoutSizeWarning(spec))

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
        warnings.push(
          `Edge "${edge.from}->${edge.to}" uses corner connection point ${xKey}/${yKey}. Use face midpoints or distributed face slots.`
        )
      }
    }

    if (!hasWaypoints && edge.__routing) {
      const orientation = edge.__routing.orientation
      const vertical = orientation === 'vertical'
      const exitFrac = vertical ? style.exitX : style.exitY
      const entryFrac = vertical ? style.entryX : style.entryY
      if (exitFrac !== undefined && entryFrac !== undefined) {
        const absExit = vertical
          ? sourcePos.x + exitFrac * sourcePos.width
          : sourcePos.y + exitFrac * sourcePos.height
        const absEntry = vertical
          ? targetPos.x + entryFrac * targetPos.width
          : targetPos.y + entryFrac * targetPos.height
        const delta = Math.abs(absExit - absEntry)
        if (delta > 0.5 && sharedAxisInterval(sourcePos, targetPos, orientation)) {
          warnings.push(
            `Edge "${edge.from}->${edge.to}" bends ${Math.round(delta)}px off a straight ${orientation} line. ` +
              'A collinear connection exists on this axis; use the same absolute exit/entry coordinate.'
          )
        }
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
        warnings.push(
          `Edge "${edge.from}->${edge.to}" has a short final segment (${Math.round(finalSegment)}px). Keep the last segment at least 30px.`
        )
      }
    }

    if (hasWaypoints) {
      for (let i = 1; i < edge.waypoints.length; i++) {
        const prev = edge.waypoints[i - 1]
        const curr = edge.waypoints[i]
        if (Math.abs(prev.x - curr.x) < 1 && Math.abs(prev.y - curr.y) < 1) {
          warnings.push(
            `Edge "${edge.from}->${edge.to}" contains degenerate waypoint ${i}. Consecutive waypoints must differ by at least 1px.`
          )
        }
      }
    }

    if (edge.__routing) {
      const faceAxis =
        edge.__routing.orientation === 'horizontal'
          ? `${edge.from}:${edge.__routing.sourceFace}:${style.exitY}`
          : `${edge.from}:${edge.__routing.sourceFace}:${style.exitX}`
      if (!corridorMap.has(faceAxis)) corridorMap.set(faceAxis, [])
      corridorMap.get(faceAxis).push(edge)
    }

    if (edge.label && !hasWaypoints) {
      const gap =
        edge.__routing?.orientation === 'horizontal'
          ? Math.abs(targetPos.x + targetPos.width / 2 - (sourcePos.x + sourcePos.width / 2))
          : Math.abs(targetPos.y + targetPos.height / 2 - (sourcePos.y + sourcePos.height / 2))
      if (gap < 60) {
        warnings.push(
          `Edge "${edge.from}->${edge.to}" is short for a labeled connector. Increase spacing or offset the label further from the line.`
        )
      }
    }
  }

  for (const [corridor, group] of corridorMap.entries()) {
    if (group.length < 2) continue
    const slots = group.map((edge) =>
      edge.__routing?.orientation === 'horizontal' ? edge.style.exitY : edge.style.exitX
    )
    const uniqueSlots = new Set(slots.map((slot) => Number(slot).toFixed(2)))
    if (uniqueSlots.size !== group.length) {
      warnings.push(
        `Edges sharing corridor "${corridor}" overlap on the same face position. Distribute them across 0.25/0.5/0.75 slots.`
      )
    }
  }

  return warnings
}

const LABEL_COLLISION_WARNING_CAP = 12

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function polylineIntersectsRect(points, rect) {
  for (let i = 1; i < points.length; i++) {
    if (segmentIntersectsRect(points[i - 1], points[i], rect)) return true
  }
  return false
}

/**
 * Approximate the rendered polyline of a routed edge: waypoints when present,
 * otherwise the exit/entry points with the standard orthogonal mid-bend.
 */
function edgePolyline(edge, sourcePos, targetPos) {
  const style = edge.style || {}
  if (edge.waypoints?.length) {
    const first = edge.waypoints[0]
    const last = edge.waypoints[edge.waypoints.length - 1]
    return [
      clipPointToRect(sourcePos, first),
      ...edge.waypoints.map((point) => ({ x: point.x, y: point.y })),
      clipPointToRect(targetPos, last)
    ]
  }
  if (style.exitX === undefined || style.entryX === undefined) return null
  const start = { x: sourcePos.x + style.exitX * sourcePos.width, y: sourcePos.y + style.exitY * sourcePos.height }
  const end = { x: targetPos.x + style.entryX * targetPos.width, y: targetPos.y + style.entryY * targetPos.height }
  const vertical = edge.__routing?.orientation === 'vertical'
  const straight = vertical ? Math.abs(start.x - end.x) < 0.5 : Math.abs(start.y - end.y) < 0.5
  if (straight) return [start, end]
  if (vertical) {
    const midY = (start.y + end.y) / 2
    return [start, { x: start.x, y: midY }, { x: end.x, y: midY }, end]
  }
  const midX = (start.x + end.x) / 2
  return [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end]
}

function pointAlongPolyline(points, fraction) {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
  }
  let remaining = total * fraction
  for (let i = 1; i < points.length; i++) {
    const segment = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
    if (remaining <= segment) {
      const t = segment === 0 ? 0 : remaining / segment
      return {
        x: points[i - 1].x + (points[i].x - points[i - 1].x) * t,
        y: points[i - 1].y + (points[i].y - points[i - 1].y) * t
      }
    }
    remaining -= segment
  }
  return points[points.length - 1]
}

/**
 * Heuristic lint for label clashes: edge labels on their own line, labels
 * crossing other connectors, standalone text boxes crossed by connectors, and
 * label/label overlap. Extents are estimated, so treat results as warnings.
 */
export function validateLabelCollisions(spec, layout) {
  const warnings = []
  const routedEdges = buildRoutedEdges(spec, layout)
  const lines = []
  const labelRects = []

  for (const edge of routedEdges) {
    const sourcePos = layout.positions.get(edge.from)
    const targetPos = layout.positions.get(edge.to)
    if (!sourcePos || !targetPos) continue
    const points = edgePolyline(edge, sourcePos, targetPos)
    if (!points) continue
    const key = `${edge.from}->${edge.to}`
    lines.push({ key, points })

    const label = formatNetworkEdgeLabel(edge)
    if (!label) continue
    const fraction = edge.labelPosition === 'start' ? 0.2 : edge.labelPosition === 'end' ? 0.8 : 0.5
    const anchor = pointAlongPolyline(points, fraction)
    const offset = resolveEdgeLabelOffset(edge)
    const extent = measureLabelExtent(label, resolveEdgeLabelFontSize(edge), 2)
    labelRects.push({
      key,
      isTextNode: false,
      rect: {
        x: anchor.x + offset.x - extent.width / 2,
        y: anchor.y + offset.y - extent.height / 2,
        width: extent.width,
        height: extent.height
      }
    })
  }

  for (const node of spec.nodes || []) {
    if (detectSemanticType(node.label, node.type, node.network) !== 'text') continue
    const pos = layout.positions.get(node.id)
    if (!pos) continue
    labelRects.push({ key: `text "${node.id}"`, isTextNode: true, rect: pos })
  }

  for (const label of labelRects) {
    for (const line of lines) {
      if (!label.isTextNode && label.key === line.key) {
        if (polylineIntersectsRect(line.points, label.rect)) {
          warnings.push(
            `Label of edge "${label.key}" sits on its own connector; offset it 12-20px away from the line via labelOffset.`
          )
        }
        continue
      }
      if (polylineIntersectsRect(line.points, label.rect)) {
        const subject = label.isTextNode ? `Text node ${label.key}` : `Label of edge "${label.key}"`
        warnings.push(`${subject} overlaps connector "${line.key}"; move the label or reroute the edge.`)
      }
    }
  }

  for (let i = 0; i < labelRects.length; i++) {
    for (let j = i + 1; j < labelRects.length; j++) {
      if (rectsOverlap(labelRects[i].rect, labelRects[j].rect)) {
        warnings.push(
          `Labels ${labelRects[i].key} and ${labelRects[j].key} overlap; separate them or shorten the text.`
        )
      }
    }
  }

  if (warnings.length > LABEL_COLLISION_WARNING_CAP) {
    const extra = warnings.length - LABEL_COLLISION_WARNING_CAP
    return warnings
      .slice(0, LABEL_COLLISION_WARNING_CAP)
      .concat([`(+${extra} more label-collision warnings truncated)`])
  }
  return warnings
}

// ============================================================================
// Layout Quality Metrics
// ============================================================================

function rectCenter(rect) {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
}

function clipPointToRect(rect, toward) {
  const center = rectCenter(rect)
  const dx = toward.x - center.x
  const dy = toward.y - center.y
  if (dx === 0 && dy === 0) return center
  const halfW = rect.width / 2
  const halfH = rect.height / 2
  const scaleX = dx !== 0 ? halfW / Math.abs(dx) : Infinity
  const scaleY = dy !== 0 ? halfH / Math.abs(dy) : Infinity
  const t = Math.min(scaleX, scaleY, 1)
  return { x: center.x + dx * t, y: center.y + dy * t }
}

function orientationOf(a, b, c) {
  const value = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
  if (Math.abs(value) < 1e-9) return 0
  return value > 0 ? 1 : -1
}

function segmentsProperlyIntersect(p1, p2, p3, p4) {
  const o1 = orientationOf(p1, p2, p3)
  const o2 = orientationOf(p1, p2, p4)
  const o3 = orientationOf(p3, p4, p1)
  const o4 = orientationOf(p3, p4, p2)
  return o1 !== o2 && o3 !== o4 && o1 !== 0 && o2 !== 0 && o3 !== 0 && o4 !== 0
}

function segmentIntersectsRect(p1, p2, rect) {
  const inside = (p) => p.x > rect.x && p.x < rect.x + rect.width && p.y > rect.y && p.y < rect.y + rect.height
  if (inside(p1) || inside(p2)) return true
  const corners = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height }
  ]
  for (let i = 0; i < 4; i++) {
    if (segmentsProperlyIntersect(p1, p2, corners[i], corners[(i + 1) % 4])) return true
  }
  return false
}

/**
 * Readability metrics over the routed layout: how many edges cut through
 * unrelated nodes, how many edge pairs cross, and the total polyline length.
 * Edge endpoints are approximated by center-to-boundary clipping; waypoints
 * are honored, so orthogonal (elk) routes are measured on their real path.
 */
export function computeLayoutQualityMetrics(spec, options = {}) {
  const theme = options.theme || loadTheme(spec.meta?.theme || 'tech-blue')
  const layout = options.layout || calculateLayout(planFontSizes(spec, theme).planned, theme)
  const routedEdges = buildRoutedEdges(spec, layout)
  const { positions } = layout

  let edgeNodeCrossings = 0
  let edgeEdgeCrossings = 0
  let totalEdgeLength = 0

  const polylines = []
  for (const edge of routedEdges) {
    const sourceRect = positions.get(edge.from)
    const targetRect = positions.get(edge.to)
    if (!sourceRect || !targetRect) continue
    const waypoints = edge.waypoints || []
    const firstToward = waypoints[0] || rectCenter(targetRect)
    const lastToward = waypoints[waypoints.length - 1] || rectCenter(sourceRect)
    const points = [clipPointToRect(sourceRect, firstToward), ...waypoints, clipPointToRect(targetRect, lastToward)]
    polylines.push({ edge, points })
    for (let i = 1; i < points.length; i++) {
      totalEdgeLength += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
    }
  }

  for (const { edge, points } of polylines) {
    for (const node of spec.nodes || []) {
      if (node.id === edge.from || node.id === edge.to) continue
      const rect = positions.get(node.id)
      if (!rect) continue
      let crosses = false
      for (let i = 1; i < points.length && !crosses; i++) {
        crosses = segmentIntersectsRect(points[i - 1], points[i], rect)
      }
      if (crosses) edgeNodeCrossings++
    }
  }

  for (let i = 0; i < polylines.length; i++) {
    for (let j = i + 1; j < polylines.length; j++) {
      const a = polylines[i]
      const b = polylines[j]
      const shared =
        a.edge.from === b.edge.from || a.edge.from === b.edge.to || a.edge.to === b.edge.from || a.edge.to === b.edge.to
      if (shared) continue
      let crosses = false
      for (let si = 1; si < a.points.length && !crosses; si++) {
        for (let sj = 1; sj < b.points.length && !crosses; sj++) {
          crosses = segmentsProperlyIntersect(a.points[si - 1], a.points[si], b.points[sj - 1], b.points[sj])
        }
      }
      if (crosses) edgeEdgeCrossings++
    }
  }

  return { edgeNodeCrossings, edgeEdgeCrossings, totalEdgeLength: Math.round(totalEdgeLength) }
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
/**
 * Materialize the font-size ladder into a cloned spec so layout, style
 * assembly, and validators all see one consistent value per text surface.
 * Only fills sizes the author left blank; explicit style.fontSize wins.
 */
function planFontSizes(spec, theme) {
  const planned = structuredClone(spec)
  const autoNodes = new Set()
  for (const node of planned.nodes || []) {
    if (isFiniteNumber(node.style?.fontSize)) continue
    const semanticType = detectSemanticType(node.label, node.type, node.network)
    const nodeTheme = theme.node?.[semanticType] || theme.node?.default || {}
    const fontSize =
      semanticType === 'text'
        ? (theme.node?.text?.fontSize ?? FONT_LADDER.text)
        : (nodeTheme.fontSize ?? theme.node?.default?.fontSize ?? FONT_LADDER.node)
    node.style = { ...(node.style || {}), fontSize }
    autoNodes.add(node.id)
  }
  for (const edge of planned.edges || []) {
    if (isFiniteNumber(edge.style?.fontSize)) continue
    if (!formatNetworkEdgeLabel(edge)) continue
    edge.style = { ...(edge.style || {}), fontSize: FONT_LADDER.edgeLabel }
  }
  return { planned, autoNodes }
}

// MathJax renders delimited math much narrower than its LaTeX source text,
// so every per-glyph width estimate must skip math-bearing labels.
function hasMathMarkers(label) {
  return /\$\$|\\\(|\\\)/.test(String(label || ''))
}

/** Largest font size whose estimated label extent stays inside bounds. */
function maxFontSizeForBounds(label, bounds) {
  const lines = String(label).split(/\n|<br\s*\/?>/i)
  let maxUnits = 0
  for (const line of lines) {
    let units = 0
    for (const ch of line) {
      units += /[\u3000-\u9fff\uff00-\uffef]/.test(ch) ? 1.05 : 0.6
    }
    maxUnits = Math.max(maxUnits, units)
  }
  const widthFit = maxUnits > 0 ? (bounds.width - 8) / maxUnits : Infinity
  const heightFit = (bounds.height - 4) / (lines.length * 1.4)
  return Math.min(widthFit, heightFit)
}

/**
 * Uniformly shrink auto-assigned label fonts so explicit-bounds boxes
 * (replicate flow) contain their labels: per class (node/text), take the
 * largest size every box can hold, clamped to [FONT_SIZE_FLOOR, assigned].
 * Author-set fontSize values are never touched; leftover overflows are
 * reported by validateLabelFit.
 */
function shrinkFontsToBounds(spec, autoNodes) {
  const limits = { node: Infinity, text: Infinity }
  const members = []
  for (const node of spec.nodes || []) {
    if (!autoNodes.has(node.id) || !node.label) continue
    if (node.icon || deriveNodeIcon(node)) continue
    const semanticType = detectSemanticType(node.label, node.type, node.network)
    if (CONTENT_SIZE_EXEMPT_TYPES.has(semanticType)) continue
    const cls = semanticType === 'text' ? 'text' : 'node'
    members.push({ node, cls })
    if (hasMathMarkers(node.label)) continue
    const bounds = normalizeNodeBounds(node)
    if (!bounds) continue
    limits[cls] = Math.min(limits[cls], maxFontSizeForBounds(node.label, bounds))
  }
  for (const { node, cls } of members) {
    const limit = limits[cls]
    if (!Number.isFinite(limit) || limit >= node.style.fontSize) continue
    node.style.fontSize = Math.max(FONT_SIZE_FLOOR, Math.floor(limit))
  }
}

/**
 * Report labels that cannot fit their explicit bounds even after the class
 * shrink bottomed out at FONT_SIZE_FLOOR, or whose author-set fontSize is too
 * large for the declared box.
 */
export function validateLabelFit(spec) {
  const warnings = []
  for (const node of spec.nodes || []) {
    if (!node.label) continue
    if (node.icon || deriveNodeIcon(node)) continue
    const semanticType = detectSemanticType(node.label, node.type, node.network)
    if (semanticType === 'text' || CONTENT_SIZE_EXEMPT_TYPES.has(semanticType)) continue
    if (hasMathMarkers(node.label)) continue
    const bounds = normalizeNodeBounds(node)
    if (!bounds) continue
    const fontSize = node.style?.fontSize ?? FONT_LADDER.node
    const extent = measureLabelExtent(node.label, fontSize, 0)
    const neededWidth = extent.width + 8
    const neededHeight = extent.height + 4
    if (neededWidth > bounds.width || neededHeight > bounds.height) {
      warnings.push(
        `Node "${node.id}" label needs ~${neededWidth}x${neededHeight}px at fontSize ${fontSize} but bounds are ` +
          `${bounds.width}x${bounds.height}. Widen the box, shorten the label, or lower style.fontSize.`
      )
    }
  }
  return warnings
}

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

  // Direct sync conversion cannot run the async elk pre-pass; surface it.
  if (
    spec.meta?.layout === 'hierarchical' &&
    (spec.nodes || []).some((node) => node.bounds == null && node.position == null)
  ) {
    warnings.push({
      level: 'info',
      message:
        'Layout "hierarchical" placed auto nodes with the legacy grid. Convert via the CLI (or run applyAutoLayout first) for edge-aware layered layout.'
    })
  }

  // Security: always throw on fatal-level warnings regardless of strict mode
  const fatals = warnings.filter((w) => w.level === 'fatal')
  if (fatals.length > 0) {
    throw new Error('Safety limit exceeded: ' + fatals.map((e) => e.message).join('; '))
  }

  // Strict mode: throw on error-level warnings
  if (options.strict) {
    const errors = warnings.filter((w) => w.level === 'error')
    if (errors.length > 0) {
      throw new Error('Complexity check failed: ' + errors.map((e) => e.message).join('; '))
    }
  }

  // Load theme
  const themeName = spec.meta?.theme || 'tech-blue'
  const theme = options.theme || loadTheme(themeName)

  // Materialize font sizes on an internal clone (author YAML stays untouched)
  // and shrink classes whose explicit-bounds boxes cannot hold the ladder, so
  // layout sizes boxes with the final per-class font.
  const { planned, autoNodes } = planFontSizes(spec, theme)
  spec = planned
  shrinkFontsToBounds(spec, autoNodes)
  const layout = calculateLayout(spec, theme)

  // Run validation passes
  const colorWarnings = validateColorScheme(spec, theme)
  const layoutWarnings = validateLayoutConsistency(spec)
  const connectionPointWarnings = validateConnectionPointPolicy(spec)
  const edgeWarnings = validateEdgeQuality(spec, layout)
  const textNodeWarnings = validateTextNodeStyles(spec)
  const labelFitWarnings = validateLabelFit(spec)
  const labelCollisionWarnings = validateLabelCollisions(spec, layout)
  const academicWarnings = validateAcademicProfile(spec)
  const shapeValidation = validateShapeReferences(spec)
  const schemaDriftWarnings = validateSchemaDrift(spec)
  const allValidationWarnings = [
    ...colorWarnings,
    ...layoutWarnings,
    ...connectionPointWarnings,
    ...edgeWarnings,
    ...textNodeWarnings,
    ...labelFitWarnings,
    ...labelCollisionWarnings,
    ...academicWarnings,
    ...shapeValidation.warnings,
    ...schemaDriftWarnings
  ]

  if (shapeValidation.errors.length > 0 && !options.allowUnknownShapes) {
    const error = new Error(
      `Spec validation failed: ${shapeValidation.errors.length} unknown stencil reference(s):\n` +
        shapeValidation.errors.map((message) => `  • ${message}`).join('\n') +
        '\nRun `node scripts/cli.js search <keyword>` to find real stencil names, or pass --allow-unknown-shapes to downgrade.'
    )
    error.validationErrors = shapeValidation.errors
    throw error
  }

  if (shapeValidation.errors.length > 0) allValidationWarnings.push(...shapeValidation.errors)

  if (allValidationWarnings.length > 0) {
    if (!options.silent) {
      console.warn('\n⚠️  drawio spec validation warnings:')
      allValidationWarnings.forEach((w) => console.warn(`  • ${w}`))
    }
    if (options.strict) {
      throw new Error(
        `Spec validation failed with ${allValidationWarnings.length} warning(s):\n` +
          allValidationWarnings.map((w) => `  • ${w}`).join('\n')
      )
    }
  }

  // Merge all warnings for callers that requested them
  warnings.push(...allValidationWarnings.map((msg) => ({ level: 'warning', message: msg })))

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
  const VALID_LAYOUTS = ['horizontal', 'vertical', 'hierarchical', 'star', 'mesh', 'tiered']
  const VALID_ROUTINGS = ['orthogonal', 'rounded']
  const VALID_PROFILES = ['default', 'academic-paper', 'engineering-review']
  const VALID_FIGURE_TYPES = ['architecture', 'roadmap', 'workflow']
  const VALID_SOURCES = ['generated', 'replicated', 'edited']
  const VALID_REPLICATION_MODES = ['preserve-original', 'theme-first']
  const VALID_REPLICATION_TARGETS = ['canvas', 'nodes', 'edges', 'modules', 'mixed']
  const VALID_CONFIDENCE_LEVELS = ['low', 'medium', 'high']
  const VALID_LABEL_POSITIONS = ['start', 'center', 'end']
  const VALID_ALIGN = ['left', 'center', 'right']
  const VALID_VERTICAL_ALIGN = ['top', 'middle', 'bottom']
  const SAFE_STYLE_TEXT = /^[^;<>"\r\n]{1,120}$/

  const validateBounds = (bounds, context) => {
    if (typeof bounds !== 'object' || bounds == null || Array.isArray(bounds)) {
      throw new Error(`${context} bounds must be an object when provided`)
    }
    for (const field of ['x', 'y', 'width', 'height']) {
      if (!isFiniteNumber(bounds[field])) {
        throw new Error(`${context} bounds.${field} must be a finite number`)
      }
    }
    if (bounds.width <= 0 || bounds.height <= 0) {
      throw new Error(`${context} bounds width and height must be greater than 0`)
    }
  }

  const validateTextStyle = (style, context) => {
    if (style == null) return
    if (typeof style !== 'object' || Array.isArray(style)) {
      throw new Error(`${context} style must be an object when provided`)
    }
    if (style.fontFamily != null && (typeof style.fontFamily !== 'string' || !SAFE_STYLE_TEXT.test(style.fontFamily))) {
      throw new Error(`${context} style.fontFamily must be a safe font-family string`)
    }
    if (style.align != null && !VALID_ALIGN.includes(style.align)) {
      throw new Error(`${context} style.align must be one of ${VALID_ALIGN.join(', ')}`)
    }
    if (style.verticalAlign != null && !VALID_VERTICAL_ALIGN.includes(style.verticalAlign)) {
      throw new Error(`${context} style.verticalAlign must be one of ${VALID_VERTICAL_ALIGN.join(', ')}`)
    }
    if (style.fontStyle != null && (!Number.isInteger(style.fontStyle) || style.fontStyle < 0 || style.fontStyle > 7)) {
      throw new Error(`${context} style.fontStyle must be an integer between 0 and 7`)
    }
    if (style.italic != null && typeof style.italic !== 'boolean') {
      throw new Error(`${context} style.italic must be a boolean when provided`)
    }
    if (style.bold != null && typeof style.bold !== 'boolean') {
      throw new Error(`${context} style.bold must be a boolean when provided`)
    }
    for (const field of ['spacingLeft', 'spacingRight', 'spacingTop', 'spacingBottom']) {
      if (style[field] != null && !isFiniteNumber(style[field])) {
        throw new Error(`${context} style.${field} must be a finite number`)
      }
    }
  }

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
  if (spec.meta?.canvas != null) {
    parseCanvasSize(spec.meta.canvas)
  }
  if (spec.meta?.font != null) {
    if (typeof spec.meta.font !== 'object' || spec.meta.font == null || Array.isArray(spec.meta.font)) {
      throw new Error('meta.font must be an object when provided')
    }
    for (const field of ['primary', 'cjk', 'formula']) {
      if (typeof spec.meta.font[field] !== 'string' || !SAFE_STYLE_TEXT.test(spec.meta.font[field])) {
        throw new Error(`meta.font.${field} must be a safe font-family string`)
      }
    }
  }
  if (spec.meta?.print != null) {
    const print = spec.meta.print
    if (typeof print !== 'object' || Array.isArray(print)) {
      throw new Error('meta.print must be an object when provided')
    }
    if (print.target != null && !PRINT_TARGETS[print.target]) {
      throw new Error(
        `Invalid meta.print.target "${print.target}": must be one of ${Object.keys(PRINT_TARGETS).join(', ')}`
      )
    }
    for (const field of ['widthPt', 'minPt']) {
      if (print[field] != null && (!isFiniteNumber(print[field]) || print[field] <= 0)) {
        throw new Error(`meta.print.${field} must be a positive number when provided`)
      }
    }
    if (print.target == null && print.widthPt == null) {
      throw new Error('meta.print requires target or widthPt')
    }
  }
  if (spec.meta?.replication != null) {
    if (typeof spec.meta.replication !== 'object' || Array.isArray(spec.meta.replication)) {
      throw new Error('meta.replication must be an object when provided')
    }
    if (spec.meta.replication.colorMode != null && !VALID_REPLICATION_MODES.includes(spec.meta.replication.colorMode)) {
      throw new Error(
        `Invalid meta.replication.colorMode "${spec.meta.replication.colorMode}": ` +
          `must be one of ${VALID_REPLICATION_MODES.join(', ')}`
      )
    }
    if (spec.meta.replication.background != null && typeof spec.meta.replication.background !== 'string') {
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
        if (entry.appliesTo != null && !VALID_REPLICATION_TARGETS.includes(entry.appliesTo)) {
          throw new Error(
            `Invalid meta.replication.palette[${index}].appliesTo "${entry.appliesTo}": ` +
              `must be one of ${VALID_REPLICATION_TARGETS.join(', ')}`
          )
        }
        if (entry.confidence != null && !VALID_CONFIDENCE_LEVELS.includes(entry.confidence)) {
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
      throw new Error(
        `Node "${node.id}" has unknown type "${node.type}": must be one of ${Object.keys(SHAPE_STYLES).join(', ')}`
      )
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
        throw new Error(
          `Node "${node.id}" has invalid network.device "${node.network.device}": must match /^[a-zA-Z][a-zA-Z0-9._-]*$/`
        )
      }
    }
    if (node.position != null) {
      if (typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
        throw new Error(`Node "${node.id}" position must have numeric x and y`)
      }
    }
    if (node.bounds != null) {
      validateBounds(node.bounds, `Node "${node.id}"`)
    }
    validateTextStyle(node.style, `Node "${node.id}"`)
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
    if (edge.labelPosition != null && !VALID_LABEL_POSITIONS.includes(edge.labelPosition)) {
      throw new Error(
        `Invalid edge.labelPosition "${edge.labelPosition}": must be one of ${VALID_LABEL_POSITIONS.join(', ')}`
      )
    }
    if (edge.labelOffset != null) {
      if (typeof edge.labelOffset !== 'object' || Array.isArray(edge.labelOffset)) {
        throw new Error(`Edge "${edge.from}->${edge.to}" labelOffset must be an object when provided`)
      }
      if (!isFiniteNumber(edge.labelOffset.x) || !isFiniteNumber(edge.labelOffset.y)) {
        throw new Error(`Edge "${edge.from}->${edge.to}" labelOffset must have numeric x and y`)
      }
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

function getXmlAttribute(tagText, name) {
  const match = new RegExp(`\\b${name}="([^"]*)"`).exec(tagText)
  return match ? match[1] : null
}

function parseXmlNumber(value) {
  if (value == null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function isImageCell(cellAttrs) {
  const style = getXmlAttribute(cellAttrs, 'style') || ''
  return /\bshape=image\b/.test(style) || /\bimage=/.test(style) || style.includes('data:image')
}

function collectFullPageImageErrors(xml) {
  const errors = []
  const graphMatch = /<mxGraphModel\s([^>]*)>/.exec(xml)
  if (!graphMatch) return errors

  const pageWidth = parseXmlNumber(getXmlAttribute(graphMatch[1], 'pageWidth'))
  const pageHeight = parseXmlNumber(getXmlAttribute(graphMatch[1], 'pageHeight'))
  if (!pageWidth || !pageHeight || pageWidth <= 0 || pageHeight <= 0) return errors

  const cellPattern = /<mxCell\s([^>]*?)(\/?)>/g
  let match
  while ((match = cellPattern.exec(xml)) !== null) {
    const cellAttrs = match[1]
    const isSelfClosing = match[2] === '/'
    if (isSelfClosing) continue
    if (!/\bvertex="1"/.test(cellAttrs) || !isImageCell(cellAttrs)) continue

    const closeIndex = xml.indexOf('</mxCell>', cellPattern.lastIndex)
    if (closeIndex === -1) continue
    const cellBody = xml.slice(cellPattern.lastIndex, closeIndex)
    const geometryMatch = /<mxGeometry\s([^>]*)\/?>/.exec(cellBody)
    if (!geometryMatch) continue

    const x = parseXmlNumber(getXmlAttribute(geometryMatch[1], 'x')) ?? 0
    const y = parseXmlNumber(getXmlAttribute(geometryMatch[1], 'y')) ?? 0
    const width = parseXmlNumber(getXmlAttribute(geometryMatch[1], 'width'))
    const height = parseXmlNumber(getXmlAttribute(geometryMatch[1], 'height'))
    if (!width || !height || width <= 0 || height <= 0) continue

    const coversWidth = width >= pageWidth * 0.9
    const coversHeight = height >= pageHeight * 0.9
    const coversArea = width * height >= pageWidth * pageHeight * 0.8
    const nearOrigin = Math.abs(x) <= pageWidth * 0.05 && Math.abs(y) <= pageHeight * 0.05
    if (coversWidth && coversHeight && coversArea && nearOrigin) {
      const id = getXmlAttribute(cellAttrs, 'id') || '(unknown)'
      errors.push(
        `Cell "${id}" appears to be a full-page embedded image; rebuild the reference with native draw.io shapes instead.`
      )
    }
  }

  return errors
}

/**
 * Validate draw.io XML structure
 * @param {string} xml - draw.io XML string
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateXml(xml) {
  const errors = []
  const warnings = []

  if (typeof xml !== 'string' || xml.trim() === '') {
    return { valid: false, errors: ['XML must be a non-empty string'], warnings: [] }
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

    if (!srcMatch || !tgtMatch) {
      const missing = !srcMatch && !tgtMatch ? 'source and target' : !srcMatch ? 'source' : 'target'
      warnings.push(
        `Edge "${edgeId}" is not bound to nodes (missing ${missing}). ` +
          'Connect modules with native bound edges (source/target node ids) instead of floating connectors.'
      )
    }
    if (srcMatch && !vertexIds.has(srcMatch[1])) {
      errors.push(`Edge "${edgeId}" references nonexistent source ID: "${srcMatch[1]}"`)
    }
    if (tgtMatch && !vertexIds.has(tgtMatch[1])) {
      errors.push(`Edge "${edgeId}" references nonexistent target ID: "${tgtMatch[1]}"`)
    }
  }

  // Arrow-look-alike vertices and opaque plain text boxes
  const cellTagPattern = /<mxCell\s[^>]*>/g
  while ((match = cellTagPattern.exec(xml)) !== null) {
    const tag = match[0]
    if (!/\bvertex="1"/.test(tag)) continue
    const styleMatch = /\bstyle="([^"]*)"/.exec(tag)
    if (!styleMatch) continue
    const style = styleMatch[1]
    const idMatch = /\bid="([^"]+)"/.exec(tag)
    const cellId = idMatch ? idMatch[1] : '(unknown)'

    const arrowShape = /(?:^|;)shape=(singleArrow|doubleArrow|triangle|mxgraph\.arrows2\.[^;"]*)/.exec(style)
    if (arrowShape) {
      warnings.push(
        `Cell "${cellId}" uses arrow shape "${arrowShape[1]}" as a connector look-alike. ` +
          'Connect modules with a native bound edge (endArrow=open) instead of standalone arrow shapes.'
      )
    }

    if (/^text;/.test(style) && /fillColor=(#fff(fff)?|white)\b/i.test(style)) {
      warnings.push(
        `Cell "${cellId}" is a plain text box with a white background. ` +
          'Plain text boxes must stay transparent: fillColor=none;strokeColor=none;labelBackgroundColor=none.'
      )
    }
  }

  errors.push(...collectFullPageImageErrors(xml))

  return { valid: errors.length === 0, errors, warnings }
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
  } else if (nodeCount > 60) {
    warnings.push({
      level: 'error',
      message: `Too many nodes (${nodeCount}). Consider splitting into sub-diagrams. For academic figures, aim for 40 nodes or fewer.`
    })
  } else if (nodeCount > 40) {
    warnings.push({
      level: 'warning',
      message: `Many nodes (${nodeCount}). Consider splitting for clarity or using compact patterns (e.g., single-node legends).`
    })
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
  const longLabelIds = []
  for (const node of spec.nodes || []) {
    if (node.label && node.label.length > 200) {
      warnings.push({
        level: 'fatal',
        message: `Node "${node.id}" label exceeds 200 characters (${node.label.length} chars)`
      })
    } else if (node.label && node.label.length > 14) {
      longLabelIds.push(node.id)
    }
  }
  if (longLabelIds.length > 0) {
    const sample = longLabelIds
      .slice(0, 3)
      .map((id) => `"${id}"`)
      .join(', ')
    const suffix = longLabelIds.length > 3 ? ` +${longLabelIds.length - 3} more` : ''
    warnings.push({
      level: 'info',
      message: `${longLabelIds.length} node label(s) exceed 14 characters (${sample}${suffix}). Consider abbreviation.`
    })
  }

  return warnings
}

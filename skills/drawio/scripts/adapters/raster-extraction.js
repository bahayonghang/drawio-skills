import { createRequire } from 'node:module'

import { adapterError, isRecord, parseJsonDocument } from './config-common.js'
import { ERROR_CODES } from './identity.js'

const require = createRequire(import.meta.url)
const specSchema = require('../../assets/schemas/spec.schema.json')

const ADAPTER = 'raster-extraction'
const MAX_NODES = 100
const MAX_EDGES = 200
const MAX_CANVAS_DIMENSION = 100000
const MAX_FONT_SIZE = 512
const SAFE_ID = /^[A-Za-z][A-Za-z0-9_-]*$/
const SAFE_COLOR = /^(?:#[0-9A-Fa-f]{3}|#[0-9A-Fa-f]{6}|none)$/
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/
const HTML_TAG = /<\/?[A-Za-z][^>]*>/
const CANONICAL_TYPES = new Set(specSchema.properties.nodes.items.properties.type.enum)
const TOP_LEVEL_KEYS = new Set(['schemaVersion', 'canvas', 'nodes', 'edges'])
const CANVAS_KEYS = new Set(['width', 'height', 'background'])
const NODE_KEYS = new Set([
  'id',
  'label',
  'type',
  'shape',
  'x',
  'y',
  'w',
  'h',
  'fill',
  'stroke',
  'fontSize',
  'fontColor'
])
const EDGE_KEYS = new Set([
  'id',
  'source',
  'target',
  'label',
  'dashed',
  'arrow',
  'stroke',
  'waypoints',
  'labelOffset'
])
const POINT_KEYS = new Set(['x', 'y'])
const GEOMETRY_KEYS = ['x', 'y', 'w', 'h']
const SHAPE_TYPES = new Map([
  ['rect', 'service'],
  ['rectangle', 'service'],
  ['rounded', 'service'],
  ['hexagon', 'service'],
  ['ellipse', 'terminal'],
  ['oval', 'terminal'],
  ['diamond', 'decision'],
  ['rhombus', 'decision'],
  ['cylinder', 'database'],
  ['parallelogram', 'queue'],
  ['cloud', 'cloud'],
  ['document', 'document'],
  ['text', 'text'],
  ['formula', 'formula']
])

function fail(message, path) {
  adapterError(ERROR_CODES.ADAPTER_PARSE, message, { adapter: ADAPTER, path })
}

function assertRecord(value, path) {
  if (!isRecord(value)) fail('must be an object', path)
  return value
}

function assertAllowedKeys(value, allowed, path) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) fail(`contains unknown field "${key}"`, `${path}.${key}`)
  }
}

function requireSafeId(value, path) {
  if (typeof value !== 'string' || !SAFE_ID.test(value)) fail('must be a safe canonical ID', path)
  return value
}

function requireLabel(value, path) {
  if (typeof value !== 'string' || value.trim() === '' || value.length > 200) {
    fail('must be a non-empty string of at most 200 characters', path)
  }
  if (CONTROL_CHARACTERS.test(value)) fail('must not contain control characters', path)
  if (HTML_TAG.test(value)) fail('must not contain raw HTML tags', path)
  return value
}

function requireFiniteNumber(value, path, { positive = false, integer = false, maxAbs = null } = {}) {
  if (
    !Number.isFinite(value) ||
    (positive && value <= 0) ||
    (integer && !Number.isInteger(value)) ||
    (maxAbs != null && Math.abs(value) > maxAbs)
  ) {
    fail(`must be a finite${integer ? ' integer' : ' number'}${positive ? ' greater than 0' : ''}`, path)
  }
  return value
}

function requireColor(value, path, { allowNone = true } = {}) {
  if (typeof value !== 'string' || !SAFE_COLOR.test(value) || (!allowNone && value === 'none')) {
    fail(`must be ${allowNone ? '#RGB, #RRGGBB, or none' : '#RGB or #RRGGBB'}`, path)
  }
  return value
}

function resolveNodeType(node, path) {
  if (node.type != null) {
    if (typeof node.type !== 'string' || !CANONICAL_TYPES.has(node.type)) {
      fail('must be a supported canonical node type', `${path}.type`)
    }
    return node.type
  }
  if (typeof node.shape !== 'string' || !SHAPE_TYPES.has(node.shape)) {
    fail('requires a supported shape when type is omitted', `${path}.shape`)
  }
  return SHAPE_TYPES.get(node.shape)
}

function parseCanvas(value) {
  if (value == null) return null
  const canvas = assertRecord(value, 'canvas')
  assertAllowedKeys(canvas, CANVAS_KEYS, 'canvas')
  const width = requireFiniteNumber(canvas.width, 'canvas.width', { positive: true, integer: true })
  const height = requireFiniteNumber(canvas.height, 'canvas.height', { positive: true, integer: true })
  if (width > MAX_CANVAS_DIMENSION) fail(`must not exceed ${MAX_CANVAS_DIMENSION}`, 'canvas.width')
  if (height > MAX_CANVAS_DIMENSION) fail(`must not exceed ${MAX_CANVAS_DIMENSION}`, 'canvas.height')
  const background = canvas.background == null ? undefined : requireColor(canvas.background, 'canvas.background', { allowNone: false })
  return { width, height, background }
}

function geometryMode(nodes) {
  let hasMissingGeometry = false
  nodes.forEach((node, index) => {
    const count = GEOMETRY_KEYS.filter((key) => Object.hasOwn(node, key)).length
    if (count === 0) hasMissingGeometry = true
    else if (count !== GEOMETRY_KEYS.length) fail('must provide all of x, y, w, and h or none of them', `nodes[${index}]`)
  })
  return hasMissingGeometry ? 'layout' : 'bounds'
}

function parseNode(nodeValue, index, useBounds) {
  const path = `nodes[${index}]`
  const node = assertRecord(nodeValue, path)
  assertAllowedKeys(node, NODE_KEYS, path)
  const id = requireSafeId(node.id, `${path}.id`)
  const label = requireLabel(node.label, `${path}.label`)
  const type = resolveNodeType(node, path)
  const result = { id, label, type }

  if (useBounds) {
    result.bounds = {
      x: requireFiniteNumber(node.x, `${path}.x`, { maxAbs: MAX_CANVAS_DIMENSION }),
      y: requireFiniteNumber(node.y, `${path}.y`, { maxAbs: MAX_CANVAS_DIMENSION }),
      width: requireFiniteNumber(node.w, `${path}.w`, { positive: true, maxAbs: MAX_CANVAS_DIMENSION }),
      height: requireFiniteNumber(node.h, `${path}.h`, { positive: true, maxAbs: MAX_CANVAS_DIMENSION })
    }
  }

  const style = {}
  if (node.fill != null) style.fillColor = requireColor(node.fill, `${path}.fill`)
  if (node.stroke != null) style.strokeColor = requireColor(node.stroke, `${path}.stroke`)
  if (node.fontSize != null) {
    style.fontSize = requireFiniteNumber(node.fontSize, `${path}.fontSize`, { positive: true, maxAbs: MAX_FONT_SIZE })
  }
  if (node.fontColor != null) style.fontColor = requireColor(node.fontColor, `${path}.fontColor`, { allowNone: false })
  if (type === 'text') {
    if (style.fillColor != null && style.fillColor !== 'none') fail('plain text fill must be none', `${path}.fill`)
    if (style.strokeColor != null && style.strokeColor !== 'none') fail('plain text stroke must be none', `${path}.stroke`)
    style.fillColor = 'none'
    style.strokeColor = 'none'
  }
  if (Object.keys(style).length > 0) result.style = style
  return result
}

function parsePoint(value, path) {
  const point = assertRecord(value, path)
  assertAllowedKeys(point, POINT_KEYS, path)
  return {
    x: requireFiniteNumber(point.x, `${path}.x`, { maxAbs: MAX_CANVAS_DIMENSION }),
    y: requireFiniteNumber(point.y, `${path}.y`, { maxAbs: MAX_CANVAS_DIMENSION })
  }
}

function parseEdge(edgeValue, index, nodeIds) {
  const path = `edges[${index}]`
  const edge = assertRecord(edgeValue, path)
  assertAllowedKeys(edge, EDGE_KEYS, path)
  const id = requireSafeId(edge.id, `${path}.id`)
  const from = requireSafeId(edge.source, `${path}.source`)
  const to = requireSafeId(edge.target, `${path}.target`)
  if (!nodeIds.has(from)) fail('must reference an existing node', `${path}.source`)
  if (!nodeIds.has(to)) fail('must reference an existing node', `${path}.target`)
  const result = { id, from, to }
  if (edge.label != null) result.label = requireLabel(edge.label, `${path}.label`)

  const style = {}
  if (edge.dashed != null) {
    if (typeof edge.dashed !== 'boolean') fail('must be a boolean', `${path}.dashed`)
    style.dashed = edge.dashed
  }
  if (edge.arrow != null) {
    if (typeof edge.arrow !== 'boolean') fail('must be a boolean', `${path}.arrow`)
    if (!edge.arrow) style.endArrow = 'none'
  }
  if (edge.stroke != null) style.strokeColor = requireColor(edge.stroke, `${path}.stroke`, { allowNone: false })
  if (Object.keys(style).length > 0) result.style = style
  if (edge.waypoints != null) {
    if (!Array.isArray(edge.waypoints)) fail('must be an array', `${path}.waypoints`)
    result.waypoints = edge.waypoints.map((point, pointIndex) => parsePoint(point, `${path}.waypoints[${pointIndex}]`))
  }
  if (edge.labelOffset != null) result.labelOffset = parsePoint(edge.labelOffset, `${path}.labelOffset`)
  return result
}

export function parseRasterExtraction(source) {
  const document = assertRecord(parseJsonDocument(source, { adapter: ADAPTER }), ADAPTER)
  assertAllowedKeys(document, TOP_LEVEL_KEYS, ADAPTER)
  if (document.schemaVersion !== 1) {
    adapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'raster extraction schemaVersion must be 1', {
      adapter: ADAPTER,
      path: 'schemaVersion'
    })
  }
  if (!Array.isArray(document.nodes) || document.nodes.length === 0) fail('must be a non-empty array', 'nodes')
  if (document.nodes.length > MAX_NODES) fail(`must contain at most ${MAX_NODES} entries`, 'nodes')
  if (!Array.isArray(document.edges)) fail('must be an array', 'edges')
  if (document.edges.length > MAX_EDGES) fail(`must contain at most ${MAX_EDGES} entries`, 'edges')

  const canvas = parseCanvas(document.canvas)
  const useBounds = geometryMode(document.nodes) === 'bounds'
  const nodes = document.nodes.map((node, index) => parseNode(node, index, useBounds))
  const nodeIds = new Set()
  for (const [index, node] of nodes.entries()) {
    if (nodeIds.has(node.id)) fail(`duplicates node id "${node.id}"`, `nodes[${index}].id`)
    nodeIds.add(node.id)
  }
  const edges = document.edges.map((edge, index) => parseEdge(edge, index, nodeIds))
  const edgeIds = new Set()
  for (const [index, edge] of edges.entries()) {
    if (edgeIds.has(edge.id)) fail(`duplicates edge id "${edge.id}"`, `edges[${index}].id`)
    edgeIds.add(edge.id)
  }

  const replication = { colorMode: 'preserve-original' }
  if (canvas?.background != null) replication.background = canvas.background
  const meta = { source: 'replicated', layout: 'hierarchical' }
  if (canvas) meta.canvas = `${canvas.width}x${canvas.height}`
  meta.replication = replication
  return { meta, nodes, edges, modules: [] }
}

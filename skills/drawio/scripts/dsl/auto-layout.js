/**
 * auto-layout.js
 * Edge-aware layered auto-layout (vendored elkjs) as an async pre-pass:
 * for a hierarchical spec whose nodes carry no explicit bounds/position it
 * computes a layered layout (modules as compound containers, orthogonal edge
 * routes) and returns a copy of the spec with node bounds and edge waypoints
 * filled in, so the synchronous converter consumes them like hand-written
 * geometry. If the vendored engine is unavailable or fails, callers keep the
 * original spec and the legacy grid layout applies.
 */

import { createRequire } from 'node:module'
import { detectSemanticType, getNodeSize } from './spec-to-drawio.js'

const require = createRequire(import.meta.url)

const MARGIN = 40
const MODULE_PADDING = '[top=56,left=24,bottom=24,right=24]'
// Spacing is looked up per containing node under INCLUDE_CHILDREN, so module
// containers need the same values or their interiors fall back to elk defaults.
const SPACING_OPTIONS = {
  'elk.layered.spacing.nodeNodeBetweenLayers': '64',
  'elk.spacing.nodeNode': '32',
  'elk.spacing.edgeNode': '24'
}
const ROOT_LAYOUT_OPTIONS = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.edgeRouting': 'ORTHOGONAL',
  'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
  ...SPACING_OPTIONS
}

let elkInstance

function loadElk() {
  if (elkInstance !== undefined) return elkInstance
  try {
    const ELK = require('../vendor/elkjs/elk.bundled.cjs')
    elkInstance = new ELK()
  } catch {
    elkInstance = null
  }
  return elkInstance
}

export function hasExplicitPosition(node) {
  return node?.bounds != null || node?.position != null
}

/**
 * Auto-layout applies only to fully unpositioned hierarchical specs:
 * any explicit bounds/position means the author owns the geometry.
 */
export function canAutoLayout(spec) {
  if (spec?.meta?.layout !== 'hierarchical') return false
  const nodes = spec.nodes || []
  if (nodes.length === 0) return false
  return !nodes.some(hasExplicitPosition)
}

export function buildElkGraph(spec) {
  const nodes = spec.nodes || []
  const modules = spec.modules || []

  const moduleContainers = new Map()
  for (const module of modules) {
    moduleContainers.set(module.id, {
      id: module.id,
      layoutOptions: { 'elk.padding': MODULE_PADDING, ...SPACING_OPTIONS },
      children: []
    })
  }

  const children = []
  const nodeIds = new Set()
  for (const node of nodes) {
    nodeIds.add(node.id)
    const semanticType = detectSemanticType(node.label, node.type, node.network)
    const size = getNodeSize(node.size, semanticType, node.label)
    const elkNode = { id: node.id, width: size.width, height: size.height }
    const container = node.module ? moduleContainers.get(node.module) : null
    if (container) {
      container.children.push(elkNode)
    } else {
      children.push(elkNode)
    }
  }

  for (const container of moduleContainers.values()) {
    if (container.children.length > 0) children.push(container)
  }

  const edges = []
  ;(spec.edges || []).forEach((edge, index) => {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) return
    if (edge.from === edge.to) return
    edges.push({ id: `e${index}`, sources: [edge.from], targets: [edge.to] })
  })

  return { id: 'root', layoutOptions: ROOT_LAYOUT_OPTIONS, children, edges }
}

function collectAbsoluteOrigins(container, originX, originY, origins) {
  origins.set(container.id, { x: originX, y: originY })
  for (const child of container.children || []) {
    collectAbsoluteOrigins(child, originX + (child.x || 0), originY + (child.y || 0), origins)
  }
}

function dedupePoints(points) {
  const result = []
  for (const point of points) {
    const prev = result[result.length - 1]
    if (!prev || Math.abs(prev.x - point.x) >= 1 || Math.abs(prev.y - point.y) >= 1) {
      result.push(point)
    }
  }
  return result
}

/**
 * Map an elk layout result back onto the spec: absolute node bounds for every
 * leaf node, absolute waypoints from orthogonal bend points. Elk reports edge
 * coordinates relative to `edge.container` (the least common ancestor), so
 * every id's absolute origin is resolved first.
 */
export function convertElkResult(spec, result) {
  const origins = new Map()
  collectAbsoluteOrigins(result, MARGIN, MARGIN, origins)

  const nodeBounds = new Map()
  const walk = (container) => {
    for (const child of container.children || []) {
      if (child.children?.length) {
        walk(child)
      } else {
        const origin = origins.get(child.id)
        nodeBounds.set(child.id, {
          x: Math.round(origin.x),
          y: Math.round(origin.y),
          width: Math.round(child.width || 0),
          height: Math.round(child.height || 0)
        })
      }
    }
  }
  walk(result)

  const waypointsByEdgeIndex = new Map()
  for (const edge of result.edges || []) {
    const section = edge.sections?.[0]
    if (!section?.bendPoints?.length) continue
    const origin = origins.get(edge.container || 'root') || { x: MARGIN, y: MARGIN }
    const points = dedupePoints(
      section.bendPoints.map((point) => ({
        x: Math.round(point.x + origin.x),
        y: Math.round(point.y + origin.y)
      }))
    )
    if (points.length === 0) continue
    waypointsByEdgeIndex.set(Number(edge.id.slice(1)), points)
  }

  return {
    ...spec,
    nodes: (spec.nodes || []).map((node) =>
      nodeBounds.has(node.id) ? { ...node, bounds: nodeBounds.get(node.id) } : node
    ),
    edges: (spec.edges || []).map((edge, index) =>
      waypointsByEdgeIndex.has(index) ? { ...edge, waypoints: waypointsByEdgeIndex.get(index) } : edge
    )
  }
}

/**
 * @param {Object} spec - parsed spec
 * @param {Object} [options] - `elk` overrides the engine instance (tests)
 * @returns {Promise<{spec: Object, applied: boolean, warning?: string}>}
 */
export async function applyAutoLayout(spec, options = {}) {
  if (!canAutoLayout(spec)) {
    return { spec, applied: false }
  }
  const elk = options.elk !== undefined ? options.elk : loadElk()
  if (!elk) {
    return {
      spec,
      applied: false,
      warning: 'Auto-layout engine (vendored elkjs) is unavailable; falling back to the legacy grid layout.'
    }
  }
  try {
    const result = await elk.layout(buildElkGraph(spec))
    return { spec: convertElkResult(spec, result), applied: true }
  } catch (err) {
    return {
      spec,
      applied: false,
      warning: `Auto-layout failed (${err.message}); falling back to the legacy grid layout.`
    }
  }
}

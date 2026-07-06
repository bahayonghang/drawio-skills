/**
 * drawio-to-svg.js
 * Converts draw.io mxGraphModel XML to standalone SVG
 * Uses shared XML utilities from ../shared/xml-utils.js
 */

import { attr, decodeEntities, escapeXml, extractCells, extractGraphAttrs, parseStyle } from '../shared/xml-utils.js'

/**
 * Parse mxGraphModel XML into a structured object
 * @param {string} xml
 * @returns {{ graph: object, cells: object[] }}
 */
function parseDrawioXml(xml) {
  const graph = extractGraphAttrs(xml)
  const cells = extractCells(xml)
  return { graph, cells }
}

// ============================================================================
// Shape Classification
// ============================================================================

/**
 * Determine the shape type from a parsed style map
 * @param {Map<string, string>} style
 * @returns {string}
 */
function classifyShape(style) {
  const shape = style.get('shape')
  if (shape === 'text' || style.has('text') || style.has('edgeLabel')) return 'text'
  if (shape === 'cylinder3' || shape === 'cylinder') return 'cylinder'
  if (shape === 'parallelogram') return 'parallelogram'
  if (shape === 'document') return 'document'
  if (shape === 'cloud') return 'cloud'
  if (shape === 'switch') return 'switch'
  if (shape === 'hexagon') return 'hexagon'
  if (shape === 'cube') return 'cube'
  if (shape === 'mxgraph.cisco.firewalls.firewall') return 'firewall'
  if (shape === 'mxgraph.cisco.wireless.access_point') return 'wirelessAp'
  if (style.has('rhombus')) return 'rhombus'
  if (style.has('ellipse')) return 'ellipse'
  const rounded = style.get('rounded')
  const arcSize = Number(style.get('arcSize')) || 0
  if (rounded === '1' && arcSize >= 50) return 'stadium'
  if (rounded === '1') return 'roundedRect'
  return 'rect'
}

// ============================================================================
// Arrow Marker Definitions
// ============================================================================

const ARROW_TYPES = ['block', 'open', 'classic', 'diamond']

/**
 * Build SVG <defs> with arrow markers
 * @returns {string}
 */
function buildMarkerDefs() {
  const markers = []

  // block arrow (filled triangle)
  markers.push(
    '<marker id="arrow-block" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">',
    '  <path d="M 0 0 L 10 5 L 0 10 Z" fill="currentColor"/>',
    '</marker>'
  )

  // open arrow (chevron)
  markers.push(
    '<marker id="arrow-open" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">',
    '  <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="currentColor" stroke-width="1.5"/>',
    '</marker>'
  )

  // classic arrow (filled arrow)
  markers.push(
    '<marker id="arrow-classic" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">',
    '  <path d="M 0 0 L 10 5 L 0 10 L 3 5 Z" fill="currentColor"/>',
    '</marker>'
  )

  // diamond
  markers.push(
    '<marker id="arrow-diamond" viewBox="0 0 12 12" refX="12" refY="6" markerWidth="10" markerHeight="10" orient="auto-start-reverse">',
    '  <path d="M 0 6 L 6 0 L 12 6 L 6 12 Z" fill="currentColor"/>',
    '</marker>'
  )

  return `<defs>\n${markers.join('\n')}\n</defs>`
}

/**
 * Resolve an arrow type name to a marker URL reference
 * @param {string} arrowType
 * @param {'start'|'end'} position
 * @returns {string} marker-start or marker-end attribute, or empty string
 */
function markerRef(arrowType, position) {
  if (!arrowType || arrowType === 'none') return ''
  const id = ARROW_TYPES.includes(arrowType) ? `arrow-${arrowType}` : 'arrow-block'
  const attrName = position === 'start' ? 'marker-start' : 'marker-end'
  return ` ${attrName}="url(#${id})"`
}

// ============================================================================
// Geometry Resolution
// ============================================================================

const ROOT_PARENT_IDS = new Set(['0', '1'])
const MAX_PARENT_DEPTH = 32

/**
 * Round a coordinate to 2 decimals for stable SVG output
 * @param {number} n
 * @returns {number}
 */
function fmt(n) {
  return Math.round(n * 100) / 100
}

/**
 * Compute absolute geometries for vertex cells.
 * draw.io stores child vertex coordinates relative to their parent container;
 * SVG needs absolute canvas coordinates, so parent offsets are accumulated
 * along the parent chain (memoized, depth-capped against cycles).
 * @param {object[]} cells
 * @param {Map<string, object>} cellMap
 * @returns {Map<string, {x: number, y: number, width: number, height: number}>}
 */
function computeAbsoluteGeometries(cells, cellMap) {
  const originMemo = new Map()

  function absoluteOrigin(cell, depth) {
    if (!cell || !cell.geometry) return { x: 0, y: 0 }
    if (cell.id && originMemo.has(cell.id)) return originMemo.get(cell.id)
    let x = cell.geometry.x
    let y = cell.geometry.y
    const parent = cell.parent && !ROOT_PARENT_IDS.has(cell.parent) ? cellMap.get(cell.parent) : null
    if (parent && parent !== cell && parent.vertex && parent.geometry && depth < MAX_PARENT_DEPTH) {
      const parentOrigin = absoluteOrigin(parent, depth + 1)
      x += parentOrigin.x
      y += parentOrigin.y
    }
    const origin = { x, y }
    if (cell.id) originMemo.set(cell.id, origin)
    return origin
  }

  const absGeo = new Map()
  for (const cell of cells) {
    if (!cell.id || !cell.vertex || !cell.geometry || cell.geometry.relative) continue
    const origin = absoluteOrigin(cell, 0)
    absGeo.set(cell.id, { x: origin.x, y: origin.y, width: cell.geometry.width, height: cell.geometry.height })
  }
  return absGeo
}

/**
 * Compute center point of an absolute rect
 * @param {{x: number, y: number, width: number, height: number}} rect
 * @returns {{ x: number, y: number }}
 */
function rectCenter(rect) {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  }
}

/**
 * Read a fixed connection point (exitX/exitY or entryX/entryY) from an edge style
 * @param {Map<string, string>} style
 * @param {'exit'|'entry'} prefix
 * @returns {{ xFrac: number, yFrac: number, dx: number, dy: number }|null}
 */
function readAnchor(style, prefix) {
  const xFrac = Number(style.get(`${prefix}X`))
  const yFrac = Number(style.get(`${prefix}Y`))
  if (!Number.isFinite(xFrac) || !Number.isFinite(yFrac)) return null
  return {
    xFrac,
    yFrac,
    dx: Number(style.get(`${prefix}Dx`)) || 0,
    dy: Number(style.get(`${prefix}Dy`)) || 0
  }
}

/**
 * Resolve an anchor to an absolute point on a node rect
 */
function anchorPoint(rect, anchor) {
  return {
    x: rect.x + rect.width * anchor.xFrac + anchor.dx,
    y: rect.y + rect.height * anchor.yFrac + anchor.dy
  }
}

/**
 * Clip the segment from a rect's center toward a reference point to the rect
 * boundary, so floating edges start/end on the node border instead of its center
 */
function clipToRectBoundary(rect, toward) {
  const center = rectCenter(rect)
  const dx = toward.x - center.x
  const dy = toward.y - center.y
  if (dx === 0 && dy === 0) return center
  const tx = dx !== 0 ? rect.width / 2 / Math.abs(dx) : Infinity
  const ty = dy !== 0 ? rect.height / 2 / Math.abs(dy) : Infinity
  const t = Math.min(tx, ty, 1)
  return { x: center.x + dx * t, y: center.y + dy * t }
}

/**
 * Map a fixed anchor to the node face it sits on
 * @returns {'west'|'east'|'north'|'south'|null}
 */
function faceFromAnchor(anchor) {
  if (anchor.xFrac === 0) return 'west'
  if (anchor.xFrac === 1) return 'east'
  if (anchor.yFrac === 0) return 'north'
  if (anchor.yFrac === 1) return 'south'
  return null
}

/**
 * Infer the node face pointing toward a reference point (dominant axis wins)
 */
function dominantFace(rect, toward) {
  const center = rectCenter(rect)
  const dx = toward.x - center.x
  const dy = toward.y - center.y
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? 'east' : 'west'
  return dy >= 0 ? 'south' : 'north'
}

/**
 * Midpoint of a node face, used as the connection point for floating orthogonal edges
 */
function faceMidpoint(rect, face) {
  switch (face) {
    case 'west':
      return { x: rect.x, y: rect.y + rect.height / 2 }
    case 'east':
      return { x: rect.x + rect.width, y: rect.y + rect.height / 2 }
    case 'north':
      return { x: rect.x + rect.width / 2, y: rect.y }
    default:
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height }
  }
}

const ORTHO_STUB = 20

function isHorizontalFace(face) {
  return face === 'east' || face === 'west'
}

function rectBottom(rect, fallback) {
  return rect ? rect.y + rect.height : fallback
}

function rectRight(rect, fallback) {
  return rect ? rect.x + rect.width : fallback
}

/**
 * Synthesize L/Z-shaped bend points for an orthogonal edge without waypoints.
 * Segments leave/enter perpendicular to their faces; when the direct mid-line
 * would cut back through a node body, the route detours around both rects.
 * This is an approximation, not a replica of draw.io jetty routing.
 * @returns {Array<{x: number, y: number}>}
 */
function synthesizeOrthogonalBends(start, startFace, end, endFace, sourceRect, targetRect) {
  const horizontalStart = isHorizontalFace(startFace)
  const horizontalEnd = isHorizontalFace(endFace)

  if (horizontalStart && horizontalEnd) {
    const midX = (start.x + end.x) / 2
    const clearStart = startFace === 'east' ? midX >= start.x : midX <= start.x
    const clearEnd = endFace === 'east' ? midX >= end.x : midX <= end.x
    if (clearStart && clearEnd) {
      if (start.y === end.y) return []
      return [
        { x: midX, y: start.y },
        { x: midX, y: end.y }
      ]
    }
    const stubX1 = startFace === 'east' ? start.x + ORTHO_STUB : start.x - ORTHO_STUB
    const stubX2 = endFace === 'east' ? end.x + ORTHO_STUB : end.x - ORTHO_STUB
    const detourY = Math.max(rectBottom(sourceRect, start.y), rectBottom(targetRect, end.y)) + ORTHO_STUB
    return [
      { x: stubX1, y: start.y },
      { x: stubX1, y: detourY },
      { x: stubX2, y: detourY },
      { x: stubX2, y: end.y }
    ]
  }

  if (!horizontalStart && !horizontalEnd) {
    const midY = (start.y + end.y) / 2
    const clearStart = startFace === 'south' ? midY >= start.y : midY <= start.y
    const clearEnd = endFace === 'south' ? midY >= end.y : midY <= end.y
    if (clearStart && clearEnd) {
      if (start.x === end.x) return []
      return [
        { x: start.x, y: midY },
        { x: end.x, y: midY }
      ]
    }
    const stubY1 = startFace === 'south' ? start.y + ORTHO_STUB : start.y - ORTHO_STUB
    const stubY2 = endFace === 'south' ? end.y + ORTHO_STUB : end.y - ORTHO_STUB
    const detourX = Math.max(rectRight(sourceRect, start.x), rectRight(targetRect, end.x)) + ORTHO_STUB
    return [
      { x: start.x, y: stubY1 },
      { x: detourX, y: stubY1 },
      { x: detourX, y: stubY2 },
      { x: end.x, y: stubY2 }
    ]
  }

  // Mixed orientation: single L-shaped corner aligned with the start face
  if (horizontalStart) return [{ x: end.x, y: start.y }]
  return [{ x: start.x, y: end.y }]
}

/**
 * Drop consecutive duplicate points from a polyline
 */
function dedupePoints(points) {
  const result = []
  for (const point of points) {
    const prev = result[result.length - 1]
    if (prev && prev.x === point.x && prev.y === point.y) continue
    result.push(point)
  }
  return result
}

/**
 * Resolve the full point sequence of an edge in absolute coordinates:
 * fixed connection points, boundary clipping, waypoint playback and
 * orthogonal L/Z approximation.
 * @param {object} cell - parsed edge cell
 * @param {Map<string, string>} style
 * @param {Map<string, object>} absGeo - id -> absolute rect
 * @returns {Array<{x: number, y: number}>} at least two points
 */
function resolveEdgePoints(cell, style, absGeo) {
  const sourceRect = cell.source ? absGeo.get(cell.source) : null
  const targetRect = cell.target ? absGeo.get(cell.target) : null

  // Edge waypoints are stored relative to the edge's parent coordinate system
  const parentRect = cell.parent ? absGeo.get(cell.parent) : null
  const offsetX = parentRect ? parentRect.x : 0
  const offsetY = parentRect ? parentRect.y : 0
  const waypoints = (cell.geometry?.points || []).map((p) => ({ x: p.x + offsetX, y: p.y + offsetY }))

  const exit = readAnchor(style, 'exit')
  const entry = readAnchor(style, 'entry')
  const orthogonal = style.get('edgeStyle') === 'orthogonalEdgeStyle'

  let start = sourceRect ? rectCenter(sourceRect) : { x: 0, y: 0 }
  let end = targetRect ? rectCenter(targetRect) : { x: 100, y: 100 }
  let startFace = null
  let endFace = null

  if (sourceRect) {
    if (exit) {
      start = anchorPoint(sourceRect, exit)
      startFace = faceFromAnchor(exit)
    } else {
      const toward = waypoints[0] || end
      startFace = dominantFace(sourceRect, toward)
      start =
        orthogonal && !waypoints.length ? faceMidpoint(sourceRect, startFace) : clipToRectBoundary(sourceRect, toward)
    }
  }
  if (targetRect) {
    if (entry) {
      end = anchorPoint(targetRect, entry)
      endFace = faceFromAnchor(entry)
    } else {
      const toward = waypoints[waypoints.length - 1] || start
      endFace = dominantFace(targetRect, toward)
      end =
        orthogonal && !waypoints.length ? faceMidpoint(targetRect, endFace) : clipToRectBoundary(targetRect, toward)
    }
  }

  let bends = waypoints
  if (!bends.length && orthogonal && sourceRect && targetRect) {
    bends = synthesizeOrthogonalBends(
      start,
      startFace || dominantFace(sourceRect, end),
      end,
      endFace || dominantFace(targetRect, start),
      sourceRect,
      targetRect
    )
  }

  return dedupePoints([start, ...bends, end])
}

/**
 * Midpoint of the middle segment of a polyline, used for inline edge labels
 */
function polylineMidpoint(points) {
  const segIndex = Math.floor((points.length - 1) / 2)
  const a = points[segIndex]
  const b = points[segIndex + 1] || a
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

// ============================================================================
// Text Rendering
// ============================================================================

const LINE_HEIGHT_FACTOR = 1.4

/**
 * Split a decoded label into logical lines. Literal newlines, <br> variants
 * and residual &#10;/&#xA; entities all count as line breaks.
 * @param {string} label
 * @returns {string[]}
 */
function splitLabelLines(label) {
  return String(label)
    .replace(/&#(?:10|x0*a);/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\r/g, '')
    .split('\n')
}

/**
 * Render label lines as escaped <text> content. Multi-line labels become
 * per-line <tspan> rows (SVG collapses raw newlines into spaces otherwise).
 * @param {string[]} lines
 * @param {number} x - text anchor x, repeated on each tspan
 * @param {'top'|'middle'|'bottom'} verticalAlign - how lines stack around the text y
 * @param {number} fontSize
 * @returns {string}
 */
function renderTextLines(lines, x, verticalAlign, fontSize) {
  if (lines.length <= 1) return escapeXml(lines[0] || '')
  const lineHeight = Math.round(fontSize * LINE_HEIGHT_FACTOR * 10) / 10
  const firstDy =
    verticalAlign === 'top'
      ? 0
      : verticalAlign === 'bottom'
        ? -(lines.length - 1) * lineHeight
        : (-(lines.length - 1) / 2) * lineHeight
  return lines
    .map((line, i) => `<tspan x="${fmt(x)}" dy="${fmt(i === 0 ? firstDy : lineHeight)}">${escapeXml(line)}</tspan>`)
    .join('')
}

// ============================================================================
// Shape SVG Renderers
// ============================================================================

/**
 * Render a vertex cell to SVG elements
 * @param {object} cell - parsed cell
 * @param {Map<string, string>} style - parsed style
 * @param {{x: number, y: number, width: number, height: number}} [absRect] - absolute geometry (falls back to raw cell geometry)
 * @returns {string} SVG markup
 */
function renderVertex(cell, style, absRect) {
  const geo = absRect || cell.geometry || { x: 0, y: 0, width: 120, height: 60 }
  const { x, y, width, height } = geo

  const fillColor = style.get('fillColor') || '#FFFFFF'
  const strokeColor = style.get('strokeColor') || '#000000'
  const strokeWidth = Number(style.get('strokeWidth')) || 1
  const fontColor = style.get('fontColor') || '#000000'
  const fontSize = Number(style.get('fontSize')) || 12
  const fontFamily = style.get('fontFamily') || 'sans-serif'
  const fontStyleBits = Number(style.get('fontStyle')) || 0

  let dashAttr = ''
  if (style.get('dashed') === '1') {
    const pattern = style.get('dashPattern') || '3 3'
    dashAttr = ` stroke-dasharray="${pattern}"`
  }

  const shapeType = classifyShape(style)
  const parts = []
  const baseAttrs = `fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"${dashAttr}`

  switch (shapeType) {
    case 'text': {
      break
    }

    case 'roundedRect': {
      const rx = Number(style.get('arcSize')) || 8
      parts.push(`<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" ${baseAttrs}/>`)
      break
    }

    case 'stadium': {
      const rx = height / 2
      parts.push(`<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" ${baseAttrs}/>`)
      break
    }

    case 'cylinder': {
      const ellipseRY = Math.min(12, height * 0.15)
      // Body rectangle
      parts.push(
        `<rect x="${x}" y="${y + ellipseRY}" width="${width}" height="${height - ellipseRY * 2}" ${baseAttrs}/>`
      )
      // Bottom ellipse
      parts.push(
        `<ellipse cx="${x + width / 2}" cy="${y + height - ellipseRY}" rx="${width / 2}" ry="${ellipseRY}" ${baseAttrs}/>`
      )
      // Top ellipse (drawn last so it's on top)
      parts.push(
        `<ellipse cx="${x + width / 2}" cy="${y + ellipseRY}" rx="${width / 2}" ry="${ellipseRY}" ${baseAttrs}/>`
      )
      // Side lines connecting top and bottom ellipses
      parts.push(
        `<line x1="${x}" y1="${y + ellipseRY}" x2="${x}" y2="${y + height - ellipseRY}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
      )
      parts.push(
        `<line x1="${x + width}" y1="${y + ellipseRY}" x2="${x + width}" y2="${y + height - ellipseRY}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
      )
      break
    }

    case 'rhombus': {
      const cx = x + width / 2
      const cy = y + height / 2
      const points = `${cx},${y} ${x + width},${cy} ${cx},${y + height} ${x},${cy}`
      parts.push(`<polygon points="${points}" ${baseAttrs}/>`)
      break
    }

    case 'ellipse': {
      const cx = x + width / 2
      const cy = y + height / 2
      parts.push(`<ellipse cx="${cx}" cy="${cy}" rx="${width / 2}" ry="${height / 2}" ${baseAttrs}/>`)
      break
    }

    case 'parallelogram': {
      const skew = width * 0.2
      const points = `${x + skew},${y} ${x + width},${y} ${x + width - skew},${y + height} ${x},${y + height}`
      parts.push(`<polygon points="${points}" ${baseAttrs}/>`)
      break
    }

    case 'hexagon': {
      const inset = Math.min(width * 0.22, 24)
      const points = [
        `${x + inset},${y}`,
        `${x + width - inset},${y}`,
        `${x + width},${y + height / 2}`,
        `${x + width - inset},${y + height}`,
        `${x + inset},${y + height}`,
        `${x},${y + height / 2}`
      ].join(' ')
      parts.push(`<polygon points="${points}" ${baseAttrs}/>`)
      break
    }

    case 'cube': {
      // Approximation of the mxgraph cube stencil: front face plus top/right extrusion
      const depth = Math.max(4, Math.min(Number(style.get('size')) || 20, Math.min(width, height) / 2))
      const outer = [
        `M ${x} ${y + depth}`,
        `L ${x + depth} ${y}`,
        `L ${x + width} ${y}`,
        `L ${x + width} ${y + height - depth}`,
        `L ${x + width - depth} ${y + height}`,
        `L ${x} ${y + height}`,
        'Z'
      ].join(' ')
      const innerEdges = [
        `M ${x} ${y + depth} L ${x + width - depth} ${y + depth}`,
        `M ${x + width - depth} ${y + depth} L ${x + width - depth} ${y + height}`,
        `M ${x + width - depth} ${y + depth} L ${x + width} ${y}`
      ].join(' ')
      parts.push(`<path d="${outer}" ${baseAttrs}/>`)
      parts.push(`<path d="${innerEdges}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`)
      break
    }

    case 'switch': {
      const inset = Math.min(width * 0.18, 18)
      const d = [
        `M ${x + inset} ${y}`,
        `L ${x + width - inset} ${y}`,
        `L ${x + width} ${y + height / 2}`,
        `L ${x + width - inset} ${y + height}`,
        `L ${x + inset} ${y + height}`,
        `L ${x} ${y + height / 2}`,
        'Z'
      ].join(' ')
      const portY1 = y + height * 0.35
      const portY2 = y + height * 0.65
      parts.push(`<path d="${d}" ${baseAttrs}/>`)
      parts.push(
        `<line x1="${x + inset}" y1="${portY1}" x2="${x + width - inset}" y2="${portY1}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
      )
      parts.push(
        `<line x1="${x + inset}" y1="${portY2}" x2="${x + width - inset}" y2="${portY2}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
      )
      break
    }

    case 'document': {
      const waveH = height * 0.1
      const d = [
        `M ${x} ${y}`,
        `L ${x + width} ${y}`,
        `L ${x + width} ${y + height - waveH}`,
        `Q ${x + width * 0.75} ${y + height + waveH} ${x + width / 2} ${y + height - waveH}`,
        `Q ${x + width * 0.25} ${y + height - waveH * 3} ${x} ${y + height - waveH}`,
        'Z'
      ].join(' ')
      parts.push(`<path d="${d}" ${baseAttrs}/>`)
      break
    }

    case 'cloud': {
      // Simplified cloud: overlapping circles
      const cx = x + width / 2
      const cy = y + height / 2
      const rx = width * 0.45
      const ry = height * 0.35
      const d = [
        `M ${x + width * 0.25} ${cy + ry * 0.5}`,
        `A ${rx * 0.5} ${ry * 0.6} 0 0 1 ${x + width * 0.15} ${cy - ry * 0.2}`,
        `A ${rx * 0.5} ${ry * 0.6} 0 0 1 ${x + width * 0.35} ${cy - ry * 0.8}`,
        `A ${rx * 0.5} ${ry * 0.5} 0 0 1 ${cx} ${y + height * 0.15}`,
        `A ${rx * 0.5} ${ry * 0.5} 0 0 1 ${x + width * 0.7} ${cy - ry * 0.7}`,
        `A ${rx * 0.6} ${ry * 0.7} 0 0 1 ${x + width * 0.85} ${cy}`,
        `A ${rx * 0.5} ${ry * 0.6} 0 0 1 ${x + width * 0.75} ${cy + ry * 0.7}`,
        `A ${rx * 0.6} ${ry * 0.4} 0 0 1 ${x + width * 0.5} ${cy + ry * 0.8}`,
        `A ${rx * 0.5} ${ry * 0.4} 0 0 1 ${x + width * 0.25} ${cy + ry * 0.5}`,
        'Z'
      ].join(' ')
      parts.push(`<path d="${d}" ${baseAttrs}/>`)
      break
    }

    case 'firewall': {
      const archHeight = height * 0.18
      const bodyTop = y + archHeight
      const brickWidth = width / 4
      const brickHeight = (height - archHeight) / 3
      const outer = [
        `M ${x} ${bodyTop}`,
        `Q ${x + width / 2} ${y - archHeight * 0.2} ${x + width} ${bodyTop}`,
        `L ${x + width} ${y + height}`,
        `L ${x} ${y + height}`,
        'Z'
      ].join(' ')
      const mortar = [
        `M ${x + brickWidth} ${bodyTop} L ${x + brickWidth} ${y + height}`,
        `M ${x + brickWidth * 2} ${bodyTop} L ${x + brickWidth * 2} ${y + height}`,
        `M ${x + brickWidth * 3} ${bodyTop} L ${x + brickWidth * 3} ${y + height}`,
        `M ${x} ${bodyTop + brickHeight} L ${x + width} ${bodyTop + brickHeight}`,
        `M ${x} ${bodyTop + brickHeight * 2} L ${x + width} ${bodyTop + brickHeight * 2}`
      ].join(' ')
      parts.push(`<path d="${outer}" ${baseAttrs}/>`)
      parts.push(
        `<path d="${mortar}" fill="none" stroke="${strokeColor}" stroke-width="${Math.max(strokeWidth * 0.8, 1)}"/>`
      )
      break
    }

    case 'wirelessAp': {
      const cx = x + width / 2
      const cy = y + height / 2
      const baseRy = height * 0.12
      const baseY = y + height * 0.78
      const arc1 = [
        `M ${cx - width * 0.16} ${cy + height * 0.02}`,
        `Q ${cx} ${cy - height * 0.18} ${cx + width * 0.16} ${cy + height * 0.02}`
      ].join(' ')
      const arc2 = [
        `M ${cx - width * 0.28} ${cy + height * 0.1}`,
        `Q ${cx} ${cy - height * 0.32} ${cx + width * 0.28} ${cy + height * 0.1}`
      ].join(' ')
      parts.push(`<ellipse cx="${cx}" cy="${baseY}" rx="${width * 0.16}" ry="${baseRy}" ${baseAttrs}/>`)
      parts.push(
        `<line x1="${cx}" y1="${baseY - baseRy}" x2="${cx}" y2="${cy + height * 0.12}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
      )
      parts.push(`<path d="${arc1}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`)
      parts.push(`<path d="${arc2}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`)
      break
    }

    default: {
      // Plain rectangle
      parts.push(`<rect x="${x}" y="${y}" width="${width}" height="${height}" ${baseAttrs}/>`)
      break
    }
  }

  // Text label
  const label = decodeEntities(cell.value)
  if (label) {
    const align = style.get('align') || 'center'
    const verticalAlign = style.get('verticalAlign') || 'middle'
    const spacingLeft = Number(style.get('spacingLeft')) || 0
    const spacingRight = Number(style.get('spacingRight')) || 0
    const spacingTop = Number(style.get('spacingTop')) || 0
    const spacingBottom = Number(style.get('spacingBottom')) || 0
    const textX = align === 'left' ? x + spacingLeft : align === 'right' ? x + width - spacingRight : x + width / 2
    const textY =
      verticalAlign === 'top'
        ? y + spacingTop
        : verticalAlign === 'bottom'
          ? y + height - spacingBottom
          : y + height / 2
    const textAnchor = align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle'
    const dominantBaseline = verticalAlign === 'top' ? 'hanging' : verticalAlign === 'bottom' ? 'auto' : 'central'
    const fontWeightAttr = fontStyleBits & 1 ? ' font-weight="700"' : ''
    const fontStyleAttr = fontStyleBits & 2 ? ' font-style="italic"' : ''
    const lines = splitLabelLines(label)
    parts.push(
      `<text x="${textX}" y="${textY}" text-anchor="${textAnchor}" dominant-baseline="${dominantBaseline}" ` +
        `font-family="${escapeXml(fontFamily)}" font-size="${fontSize}" fill="${fontColor}"${fontWeightAttr}${fontStyleAttr}>` +
        `${renderTextLines(lines, textX, verticalAlign, fontSize)}</text>`
    )
  }

  return parts.join('\n')
}

// ============================================================================
// Edge Rendering
// ============================================================================

/**
 * Render an edge cell to SVG elements
 * @param {object} cell - parsed edge cell
 * @param {Map<string, string>} style - parsed style
 * @param {Map<string, object>} absGeo - id -> absolute rect lookup
 * @param {boolean} suppressLabel
 * @returns {string} SVG markup
 */
function renderEdge(cell, style, absGeo, suppressLabel = false) {
  const strokeColor = style.get('strokeColor') || '#000000'
  const strokeWidth = Number(style.get('strokeWidth')) || 1
  const fontColor = style.get('fontColor') || '#000000'
  const fontSize = Number(style.get('fontSize')) || 11

  let dashAttr = ''
  if (style.get('dashed') === '1') {
    const pattern = style.get('dashPattern') || '3 3'
    dashAttr = ` stroke-dasharray="${pattern}"`
  }

  const points = resolveEdgePoints(cell, style, absGeo)

  const parts = []

  // Arrow markers
  const endArrow = style.get('endArrow') || 'classic'
  const startArrow = style.get('startArrow') || ''
  const endRef = markerRef(endArrow, 'end')
  const startRef = markerRef(startArrow, 'start')
  const colorStyle = ` style="color: ${strokeColor}"`
  const strokeAttrs =
    `stroke="${strokeColor}" stroke-width="${strokeWidth}"${dashAttr}` + `${endRef}${startRef}${colorStyle} fill="none"`

  if (points.length === 2) {
    parts.push(
      `<line x1="${fmt(points[0].x)}" y1="${fmt(points[0].y)}" x2="${fmt(points[1].x)}" y2="${fmt(points[1].y)}" ${strokeAttrs}/>`
    )
  } else {
    const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${fmt(p.x)} ${fmt(p.y)}`).join(' ')
    parts.push(`<path d="${d}" ${strokeAttrs}/>`)
  }

  // Edge label
  const label = decodeEntities(cell.value)
  if (label && !suppressLabel) {
    const mid = polylineMidpoint(points)
    const lines = splitLabelLines(label)
    parts.push(
      `<text x="${fmt(mid.x)}" y="${fmt(mid.y - 6)}" text-anchor="middle" dominant-baseline="auto" ` +
        `font-size="${fontSize}" fill="${fontColor}">${renderTextLines(lines, mid.x, 'bottom', fontSize)}</text>`
    )
  }

  return parts.join('\n')
}

function renderEdgeLabel(cell, style, cellMap, absGeo) {
  const parentEdge = cell.parent ? cellMap.get(cell.parent) : null
  if (!parentEdge) return ''
  const sourceRect = parentEdge.source ? absGeo.get(parentEdge.source) : null
  const targetRect = parentEdge.target ? absGeo.get(parentEdge.target) : null
  if (!sourceRect || !targetRect) return ''

  const source = rectCenter(sourceRect)
  const target = rectCenter(targetRect)
  const rawLabelX = Number(cell.geometry?.labelX)
  const labelX = Number.isFinite(rawLabelX) ? rawLabelX : 0.5
  const offset = cell.geometry?.offset || { x: 0, y: -6 }
  const x = source.x + (target.x - source.x) * labelX + offset.x
  const y = source.y + (target.y - source.y) * labelX + offset.y

  const label = decodeEntities(cell.value)
  if (!label) return ''
  const fontColor = style.get('fontColor') || '#000000'
  const fontSize = Number(style.get('fontSize')) || 11
  const fontFamily = style.get('fontFamily') || 'sans-serif'
  const lines = splitLabelLines(label)

  return (
    `<text x="${fmt(x)}" y="${fmt(y)}" text-anchor="middle" dominant-baseline="central" ` +
    `font-family="${escapeXml(fontFamily)}" font-size="${fontSize}" fill="${fontColor}">` +
    `${renderTextLines(lines, x, 'middle', fontSize)}</text>`
  )
}

// ============================================================================
// Main Converter
// ============================================================================

/**
 * Convert draw.io mxGraphModel XML to standalone SVG
 * @param {string} xmlString - draw.io XML content
 * @returns {string} SVG markup
 * @throws {Error} if input is empty or not a string
 */
export function drawioToSvg(xmlString) {
  if (!xmlString || typeof xmlString !== 'string' || xmlString.trim().length === 0) {
    throw new Error('Input XML string must be non-empty')
  }

  const { graph, cells } = parseDrawioXml(xmlString)

  // Build cell lookup map
  const cellMap = new Map()
  for (const cell of cells) {
    if (cell.id) cellMap.set(cell.id, cell)
  }

  // Separate vertices and edges
  const vertices = cells.filter((c) => c.vertex && c.parent !== '0')
  const edges = cells.filter((c) => c.edge)
  const edgeLabels = vertices.filter((v) => parseStyle(v.style).has('edgeLabel'))
  const edgeLabelParents = new Set(edgeLabels.map((v) => v.parent).filter(Boolean))
  const shapeVertices = vertices.filter((v) => !edgeLabelParents.has(v.id) && !parseStyle(v.style).has('edgeLabel'))

  // Resolve container-relative coordinates to absolute canvas coordinates
  const absGeo = computeAbsoluteGeometries(cells, cellMap)

  // Calculate viewBox dimensions from content if default
  let svgWidth = graph.pageWidth
  let svgHeight = graph.pageHeight

  // Expand viewBox if any shape or waypoint extends beyond page bounds
  for (const v of shapeVertices) {
    const geo = absGeo.get(v.id) || v.geometry
    if (geo) {
      svgWidth = Math.max(svgWidth, geo.x + geo.width + 20)
      svgHeight = Math.max(svgHeight, geo.y + geo.height + 20)
    }
  }
  for (const e of edges) {
    const parentRect = e.parent ? absGeo.get(e.parent) : null
    const offsetX = parentRect ? parentRect.x : 0
    const offsetY = parentRect ? parentRect.y : 0
    for (const p of e.geometry?.points || []) {
      svgWidth = Math.max(svgWidth, p.x + offsetX + 20)
      svgHeight = Math.max(svgHeight, p.y + offsetY + 20)
    }
  }

  // Encode original XML as base64 for round-trip editing
  const base64Xml = Buffer.from(xmlString, 'utf-8').toString('base64')

  // Build SVG
  const svgParts = []
  svgParts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" ` +
      `viewBox="0 0 ${svgWidth} ${svgHeight}" data-drawio="${base64Xml}">`
  )

  // Defs (arrow markers)
  svgParts.push(buildMarkerDefs())

  // Background
  if (graph.background && graph.background !== 'none') {
    svgParts.push(`<rect width="100%" height="100%" fill="${graph.background}"/>`)
  }

  // Render vertices first, then edges on top
  for (const v of shapeVertices) {
    const style = parseStyle(v.style)
    svgParts.push(renderVertex(v, style, absGeo.get(v.id)))
  }

  for (const e of edges) {
    const style = parseStyle(e.style)
    svgParts.push(renderEdge(e, style, absGeo, edgeLabelParents.has(e.id)))
  }

  for (const labelCell of edgeLabels) {
    const style = parseStyle(labelCell.style)
    const rendered = renderEdgeLabel(labelCell, style, cellMap, absGeo)
    if (rendered) svgParts.push(rendered)
  }

  svgParts.push('</svg>')
  return svgParts.join('\n')
}

/**
 * shared/xml-utils.js
 * Common XML/HTML parsing utilities shared across draw.io converters.
 *
 * Extracted from drawio-to-spec.js and drawio-to-svg.js to avoid duplication.
 * Both modules now import from this shared module.
 */

// ============================================================================
// HTML Entity Decoding
// ============================================================================

const HTML_ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' '
}

/**
 * Decode common HTML entities in a string.
 * @param {string} str
 * @returns {string}
 */
export function decodeEntities(str) {
  if (!str) return ''
  return String(str).replace(
    /&(?:amp|lt|gt|quot|#39|apos|nbsp);/g,
    (match) => HTML_ENTITIES[match] || match
  )
}

/**
 * Escape text for safe XML attribute embedding.
 * @param {string} str
 * @returns {string}
 */
export function escapeXml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Strip HTML tags from a value string, converting <br> to newline first.
 * @param {string} value
 * @returns {string}
 */
export function stripHtml(value) {
  if (!value) return ''
  const normalized = String(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
  return normalized.replace(/\s+/g, ' ').trim()
}

/**
 * Extract a clean label from an mxCell value attribute.
 * Decodes HTML entities and strips HTML tags.
 * @param {string} value
 * @returns {string}
 */
export function labelFromCellValue(value) {
  const decoded = decodeEntities(value)
  return stripHtml(decoded)
}

// ============================================================================
// XML Attribute Extraction
// ============================================================================

/**
 * Extract an attribute value from a raw XML tag string.
 * @param {string} tag - the raw XML tag/attribute text
 * @param {string} name - attribute name to extract
 * @returns {string|null}
 */
export function attr(tag, name) {
  const re = new RegExp(`${name}\\s*=\\s*"([^"]*)"`)
  const match = re.exec(tag)
  if (match) return match[1]
  const re2 = new RegExp(`${name}\\s*=\\s*'([^']*)'`)
  const match2 = re2.exec(tag)
  return match2 ? match2[1] : null
}

// ============================================================================
// Style Parsing
// ============================================================================

/**
 * Parse a semicolon-separated draw.io style string into a Map.
 * @param {string} styleStr - e.g. "rounded=1;fillColor=#FF0000;strokeColor=#333"
 * @returns {Map<string, string>}
 */
export function parseStyle(styleStr) {
  const map = new Map()
  if (!styleStr) return map
  for (const part of String(styleStr).split(';')) {
    const eq = part.indexOf('=')
    if (eq > 0) {
      map.set(part.slice(0, eq).trim(), part.slice(eq + 1).trim())
    } else if (part.trim()) {
      // Flag-style value like "rhombus" or "ellipse"
      map.set(part.trim(), '1')
    }
  }
  return map
}

// ============================================================================
// Waypoint / Point Parsing
// ============================================================================

/**
 * Parse waypoint <mxPoint> elements from an <Array as="points"> block.
 * @param {string} geometryBody - inner HTML of <mxGeometry>
 * @returns {Array<{x: number, y: number}>}
 */
export function parsePoints(geometryBody) {
  if (!geometryBody) return []
  const pointsBlock = /<Array[^>]*\bas="points"[^>]*>([\s\S]*?)<\/Array>/i.exec(geometryBody)
  if (!pointsBlock) return []

  const points = []
  const pointRe = /<mxPoint\b([^>]*?)\/>/gi
  let match
  while ((match = pointRe.exec(pointsBlock[1])) !== null) {
    const x = Number(attr(match[1], 'x'))
    const y = Number(attr(match[1], 'y'))
    if (Number.isFinite(x) && Number.isFinite(y)) {
      points.push({ x, y })
    }
  }
  return points
}

// ============================================================================
// mxCell Parsing
// ============================================================================

/**
 * Build a structured cell object from raw mxCell attribute string and body content.
 * @param {string} cellAttrs - raw attribute string from the <mxCell> tag
 * @param {string} cellBody - inner content (may contain <mxGeometry>)
 * @returns {object}
 */
export function buildCell(cellAttrs, cellBody) {
  const geometryMatch = /<mxGeometry\b([^>]*?)>([\s\S]*?)<\/mxGeometry>/i.exec(cellBody)
  const geometrySelfMatch = /<mxGeometry\b([^>]*?)\/>/i.exec(cellBody)
  const geometryAttrs = geometryMatch ? geometryMatch[1] : geometrySelfMatch ? geometrySelfMatch[1] : null
  const geometryBody = geometryMatch ? geometryMatch[2] : ''

  const geometry = geometryAttrs ? {
    x: Number(attr(geometryAttrs, 'x')) || 0,
    y: Number(attr(geometryAttrs, 'y')) || 0,
    width: Number(attr(geometryAttrs, 'width')) || 0,
    height: Number(attr(geometryAttrs, 'height')) || 0,
    relative: attr(geometryAttrs, 'relative') === '1',
    labelX: attr(geometryAttrs, 'x'),
    points: parsePoints(geometryBody)
  } : null

  return {
    id: attr(cellAttrs, 'id'),
    value: attr(cellAttrs, 'value'),
    style: attr(cellAttrs, 'style'),
    vertex: attr(cellAttrs, 'vertex') === '1',
    edge: attr(cellAttrs, 'edge') === '1',
    source: attr(cellAttrs, 'source'),
    target: attr(cellAttrs, 'target'),
    parent: attr(cellAttrs, 'parent'),
    geometry
  }
}

/**
 * Extract all mxCell elements from an mxGraphModel XML string.
 * Uses a two-pass approach: first open-close pairs, then self-closing tags.
 * @param {string} xml - full mxGraphModel XML
 * @returns {Array<object>} parsed cell objects
 */
export function extractCells(xml) {
  const cells = []
  const pairRegex = /<mxCell\b([^>]*[^/])>([\s\S]*?)<\/mxCell>/gi
  const selfRegex = /<mxCell\b([^>]*?)\/>/gi

  let m
  const matchedRanges = []
  while ((m = pairRegex.exec(xml)) !== null) {
    matchedRanges.push({ start: m.index, end: m.index + m[0].length })
    cells.push(buildCell(m[1], m[2] || ''))
  }

  while ((m = selfRegex.exec(xml)) !== null) {
    const pos = m.index
    const overlaps = matchedRanges.some(r => pos >= r.start && pos < r.end)
    if (overlaps) continue
    cells.push(buildCell(m[1], ''))
  }

  return cells
}

// ============================================================================
// Graph-Level Attributes
// ============================================================================

/**
 * Extract graph-level attributes from <mxGraphModel ...>.
 * @param {string} xml
 * @returns {object}
 */
export function extractGraphAttrs(xml) {
  const graphMatch = /<mxGraphModel([^>]*)>/i.exec(xml)
  const graphAttrs = graphMatch ? graphMatch[1] : ''
  return {
    dx: Number(attr(graphAttrs, 'dx')) || 0,
    dy: Number(attr(graphAttrs, 'dy')) || 0,
    pageWidth: Number(attr(graphAttrs, 'pageWidth')) || 800,
    pageHeight: Number(attr(graphAttrs, 'pageHeight')) || 600,
    background: attr(graphAttrs, 'background') || 'none'
  }
}

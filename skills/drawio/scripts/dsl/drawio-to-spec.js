/**
 * drawio-to-spec.js
 * Import a .drawio file (mxfile/diagram) into the canonical YAML spec shape.
 *
 * Supports:
 * - Uncompressed diagrams where <diagram> contains <mxGraphModel>...</mxGraphModel>
 * - Common compressed diagrams where <diagram> contains base64(deflateRaw(encodeURIComponent(mxGraphModelXml)))
 */

import { inflateRawSync, inflateSync } from 'node:zlib'

import { detectSemanticType, snapToGrid } from './spec-to-drawio.js'

const HTML_ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' '
}

const SIZE_PRESETS = {
  tiny: { width: 32, height: 32 },
  small: { width: 80, height: 40 },
  medium: { width: 120, height: 60 },
  large: { width: 160, height: 80 },
  xl: { width: 200, height: 100 }
}

function decodeEntities(str) {
  if (!str) return ''
  return String(str).replace(
    /&(?:amp|lt|gt|quot|#39|apos|nbsp);/g,
    (match) => HTML_ENTITIES[match] || match
  )
}

function stripHtml(value) {
  if (!value) return ''
  const normalized = String(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
  return normalized.replace(/\s+/g, ' ').trim()
}

function labelFromCellValue(value) {
  const decoded = decodeEntities(value)
  return stripHtml(decoded)
}

function parseStyle(styleStr) {
  const map = new Map()
  if (!styleStr) return map
  for (const part of String(styleStr).split(';')) {
    const eq = part.indexOf('=')
    if (eq > 0) {
      map.set(part.slice(0, eq).trim(), part.slice(eq + 1).trim())
    } else if (part.trim()) {
      map.set(part.trim(), '1')
    }
  }
  return map
}

function attr(tag, name) {
  const re = new RegExp(`${name}\\s*=\\s*"([^"]*)"` )
  const match = re.exec(tag)
  if (match) return match[1]
  const re2 = new RegExp(`${name}\\s*=\\s*'([^']*)'`)
  const match2 = re2.exec(tag)
  return match2 ? match2[1] : null
}

function parsePoints(geometryBody) {
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

function buildCell(cellAttrs, cellBody) {
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

function parseMxGraphModelXml(xml) {
  const match = /<mxGraphModel\b[^>]*>[\s\S]*?<\/mxGraphModel>/i.exec(xml)
  if (!match) {
    throw new Error('Could not find <mxGraphModel> in the decoded diagram')
  }
  const mxGraphModelXml = match[0]

  const cells = []
  const pairRegex = /<mxCell\b([^>]*[^/])>([\s\S]*?)<\/mxCell>/gi
  const selfRegex = /<mxCell\b([^>]*?)\/>/gi

  let m
  const matchedRanges = []
  while ((m = pairRegex.exec(mxGraphModelXml)) !== null) {
    matchedRanges.push({ start: m.index, end: m.index + m[0].length })
    cells.push(buildCell(m[1], m[2] || ''))
  }

  while ((m = selfRegex.exec(mxGraphModelXml)) !== null) {
    const pos = m.index
    const overlaps = matchedRanges.some(r => pos >= r.start && pos < r.end)
    if (overlaps) continue
    cells.push(buildCell(m[1], ''))
  }

  return { mxGraphModelXml, cells }
}

function normalizeBase64(input) {
  const trimmed = String(input || '').trim()
  const normalized = trimmed
    .replace(/[\r\n\s]+/g, '')
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const pad = normalized.length % 4
  if (pad === 0) return normalized
  if (pad === 2) return normalized + '=='
  if (pad === 3) return normalized + '='
  return normalized
}

function tryDecodeURIComponent(text) {
  if (!text || typeof text !== 'string') return text
  if (!/%[0-9A-Fa-f]{2}/.test(text)) return text
  try {
    return decodeURIComponent(text)
  } catch {
    return text
  }
}

function decodeDiagramContent(content) {
  const trimmed = String(content || '').trim()
  if (trimmed.includes('<mxGraphModel')) return trimmed

  const b64 = normalizeBase64(trimmed)
  let buf
  try {
    buf = Buffer.from(b64, 'base64')
  } catch (err) {
    throw new Error(`Diagram content is not valid base64: ${err.message}`)
  }

  const attempts = [
    () => inflateRawSync(buf).toString('utf-8'),
    () => inflateSync(buf).toString('utf-8'),
    () => buf.toString('utf-8')
  ]

  const errors = []
  for (const attempt of attempts) {
    try {
      const text = attempt()
      const maybeDecoded = tryDecodeURIComponent(text)
      if (maybeDecoded.includes('<mxGraphModel')) return maybeDecoded
    } catch (err) {
      errors.push(err)
    }
  }

  const message = errors.length > 0
    ? errors.map(e => e.message).join(' | ')
    : 'Unknown decode failure'
  throw new Error(`Could not decode <diagram> content into mxGraphModel XML. ${message}`)
}

function extractDiagrams(drawioFileText) {
  const diagrams = []
  const diagramRe = /<diagram\b([^>]*)>([\s\S]*?)<\/diagram>/gi
  let match
  while ((match = diagramRe.exec(drawioFileText)) !== null) {
    const attrs = match[1] || ''
    const name = attr(attrs, 'name')
    diagrams.push({
      name,
      content: match[2] || ''
    })
  }
  if (diagrams.length === 0) {
    throw new Error('No <diagram> elements found in the .drawio file')
  }
  return diagrams
}

function pickDiagram(diagrams, selector) {
  if (selector == null || selector === '') return diagrams[0]
  const raw = String(selector)
  if (/^\d+$/.test(raw)) {
    const index = Number(raw)
    if (!Number.isFinite(index) || index < 0 || index >= diagrams.length) {
      throw new Error(`--page index out of range: ${raw}. Available pages: 0..${diagrams.length - 1}`)
    }
    return diagrams[index]
  }

  const exact = diagrams.find(d => d.name === raw)
  if (exact) return exact
  const ci = diagrams.find(d => (d.name || '').toLowerCase() === raw.toLowerCase())
  if (ci) return ci
  const names = diagrams.map(d => d.name || '(unnamed)').join(', ')
  throw new Error(`--page "${raw}" not found. Available page names: ${names}`)
}

function hexOrNull(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmed) ? trimmed : null
}

function numberOrNull(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function closestPreset(width, height) {
  let best = 'medium'
  let bestScore = Number.POSITIVE_INFINITY
  for (const [key, preset] of Object.entries(SIZE_PRESETS)) {
    const score = Math.abs(preset.width - width) + Math.abs(preset.height - height)
    if (score < bestScore) {
      bestScore = score
      best = key
    }
  }
  return best
}

function inferTypeFromStyle(style, label) {
  const shape = style.get('shape')
  if (shape === 'cylinder3' || shape === 'cylinder') return 'database'
  if (shape === 'parallelogram') return 'queue'
  if (shape === 'document') return 'document'
  if (shape === 'cloud') return 'cloud'
  if (shape === 'cube') return 'tensor3d'
  if (style.has('rhombus')) return 'decision'
  if (style.has('ellipse')) {
    const detected = detectSemanticType(label, null)
    return detected === 'operator' ? 'operator' : 'user'
  }

  const arcSize = numberOrNull(style.get('arcSize'))
  if (style.get('rounded') === '1' && arcSize != null && arcSize >= 40) return 'terminal'
  return detectSemanticType(label, null)
}

function inferIconFromStyle(style) {
  const resIcon = style.get('resIcon')
  const shape = style.get('shape')
  const raw = resIcon || shape
  if (!raw || typeof raw !== 'string') return null

  if (raw.startsWith('mxgraph.aws4.')) return `aws.${raw.slice('mxgraph.aws4.'.length)}`
  if (raw.startsWith('mxgraph.gcp2.')) return `gcp.${raw.slice('mxgraph.gcp2.'.length)}`
  if (raw.startsWith('mxgraph.azure.')) return `azure.${raw.slice('mxgraph.azure.'.length)}`
  if (raw.startsWith('mxgraph.kubernetes.')) return `k8s.${raw.slice('mxgraph.kubernetes.'.length)}`
  if (raw.startsWith('mxgraph.')) return raw
  return null
}

function inferEdgeTypeFromStyle(style) {
  const endArrow = style.get('endArrow') || 'block'
  const startArrow = style.get('startArrow') || ''
  const dashed = style.get('dashed') === '1'
  const dashPattern = style.get('dashPattern') || ''

  if (endArrow === 'diamond') return 'dependency'
  if (dashed && endArrow === 'open') return 'optional'
  if (dashed && /^(2\s+2|3\s+3)$/.test(dashPattern.trim())) return 'optional'
  if (dashed) return 'data'
  if (endArrow === 'none' && !startArrow) return 'bidirectional'
  if (startArrow && endArrow && startArrow === endArrow) return 'bidirectional'
  return 'primary'
}

function extractNodeStyleOverrides(style) {
  const fillColor = hexOrNull(style.get('fillColor'))
  const strokeColor = hexOrNull(style.get('strokeColor'))
  const fontColor = hexOrNull(style.get('fontColor'))
  const strokeWidth = numberOrNull(style.get('strokeWidth'))
  const fontSize = numberOrNull(style.get('fontSize'))

  const overrides = {}
  if (fillColor) overrides.fillColor = fillColor
  if (strokeColor) overrides.strokeColor = strokeColor
  if (fontColor) overrides.fontColor = fontColor
  if (strokeWidth != null) overrides.strokeWidth = strokeWidth
  if (fontSize != null) overrides.fontSize = fontSize
  return Object.keys(overrides).length > 0 ? overrides : null
}

function extractEdgeStyleOverrides(style) {
  const strokeColor = hexOrNull(style.get('strokeColor'))
  const strokeWidth = numberOrNull(style.get('strokeWidth'))
  const dashed = style.get('dashed') === '1'
  const dashPattern = style.get('dashPattern') || null
  const endArrow = style.get('endArrow') || null
  const endFill = style.get('endFill')
  const startArrow = style.get('startArrow') || null
  const startFill = style.get('startFill')

  const numericFields = [
    'exitX', 'exitY', 'exitDx', 'exitDy',
    'entryX', 'entryY', 'entryDx', 'entryDy'
  ]

  const overrides = {}
  if (strokeColor) overrides.strokeColor = strokeColor
  if (strokeWidth != null) overrides.strokeWidth = strokeWidth
  if (dashed) overrides.dashed = true
  if (dashPattern) overrides.dashPattern = dashPattern
  if (endArrow) overrides.endArrow = endArrow
  if (endFill != null) overrides.endFill = endFill === '1'
  if (startArrow) overrides.startArrow = startArrow
  if (startFill != null) overrides.startFill = startFill === '1'

  for (const field of numericFields) {
    const value = numberOrNull(style.get(field))
    if (value != null) overrides[field] = value
  }

  return Object.keys(overrides).length > 0 ? overrides : null
}

function makeSpecId(prefix, raw) {
  const cleaned = String(raw || '')
    .trim()
    .replace(/[^A-Za-z0-9_-]+/g, '_')
  return `${prefix}${cleaned || '0'}`
}

function inferLayout(nodes) {
  if (!Array.isArray(nodes) || nodes.length < 2) return 'horizontal'
  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  for (const node of nodes) {
    if (!node.position) continue
    minX = Math.min(minX, node.position.x)
    maxX = Math.max(maxX, node.position.x)
    minY = Math.min(minY, node.position.y)
    maxY = Math.max(maxY, node.position.y)
  }
  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return 'horizontal'
  const spanX = maxX - minX
  const spanY = maxY - minY
  return spanX >= spanY ? 'horizontal' : 'vertical'
}

/**
 * Convert a full .drawio file into a YAML spec object.
 * @param {string} drawioFileText
 * @param {{ theme?: string, page?: string|number, title?: string }} options
 */
export function drawioToSpec(drawioFileText, options = {}) {
  if (typeof drawioFileText !== 'string' || drawioFileText.trim() === '') {
    throw new Error('drawioToSpec: input must be a non-empty string')
  }

  const diagrams = extractDiagrams(drawioFileText)
  const selected = pickDiagram(diagrams, options.page)
  const decoded = decodeDiagramContent(selected.content)
  const { cells } = parseMxGraphModelXml(decoded)

  const cellMap = new Map()
  for (const cell of cells) {
    if (cell.id) cellMap.set(cell.id, cell)
  }

  const vertices = cells.filter(c => c.vertex && c.id !== '0' && c.id !== '1')
  const edges = cells.filter(c => c.edge)

  const verticesByParent = new Map()
  for (const v of vertices) {
    if (!v.parent) continue
    if (!verticesByParent.has(v.parent)) verticesByParent.set(v.parent, [])
    verticesByParent.get(v.parent).push(v)
  }

  const isEdgeLabelCell = (cell) => {
    const style = parseStyle(cell.style)
    return style.has('edgeLabel') || style.get('edgeLabel') === '1'
  }

  const moduleCells = new Set()
  for (const v of vertices) {
    const children = verticesByParent.get(v.id)
    if (children && children.some(child => child.vertex && !isEdgeLabelCell(child))) {
      moduleCells.add(v)
    }
  }

  const modules = []
  const moduleIdByCellId = new Map()
  for (const modCell of moduleCells) {
    const id = makeSpecId('m', modCell.id)
    moduleIdByCellId.set(modCell.id, id)

    const label = labelFromCellValue(modCell.value) || id
    const style = parseStyle(modCell.style)
    const fillColor = hexOrNull(style.get('fillColor'))
    const dashed = style.get('dashed') === '1'
    const dashPattern = style.get('dashPattern') || undefined

    const module = { id, label }
    if (fillColor) module.color = fillColor
    if (dashed || dashPattern) {
      module.style = {}
      if (dashed) module.style.dashed = true
      if (dashPattern) module.style.dashPattern = dashPattern
    }

    modules.push(module)
  }

  const nodes = []
  const nodeIdByCellId = new Map()

  function absPosition(cell) {
    const geo = cell.geometry
    if (!geo) return null

    const width = geo.width || 0
    const height = geo.height || 0

    let x = geo.x || 0
    let y = geo.y || 0

    if (cell.parent && moduleIdByCellId.has(cell.parent)) {
      const parentCell = cellMap.get(cell.parent)
      const parentGeo = parentCell?.geometry
      if (parentGeo) {
        x += parentGeo.x || 0
        y += parentGeo.y || 0
      }
    }

    const cx = snapToGrid(x + width / 2, 8)
    const cy = snapToGrid(y + height / 2, 8)
    return { cx, cy, width, height }
  }

  for (const v of vertices) {
    if (moduleCells.has(v)) continue
    if (isEdgeLabelCell(v)) continue
    if (!v.id) continue

    const id = makeSpecId('n', v.id)
    nodeIdByCellId.set(v.id, id)

    const label = labelFromCellValue(v.value) || id
    const style = parseStyle(v.style)
    const inferredType = inferTypeFromStyle(style, label)
    const icon = inferIconFromStyle(style)

    const pos = absPosition(v)
    const node = {
      id,
      label,
      type: inferredType
    }

    if (icon) node.icon = icon
    if (v.parent && moduleIdByCellId.has(v.parent)) {
      node.module = moduleIdByCellId.get(v.parent)
    }

    if (pos) {
      node.position = { x: pos.cx, y: pos.cy }
      node.size = closestPreset(pos.width, pos.height)
    }

    const overrides = extractNodeStyleOverrides(style)
    if (overrides) node.style = overrides

    nodes.push(node)
  }

  const edgeLabelsByParent = new Map()
  for (const v of vertices) {
    if (!isEdgeLabelCell(v)) continue
    if (!v.parent) continue
    const label = labelFromCellValue(v.value)
    if (label) {
      edgeLabelsByParent.set(v.parent, {
        label,
        labelX: v.geometry?.labelX
      })
    }
  }

  const specEdges = []
  for (const e of edges) {
    const from = e.source ? nodeIdByCellId.get(e.source) : null
    const to = e.target ? nodeIdByCellId.get(e.target) : null
    if (!from || !to) continue

    const style = parseStyle(e.style)
    const imported = edgeLabelsByParent.get(e.id)
    const label = labelFromCellValue(e.value) || imported?.label || undefined
    const edgeType = inferEdgeTypeFromStyle(style)
    const edgeStyle = extractEdgeStyleOverrides(style)
    const waypoints = e.geometry?.points && e.geometry.points.length > 0 ? e.geometry.points : undefined

    const edge = {
      from,
      to,
      type: edgeType
    }

    if (label) edge.label = label
    if (edgeStyle) edge.style = edgeStyle
    if (waypoints) edge.waypoints = waypoints

    const labelX = imported?.labelX != null ? Number(imported.labelX) : null
    if (labelX != null && Number.isFinite(labelX)) {
      if (labelX <= 0.35) edge.labelPosition = 'start'
      else if (labelX >= 0.65) edge.labelPosition = 'end'
      else edge.labelPosition = 'center'
    }

    specEdges.push(edge)
  }

  const theme = options.theme || 'tech-blue'
  const profile = theme.startsWith('academic') ? 'academic-paper' : undefined
  const title = options.title || selected.name || undefined

  const meta = {
    theme,
    layout: inferLayout(nodes),
    source: 'edited'
  }
  if (profile) meta.profile = profile
  if (title) meta.title = title

  return {
    meta,
    modules,
    nodes,
    edges: specEdges
  }
}


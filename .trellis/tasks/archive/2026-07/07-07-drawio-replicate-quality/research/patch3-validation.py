# -*- coding: utf-8 -*-
"""Phase 2+3: validation layers, transparent text, arrow head size, label fixes."""

import io
import sys

path = "skills/drawio/scripts/dsl/spec-to-drawio.js"
src = io.open(path, encoding="utf-8").read()


def replace_once(haystack, old, new, tag):
    if haystack.count(old) != 1:
        sys.exit("ANCHOR FAILED (%s): count=%d" % (tag, haystack.count(old)))
    return haystack.replace(old, new, 1)


# --- (a) endSize/startSize defaults in generateConnectorStyle ---
old = """  const parts = [
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
"""
new = """  const parts = [
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

  // Bold solid triangular heads by default: small stock arrowheads read as
  // afterthoughts on 2px architecture connectors.
  const endSize =
    edge.style?.endSize ??
    connectorTheme.endSize ??
    (endArrow === 'block' || endArrow === 'classic' ? DEFAULT_ARROW_HEAD_SIZE : undefined)
  if (endSize !== undefined) parts.push(`endSize=${endSize}`)

  if (startArrow) {
    parts.push(`startArrow=${startArrow}`)
    parts.push(`startFill=${startFill ? 1 : 0}`)
    const startSize =
      edge.style?.startSize ??
      connectorTheme.startSize ??
      (startArrow === 'block' || startArrow === 'classic' ? DEFAULT_ARROW_HEAD_SIZE : undefined)
    if (startSize !== undefined) parts.push(`startSize=${startSize}`)
  }
"""
src = replace_once(src, old, new, "a:endSize")

old = """/**
 * Generate mxCell style string for a connector
 */
export function generateConnectorStyle(edge, theme, routing = 'orthogonal') {
"""
new = """const DEFAULT_ARROW_HEAD_SIZE = 12

/**
 * Generate mxCell style string for a connector
 */
export function generateConnectorStyle(edge, theme, routing = 'orthogonal') {
"""
src = replace_once(src, old, new, "a2:arrow-const")

# --- (b) plain text nodes always transparent ---
old = """  const fillColor = resolveThemeColor(
    node.style?.fillColor,
    theme,
    isTextNode ? 'none' : nodeTheme.fillColor || defaultTheme.fillColor || '#DBEAFE'
  )
  const strokeColor = resolveThemeColor(
    node.style?.strokeColor,
    theme,
    isTextNode ? 'none' : nodeTheme.strokeColor || defaultTheme.strokeColor || '#2563EB'
  )
"""
new = """  // Plain text boxes always render transparent: captions, callouts, and
  // vertical labels must never mask the grid or connectors behind them.
  // Explicit fills on type "text" are ignored (use a shape node or formula
  // type for a filled label); validateTextNodeStyles reports the override.
  const fillColor = isTextNode
    ? 'none'
    : resolveThemeColor(node.style?.fillColor, theme, nodeTheme.fillColor || defaultTheme.fillColor || '#DBEAFE')
  const strokeColor = isTextNode
    ? 'none'
    : resolveThemeColor(node.style?.strokeColor, theme, nodeTheme.strokeColor || defaultTheme.strokeColor || '#2563EB')
"""
src = replace_once(src, old, new, "b:text-transparent")

# --- (e) drop overflow=hidden clipping from text nodes ---
old = """    const parts = [
      shapeStyle,
      'html=1',
      'whiteSpace=wrap',
      'overflow=hidden',
      'labelBackgroundColor=none',
"""
new = """    const parts = [
      shapeStyle,
      'html=1',
      'whiteSpace=wrap',
      'labelBackgroundColor=none',
"""
src = replace_once(src, old, new, "e:overflow")

# --- shared label measurement helper next to estimateTextSize ---
old = """/**
 * Get node dimensions based on size preset or node type
 */
export function getNodeSize(size, nodeType = null, label = null) {
"""
new = """/**
 * Raw text extent without the usability floors of estimateTextSize. Used by
 * lint passes that compare declared bounds or label boxes against content.
 */
function measureLabelExtent(label, fontSize = 13, padding = 8) {
  const lines = String(label).split(/\\n|<br\\s*\\/?>/i)
  let maxLineWidth = 0
  for (const line of lines) {
    let lineWidth = 0
    for (const ch of line) {
      lineWidth += /[\\u3000-\\u9fff\\uff00-\\uffef]/.test(ch) ? fontSize * 1.05 : fontSize * 0.6
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
export function getNodeSize(size, nodeType = null, label = null) {
"""
src = replace_once(src, old, new, "helper:measureLabelExtent")

# --- (f) newline-to-<br> label conversion in buildXml ---
old = """// ============================================================================
// XML Generation
// ============================================================================

/**
 * Build draw.io XML from specification
 */
"""
new = """// ============================================================================
// XML Generation
// ============================================================================

const MATH_DELIMITER_PATTERN = /\\$\\$|\\\\\\(|\\\\\\[|`/

/**
 * XML attribute-value normalization folds literal newlines into spaces, so
 * multi-line labels (including one-character-per-line vertical CJK labels)
 * must travel as <br> tags, which html=1 labels render as real line breaks.
 * Math labels keep their newlines: <br> inside $$...$$ breaks MathJax.
 */
function toHtmlLineBreaks(escapedLabel, rawLabel) {
  if (MATH_DELIMITER_PATTERN.test(String(rawLabel))) return escapedLabel
  return escapedLabel.replace(/\\n/g, '&lt;br&gt;')
}

/**
 * Build draw.io XML from specification
 */
"""
src = replace_once(src, old, new, "f:br-helper")

old = """    const style = generateModuleStyleWithSpec(module, theme, spec)
    const label = prepareMathLabel(module.label || moduleId)
"""
new = """    const style = generateModuleStyleWithSpec(module, theme, spec)
    const label = toHtmlLineBreaks(prepareMathLabel(module.label || moduleId), module.label || moduleId)
"""
src = replace_once(src, old, new, "f:module-label")

old = """    const style = generateNodeStyleWithSpec(node, theme, spec)
    const label = prepareMathLabel(node.label)
"""
new = """    const style = generateNodeStyleWithSpec(node, theme, spec)
    const label = toHtmlLineBreaks(prepareMathLabel(node.label), node.label)
"""
src = replace_once(src, old, new, "f:node-label")

old = """    const rawEdgeLabel = formatNetworkEdgeLabel(edge)
    const edgeLabel = rawEdgeLabel ? prepareMathLabel(rawEdgeLabel) : ''
"""
new = """    const rawEdgeLabel = formatNetworkEdgeLabel(edge)
    const edgeLabel = rawEdgeLabel ? toHtmlLineBreaks(prepareMathLabel(rawEdgeLabel), rawEdgeLabel) : ''
"""
src = replace_once(src, old, new, "f:edge-label")

# --- (j) color validator accepts transparency keywords ---
old = """  const checkColor = (value, context) => {
    if (!value) return
    if (validTokens.has(value)) return // valid theme token
    if (HEX_COLOR_REGEX.test(value)) return // valid hex color
"""
new = """  const checkColor = (value, context) => {
    if (!value) return
    if (value === 'none' || value === 'transparent') return // explicit transparency
    if (validTokens.has(value)) return // valid theme token
    if (HEX_COLOR_REGEX.test(value)) return // valid hex color
"""
src = replace_once(src, old, new, "j:none-color")

# --- (c+d) validateTextNodeStyles before FACE_SLOTS ---
old = """const FACE_SLOTS = [0.25, 0.5, 0.75, 0.33, 0.66, 0.2, 0.8]
"""
new = """const TRANSPARENT_STYLE_VALUES = new Set(['none', 'transparent'])

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
      const fontSize = node.style?.fontSize ?? 13
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
"""
src = replace_once(src, old, new, "cd:validateTextNodeStyles")

# --- (i) label collision lint before Layout Quality Metrics ---
old = """// ============================================================================
// Layout Quality Metrics
// ============================================================================

function rectCenter(rect) {
"""
new = """const LABEL_COLLISION_WARNING_CAP = 12

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
    const first = points[0]
    const last = points[points.length - 1]
    const anchor = { x: first.x + (last.x - first.x) * fraction, y: first.y + (last.y - first.y) * fraction }
    const offset = resolveEdgeLabelOffset(edge)
    const extent = measureLabelExtent(label, edge.style?.fontSize ?? 11, 2)
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
"""
src = replace_once(src, old, new, "i:label-collisions")

# --- wire new validators into specToDrawioXml ---
old = """  const edgeWarnings = validateEdgeQuality(spec, layout)
  const academicWarnings = validateAcademicProfile(spec)
  const shapeWarnings = validateShapeReferences(spec)
  const schemaDriftWarnings = validateSchemaDrift(spec)
  const allValidationWarnings = [
    ...colorWarnings,
    ...layoutWarnings,
    ...connectionPointWarnings,
    ...edgeWarnings,
    ...academicWarnings,
    ...shapeWarnings,
    ...schemaDriftWarnings
  ]
"""
new = """  const edgeWarnings = validateEdgeQuality(spec, layout)
  const textNodeWarnings = validateTextNodeStyles(spec)
  const labelCollisionWarnings = validateLabelCollisions(spec, layout)
  const academicWarnings = validateAcademicProfile(spec)
  const shapeWarnings = validateShapeReferences(spec)
  const schemaDriftWarnings = validateSchemaDrift(spec)
  const allValidationWarnings = [
    ...colorWarnings,
    ...layoutWarnings,
    ...connectionPointWarnings,
    ...edgeWarnings,
    ...textNodeWarnings,
    ...labelCollisionWarnings,
    ...academicWarnings,
    ...shapeWarnings,
    ...schemaDriftWarnings
  ]
"""
src = replace_once(src, old, new, "wire:specToDrawioXml")

# --- (g) validateXml: floating edges, arrow shapes, white text boxes ---
old = """export function validateXml(xml) {
  const errors = []

  if (typeof xml !== 'string' || xml.trim() === '') {
    return { valid: false, errors: ['XML must be a non-empty string'] }
  }
"""
new = """export function validateXml(xml) {
  const errors = []
  const warnings = []

  if (typeof xml !== 'string' || xml.trim() === '') {
    return { valid: false, errors: ['XML must be a non-empty string'], warnings: [] }
  }
"""
src = replace_once(src, old, new, "g1:warnings-init")

old = """    if (srcMatch && !vertexIds.has(srcMatch[1])) {
      errors.push(`Edge "${edgeId}" references nonexistent source ID: "${srcMatch[1]}"`)
    }
    if (tgtMatch && !vertexIds.has(tgtMatch[1])) {
      errors.push(`Edge "${edgeId}" references nonexistent target ID: "${tgtMatch[1]}"`)
    }
  }
"""
new = """    if (!srcMatch || !tgtMatch) {
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
"""
src = replace_once(src, old, new, "g2:floating-edges")

old = """  errors.push(...collectFullPageImageErrors(xml))

  return { valid: errors.length === 0, errors }
}
"""
new = """  // Arrow-look-alike vertices and opaque plain text boxes
  const cellTagPattern = /<mxCell\\s[^>]*>/g
  while ((match = cellTagPattern.exec(xml)) !== null) {
    const tag = match[0]
    if (!/\\bvertex="1"/.test(tag)) continue
    const styleMatch = /\\bstyle="([^"]*)"/.exec(tag)
    if (!styleMatch) continue
    const style = styleMatch[1]
    const idMatch = /\\bid="([^"]+)"/.exec(tag)
    const cellId = idMatch ? idMatch[1] : '(unknown)'

    const arrowShape = /(?:^|;)shape=(singleArrow|doubleArrow|triangle|mxgraph\\.arrows2\\.[^;"]*)/.exec(style)
    if (arrowShape) {
      warnings.push(
        `Cell "${cellId}" uses arrow shape "${arrowShape[1]}" as a connector look-alike. ` +
          'Connect modules with a native bound edge (endArrow=block;endFill=1) instead of standalone arrow shapes.'
      )
    }

    if (/^text;/.test(style) && /fillColor=(#fff(fff)?|white)\\b/i.test(style)) {
      warnings.push(
        `Cell "${cellId}" is a plain text box with a white background. ` +
          'Plain text boxes must stay transparent: fillColor=none;strokeColor=none;labelBackgroundColor=none.'
      )
    }
  }

  errors.push(...collectFullPageImageErrors(xml))

  return { valid: errors.length === 0, errors, warnings }
}
"""
src = replace_once(src, old, new, "g3:xml-scan")

io.open(path, "w", encoding="utf-8", newline="\n").write(src)

# --- (h) cli.js prints XML warnings; --strict fails on them ---
cli_path = "skills/drawio/scripts/cli.js"
cli = io.open(cli_path, encoding="utf-8").read()
old = """if (doValidate && !exportSpec) {
  const result = validateXml(xml)
  if (result.valid) {
    console.error('XML validation: PASSED (no errors)')
  } else {
"""
new = """if (doValidate && !exportSpec) {
  const result = validateXml(xml)
  if (result.warnings?.length) {
    console.error(`XML validation warnings (${result.warnings.length}):`)
    for (const w of result.warnings) {
      console.error(`  - ${w}`)
    }
    if (strict) {
      console.error('XML validation: FAILED (--strict treats warnings as errors)')
      process.exit(1)
    }
  }
  if (result.valid) {
    console.error('XML validation: PASSED (no errors)')
  } else {
"""
cli = replace_once(cli, old, new, "h:cli-warnings")
io.open(cli_path, "w", encoding="utf-8", newline="\n").write(cli)

print("patch3 applied OK")

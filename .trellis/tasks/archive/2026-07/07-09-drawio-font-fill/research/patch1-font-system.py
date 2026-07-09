# -*- coding: utf-8 -*-
# Patch 1: font system (A/B/C code changes) for spec-to-drawio.js + auto-layout.js
import io

path = "skills/drawio/scripts/dsl/spec-to-drawio.js"
src = io.open(path, encoding="utf-8", newline="").read()


def rep(old, new, count=1):
    global src
    found = src.count(old)
    assert found == count, "expected %d occurrence(s), found %d: %r" % (
        count,
        found,
        old[:90],
    )
    src = src.replace(old, new)


# ---------- A: unified font policy ----------
rep(
    """function getDefaultFontPolicy(spec) {
  if (resolveProfile(spec) === 'academic-paper') {
    return {
      primary: 'Times New Roman',
      cjk: 'Simsun',
      formula: 'Times New Roman'
    }
  }

  return {
    primary: 'Times New Roman',
    cjk: 'Times New Roman',
    formula: 'Times New Roman'
  }
}""",
    """// Latin glyphs resolve from Times New Roman and CJK glyphs fall through to
// SimSun (per-glyph CSS fallback), matching the thesis convention of Times New
// Roman for Western text and SimSun for Chinese text inside one label.
function getDefaultFontPolicy() {
  return {
    primary: 'Times New Roman',
    cjk: 'Times New Roman,SimSun',
    formula: 'Times New Roman'
  }
}""",
)

rep(
    "safeStyleText(getDefaultFontPolicy(spec)[bucket], 'Times New Roman')",
    "safeStyleText(getDefaultFontPolicy()[bucket], 'Times New Roman')",
)

# ---------- B1: font ladder constants ----------
rep(
    """const SIZE_PRESETS = {""",
    """// Font-size ladder: create-flow defaults per text class. Labels should fill
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

const SIZE_PRESETS = {""",
)

rep("      fontSize: { md: 13, sm: 11 }", "      fontSize: { md: 20, sm: 18 }")
rep(
    """        fontColor: '#1E293B',
        fontSize: 13,
        rounded: 8""",
    """        fontColor: '#1E293B',
        fontSize: 20,
        rounded: 8""",
)

rep(
    "  const fontSize = node.style?.fontSize ?? nodeTheme.fontSize ?? defaultTheme.fontSize ?? 13",
    "  const fontSize = node.style?.fontSize ?? nodeTheme.fontSize ?? defaultTheme.fontSize ?? FONT_LADDER.node",
)
rep(
    "  const fontSize = moduleTheme.labelFontSize ?? 14",
    "  const fontSize = moduleTheme.labelFontSize ?? FONT_LADDER.moduleTitle",
)
rep(
    "measureLabelExtent(label, edge.style?.fontSize ?? 11, 2)",
    "measureLabelExtent(label, resolveEdgeLabelFontSize(edge), 2)",
    count=2,
)
rep(
    "      const labelFontSize = edge.style?.fontSize || 11",
    "      const labelFontSize = resolveEdgeLabelFontSize(edge)",
)
rep(
    "function estimateTextSize(label, fontSize = 13) {",
    "function estimateTextSize(label, fontSize = FONT_LADDER.text) {",
)
rep(
    "function measureLabelExtent(label, fontSize = 13, padding = 8) {",
    "function measureLabelExtent(label, fontSize = FONT_LADDER.text, padding = 8) {",
)
rep(
    "      const fontSize = node.style?.fontSize ?? 13",
    "      const fontSize = node.style?.fontSize ?? FONT_LADDER.text",
)

rep(
    """function formatNetworkEdgeLabel(edge) {""",
    """function resolveEdgeLabelFontSize(edge) {
  return edge.style?.fontSize ?? FONT_LADDER.edgeLabel
}

function formatNetworkEdgeLabel(edge) {""",
)

# ---------- B2: content-aware getNodeSize ----------
rep(
    """export function getNodeSize(size, nodeType = null, label = null) {
  // If explicit size is provided and valid, use it
  if (size && SIZE_PRESETS[size]) {
    return SIZE_PRESETS[size]
  }
  // Text nodes without an explicit size fit their content so the box stays just
  // wider than the text and remains easy to select, move, and transform.
  if (nodeType === 'text' && label) {
    return estimateTextSize(label)
  }
  // If node type has a default size, use it
  if (nodeType && TYPE_DEFAULT_SIZES[nodeType]) {
    return SIZE_PRESETS[TYPE_DEFAULT_SIZES[nodeType]]
  }
  // Fallback to medium
  return SIZE_PRESETS.medium
}""",
    """export function getNodeSize(size, nodeType = null, label = null, options = null) {
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
  if (options?.contentAware && label && nodeType !== 'text' && !CONTENT_SIZE_EXEMPT_TYPES.has(nodeType)) {
    const extent = measureLabelExtent(label, options.fontSize ?? FONT_LADDER.node, 0)
    return {
      width: Math.max(preset.width, extent.width + 28),
      height: Math.max(preset.height, extent.height + 20)
    }
  }

  return preset
}""",
)

# ---------- B2: layout call sites ----------
rep(
    """  const nodes = spec.nodes || []
  const modules = spec.modules || []
  const positions = new Map()""",
    """  const nodes = spec.nodes || []
  const modules = spec.modules || []
  const positions = new Map()

  const sizeOptions = (node) => ({
    fontSize: node.style?.fontSize,
    contentAware: !(node.icon || deriveNodeIcon(node))
  })""",
)

rep(
    "getNodeSize(node.size, semanticType, node.label)",
    "getNodeSize(node.size, semanticType, node.label, sizeOptions(node))",
    count=6,
)

# ---------- C1: print targets ----------
rep(
    """const IEEE_SINGLE_COLUMN_PT = 252
const ACADEMIC_CANVAS_REVIEW_WIDTH = 1500""",
    """// Print-width targets for the paper-readability gate: `effective pt` =
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
}""",
)

rep(
    """  if (canvasWidth == null || canvasWidth <= ACADEMIC_CANVAS_REVIEW_WIDTH) return []

  let minFontSize = Infinity
  for (const node of spec.nodes || []) {
    const fontSize = node.style?.fontSize
    if (typeof fontSize === 'number') minFontSize = Math.min(minFontSize, fontSize)
  }
  if (!Number.isFinite(minFontSize)) minFontSize = 11

  const effectivePt = (minFontSize * IEEE_SINGLE_COLUMN_PT) / canvasWidth
  if (effectivePt >= 8) return []

  const requiredFontSize = Math.ceil(canvasWidth / (IEEE_SINGLE_COLUMN_PT / 8))
  return [
    `Academic figure canvas is ${canvasWidth}px wide. Scaled to IEEE single-column width (3.5in = 252pt), the smallest label font (${minFontSize}px) prints at ~${effectivePt.toFixed(1)}pt (fontSize x 252 / canvas width), below the 8pt floor. Raise label fontSize to >= ${requiredFontSize}, narrow the canvas, target a double-column figure (7.16in = 516pt), or split the figure.`
  ]""",
    """  const print = spec.meta?.print
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
  ]""",
)

# ---------- C1: drop the misleading 8-10 gate ----------
rep(
    """  const smallFonts = []
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
    warnings.push(
      `Academic-paper profile expects 8-10pt labels. Out-of-range overrides found on ${smallFonts.join(', ')}.`
    )
  }

""",
    "",
)

# ---------- C1: meta.print recognized + validated ----------
rep(
    """  'canvas',
  'font',""",
    """  'canvas',
  'font',
  'print',""",
)

rep(
    """  if (spec.meta?.replication != null) {""",
    """  if (spec.meta?.print != null) {
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
  if (spec.meta?.replication != null) {""",
)

# ---------- B3 + C2: font plan, shrink, label-fit validator ----------
rep(
    """export function specToDrawioXml(spec, options = {}) {""",
    """/**
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

/** Largest font size whose estimated label extent stays inside bounds. */
function maxFontSizeForBounds(label, bounds) {
  const lines = String(label).split(/\\n|<br\\s*\\/?>/i)
  let maxUnits = 0
  for (const line of lines) {
    let units = 0
    for (const ch of line) {
      units += /[\\u3000-\\u9fff\\uff00-\\uffef]/.test(ch) ? 1.05 : 0.6
    }
    maxUnits = Math.max(maxUnits, units)
  }
  const widthFit = maxUnits > 0 ? (bounds.width - 8) / maxUnits : Infinity
  const heightFit = (bounds.height - 8) / (lines.length * 1.4)
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
    const bounds = normalizeNodeBounds(node)
    if (!bounds) continue
    const fontSize = node.style?.fontSize ?? FONT_LADDER.node
    const extent = measureLabelExtent(node.label, fontSize, 8)
    if (extent.width > bounds.width || extent.height > bounds.height) {
      warnings.push(
        `Node "${node.id}" label needs ~${extent.width}x${extent.height}px at fontSize ${fontSize} but bounds are ` +
          `${bounds.width}x${bounds.height}. Widen the box, shorten the label, or lower style.fontSize.`
      )
    }
  }
  return warnings
}

export function specToDrawioXml(spec, options = {}) {""",
)

# ---------- orchestration ----------
rep(
    """  const themeName = spec.meta?.theme || 'tech-blue'
  const theme = options.theme || loadTheme(themeName)
  const layout = calculateLayout(spec, theme)""",
    """  const themeName = spec.meta?.theme || 'tech-blue'
  const theme = options.theme || loadTheme(themeName)

  // Materialize font sizes on an internal clone (author YAML stays untouched)
  // and shrink classes whose explicit-bounds boxes cannot hold the ladder, so
  // layout sizes boxes with the final per-class font.
  const { planned, autoNodes } = planFontSizes(spec, theme)
  spec = planned
  shrinkFontsToBounds(spec, autoNodes)
  const layout = calculateLayout(spec, theme)""",
)

rep(
    """  const textNodeWarnings = validateTextNodeStyles(spec)""",
    """  const textNodeWarnings = validateTextNodeStyles(spec)
  const labelFitWarnings = validateLabelFit(spec)""",
)

rep(
    """    ...textNodeWarnings,""",
    """    ...textNodeWarnings,
    ...labelFitWarnings,""",
)

rep(
    "  const layout = options.layout || calculateLayout(spec, theme)",
    "  const layout = options.layout || calculateLayout(planFontSizes(spec, theme).planned, theme)",
)

io.open(path, "w", encoding="utf-8", newline="").write(src)
print("spec-to-drawio.js patched OK")

# ---------- auto-layout.js ----------
path2 = "skills/drawio/scripts/dsl/auto-layout.js"
src2 = io.open(path2, encoding="utf-8", newline="").read()

old_import = "import { detectSemanticType, getNodeSize } from './spec-to-drawio.js'"
assert src2.count(old_import) == 1
src2 = src2.replace(
    old_import,
    "import { detectSemanticType, deriveNodeIcon, getNodeSize } from './spec-to-drawio.js'",
)

old_call = "const size = getNodeSize(node.size, semanticType, node.label)"
assert src2.count(old_call) == 1, src2.count(old_call)
src2 = src2.replace(
    old_call,
    """const size = getNodeSize(node.size, semanticType, node.label, {
      fontSize: node.style?.fontSize,
      contentAware: !(node.icon || deriveNodeIcon(node))
    })""",
)

io.open(path2, "w", encoding="utf-8", newline="").write(src2)
print("auto-layout.js patched OK")

import { readFileSync } from 'node:fs'

import {
  mapPostprocessPages,
  normalizePostprocessInput,
  selectPostprocessPages,
  toPostprocessOutput
} from './input.js'

const RESTYLE_TOKEN_SETS = {
  node: new Set(['fillColor', 'strokeColor', 'fontColor', 'fontFamily', 'fontSize', 'strokeWidth', 'opacity', 'dashed', 'rounded']),
  module: new Set(['fillColor', 'strokeColor', 'fontColor', 'fontFamily', 'fontSize', 'strokeWidth', 'opacity', 'dashed', 'rounded']),
  edge: new Set([
    'strokeColor',
    'fontColor',
    'fontFamily',
    'fontSize',
    'strokeWidth',
    'opacity',
    'dashed',
    'rounded',
    'endArrow',
    'endFill',
    'startArrow',
    'startFill'
  ])
}
const COLOR_TOKENS = new Set(['fillColor', 'strokeColor', 'fontColor'])
const BOOLEAN_TOKENS = new Set(['dashed', 'rounded', 'endFill', 'startFill'])
const ARROWS = new Set(['classic', 'block', 'open', 'none', 'oval', 'diamond'])
const HEATMAP_PALETTES = {
  blue: ['#EFF3FF', '#BDD7E7', '#6BAED6', '#3182BD', '#08519C'],
  heat: ['#FFF7EC', '#FDD49E', '#FC8D59', '#D7301F', '#7F0000'],
  viridis: ['#440154', '#3B528B', '#21918C', '#5EC962', '#FDE725']
}

function validateRestyleToken(kind, key, value) {
  if (!RESTYLE_TOKEN_SETS[kind].has(key)) throw new Error(`unsupported restyle token "${key}" for ${kind}`)
  if (COLOR_TOKENS.has(key) && !(typeof value === 'string' && (/^#[0-9A-Fa-f]{6}$/.test(value) || value === 'none'))) {
    throw new Error(`restyle ${kind}.${key} must be a six-digit hex color or none`)
  }
  if (key === 'fontFamily' && !(typeof value === 'string' && /^[^;<>'"\r\n]{1,120}$/.test(value))) {
    throw new Error(`restyle ${kind}.fontFamily must be a safe font-family string`)
  }
  if (key === 'fontSize' && !(Number.isFinite(value) && value >= 8 && value <= 48)) {
    throw new Error(`restyle ${kind}.fontSize must be between 8 and 48`)
  }
  if (key === 'strokeWidth' && !(Number.isFinite(value) && value >= 0.5 && value <= 6)) {
    throw new Error(`restyle ${kind}.strokeWidth must be between 0.5 and 6`)
  }
  if (key === 'opacity' && !(Number.isFinite(value) && value >= 0 && value <= 100)) {
    throw new Error(`restyle ${kind}.opacity must be between 0 and 100`)
  }
  if (BOOLEAN_TOKENS.has(key) && typeof value !== 'boolean') {
    throw new Error(`restyle ${kind}.${key} must be a boolean`)
  }
  if ((key === 'endArrow' || key === 'startArrow') && !ARROWS.has(value)) {
    throw new Error(`restyle ${kind}.${key} must be a supported arrow name`)
  }
}

function validateStyleGroup(kind, value = {}) {
  if (!isRecord(value)) throw new Error(`restyle ${kind} must be an object`)
  const style = {}
  for (const [key, fieldValue] of Object.entries(value)) {
    validateRestyleToken(kind, key, fieldValue)
    style[key] = fieldValue
  }
  return style
}

function parsePresetStyleString(text, allowedKeys, context) {
  if (typeof text !== 'string') throw new Error(`${context} must be a string`)
  const result = {}
  for (const token of text.split(';').filter(Boolean)) {
    const separator = token.indexOf('=')
    if (separator <= 0) throw new Error(`${context} contains an invalid style token`)
    const key = token.slice(0, separator)
    const value = token.slice(separator + 1)
    if (!allowedKeys.has(key)) throw new Error(`${context} contains unsupported token "${key}"`)
    result[key] = value
  }
  return result
}

function validatePresetShapeText(shapes) {
  if (!isRecord(shapes)) throw new Error('restyle preset shapes must be an object')
  for (const [key, value] of Object.entries(shapes)) {
    if (typeof value !== 'string' || /javascript:|data:|image=|<script|on[a-z]+\s*=/i.test(value)) {
      throw new Error(`restyle preset shape "${key}" contains unsafe text`)
    }
  }
}

function loadBundledRestylePreset(name) {
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(name)) throw new Error(`invalid bundled restyle preset name "${name}"`)
  try {
    return JSON.parse(readFileSync(new URL(`../../styles/built-in/${name}.json`, import.meta.url), 'utf8'))
  } catch (error) {
    throw new Error(`could not load bundled restyle preset "${name}": ${error.message}`)
  }
}

function normalizeSchemaPreset(preset) {
  const allowedTopLevel = new Set([
    '$schema', 'name', 'version', 'default', 'source', 'confidence', 'palette', 'roles', 'shapes', 'font', 'edges', 'extras'
  ])
  const unknown = Object.keys(preset).find((key) => !allowedTopLevel.has(key))
  if (unknown) throw new Error(`restyle preset has unsupported field "${unknown}"`)
  if (preset.version !== 1) throw new Error('restyle preset version must be 1')
  if (!isRecord(preset.palette) || !isRecord(preset.roles) || !isRecord(preset.font) || !isRecord(preset.edges)) {
    throw new Error('restyle preset requires palette, roles, font, and edges objects')
  }
  validatePresetShapeText(preset.shapes || {})

  const palette = {}
  for (const [slot, pair] of Object.entries(preset.palette)) {
    if (!isRecord(pair)) throw new Error(`restyle preset palette.${slot} must be a color pair`)
    palette[slot] = validateStyleGroup('node', {
      fillColor: pair.fillColor,
      strokeColor: pair.strokeColor
    })
  }
  for (const [role, slot] of Object.entries(preset.roles)) {
    if (!palette[slot]) throw new Error(`restyle preset role "${role}" references unknown palette slot "${slot}"`)
  }
  const fontFamily = preset.font.fontFamily
  const fontSize = preset.font.fontSize
  validateRestyleToken('node', 'fontFamily', fontFamily)
  validateRestyleToken('node', 'fontSize', fontSize)
  const strokeWidth = preset.extras?.globalStrokeWidth ?? 1
  validateRestyleToken('node', 'strokeWidth', strokeWidth)

  const edgeTokens = parsePresetStyleString(
    preset.edges.style,
    new Set(['edgeStyle', 'rounded', 'orthogonalLoop', 'jettySize', 'html', 'curved']),
    'restyle preset edges.style'
  )
  const arrowTokens = parsePresetStyleString(
    preset.edges.arrow,
    new Set(['endArrow', 'endFill', 'startArrow', 'startFill']),
    'restyle preset edges.arrow'
  )
  const edgeStyle = {
    strokeColor: palette.primary?.strokeColor || '#666666',
    fontFamily,
    fontSize,
    strokeWidth,
    rounded: edgeTokens.rounded === '1',
    ...(arrowTokens.endArrow ? { endArrow: arrowTokens.endArrow } : {}),
    ...(arrowTokens.endFill ? { endFill: arrowTokens.endFill === '1' } : {}),
    ...(arrowTokens.startArrow ? { startArrow: arrowTokens.startArrow } : {}),
    ...(arrowTokens.startFill ? { startFill: arrowTokens.startFill === '1' } : {})
  }
  validateStyleGroup('edge', edgeStyle)
  const dashedFor = Array.isArray(preset.edges.dashedFor) ? new Set(preset.edges.dashedFor) : new Set()

  return {
    name: preset.name || 'user-preset',
    nodeStyle(node) {
      const slot = preset.roles[node.type || 'service'] || preset.roles.service || 'primary'
      return validateStyleGroup('node', { ...palette[slot], fontFamily, fontSize, strokeWidth })
    },
    moduleStyle: validateStyleGroup('module', {
      ...(palette.neutral || palette.primary),
      fontFamily,
      fontSize: preset.font.titleFontSize || fontSize,
      strokeWidth
    }),
    edgeStyle(edge) {
      return validateStyleGroup('edge', { ...edgeStyle, ...(dashedFor.has(edge.type) ? { dashed: true } : {}) })
    }
  }
}

export function normalizeRestylePreset(value) {
  const preset = typeof value === 'string' ? loadBundledRestylePreset(value) : value
  if (!isRecord(preset)) throw new TypeError('restyle preset must be a bundled name or an object')
  const directFields = new Set(['node', 'module', 'edge'])
  if (Object.keys(preset).some((key) => directFields.has(key))) {
    const unknown = Object.keys(preset).find((key) => !directFields.has(key) && !['name', 'version'].includes(key))
    if (unknown) throw new Error(`restyle preset has unsupported field "${unknown}"`)
    const node = validateStyleGroup('node', preset.node || {})
    const module = validateStyleGroup('module', preset.module || {})
    const edge = validateStyleGroup('edge', preset.edge || {})
    return { name: 'user-preset', nodeStyle: () => node, moduleStyle: module, edgeStyle: () => edge }
  }
  return normalizeSchemaPreset(preset)
}

export function applyRestyle(value, preset, options = {}) {
  const normalizedPreset = normalizeRestylePreset(preset)
  const document = normalizePostprocessInput(value)
  const mapped = mapPostprocessPages(
    document,
    (page) => ({
      ...page,
      nodes: page.nodes.map((node) => ({
        ...node,
        style: { ...(node.style || {}), ...normalizedPreset.nodeStyle(node) }
      })),
      modules: page.modules.map((module) => ({
        ...module,
        style: { ...(module.style || {}), ...normalizedPreset.moduleStyle }
      })),
      edges: page.edges.map((edge) => ({
        ...edge,
        style: { ...(edge.style || {}), ...normalizedPreset.edgeStyle(edge) }
      }))
    }),
    {
      page: options.page,
      allPages: options.page == null ? options.allPages !== false : options.allPages
    }
  )
  const output = toPostprocessOutput(mapped)
  if (!options.returnDiagnostics) return output
  return {
    value: output,
    diagnostics: {
      preset: normalizedPreset.name,
      pages: mapped.pages.map((page) => page.id)
    }
  }
}

function parseCsvRows(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"'
        index++
      } else if (char === '"') {
        quoted = false
      } else {
        field += char
      }
      continue
    }
    if (char === '"' && field === '') {
      quoted = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''))
      if (row.some((value) => value !== '')) rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }
  if (quoted) throw new Error('heatmap CSV contains an unterminated quoted field')
  row.push(field.replace(/\r$/, ''))
  if (row.some((value) => value !== '')) rows.push(row)
  return rows
}

function csvMetrics(text) {
  const rows = parseCsvRows(text)
  if (rows.length === 0) return []
  const headers = rows[0].map((header) => header.trim())
  if (!headers.includes('value')) throw new Error('heatmap CSV requires a value column')
  const knownHeaders = new Set(['key', 'pageId', 'objectId', 'identityScheme', 'identityKey', 'label', 'value'])
  const unknown = headers.find((header) => !knownHeaders.has(header))
  if (unknown) throw new Error(`heatmap CSV has unknown column "${unknown}"`)
  return rows.slice(1).map((values, index) => {
    if (values.length !== headers.length) throw new Error(`heatmap CSV row ${index + 2} has the wrong number of columns`)
    const entry = Object.fromEntries(headers.map((header, column) => [header, values[column]]))
    return entry
  })
}

function finiteMetricValue(value, key) {
  if (typeof value === 'string' && !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(value.trim())) {
    throw new Error(`heatmap metric "${key}" requires a finite numeric value`)
  }
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number)) throw new Error(`heatmap metric "${key}" requires a finite numeric value`)
  return number
}

function metricKey(entry, index) {
  if (typeof entry.key === 'string' && entry.key !== '') return entry.key
  if (typeof entry.pageId === 'string' && typeof entry.objectId === 'string') return `${entry.pageId}/${entry.objectId}`
  if (isRecord(entry.identity)) return `${entry.identity.scheme}:${entry.identity.key}`
  if (typeof entry.identityScheme === 'string' && typeof entry.identityKey === 'string') {
    return `${entry.identityScheme}:${entry.identityKey}`
  }
  if (typeof entry.label === 'string' && entry.label !== '') return entry.label
  throw new Error(`heatmap metric entry ${index} requires key, pageId/objectId, identity, or label`)
}

export function parseHeatmapMetrics(value) {
  let source = value
  if (typeof source === 'string') {
    const trimmed = source.trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        source = JSON.parse(trimmed)
      } catch (error) {
        throw new Error(`failed to parse heatmap JSON: ${error.message}`)
      }
    } else {
      source = csvMetrics(source)
    }
  }

  const entries = Array.isArray(source)
    ? source
    : isRecord(source)
      ? Object.entries(source).map(([key, metricValue]) => ({ key, value: metricValue }))
      : null
  if (!entries) throw new TypeError('heatmap metrics must be JSON, CSV, an object, or an array')

  const result = []
  const seen = new Set()
  for (const [index, raw] of entries.entries()) {
    if (!isRecord(raw)) throw new Error(`heatmap metric entry ${index} must be an object`)
    const key = metricKey(raw, index)
    if (key.length > 512 || /[\u0000-\u001f\u007f]/.test(key)) throw new Error(`heatmap metric key "${key}" is unsafe`)
    if (seen.has(key)) throw new Error(`duplicate heatmap metric key "${key}"`)
    seen.add(key)
    result.push({ key, value: finiteMetricValue(raw.value, key) })
  }
  return result
}

function resolveHeatmapPalette(value = 'blue') {
  if (Array.isArray(value)) {
    if (value.length < 2 || value.length > 9 || value.some((color) => !/^#[0-9A-Fa-f]{6}$/.test(color))) {
      throw new Error('custom heatmap palette must contain 2 to 9 six-digit hex colors')
    }
    return { name: 'custom', colors: value.slice() }
  }
  if (!HEATMAP_PALETTES[value]) throw new Error(`unknown heatmap palette "${value}"`)
  return { name: value, colors: HEATMAP_PALETTES[value] }
}

function resolveSizeScale(value) {
  if (value == null) return null
  if (!isRecord(value) || !Number.isFinite(value.min) || !Number.isFinite(value.max)) {
    throw new Error('heatmap sizeScale must contain finite min and max values')
  }
  if (value.min < 0.5 || value.min > 1 || value.max < 1 || value.max > 2 || value.min > value.max) {
    throw new Error('heatmap sizeScale must stay in the bounded range min 0.5..1 and max 1..2')
  }
  return { min: value.min, max: value.max }
}

function roundMetricNumber(value) {
  return Math.round(value * 1000) / 1000
}

function scaleBounds(bounds, scale) {
  const width = roundMetricNumber(bounds.width * scale)
  const height = roundMetricNumber(bounds.height * scale)
  return {
    x: roundMetricNumber(bounds.x + (bounds.width - width) / 2),
    y: roundMetricNumber(bounds.y + (bounds.height - height) / 2),
    width,
    height
  }
}

function assignHeatmapMetrics(document, pages, metrics, labelFallback) {
  const pageIds = new Set(pages.map((page) => page.id))
  const records = collectAddresses(document, pageIds)
  const metricMap = new Map(metrics.map((entry) => [entry.key, entry.value]))
  const used = new Set()
  const assignments = new Map()

  for (const record of records) {
    const candidates = []
    if (record.object.identity?.scheme && record.object.identity?.key) {
      candidates.push(`${record.object.identity.scheme}:${record.object.identity.key}`)
    }
    candidates.push(record.key)
    if (document.kind === 'legacy-single-page') candidates.push(record.object.id)
    const key = candidates.find((candidate) => metricMap.has(candidate))
    if (key) {
      assignments.set(record.key, { key, value: metricMap.get(key), kind: record.kind })
      used.add(key)
    }
  }

  if (labelFallback) {
    const byLabel = new Map()
    for (const record of records) {
      const label = record.object.label
      if (typeof label !== 'string') continue
      const matches = byLabel.get(label) || []
      matches.push(record)
      byLabel.set(label, matches)
    }
    for (const metric of metrics) {
      if (used.has(metric.key) || !byLabel.has(metric.key)) continue
      const matches = byLabel.get(metric.key)
      if (matches.length !== 1) throw new Error(`heatmap label "${metric.key}" is ambiguous; use stable identity or pageId/objectId`)
      const record = matches[0]
      if (!assignments.has(record.key)) {
        assignments.set(record.key, { key: metric.key, value: metric.value, kind: record.kind })
        used.add(metric.key)
      }
    }
  }
  return { assignments, used }
}

export function applyHeatmap(value, metricsValue, options = {}) {
  const document = normalizePostprocessInput(value)
  const selected = selectPostprocessPages(document, {
    page: options.page,
    allPages: options.page == null ? options.allPages !== false : options.allPages
  })
  const metrics = parseHeatmapMetrics(metricsValue)
  const palette = resolveHeatmapPalette(options.palette)
  const sizeScale = resolveSizeScale(options.sizeScale)
  const { assignments, used } = assignHeatmapMetrics(document, selected.pages, metrics, options.labelFallback === true)
  const values = [...assignments.values()].map((entry) => entry.value)
  const min = options.min == null ? (values.length ? Math.min(...values) : 0) : finiteMetricValue(options.min, 'min')
  const max = options.max == null ? (values.length ? Math.max(...values) : 1) : finiteMetricValue(options.max, 'max')
  if (min > max) throw new Error('heatmap min must not exceed max')

  const metricStyle = (pageId, object, kind) => {
    const assignment = assignments.get(`${pageId}/${object.id}`)
    if (!assignment) return object
    const ratio = min === max ? 0.5 : Math.max(0, Math.min(1, (assignment.value - min) / (max - min)))
    const color = palette.colors[Math.round(ratio * (palette.colors.length - 1))]
    const styleField = kind === 'edge' ? 'strokeColor' : 'fillColor'
    const transformed = { ...object, style: { ...(object.style || {}), [styleField]: color } }
    if (sizeScale && kind !== 'edge') {
      const scale = sizeScale.min + ratio * (sizeScale.max - sizeScale.min)
      if (object.bounds) transformed.bounds = scaleBounds(object.bounds, scale)
      else transformed.size = ratio < 1 / 3 ? 'small' : ratio < 2 / 3 ? 'medium' : 'large'
    }
    return transformed
  }

  const mapped = mapPostprocessPages(
    document,
    (page) => ({
      ...page,
      nodes: page.nodes.map((node) => metricStyle(page.id, node, 'node')),
      modules: page.modules.map((module) => metricStyle(page.id, module, 'module')),
      edges: page.edges.map((edge) => metricStyle(page.id, edge, 'edge'))
    }),
    {
      page: options.page,
      allPages: options.page == null ? options.allPages !== false : options.allPages
    }
  )
  const output = toPostprocessOutput(mapped)
  if (!options.returnDiagnostics) return output
  return {
    value: output,
    diagnostics: {
      matched: [...assignments.keys()],
      unmatched: metrics.filter((entry) => !used.has(entry.key)).map((entry) => entry.key),
      range: { min, max },
      palette: palette.name
    }
  }
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function objectEntries(page) {
  return [
    ...(page.nodes || []).map((object, index) => ({ kind: 'node', object, index })),
    ...(page.modules || []).map((object, index) => ({ kind: 'module', object, index })),
    ...(page.edges || []).map((object, index) => ({ kind: 'edge', object, index }))
  ]
}

function collectAddresses(document, pageIds) {
  const records = []
  for (const page of document.pages) {
    if (!pageIds.has(page.id)) continue
    for (const entry of objectEntries(page)) {
      records.push({ key: `${page.id}/${entry.object.id}`, ...entry, pageId: page.id })
    }
  }
  return records
}

function normalizeRelabelMap(labelMap) {
  const source = isRecord(labelMap) && isRecord(labelMap.labels) ? labelMap.labels : labelMap
  const entries = []
  if (Array.isArray(source)) {
    for (const [index, entry] of source.entries()) {
      if (!isRecord(entry) || typeof entry.pageId !== 'string' || typeof entry.objectId !== 'string') {
        throw new Error(`relabel map entry ${index} must contain pageId, objectId, and label`)
      }
      entries.push({ key: `${entry.pageId}/${entry.objectId}`, label: entry.label })
    }
  } else if (isRecord(source)) {
    for (const [key, value] of Object.entries(source)) {
      entries.push({ key, label: isRecord(value) ? value.label : value })
    }
  } else {
    throw new TypeError('relabel map must be an object or an array')
  }

  const map = new Map()
  for (const entry of entries) {
    if (map.has(entry.key)) throw new Error(`duplicate relabel map key "${entry.key}"`)
    if (typeof entry.label !== 'string') throw new Error(`relabel map key "${entry.key}" requires a string label`)
    map.set(entry.key, entry.label)
  }
  return map
}

function resolveRelabelKey(key, records, document) {
  if (key.includes('/')) return key
  const matches = records.filter((record) => record.object.id === key)
  if (matches.length === 1) return matches[0].key
  if (matches.length > 1) throw new Error(`relabel map key "${key}" is ambiguous; use pageId/objectId`)
  return document.kind === 'legacy-single-page' ? `page-1/${key}` : key
}

function diagnosticsFor(map, records) {
  const recordByKey = new Map(records.map((record) => [record.key, record]))
  const missing = []
  const matched = []
  for (const key of map.keys()) {
    if (recordByKey.has(key)) matched.push(key)
    else missing.push(key)
  }
  return { recordByKey, matched, missing }
}

export function applyRelabel(value, labelMap, options = {}) {
  const document = normalizePostprocessInput(value)
  const { page, allPages } = options
  const selectedPageIds = new Set(
    selectPostprocessPages(document, {
      page,
      allPages: page == null ? allPages !== false : allPages
    }).pages.map((selected) => selected.id)
  )
  const records = collectAddresses(document, selectedPageIds)
  const rawMap = normalizeRelabelMap(labelMap)
  const map = new Map()
  for (const [key, label] of rawMap.entries()) {
    const resolved = resolveRelabelKey(key, records, document)
    if (map.has(resolved)) throw new Error(`duplicate relabel map key "${resolved}"`)
    map.set(resolved, label)
  }
  const { recordByKey, matched, missing } = diagnosticsFor(map, records)
  if (missing.length > 0 && !options.allowMissing) {
    throw new Error(`relabel map key "${missing[0]}" was not found on the selected page(s)`)
  }

  const mapped = mapPostprocessPages(
    document,
    (pageValue) => {
      const update = (object) => {
        const key = `${pageValue.id}/${object.id}`
        if (!map.has(key)) return object
        return { ...object, label: map.get(key) }
      }
      return {
        ...pageValue,
        nodes: pageValue.nodes.map(update),
        modules: pageValue.modules.map(update),
        edges: pageValue.edges.map(update)
      }
    },
    { page: page != null ? page : undefined, allPages: page == null ? allPages !== false : undefined }
  )
  const changed = matched.filter((key) => recordByKey.get(key).object.label !== map.get(key))
  const diagnostics = { matched, missing, changed }
  const valueOut = toPostprocessOutput(mapped)
  return options.returnDiagnostics ? { value: valueOut, diagnostics } : valueOut
}

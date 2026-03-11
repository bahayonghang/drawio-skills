/**
 * Input adapters that normalize Mermaid and CSV sources into the canonical
 * draw.io YAML-spec object shape used by the DSL compiler.
 */

const SUPPORTED_MERMAID_TYPES = new Set([
  'flowchart',
  'graph',
  'sequencediagram',
  'classdiagram',
  'statediagram-v2',
  'statediagram',
  'erdiagram',
  'gantt'
])

function normalizeId(raw, fallback = 'node') {
  const cleaned = String(raw || fallback)
    .trim()
    .replace(/^[^A-Za-z]+/, '')
    .replace(/[^A-Za-z0-9_-]+/g, '_')
  return cleaned || fallback
}

function inferNodeType(label, explicitType = null) {
  if (explicitType) return explicitType
  const lower = String(label || '').toLowerCase()
  if (!lower) return 'service'
  if (lower.includes('start') || lower.includes('end')) return 'terminal'
  if (lower.includes('db') || lower.includes('database') || lower.includes('table')) return 'database'
  if (lower.includes('decision') || lower.includes('approve') || lower.includes('reject')) return 'decision'
  if (lower.includes('user') || lower.includes('actor') || lower.includes('client')) return 'user'
  if (lower.includes('doc') || lower.includes('report') || lower.includes('paper')) return 'document'
  if (lower.includes('queue') || lower.includes('buffer') || lower.includes('stream')) return 'queue'
  if (lower.includes('cloud') || lower.includes('internet')) return 'cloud'
  return 'service'
}

function parseMermaidNodeToken(token) {
  const trimmed = token.trim()
  const match = trimmed.match(/^([A-Za-z0-9_:-]+)\s*(\[[^\]]+\]|\([^)]+\)|\{[^}]+\}|>"[^"]+"|:"[^"]+")?$/)
  if (!match) {
    const id = normalizeId(trimmed)
    return { id, label: trimmed, type: inferNodeType(trimmed) }
  }

  const [, rawId, decoration] = match
  const id = normalizeId(rawId)
  const label = decoration
    ? decoration
      .replace(/^[\[\(\{>:"]+/, '')
      .replace(/[\]\)\}"]+$/, '')
      .trim()
    : rawId

  let type = inferNodeType(label)
  if (decoration?.startsWith('{')) type = 'decision'
  if (decoration?.startsWith('(')) type = 'terminal'
  if (decoration?.startsWith('[')) type = inferNodeType(label)
  return { id, label, type }
}

function pushNode(nodeMap, nodes, node) {
  if (!nodeMap.has(node.id)) {
    nodeMap.set(node.id, node)
    nodes.push(node)
    return
  }

  const current = nodeMap.get(node.id)
  if (current.label === current.id && node.label && node.label !== node.id) {
    current.label = node.label
  }
  if (current.type === 'service' && node.type && node.type !== 'service') {
    current.type = node.type
  }
}

function splitMermaidArrow(line) {
  const cleaned = line
    .replace(/\|[^|]+\|/g, ' ')
    .replace(/--x/g, '-->')
    .replace(/===/g, '-->')
    .replace(/-.->/g, '-->')
    .replace(/---/g, '-->')
  const parts = cleaned.split(/-->|==>|->>|-->>|->|--/).map(part => part.trim()).filter(Boolean)
  return parts
}

function parseFlowchart(text, profile = 'default') {
  const nodes = []
  const edges = []
  const nodeMap = new Map()

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('%%') || /^(graph|flowchart)\b/i.test(line) || /^subgraph\b/i.test(line) || line === 'end') {
      continue
    }
    if (!line.includes('-')) continue

    const parts = splitMermaidArrow(line)
    if (parts.length < 2) continue
    for (let i = 0; i < parts.length - 1; i++) {
      const source = parseMermaidNodeToken(parts[i])
      const target = parseMermaidNodeToken(parts[i + 1])
      pushNode(nodeMap, nodes, source)
      pushNode(nodeMap, nodes, target)
      edges.push({ from: source.id, to: target.id, type: 'primary' })
    }
  }

  return {
    meta: { layout: 'horizontal', profile },
    nodes,
    edges,
    modules: []
  }
}

function parseSequenceDiagram(text, profile = 'default') {
  const nodes = []
  const edges = []
  const nodeMap = new Map()

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || /^sequencediagram$/i.test(line)) continue
    if (/^participant\s+/i.test(line)) {
      const label = line.replace(/^participant\s+/i, '').trim()
      const id = normalizeId(label)
      pushNode(nodeMap, nodes, { id, label, type: 'user' })
      continue
    }

    const message = line.match(/^([A-Za-z0-9_]+)\s*[-.]*>>?\s*([A-Za-z0-9_]+)\s*:\s*(.+)$/)
    if (!message) continue
    const [, rawFrom, rawTo, label] = message
    const from = { id: normalizeId(rawFrom), label: rawFrom, type: 'user' }
    const to = { id: normalizeId(rawTo), label: rawTo, type: 'user' }
    pushNode(nodeMap, nodes, from)
    pushNode(nodeMap, nodes, to)
    edges.push({ from: from.id, to: to.id, type: 'primary', label: label.trim() })
  }

  return {
    meta: { layout: 'horizontal', profile },
    nodes,
    edges,
    modules: []
  }
}

function parseClassDiagram(text, profile = 'default') {
  const nodes = []
  const edges = []
  const nodeMap = new Map()

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || /^classdiagram$/i.test(line) || line === '}') continue
    if (/^class\s+/i.test(line)) {
      const name = line.replace(/^class\s+/i, '').replace(/\s*\{.*/, '').trim()
      const id = normalizeId(name)
      pushNode(nodeMap, nodes, { id, label: name, type: 'service' })
      continue
    }

    const rel = line.match(/^([A-Za-z0-9_]+)\s+([<|o*.\-]+--[<|o*.\-]+|<\|--|--\|>)\s+([A-Za-z0-9_]+)(?:\s*:\s*(.+))?$/)
    if (!rel) continue
    const [, rawFrom, , rawTo, label] = rel
    const from = { id: normalizeId(rawFrom), label: rawFrom, type: 'service' }
    const to = { id: normalizeId(rawTo), label: rawTo, type: 'service' }
    pushNode(nodeMap, nodes, from)
    pushNode(nodeMap, nodes, to)
    edges.push({ from: from.id, to: to.id, type: 'dependency', label: label?.trim() })
  }

  return {
    meta: { layout: 'horizontal', profile },
    nodes,
    edges,
    modules: []
  }
}

function parseStateDiagram(text, profile = 'default') {
  const nodes = []
  const edges = []
  const nodeMap = new Map()

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || /^statediagram/i.test(line)) continue
    const rel = line.match(/^(.+?)\s*-->\s*(.+?)(?:\s*:\s*(.+))?$/)
    if (!rel) continue
    const [, rawFrom, rawTo, label] = rel
    const fromToken = rawFrom === '[*]' ? { id: 'Start', label: 'Start', type: 'terminal' } : parseMermaidNodeToken(rawFrom)
    const toToken = rawTo === '[*]' ? { id: 'End', label: 'End', type: 'terminal' } : parseMermaidNodeToken(rawTo)
    pushNode(nodeMap, nodes, fromToken)
    pushNode(nodeMap, nodes, toToken)
    edges.push({ from: fromToken.id, to: toToken.id, type: 'primary', label: label?.trim() })
  }

  return {
    meta: { layout: 'vertical', profile },
    nodes,
    edges,
    modules: []
  }
}

function parseErDiagram(text, profile = 'default') {
  const nodes = []
  const edges = []
  const nodeMap = new Map()

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || /^erdiagram$/i.test(line) || line === '}') continue
    if (/^[A-Z0-9_]+\s*\{$/.test(line)) {
      const entity = line.replace('{', '').trim()
      const id = normalizeId(entity)
      pushNode(nodeMap, nodes, { id, label: entity, type: 'database' })
      continue
    }

    const rel = line.match(/^([A-Z0-9_]+)\s+.+\s+([A-Z0-9_]+)\s*:\s*(.+)$/)
    if (!rel) continue
    const [, rawFrom, rawTo, label] = rel
    const from = { id: normalizeId(rawFrom), label: rawFrom, type: 'database' }
    const to = { id: normalizeId(rawTo), label: rawTo, type: 'database' }
    pushNode(nodeMap, nodes, from)
    pushNode(nodeMap, nodes, to)
    edges.push({ from: from.id, to: to.id, type: 'dependency', label: label.trim() })
  }

  return {
    meta: { layout: 'horizontal', profile },
    nodes,
    edges,
    modules: []
  }
}

function parseGantt(text, profile = 'default') {
  const nodes = []
  const edges = []
  let section = null
  let prevTaskId = null

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || /^gantt$/i.test(line) || /^title\s+/i.test(line) || /^dateFormat\s+/i.test(line)) continue
    if (/^section\s+/i.test(line)) {
      section = line.replace(/^section\s+/i, '').trim()
      prevTaskId = null
      continue
    }

    const taskName = line.split(':')[0]?.trim()
    if (!taskName) continue
    const id = normalizeId(taskName)
    nodes.push({ id, label: section ? `${section}: ${taskName}` : taskName, type: 'process' })
    if (prevTaskId) {
      edges.push({ from: prevTaskId, to: id, type: 'primary' })
    }
    prevTaskId = id
  }

  return {
    meta: { layout: 'vertical', profile },
    nodes,
    edges,
    modules: []
  }
}

export function parseMermaidToSpec(text, { profile = 'default' } = {}) {
  const firstLine = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .find(Boolean)

  if (!firstLine) {
    throw new Error('Mermaid input is empty')
  }

  const type = firstLine.toLowerCase()
  if (!SUPPORTED_MERMAID_TYPES.has(type.split(/\s+/)[0])) {
    throw new Error(`Unsupported Mermaid diagram type "${firstLine}"`)
  }

  if (type.startsWith('flowchart') || type.startsWith('graph')) return parseFlowchart(text, profile)
  if (type.startsWith('sequencediagram')) return parseSequenceDiagram(text, profile)
  if (type.startsWith('classdiagram')) return parseClassDiagram(text, profile)
  if (type.startsWith('statediagram')) return parseStateDiagram(text, profile)
  if (type.startsWith('erdiagram')) return parseErDiagram(text, profile)
  if (type.startsWith('gantt')) return parseGantt(text, profile)

  throw new Error(`Unsupported Mermaid diagram type "${firstLine}"`)
}

function splitCsvLine(line) {
  const cells = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (ch === ',' && !inQuotes) {
      cells.push(current.trim())
      current = ''
      continue
    }
    current += ch
  }
  cells.push(current.trim())
  return cells
}

export function parseCsvToSpec(text, { profile = 'default' } = {}) {
  const rows = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))

  if (rows.length < 2) {
    throw new Error('CSV input must include a header row and at least one data row')
  }

  const headers = splitCsvLine(rows[0]).map(cell => cell.trim())
  if (!headers.includes('name') || !headers.includes('parent')) {
    throw new Error('CSV input must include "name" and "parent" columns')
  }

  const nameIndex = headers.indexOf('name')
  const parentIndex = headers.indexOf('parent')
  const labelIndex = headers.indexOf('label')
  const typeIndex = headers.indexOf('type')
  const moduleIndex = headers.indexOf('module')

  const nodes = []
  const edges = []
  const nodeMap = new Map()

  for (const row of rows.slice(1)) {
    const values = splitCsvLine(row)
    const rawName = values[nameIndex]
    if (!rawName) continue
    const label = values[labelIndex] || rawName
    const node = {
      id: normalizeId(rawName),
      label,
      type: inferNodeType(label, values[typeIndex]),
      module: values[moduleIndex] || undefined
    }
    pushNode(nodeMap, nodes, node)

    const rawParent = values[parentIndex]
    if (rawParent) {
      edges.push({
        from: normalizeId(rawParent),
        to: node.id,
        type: 'primary'
      })
      pushNode(nodeMap, nodes, {
        id: normalizeId(rawParent),
        label: rawParent,
        type: 'service'
      })
    }
  }

  return {
    meta: { layout: 'vertical', profile },
    nodes,
    edges,
    modules: []
  }
}

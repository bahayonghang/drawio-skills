import { prepareMathLabel } from '../math/index.js'

function parseSections(text) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    throw new TypeError('A–H spec must be a non-empty string')
  }

  const normalized = text.replace(/\r\n/g, '\n')
  const lines = normalized.split('\n')

  const sections = new Map()
  let currentKey = null
  let buffer = []

  const flush = () => {
    if (!currentKey) return
    const value = buffer.join('\n').trim()
    sections.set(currentKey, value)
    buffer = []
  }

  for (const line of lines) {
    const m = /^\s*([A-H])\s+/.exec(line)
    if (m) {
      flush()
      currentKey = m[1]
      buffer.push(line.replace(/^\s*[A-H]\s+/, ''))
      continue
    }
    if (currentKey) buffer.push(line)
  }
  flush()

  return Object.fromEntries(sections.entries())
}

function parseModules(sectionB) {
  if (typeof sectionB !== 'string' || sectionB.trim().length === 0) return []

  const modules = []
  for (const rawLine of sectionB.split('\n')) {
    const line = rawLine.trim()
    const m = /^(模块|Module)\s*(\d+)\s*[:：]\s*(.+)$/.exec(line)
    if (!m) continue
    modules.push({
      key: `${m[1]}${m[2]}`,
      name: m[3].trim()
    })
  }
  return modules
}

function parseNodes(sectionC) {
  if (typeof sectionC !== 'string' || sectionC.trim().length === 0) {
    throw new Error('Missing section C (nodes)')
  }

  const nodes = []
  const lines = sectionC.split('\n')
  let currentModuleKey = null
  let pendingModuleLine = null

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const line = raw.trim()
    if (line.length === 0) continue

    const moduleLine = /^(模块|Module)\s*(\d+)\s*[-—]\s*(步骤|Step)\s*\d+/i.exec(line)
    if (moduleLine) {
      currentModuleKey = `${moduleLine[1]}${moduleLine[2]}`
      pendingModuleLine = line
      continue
    }

    const idMatch = /^ID\s*:\s*(N\d+)\s*$/i.exec(line)
    if (!idMatch) continue

    const id = idMatch[1]
    const nextLine = (lines[i + 1] ?? '').trim()
    const labelMatch = /^Label\s*:\s*(.+)\s*$/i.exec(nextLine)
    if (!labelMatch) continue

    const label = labelMatch[1].trim()
    nodes.push({
      id,
      label,
      moduleKey: currentModuleKey,
      moduleLine: pendingModuleLine
    })

    pendingModuleLine = null
    i += 1
  }

  if (nodes.length === 0) {
    throw new Error('No nodes parsed from section C')
  }

  return nodes
}

function parseEdges(sectionD) {
  if (typeof sectionD !== 'string' || sectionD.trim().length === 0) return []

  const edges = []
  for (const rawLine of sectionD.split('\n')) {
    const line = rawLine.trim()
    if (line.length === 0) continue

    const m = /^(N\d+)\s*(?:→|->|→|➡|⇒)\s*(N\d+)\s*[;；]?(.*)$/.exec(line)
    if (!m) continue

    const source = m[1]
    const target = m[2]
    const rest = m[3] ?? ''

    const isDashed = /虚线/.test(rest)
    const isT = /T形线/.test(rest)

    edges.push({ source, target, isDashed, isT })
  }

  return edges
}

function buildXml({ modules, nodes, edges, page }) {
  const {
    width = 1280,
    height = 720,
    marginX = 60,
    marginY = 80,
    columnWidth = 320,
    nodeWidth = 220,
    nodeHeight = 70,
    nodeGapY = 30,
    containerPadding = 24
  } = page ?? {}

  const moduleOrder = new Map()
  for (let i = 0; i < modules.length; i++) moduleOrder.set(modules[i].key, i)

  const distinctModuleKeys = new Map()
  for (const node of nodes) {
    const key = node.moduleKey ?? '模块1'
    if (!distinctModuleKeys.has(key)) distinctModuleKeys.set(key, distinctModuleKeys.size)
  }

  const getModuleIndex = (moduleKey) => {
    if (moduleKey && moduleOrder.has(moduleKey)) return moduleOrder.get(moduleKey)
    if (moduleKey && distinctModuleKeys.has(moduleKey)) return distinctModuleKeys.get(moduleKey)
    return 0
  }

  const moduleBuckets = new Map()
  for (const node of nodes) {
    const k = node.moduleKey ?? '模块1'
    if (!moduleBuckets.has(k)) moduleBuckets.set(k, [])
    moduleBuckets.get(k).push(node)
  }

  const containerStyle =
    'rounded=0;html=1;whiteSpace=wrap;align=left;verticalAlign=top;fillColor=#f5f5f5;strokeColor=#999999;fontSize=12;fontColor=#333333;spacingLeft=12;spacingRight=12;spacingTop=10;spacingBottom=10'
  const nodeStyle =
    'rounded=1;html=1;whiteSpace=wrap;align=left;verticalAlign=middle;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=14;fontColor=#000000;spacingLeft=10;spacingRight=10;spacingTop=6;spacingBottom=6'
  const edgeStyle =
    'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;endArrow=block;endFill=1;strokeColor=#333333;strokeWidth=2;html=1'
  const dashedEdgeStyle =
    'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;endArrow=block;endFill=1;strokeColor=#333333;strokeWidth=2;dashed=1;dashPattern=6 4;html=1'

  const cells = []
  const cellIdToGeom = new Map()
  const logicalIdToCellId = new Map()
  let nextNumericId = 2
  const allocId = () => String(nextNumericId++)

  const ensureModuleName = (key, index) => {
    const fromB = modules.find((m) => m.key === key)?.name
    if (fromB) return fromB
    return `模块${index + 1}`
  }

  for (const [moduleKey, bucket] of moduleBuckets.entries()) {
    const moduleIndex = getModuleIndex(moduleKey)
    const moduleName = ensureModuleName(moduleKey, moduleIndex)

    const x0 = marginX + moduleIndex * columnWidth
    const y0 = marginY

    const containerId = allocId()
    const containerLogicalId = `container_${moduleIndex + 1}`
    const nodeCount = bucket.length
    const innerHeight = nodeCount * nodeHeight + Math.max(0, nodeCount - 1) * nodeGapY
    const containerWidth = Math.max(nodeWidth + containerPadding * 2, columnWidth - 40)
    const containerHeight = innerHeight + containerPadding * 2 + 40

    cells.push(
      `<mxCell id="${containerId}" data-id="${containerLogicalId}" value="${prepareMathLabel(moduleName)}" style="${containerStyle}" vertex="1" parent="1"><mxGeometry x="${x0}" y="${y0}" width="${containerWidth}" height="${containerHeight}" as="geometry"/></mxCell>`
    )

    for (let i = 0; i < bucket.length; i++) {
      const n = bucket[i]
      const nx = x0 + containerPadding
      const ny = y0 + containerPadding + 40 + i * (nodeHeight + nodeGapY)
      cellIdToGeom.set(n.id, { x: nx, y: ny, w: nodeWidth, h: nodeHeight })
      const cellId = allocId()
      logicalIdToCellId.set(n.id, cellId)
      cells.push(
        `<mxCell id="${cellId}" data-id="${n.id}" value="${prepareMathLabel(n.label)}" style="${nodeStyle}" vertex="1" parent="${containerId}"><mxGeometry x="${nx - x0}" y="${ny - y0}" width="${nodeWidth}" height="${nodeHeight}" as="geometry"/></mxCell>`
      )
    }
  }

  for (const e of edges) {
    if (!cellIdToGeom.has(e.source) || !cellIdToGeom.has(e.target)) continue
    const sourceId = logicalIdToCellId.get(e.source)
    const targetId = logicalIdToCellId.get(e.target)
    if (!sourceId || !targetId) continue
    const style = e.isDashed ? dashedEdgeStyle : edgeStyle
    const edgeId = allocId()
    const edgeLogicalId = `edge_${e.source}_${e.target}`
    cells.push(
      `<mxCell id="${edgeId}" data-id="${edgeLogicalId}" style="${style}" edge="1" parent="1" source="${sourceId}" target="${targetId}"><mxGeometry relative="1" as="geometry"/></mxCell>`
    )
  }

  const xml =
    `<mxGraphModel dx="1120" dy="720" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${width}" pageHeight="${height}" math="1">` +
    `<root>` +
    `<mxCell id="0"/>` +
    `<mxCell id="1" parent="0"/>` +
    cells.join('') +
    `</root>` +
    `</mxGraphModel>`

  return xml
}

export function ahToDrawioXml(ahText, { page } = {}) {
  const sections = parseSections(ahText)
  const modules = parseModules(sections.B ?? '')
  const nodes = parseNodes(sections.C ?? '')
  const edges = parseEdges(sections.D ?? '')
  return buildXml({ modules, nodes, edges, page })
}

export function parseAh(text) {
  const sections = parseSections(text)
  return {
    sections,
    modules: parseModules(sections.B ?? ''),
    nodes: parseNodes(sections.C ?? ''),
    edges: parseEdges(sections.D ?? '')
  }
}

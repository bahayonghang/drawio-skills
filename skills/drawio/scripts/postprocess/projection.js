import { normalizePostprocessInput, selectPostprocessPages } from './input.js'

const MERMAID_DIRECTIONS = new Set(['LR', 'RL', 'TB', 'BT'])
const MERMAID_TYPES = new Map([
  ['database', ['[("', '")]']],
  ['decision', ['{ "', '" }']],
  ['terminal', ['(["', '"])']],
  ['queue', ['[/"', '"/]']],
  ['cloud', ['(("', '"))']],
  ['text', ['["', '"]']],
  ['service', ['["', '"]']],
  ['user', ['(("', '"))']],
  ['operator', ['{{"', '"}}']]
])

function asText(value, fallback = '') {
  return typeof value === 'string' ? value : value == null ? fallback : String(value)
}

function escapeMermaidLabel(value) {
  return asText(value)
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"')
    .replaceAll('`', '\\`')
    .replaceAll('|', '&#124;')
    .replace(/\r?\n/g, '<br>')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ')
}

function escapeHeading(value) {
  return asText(value, 'Untitled')
    .replace(/[\r\n]+/g, ' ')
    .replace(/([\\`*_{}\[\]()#+.!<>|])/g, '\\$1')
}

function inlineCode(value) {
  const text = asText(value).replace(/[\r\n]+/g, ' ')
  const runs = text.match(/`+/g)
  if (!runs) return `\`${text}\``
  const fence = '`'.repeat(Math.max(...runs.map((run) => run.length)) + 1)
  return `${fence} ${text} ${fence}`
}

function mermaidId(pageId, objectId) {
  return `${pageId}_${objectId}`
}

function objectLabel(object, fallback = object?.id || 'object') {
  return object?.label || fallback
}

function pageTitle(page) {
  return page.meta?.title || page.name || page.id
}

function edgeOperator(edge) {
  if (edge.type === 'dependency') return '==>'
  if (edge.type === 'optional' || edge.type === 'data') return '-.->'
  return '-->'
}

function buildMermaidNode(pageId, object, type, warnings) {
  const shape = MERMAID_TYPES.get(type || 'service')
  if (!shape) {
    warnings.push(`page ${pageId} object ${object.id} uses unsupported Mermaid type "${type}"; rendered as a neutral node`)
  }
  const [start, end] = shape || MERMAID_TYPES.get('service')
  return `    ${mermaidId(pageId, object.id)}${start}${escapeMermaidLabel(objectLabel(object))}${end}`
}

function projectionPages(value, options) {
  const normalized = normalizePostprocessInput(value)
  const selected = selectPostprocessPages(normalized, {
    page: options.page,
    allPages: options.page == null ? options.allPages !== false : false
  })
  return selected
}

export function renderMermaidProjection(value, options = {}) {
  const direction = options.direction || 'LR'
  if (!MERMAID_DIRECTIONS.has(direction)) {
    throw new Error(`Mermaid direction must be one of ${[...MERMAID_DIRECTIONS].join(', ')}`)
  }
  const { document, pages } = projectionPages(value, options)
  const warnings = []
  const lines = [`flowchart ${direction}`]
  const pageIds = new Set(pages.map((page) => page.id))

  for (const page of pages) {
    lines.push(`  subgraph ${page.id}["${escapeMermaidLabel(pageTitle(page))}"]`)
    for (const module of page.modules || []) lines.push(buildMermaidNode(page.id, module, 'service', warnings))
    for (const node of page.nodes || []) lines.push(buildMermaidNode(page.id, node, node.type || 'service', warnings))
    for (const edge of page.edges || []) {
      lines.push(
        `    ${mermaidId(page.id, edge.from)} ${edgeOperator(edge)}|${escapeMermaidLabel(edge.label || edge.type || '')}| ${mermaidId(page.id, edge.to)}`
      )
    }
    lines.push('  end')
  }

  for (const link of document.links || []) {
    if (!pageIds.has(link.from.pageId) || !pageIds.has(link.to.pageId)) continue
    const from = mermaidId(link.from.pageId, link.from.objectId)
    const to = mermaidId(link.to.pageId, link.to.objectId)
    lines.push(`  ${from} -.-> ${to}`)
    lines.push(`  %% structured-link ${link.from.pageId}/${link.from.objectId} -> ${link.to.pageId}/${link.to.objectId}`)
  }

  return { text: lines.join('\n') + '\n', warnings }
}

export function renderMermaid(value, options = {}) {
  const result = renderMermaidProjection(value, options)
  const output = options.fenced ? `\`\`\`mermaid\n${result.text}\`\`\`\n` : result.text
  return options.returnWarnings ? { text: output, warnings: result.warnings } : output
}

function metadataLine(meta) {
  const fields = ['source', 'profile', 'theme', 'layout']
    .filter((field) => meta?.[field] != null)
    .map((field) => `${field} ${inlineCode(meta[field])}`)
  return fields.length ? `\nMetadata: ${fields.join('; ')}` : ''
}

function identityText(object) {
  if (!object?.identity) return ''
  return `; identity ${inlineCode(`${object.identity.scheme}:${object.identity.key}`)}`
}

function explainObject(object, kind) {
  const type = object.type || (kind === 'module' ? 'module' : kind)
  const icon = object.icon ? `; icon ${inlineCode(object.icon)}` : ''
  return `- ${inlineCode(object.id)}: ${inlineCode(objectLabel(object))} (${type})${icon}${identityText(object)}`
}

export function explainDocument(value, options = {}) {
  const { document, pages } = projectionPages(value, options)
  const title = options.page != null ? pageTitle(pages[0]) : document.meta?.title || pageTitle(pages[0])
  const lines = [`# ${escapeHeading(title)}`]
  if (options.page == null) lines.push(metadataLine(document.meta || {}))

  for (const page of pages) {
    lines.push(`## Page: ${escapeHeading(page.name)} (${inlineCode(page.id)})`)
    lines.push(metadataLine(page.meta || {}))
    if (page.modules?.length) {
      lines.push('### Modules')
      for (const module of page.modules) lines.push(explainObject(module, 'module'))
    }
    if (page.nodes?.length) {
      lines.push('### Nodes')
      for (const node of page.nodes) lines.push(explainObject(node, 'node'))
    }
    if (page.edges?.length) {
      lines.push('### Edges')
      for (const edge of page.edges) {
        const label = edge.label ? `: ${inlineCode(edge.label)}` : ''
        lines.push(`- ${inlineCode(edge.from)} -> ${inlineCode(edge.to)}${label}${identityText(edge)}`)
      }
    }
  }

  const selectedIds = new Set(pages.map((page) => page.id))
  const links = (document.links || []).filter(
    (link) => selectedIds.has(link.from.pageId) && selectedIds.has(link.to.pageId)
  )
  if (links.length) {
    lines.push('### Structured links')
    for (const link of links) {
      lines.push(
        `- ${inlineCode(`${link.from.pageId}/${link.from.objectId}`)} -> ${inlineCode(`${link.to.pageId}/${link.to.objectId}`)}`
      )
    }
  }
  return lines.join('\n').replace(/\n{3,}/g, '\n\n') + '\n'
}

export const renderExplain = explainDocument

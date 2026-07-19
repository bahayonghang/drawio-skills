import { deflateRawSync } from 'node:zlib'

import { normalizeDocumentSpec, buildPageLink } from './document-spec.js'
import { decodeDiagramContent, drawioToSpec, extractDiagrams } from './drawio-to-spec.js'
import { applyAutoLayout } from './auto-layout.js'
import { specToDrawioXml, validateXml } from './spec-to-drawio.js'
import { createMultiPageDrawioFileContent } from '../runtime/artifacts.js'
import { attr, decodeEntities } from '../shared/xml-utils.js'

function wrapperMetadata(xml) {
  const byCell = new Map()
  const re = /<UserObject\b([^>]*)>([\s\S]*?)<\/UserObject>/gi
  let match
  while ((match = re.exec(xml)) !== null) {
    const attrs = match[1] || ''
    const body = match[2] || ''
    const cellMatch = /<mxCell\b([^>]*)/i.exec(body)
    if (!cellMatch) continue
    const cellAttrs = cellMatch[1]
    const cellId = attr(cellAttrs, 'id')
    if (!cellId) continue
    byCell.set(cellId, {
      pageId: decodeEntities(attr(attrs, 'dataPageId') || ''),
      objectId: decodeEntities(attr(attrs, 'dataObjectId') || ''),
      objectKind: decodeEntities(attr(attrs, 'dataObjectKind') || ''),
      targetObjectId: decodeEntities(attr(attrs, 'dataTargetObjectId') || ''),
      link: decodeEntities(attr(attrs, 'link') || ''),
      source: attr(cellAttrs, 'source'),
      target: attr(cellAttrs, 'target')
    })
  }
  return byCell
}

function pageContainerXml(decoded, { id, name }) {
  const safeId = id == null ? '' : ` id="${String(id)}"`
  const safeName = name == null ? '' : ` name="${String(name)}"`
  return `<mxfile><diagram${safeId}${safeName}>${decoded}</diagram></mxfile>`
}

function decodeJsonAttribute(value, fallback) {
  if (!value) return fallback
  try {
    return JSON.parse(decodeURIComponent(decodeEntities(value)))
  } catch {
    throw new Error('invalid encoded document metadata')
  }
}

function restoreCanonicalIdentity(spec, metadata, pageId) {
  const nodeByCell = new Map()
  const moduleByCell = new Map()
  const edgeMetadata = []
  for (const [cellId, entry] of metadata) {
    if (entry.objectKind === 'node') {
      const node = spec.nodes.find((item) => item.id === `n${cellId}`)
      if (node) {
        nodeByCell.set(cellId, entry.objectId)
        node.id = entry.objectId
      }
    } else if (entry.objectKind === 'module') {
      const module = spec.modules.find((item) => item.id === `m${cellId}`)
      if (module) {
        moduleByCell.set(cellId, entry.objectId)
        module.id = entry.objectId
      }
    } else if (entry.objectKind === 'edge') {
      edgeMetadata.push({ cellId, entry })
    }
  }

  for (const node of spec.nodes) {
    if (node.module?.startsWith('m')) {
      const moduleId = moduleByCell.get(node.module.slice(1))
      if (moduleId) node.module = moduleId
    }
  }
  for (const edge of spec.edges) {
    if (edge.from?.startsWith('n')) edge.from = nodeByCell.get(edge.from.slice(1)) || edge.from
    if (edge.to?.startsWith('n')) edge.to = nodeByCell.get(edge.to.slice(1)) || edge.to
  }

  const usedEdges = new Set()
  for (const { entry } of edgeMetadata) {
    const from = nodeByCell.get(entry.source)
    const to = nodeByCell.get(entry.target)
    const edgeIndex = spec.edges.findIndex(
      (edge, index) => !usedEdges.has(index) && edge.from === from && edge.to === to
    )
    if (edgeIndex !== -1) {
      usedEdges.add(edgeIndex)
      spec.edges[edgeIndex].id = entry.objectId
    }
  }

  for (const edge of spec.edges) {
    if (!edge.id) edge.id = `edge-${spec.edges.indexOf(edge) + 1}`
  }

  const links = []
  for (const entry of metadata.values()) {
    if (!entry.link || !entry.targetObjectId || !['node', 'module'].includes(entry.objectKind)) continue
    const targetPageId = entry.link.startsWith('data:page/id,') ? entry.link.slice('data:page/id,'.length) : null
    if (!targetPageId) continue
    links.push({
      from: { pageId, objectId: entry.objectId },
      to: { pageId: targetPageId, objectId: entry.targetObjectId }
    })
  }
  return links
}

export async function renderDocumentPages(value, options = {}) {
  const document = value?.kind ? value : normalizeDocumentSpec(value)
  if (document.kind !== 'multi-page-v1') throw new Error('renderDocumentPages requires a multi-page v1 document')
  const rendered = []
  for (const page of document.pages) {
    const pageSpec = {
      meta: page.meta || {},
      nodes: page.nodes || [],
      edges: page.edges || [],
      modules: page.modules || []
    }
    const autoLayout = await applyAutoLayout(pageSpec)
    const linkMap = {}
    for (const link of document.links) {
      if (link.from.pageId !== page.id) continue
      linkMap[link.from.objectId] = {
        targetPageId: link.to.pageId,
        targetObjectId: link.to.objectId,
        href: buildPageLink(link.to.pageId)
      }
    }
    const xml = specToDrawioXml(autoLayout.spec, {
      ...options,
      silent: options.silent ?? true,
      canonicalMetadata: { pageId: page.id, links: linkMap }
    })
    const validation = validateXml(xml)
    if (!validation.valid) {
      const error = new Error(
        `pages[${document.pages.indexOf(page)}] (${page.id}) XML validation failed: ${validation.errors.join('; ')}`
      )
      error.pageIndex = document.pages.indexOf(page)
      error.pageId = page.id
      throw error
    }
    rendered.push({ id: page.id, name: page.name, meta: page.meta || {}, xml, validation })
  }
  return rendered
}

export function validateDrawioDocument(drawioFileText) {
  const errors = []
  const warnings = []
  let diagrams
  try {
    diagrams = extractDiagrams(drawioFileText)
  } catch (error) {
    return { valid: false, errors: [error.message], warnings: [], pages: [] }
  }
  const pages = []
  diagrams.forEach((diagram, index) => {
    try {
      const decoded = decodeDiagramContent(diagram.content)
      const result = validateXml(decoded)
      pages.push({ index, id: diagram.id, name: diagram.name, ...result })
      errors.push(...result.errors.map((error) => `pages[${index}]${diagram.id ? ` (${diagram.id})` : ''}: ${error}`))
      warnings.push(...result.warnings.map((warning) => `pages[${index}]${diagram.id ? ` (${diagram.id})` : ''}: ${warning}`))
    } catch (error) {
      pages.push({ index, id: diagram.id, name: diagram.name, valid: false, errors: [error.message], warnings: [] })
      errors.push(`pages[${index}]: ${error.message}`)
    }
  })
  return { valid: errors.length === 0, errors, warnings, pages }
}

export function drawioToDocumentSpec(drawioFileText) {
  const diagrams = extractDiagrams(drawioFileText)
  const documentMetaMatch = /<mxfile\b([^>]*)>/i.exec(drawioFileText)
  const documentMeta = decodeJsonAttribute(documentMetaMatch ? attr(documentMetaMatch[1], 'dataDocumentMeta') : null, {
    source: 'edited'
  })
  const ids = new Set()
  const pages = []
  const links = []
  diagrams.forEach((diagram, index) => {
    const pageId = diagram.id || `page-${index + 1}`
    if (ids.has(pageId)) throw new Error(`pages[${index}].id: duplicate page id "${pageId}"`)
    ids.add(pageId)
    const pageName = diagram.name || `Page-${index + 1}`
    const decoded = decodeDiagramContent(diagram.content)
    const metadata = wrapperMetadata(decoded)
    const spec = drawioToSpec(pageContainerXml(decoded, { id: pageId, name: pageName }), {
      page: 0,
      title: pageName
    })
    links.push(...restoreCanonicalIdentity(spec, metadata, pageId))
    pages.push({
      id: pageId,
      name: pageName,
      meta: decodeJsonAttribute(diagram.pageMeta, spec.meta),
      nodes: spec.nodes,
      edges: spec.edges,
      modules: spec.modules
    })
  })
  return normalizeDocumentSpec({ schemaVersion: 1, meta: documentMeta, pages, links })
}

export function compressDiagramXml(xml) {
  return deflateRawSync(Buffer.from(encodeURIComponent(xml), 'utf8')).toString('base64')
}

export async function renderDocumentFile(value, options = {}) {
  const document = value?.kind ? value : normalizeDocumentSpec(value)
  const pages = await renderDocumentPages(document, options)
  return createMultiPageDrawioFileContent(pages, {
    version: options.version,
    documentMeta: document.meta
  })
}

export { createMultiPageDrawioFileContent }

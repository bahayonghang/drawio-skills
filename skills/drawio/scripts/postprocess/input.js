import { drawioToDocumentSpec } from '../dsl/multi-page.js'
import {
  normalizeDocumentSpec,
  parseDocumentYaml,
  selectDocumentPage,
  validateDocumentSpec
} from '../dsl/document-spec.js'

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function pageSpec(page) {
  return {
    meta: page.meta || {},
    nodes: page.nodes || [],
    edges: page.edges || [],
    modules: page.modules || []
  }
}

function normalizedInput(value) {
  if (value?.kind === 'legacy-single-page') {
    return normalizeDocumentSpec(value.spec || value)
  }
  if (value?.kind === 'multi-page-v1') {
    return normalizeDocumentSpec({
      schemaVersion: 1,
      meta: value.meta || {},
      pages: value.pages,
      links: value.links || []
    })
  }
  return normalizeDocumentSpec(value)
}

/**
 * Normalize a YAML/spec/Draw.io input at the postprocess boundary.
 * Draw.io import is deliberately performed once before any transform.
 */
export function normalizePostprocessInput(value, { inputFormat = 'yaml' } = {}) {
  if (inputFormat === 'drawio') {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new TypeError('drawio postprocess input must be a non-empty string')
    }
    return normalizedInput(drawioToDocumentSpec(value))
  }

  if (typeof value === 'string') {
    return parseDocumentYaml(value)
  }

  if (!isRecord(value)) throw new TypeError('postprocess input must be a spec object or YAML string')
  return normalizedInput(value)
}

export function selectPostprocessPages(value, { page, allPages } = {}) {
  const document = value?.kind ? normalizedInput(value) : normalizePostprocessInput(value)
  if (page != null && allPages === true) throw new Error('postprocess page cannot combine page and allPages')
  if (page != null) return { document, pages: [selectDocumentPage(document, page)] }
  if (allPages !== false) return { document, pages: document.pages.slice() }
  return { document, pages: [document.pages[0]] }
}

/**
 * Apply a pure page transform to selected pages while preserving the full
 * document envelope and links. The callback receives a detached page object.
 */
export function mapPostprocessPages(value, transform, options = {}) {
  if (typeof transform !== 'function') throw new TypeError('postprocess page transform must be a function')
  const { document, pages } = selectPostprocessPages(value, options)
  const selectedIds = new Set(pages.map((page) => page.id))
  const mappedPages = document.pages.map((page) => {
    if (!selectedIds.has(page.id)) return structuredClone(page)
    const result = transform(structuredClone(page))
    if (!isRecord(result)) throw new TypeError(`postprocess transform for page "${page.id}" must return an object`)
    return { id: page.id, name: page.name, ...pageSpec(result) }
  })

  if (document.kind === 'legacy-single-page') {
    const spec = pageSpec(mappedPages[0])
    validateDocumentSpec({ kind: 'legacy-single-page', spec })
    return {
      kind: document.kind,
      legacy: true,
      spec,
      meta: spec.meta,
      pages: mappedPages,
      links: []
    }
  }

  const mapped = {
    kind: document.kind,
    legacy: false,
    schemaVersion: 1,
    meta: structuredClone(document.meta || {}),
    pages: mappedPages,
    links: structuredClone(document.links || [])
  }
  validateDocumentSpec(mapped)
  return mapped
}

export function toPostprocessOutput(document) {
  if (document?.kind === 'legacy-single-page') return structuredClone(document.spec)
  return structuredClone(document)
}

export function pageToSpec(page) {
  return structuredClone(pageSpec(page))
}

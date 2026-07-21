import { validateSpec } from './spec-to-drawio.js'
import yaml from '../vendor/js-yaml/js-yaml.mjs'

const PAGE_ID = /^[A-Za-z][A-Za-z0-9_-]*$/
const OBJECT_ID = /^[A-Za-z][A-Za-z0-9_-]*$/
const PAGE_NAME_CONTROLS = /[\u0000-\u001f\u007f-\u009f]/
const DOCUMENT_META_FIELDS = new Set(['title', 'description', 'source'])

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function fail(path, message, details = {}) {
  const error = new Error(`${path}: ${message}`)
  error.code = 'MULTI_PAGE_INVALID'
  error.path = path
  Object.assign(error, details)
  throw error
}

function safeObjectId(value) {
  return typeof value === 'string' && value.length <= 128 && OBJECT_ID.test(value)
}

function validatePageIdentity(page, index) {
  const path = `pages[${index}]`
  if (!isRecord(page)) fail(path, 'must be an object', { pageIndex: index })
  if (!safeObjectId(page.id)) fail(`${path}.id`, 'must be a safe page id (^[A-Za-z][A-Za-z0-9_-]*$)', { pageIndex: index })
  if (page.name == null || typeof page.name !== 'string' || page.name.length === 0 || page.name.length > 256) {
    fail(`${path}.name`, 'must be a non-empty string of at most 256 characters', { pageIndex: index, pageId: page.id })
  }
  if (PAGE_NAME_CONTROLS.test(page.name)) {
    fail(`${path}.name`, 'must not contain control characters', { pageIndex: index, pageId: page.id })
  }
}

function pageSpec(page) {
  return {
    meta: isRecord(page.meta) ? page.meta : {},
    nodes: Array.isArray(page.nodes) ? page.nodes : [],
    edges: Array.isArray(page.edges) ? page.edges : [],
    modules: Array.isArray(page.modules) ? page.modules : []
  }
}

function validatePage(page, index) {
  validatePageIdentity(page, index)
  const path = `pages[${index}]`
  const spec = pageSpec(page)
  try {
    validateSpec(spec)
  } catch (error) {
    fail(path, error.message, { pageIndex: index, pageId: page.id, cause: error })
  }

  const objectKinds = new Map()
  for (const [kind, objects] of [['node', spec.nodes], ['module', spec.modules], ['edge', spec.edges]]) {
    objects.forEach((object, objectIndex) => {
      if (kind === 'edge' && object.id == null) {
        fail(`${path}.edges[${objectIndex}].id`, 'is required in multi-page documents', {
          pageIndex: index,
          pageId: page.id
        })
      }
      if (!safeObjectId(object.id)) {
        fail(`${path}.${kind === 'node' ? 'nodes' : `${kind}s`}[${objectIndex}].id`, 'must be a safe object id', {
          pageIndex: index,
          pageId: page.id
        })
      }
      if (objectKinds.has(object.id)) {
        fail(`${path}.${kind === 'node' ? 'nodes' : `${kind}s`}[${objectIndex}].id`, `duplicate object id "${object.id}"`, {
          pageIndex: index,
          pageId: page.id
        })
      }
      objectKinds.set(object.id, kind)
    })
  }

  const endpointKinds = new Set(['node', 'module'])
  for (const [edgeIndex, edge] of spec.edges.entries()) {
    for (const endpoint of ['from', 'to']) {
      const kind = objectKinds.get(edge[endpoint])
      if (!endpointKinds.has(kind)) {
        fail(`${path}.edges[${edgeIndex}].${endpoint}`, `must reference an existing node or module ("${edge[endpoint]}")`, {
          pageIndex: index,
          pageId: page.id
        })
      }
    }
  }

  return { ...page, ...spec }
}

function validateLinks(document) {
  const pageIds = new Set(document.pages.map((page) => page.id))
  const objectIndex = new Map()
  document.pages.forEach((page) => {
    for (const kind of ['nodes', 'modules', 'edges']) {
      for (const object of page[kind] || []) objectIndex.set(`${page.id}\0${object.id}`, { kind: kind.slice(0, -1), object })
    }
  })

  const sources = new Set()
  const links = Array.isArray(document.links) ? document.links : []
  links.forEach((link, index) => {
    const path = `links[${index}]`
    if (!isRecord(link) || Object.keys(link).some((key) => !['from', 'to'].includes(key)) || !link.from || !link.to) {
      fail(path, 'must contain exactly from and to endpoints')
    }
    for (const endpoint of ['from', 'to']) {
      const endpointValue = link[endpoint]
      if (!isRecord(endpointValue) || Object.keys(endpointValue).some((key) => !['pageId', 'objectId'].includes(key))) {
        fail(`${path}.${endpoint}`, 'must contain exactly pageId and objectId')
      }
      if (!safeObjectId(endpointValue.pageId) || !pageIds.has(endpointValue.pageId)) {
        fail(`${path}.${endpoint}.pageId`, `must reference an existing safe page id ("${endpointValue.pageId}")`)
      }
      if (!safeObjectId(endpointValue.objectId)) {
        fail(`${path}.${endpoint}.objectId`, 'must be a safe object id')
      }
      const entry = objectIndex.get(`${endpointValue.pageId}\0${endpointValue.objectId}`)
      if (!entry) fail(`${path}.${endpoint}`, `references missing object "${endpointValue.objectId}"`)
      if (!['node', 'module'].includes(entry.kind)) fail(`${path}.${endpoint}`, 'must reference a node or module')
    }
    const sourceKey = `${link.from.pageId}\0${link.from.objectId}`
    const linkKey = `${sourceKey}->${link.to.pageId}\0${link.to.objectId}`
    if (sources.has(sourceKey)) fail(path, 'duplicate source link')
    if (sources.has(linkKey)) fail(path, 'duplicate link')
    if (link.from.pageId === link.to.pageId && link.from.objectId === link.to.objectId) {
      fail(path, 'must not link an object to itself')
    }
    sources.add(sourceKey)
    sources.add(linkKey)
  })
  return objectIndex
}

export function classifyDocumentSpec(value) {
  if (!isRecord(value)) throw new TypeError('document spec must be an object')
  if (value.schemaVersion == null) {
    if (Object.prototype.hasOwnProperty.call(value, 'pages') || Object.prototype.hasOwnProperty.call(value, 'links')) {
      throw new Error('pages/links require explicit schemaVersion: 1')
    }
    return 'legacy-single-page'
  }
  if (value.schemaVersion !== 1) throw new Error(`schemaVersion ${value.schemaVersion} is unsupported; expected 1`)
  if (!Array.isArray(value.pages)) throw new Error('schemaVersion: 1 requires a pages array')
  if (['nodes', 'edges', 'modules'].some((field) => Object.prototype.hasOwnProperty.call(value, field))) {
    throw new Error('schemaVersion: 1 cannot mix top-level nodes, edges, or modules with pages')
  }
  return 'multi-page-v1'
}

export function parseDocumentYaml(yamlText) {
  if (yamlText == null) throw new TypeError('yamlText must be a string')
  if (String(yamlText).trim() === '') return normalizeDocumentSpec({ meta: {}, nodes: [], edges: [], modules: [] })
  let value
  try {
    value = yaml.load(yamlText, { schema: yaml.DEFAULT_SCHEMA }) || {}
  } catch (error) {
    throw new Error(`Failed to parse YAML document: ${error.message}`)
  }
  return normalizeDocumentSpec(value)
}

export function validateDocumentSpec(document) {
  const kind = document?.kind || classifyDocumentSpec(document)
  if (kind === 'legacy-single-page') {
    const spec = document.spec || document
    validateSpec({ meta: spec.meta || {}, nodes: spec.nodes || [], edges: spec.edges || [], modules: spec.modules || [] })
    return document
  }
  if (kind !== 'multi-page-v1') throw new Error(`Unknown document kind "${kind}"`)
  if (!Array.isArray(document.pages) || document.pages.length === 0) fail('pages', 'must contain at least one page')
  if (document.meta != null && !isRecord(document.meta)) fail('meta', 'must be an object')
  for (const field of Object.keys(document.meta || {})) {
    if (!DOCUMENT_META_FIELDS.has(field)) fail(`meta.${field}`, 'is not a supported document metadata field')
  }
  if (document.links != null && !Array.isArray(document.links)) fail('links', 'must be an array')
  const ids = new Set()
  for (const [index, page] of document.pages.entries()) {
    validatePage(page, index)
    if (ids.has(page.id)) fail(`pages[${index}].id`, `duplicate page id "${page.id}"`, { pageIndex: index, pageId: page.id })
    ids.add(page.id)
  }
  validateLinks(document)
  return document
}

export function normalizeDocumentSpec(value) {
  const kind = classifyDocumentSpec(value)
  if (kind === 'legacy-single-page') {
    const spec = { meta: value.meta || {}, nodes: value.nodes || [], edges: value.edges || [], modules: value.modules || [] }
    validateDocumentSpec({ kind, spec })
    return {
      kind,
      legacy: true,
      spec,
      meta: spec.meta,
      pages: [{ id: 'page-1', name: 'Page-1', ...spec }],
      links: []
    }
  }
  const normalized = {
    kind,
    legacy: false,
    schemaVersion: 1,
    meta: value.meta || {},
    pages: value.pages.map((page) => pageSpec({ ...page, id: page.id, name: page.name })),
    links: value.links == null ? [] : Array.isArray(value.links) ? value.links.map((link) => structuredClone(link)) : value.links
  }
  normalized.pages = value.pages.map((page) => ({ id: page.id, name: page.name, ...pageSpec(page) }))
  validateDocumentSpec(normalized)
  return normalized
}

export function selectDocumentPage(document, selector) {
  if (!document?.pages?.length) throw new Error('document has no pages')
  if (selector == null || selector === '') return document.pages[0]
  const raw = String(selector)
  if (/^\d+$/.test(raw)) {
    const index = Number(raw)
    if (index >= 0 && index < document.pages.length) return document.pages[index]
    throw new Error(`--page index out of range: ${raw}. Available pages: 0..${document.pages.length - 1}`)
  }
  const byId = document.pages.find((page) => page.id === raw)
  if (byId) return byId
  const matches = document.pages.filter((page) => page.name === raw || page.name.toLowerCase() === raw.toLowerCase())
  if (matches.length === 1) return matches[0]
  if (matches.length > 1) throw new Error(`--page "${raw}" is ambiguous; candidates: ${matches.map((page) => page.id).join(', ')}`)
  throw new Error(`--page "${raw}" not found. Available page ids: ${document.pages.map((page) => page.id).join(', ')}`)
}

export function resolveDocumentObject(document, { pageId, objectId } = {}) {
  const page = document?.pages?.find((item) => item.id === pageId)
  if (!page) throw new Error(`document object page "${pageId}" not found`)
  for (const [kind, objects] of [['node', page.nodes], ['module', page.modules], ['edge', page.edges]]) {
    const object = (objects || []).find((item) => item.id === objectId)
    if (object) return { pageId, objectId, kind, object }
  }
  throw new Error(`document object "${objectId}" not found on page "${pageId}"`)
}

export function buildPageLink(pageId) {
  if (!safeObjectId(pageId)) throw new Error(`unsafe page id "${pageId}"`)
  return `data:page/id,${pageId}`
}

export function parsePageLink(value) {
  if (typeof value !== 'string' || !value.startsWith('data:page/id,')) return null
  const pageId = value.slice('data:page/id,'.length)
  return safeObjectId(pageId) ? pageId : null
}

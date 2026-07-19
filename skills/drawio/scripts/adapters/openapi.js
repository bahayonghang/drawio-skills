import { ERROR_CODES, createOpenApiIdentity, createOpenApiSchemaIdentity } from './identity.js'
import {
  adapterError,
  diagnostic,
  finalizeConfigProjection,
  isRecord,
  parseStructuredDocuments,
  pushUniqueEdge,
  requireRecord
} from './config-common.js'

const ADAPTER = 'openapi-config'
const METHODS = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'])

export const OPENAPI_ATTRIBUTE_ALLOWLIST = Object.freeze({
  node: ['component', 'method', 'operationId', 'path', 'tags'],
  edge: [],
  module: []
})

function collectRefs(value, refs, state = { seen: new WeakSet() }) {
  if (!value || typeof value !== 'object') return
  if (state.seen.has(value)) return
  state.seen.add(value)
  if (typeof value.$ref === 'string') refs.add(value.$ref)
  if (Array.isArray(value)) {
    for (const entry of value) collectRefs(entry, refs, state)
  } else {
    for (const entry of Object.values(value)) collectRefs(entry, refs, state)
  }
}

export function parseOpenApiDocument(source, { locator = 'openapi.yaml' } = {}) {
  const documents = parseStructuredDocuments(source, { adapter: ADAPTER })
  if (documents.length !== 1) adapterError(ERROR_CODES.ADAPTER_PARSE, 'OpenAPI input must contain one document', { adapter: ADAPTER })
  const document = requireRecord(documents[0], 'OpenAPI document', ADAPTER)
  if (typeof document.openapi !== 'string' || !document.openapi.startsWith('3.')) {
    adapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'Only OpenAPI 3.x documents are supported', { adapter: ADAPTER })
  }

  const nodes = []
  const schemaIdentities = new Map()
  const schemas = isRecord(document.components?.schemas) ? document.components.schemas : {}
  for (const name of Object.keys(schemas)) {
    const identity = createOpenApiSchemaIdentity(name)
    schemaIdentities.set(name, identity)
    nodes.push({ identity, label: name, semanticType: 'document', attributes: { component: true } })
  }

  const operations = []
  const paths = isRecord(document.paths) ? document.paths : {}
  for (const [path, pathItem] of Object.entries(paths)) {
    if (!isRecord(pathItem)) continue
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!METHODS.has(method.toLowerCase()) || !isRecord(operation)) continue
      const identity = createOpenApiIdentity({ method, path })
      const label = operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`
      const attributes = { method: method.toUpperCase(), path }
      if (typeof operation.operationId === 'string') attributes.operationId = operation.operationId
      if (Array.isArray(operation.tags)) attributes.tags = operation.tags.filter((tag) => typeof tag === 'string')
      nodes.push({ identity, label, semanticType: 'service', attributes })
      operations.push({ identity, operation })
    }
  }

  const edges = []
  const edgeKeys = new Set()
  const diagnostics = []
  for (const { identity, operation } of operations) {
    const refs = new Set()
    collectRefs(operation, refs)
    for (const ref of refs) {
      const match = ref.match(/^#\/components\/schemas\/([^/]+)$/)
      if (!match) {
        diagnostics.push(diagnostic('OPENAPI_EXTERNAL_REF', `OpenAPI reference "${ref}" is outside local component schemas.`, identity))
        continue
      }
      const schemaName = match[1].replaceAll('~1', '/').replaceAll('~0', '~')
      const target = schemaIdentities.get(schemaName)
      if (!target) {
        diagnostics.push(diagnostic('OPENAPI_MISSING_SCHEMA', `OpenAPI operation references missing schema "${schemaName}".`, identity))
        continue
      }
      pushUniqueEdge(edges, edgeKeys, {
        from: identity,
        to: target,
        relation: 'uses-schema',
        discriminator: `schema:${schemaName}`,
        attributes: {}
      })
    }
  }

  return finalizeConfigProjection(
    { adapter: ADAPTER, domain: 'openapi', locator, nodes, edges, diagnostics },
    OPENAPI_ATTRIBUTE_ALLOWLIST
  )
}

import { loadAll, JSON_SCHEMA } from 'js-yaml'

import { AdapterContractError, ERROR_CODES, serializeIdentity } from './identity.js'
import { finalizeGraphProjection } from './graph-projection.js'

export const MAX_SOURCE_BYTES = 1024 * 1024
const MAX_DATA_DEPTH = 40
const MAX_DATA_ENTRIES = 10000
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

export function adapterError(code, message, context = {}, cause) {
  throw new AdapterContractError(code, message, context, { cause })
}

export function assertSourceText(source, adapter) {
  if (typeof source !== 'string' || source.trim() === '') {
    adapterError(ERROR_CODES.ADAPTER_PARSE, `${adapter} input must be a non-empty string`, { adapter })
  }
  if (Buffer.byteLength(source, 'utf8') > MAX_SOURCE_BYTES) {
    adapterError(ERROR_CODES.ADAPTER_PARSE, `${adapter} input exceeds the ${MAX_SOURCE_BYTES} byte limit`, { adapter })
  }
  return source
}

export function isRecord(value) {
  return typeof value === 'object' && value != null && !Array.isArray(value)
}

export function requireRecord(value, context, adapter) {
  if (!isRecord(value)) adapterError(ERROR_CODES.ADAPTER_PARSE, `${context} must be an object`, { adapter })
  return value
}

function validateStructuredValue(value, context, state, depth = 0) {
  if (depth > MAX_DATA_DEPTH) adapterError(ERROR_CODES.ADAPTER_PARSE, `${context} exceeds maximum nesting depth`)
  if (value == null || ['string', 'number', 'boolean'].includes(typeof value)) return
  if (typeof value !== 'object') adapterError(ERROR_CODES.ADAPTER_PARSE, `${context} contains an unsupported value`)
  if (state.seen.has(value)) adapterError(ERROR_CODES.ADAPTER_PARSE, `${context} contains a recursive alias`)
  state.seen.add(value)
  state.entries++
  if (state.entries > MAX_DATA_ENTRIES) adapterError(ERROR_CODES.ADAPTER_PARSE, `${context} is too large`)

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index++) {
      validateStructuredValue(value[index], `${context}[${index}]`, state, depth + 1)
    }
  } else {
    for (const [key, entry] of Object.entries(value)) {
      if (FORBIDDEN_KEYS.has(key)) adapterError(ERROR_CODES.ADAPTER_PARSE, `${context} contains forbidden key "${key}"`)
      validateStructuredValue(entry, `${context}.${key}`, state, depth + 1)
    }
  }
  state.seen.delete(value)
}

export function parseStructuredDocuments(source, { adapter }) {
  assertSourceText(source, adapter)
  let documents
  try {
    const trimmed = source.trimStart()
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      documents = [JSON.parse(source)]
    } else {
      documents = []
      loadAll(source, (document) => {
        if (document != null) documents.push(document)
      }, { schema: JSON_SCHEMA })
    }
  } catch (error) {
    adapterError(ERROR_CODES.ADAPTER_PARSE, `${adapter} input could not be parsed`, { adapter }, error)
  }
  for (let index = 0; index < documents.length; index++) {
    validateStructuredValue(documents[index], `${adapter} document ${index + 1}`, { seen: new WeakSet(), entries: 0 })
  }
  return documents
}

export function stringArray(value) {
  if (value == null) return []
  if (typeof value === 'string') return [value]
  if (!Array.isArray(value)) return []
  return value.filter((entry) => typeof entry === 'string')
}

export function pushUniqueEdge(edges, seen, edge) {
  const discriminator = edge.discriminator || ''
  const key = JSON.stringify([
    serializeIdentity(edge.from),
    edge.relation,
    serializeIdentity(edge.to),
    discriminator
  ])
  if (seen.has(key)) return
  seen.add(key)
  edges.push(edge)
}

export function diagnostic(code, message, identity) {
  const result = { level: 'warning', code, message }
  if (identity) result.identity = identity
  return result
}

export function finalizeConfigProjection({ adapter, domain, locator, nodes, edges, modules = [], diagnostics = [] }, attributeAllowlist) {
  return finalizeGraphProjection(
    {
      version: 1,
      source: { adapter, domain, mode: 'declared', locator },
      nodes,
      edges,
      modules,
      diagnostics
    },
    { attributeAllowlist }
  )
}

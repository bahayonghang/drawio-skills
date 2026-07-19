import {
  AdapterContractError,
  ERROR_CODES,
  createEdgeIdentity,
  normalizeIdentity,
  serializeIdentity
} from './identity.js'

const MODES = new Set(['code', 'declared', 'live', 'drift'])
const SAFE_NAME = /^[a-z][a-z0-9-]{0,63}$/
const SENSITIVE_ATTRIBUTE_KEYS = new Set([
  'apikey',
  'body',
  'authorization',
  'bearertoken',
  'clientsecret',
  'credential',
  'credentials',
  'data',
  'environment',
  'password',
  'privatekey',
  'raw',
  'secret',
  'secrets',
  'stringdata',
  'token',
  'accesstoken'
])

const TOP_LEVEL_KEYS = new Set(['version', 'source', 'nodes', 'edges', 'modules', 'diagnostics'])
const SOURCE_KEYS = new Set(['adapter', 'domain', 'mode', 'locator'])
const NODE_KEYS = new Set(['identity', 'label', 'semanticType', 'moduleIdentity', 'attributes', 'icon'])
const EDGE_KEYS = new Set([
  'identity',
  'from',
  'to',
  'relation',
  'discriminator',
  'label',
  'semanticType',
  'attributes'
])
const MODULE_KEYS = new Set(['identity', 'label', 'attributes'])
const DIAGNOSTIC_KEYS = new Set(['level', 'code', 'message', 'identity'])

function projectionError(message, context = {}, cause) {
  throw new AdapterContractError(ERROR_CODES.PROJECTION_INVALID, message, context, { cause })
}

function isRecord(value) {
  return typeof value === 'object' && value != null && !Array.isArray(value)
}

function assertRecord(value, context) {
  if (!isRecord(value)) projectionError(`${context} must be an object`)
}

function assertKnownKeys(value, allowed, context) {
  const unknown = Object.keys(value).filter((key) => !allowed.has(key))
  if (unknown.length > 0) projectionError(`${context} has unknown field "${unknown[0]}"`)
}

function requireSafeString(value, context, { pattern, maxLength = 512 } = {}) {
  if (
    typeof value !== 'string' ||
    value.trim() === '' ||
    value.length > maxLength ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    projectionError(`${context} must be a non-empty safe string no longer than ${maxLength} characters`)
  }
  const normalized = value.trim()
  if (pattern && !pattern.test(normalized)) projectionError(`${context} has an invalid format`)
  return normalized
}

function normalizeLocator(value) {
  const locator = requireSafeString(value, 'projection source.locator').replaceAll('\\', '/')
  if (locator.startsWith('/') || /^[A-Za-z]:/.test(locator)) {
    projectionError('projection source.locator must be relative')
  }
  const parts = []
  for (const part of locator.split('/')) {
    if (part === '' || part === '.') continue
    if (part === '..') {
      if (parts.length === 0) projectionError('projection source.locator must remain below its source root')
      parts.pop()
    } else {
      parts.push(part)
    }
  }
  if (parts.length === 0) projectionError('projection source.locator must identify a relative source')
  return parts.join('/')
}

function normalizeSource(source) {
  assertRecord(source, 'projection source')
  assertKnownKeys(source, SOURCE_KEYS, 'projection source')
  const mode = requireSafeString(source.mode, 'projection source.mode', { maxLength: 16 })
  if (!MODES.has(mode)) projectionError(`projection source.mode must be one of ${[...MODES].join(', ')}`)
  return {
    adapter: requireSafeString(source.adapter, 'projection source.adapter', { pattern: SAFE_NAME, maxLength: 64 }),
    domain: requireSafeString(source.domain, 'projection source.domain', { pattern: SAFE_NAME, maxLength: 64 }),
    mode,
    locator: normalizeLocator(source.locator)
  }
}

function normalizeScalar(value, context) {
  if (value === null || typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) projectionError(`${context} must be finite`)
    return value
  }
  if (typeof value === 'string') {
    if (value.length > 1000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) {
      projectionError(`${context} must be a safe string no longer than 1000 characters`)
    }
    return value
  }
  projectionError(`${context} must be a JSON scalar`)
}

function normalizeAttributeValue(value, context, depth = 0) {
  if (Array.isArray(value)) {
    if (value.length > 100) projectionError(`${context} has too many array values`)
    return value.map((entry, index) => normalizeScalar(entry, `${context}[${index}]`))
  }
  if (isRecord(value) && depth === 0) {
    if (Object.keys(value).length > 32) projectionError(`${context} has too many nested fields`)
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => {
          assertAttributeKeySafe(key, `${context}.${key}`)
          return [key, normalizeAttributeValue(value[key], `${context}.${key}`, 1)]
        })
    )
  }
  return normalizeScalar(value, context)
}

function assertAttributeKeySafe(key, context) {
  const normalized = String(key).replace(/[-_]/g, '').toLowerCase()
  if (SENSITIVE_ATTRIBUTE_KEYS.has(normalized)) {
    projectionError(`${context} is a sensitive attribute and cannot enter a projection`)
  }
  if (!/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(key)) projectionError(`${context} has an invalid attribute name`)
}

function normalizeAttributes(attributes, kind, allowlist) {
  if (attributes == null) return {}
  assertRecord(attributes, `${kind} attributes`)
  if (Object.keys(attributes).length > 32) projectionError(`${kind} attributes has too many fields`)
  const allowed = new Set(allowlist?.[kind] || [])
  return Object.fromEntries(
    Object.keys(attributes)
      .sort()
      .map((key) => {
        assertAttributeKeySafe(key, `${kind} attribute "${key}"`)
        if (!allowed.has(key)) projectionError(`${kind} attribute "${key}" is not allowlisted`)
        return [key, normalizeAttributeValue(attributes[key], `${kind} attribute "${key}"`)]
      })
  )
}

function safeIdentity(identity, context) {
  try {
    return normalizeIdentity(identity)
  } catch (error) {
    if (error?.code === ERROR_CODES.IDENTITY_INVALID) {
      projectionError(`${context} is invalid: ${error.message}`, { identity }, error)
    }
    throw error
  }
}

function normalizeNode(node, attributeAllowlist) {
  assertRecord(node, 'projection node')
  assertKnownKeys(node, NODE_KEYS, 'projection node')
  const result = {
    identity: safeIdentity(node.identity, 'projection node identity'),
    label: requireSafeString(node.label, 'projection node label', { maxLength: 200 }),
    attributes: normalizeAttributes(node.attributes, 'node', attributeAllowlist)
  }
  if (node.semanticType != null) {
    result.semanticType = requireSafeString(node.semanticType, 'projection node semanticType', {
      pattern: /^[a-z][a-z0-9_-]{0,63}$/,
      maxLength: 64
    })
  }
  if (node.icon != null) {
    result.icon = requireSafeString(node.icon, 'projection node icon', {
      pattern: /^[A-Za-z][A-Za-z0-9._-]*$/,
      maxLength: 120
    })
  }
  if (node.moduleIdentity != null) {
    result.moduleIdentity = safeIdentity(node.moduleIdentity, 'projection node moduleIdentity')
  }
  return result
}

function normalizeModule(module, attributeAllowlist) {
  assertRecord(module, 'projection module')
  assertKnownKeys(module, MODULE_KEYS, 'projection module')
  return {
    identity: safeIdentity(module.identity, 'projection module identity'),
    label: requireSafeString(module.label, 'projection module label', { maxLength: 200 }),
    attributes: normalizeAttributes(module.attributes, 'module', attributeAllowlist)
  }
}

function normalizeDiagnostic(diagnostic) {
  assertRecord(diagnostic, 'projection diagnostic')
  assertKnownKeys(diagnostic, DIAGNOSTIC_KEYS, 'projection diagnostic')
  const level = requireSafeString(diagnostic.level, 'projection diagnostic.level', { maxLength: 16 })
  if (!['info', 'warning'].includes(level)) projectionError('projection diagnostic.level must be info or warning')
  const result = {
    level,
    code: requireSafeString(diagnostic.code, 'projection diagnostic.code', {
      pattern: /^[A-Z][A-Z0-9_]{0,63}$/,
      maxLength: 64
    }),
    message: requireSafeString(diagnostic.message, 'projection diagnostic.message', { maxLength: 500 })
  }
  if (diagnostic.identity != null) result.identity = safeIdentity(diagnostic.identity, 'projection diagnostic identity')
  return result
}

function assertUniqueIdentities(items, kind) {
  const seen = new Set()
  for (const item of items) {
    const key = serializeIdentity(item.identity)
    if (seen.has(key)) projectionError(`duplicate ${kind} identity "${item.identity.scheme}:${item.identity.key}"`)
    seen.add(key)
  }
  return seen
}

function normalizeEdges(edges, nodeIdentities, attributeAllowlist) {
  const relationCounts = new Map()
  const normalized = edges.map((edge) => {
    assertRecord(edge, 'projection edge')
    assertKnownKeys(edge, EDGE_KEYS, 'projection edge')
    const from = safeIdentity(edge.from, 'projection edge.from')
    const to = safeIdentity(edge.to, 'projection edge.to')
    const relation = requireSafeString(edge.relation, 'projection edge.relation', {
      pattern: /^[a-z][a-z0-9-]{0,63}$/,
      maxLength: 64
    })
    const discriminator =
      edge.discriminator == null
        ? ''
        : requireSafeString(edge.discriminator, 'projection edge.discriminator', { maxLength: 256 })
    const baseKey = JSON.stringify([serializeIdentity(from), relation, serializeIdentity(to)])
    relationCounts.set(baseKey, [...(relationCounts.get(baseKey) || []), discriminator])
    const identity = createEdgeIdentity({ from, to, relation, discriminator })
    if (
      edge.identity != null &&
      serializeIdentity(safeIdentity(edge.identity, 'projection edge identity')) !== serializeIdentity(identity)
    ) {
      projectionError('projection edge identity does not match its endpoints, relation, and discriminator')
    }
    const result = {
      identity,
      from,
      to,
      relation,
      attributes: normalizeAttributes(edge.attributes, 'edge', attributeAllowlist)
    }
    if (discriminator) result.discriminator = discriminator
    if (edge.label != null) result.label = requireSafeString(edge.label, 'projection edge label', { maxLength: 200 })
    if (edge.semanticType != null) {
      result.semanticType = requireSafeString(edge.semanticType, 'projection edge semanticType', {
        pattern: /^[a-z][a-z0-9_-]{0,63}$/,
        maxLength: 64
      })
    }
    return result
  })

  for (const discriminators of relationCounts.values()) {
    if (discriminators.length > 1 && discriminators.some((value) => value === '')) {
      projectionError('parallel edges with the same endpoints and relation require a stable discriminator')
    }
  }

  for (const edge of normalized) {
    if (!nodeIdentities.has(serializeIdentity(edge.from)))
      projectionError('projection edge references an unknown source')
    if (!nodeIdentities.has(serializeIdentity(edge.to))) projectionError('projection edge references an unknown target')
  }
  assertUniqueIdentities(normalized, 'edge')
  return normalized
}

export function finalizeGraphProjection(projection, { attributeAllowlist = {} } = {}) {
  assertRecord(projection, 'projection')
  assertKnownKeys(projection, TOP_LEVEL_KEYS, 'projection')
  if (projection.version !== 1) projectionError('projection version must be 1')
  for (const field of ['nodes', 'edges', 'modules', 'diagnostics']) {
    if (!Array.isArray(projection[field])) projectionError(`projection ${field} must be an array`)
  }
  if (projection.nodes.length > 100) projectionError('projection has more than 100 nodes')
  if (projection.edges.length > 200) projectionError('projection has more than 200 edges')
  if (projection.modules.length > 20) projectionError('projection has more than 20 modules')

  const source = normalizeSource(projection.source)
  const nodes = projection.nodes.map((node) => normalizeNode(node, attributeAllowlist))
  const modules = projection.modules.map((module) => normalizeModule(module, attributeAllowlist))
  const nodeIdentities = assertUniqueIdentities(nodes, 'node')
  const moduleIdentities = assertUniqueIdentities(modules, 'module')
  for (const node of nodes) {
    if (node.moduleIdentity && !moduleIdentities.has(serializeIdentity(node.moduleIdentity))) {
      projectionError(`projection node "${node.label}" references an unknown module`)
    }
  }
  const edges = normalizeEdges(projection.edges, nodeIdentities, attributeAllowlist)
  const diagnostics = projection.diagnostics.map(normalizeDiagnostic)

  const compareText = (left, right) => (left < right ? -1 : left > right ? 1 : 0)
  const byIdentity = (left, right) => compareText(serializeIdentity(left.identity), serializeIdentity(right.identity))
  return {
    version: 1,
    source,
    nodes: nodes.sort(byIdentity),
    edges: edges.sort(byIdentity),
    modules: modules.sort(byIdentity),
    diagnostics: diagnostics.sort((left, right) =>
      compareText(`${left.level}\0${left.code}\0${left.message}`, `${right.level}\0${right.code}\0${right.message}`)
    )
  }
}

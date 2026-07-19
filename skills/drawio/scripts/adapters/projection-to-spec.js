import {
  AdapterContractError,
  ERROR_CODES,
  createRendererId,
  normalizeIdentity,
  serializeIdentity
} from './identity.js'

const RELATION_TYPES = new Map([
  ['async', 'async'],
  ['data', 'data'],
  ['feedback', 'feedback'],
  ['bidirectional', 'bidirectional']
])

function projectionError(message) {
  throw new AdapterContractError(ERROR_CODES.PROJECTION_INVALID, message)
}

function buildIdMap(items, kind, hash) {
  const identityToId = new Map()
  const idToIdentity = new Map()
  for (const item of items) {
    const identity = normalizeIdentity(item.identity)
    const serialized = serializeIdentity(identity)
    const id = createRendererId(identity, { kind, hash })
    const existing = idToIdentity.get(id)
    if (existing && existing !== serialized) {
      throw new AdapterContractError(
        ERROR_CODES.IDENTITY_COLLISION,
        `renderer id collision for "${id}" between two distinct identities`,
        { identity }
      )
    }
    identityToId.set(serialized, id)
    idToIdentity.set(id, serialized)
  }
  return identityToId
}

function copyIdentity(identity) {
  const normalized = normalizeIdentity(identity)
  return { ...normalized }
}

export function projectGraphToSpec(projection, { hash } = {}) {
  if (
    projection?.version !== 1 ||
    typeof projection.source !== 'object' ||
    projection.source == null ||
    !Array.isArray(projection.nodes) ||
    !Array.isArray(projection.edges) ||
    !Array.isArray(projection.modules) ||
    !Array.isArray(projection.diagnostics)
  ) {
    projectionError('projectGraphToSpec requires a finalized CanonicalGraphProjection v1')
  }

  const nodeIds = buildIdMap(projection.nodes, 'node', hash)
  const edgeIds = buildIdMap(projection.edges, 'edge', hash)
  const moduleIds = buildIdMap(projection.modules || [], 'module', hash)

  const modules = (projection.modules || []).map((module) => ({
    id: moduleIds.get(serializeIdentity(module.identity)),
    label: module.label,
    identity: copyIdentity(module.identity)
  }))

  const nodes = projection.nodes.map((node) => {
    const result = {
      id: nodeIds.get(serializeIdentity(node.identity)),
      label: node.label,
      type: node.semanticType || 'service',
      identity: copyIdentity(node.identity)
    }
    if (node.icon) result.icon = node.icon
    if (node.moduleIdentity) {
      const moduleId = moduleIds.get(serializeIdentity(node.moduleIdentity))
      if (!moduleId) projectionError(`node "${node.label}" references a module not present in the projection`)
      result.module = moduleId
    }
    return result
  })

  const edges = projection.edges.map((edge) => {
    const from = nodeIds.get(serializeIdentity(edge.from))
    const to = nodeIds.get(serializeIdentity(edge.to))
    if (!from || !to) projectionError('edge references a node not present in the projection')
    const result = {
      id: edgeIds.get(serializeIdentity(edge.identity)),
      from,
      to,
      type: edge.semanticType || RELATION_TYPES.get(edge.relation) || 'dependency',
      identity: copyIdentity(edge.identity)
    }
    if (edge.label) result.label = edge.label
    return result
  })

  return {
    meta: {
      source: 'generated',
      layout: 'hierarchical',
      adapter: {
        projectionVersion: 1,
        name: projection.source.adapter,
        domain: projection.source.domain,
        mode: projection.source.mode,
        locator: projection.source.locator
      }
    },
    nodes,
    edges,
    modules
  }
}

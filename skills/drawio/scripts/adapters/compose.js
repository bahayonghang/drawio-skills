import {
  ERROR_CODES,
  createComposeIdentity,
  createComposeResourceIdentity
} from './identity.js'
import {
  adapterError,
  diagnostic,
  finalizeConfigProjection,
  isRecord,
  parseStructuredDocuments,
  pushUniqueEdge,
  requireRecord,
  stringArray
} from './config-common.js'

const ADAPTER = 'compose-config'

export const COMPOSE_ATTRIBUTE_ALLOWLIST = Object.freeze({
  node: ['image', 'kind', 'project', 'replicas', 'service'],
  edge: [],
  module: []
})

export function buildComposeIdentityInput(service, { project } = {}) {
  return { project, service }
}

function composeReplicas(service) {
  const replicas = service?.deploy?.replicas
  if (replicas == null) return 1
  if (!Number.isInteger(replicas) || replicas < 1 || replicas > 10000) {
    adapterError(ERROR_CODES.ADAPTER_PARSE, 'Compose deploy.replicas must be an integer from 1 to 10000', {
      adapter: ADAPTER
    })
  }
  return replicas
}

function resourceReferences(service, key) {
  const value = service?.[key]
  if (Array.isArray(value)) return value
  if (isRecord(value)) return Object.keys(value)
  return []
}

function namedVolumeSource(mount) {
  if (/^[A-Za-z]:[\\/]/.test(mount) || /^[./~]/.test(mount)) return null
  const source = mount.split(':', 1)[0]
  return source || null
}

export function parseComposeConfig(source, { project, locator = 'compose.yaml' } = {}) {
  const documents = parseStructuredDocuments(source, { adapter: ADAPTER })
  if (documents.length !== 1) adapterError(ERROR_CODES.ADAPTER_PARSE, 'Compose input must contain one document', { adapter: ADAPTER })
  const document = requireRecord(documents[0], 'Compose document', ADAPTER)
  const resolvedProject = project || document.name
  if (typeof resolvedProject !== 'string' || resolvedProject.trim() === '') {
    adapterError(ERROR_CODES.ADAPTER_PARSE, 'Compose project must be provided by top-level name or project option', { adapter: ADAPTER })
  }
  const services = requireRecord(document.services, 'Compose services', ADAPTER)
  const networks = isRecord(document.networks) ? document.networks : {}
  const volumes = isRecord(document.volumes) ? document.volumes : {}

  const nodes = []
  const identities = new Map()
  for (const [name, value] of Object.entries(services)) {
    const service = requireRecord(value, `Compose service ${name}`, ADAPTER)
    const identity = createComposeIdentity(buildComposeIdentityInput(name, { project: resolvedProject }))
    identities.set(`service:${name}`, identity)
    nodes.push({
      identity,
      label: name,
      semanticType: 'service',
      attributes: {
        kind: 'service',
        project: resolvedProject,
        replicas: composeReplicas(service),
        service: name,
        ...(typeof service.image === 'string' ? { image: service.image } : {})
      }
    })
  }
  for (const name of Object.keys(networks)) {
    const identity = createComposeResourceIdentity({ project: resolvedProject, kind: 'network', name })
    identities.set(`network:${name}`, identity)
    nodes.push({ identity, label: name, semanticType: 'subnet', attributes: { kind: 'network', project: resolvedProject } })
  }
  for (const name of Object.keys(volumes)) {
    const identity = createComposeResourceIdentity({ project: resolvedProject, kind: 'volume', name })
    identities.set(`volume:${name}`, identity)
    nodes.push({ identity, label: name, semanticType: 'database', attributes: { kind: 'volume', project: resolvedProject } })
  }

  const edges = []
  const edgeKeys = new Set()
  const diagnostics = []
  const add = (from, kind, name, relation, discriminator) => {
    const target = identities.get(`${kind}:${name}`)
    if (!target) {
      diagnostics.push(diagnostic('COMPOSE_EXTERNAL_REF', `Compose service references undeclared ${kind} "${name}".`, from))
      return
    }
    pushUniqueEdge(edges, edgeKeys, { from, to: target, relation, discriminator, attributes: {} })
  }

  for (const [name, service] of Object.entries(services)) {
    const from = identities.get(`service:${name}`)
    for (const dependency of resourceReferences(service, 'depends_on')) {
      add(from, 'service', String(dependency), 'depends-on', `depends_on:${dependency}`)
    }
    for (const link of stringArray(service.links)) {
      const target = link.split(':', 1)[0]
      add(from, 'service', target, 'links', `link:${link}`)
    }
    for (const dependency of stringArray(service.volumes_from)) {
      const target = dependency.split(':', 1)[0]
      add(from, 'service', target, 'volumes-from', `volumes_from:${dependency}`)
    }
    for (const network of resourceReferences(service, 'networks')) {
      add(from, 'network', String(network), 'uses-network', `network:${network}`)
    }
    for (const mount of stringArray(service.volumes)) {
      const sourceName = namedVolumeSource(mount)
      if (!sourceName) continue
      add(from, 'volume', sourceName, 'mounts', `volume:${sourceName}`)
    }
  }

  return finalizeConfigProjection(
    { adapter: ADAPTER, domain: 'compose', locator, nodes, edges, diagnostics },
    COMPOSE_ATTRIBUTE_ALLOWLIST
  )
}

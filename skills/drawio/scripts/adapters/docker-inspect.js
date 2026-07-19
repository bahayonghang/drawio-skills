import { ERROR_CODES, createComposeIdentity, serializeIdentity } from './identity.js'
import {
  adapterError,
  diagnostic,
  finalizeConfigProjection,
  isRecord,
  parseJsonDocument,
  pushUniqueEdge
} from './config-common.js'
import { COMPOSE_ATTRIBUTE_ALLOWLIST, buildComposeIdentityInput } from './compose.js'

const ADAPTER = 'docker-inspect'
const PROJECT_LABEL = 'com.docker.compose.project'
const SERVICE_LABEL = 'com.docker.compose.service'
const DEPENDS_ON_LABEL = 'com.docker.compose.depends_on'

function composeLabels(container) {
  const labels = isRecord(container.Config?.Labels) ? container.Config.Labels : {}
  const project = labels[PROJECT_LABEL]
  const service = labels[SERVICE_LABEL]
  if (typeof project !== 'string' || typeof service !== 'string') return null
  return { project, service, dependsOn: labels[DEPENDS_ON_LABEL] }
}

function dependencyServices(value) {
  if (typeof value !== 'string') return []
  return [...new Set(value.split(',').map((entry) => entry.trim().split(':', 1)[0]).filter(Boolean))].sort()
}

export function parseDockerInspectSnapshot(source, { locator = 'docker-inspect.json' } = {}) {
  const document = parseJsonDocument(source, { adapter: ADAPTER })
  if (!Array.isArray(document)) {
    adapterError(ERROR_CODES.ADAPTER_PARSE, 'Docker inspect snapshot must be a JSON array', { adapter: ADAPTER })
  }

  const services = new Map()
  let standalone = 0
  for (const container of document) {
    if (!isRecord(container)) {
      adapterError(ERROR_CODES.ADAPTER_PARSE, 'Docker inspect container must be an object', { adapter: ADAPTER })
    }
    const labels = composeLabels(container)
    if (!labels) {
      standalone++
      continue
    }
    const identity = createComposeIdentity(buildComposeIdentityInput(labels.service, { project: labels.project }))
    const key = serializeIdentity(identity)
    const image = typeof container.Config?.Image === 'string' ? container.Config.Image : null
    const current = services.get(key)
    if (current && current.image !== image) {
      adapterError(ERROR_CODES.ADAPTER_PARSE, 'Docker inspect replicas have inconsistent image values', {
        adapter: ADAPTER,
        identity
      })
    }
    const record = current || {
      identity,
      project: labels.project,
      service: labels.service,
      image,
      replicas: 0,
      dependsOn: new Set()
    }
    record.replicas++
    for (const dependency of dependencyServices(labels.dependsOn)) record.dependsOn.add(dependency)
    services.set(key, record)
  }
  if (services.size === 0) {
    adapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'Docker inspect snapshot contains no Compose-managed containers', {
      adapter: ADAPTER
    })
  }

  const nodes = [...services.values()].map((record) => ({
    identity: record.identity,
    label: record.service,
    semanticType: 'service',
    attributes: {
      kind: 'service',
      project: record.project,
      replicas: record.replicas,
      service: record.service,
      ...(record.image ? { image: record.image } : {})
    }
  }))
  const byProjectService = new Map(
    [...services.values()].map((record) => [`${record.project}\0${record.service}`, record.identity])
  )
  const edges = []
  const edgeKeys = new Set()
  const diagnostics = []
  for (const record of services.values()) {
    for (const dependency of record.dependsOn) {
      const target = byProjectService.get(`${record.project}\0${dependency}`)
      if (!target) {
        diagnostics.push(
          diagnostic('DOCKER_EXTERNAL_DEPENDENCY', 'Compose service dependency is outside the inspect snapshot.', record.identity)
        )
        continue
      }
      pushUniqueEdge(edges, edgeKeys, {
        from: record.identity,
        to: target,
        relation: 'depends-on',
        discriminator: `depends_on:${dependency}`,
        attributes: {}
      })
    }
  }
  if (standalone > 0) {
    diagnostics.push(
      diagnostic('DOCKER_STANDALONE_EXCLUDED', `Standalone containers were excluded. Count: ${standalone}.`)
    )
  }
  diagnostics.push(
    diagnostic(
      'DOCKER_RESOURCE_PARITY_DEFERRED',
      'Docker network and volume parity requires separately approved metadata and was not inferred.'
    )
  )

  return finalizeConfigProjection(
    { adapter: ADAPTER, domain: 'compose', mode: 'live', locator, nodes, edges, diagnostics },
    COMPOSE_ATTRIBUTE_ALLOWLIST
  )
}

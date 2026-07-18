import {
  AdapterContractError,
  ERROR_CODES,
  createKubernetesIdentity,
  serializeIdentity
} from './identity.js'
import {
  adapterError,
  diagnostic,
  finalizeConfigProjection,
  isRecord,
  parseStructuredDocuments,
  pushUniqueEdge,
  requireRecord
} from './config-common.js'

const ADAPTER = 'kubernetes-config'
const CLUSTER_SCOPED_KINDS = new Set([
  'ClusterRole',
  'ClusterRoleBinding',
  'CustomResourceDefinition',
  'Namespace',
  'Node',
  'PersistentVolume',
  'StorageClass'
])
const NAMESPACED_KINDS = new Set([
  'ConfigMap',
  'CronJob',
  'DaemonSet',
  'Deployment',
  'HorizontalPodAutoscaler',
  'Ingress',
  'Job',
  'NetworkPolicy',
  'PersistentVolumeClaim',
  'Pod',
  'Role',
  'RoleBinding',
  'Secret',
  'Service',
  'ServiceAccount',
  'StatefulSet'
])
const WORKLOAD_KINDS = new Set(['CronJob', 'DaemonSet', 'Deployment', 'Job', 'Pod', 'StatefulSet'])

export const KUBERNETES_ATTRIBUTE_ALLOWLIST = Object.freeze({
  node: ['apiVersion', 'kind', 'namespace', 'replicas'],
  edge: [],
  module: []
})

function resolveNamespaced(kind, kindScopes) {
  if (Object.hasOwn(kindScopes, kind)) {
    if (typeof kindScopes[kind] !== 'boolean') {
      adapterError(ERROR_CODES.ADAPTER_PARSE, `Kubernetes kindScopes.${kind} must be boolean`, { adapter: ADAPTER })
    }
    return kindScopes[kind]
  }
  if (CLUSTER_SCOPED_KINDS.has(kind)) return false
  if (NAMESPACED_KINDS.has(kind)) return true
  adapterError(
    ERROR_CODES.ADAPTER_UNSUPPORTED,
    `Kubernetes kind "${kind}" has unknown namespace scope; provide kindScopes.${kind}`,
    { adapter: ADAPTER }
  )
}

function flattenDocuments(documents) {
  const objects = []
  for (const document of documents) {
    if (Array.isArray(document)) objects.push(...document)
    else if (document?.kind === 'List' && Array.isArray(document.items)) objects.push(...document.items)
    else objects.push(document)
  }
  return objects
}

function semanticType(kind) {
  if (['ConfigMap', 'Secret'].includes(kind)) return 'document'
  if (['PersistentVolume', 'PersistentVolumeClaim', 'StorageClass'].includes(kind)) return 'database'
  if (kind === 'Ingress' || kind === 'Service') return 'gateway'
  if (kind === 'Namespace') return 'subnet'
  return 'service'
}

function workloadPodSpec(object) {
  if (object.kind === 'Pod') return object.spec
  if (object.kind === 'CronJob') return object.spec?.jobTemplate?.spec?.template?.spec
  return object.spec?.template?.spec
}

function workloadLabels(object) {
  if (object.kind === 'Pod') return object.metadata?.labels || {}
  if (object.kind === 'CronJob') return object.spec?.jobTemplate?.spec?.template?.metadata?.labels || {}
  return object.spec?.template?.metadata?.labels || {}
}

function collectWorkloadRefs(object) {
  const refs = []
  const podSpec = workloadPodSpec(object)
  if (!isRecord(podSpec)) return refs
  for (const volume of Array.isArray(podSpec.volumes) ? podSpec.volumes : []) {
    if (volume?.configMap?.name) refs.push({ kind: 'ConfigMap', name: volume.configMap.name, source: `volume:${volume.name}` })
    if (volume?.secret?.secretName) refs.push({ kind: 'Secret', name: volume.secret.secretName, source: `volume:${volume.name}` })
    if (volume?.persistentVolumeClaim?.claimName) {
      refs.push({ kind: 'PersistentVolumeClaim', name: volume.persistentVolumeClaim.claimName, source: `volume:${volume.name}` })
    }
  }
  const containers = [...(podSpec.containers || []), ...(podSpec.initContainers || [])]
  for (const container of containers) {
    for (const envFrom of container?.envFrom || []) {
      if (envFrom?.configMapRef?.name) refs.push({ kind: 'ConfigMap', name: envFrom.configMapRef.name, source: `envFrom:${container.name}` })
      if (envFrom?.secretRef?.name) refs.push({ kind: 'Secret', name: envFrom.secretRef.name, source: `envFrom:${container.name}` })
    }
    for (const env of container?.env || []) {
      if (env?.valueFrom?.configMapKeyRef?.name) refs.push({ kind: 'ConfigMap', name: env.valueFrom.configMapKeyRef.name, source: `env:${container.name}:${env.name}` })
      if (env?.valueFrom?.secretKeyRef?.name) refs.push({ kind: 'Secret', name: env.valueFrom.secretKeyRef.name, source: `env:${container.name}:${env.name}` })
    }
  }
  return refs
}

function selectorMatches(selector, labels) {
  const entries = Object.entries(selector || {})
  return entries.length > 0 && entries.every(([key, value]) => labels?.[key] === value)
}

export function buildKubernetesIdentityInput(object, { scope, kindScopes = {} } = {}) {
  requireRecord(object, 'Kubernetes object', ADAPTER)
  const kind = object.kind
  const name = object.metadata?.name
  if (typeof kind !== 'string' || typeof name !== 'string') {
    adapterError(ERROR_CODES.ADAPTER_PARSE, 'Kubernetes object requires string kind and metadata.name', { adapter: ADAPTER })
  }
  const namespaced = resolveNamespaced(kind, kindScopes)
  return { scope, namespace: object.metadata?.namespace, kind, name, namespaced }
}

export function parseKubernetesManifests(source, { scope, locator = 'kubernetes.yaml', kindScopes = {} } = {}) {
  const documents = parseStructuredDocuments(source, { adapter: ADAPTER })
  const objects = flattenDocuments(documents).map((object) => requireRecord(object, 'Kubernetes object', ADAPTER))
  const records = objects.map((object) => {
    const input = buildKubernetesIdentityInput(object, { scope, kindScopes })
    const identity = createKubernetesIdentity(input)
    return { object, input, identity }
  })
  const byIdentity = new Map(records.map((record) => [serializeIdentity(record.identity), record]))
  const find = (kind, name, namespace = 'default') => {
    const namespaced = resolveNamespaced(kind, kindScopes)
    const identity = createKubernetesIdentity({ scope, namespace, kind, name, namespaced })
    return byIdentity.get(serializeIdentity(identity))
  }

  const nodes = records.map(({ object, input, identity }) => ({
    identity,
    label: object.metadata.name,
    semanticType: semanticType(object.kind),
    attributes: {
      apiVersion: object.apiVersion || 'v1',
      kind: object.kind,
      namespace: input.namespaced ? input.namespace || 'default' : '_cluster',
      ...(Number.isFinite(object.spec?.replicas) ? { replicas: object.spec.replicas } : {})
    }
  }))
  const edges = []
  const edgeKeys = new Set()
  const diagnostics = []
  const addRelation = (fromRecord, targetKind, targetName, relation, discriminator, namespace) => {
    let target
    try {
      target = find(targetKind, targetName, namespace || fromRecord.input.namespace || 'default')
    } catch (error) {
      if (error instanceof AdapterContractError && error.code === ERROR_CODES.ADAPTER_UNSUPPORTED) throw error
      throw error
    }
    if (!target) {
      diagnostics.push(diagnostic('KUBERNETES_EXTERNAL_REF', `${fromRecord.object.kind}/${fromRecord.object.metadata.name} references external ${targetKind}/${targetName}.`, fromRecord.identity))
      return
    }
    pushUniqueEdge(edges, edgeKeys, {
      from: fromRecord.identity,
      to: target.identity,
      relation,
      discriminator,
      attributes: {}
    })
  }

  for (const record of records) {
    const { object } = record
    const namespace = record.input.namespace || 'default'
    if (object.kind === 'Service') {
      for (const workload of records.filter((candidate) => WORKLOAD_KINDS.has(candidate.object.kind))) {
        if ((workload.input.namespace || 'default') !== namespace) continue
        if (selectorMatches(object.spec?.selector, workloadLabels(workload.object))) {
          pushUniqueEdge(edges, edgeKeys, {
            from: record.identity,
            to: workload.identity,
            relation: 'selects',
            discriminator: `selector:${object.metadata.name}->${workload.object.kind}/${workload.object.metadata.name}`,
            attributes: {}
          })
        }
      }
    }
    if (WORKLOAD_KINDS.has(object.kind)) {
      for (const ref of collectWorkloadRefs(object)) {
        addRelation(record, ref.kind, ref.name, 'references', ref.source, namespace)
      }
    }
    if (object.kind === 'Ingress') {
      for (const rule of object.spec?.rules || []) {
        for (const path of rule?.http?.paths || []) {
          const serviceName = path?.backend?.service?.name
          if (serviceName) addRelation(record, 'Service', serviceName, 'routes-to', `rule:${serviceName}`, namespace)
        }
      }
      const defaultService = object.spec?.defaultBackend?.service?.name
      if (defaultService) addRelation(record, 'Service', defaultService, 'routes-to', `default:${defaultService}`, namespace)
    }
    if (object.kind === 'HorizontalPodAutoscaler' && object.spec?.scaleTargetRef?.name) {
      addRelation(
        record,
        object.spec.scaleTargetRef.kind,
        object.spec.scaleTargetRef.name,
        'scales',
        `target:${object.spec.scaleTargetRef.kind}/${object.spec.scaleTargetRef.name}`,
        namespace
      )
    }
  }

  return finalizeConfigProjection(
    { adapter: ADAPTER, domain: 'kubernetes', locator, nodes, edges, diagnostics },
    KUBERNETES_ATTRIBUTE_ALLOWLIST
  )
}

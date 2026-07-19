import {
  AdapterContractError,
  ERROR_CODES,
  createGroupIdentity,
  serializeIdentity
} from './identity.js'
import { finalizeGraphProjection } from './graph-projection.js'
import { projectGraphToSpec } from './projection-to-spec.js'
import { applyAutoLayout } from '../dsl/auto-layout.js'
import { specToDrawioXml, validateSpec, validateXml } from '../dsl/spec-to-drawio.js'

const LEGEND_IDENTITY = createGroupIdentity({ domain: 'drift', key: 'legend' })
const NODE_STYLES = Object.freeze({
  added: { fillColor: '#DCFCE7', strokeColor: '#15803D' },
  removed: { fillColor: '#FEE2E2', strokeColor: '#B91C1C' },
  changed: { fillColor: '#FEF3C7', strokeColor: '#B45309' },
  unchanged: { fillColor: '#F1F5F9', strokeColor: '#64748B' }
})
const EDGE_STYLES = Object.freeze({
  added: { strokeColor: '#15803D', strokeWidth: 2 },
  removed: { strokeColor: '#B91C1C', strokeWidth: 2, dashed: true, dashPattern: '6 4' },
  changed: { strokeColor: '#B45309', strokeWidth: 2 },
  unchanged: { strokeColor: '#64748B', strokeWidth: 1 }
})

function driftError(message) {
  throw new AdapterContractError(ERROR_CODES.DRIFT_INCOMPATIBLE, message, { adapter: 'graph-drift' })
}

function projectionError(message) {
  throw new AdapterContractError(ERROR_CODES.PROJECTION_INVALID, message, { adapter: 'graph-drift' })
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0
}

function requireComparisonContext(value) {
  if (
    typeof value !== 'string' ||
    value.trim() === '' ||
    value.length > 160 ||
    /[\\/\u0000-\u001f\u007f]/.test(value)
  ) {
    driftError('Drift comparison requires a safe explicit logical context for both projections')
  }
  return value.trim()
}

function emptyBuckets() {
  return { added: [], removed: [], changed: [], unchanged: [] }
}

function indexByIdentity(items, kind) {
  const index = new Map()
  for (const item of items) {
    const key = serializeIdentity(item.identity)
    if (index.has(key)) {
      throw new AdapterContractError(ERROR_CODES.IDENTITY_COLLISION, `Duplicate ${kind} identity in drift input`, {
        adapter: 'graph-drift',
        identity: item.identity
      })
    }
    index.set(key, item)
  }
  return index
}

function clone(value) {
  return structuredClone(value)
}

function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function nodeSnapshot(node) {
  return { label: node.label, attributes: clone(node.attributes) }
}

function edgeSnapshot(edge) {
  const snapshot = {
    from: clone(edge.from),
    to: clone(edge.to),
    relation: edge.relation,
    attributes: clone(edge.attributes)
  }
  if (edge.label != null) snapshot.label = edge.label
  return snapshot
}

function attributeRecord(owner, identity, key, before, after, hasBefore, hasAfter) {
  const record = { owner, identity: clone(identity), key }
  if (hasBefore) record.before = clone(before)
  if (hasAfter) record.after = clone(after)
  return record
}

function compareAttributes(owner, identity, beforeAttributes, afterAttributes, buckets) {
  const before = beforeAttributes || {}
  const after = afterAttributes || {}
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort()
  const changedKeys = []
  for (const key of keys) {
    const hasBefore = Object.hasOwn(before, key)
    const hasAfter = Object.hasOwn(after, key)
    const record = attributeRecord(owner, identity, key, before[key], after[key], hasBefore, hasAfter)
    if (!hasBefore) {
      buckets.added.push(record)
      changedKeys.push(`attributes.${key}`)
    } else if (!hasAfter) {
      buckets.removed.push(record)
      changedKeys.push(`attributes.${key}`)
    } else if (!sameValue(before[key], after[key])) {
      buckets.changed.push(record)
      changedKeys.push(`attributes.${key}`)
    } else {
      buckets.unchanged.push(record)
    }
  }
  return changedKeys
}

function sortAttributeBuckets(buckets) {
  for (const records of Object.values(buckets)) {
    records.sort((left, right) =>
      compareText(
        `${serializeIdentity(left.identity)}\0${left.owner}\0${left.key}`,
        `${serializeIdentity(right.identity)}\0${right.owner}\0${right.key}`
      )
    )
  }
  return buckets
}

function compareEntities(baselineItems, observedItems, kind, snapshot, attributeBuckets) {
  const buckets = emptyBuckets()
  const baseline = indexByIdentity(baselineItems, kind)
  const observed = indexByIdentity(observedItems, kind)
  const identities = [...new Set([...baseline.keys(), ...observed.keys()])].sort()

  for (const key of identities) {
    const before = baseline.get(key)
    const after = observed.get(key)
    const identity = before?.identity || after.identity
    const attributeChanges = compareAttributes(
      kind,
      identity,
      before?.attributes,
      after?.attributes,
      attributeBuckets
    )
    if (!before) {
      buckets.added.push({ identity: clone(identity), after: snapshot(after) })
      continue
    }
    if (!after) {
      buckets.removed.push({ identity: clone(identity), before: snapshot(before) })
      continue
    }
    const changedKeys = [...attributeChanges]
    if (before.label !== after.label) changedKeys.push('label')
    changedKeys.sort()
    const record = {
      identity: clone(identity),
      before: snapshot(before),
      after: snapshot(after)
    }
    if (changedKeys.length > 0) {
      record.changedKeys = changedKeys
      buckets.changed.push(record)
    } else {
      buckets.unchanged.push(record)
    }
  }
  return buckets
}

function projectionPairIndex(baseline, observed, kind) {
  return {
    baseline: indexByIdentity(baseline[kind], kind.slice(0, -1)),
    observed: indexByIdentity(observed[kind], kind.slice(0, -1))
  }
}

function statusIndex(section) {
  const index = new Map()
  for (const status of ['added', 'removed', 'changed', 'unchanged']) {
    if (!Array.isArray(section?.[status])) driftError('Drift report status buckets are invalid')
    for (const record of section[status]) {
      const key = serializeIdentity(record.identity)
      if (index.has(key)) driftError('Drift report assigns more than one status to an identity')
      index.set(key, { status, record })
    }
  }
  return index
}

function statusLabel(status, label, changedKeys = []) {
  const token = status.toUpperCase()
  return changedKeys.length > 0 ? `[${token}: ${changedKeys.join(', ')}] ${label}` : `[${token}] ${label}`
}

function sourceItem(indexes, key, status) {
  const item = status === 'removed' ? indexes.baseline.get(key) : indexes.observed.get(key)
  if (!item) driftError('Drift report identity is absent from its projection source')
  return item
}

export function createDriftProjection(report, baseline, observed, { locator = 'drift/report-v1.json' } = {}) {
  if (report?.version !== 1) driftError('Drift report version must be 1')
  if (baseline?.version !== 1 || observed?.version !== 1) {
    driftError('Drift projection creation requires projection version 1 on both sides')
  }
  if (baseline?.source?.domain !== observed?.source?.domain) {
    driftError('Drift projection domains do not match')
  }

  const nodeSources = projectionPairIndex(baseline, observed, 'nodes')
  const edgeSources = projectionPairIndex(baseline, observed, 'edges')
  const nodeStatuses = statusIndex(report.nodes)
  const edgeStatuses = statusIndex(report.edges)
  const nodes = [...nodeStatuses]
    .sort(([left], [right]) => compareText(left, right))
    .map(([key, { status, record }]) => {
      const source = sourceItem(nodeSources, key, status)
      const result = {
        identity: clone(source.identity),
        label: statusLabel(status, source.label, record.changedKeys),
        attributes: {}
      }
      if (source.semanticType) result.semanticType = source.semanticType
      if (source.icon) result.icon = source.icon
      return result
    })
  nodes.push({
    identity: LEGEND_IDENTITY,
    label:
      'Legend: [ADDED] live only | [REMOVED] declared only, dashed | [CHANGED] matched identity differs | [UNCHANGED] no compared difference',
    semanticType: 'text',
    attributes: {}
  })

  const edges = [...edgeStatuses]
    .sort(([left], [right]) => compareText(left, right))
    .map(([key, { status, record }]) => {
      const source = sourceItem(edgeSources, key, status)
      const label = source.label || source.relation
      const result = {
        identity: clone(source.identity),
        from: clone(source.from),
        to: clone(source.to),
        relation: source.relation,
        label: statusLabel(status, label, record.changedKeys),
        attributes: {}
      }
      if (source.discriminator) result.discriminator = source.discriminator
      if (source.semanticType) result.semanticType = source.semanticType
      return result
    })

  return finalizeGraphProjection({
    version: 1,
    source: {
      adapter: 'graph-drift',
      domain: baseline.source.domain,
      mode: 'drift',
      locator
    },
    nodes,
    edges,
    modules: [],
    diagnostics: []
  })
}

export function projectDriftReportToSpec(report, baseline, observed, { locator, hash } = {}) {
  const projection = createDriftProjection(report, baseline, observed, { locator })
  const spec = projectGraphToSpec(projection, { hash })
  const nodeStatuses = statusIndex(report.nodes)
  const edgeStatuses = statusIndex(report.edges)
  const legendKey = serializeIdentity(LEGEND_IDENTITY)

  spec.meta.legend =
    '[ADDED] live only; [REMOVED] declared only and dashed; [CHANGED] matched identity differs; [UNCHANGED] no compared difference'
  spec.nodes = spec.nodes.map((node) => {
    const key = serializeIdentity(node.identity)
    if (key === legendKey) return node
    const status = nodeStatuses.get(key)?.status
    if (!status) driftError('Drift node has no report status')
    return { ...node, style: { ...NODE_STYLES[status], ...(status === 'removed' ? { dashed: true } : {}) } }
  })
  spec.edges = spec.edges.map((edge) => {
    const status = edgeStatuses.get(serializeIdentity(edge.identity))?.status
    if (!status) driftError('Drift edge has no report status')
    return { ...edge, style: { ...EDGE_STYLES[status] } }
  })
  validateSpec(spec)
  return spec
}

export async function renderDriftGraph(report, baseline, observed, { locator, hash, elk } = {}) {
  const projected = projectDriftReportToSpec(report, baseline, observed, { locator, hash })
  const layout = await applyAutoLayout(projected, elk === undefined ? {} : { elk })
  if (!layout.applied) {
    projectionError('JavaScript ELK did not produce the required drift layout')
  }
  validateSpec(layout.spec)
  const xml = specToDrawioXml(layout.spec, { silent: true })
  const xmlValidation = validateXml(xml)
  if (!xmlValidation.valid) projectionError('Rendered drift XML failed validation')
  return {
    projection: createDriftProjection(report, baseline, observed, { locator }),
    spec: layout.spec,
    xml,
    xmlValidation,
    layoutApplied: true
  }
}

export function compareGraphProjections(baseline, observed, { baselineContext, observedContext } = {}) {
  if (baseline?.version !== 1 || observed?.version !== 1) {
    driftError('Drift comparison requires projection version 1 on both sides')
  }
  if (baseline?.source?.domain !== observed?.source?.domain) {
    driftError('Drift comparison domains do not match')
  }
  if (baseline?.source?.mode !== 'declared' || observed?.source?.mode !== 'live') {
    driftError('Drift comparison requires declared baseline and live observed projections')
  }
  if (
    !Array.isArray(baseline.nodes) ||
    !Array.isArray(observed.nodes) ||
    !Array.isArray(baseline.edges) ||
    !Array.isArray(observed.edges)
  ) {
    driftError('Drift comparison requires finalized projection node and edge arrays')
  }
  const normalizedBaselineContext = requireComparisonContext(baselineContext)
  const normalizedObservedContext = requireComparisonContext(observedContext)
  if (normalizedBaselineContext !== normalizedObservedContext) {
    driftError('Drift comparison contexts do not match')
  }
  const attributes = emptyBuckets()
  const nodes = compareEntities(baseline.nodes, observed.nodes, 'node', nodeSnapshot, attributes)
  const edges = compareEntities(baseline.edges, observed.edges, 'edge', edgeSnapshot, attributes)
  sortAttributeBuckets(attributes)

  return {
    version: 1,
    baseline: { source: baseline.source.mode },
    observed: { source: observed.source.mode },
    nodes,
    edges,
    attributes,
    diagnostics: []
  }
}

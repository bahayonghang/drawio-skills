import { ERROR_CODES, createCiIdentity, createGroupIdentity } from './identity.js'
import {
  adapterError,
  diagnostic,
  finalizeConfigProjection,
  isRecord,
  parseStructuredDocuments,
  pushUniqueEdge,
  requireRecord
} from './config-common.js'

const ADAPTER = 'ci-config'
const GITLAB_RESERVED = new Set([
  'default',
  'include',
  'image',
  'services',
  'stages',
  'types',
  'variables',
  'workflow',
  'cache',
  'before_script',
  'after_script'
])

export const CI_ATTRIBUTE_ALLOWLIST = Object.freeze({
  node: ['job', 'matrix', 'provider', 'reusable', 'runner', 'stage', 'trigger', 'workflow'],
  edge: [],
  module: ['provider', 'stage', 'workflow']
})

function normalizeNeeds(value) {
  if (typeof value === 'string') return [value]
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => (typeof entry === 'string' ? entry : isRecord(entry) && typeof entry.job === 'string' ? entry.job : null))
    .filter(Boolean)
}

function githubRecords(document) {
  const jobs = requireRecord(document.jobs, 'GitHub Actions jobs', ADAPTER)
  return Object.entries(jobs).map(([key, value]) => {
    const job = requireRecord(value, `GitHub Actions job ${key}`, ADAPTER)
    return {
      key,
      label: typeof job.name === 'string' ? job.name : key,
      stage: null,
      needs: normalizeNeeds(job.needs),
      attributes: {
        ...(typeof job['runs-on'] === 'string' || Array.isArray(job['runs-on']) ? { runner: job['runs-on'] } : {}),
        ...(typeof job.uses === 'string' ? { reusable: job.uses } : {}),
        ...(isRecord(job.strategy?.matrix) ? { matrix: true } : {})
      }
    }
  })
}

function gitlabRecords(document) {
  return Object.entries(document)
    .filter(([key, value]) => !GITLAB_RESERVED.has(key) && !key.startsWith('.') && isRecord(value))
    .map(([key, job]) => ({
      key,
      label: key,
      stage: typeof job.stage === 'string' ? job.stage : 'test',
      needs: normalizeNeeds(job.needs),
      attributes: { ...(job.trigger != null ? { trigger: true } : {}) }
    }))
}

export function parseCiWorkflow(source, { provider, workflow } = {}) {
  if (!['github-actions', 'gitlab-ci'].includes(provider)) {
    adapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'CI provider must be github-actions or gitlab-ci', { adapter: ADAPTER })
  }
  if (typeof workflow !== 'string' || workflow.trim() === '') {
    adapterError(ERROR_CODES.ADAPTER_PARSE, 'CI workflow requires a repo-relative workflow path', { adapter: ADAPTER })
  }
  const documents = parseStructuredDocuments(source, { adapter: ADAPTER })
  if (documents.length !== 1) adapterError(ERROR_CODES.ADAPTER_PARSE, 'CI workflow must contain one document', { adapter: ADAPTER })
  const document = requireRecord(documents[0], 'CI workflow', ADAPTER)
  const records = provider === 'github-actions' ? githubRecords(document) : gitlabRecords(document)

  const modules = []
  const stageIdentities = new Map()
  if (provider === 'gitlab-ci') {
    const declaredStages = Array.isArray(document.stages) ? document.stages.filter((stage) => typeof stage === 'string') : []
    const stages = [...new Set([...declaredStages, ...records.map((record) => record.stage)])]
    for (const stage of stages) {
      const identity = createGroupIdentity({ domain: 'ci-stage', key: `${provider}/${workflow}/${stage}` })
      stageIdentities.set(stage, identity)
      modules.push({ identity, label: stage, attributes: { provider, workflow, stage } })
    }
  }

  const identities = new Map()
  const nodes = records.map((record) => {
    const identity = createCiIdentity({ provider, workflow, job: record.key })
    identities.set(record.key, identity)
    return {
      identity,
      label: record.label,
      semanticType: 'process',
      ...(record.stage ? { moduleIdentity: stageIdentities.get(record.stage) } : {}),
      attributes: {
        provider,
        workflow,
        job: record.key,
        ...(record.stage ? { stage: record.stage } : {}),
        ...record.attributes
      }
    }
  })

  const edges = []
  const edgeKeys = new Set()
  const diagnostics = []
  for (const record of records) {
    const to = identities.get(record.key)
    for (const dependency of record.needs) {
      const from = identities.get(dependency)
      if (!from) {
        diagnostics.push(diagnostic('CI_EXTERNAL_NEED', `CI job "${record.key}" needs missing job "${dependency}".`, to))
        continue
      }
      pushUniqueEdge(edges, edgeKeys, {
        from,
        to,
        relation: 'needs',
        discriminator: `needs:${dependency}->${record.key}`,
        attributes: {}
      })
    }
  }

  return finalizeConfigProjection(
    { adapter: ADAPTER, domain: 'ci', locator: workflow, nodes, edges, modules, diagnostics },
    CI_ATTRIBUTE_ALLOWLIST
  )
}

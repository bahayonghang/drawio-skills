import { createHash } from 'node:crypto'

export const ERROR_CODES = Object.freeze({
  ADAPTER_PARSE: 'ADAPTER_PARSE',
  ADAPTER_UNSUPPORTED: 'ADAPTER_UNSUPPORTED',
  PROJECTION_INVALID: 'PROJECTION_INVALID',
  IDENTITY_INVALID: 'IDENTITY_INVALID',
  IDENTITY_COLLISION: 'IDENTITY_COLLISION',
  OPTIONAL_DEPENDENCY_MISSING: 'OPTIONAL_DEPENDENCY_MISSING',
  DRIFT_INCOMPATIBLE: 'DRIFT_INCOMPATIBLE'
})

const IDENTITY_SCHEME = /^[a-z][a-z0-9-]{0,63}$/
const SAFE_KEY = /^[^\u0000-\u001f\u007f]{1,512}$/
const SIMPLE_COMPONENT = /^[^/\\\u0000-\u001f\u007f]{1,160}$/
const TERRAFORM_SEGMENT = String.raw`[A-Za-z0-9_-]+(?:\[(?:\d+|"[^"\r\n]+")\])?`
const TERRAFORM_ADDRESS = new RegExp(
  String.raw`^(?:module\.${TERRAFORM_SEGMENT}\.)*[A-Za-z][A-Za-z0-9_]*\.${TERRAFORM_SEGMENT}$`
)

export class AdapterContractError extends Error {
  constructor(code, message, context = {}, options = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause })
    this.name = 'AdapterContractError'
    this.code = code
    this.context = { ...context }
    for (const key of ['adapter', 'source', 'identity', 'path']) {
      if (context[key] !== undefined) this[key] = context[key]
    }
  }
}

function identityError(message, context = {}) {
  throw new AdapterContractError(ERROR_CODES.IDENTITY_INVALID, message, context)
}

function requireString(value, field, { pattern, maxLength = 160 } = {}) {
  if (typeof value !== 'string') identityError(`${field} must be a string`)
  const normalized = value.trim()
  if (normalized === '' || normalized.length > maxLength || /[\u0000-\u001f\u007f]/.test(normalized)) {
    identityError(`${field} must be a non-empty safe string no longer than ${maxLength} characters`)
  }
  if (pattern && !pattern.test(normalized)) identityError(`${field} has an invalid format`)
  return normalized
}

function encodeComponent(value, field) {
  const component = requireString(value, field, { pattern: SIMPLE_COMPONENT })
  return encodeURIComponent(component)
}

function normalizeRelativePath(value, field) {
  const raw = requireString(value, field, { maxLength: 512 }).replaceAll('\\', '/')
  if (raw.startsWith('/') || /^[A-Za-z]:/.test(raw)) {
    identityError(`${field} must be relative to the project root`)
  }

  const segments = []
  for (const segment of raw.split('/')) {
    if (segment === '' || segment === '.') continue
    if (segment === '..') {
      if (segments.length === 0) identityError(`${field} must not escape the project root`)
      segments.pop()
      continue
    }
    segments.push(requireString(segment, `${field} segment`, { pattern: SIMPLE_COMPONENT }))
  }
  if (segments.length === 0) identityError(`${field} must identify a file or module below the project root`)
  return segments.join('/')
}

export function normalizeIdentity(identity) {
  if (typeof identity !== 'object' || identity == null || Array.isArray(identity)) {
    identityError('identity must be an object')
  }
  const unknown = Object.keys(identity).filter((key) => !['scheme', 'key'].includes(key))
  if (unknown.length > 0) identityError(`identity has unknown field "${unknown[0]}"`)
  const scheme = requireString(identity.scheme, 'identity.scheme', { pattern: IDENTITY_SCHEME, maxLength: 64 })
  const key = requireString(identity.key, 'identity.key', { pattern: SAFE_KEY, maxLength: 512 })
  return { scheme, key }
}

export function serializeIdentity(identity) {
  const normalized = normalizeIdentity(identity)
  return `${normalized.scheme}\0${normalized.key}`
}

function defaultHash(payload) {
  return createHash('sha256').update(payload, 'utf8').digest('hex')
}

export function createRendererId(identity, { kind = 'node', hash = defaultHash } = {}) {
  const prefixes = { node: 'n', edge: 'e', module: 'm' }
  const prefix = prefixes[kind]
  if (!prefix) identityError(`renderer id kind must be one of ${Object.keys(prefixes).join(', ')}`)
  if (typeof hash !== 'function') identityError('renderer id hash must be a function')
  const digest = hash(serializeIdentity(identity))
  if (typeof digest !== 'string' || !/^[a-fA-F0-9]{20,}$/.test(digest)) {
    identityError('renderer id hash must return at least 20 hexadecimal characters')
  }
  return `${prefix}-${digest.slice(0, 20).toLowerCase()}`
}

export function createTerraformIdentity(address) {
  const key = requireString(address, 'Terraform resource address', { maxLength: 512 })
  if (!TERRAFORM_ADDRESS.test(key)) {
    identityError('Terraform resource address must be module-qualified type.name with optional instance keys')
  }
  return { scheme: 'terraform-resource', key }
}

export function createKubernetesIdentity({ scope, namespace, kind, name, namespaced } = {}) {
  if (typeof namespaced !== 'boolean') {
    identityError('Kubernetes identity requires an explicit namespaced boolean')
  }
  const normalizedNamespace = namespaced
    ? namespace == null || namespace === ''
      ? 'default'
      : namespace
    : '_cluster'
  return {
    scheme: 'kubernetes-object',
    key: [
      encodeComponent(scope, 'Kubernetes scope'),
      encodeComponent(normalizedNamespace, 'Kubernetes namespace'),
      encodeComponent(kind, 'Kubernetes kind'),
      encodeComponent(name, 'Kubernetes name')
    ].join('/')
  }
}

export function createComposeIdentity({ project, service } = {}) {
  return {
    scheme: 'compose-service',
    key: [encodeComponent(project, 'Compose project'), encodeComponent(service, 'Compose service')].join('/')
  }
}

export function createComposeResourceIdentity({ project, kind, name } = {}) {
  const normalizedKind = requireString(kind, 'Compose resource kind', {
    pattern: /^(network|volume)$/,
    maxLength: 16
  })
  return {
    scheme: `compose-${normalizedKind}`,
    key: [encodeComponent(project, 'Compose project'), encodeComponent(name, `Compose ${normalizedKind} name`)].join('/')
  }
}

export function createCodeIdentity({ language, modulePath } = {}) {
  const normalizedLanguage = requireString(language, 'Code language', {
    pattern: /^[a-z][a-z0-9-]{0,31}$/,
    maxLength: 32
  })
  return {
    scheme: 'code-module',
    key: `${normalizedLanguage}/${normalizeRelativePath(modulePath, 'Code module path')}`
  }
}

export function createCodeClassIdentity({ moduleIdentity, qualifiedClassName } = {}) {
  const normalizedModule = normalizeIdentity(moduleIdentity)
  if (normalizedModule.scheme !== 'code-module') {
    identityError('Code class moduleIdentity must use the code-module scheme')
  }
  const normalizedName = requireString(qualifiedClassName, 'Code qualified class name', {
    pattern: /^[A-Za-z_][A-Za-z0-9_.]{0,255}$/,
    maxLength: 256
  })
  return {
    scheme: 'code-class',
    key: JSON.stringify([serializeIdentity(normalizedModule), normalizedName])
  }
}

export function createOpenApiIdentity({ method, path } = {}) {
  const normalizedMethod = requireString(method, 'OpenAPI method', {
    pattern: /^[A-Za-z]+$/,
    maxLength: 16
  }).toUpperCase()
  let normalizedPath = requireString(path, 'OpenAPI path', { maxLength: 400 }).replaceAll('\\', '/')
  if (/[?#]/.test(normalizedPath)) identityError('OpenAPI path identity must not contain a query or fragment')
  if (/\s/.test(normalizedPath)) identityError('OpenAPI path identity must not contain whitespace')
  if (!normalizedPath.startsWith('/')) normalizedPath = `/${normalizedPath}`
  normalizedPath = normalizedPath.replace(/\/{2,}/g, '/')
  if (normalizedPath.length > 1) normalizedPath = normalizedPath.replace(/\/$/, '')
  return { scheme: 'openapi-operation', key: `${normalizedMethod} ${normalizedPath}` }
}

export function createOpenApiSchemaIdentity(name) {
  return {
    scheme: 'openapi-schema',
    key: encodeComponent(name, 'OpenAPI schema name')
  }
}

export function createCiIdentity({ provider, workflow, job } = {}) {
  const normalizedProvider = requireString(provider, 'CI provider', {
    pattern: /^[a-z][a-z0-9-]{0,63}$/,
    maxLength: 64
  })
  const normalizedWorkflow = normalizeRelativePath(workflow, 'CI workflow path')
  return {
    scheme: 'ci-job',
    key: [normalizedProvider, encodeURIComponent(normalizedWorkflow), encodeComponent(job, 'CI job key')].join('/')
  }
}

export function createSqlIdentity({ dialect, schema = '_default', table } = {}) {
  const normalizedDialect = requireString(dialect, 'SQL dialect', { maxLength: 160 }).toLowerCase()
  const normalizedSchema = schema == null || schema === '' ? '_default' : schema
  return {
    scheme: 'sql-table',
    key: [
      encodeComponent(normalizedDialect, 'SQL dialect'),
      encodeComponent(normalizedSchema, 'SQL schema'),
      encodeComponent(table, 'SQL table')
    ].join('/')
  }
}

export function createGroupIdentity({ domain, key } = {}) {
  const normalizedDomain = requireString(domain, 'Group domain', {
    pattern: /^[a-z][a-z0-9-]{0,47}$/,
    maxLength: 48
  })
  return {
    scheme: `${normalizedDomain}-group`,
    key: requireString(key, 'Group key', { pattern: SAFE_KEY, maxLength: 512 })
  }
}

export function createEdgeIdentity({ from, to, relation, discriminator = '' } = {}) {
  const normalizedRelation = requireString(relation, 'Edge relation', {
    pattern: /^[a-z][a-z0-9-]{0,63}$/,
    maxLength: 64
  })
  const normalizedDiscriminator =
    discriminator === '' ? '' : requireString(discriminator, 'Edge discriminator', { maxLength: 256 })
  return {
    scheme: 'graph-edge',
    key: JSON.stringify([normalizedRelation, serializeIdentity(from), serializeIdentity(to), normalizedDiscriminator])
  }
}

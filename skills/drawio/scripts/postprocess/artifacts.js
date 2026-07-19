import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'

import { serializeDocumentSpecYaml, serializeSpecYaml } from '../runtime/artifacts.js'
import { normalizePostprocessInput, selectPostprocessPages } from './input.js'

const EVIDENCE = new Set(['recorded-fixture', 'command-executed', 'missing-evidence'])
const SENSITIVE_KEY = /(?:path|secret|token|password|credential|home|input|output)/i
const ABSOLUTE_PATH = /^(?:[A-Za-z]:[\\/]|[\\/]{2}|\/)/

function stableValue(value, key = '') {
  if (SENSITIVE_KEY.test(key)) return undefined
  if (typeof value === 'string') {
    if (ABSOLUTE_PATH.test(value)) return undefined
    return value
  }
  if (Array.isArray(value)) return value.map((entry) => stableValue(entry)).filter((entry) => entry !== undefined)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((field) => [field, stableValue(value[field], field)])
        .filter(([, entry]) => entry !== undefined)
    )
  }
  if (value === undefined || typeof value === 'function') return undefined
  return value
}

function canonicalBytes(input) {
  const document = normalizePostprocessInput(input)
  const text =
    document.kind === 'multi-page-v1' ? serializeDocumentSpecYaml(document) : serializeSpecYaml(document.spec)
  return { document, bytes: Buffer.from(text, 'utf8') }
}

function sha256Digest(bytes) {
  const content = Buffer.isBuffer(bytes)
    ? bytes
    : bytes instanceof Uint8Array
      ? Buffer.from(bytes)
      : typeof bytes === 'string'
        ? Buffer.from(bytes, 'utf8')
        : null
  if (!content) throw new TypeError('postprocess auxiliary input must be bytes or a string')
  return `sha256:${createHash('sha256').update(content).digest('hex')}`
}

function auxiliaryDigestMap(inputs = {}) {
  if (!inputs || typeof inputs !== 'object' || Array.isArray(inputs)) {
    throw new TypeError('postprocess auxiliaryInputs must be an object')
  }
  const entries = Object.entries(inputs).sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
  const digests = {}
  for (const [role, bytes] of entries) {
    if (!/^[a-z][a-z0-9-]*$/.test(role)) throw new Error(`postprocess auxiliary input role "${role}" is unsafe`)
    digests[role] = sha256Digest(bytes)
  }
  return digests
}

export function buildPostprocessMetadata({
  operation,
  input,
  options = {},
  auxiliaryInputs = {},
  outputKind,
  evidence = 'missing-evidence',
  diagnostics
} = {}) {
  if (typeof operation !== 'string' || !/^[a-z][a-z0-9-]*$/.test(operation)) {
    throw new Error('postprocess operation must be a safe name')
  }
  if (typeof outputKind !== 'string' || !/^[a-z][a-z0-9-]*$/.test(outputKind)) {
    throw new Error('postprocess outputKind must be a safe name')
  }
  if (!EVIDENCE.has(evidence)) throw new Error(`postprocess evidence must be one of ${[...EVIDENCE].join(', ')}`)
  const { document, bytes } = canonicalBytes(input)
  const selected = selectPostprocessPages(document, {
    page: options.page,
    allPages: options.page == null ? options.allPages !== false : options.allPages
  })
  const pages = selected.pages.map((page) => ({
    index: document.pages.findIndex((candidate) => candidate.id === page.id),
    id: page.id,
    name: page.name
  }))
  const normalizedDiagnostics = stableValue(diagnostics)
  const auxiliaryDigests = auxiliaryDigestMap(auxiliaryInputs)
  return {
    version: 1,
    operation,
    inputKind: document.kind,
    pages,
    options: stableValue(options) || {},
    inputDigest: sha256Digest(bytes),
    ...(Object.keys(auxiliaryDigests).length === 0 ? {} : { auxiliaryDigests }),
    outputKind,
    evidence,
    ...(normalizedDiagnostics === undefined ? {} : { diagnostics: normalizedDiagnostics })
  }
}

export function serializePostprocessMetadata(metadata) {
  return `${JSON.stringify(metadata, null, 2)}\n`
}

export function derivePostprocessSidecarPath(outputPath) {
  return `${resolve(outputPath)}.postprocess.json`
}

function pathKey(path) {
  return resolve(path).replaceAll('\\', '/').toLowerCase()
}

export function assertDistinctPostprocessPaths(inputPath, outputPath) {
  if (typeof outputPath !== 'string' || outputPath.trim() === '') throw new Error('postprocess output path is required')
  if (inputPath != null && pathKey(inputPath) === pathKey(outputPath)) {
    throw new Error('postprocess output must not overwrite the source')
  }
  return resolve(outputPath)
}

export function writePostprocessArtifact(outputPath, content, { inputPath } = {}) {
  const resolved = assertDistinctPostprocessPaths(inputPath, outputPath)
  mkdirSync(dirname(resolved), { recursive: true })
  const temporary = `${resolved}.postprocess-tmp-${process.pid}`
  try {
    writeFileSync(temporary, content)
    try {
      renameSync(temporary, resolved)
    } catch (error) {
      if (!['EEXIST', 'EPERM', 'ENOTEMPTY'].includes(error.code)) throw error
      rmSync(resolved, { force: true })
      renameSync(temporary, resolved)
    }
  } finally {
    rmSync(temporary, { force: true })
  }
  return resolved
}

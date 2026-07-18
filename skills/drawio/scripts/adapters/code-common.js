import { lstatSync, readFileSync, readdirSync } from 'node:fs'
import { extname, resolve, sep } from 'node:path'

import { finalizeGraphProjection } from './graph-projection.js'
import { AdapterContractError, ERROR_CODES, createCodeIdentity } from './identity.js'

export const MAX_CODE_FILE_BYTES = 1024 * 1024
export const MAX_CODE_PROJECT_BYTES = 4 * 1024 * 1024
const MAX_CODE_FILES = 500
const DEFAULT_IGNORED_DIRECTORIES = new Set([
  '.git',
  '.venv',
  '__pycache__',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'target',
  'testdata',
  'vendor',
  'venv'
])

export function codeAdapterError(code, message, context = {}, cause) {
  throw new AdapterContractError(code, message, context, { cause })
}

function readUtf8File(path, relativePath, state) {
  let metadata
  try {
    metadata = lstatSync(path)
  } catch (error) {
    codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Code source metadata could not be read', { path: relativePath }, error)
  }
  if (metadata.isSymbolicLink()) {
    state.skippedSymlinks++
    return null
  }
  if (!metadata.isFile()) return null
  if (metadata.size > MAX_CODE_FILE_BYTES) {
    codeAdapterError(ERROR_CODES.ADAPTER_PARSE, `Code source exceeds the ${MAX_CODE_FILE_BYTES} byte file limit`, {
      path: relativePath
    })
  }
  state.totalBytes += metadata.size
  if (state.totalBytes > MAX_CODE_PROJECT_BYTES) {
    codeAdapterError(ERROR_CODES.ADAPTER_PARSE, `Code project exceeds the ${MAX_CODE_PROJECT_BYTES} byte source limit`)
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(path))
  } catch (error) {
    codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Code source must be readable UTF-8', { path: relativePath }, error)
  }
}

export function scanCodeProject(projectRoot, { extensions, ignoredDirectories = [] } = {}) {
  if (typeof projectRoot !== 'string' || projectRoot.trim() === '') {
    codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Code project root must be a non-empty directory path')
  }
  const root = resolve(projectRoot)
  let rootMetadata
  try {
    rootMetadata = lstatSync(root)
  } catch (error) {
    codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Code project root could not be read', {}, error)
  }
  if (rootMetadata.isSymbolicLink() || !rootMetadata.isDirectory()) {
    codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Code project root must be a real directory')
  }
  if (!Array.isArray(extensions) || extensions.length === 0) {
    codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Code project scanner requires source extensions')
  }

  const allowedExtensions = new Set(extensions.map((value) => value.toLowerCase()))
  const ignored = new Set([...DEFAULT_IGNORED_DIRECTORIES, ...ignoredDirectories])
  const files = []
  const state = { totalBytes: 0, skippedSymlinks: 0 }

  const walk = (directory, relativeDirectory = '') => {
    let entries
    try {
      entries = readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))
    } catch (error) {
      codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Code project directory could not be read', {
        path: relativeDirectory || '_root'
      }, error)
    }
    for (const entry of entries) {
      const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name
      const absolutePath = resolve(directory, entry.name)
      if (absolutePath !== root && !absolutePath.startsWith(`${root}${sep}`)) {
        codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Code project entry escapes the project root', { path: relativePath })
      }
      if (entry.isSymbolicLink()) {
        state.skippedSymlinks++
        continue
      }
      if (entry.isDirectory()) {
        if (ignored.has(entry.name) || entry.name.startsWith('.')) continue
        walk(absolutePath, relativePath)
        continue
      }
      if (!entry.isFile() || !allowedExtensions.has(extname(entry.name).toLowerCase())) continue
      const source = readUtf8File(absolutePath, relativePath, state)
      if (source == null) continue
      files.push({ path: relativePath, source })
      if (files.length > MAX_CODE_FILES) {
        codeAdapterError(ERROR_CODES.ADAPTER_PARSE, `Code project has more than ${MAX_CODE_FILES} source files`)
      }
    }
  }
  walk(root)

  const foldedPaths = new Map()
  for (const file of files) {
    const folded = file.path.toLowerCase()
    const existing = foldedPaths.get(folded)
    if (existing && existing !== file.path) {
      codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Code project has case-folded duplicate paths', { path: file.path })
    }
    foldedPaths.set(folded, file.path)
  }
  return { root, files, totalBytes: state.totalBytes, skippedSymlinks: state.skippedSymlinks }
}

export function moduleNode(language, modulePath, { label = modulePath } = {}) {
  return {
    identity: createCodeIdentity({ language, modulePath }),
    label,
    semanticType: 'service',
    attributes: {}
  }
}

export function aggregateDiagnostic(code, count, message) {
  return count > 0 ? [{ level: 'warning', code, message: `${message} Count: ${count}.` }] : []
}

export function emptyGraphDiagnostic(nodes, message) {
  return nodes.length === 0 ? [{ level: 'info', code: 'CODE_EMPTY_GRAPH', message }] : []
}

export function scanDiagnostics(scan) {
  return aggregateDiagnostic(
    'CODE_SYMLINKS_SKIPPED',
    scan.skippedSymlinks,
    'Symbolic links were skipped without being followed.'
  )
}

export function finalizeCodeProjection({ adapter, locator = 'project', nodes, edges, diagnostics = [] }) {
  return finalizeGraphProjection({
    version: 1,
    source: { adapter, domain: 'code', mode: 'code', locator },
    nodes,
    edges,
    modules: [],
    diagnostics
  })
}

export async function loadOptionalParser(specifier, label) {
  try {
    return await import(specifier)
  } catch (error) {
    if (['ERR_MODULE_NOT_FOUND', 'MODULE_NOT_FOUND', 'ERR_DLOPEN_FAILED'].includes(error?.code)) {
      codeAdapterError(ERROR_CODES.OPTIONAL_DEPENDENCY_MISSING, `${label} is unavailable`, {}, error)
    }
    codeAdapterError(ERROR_CODES.ADAPTER_PARSE, `${label} could not be loaded`, {}, error)
  }
}

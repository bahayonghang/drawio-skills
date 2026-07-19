import { basename } from 'node:path'

import {
  aggregateDiagnostic,
  codeAdapterError,
  emptyGraphDiagnostic,
  finalizeCodeProjection,
  moduleNode,
  scanDiagnostics,
  scanCodeProject
} from './code-common.js'
import { ERROR_CODES, createCodeClassIdentity, createCodeIdentity, serializeIdentity } from './identity.js'
import { runOptionalPythonCodeParser } from './optional-python-code.js'

const PYTHON_EXTENSIONS = ['.py']

function moduleNameForPath(path, rootPackage) {
  const parts = path.slice(0, -3).split('/')
  if (parts.at(-1) === '__init__') parts.pop()
  if (rootPackage) parts.unshift(rootPackage)
  return parts.join('.')
}

function validateWorkerFiles(result, scan, field) {
  if (!result || typeof result !== 'object' || !Array.isArray(result.files)) {
    codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Python code worker returned an invalid result')
  }
  const expected = new Set(scan.files.map((file) => file.path))
  const records = new Map()
  for (const record of result.files) {
    if (!record || typeof record !== 'object' || typeof record.path !== 'string' || !Array.isArray(record[field])) {
      codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Python code worker returned an invalid file record')
    }
    if (!expected.has(record.path) || records.has(record.path)) {
      codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Python code worker returned an unexpected file path', {
        path: record.path
      })
    }
    records.set(record.path, record)
  }
  if (records.size !== expected.size) {
    codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Python code worker omitted a source file')
  }
  return records
}

function pythonScan(projectRoot) {
  const scan = scanCodeProject(projectRoot, { extensions: PYTHON_EXTENSIONS })
  if (scan.files.length === 0) {
    codeAdapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'Python project contains no supported source files')
  }
  return scan
}

function pythonModules(scan) {
  const rootPackage = scan.files.some((file) => file.path === '__init__.py') ? basename(scan.root) : ''
  const modules = new Map()
  for (const file of scan.files) {
    const name = moduleNameForPath(file.path, rootPackage)
    if (name) modules.set(name, file.path)
  }
  return { modules, rootPackage }
}

function resolveKnownModule(name, currentPath, modules) {
  const parts = name ? name.split('.') : []
  while (parts.length > 0) {
    const candidate = parts.join('.')
    const path = modules.get(candidate)
    if (path && path !== currentPath) return path
    parts.pop()
  }
  return null
}

function relativeModuleName(record, currentName, currentPath) {
  const isPackage = currentPath.endsWith('/__init__.py') || currentPath === '__init__.py'
  const packageParts = currentName ? currentName.split('.') : []
  if (!isPackage) packageParts.pop()
  const keep = packageParts.length - Math.max(0, record.level - 1)
  if (keep < 0) return null
  const prefix = packageParts.slice(0, keep).join('.')
  return [prefix, record.module].filter(Boolean).join('.')
}

function pushEdge(edges, seen, from, to, relation) {
  const key = `${serializeIdentity(from)}\0${relation}\0${serializeIdentity(to)}`
  if (seen.has(key)) return
  seen.add(key)
  edges.push({ from, to, relation, attributes: {} })
}

export async function parsePythonImportsProject(
  projectRoot,
  { locator = 'project', runParser = runOptionalPythonCodeParser } = {}
) {
  const scan = pythonScan(projectRoot)
  const records = validateWorkerFiles(
    await runParser({ adapter: 'python-imports', files: scan.files }),
    scan,
    'imports'
  )
  const { modules } = pythonModules(scan)
  const moduleNameByPath = new Map([...modules].map(([name, path]) => [path, name]))
  const identities = new Map(scan.files.map((file) => [file.path, createCodeIdentity({ language: 'python', modulePath: file.path })]))
  const nodes = scan.files.map((file) => moduleNode('python', file.path))
  const edges = []
  const seenEdges = new Set()
  let ignored = 0

  for (const file of scan.files) {
    const currentName = moduleNameByPath.get(file.path) || ''
    for (const record of records.get(file.path).imports) {
      if (
        !record ||
        typeof record.module !== 'string' ||
        !Number.isInteger(record.level) ||
        record.level < 0 ||
        !Array.isArray(record.names)
      ) {
        codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Python code worker returned an invalid import record', {
          path: file.path
        })
      }
      const moduleName = record.level > 0
        ? relativeModuleName(record, currentName, file.path)
        : record.module
      if (moduleName == null) {
        codeAdapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'Python relative import escapes the selected project', {
          path: file.path,
          line: record.line,
          column: record.column
        })
      }
      const candidates = [moduleName]
      for (const name of record.names) {
        if (typeof name === 'string' && name !== '*') candidates.push([moduleName, name].filter(Boolean).join('.'))
      }
      const targets = new Set(candidates.map((name) => resolveKnownModule(name, file.path, modules)).filter(Boolean))
      if (targets.size === 0) {
        if (record.level > 0) {
          codeAdapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'Python relative import does not resolve inside the selected project', {
            path: file.path,
            line: record.line,
            column: record.column
          })
        }
        ignored++
        continue
      }
      for (const targetPath of targets) {
        pushEdge(edges, seenEdges, identities.get(file.path), identities.get(targetPath), 'imports')
      }
    }
  }

  return finalizeCodeProjection({
    adapter: 'python-imports',
    locator,
    nodes,
    edges,
    diagnostics: [
      ...aggregateDiagnostic('CODE_EXTERNAL_IMPORTS_IGNORED', ignored, 'External or standard-library imports were ignored.'),
      ...scanDiagnostics(scan)
    ]
  })
}

export async function parsePythonClassesProject(
  projectRoot,
  { locator = 'project', runParser = runOptionalPythonCodeParser } = {}
) {
  const scan = pythonScan(projectRoot)
  const records = validateWorkerFiles(
    await runParser({ adapter: 'python-classes', files: scan.files }),
    scan,
    'classes'
  )
  const classes = []
  const byName = new Map()
  for (const file of scan.files) {
    const moduleIdentity = createCodeIdentity({ language: 'python', modulePath: file.path })
    for (const record of records.get(file.path).classes) {
      if (
        !record ||
        typeof record.qualifiedName !== 'string' ||
        !Array.isArray(record.bases) ||
        !record.bases.every((base) => typeof base === 'string')
      ) {
        codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Python code worker returned an invalid class record', {
          path: file.path
        })
      }
      const identity = createCodeClassIdentity({ moduleIdentity, qualifiedClassName: record.qualifiedName })
      const entry = { ...record, path: file.path, identity, moduleIdentity }
      classes.push(entry)
      const simpleName = record.qualifiedName.split('.').at(-1)
      byName.set(simpleName, [...(byName.get(simpleName) || []), entry])
    }
  }

  const nodes = classes.map((entry) => ({
    identity: entry.identity,
    label: entry.qualifiedName,
    semanticType: 'component',
    attributes: {}
  }))
  const edges = []
  const seenEdges = new Set()
  let ignored = 0
  for (const entry of classes) {
    for (const base of entry.bases) {
      const candidates = byName.get(base) || []
      const sameModule = candidates.filter(
        (candidate) => serializeIdentity(candidate.moduleIdentity) === serializeIdentity(entry.moduleIdentity)
      )
      const target = sameModule.length === 1 ? sameModule[0] : candidates.length === 1 ? candidates[0] : null
      if (!target) {
        if (candidates.length > 1) {
          codeAdapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, `Python base class "${base}" is ambiguous`, {
            path: entry.path,
            line: entry.line,
            column: entry.column
          })
        }
        ignored++
        continue
      }
      if (serializeIdentity(target.identity) !== serializeIdentity(entry.identity)) {
        pushEdge(edges, seenEdges, entry.identity, target.identity, 'inherits')
      }
    }
  }

  return finalizeCodeProjection({
    adapter: 'python-classes',
    locator,
    nodes,
    edges,
    diagnostics: [
      ...aggregateDiagnostic('CODE_EXTERNAL_BASES_IGNORED', ignored, 'External base classes were ignored.'),
      ...emptyGraphDiagnostic(nodes, 'No top-level Python classes were found in the selected project.'),
      ...scanDiagnostics(scan)
    ]
  })
}

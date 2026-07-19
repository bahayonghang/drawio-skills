import { posix } from 'node:path'

import {
  aggregateDiagnostic,
  codeAdapterError,
  finalizeCodeProjection,
  loadOptionalParser,
  moduleNode,
  scanDiagnostics,
  scanCodeProject
} from './code-common.js'
import { ERROR_CODES, createCodeIdentity, serializeIdentity } from './identity.js'

function parseGoModule(source) {
  let modulePath = null
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (line === '' || line.startsWith('//')) continue
    if (line.startsWith('replace ') || line === 'replace (') {
      codeAdapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'go.mod replace directives are not supported')
    }
    const match = /^module\s+([^\s]+)(?:\s+\/\/.*)?$/.exec(line)
    if (!match) continue
    if (modulePath) codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'go.mod contains multiple module directives')
    modulePath = match[1]
  }
  if (!modulePath || /[\\\u0000-\u0020\u007f]/.test(modulePath)) {
    codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'go.mod requires one safe module directive')
  }
  return modulePath.replace(/\/$/, '')
}

function decodeImportPath(text, path, position) {
  try {
    if (text.startsWith('`') && text.endsWith('`')) return text.slice(1, -1)
    if (text.startsWith('"') && text.endsWith('"')) return JSON.parse(text)
  } catch (error) {
    codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Go import path could not be decoded', {
      path,
      line: position?.row == null ? undefined : position.row + 1,
      column: position?.column
    }, error)
  }
  codeAdapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'Go import path uses unsupported syntax', { path })
}

async function createGoSourceParser() {
  const [parserModule, grammarModule] = await Promise.all([
    loadOptionalParser('tree-sitter', 'tree-sitter@0.21.1'),
    loadOptionalParser('tree-sitter-go', 'tree-sitter-go@0.23.4')
  ])
  const Parser = parserModule.default || parserModule
  const grammar = grammarModule.default || grammarModule
  let parser
  try {
    parser = new Parser()
    parser.setLanguage(grammar)
  } catch (error) {
    codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Go Tree-sitter parser could not be initialized', {}, error)
  }
  return (source, path) => {
    let root
    try {
      root = parser.parse(source).rootNode
    } catch (error) {
      codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Go source could not be parsed', { path }, error)
    }
    if (root.hasError) {
      const errorNode = root.descendantsOfType('ERROR')[0] || root
      codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Go source contains invalid syntax', {
        path,
        line: errorNode.startPosition.row + 1,
        column: errorNode.startPosition.column
      })
    }
    const imports = root.descendantsOfType('import_spec').map((node) => {
      const pathNode = node.childForFieldName('path')
      if (!pathNode) codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Go import is missing its path', { path })
      return decodeImportPath(pathNode.text, path, pathNode.startPosition)
    })
    const hasBuildConstraints = root.descendantsOfType('comment').some((node) => {
      const text = node.text.trimStart()
      return text.startsWith('//go:build') || text.startsWith('// +build')
    })
    return { imports, hasBuildConstraints }
  }
}

function packagePath(filePath) {
  const directory = posix.dirname(filePath)
  return directory === '.' ? '_root' : directory
}

export async function parseGoImportsProject(projectRoot, { locator = 'project', parseFile } = {}) {
  const scan = scanCodeProject(projectRoot, { extensions: ['.go', '.mod', '.work'] })
  const goFiles = scan.files.filter((file) => file.path.endsWith('.go'))
  const moduleFiles = scan.files.filter((file) => file.path.endsWith('.mod'))
  if (goFiles.length === 0) codeAdapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'Go project contains no source files')
  if (scan.files.some((file) => file.path === 'go.work')) {
    codeAdapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'Go workspace files are not supported')
  }
  if (moduleFiles.length !== 1 || moduleFiles[0].path !== 'go.mod') {
    codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Go project requires exactly one root go.mod file')
  }
  const modulePath = parseGoModule(moduleFiles[0].source)
  const sourceParser = parseFile || await createGoSourceParser()
  const packagePaths = [...new Set(goFiles.map((file) => packagePath(file.path)))]
  const packageSet = new Set(packagePaths)
  const identities = new Map(
    packagePaths.map((path) => [path, createCodeIdentity({ language: 'go', modulePath: path })])
  )
  const nodes = packagePaths.map((path) => moduleNode('go', path, { label: path }))
  const edges = []
  const seenEdges = new Set()
  let ignored = 0
  let constrainedFiles = 0

  for (const file of goFiles) {
    let parsed
    try {
      parsed = await sourceParser(file.source, file.path)
    } catch (error) {
      if (error?.code) throw error
      codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Go source could not be parsed', { path: file.path }, error)
    }
    if (
      !parsed ||
      !Array.isArray(parsed.imports) ||
      !parsed.imports.every((value) => typeof value === 'string') ||
      typeof parsed.hasBuildConstraints !== 'boolean'
    ) {
      codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Go parser returned an invalid result', { path: file.path })
    }
    if (parsed.hasBuildConstraints) constrainedFiles++
    for (const imported of parsed.imports) {
      let targetPath
      if (imported === modulePath) targetPath = '_root'
      else if (imported.startsWith(`${modulePath}/`)) targetPath = imported.slice(modulePath.length + 1)
      else {
        ignored++
        continue
      }
      if (!packageSet.has(targetPath)) {
        codeAdapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'Go intra-module import does not resolve to a scanned package', {
          path: file.path
        })
      }
      const from = identities.get(packagePath(file.path))
      const to = identities.get(targetPath)
      if (serializeIdentity(from) === serializeIdentity(to)) continue
      const key = `${serializeIdentity(from)}\0imports\0${serializeIdentity(to)}`
      if (seenEdges.has(key)) continue
      seenEdges.add(key)
      edges.push({ from, to, relation: 'imports', attributes: {} })
    }
  }

  const diagnostics = [
    ...aggregateDiagnostic('CODE_EXTERNAL_IMPORTS_IGNORED', ignored, 'External or standard-library imports were ignored.'),
    ...aggregateDiagnostic(
      'GO_BUILD_CONSTRAINTS_INCLUDED',
      constrainedFiles,
      'Files with build constraints were included without evaluating the selected build.'
    ),
    ...scanDiagnostics(scan)
  ]
  return finalizeCodeProjection({ adapter: 'go-imports', locator, nodes, edges, diagnostics })
}

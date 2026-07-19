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

function pathParts(node) {
  if (!node) return []
  if (['crate', 'self', 'super', 'identifier'].includes(node.type)) return [node.text]
  if (node.type === 'scoped_identifier') {
    return [...pathParts(node.childForFieldName('path')), ...pathParts(node.childForFieldName('name'))]
  }
  if (node.type === 'use_as_clause') return pathParts(node.childForFieldName('path'))
  if (node.type === 'use_wildcard') return pathParts(node.namedChildren[0])
  return []
}

function expandUseNode(node, prefix = []) {
  if (!node) return []
  if (node.type === 'scoped_use_list') {
    const nextPrefix = [...prefix, ...pathParts(node.childForFieldName('path'))]
    return expandUseNode(node.childForFieldName('list'), nextPrefix)
  }
  if (node.type === 'use_list') {
    return node.namedChildren.flatMap((child) => expandUseNode(child, prefix))
  }
  const parts = pathParts(node)
  return parts.length > 0 ? [[...prefix, ...parts]] : []
}

async function createRustSourceParser() {
  const [parserModule, grammarModule] = await Promise.all([
    loadOptionalParser('tree-sitter', 'tree-sitter@0.21.1'),
    loadOptionalParser('tree-sitter-rust', 'tree-sitter-rust@0.23.0')
  ])
  const Parser = parserModule.default || parserModule
  const grammar = grammarModule.default || grammarModule
  let parser
  try {
    parser = new Parser()
    parser.setLanguage(grammar)
  } catch (error) {
    codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Rust Tree-sitter parser could not be initialized', {}, error)
  }
  return (source, path) => {
    let root
    try {
      root = parser.parse(source).rootNode
    } catch (error) {
      codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Rust source could not be parsed', { path }, error)
    }
    if (root.hasError) {
      const errorNode = root.descendantsOfType('ERROR')[0] || root
      codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Rust source contains invalid syntax', {
        path,
        line: errorNode.startPosition.row + 1,
        column: errorNode.startPosition.column
      })
    }
    const attributes = root.descendantsOfType('attribute_item')
    const attributeNames = new Set(
      attributes.map((node) => node.namedChildren[0]?.namedChildren[0]?.text).filter(Boolean)
    )
    const hasInlineModules = root
      .descendantsOfType('mod_item')
      .some((node) => node.childForFieldName('body') != null || node.namedChildren.some((child) => child.type === 'declaration_list'))
    const uses = root
      .descendantsOfType('use_declaration')
      .flatMap((node) => expandUseNode(node.childForFieldName('argument')))
      .map((parts) => parts.join('::'))
    return {
      uses,
      hasCfg: attributeNames.has('cfg') || attributeNames.has('cfg_attr'),
      hasPathAttributes: attributeNames.has('path'),
      hasInlineModules
    }
  }
}

function moduleSegments(filePath) {
  const parts = filePath.slice(0, -3).split('/')
  if (parts[0] === 'src') parts.shift()
  if (['lib', 'main', 'mod'].includes(parts.at(-1))) parts.pop()
  return parts
}

function moduleKey(parts) {
  return parts.join('::')
}

function targetSegments(usePath, current, path) {
  const parts = usePath.split('::').filter(Boolean)
  const root = parts.shift()
  if (root === 'crate') return parts
  if (root === 'self') return [...current, ...parts]
  if (root !== 'super') return null
  let levels = 1
  while (parts[0] === 'super') {
    parts.shift()
    levels++
  }
  if (levels > current.length) {
    codeAdapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'Rust super path escapes the selected crate', { path })
  }
  return [...current.slice(0, current.length - levels), ...parts]
}

function resolveRustModule(parts, modules) {
  const candidate = [...parts]
  while (candidate.length >= 0) {
    const path = modules.get(moduleKey(candidate))
    if (path) return path
    if (candidate.length === 0) break
    candidate.pop()
  }
  return null
}

export async function parseRustImportsProject(projectRoot, { locator = 'project', parseFile } = {}) {
  const scan = scanCodeProject(projectRoot, { extensions: ['.rs'] })
  if (scan.files.length === 0) codeAdapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'Rust project contains no source files')
  const sourceParser = parseFile || await createRustSourceParser()
  const modules = new Map()
  for (const file of scan.files) {
    const key = moduleKey(moduleSegments(file.path))
    if (modules.has(key)) {
      codeAdapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'Rust module path is ambiguous in the selected project', {
        path: file.path
      })
    }
    modules.set(key, file.path)
  }
  const identities = new Map(
    scan.files.map((file) => [file.path, createCodeIdentity({ language: 'rust', modulePath: file.path })])
  )
  const nodes = scan.files.map((file) => moduleNode('rust', file.path))
  const edges = []
  const seenEdges = new Set()
  let ignored = 0

  for (const file of scan.files) {
    let parsed
    try {
      parsed = await sourceParser(file.source, file.path)
    } catch (error) {
      if (error?.code) throw error
      codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Rust source could not be parsed', { path: file.path }, error)
    }
    if (
      !parsed ||
      !Array.isArray(parsed.uses) ||
      !parsed.uses.every((value) => typeof value === 'string') ||
      typeof parsed.hasCfg !== 'boolean' ||
      typeof parsed.hasInlineModules !== 'boolean'
    ) {
      codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'Rust parser returned an invalid result', { path: file.path })
    }
    if (parsed.hasCfg || parsed.hasInlineModules || parsed.hasPathAttributes === true) {
      codeAdapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'Rust cfg, path attributes, and inline modules are not supported', {
        path: file.path
      })
    }
    const current = moduleSegments(file.path)
    for (const usePath of parsed.uses) {
      const target = targetSegments(usePath, current, file.path)
      if (target == null) {
        ignored++
        continue
      }
      const targetPath = resolveRustModule(target, modules)
      if (!targetPath) {
        codeAdapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'Rust crate-local use does not resolve to a scanned module', {
          path: file.path
        })
      }
      const from = identities.get(file.path)
      const to = identities.get(targetPath)
      if (serializeIdentity(from) === serializeIdentity(to)) continue
      const key = `${serializeIdentity(from)}\0uses\0${serializeIdentity(to)}`
      if (seenEdges.has(key)) continue
      seenEdges.add(key)
      edges.push({ from, to, relation: 'uses', attributes: {} })
    }
  }

  return finalizeCodeProjection({
    adapter: 'rust-imports',
    locator,
    nodes,
    edges,
    diagnostics: [
      ...aggregateDiagnostic(
        'RUST_NON_CRATE_USES_IGNORED',
        ignored,
        'Non-crate-qualified uses were not resolved; external crates and edition-ambiguous paths were ignored.'
      ),
      ...scanDiagnostics(scan)
    ]
  })
}

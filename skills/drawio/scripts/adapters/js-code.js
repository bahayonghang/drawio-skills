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

const EXTENSIONS = ['.js', '.jsx', '.mjs', '.ts', '.tsx']
const TYPESCRIPT_EXTENSIONS = new Set(['.ts', '.tsx'])

function languageForPath(path) {
  return TYPESCRIPT_EXTENSIONS.has(posix.extname(path).toLowerCase()) ? 'typescript' : 'javascript'
}

async function parseWithEsModuleLexer(source, path) {
  const lexer = await loadOptionalParser('es-module-lexer/js', 'es-module-lexer@2.3.1')
  let imports
  let hasModuleSyntax
  try {
    ;[imports, , , hasModuleSyntax] = lexer.parse(source, path)
  } catch (error) {
    codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'JavaScript or TypeScript module syntax could not be parsed', {
      path,
      column: Number.isInteger(error?.idx) ? error.idx : undefined
    }, error)
  }
  const specifiers = []
  for (const entry of imports) {
    if (entry.d === -2) continue
    if (typeof entry.n !== 'string') {
      codeAdapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'Non-literal dynamic imports are not supported', { path })
    }
    specifiers.push(entry.n)
  }
  return { specifiers, hasModuleSyntax }
}

function resolveRelativeImport(fromPath, specifier, files) {
  if (specifier.includes('?') || specifier.includes('#')) {
    codeAdapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'Import query strings and fragments are not supported', {
      path: fromPath
    })
  }
  const target = posix.normalize(posix.join(posix.dirname(fromPath), specifier))
  if (target === '..' || target.startsWith('../') || posix.isAbsolute(target)) {
    codeAdapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'Relative import escapes the selected project', { path: fromPath })
  }
  const candidates = []
  if (files.has(target)) candidates.push(target)
  if (!posix.extname(target)) {
    for (const extension of EXTENSIONS) {
      if (files.has(`${target}${extension}`)) candidates.push(`${target}${extension}`)
      if (files.has(`${target}/index${extension}`)) candidates.push(`${target}/index${extension}`)
    }
  }
  const unique = [...new Set(candidates)]
  if (unique.length !== 1) {
    const reason = unique.length === 0 ? 'does not resolve' : 'resolves ambiguously'
    codeAdapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, `Relative import ${reason} inside the selected project`, {
      path: fromPath
    })
  }
  return unique[0]
}

export async function parseJavaScriptImportsProject(
  projectRoot,
  { locator = 'project', parseModule = parseWithEsModuleLexer } = {}
) {
  const scan = scanCodeProject(projectRoot, { extensions: EXTENSIONS })
  if (scan.files.length === 0) {
    codeAdapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'JavaScript/TypeScript project contains no supported source files')
  }
  const filePaths = new Set(scan.files.map((file) => file.path))
  const identities = new Map(
    scan.files.map((file) => [file.path, createCodeIdentity({ language: languageForPath(file.path), modulePath: file.path })])
  )
  const nodes = scan.files.map((file) => moduleNode(languageForPath(file.path), file.path))
  const edges = []
  const seenEdges = new Set()
  let ignored = 0
  let nonEsmFiles = 0

  for (const file of scan.files) {
    let parsed
    try {
      parsed = await parseModule(file.source, file.path)
    } catch (error) {
      if (error?.code) throw error
      codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'JavaScript or TypeScript module syntax could not be parsed', {
        path: file.path
      }, error)
    }
    const specifiers = Array.isArray(parsed) ? parsed : parsed?.specifiers
    if (!Array.isArray(specifiers) || !specifiers.every((value) => typeof value === 'string')) {
      codeAdapterError(ERROR_CODES.ADAPTER_PARSE, 'JavaScript parser returned an invalid import list', {
        path: file.path
      })
    }
    if (!Array.isArray(parsed) && parsed.hasModuleSyntax === false && specifiers.length === 0) nonEsmFiles++
    for (const specifier of specifiers) {
      if (!specifier.startsWith('./') && !specifier.startsWith('../')) {
        ignored++
        continue
      }
      const targetPath = resolveRelativeImport(file.path, specifier, filePaths)
      const from = identities.get(file.path)
      const to = identities.get(targetPath)
      const key = `${serializeIdentity(from)}\0imports\0${serializeIdentity(to)}`
      if (seenEdges.has(key)) continue
      seenEdges.add(key)
      edges.push({ from, to, relation: 'imports', attributes: {} })
    }
  }

  return finalizeCodeProjection({
    adapter: 'js-imports',
    locator,
    nodes,
    edges,
    diagnostics: [
      ...aggregateDiagnostic(
        'JS_NON_RELATIVE_IMPORTS_IGNORED',
        ignored,
        'Non-relative imports were not resolved; they may be external packages or unsupported path aliases.'
      ),
      ...aggregateDiagnostic(
        'JS_NON_ESM_FILES_UNANALYZED',
        nonEsmFiles,
        'Files without supported ESM import syntax were retained as nodes; CommonJS dependencies were not analyzed.'
      ),
      ...scanDiagnostics(scan)
    ]
  })
}

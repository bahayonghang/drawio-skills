import { readFileSync } from 'node:fs'
import { extname, resolve } from 'node:path'

import { createDrawioFileContent, serializeDocumentSpecYaml, serializeSpecYaml } from '../runtime/artifacts.js'
import { renderDocumentFile } from '../dsl/multi-page.js'
import { specToDrawioXml, validateXml } from '../dsl/spec-to-drawio.js'
import { applyHeatmap, applyRelabel, applyRestyle } from './mutate.js'
import { renderHtml } from './html.js'
import { explainDocument, renderMermaid } from './projection.js'
import {
  assertDistinctPostprocessPaths,
  buildPostprocessMetadata,
  derivePostprocessSidecarPath,
  serializePostprocessMetadata,
  writePostprocessArtifact
} from './artifacts.js'
import { normalizePostprocessInput } from './input.js'

const OPERATIONS = new Set(['mermaid', 'explain', 'relabel', 'restyle', 'heatmap', 'html'])
const VALUE_FLAGS = new Set([
  '--input-format', '--page', '--map', '--preset', '--metrics', '--palette', '--direction', '--title', '--search',
  '--size-min', '--size-max', '--min', '--max'
])
const BOOLEAN_FLAGS = new Set(['--all-pages', '--fenced', '--label-fallback', '--allow-missing'])

function parseOptions(args) {
  const options = {}
  for (let index = 0; index < args.length; index++) {
    const flag = args[index]
    if (BOOLEAN_FLAGS.has(flag)) {
      options[flag.slice(2).replaceAll('-', '')] = true
      continue
    }
    if (!VALUE_FLAGS.has(flag)) throw new Error(`unknown postprocess option "${flag}"`)
    const value = args[++index]
    if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value`)
    options[flag.slice(2).replaceAll('-', '')] = value
  }
  return options
}

function readLocalFile(path, context) {
  try {
    const bytes = readFileSync(resolve(path))
    return { bytes, text: bytes.toString('utf8') }
  } catch (error) {
    throw new Error(`could not read ${context} "${path}": ${error.message}`)
  }
}

function readJsonInput(path, context) {
  const input = readLocalFile(path, context)
  try {
    return { ...input, value: JSON.parse(input.text) }
  } catch (error) {
    throw new Error(`could not parse ${context} "${path}": ${error.message}`)
  }
}

function readInput(path) {
  if (!path || path === '-') throw new Error('postprocess input must be an explicit local file path')
  try {
    return readFileSync(resolve(path), 'utf8')
  } catch (error) {
    throw new Error(`could not read postprocess input "${path}": ${error.message}`)
  }
}

function resolvePresetInput(value) {
  if (!value) throw new Error('restyle requires --preset <bundled-name|json-file>')
  if (!value.endsWith('.json')) return { value }
  const input = readJsonInput(value, 'restyle preset')
  return { value: input.value, bytes: input.bytes }
}

function optionNumber(value, name) {
  if (value == null) return undefined
  const number = Number(value)
  if (!Number.isFinite(number)) throw new Error(`${name} requires a finite number`)
  return number
}

function canonicalOutput(document, extension) {
  if (extension === '.drawio') {
    if (document.kind === 'multi-page-v1') return renderDocumentFile(document, { silent: true })
    const xml = specToDrawioXml(document.spec, { silent: true })
    const validation = validateXml(xml)
    if (!validation.valid) throw new Error(`canonical XML validation failed: ${validation.errors.join('; ')}`)
    return createDrawioFileContent(xml)
  }
  if (extension === '.yaml' || extension === '.yml') {
    return document.kind === 'multi-page-v1' ? serializeDocumentSpecYaml(document) : serializeSpecYaml(document.spec)
  }
  throw new Error(`unsupported postprocess output extension "${extension}"`)
}

function auxiliaryInputPaths(options) {
  const paths = [options.map, options.metrics]
  if (typeof options.preset === 'string' && options.preset.endsWith('.json')) paths.push(options.preset)
  return paths.filter(Boolean)
}

function assertPreservedInputPaths(inputPaths, outputPath) {
  const sidecarPath = derivePostprocessSidecarPath(outputPath)
  for (const inputPath of inputPaths) {
    assertDistinctPostprocessPaths(inputPath, outputPath)
    assertDistinctPostprocessPaths(inputPath, sidecarPath)
  }
  return sidecarPath
}

export async function runPostprocessCommand(commandArgs, { stdout = process.stdout, stderr = process.stderr } = {}) {
  const [operation, inputPath, outputPath, ...optionArgs] = commandArgs
  if (!OPERATIONS.has(operation)) throw new Error(`unsupported postprocess operation "${operation || ''}"`)
  if (!inputPath || !outputPath) {
    throw new Error('postprocess requires <operation> <input-file> <output-file>')
  }
  const options = parseOptions(optionArgs)
  if (options.page != null && options.allpages) throw new Error('--all-pages cannot be combined with --page')
  const inputFormat = options.inputformat || 'yaml'
  if (!['yaml', 'drawio'].includes(inputFormat)) throw new Error(`unsupported postprocess input format "${inputFormat}"`)
  const extension = outputPath === '-' ? null : extname(outputPath).toLowerCase()
  const projection = new Set(['mermaid', 'explain', 'html']).has(operation)
  if (outputPath === '-' && !projection) {
    throw new Error('canonical postprocess output requires an explicit file path')
  }
  let sidecarPath
  if (outputPath !== '-') {
    sidecarPath = assertPreservedInputPaths([inputPath, ...auxiliaryInputPaths(options)], outputPath)
  }

  const inputText = readInput(inputPath)
  const input = normalizePostprocessInput(inputText, { inputFormat })
  const transformOptions = {
    page: options.page,
    allPages: options.allpages,
    direction: options.direction,
    fenced: options.fenced,
    title: options.title,
    search: options.search,
    labelFallback: options.labelfallback,
    allowMissing: options.allowmissing,
    palette: options.palette,
    min: optionNumber(options.min, '--min'),
    max: optionNumber(options.max, '--max')
  }
  if (options.sizemin != null || options.sizemax != null) {
    transformOptions.sizeScale = {
      min: optionNumber(options.sizemin, '--size-min'),
      max: optionNumber(options.sizemax, '--size-max')
    }
  }

  let content
  let outputKind
  let diagnostics
  const auxiliaryInputs = {}
  if (operation === 'mermaid') {
    if (outputPath !== '-' && !['.mmd', '.md', '.txt'].includes(extension)) throw new Error('mermaid output must use .mmd, .md, or .txt')
    const rendered = renderMermaid(input, { ...transformOptions, returnWarnings: true })
    content = rendered.text
    diagnostics = { warnings: rendered.warnings }
    for (const warning of rendered.warnings) stderr.write(`Warning: ${warning}\n`)
    outputKind = 'mermaid'
  } else if (operation === 'explain') {
    if (outputPath !== '-' && !['.md', '.txt'].includes(extension)) throw new Error('explain output must use .md or .txt')
    content = explainDocument(input, transformOptions)
    outputKind = 'markdown'
  } else if (operation === 'html') {
    if (outputPath !== '-' && !['.html', '.htm'].includes(extension)) throw new Error('html output must use .html or .htm')
    content = await renderHtml(input, transformOptions)
    outputKind = 'html'
  } else {
    if (!['.yaml', '.yml', '.drawio'].includes(extension)) throw new Error('canonical postprocess output must use .yaml, .yml, or .drawio')
    let transformed
    if (operation === 'relabel') {
      if (!options.map) throw new Error('relabel requires --map <json-file>')
      const mapInput = readJsonInput(options.map, 'relabel map')
      auxiliaryInputs.map = mapInput.bytes
      const result = applyRelabel(input, mapInput.value, {
        ...transformOptions,
        returnDiagnostics: true
      })
      transformed = result.value
      diagnostics = result.diagnostics
    } else if (operation === 'restyle') {
      const presetInput = resolvePresetInput(options.preset)
      if (presetInput.bytes) auxiliaryInputs.preset = presetInput.bytes
      const result = applyRestyle(input, presetInput.value, {
        ...transformOptions,
        returnDiagnostics: true
      })
      transformed = result.value
      diagnostics = result.diagnostics
    } else {
      if (!options.metrics) throw new Error('heatmap requires --metrics <json-or-csv-file>')
      const metricsInput = readLocalFile(options.metrics, 'heatmap metrics')
      auxiliaryInputs.metrics = metricsInput.bytes
      const result = applyHeatmap(input, metricsInput.text, {
        ...transformOptions,
        returnDiagnostics: true
      })
      transformed = result.value
      diagnostics = result.diagnostics
    }
    const normalized = normalizePostprocessInput(transformed)
    content = await canonicalOutput(normalized, extension)
    outputKind = extension === '.drawio' ? 'drawio' : 'spec-yaml'
  }

  if (outputPath === '-') {
    stdout.write(content)
    if (!content.endsWith('\n')) stdout.write('\n')
    return
  }
  const metadata = buildPostprocessMetadata({
    operation,
    input,
    options: transformOptions,
    auxiliaryInputs,
    outputKind,
    evidence: 'command-executed',
    diagnostics
  })
  writePostprocessArtifact(outputPath, content, { inputPath })
  writePostprocessArtifact(sidecarPath, serializePostprocessMetadata(metadata), { inputPath })
  stderr.write(`Saved postprocess ${operation}: ${outputPath}\n`)
}

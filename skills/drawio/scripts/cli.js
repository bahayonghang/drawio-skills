#!/usr/bin/env node
/**
 * CLI tool for converting YAML specifications to draw.io XML or SVG
 * Usage: node cli.js input.yaml [output.drawio|output.svg] [--theme name] [--strict] [--validate]
 */

import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, extname, join, relative, resolve } from 'node:path'
import {
  computeLayoutQualityMetrics,
  specToDrawioXml,
  validateSpec,
  validateXml
} from './dsl/spec-to-drawio.js'
import { parseDocumentYaml, selectDocumentPage, validateDocumentSpec } from './dsl/document-spec.js'
import { applyAutoLayout } from './dsl/auto-layout.js'
import {
  parseCiWorkflow,
  parseComposeConfig,
  parseCsvToSpec,
  parseKubernetesManifests,
  parseGoImportsProject,
  parseJavaScriptImportsProject,
  parseMermaidToSpec,
  parseOpenApiDocument,
  parsePythonClassesProject,
  parsePythonImportsProject,
  parseRustImportsProject,
  parseSqlDdl,
  parseTerraformConfig,
  projectGraphToSpec
} from './adapters/index.js'
import { drawioToSpec } from './dsl/drawio-to-spec.js'
import { drawioToDocumentSpec, renderDocumentPages, validateDrawioDocument } from './dsl/multi-page.js'
import { searchShapeCatalogBatch } from './dsl/catalog-search.js'
import {
  buildArchMetadata,
  buildMultiPageArchMetadata,
  createDrawioFileContent,
  createMultiPageDrawioFileContent,
  deriveArtifactPaths,
  serializeDocumentSpecYaml,
  serializeSpecYaml
} from './runtime/artifacts.js'
import { exportWithDrawioDesktop, isDesktopExportFormat } from './runtime/desktop.js'
import { exportVisionPreview } from './runtime/vision-preview.js'

/** draw.io format compatibility version */
const DRAWIO_COMPAT_VERSION = '21.0.0'

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2)

if (args[0] === 'search') {
  const prefixIndex = args.indexOf('--prefix')
  const limitIndex = args.indexOf('--limit')
  const prefix = prefixIndex === -1 ? null : args[prefixIndex + 1]
  const limit = limitIndex === -1 ? 8 : Number(args[limitIndex + 1])
  const json = args.includes('--json')
  const query = args
    .slice(1)
    .filter((arg, index, all) => {
      if (arg.startsWith('--')) return false
      return all[index - 1] !== '--prefix' && all[index - 1] !== '--limit'
    })
    .join(' ')

  if (!query || (prefixIndex !== -1 && (!prefix || prefix.startsWith('--'))) || !Number.isInteger(limit) || limit < 1) {
    console.error('Usage: node cli.js search <query> [--prefix <library>] [--limit <n>] [--json]')
    process.exit(1)
  }

  const groups = searchShapeCatalogBatch(query, { prefix, limit })
  if (json) {
    console.log(JSON.stringify(groups, null, 2))
  } else {
    for (const group of groups) {
      console.log(`${group.query}:`)
      for (const result of group.results) {
        console.log(`  ${result.name}${result.title ? ` | ${result.title}` : ''}${result.spec ? ` | spec: ${result.spec}` : ''}`)
      }
      if (group.results.length === 0) console.log('  No matching catalog entries.')
    }
  }
  process.exit(groups.every((group) => group.results.length > 0) ? 0 : 1)
}

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(
    `
draw.io YAML → XML/SVG Converter

Usage:
  node cli.js <input> [output.drawio|output.svg] [options]
  node cli.js search <query> [--prefix <library>] [--limit <n>] [--json]

Arguments:
  input               Path to input file, or - for stdin
  output file         Optional output file. Extension determines format:
                        .drawio  → draw.io XML file format
                        .svg     → Standalone SVG (or desktop SVG with --use-desktop)
                        .png     → PNG via draw.io Desktop CLI
                        .pdf     → PDF via draw.io Desktop CLI
                        .jpg     → JPG via draw.io Desktop CLI
                      If omitted, XML is printed to stdout.

Options:
  --input-format <f>  Input format: yaml (default), mermaid, csv, drawio,
                      terraform, kubernetes, compose, sql, openapi,
                      github-actions, gitlab-ci, python-imports,
                      python-classes, js-imports, go-imports, or rust-imports
  --scope <name>      Kubernetes logical cluster/environment identity
  --project <name>    Compose project identity override
  --dialect <name>    SQL dialect (default: postgres)
  --module-address <a> Terraform module address for the selected source
  --workflow <path>   CI workflow repo-relative path (required for stdin)
  --theme <name>      Override theme (e.g. tech-blue, academic, nature, dark)
  --page <selector>   page index (0-based), page id, or unique page name
  --all-pages         drawio import: import every page as canonical bundle v1
  --export-spec       Export the canonical YAML spec instead of generating XML/SVG
  --strict            Fail on complexity and spec validation warnings
  --strict-warnings   Alias of --strict (recommended for paper-grade validation)
  --allow-unknown-shapes  Downgrade unknown covered stencil names to warnings
  --validate          Run XML validation and print results (also summarizes spec warnings)
  --write-sidecars    Emit canonical .spec.yaml and .arch.json next to the output
  --sidecar-dir <dir> Emit sidecars in this directory when --write-sidecars is set
  --use-desktop       Prefer draw.io Desktop CLI for SVG export; required for PNG/PDF/JPG
  --visual-preview    Export a non-embedded PNG with longest edge <= 2000px for visual review
  search              Search the bundled shape catalog without network access
  --help, -h          Show this help message
`.trim()
  )
  process.exit(0)
}

// Extract positional arguments (non-flag args, excluding values of --flags)
const flagsWithValues = new Set([
  '--theme',
  '--input-format',
  '--page',
  '--sidecar-dir',
  '--dpi',
  '--scope',
  '--project',
  '--dialect',
  '--module-address',
  '--workflow'
])
const positional = []
for (let i = 0; i < args.length; i++) {
  if (flagsWithValues.has(args[i])) {
    i++ // skip the flag value
  } else if (!args[i].startsWith('--')) {
    positional.push(args[i])
  }
}
const inputFile = positional[0]
const outputFile = positional[1] || null

// Extract flags
const themeIndex = args.indexOf('--theme')
const themeName = themeIndex !== -1 ? args[themeIndex + 1] : null
const inputFormatIndex = args.indexOf('--input-format')
const inputFormat = inputFormatIndex !== -1 ? args[inputFormatIndex + 1] : 'yaml'
const strict = args.includes('--strict') || args.includes('--strict-warnings')
const allowUnknownShapes = args.includes('--allow-unknown-shapes')
const doValidate = args.includes('--validate')
const writeSidecars = args.includes('--write-sidecars')
const useDesktop = args.includes('--use-desktop')
const visualPreview = args.includes('--visual-preview')
const dpiIndex = args.indexOf('--dpi')
const dpi = dpiIndex !== -1 ? Number(args[dpiIndex + 1]) : 300
const exportSpec = args.includes('--export-spec')
const allPages = args.includes('--all-pages')
const pageIndex = args.indexOf('--page')
const pageSelector = pageIndex !== -1 ? args[pageIndex + 1] : null
const sidecarDirIndex = args.indexOf('--sidecar-dir')
const sidecarDir = sidecarDirIndex !== -1 ? args[sidecarDirIndex + 1] : null
const resolvedSidecarDir = sidecarDir ? resolve(sidecarDir) : null

if (allPages && pageIndex !== -1) {
  console.error('Error: --all-pages cannot be combined with --page.')
  process.exit(1)
}
if (allPages && inputFormat !== 'drawio') {
  console.error('Error: --all-pages is only valid with --input-format drawio.')
  process.exit(1)
}
const optionValue = (name) => {
  const index = args.indexOf(name)
  if (index === -1) return undefined
  const value = args[index + 1]
  if (!value || value.startsWith('--')) {
    console.error(`Error: ${name} requires a value.`)
    process.exit(1)
  }
  return value
}
const adapterScope = optionValue('--scope')
const adapterProject = optionValue('--project')
const adapterDialect = optionValue('--dialect') || 'postgres'
const adapterModuleAddress = optionValue('--module-address') || ''
const repoRelativeInput =
  inputFile && inputFile !== '-' ? relative(process.cwd(), resolve(inputFile)).replaceAll('\\', '/') : undefined
const adapterWorkflow = optionValue('--workflow') || repoRelativeInput
const adapterLocator = repoRelativeInput || `${inputFormat}.stdin`
const codeInputFormats = new Set([
  'python-imports',
  'python-classes',
  'js-imports',
  'go-imports',
  'rust-imports'
])
const codeProjectInput = codeInputFormats.has(inputFormat)
const codeAdapterLocator =
  repoRelativeInput &&
  !repoRelativeInput.startsWith('/') &&
  !/^[A-Za-z]:/.test(repoRelativeInput) &&
  !repoRelativeInput.split('/').includes('..')
    ? repoRelativeInput
    : inputFile && inputFile !== '-'
      ? basename(resolve(inputFile))
      : 'project'

if (visualPreview && (!outputFile || extname(outputFile).toLowerCase() !== '.png')) {
  console.error('Error: --visual-preview requires an explicit .png output path.')
  process.exit(1)
}

if (visualPreview && dpiIndex !== -1) {
  console.error('Error: --visual-preview cannot be combined with --dpi; preview dimensions are bounded directly.')
  process.exit(1)
}

if (visualPreview && exportSpec) {
  console.error('Error: --visual-preview cannot be combined with --export-spec.')
  process.exit(1)
}

if (sidecarDirIndex !== -1 && (!sidecarDir || sidecarDir.startsWith('--'))) {
  console.error('Error: --sidecar-dir requires a directory path.')
  process.exit(1)
}

if (sidecarDir && !writeSidecars) {
  console.error('Error: --sidecar-dir requires --write-sidecars.')
  process.exit(1)
}

if (resolvedSidecarDir) {
  try {
    mkdirSync(resolvedSidecarDir, { recursive: true })
  } catch (err) {
    console.error(`Error: Could not create sidecar directory "${sidecarDir}": ${err.message}`)
    process.exit(1)
  }
}

// ---------------------------------------------------------------------------
// SVG module (optional)
// ---------------------------------------------------------------------------

let drawioToSvg = null
try {
  const svgModule = await import('./svg/drawio-to-svg.js')
  drawioToSvg = svgModule.drawioToSvg
} catch {
  // SVG export not available
}

// ---------------------------------------------------------------------------
// Read and convert
// ---------------------------------------------------------------------------

let inputText
if (codeProjectInput) {
  if (!inputFile || inputFile === '-') {
    console.error(`Error: ${inputFormat} requires a local project directory; stdin is not supported.`)
    process.exit(1)
  }
} else if (inputFile === '-' || (!inputFile && !process.stdin.isTTY)) {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  inputText = Buffer.concat(chunks).toString('utf-8')
} else if (!inputFile) {
  console.error('Error: input file is required. Use - for stdin.')
  process.exit(1)
} else {
  try {
    inputText = readFileSync(resolve(inputFile), 'utf-8')
  } catch (err) {
    console.error(`Error: Could not read input file "${inputFile}": ${err.message}`)
    process.exit(1)
  }
}

let spec
let document = null
try {
  if (codeProjectInput) {
    const parser = {
      'python-imports': parsePythonImportsProject,
      'python-classes': parsePythonClassesProject,
      'js-imports': parseJavaScriptImportsProject,
      'go-imports': parseGoImportsProject,
      'rust-imports': parseRustImportsProject
    }[inputFormat]
    spec = projectGraphToSpec(await parser(resolve(inputFile), { locator: codeAdapterLocator }))
  } else if (inputFormat === 'yaml') {
    const parsedDocument = parseDocumentYaml(inputText)
    if (parsedDocument.kind === 'multi-page-v1') document = parsedDocument
    else spec = parsedDocument.spec
  } else if (inputFormat === 'mermaid') {
    spec = parseMermaidToSpec(inputText, { profile: themeName?.startsWith('academic') ? 'academic-paper' : 'default' })
  } else if (inputFormat === 'csv') {
    spec = parseCsvToSpec(inputText, { profile: themeName?.startsWith('academic') ? 'academic-paper' : 'default' })
  } else if (inputFormat === 'drawio') {
    if (allPages) document = drawioToDocumentSpec(inputText)
    else spec = drawioToSpec(inputText, { theme: themeName || undefined, page: pageSelector })
  } else if (inputFormat === 'terraform') {
    spec = projectGraphToSpec(
      parseTerraformConfig(inputText, { locator: adapterLocator, moduleAddress: adapterModuleAddress })
    )
  } else if (inputFormat === 'kubernetes') {
    spec = projectGraphToSpec(
      parseKubernetesManifests(inputText, { scope: adapterScope, locator: adapterLocator })
    )
  } else if (inputFormat === 'compose') {
    spec = projectGraphToSpec(parseComposeConfig(inputText, { project: adapterProject, locator: adapterLocator }))
  } else if (inputFormat === 'sql') {
    spec = projectGraphToSpec(parseSqlDdl(inputText, { dialect: adapterDialect, locator: adapterLocator }))
  } else if (inputFormat === 'openapi') {
    spec = projectGraphToSpec(parseOpenApiDocument(inputText, { locator: adapterLocator }))
  } else if (inputFormat === 'github-actions' || inputFormat === 'gitlab-ci') {
    spec = projectGraphToSpec(
      parseCiWorkflow(inputText, { provider: inputFormat, workflow: adapterWorkflow })
    )
  } else {
    throw new Error(`Unsupported input format "${inputFormat}"`)
  }
} catch (err) {
  const context = [
    err.code,
    err.adapter && `adapter=${err.adapter}`,
    err.path && `path=${err.path}`,
    Number.isInteger(err.context?.line) && `line=${err.context.line}`,
    Number.isInteger(err.context?.column) && `column=${err.context.column}`
  ].filter(Boolean)
  const contextText = context.length > 0 ? `[${context.join(' ')}] ` : ''
  console.error(`Error: Failed to parse ${inputFormat}: ${contextText}${err.message}`)
  process.exit(1)
}

try {
  if (document) validateDocumentSpec(document)
  else validateSpec(spec)
} catch (err) {
  console.error(`Error: Spec validation failed: ${err.message}`)
  process.exit(1)
}

// Apply CLI theme override
if (themeName) {
  if (document) {
    for (const page of document.pages) {
      page.meta = page.meta || {}
      page.meta.theme = themeName
    }
  } else {
    spec.meta = spec.meta || {}
    spec.meta.theme = themeName
  }
}

// Edge-aware auto-layout pre-pass (hierarchical specs without explicit geometry)
if (!document) {
  const autoLayoutResult = await applyAutoLayout(spec)
  if (autoLayoutResult.warning) {
    console.error(`Warning: ${autoLayoutResult.warning}`)
  }
  spec = autoLayoutResult.spec
}

let xml
let documentContent = null
let renderedDocumentPages = null
try {
  if (exportSpec) {
    xml = null
  } else if (document) {
    if (!outputFile) {
      throw new Error('multi-page documents require an explicit .drawio output path')
    }
    const outputExtension = extname(outputFile).toLowerCase()
    if (outputExtension !== '.drawio' && pageSelector == null) {
      throw new Error('multi-page SVG/PNG/PDF/JPG export requires --page <index|id|name>')
    }
    renderedDocumentPages = await renderDocumentPages(document, { strict, allowUnknownShapes })
    if (outputExtension === '.drawio') {
      documentContent = createMultiPageDrawioFileContent(renderedDocumentPages, {
        version: DRAWIO_COMPAT_VERSION,
        documentMeta: document.meta
      })
    } else {
      const selectedPage = selectDocumentPage(document, pageSelector)
      const rendered = renderedDocumentPages.find((page) => page.id === selectedPage.id)
      xml = rendered.xml
      documentContent = createDrawioFileContent(xml, { version: DRAWIO_COMPAT_VERSION })
    }
  } else if (doValidate) {
    const result = specToDrawioXml(spec, { strict, allowUnknownShapes, returnWarnings: true, silent: true })
    xml = result.xml
    const problems = (result.warnings || []).filter((w) => w.level && w.level !== 'fatal')
    if (problems.length === 0) {
      console.error('Spec validation: PASSED (no warnings)')
    } else {
      console.error(`Spec validation: WARNINGS (${problems.length})`)
      problems.forEach((w) => console.error(`  • [${w.level}] ${w.message}`))
    }
    const metrics = computeLayoutQualityMetrics(spec)
    console.error(
      `Layout metrics: node-crossings=${metrics.edgeNodeCrossings}, edge-crossings=${metrics.edgeEdgeCrossings}, total-edge-length=${metrics.totalEdgeLength}px`
    )
  } else {
    xml = specToDrawioXml(spec, { strict, allowUnknownShapes })
  }
} catch (err) {
  console.error(`Error: Conversion failed: ${err.message}`)
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

if (doValidate && !exportSpec) {
  const result = document ? validateDrawioDocument(documentContent) : validateXml(xml)
  if (result.warnings?.length) {
    console.error(`XML validation warnings (${result.warnings.length}):`)
    for (const w of result.warnings) {
      console.error(`  - ${w}`)
    }
    if (strict) {
      console.error('XML validation: FAILED (--strict treats warnings as errors)')
      process.exit(1)
    }
  }
  if (result.valid) {
    console.error('XML validation: PASSED (no errors)')
  } else {
    console.error('XML validation: FAILED')
    for (const e of result.errors) {
      console.error(`  - ${e}`)
    }
    process.exit(1)
  }
}

if (
  !exportSpec &&
  spec?.meta?.profile === 'academic-paper' &&
  outputFile &&
  extname(outputFile).toLowerCase() !== '.svg'
) {
  console.error('Validation: academic-paper profile recommends SVG export for paper-ready vector output.')
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

if (exportSpec) {
  const yamlOut = document ? serializeDocumentSpecYaml(document) : serializeSpecYaml(spec)
  let specPath = outputFile
  if (!specPath && inputFormat === 'drawio' && inputFile && inputFile !== '-') {
    specPath = deriveArtifactPaths(inputFile).specPath
  }

  if (specPath && resolvedSidecarDir) {
    specPath = resolve(resolvedSidecarDir, basename(specPath))
  }

  if (!specPath) {
    process.stdout.write(yamlOut)
    if (!yamlOut.endsWith('\n')) process.stdout.write('\n')
    process.exit(0)
  }

  try {
    writeFileSync(resolve(specPath), yamlOut, 'utf-8')
    console.error(`Saved spec: ${specPath}`)
  } catch (err) {
    console.error(`Error: Could not write spec file "${specPath}": ${err.message}`)
    process.exit(1)
  }

  if (writeSidecars) {
    const normalized = specPath.replace(/\\/g, '/')
    let archPath = null
    if (/\.spec\.ya?ml$/i.test(normalized)) {
      archPath = normalized.replace(/\.spec\.ya?ml$/i, '.arch.json')
    } else if (/\.ya?ml$/i.test(normalized)) {
      archPath = normalized.replace(/\.ya?ml$/i, '.arch.json')
    }

    if (archPath) {
      if (resolvedSidecarDir) {
        archPath = resolve(resolvedSidecarDir, basename(archPath))
      }
      const drawioPath = /\.arch\.json$/i.test(archPath) ? archPath.replace(/\.arch\.json$/i, '.drawio') : null
      try {
        writeFileSync(
          resolve(archPath),
          JSON.stringify(
            document
              ? buildMultiPageArchMetadata(document, { outputFile: drawioPath || specPath })
              : buildArchMetadata(spec, { outputFile: drawioPath || specPath }),
            null,
            2
          ) + '\n',
          'utf-8'
        )
        console.error(`Saved arch: ${archPath}`)
      } catch (err) {
        console.error(`Error: Could not write arch file "${archPath}": ${err.message}`)
        process.exit(1)
      }
    }
  }

  process.exit(0)
}

if (!outputFile) {
  process.stdout.write(xml)
  process.stdout.write('\n')
  process.exit(0)
}

const ext = extname(outputFile).toLowerCase()
const drawioContent = documentContent || createDrawioFileContent(xml, { version: DRAWIO_COMPAT_VERSION })
const artifactPaths = deriveArtifactPaths(outputFile)
const sidecarArtifactPaths = resolvedSidecarDir
  ? deriveArtifactPaths(resolve(resolvedSidecarDir, basename(artifactPaths.drawioPath)))
  : artifactPaths
const needsDesktopExport = isDesktopExportFormat(ext.slice(1)) && (ext !== '.svg' || useDesktop)
let tempDir = null
let desktopInputPath = null

function writeCanonicalSidecars() {
  if (!writeSidecars) return

  writeFileSync(
    resolve(sidecarArtifactPaths.specPath),
    document ? serializeDocumentSpecYaml(document) : serializeSpecYaml(spec),
    'utf-8'
  )
  writeFileSync(
    resolve(sidecarArtifactPaths.archPath),
    JSON.stringify(
      document ? buildMultiPageArchMetadata(document, { outputFile }) : buildArchMetadata(spec, { outputFile }),
      null,
      2
    ) + '\n',
    'utf-8'
  )
}

function ensureDesktopInput() {
  if (desktopInputPath) return desktopInputPath

  if (writeSidecars) {
    desktopInputPath = resolve(artifactPaths.drawioPath)
    writeFileSync(desktopInputPath, drawioContent, 'utf-8')
    return desktopInputPath
  }

  tempDir = mkdtempSync(join(tmpdir(), 'drawio-skill-'))
  desktopInputPath = resolve(tempDir, 'export-input.drawio')
  writeFileSync(desktopInputPath, drawioContent, 'utf-8')
  return desktopInputPath
}

let exitCode = 0

try {
  if (ext === '.drawio') {
    writeFileSync(resolve(outputFile), drawioContent, 'utf-8')
    writeCanonicalSidecars()
    console.error(`Saved: ${outputFile}`)
  } else if (needsDesktopExport) {
    try {
      const exportResult = visualPreview
        ? await exportVisionPreview({
            inputFile: ensureDesktopInput(),
            outputFile: resolve(outputFile)
          })
        : await exportWithDrawioDesktop({
            inputFile: ensureDesktopInput(),
            outputFile: resolve(outputFile),
            format: ext.slice(1),
            scale: dpi / 96
          })
      writeCanonicalSidecars()
      if (visualPreview) {
        console.error(
          `Saved vision preview: ${outputFile} (${exportResult.width}x${exportResult.height}; ` +
            `${exportResult.reexported ? 'height re-exported' : 'width-bounded'}; ${exportResult.repairStatus})`
        )
      } else {
        console.error(`Saved: ${outputFile}`)
      }
    } catch (err) {
      const desktopMissing = /draw\.io Desktop CLI was not found/.test(err.message)
      if (desktopMissing && drawioToSvg) {
        // Preserve offline authoring: fall back to a standalone SVG so the user still gets an artifact.
        try {
          const svgOutput = outputFile.replace(/\.[^.]+$/, '.svg')
          writeFileSync(resolve(svgOutput), drawioToSvg(xml), 'utf-8')
          if (writeSidecars) writeFileSync(resolve(artifactPaths.drawioPath), drawioContent, 'utf-8')
          writeCanonicalSidecars()
          console.error(
            `${visualPreview ? 'draw.io Desktop not found — no PNG vision-preview was produced; ' : 'draw.io Desktop not found — '}` +
              `fell back to SVG: ${svgOutput}. ` +
              `Install draw.io Desktop or set DRAWIO_CMD to export ${ext.slice(1).toUpperCase()}.`
          )
        } catch (svgErr) {
          console.error(`Error: ${err.message}`)
          exitCode = 1
        }
      } else {
        console.error(`Error: ${err.message}`)
        exitCode = 1
      }
    }
  } else if (ext === '.svg') {
    if (!drawioToSvg) {
      console.error('Error: SVG export is not available (drawio-to-svg module not found).')
      exitCode = 1
    } else {
      let svg
      try {
        svg = drawioToSvg(xml)
      } catch (err) {
        console.error(`Error: SVG conversion failed: ${err.message}`)
        exitCode = 1
      }

      if (exitCode === 0) {
        try {
          writeFileSync(resolve(outputFile), svg, 'utf-8')
          if (writeSidecars) {
            writeFileSync(resolve(artifactPaths.drawioPath), drawioContent, 'utf-8')
          }
          writeCanonicalSidecars()
          console.error(`Saved SVG: ${outputFile}`)
        } catch (err) {
          console.error(`Error: Could not write output file "${outputFile}": ${err.message}`)
          exitCode = 1
        }
      }
    }
  } else {
    console.error(
      `Error: Unsupported output extension "${ext || '(none)'}". ` + 'Use .drawio, .svg, .png, .pdf, or .jpg/.jpeg.'
    )
    exitCode = 1
  }
} finally {
  if (tempDir) {
    rmSync(tempDir, { recursive: true, force: true })
  }
}

process.exit(exitCode)

import yaml from 'js-yaml'
import { basename, extname, resolve } from 'node:path'

const EXPORT_EXTENSIONS = ['.png', '.svg', '.pdf', '.jpg', '.jpeg']

function stripExtension(path, extension) {
  return path.slice(0, -extension.length)
}

function getDrawioPath(outputFile) {
  const resolved = resolve(outputFile)
  const lower = resolved.toLowerCase()

  for (const extension of EXPORT_EXTENSIONS) {
    if (lower.endsWith(`.drawio${extension}`)) {
      return stripExtension(resolved, extension)
    }
  }

  const extension = extname(lower)
  if (extension === '.drawio') {
    return resolved
  }
  if (EXPORT_EXTENSIONS.includes(extension)) {
    return `${stripExtension(resolved, extension)}.drawio`
  }
  return `${resolved}.drawio`
}

function stripDrawioSuffix(drawioPath) {
  return drawioPath.toLowerCase().endsWith('.drawio')
    ? drawioPath.slice(0, -'.drawio'.length)
    : drawioPath
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) =>
      fieldValue !== undefined &&
      fieldValue !== null &&
      fieldValue !== ''
    )
  )
}

function buildReplicationMetadata(replication) {
  if (!replication || typeof replication !== 'object' || Array.isArray(replication)) {
    return undefined
  }

  const palette = Array.isArray(replication.palette)
    ? replication.palette
        .map(entry => compactObject({
          hex: entry?.hex,
          role: entry?.role,
          appliesTo: entry?.appliesTo,
          confidence: entry?.confidence,
          notes: entry?.notes
        }))
        .filter(entry => Object.keys(entry).length > 0)
    : []

  const confidenceNotes = Array.isArray(replication.confidenceNotes)
    ? replication.confidenceNotes.filter(note => typeof note === 'string' && note.trim() !== '')
    : []

  const summary = compactObject({
    colorMode: replication.colorMode,
    background: replication.background,
    palette: palette.length > 0 ? palette : undefined,
    confidenceNotes: confidenceNotes.length > 0 ? confidenceNotes : undefined
  })

  return Object.keys(summary).length > 0 ? summary : undefined
}

function inferDiagramType(spec) {
  if (spec.meta?.profile === 'academic-paper') return 'academic-diagram'
  if (spec.meta?.profile === 'engineering-review') return 'engineering-diagram'
  if ((spec.modules?.length || 0) > 0) return 'module-diagram'
  if ((spec.edges?.length || 0) > 0) return 'flow-diagram'
  return 'diagram'
}

export function deriveArtifactPaths(outputFile) {
  const drawioPath = getDrawioPath(outputFile)
  const stem = stripDrawioSuffix(drawioPath)

  return {
    drawioPath,
    specPath: `${stem}.spec.yaml`,
    archPath: `${stem}.arch.json`,
    stem
  }
}

export function serializeSpecYaml(spec) {
  return yaml.dump(spec, {
    noRefs: true,
    lineWidth: 120,
    sortKeys: false
  })
}

export function buildArchMetadata(spec, { outputFile } = {}) {
  const artifactPaths = outputFile ? deriveArtifactPaths(outputFile) : null
  const fallbackTitle = artifactPaths
    ? basename(artifactPaths.stem)
    : 'diagram'
  const replication = buildReplicationMetadata(spec.meta?.replication)

  const arch = {
    version: 1,
    title: spec.meta?.title || fallbackTitle,
    type: inferDiagramType(spec),
    source: spec.meta?.source || 'generated',
    profile: spec.meta?.profile || 'default',
    theme: spec.meta?.theme || 'tech-blue',
    layout: spec.meta?.layout || 'horizontal',
    counts: {
      nodes: spec.nodes?.length || 0,
      edges: spec.edges?.length || 0,
      modules: spec.modules?.length || 0
    },
    nodes: (spec.nodes || []).map(node => compactObject({
      id: node.id,
      label: node.label,
      type: node.type || 'service',
      module: node.module,
      icon: node.icon,
      size: node.size
    })),
    edges: (spec.edges || []).map((edge, index) => compactObject({
      id: edge.id || `edge-${index + 1}`,
      from: edge.from,
      to: edge.to,
      type: edge.type || 'primary',
      label: edge.label,
      bidirectional: edge.bidirectional ? true : undefined
    })),
    modules: (spec.modules || []).map(module => compactObject({
      id: module.id,
      label: module.label,
      color: module.color
    }))
  }

  if (replication) {
    arch.replication = replication
  }

  return arch
}

export function createDrawioFileContent(xml, { version = '21.0.0' } = {}) {
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    `<mxfile host="cli" modified="" agent="drawio-skill-cli" version="${version}">\n` +
    '  <diagram name="Page-1">\n' +
    `    ${xml}\n` +
    '  </diagram>\n' +
    '</mxfile>\n'
  )
}

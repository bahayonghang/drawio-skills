/**
 * Resolve local PNG/JPEG assets into draw.io image styles.
 * Paths are relative to the asset root (cwd or --asset-root), never to the spec file.
 */

import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs'
import { extname, isAbsolute, join, relative, resolve as resolvePath, sep } from 'node:path'

import { IMAGE_ICON_STYLE_PREFIX } from './icon-resolver.js'

export const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
export const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff])
export const RECIPE_DOC_PATH = 'references/docs/local-image-assets.md'
export const ASSET_SIZE_WARNING_BYTES = 2 * 1024 * 1024
export const ASSET_SIZE_ERROR_BYTES = 8 * 1024 * 1024
export const ASSET_TOTAL_ERROR_BYTES = 24 * 1024 * 1024

const RASTER_DATA_URI =
  /(?:^|;)image=(data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+=*)(?:;|$)/i

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function fail(path, message) {
  const error = new Error(`${path}: ${message}`)
  error.code = 'ASSET_INVALID'
  error.path = path
  throw error
}

function formatMiB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(3)
}

function posixRelative(from, to) {
  return relative(from, to).split(sep).join('/')
}

/**
 * Containment uses path-separator boundaries via path.relative, not bare startsWith.
 */
export function isPathInsideRoot(candidate, root) {
  const rel = relative(root, candidate)
  if (rel === '') return true
  if (isAbsolute(rel)) return false
  return rel.split(/[/\\]/)[0] !== '..'
}

export function isAbsoluteAssetPath(value) {
  if (typeof value !== 'string' || value.length === 0) return false
  if (isAbsolute(value)) return true
  return /^[A-Za-z]:/.test(value)
}

function sniffRasterMime(bytes, ext, field) {
  const isPng = bytes.length >= 8 && bytes.subarray(0, 8).equals(PNG_MAGIC)
  const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (ext === '.png') {
    if (!isPng) fail(field, 'extension .png does not match PNG magic bytes')
    return 'image/png'
  }
  if (ext === '.jpg' || ext === '.jpeg') {
    if (!isJpeg) fail(field, `extension ${ext} does not match JPEG magic bytes`)
    return 'image/jpeg'
  }
  fail(field, `extension "${ext || '(none)'}" is not in the PNG/JPEG whitelist`)
}

export function inspectAssetFile(assetId, record, { assetRoot } = {}) {
  const field = `assets.${assetId}.path`
  if (!isRecord(record)) fail(`assets.${assetId}`, 'must be an object')
  if (typeof record.path !== 'string' || record.path.length === 0) {
    fail(field, 'is required')
  }
  if (isAbsoluteAssetPath(record.path)) {
    fail(field, 'must be a path relative to the asset root, not an absolute path')
  }

  const root = resolvePath(assetRoot ?? process.cwd())
  let rootReal
  try {
    rootReal = realpathSync(root)
  } catch (error) {
    fail(field, `asset root "${root}" could not be resolved: ${error.message}`)
  }

  const joined = resolvePath(root, record.path)
  let real
  try {
    real = realpathSync(joined)
  } catch (error) {
    if (error && error.code === 'ENOENT') fail(field, `file does not exist (${record.path})`)
    fail(field, error.message)
  }

  if (!isPathInsideRoot(real, rootReal)) {
    fail(field, 'resolves outside the asset root')
  }

  const ext = extname(record.path).toLowerCase()
  if (ext === '.svg' || ext === '.svgz') {
    fail(field, 'SVG local assets are not supported in v1; use PNG or JPEG')
  }
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) {
    fail(field, `extension "${ext || '(none)'}" is not in the PNG/JPEG whitelist`)
  }

  let stats
  try {
    stats = statSync(real)
  } catch (error) {
    fail(field, error.message)
  }
  if (!stats.isFile()) fail(field, 'must be a regular file')

  const bytes = readFileSync(real)
  const mime = sniffRasterMime(bytes, ext, field)
  const sha256 = createHash('sha256').update(bytes).digest('hex').toUpperCase()
  if (record.sha256 != null && String(record.sha256).toUpperCase() !== sha256) {
    fail(
      `assets.${assetId}.sha256`,
      `does not match file contents (declared ${record.sha256}, actual ${sha256})`
    )
  }

  return { bytes, mime, sha256, resolvedPath: real, byteLength: bytes.length }
}

export function resolveAssetImageStyle(assetId, assets, { assetRoot } = {}) {
  if (!isRecord(assets) || !Object.prototype.hasOwnProperty.call(assets, assetId)) {
    fail(`assets.${assetId}`, 'is not declared')
  }
  const inspected = inspectAssetFile(assetId, assets[assetId], { assetRoot })
  const dataUri = `data:${inspected.mime};base64,${inspected.bytes.toString('base64')}`
  return {
    style: `${IMAGE_ICON_STYLE_PREFIX}${dataUri}`,
    dataUri,
    path: assets[assetId].path,
    ...inspected
  }
}

export function specHasAssets(spec) {
  if (spec?.assets != null) return true
  return (spec?.nodes || []).some((node) => node?.image != null)
}

export function collectAssetSizeDiagnostics(byId, citationIds) {
  const diagnostics = []
  const seen = new Set()
  let weighted = 0
  for (const id of citationIds) {
    const item = byId.get(id)
    if (!item) continue
    weighted += item.byteLength
    if (seen.has(id)) continue
    seen.add(id)
    if (item.byteLength > ASSET_SIZE_ERROR_BYTES) {
      diagnostics.push({
        level: 'error',
        code: 'ASSET_SIZE',
        message:
          `Asset "${id}" is ${item.byteLength} B (${formatMiB(item.byteLength)} MiB), ` +
          `above the 8 MiB error threshold. See ${RECIPE_DOC_PATH}.`
      })
    } else if (item.byteLength > ASSET_SIZE_WARNING_BYTES) {
      diagnostics.push({
        level: 'warning',
        code: 'ASSET_SIZE',
        message:
          `Asset "${id}" is ${item.byteLength} B (${formatMiB(item.byteLength)} MiB), ` +
          `above the 2 MiB warning threshold. See ${RECIPE_DOC_PATH}.`
      })
    }
  }
  if (weighted > ASSET_TOTAL_ERROR_BYTES) {
    diagnostics.push({
      level: 'error',
      code: 'ASSET_SIZE',
      message:
        `Citation-weighted asset source bytes are ${weighted} B (${formatMiB(weighted)} MiB), ` +
        `above the 24 MiB error threshold. See ${RECIPE_DOC_PATH}.`
    })
  }
  return diagnostics
}

export function resolveSpecAssets(spec, { assetRoot } = {}) {
  const byId = new Map()
  const assets = isRecord(spec?.assets) ? spec.assets : {}
  for (const id of Object.keys(assets)) {
    byId.set(id, resolveAssetImageStyle(id, assets, { assetRoot }))
  }
  const citations = []
  for (const node of spec?.nodes || []) {
    if (node?.image != null) citations.push(node.image)
  }
  return { byId, diagnostics: collectAssetSizeDiagnostics(byId, citations) }
}

export function extractRasterDataUriFromStyle(styleStr) {
  if (typeof styleStr !== 'string' || styleStr.length === 0) return null
  const match = RASTER_DATA_URI.exec(styleStr)
  if (!match) return null
  const mime = match[2].toLowerCase() === 'png' ? 'image/png' : 'image/jpeg'
  const comma = match[1].indexOf(',')
  return { dataUri: match[1], mime, base64: match[1].slice(comma + 1) }
}

export function assetRecordFingerprint(record) {
  return JSON.stringify({
    path: record?.path ?? null,
    sha256: record?.sha256 ?? null,
    raster_reason: record?.raster_reason ?? null,
    atomic_raster_unit: record?.atomic_raster_unit ?? null,
    contains_reconstructable_content: record?.contains_reconstructable_content ?? null,
    decomposition_note: record?.decomposition_note ?? null
  })
}

export function writeExtractedAsset(bytes, mime, { extractDir, assetRoot, byHash } = {}) {
  if (!extractDir) {
    const error = new Error(
      'Imported shape=image cell has no asset metadata. Pass --extract-assets <dir> to write PNG/JPEG bytes and emit path references.'
    )
    error.code = 'ASSET_EXTRACT_REQUIRED'
    throw error
  }
  const sha256 = createHash('sha256').update(bytes).digest('hex').toUpperCase()
  if (byHash?.has(sha256)) return byHash.get(sha256)

  const root = resolvePath(assetRoot ?? process.cwd())
  let rootReal
  try {
    rootReal = realpathSync(root)
  } catch (error) {
    fail('extract-assets', `asset root could not be resolved: ${error.message}`)
  }

  const absExtract = resolvePath(extractDir)
  mkdirSync(absExtract, { recursive: true })
  let extractReal
  try {
    extractReal = realpathSync(absExtract)
  } catch (error) {
    fail('extract-assets', error.message)
  }
  if (!isPathInsideRoot(extractReal, rootReal)) {
    fail('extract-assets', '--extract-assets must be inside the asset root')
  }

  const ext = mime === 'image/png' ? '.png' : '.jpeg'
  const id = `asset${sha256.slice(0, 8)}`
  const absFile = join(absExtract, `${id}${ext}`)
  writeFileSync(absFile, bytes)
  const record = {
    id,
    path: posixRelative(root, absFile),
    sha256,
    mime
  }
  if (byHash) byHash.set(sha256, record)
  return record
}

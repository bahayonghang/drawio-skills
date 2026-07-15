import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { contrastRatio, relativeLuminance } from './palette-validate.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PALETTES_DIR = resolve(__dirname, '../../assets/palettes')
const PALETTE_NAME = /^[a-z][a-z0-9-]*$/
const ENTRY_NAME = /^[a-z][a-z0-9-]*$/
const ROLE_NAME = /^[a-z][a-z0-9_-]*$/
const HEX_COLOR = /^#[0-9A-F]{6}$/i
const CATEGORIES = new Set(['academic', 'engineering', 'general'])
const TOKEN_PATTERN = /^\$palette([1-9][0-9]*)(?:-(fill|stroke|text))?$/

export const PALETTE_REQUIRED_FIELDS = [
  'name',
  'displayName',
  'category',
  'colorblindSafe',
  'grayscaleSafe',
  'maxCategories',
  'source',
  'venues',
  'notes',
  'entries'
]

const SEMANTIC_ROLE_ORDER = [
  'service',
  'database',
  'decision',
  'queue',
  'user',
  'document',
  'terminal',
  'formula',
  'input',
  'output',
  'loss',
  'feature',
  'conv',
  'pool',
  'embed',
  'temporal',
  'attention',
  'gate',
  'norm',
  'graph',
  'matrix',
  'operator',
  'llm',
  'agent',
  'vector_store',
  'memory',
  'tool',
  'gateway'
]

function assertString(value, context) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${context} must be a non-empty string`)
}

function assertHex(value, context) {
  if (typeof value !== 'string' || !HEX_COLOR.test(value)) {
    throw new Error(`${context} must be a #RRGGBB color`)
  }
}

export function validatePaletteDefinition(palette) {
  if (typeof palette !== 'object' || palette == null || Array.isArray(palette)) {
    throw new Error('palette must be an object')
  }
  for (const field of PALETTE_REQUIRED_FIELDS) {
    if (!Object.hasOwn(palette, field)) throw new Error(`palette.${field} is required`)
  }

  assertString(palette.name, 'palette.name')
  if (!PALETTE_NAME.test(palette.name)) throw new Error('palette.name must match /^[a-z][a-z0-9-]*$/')
  assertString(palette.displayName, 'palette.displayName')
  if (!CATEGORIES.has(palette.category)) {
    throw new Error('palette.category must be one of academic, engineering, general')
  }
  for (const field of ['colorblindSafe', 'grayscaleSafe']) {
    if (typeof palette[field] !== 'boolean') throw new Error(`palette.${field} must be a boolean`)
  }
  if (!Number.isInteger(palette.maxCategories) || palette.maxCategories < 1 || palette.maxCategories > 16) {
    throw new Error('palette.maxCategories must be an integer between 1 and 16')
  }
  assertString(palette.source, 'palette.source')
  if (!Array.isArray(palette.venues) || palette.venues.some((venue) => typeof venue !== 'string')) {
    throw new Error('palette.venues must be an array of strings')
  }
  if (typeof palette.notes !== 'string') throw new Error('palette.notes must be a string')
  if (!Array.isArray(palette.entries) || palette.entries.length < 1 || palette.entries.length > 16) {
    throw new Error('palette.entries must contain between 1 and 16 entries')
  }
  if (palette.maxCategories > palette.entries.length) {
    throw new Error('palette.maxCategories must not exceed palette.entries.length')
  }

  const entryNames = new Set()
  palette.entries.forEach((entry, index) => {
    const context = `palette.entries[${index}]`
    if (typeof entry !== 'object' || entry == null || Array.isArray(entry)) {
      throw new Error(`${context} must be an object`)
    }
    assertString(entry.name, `${context}.name`)
    if (!ENTRY_NAME.test(entry.name)) throw new Error(`${context}.name must use lowercase kebab-case`)
    if (entryNames.has(entry.name)) throw new Error(`${context}.name must be unique`)
    entryNames.add(entry.name)
    assertHex(entry.base, `${context}.base`)
    for (const field of ['fill', 'stroke', 'text']) {
      if (entry[field] != null) assertHex(entry[field], `${context}.${field}`)
    }
  })

  if (palette.roles != null) {
    if (typeof palette.roles !== 'object' || Array.isArray(palette.roles)) {
      throw new Error('palette.roles must be an object when provided')
    }
    for (const [role, index] of Object.entries(palette.roles)) {
      if (!ROLE_NAME.test(role)) throw new Error(`palette.roles.${role} must match a supported semantic type key`)
      if (!Number.isInteger(index) || index < 0 || index >= palette.entries.length) {
        throw new Error(`palette.roles.${role} must index an existing palette entry`)
      }
    }
  }

  if (palette.connector != null) {
    if (typeof palette.connector !== 'object' || Array.isArray(palette.connector)) {
      throw new Error('palette.connector must be an object when provided')
    }
    if (palette.connector.default != null) assertHex(palette.connector.default, 'palette.connector.default')
  }

  return palette
}

function normalizeHex(value) {
  return value.toUpperCase()
}

function mix(color, target, amount) {
  const source = [1, 3, 5].map((offset) => Number.parseInt(color.slice(offset, offset + 2), 16))
  const destination = [1, 3, 5].map((offset) => Number.parseInt(target.slice(offset, offset + 2), 16))
  const channels = source.map((channel, index) => Math.round(channel * (1 - amount) + destination[index] * amount))
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('').toUpperCase()}`
}

function deriveStroke(base, canvasBackground) {
  if (contrastRatio(base, canvasBackground) >= 3) return base
  for (let amount = 0.05; amount <= 1; amount += 0.05) {
    const candidate = mix(base, '#000000', amount)
    if (contrastRatio(candidate, canvasBackground) >= 3) return candidate
  }
  return '#000000'
}

function materializePalette(palette, theme) {
  const diagnostics = []
  const canvasBackground = normalizeHex(theme?.canvas?.background || theme?.colors?.background || '#FFFFFF')
  const themeText = normalizeHex(theme?.colors?.text || '#000000')
  const entries = palette.entries.map((raw) => {
    const base = normalizeHex(raw.base)
    const fill = raw.fill
      ? normalizeHex(raw.fill)
      : relativeLuminance(base) < 0.25
        ? base
        : mix(base, '#FFFFFF', 0.85)
    const derivedStroke = raw.stroke ? normalizeHex(raw.stroke) : deriveStroke(base, canvasBackground)
    if (!raw.stroke && derivedStroke !== base) {
      diagnostics.push({
        level: 'info',
        code: 'PALETTE_STROKE_DERIVED',
        message: `Palette "${palette.name}" entry "${raw.name}" stroke was darkened to ${derivedStroke} for 3:1 canvas contrast.`
      })
    }
    const text = raw.text ? normalizeHex(raw.text) : relativeLuminance(fill) < 0.25 ? '#FFFFFF' : themeText
    return { name: raw.name, base, fill, stroke: derivedStroke, text }
  })
  return { palette: { ...palette, entries }, diagnostics }
}

function listPaletteNames(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name.slice(0, -5))
    .filter((name) => PALETTE_NAME.test(name))
}

function resolvePaletteFile(directory, name) {
  const root = resolve(directory)
  const candidate = resolve(root, `${name}.json`)
  const pathFromRoot = relative(root, candidate)
  if (pathFromRoot.startsWith(`..${sep}`) || pathFromRoot === '..') throw new Error('Palette path escapes its directory')
  return candidate
}

export function loadPalette(name, options = {}) {
  if (name == null || name === '') return { palette: null, diagnostics: [] }

  const userDir = options.userDir || resolve(homedir(), '.drawio-skill/palettes')
  const available = [...new Set([...listPaletteNames(PALETTES_DIR), ...listPaletteNames(userDir)])].sort()
  const availableMessage = `Available palettes: ${available.join(', ') || '(none)'}`
  if (typeof name !== 'string' || !PALETTE_NAME.test(name)) {
    throw new Error(`Invalid palette name "${name}". ${availableMessage}`)
  }

  const builtinPath = resolvePaletteFile(PALETTES_DIR, name)
  const userPath = resolvePaletteFile(userDir, name)
  const userOverride = existsSync(userPath)
  const selectedPath = userOverride ? userPath : builtinPath
  if (!existsSync(selectedPath)) throw new Error(`Unknown palette "${name}". ${availableMessage}`)

  let parsed
  try {
    parsed = JSON.parse(readFileSync(selectedPath, 'utf8'))
  } catch (error) {
    throw new Error(`Could not parse palette "${name}": ${error.message}. ${availableMessage}`)
  }

  try {
    validatePaletteDefinition(parsed)
    if (parsed.name !== name) throw new Error(`palette.name must equal "${name}"`)
  } catch (error) {
    throw new Error(`Invalid palette "${name}": ${error.message}. ${availableMessage}`)
  }

  const materialized = materializePalette(parsed, options.theme)
  if (userOverride) {
    materialized.diagnostics.unshift({
      level: 'info',
      code: 'PALETTE_USER_OVERRIDE',
      message: `User palette "${name}" overrides the bundled palette.`
    })
  }
  return materialized
}

function entryIndexForType(palette, semanticType) {
  const explicit = palette.roles?.[semanticType]
  if (Number.isInteger(explicit)) return explicit
  const position = SEMANTIC_ROLE_ORDER.indexOf(semanticType)
  return (position < 0 ? 0 : position) % palette.entries.length
}

export function applyPalette(theme, palette, options = {}) {
  if (!palette) return { theme, usage: [], diagnostics: [] }

  const derived = structuredClone(theme)
  derived.palette = palette
  derived.node ||= {}
  derived.connector ||= {}
  const usageByIndex = new Map()

  for (const semanticType of new Set(options.semanticTypes || [])) {
    const index = entryIndexForType(palette, semanticType)
    const entry = palette.entries[index]
    derived.node[semanticType] = {
      ...(derived.node[semanticType] || derived.node.default || {}),
      fillColor: entry.fill,
      strokeColor: entry.stroke,
      fontColor: entry.text
    }
    usageByIndex.set(index, { index, ...entry })
  }

  for (const index of options.tokenIndexes || []) {
    if (index >= 0 && index < palette.entries.length) usageByIndex.set(index, { index, ...palette.entries[index] })
  }

  if (palette.connector?.default) {
    derived.connector.primary = {
      ...(derived.connector.primary || {}),
      strokeColor: palette.connector.default
    }
  }

  return {
    theme: derived,
    usage: [...usageByIndex.values()].sort((first, second) => first.index - second.index),
    diagnostics: []
  }
}

export function resolvePaletteToken(value, palette, fallback) {
  if (typeof value !== 'string') return null
  const match = TOKEN_PATTERN.exec(value)
  if (!match) return null
  const entry = palette?.entries?.[Number(match[1]) - 1]
  if (!entry) return fallback
  return entry[match[2] || 'base']
}

export function paletteTokenIndex(value) {
  if (typeof value !== 'string') return null
  const match = TOKEN_PATTERN.exec(value)
  return match ? Number(match[1]) - 1 : null
}

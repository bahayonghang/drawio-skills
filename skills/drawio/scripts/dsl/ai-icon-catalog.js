import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'

import {
  AI_ICON_CATALOG_COUNTS,
  AI_ICON_CATALOG_SCHEMA_VERSION,
  AI_ICON_SOURCE
} from '../shared/ai-icon-contract.js'
import { scoreCatalogCandidate } from './catalog-ranking.js'

const CATALOG_URL = new URL('../../assets/catalog/ai-icons.json.gz', import.meta.url)
const SAFE_SLUG = /^[a-z][a-z0-9._-]*$/

function asciiCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0
}

function fail(message, cause) {
  return new Error(`AI icon catalog ${message}`, cause ? { cause } : undefined)
}

function validateSource(source) {
  if (!source || typeof source !== 'object') throw fail('source provenance is missing')
  for (const key of ['package', 'version', 'integrity', 'license']) {
    if (source[key] !== AI_ICON_SOURCE[key]) {
      throw fail(`${key} must be ${JSON.stringify(AI_ICON_SOURCE[key])}`)
    }
  }
  if (JSON.stringify(source.variantOrder) !== JSON.stringify(AI_ICON_SOURCE.variantOrder)) {
    throw fail('variantOrder does not match the fixed source contract')
  }
}

function validateCatalog(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw fail('root must be an object')
  if (raw.schemaVersion !== AI_ICON_CATALOG_SCHEMA_VERSION) {
    throw fail(`schemaVersion must be ${AI_ICON_CATALOG_SCHEMA_VERSION}`)
  }
  validateSource(raw.source)
  if (!Array.isArray(raw.icons) || raw.icons.length !== AI_ICON_CATALOG_COUNTS.brands) {
    throw fail(`must contain ${AI_ICON_CATALOG_COUNTS.brands} icons`)
  }

  const slugs = new Set()
  const icons = raw.icons.map((record, index) => {
    if (!record || typeof record !== 'object' || !SAFE_SLUG.test(record.slug || '')) {
      throw fail(`icon ${index} has an invalid slug`)
    }
    if (slugs.has(record.slug)) throw fail(`contains duplicate slug ${JSON.stringify(record.slug)}`)
    if (index > 0 && asciiCompare(raw.icons[index - 1].slug, record.slug) >= 0) {
      throw fail('icons must be strictly ASCII-sorted by slug')
    }
    if (typeof record.variant !== 'string' || typeof record.svg !== 'string' || !/^<svg\b/i.test(record.svg)) {
      throw fail(`icon ${record.slug} has invalid variant or SVG data`)
    }
    slugs.add(record.slug)
    return Object.freeze({ slug: record.slug, variant: record.variant, svg: record.svg })
  })

  return Object.freeze({
    schemaVersion: raw.schemaVersion,
    source: Object.freeze({ ...raw.source, variantOrder: Object.freeze([...raw.source.variantOrder]) }),
    icons: Object.freeze(icons)
  })
}

export function createAiIconCatalogLoader({ readCatalog = () => readFileSync(CATALOG_URL) } = {}) {
  let cache
  let cachedError

  function load() {
    if (cache) return cache
    if (cachedError) throw cachedError
    try {
      const parsed = JSON.parse(gunzipSync(readCatalog()).toString('utf8'))
      const catalog = validateCatalog(parsed)
      const bySlug = new Map(catalog.icons.map((record) => [record.slug, record]))
      cache = Object.freeze({ ...catalog, get: (slug) => bySlug.get(slug) || null })
      return cache
    } catch (error) {
      cachedError = error.message?.startsWith('AI icon catalog') ? error : fail(`could not be loaded: ${error.message}`, error)
      throw cachedError
    }
  }

  return Object.freeze({
    load,
    get(slug) {
      if (typeof slug !== 'string') return null
      const normalized = slug.trim().toLowerCase()
      return SAFE_SLUG.test(normalized) ? load().get(normalized) : null
    },
    search(query, { limit = 8 } = {}) {
      if (typeof query !== 'string' || query.trim() === '') return []
      const boundedLimit = Number.isInteger(limit) && limit > 0 ? limit : 8
      return load().icons
        .map((record) => {
          const candidate = { name: record.slug, title: record.slug, tags: ['ai', 'brand', record.slug] }
          return {
            name: `lobe.${record.slug}`,
            title: record.slug,
            tags: candidate.tags,
            spec: `icon: lobe.${record.slug}`,
            score: scoreCatalogCandidate(query, candidate)
          }
        })
        .filter((candidate) => candidate.score > 0)
        .sort((left, right) => right.score - left.score || asciiCompare(left.name, right.name))
        .slice(0, boundedLimit)
    }
  })
}

const defaultLoader = createAiIconCatalogLoader()

export function loadAiIconCatalog() {
  return defaultLoader.load()
}

export function getAiIcon(slug) {
  return defaultLoader.get(slug)
}

export function searchAiIcons(query, options) {
  return defaultLoader.search(query, options)
}

import { loadShapeCatalog } from './shape-catalog.js'
import { ICON_ALIASES, resolveIconShape, specSyntaxFor } from './icon-mappings.js'
import { scoreCatalogCandidate } from './catalog-ranking.js'
import { searchAiIcons } from './ai-icon-catalog.js'

function catalogCandidates(catalog) {
  const entries = catalog.entries.map((entry) => ({
    name: entry.n,
    title: entry.t || '',
    tags: entry.g || [],
    spec: specSyntaxFor(entry.n)
  }))
  for (const family of catalog.families.values()) {
    for (const value of family.values) {
      entries.push({
        name: `${family.base};${family.param}=${value.v}`,
        title: value.t || '',
        tags: value.g || [],
        spec: family.k === 'k8sParamIcon' ? specSyntaxFor(family.base, family.param, value.v) : null
      })
    }
  }
  const synonyms = new Map()
  for (const alias of Object.keys(ICON_ALIASES)) {
    const resolved = resolveIconShape(alias)
    if (!resolved) continue
    const name = resolved.replace(/:(prIcon|resIcon|grIcon)=/, ';$1=')
    if (!synonyms.has(name)) synonyms.set(name, [])
    synonyms.get(name).push(alias.slice(alias.indexOf('.') + 1))
  }
  return [...new Map(entries.map((entry) => [entry.name, entry])).values()].map((entry) =>
    synonyms.has(entry.name) ? { ...entry, tags: [...entry.tags, ...synonyms.get(entry.name)] } : entry
  )
}

export function searchShapeCatalog(query, { prefix = null, limit = 8 } = {}) {
  const plainPrefix = prefix ? prefix.replace(/^mxgraph\./, '').replace(/\.$/, '').toLowerCase() : null
  if (plainPrefix === 'lobe' || plainPrefix === 'ai') {
    return searchAiIcons(query, { limit })
  }
  const catalog = loadShapeCatalog()
  if (!catalog) return []
  const normalizedPrefix = prefix ? `mxgraph.${prefix.replace(/^mxgraph\./, '')}.` : null
  return catalogCandidates(catalog)
    .filter((candidate) => !normalizedPrefix || candidate.name.startsWith(normalizedPrefix))
    .map((candidate) => ({ ...candidate, score: scoreCatalogCandidate(query, candidate) }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || (b.spec ? 1 : 0) - (a.spec ? 1 : 0) || a.name.localeCompare(b.name))
    .slice(0, Math.max(1, limit))
}

export function searchShapeCatalogBatch(query, options) {
  return String(query)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => ({ query: part, results: searchShapeCatalog(part, options) }))
}

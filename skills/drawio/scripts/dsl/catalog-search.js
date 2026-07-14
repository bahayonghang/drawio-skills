import { loadShapeCatalog } from './shape-catalog.js'
import { ICON_ALIASES, resolveIconShape, specSyntaxFor } from './icon-mappings.js'

function normalize(value) {
  return String(value || '')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function score(query, candidate) {
  const target = normalize(query)
  const name = normalize(candidate.name)
  const title = normalize(candidate.title)
  const tags = normalize(candidate.tags.join(' '))
  if (!target) return 0
  if (name === target) return 100
  const lastSegment = normalize(String(candidate.name).split(/[.;=]/).pop())
  if (lastSegment && lastSegment === target) return 90
  if (name.includes(target)) return 60
  if (title.includes(target)) return 35
  if (tags.includes(target)) return 20
  const tokens = target.split(' ')
  if (tokens.every((token) => name.includes(token) || title.includes(token) || tags.includes(token))) return 25
  const candidateTokens = `${name} ${title} ${tags}`.split(' ')
  const matchingTokens = tokens.filter((token) => candidateTokens.includes(token))
  if (matchingTokens.length >= 2 || matchingTokens.some((token) => token.length >= 4 || /\d/.test(token))) {
    return 15 + matchingTokens.length
  }
  return tokens.some((token) =>
    token.length >= 4 &&
    candidateTokens.some(
      (value) => value.length >= 3 && Math.abs(token.length - value.length) <= 1 && levenshtein(token, value) <= 1
    )
  )
    ? 10
    : 0
}

function levenshtein(left, right) {
  if (left === right) return 0
  if (!left || !right) return Math.max(left.length, right.length)
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let row = 1; row <= left.length; row++) {
    const current = [row]
    for (let column = 1; column <= right.length; column++) {
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + (left[row - 1] === right[column - 1] ? 0 : 1)
      )
    }
    previous = current
  }
  return previous[right.length]
}

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
  const catalog = loadShapeCatalog()
  if (!catalog) return []
  const normalizedPrefix = prefix ? `mxgraph.${prefix.replace(/^mxgraph\./, '')}.` : null
  return catalogCandidates(catalog)
    .filter((candidate) => !normalizedPrefix || candidate.name.startsWith(normalizedPrefix))
    .map((candidate) => ({ ...candidate, score: score(query, candidate) }))
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

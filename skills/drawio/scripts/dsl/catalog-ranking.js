export function normalizeCatalogSearchValue(value) {
  return String(value || '')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function levenshteinDistance(left, right) {
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

export function scoreCatalogCandidate(query, candidate) {
  const target = normalizeCatalogSearchValue(query)
  const name = normalizeCatalogSearchValue(candidate.name)
  const title = normalizeCatalogSearchValue(candidate.title)
  const tags = normalizeCatalogSearchValue(candidate.tags.join(' '))
  if (!target) return 0
  if (name === target) return 100
  const lastSegment = normalizeCatalogSearchValue(String(candidate.name).split(/[.;=]/).pop())
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
      (value) => value.length >= 3 && Math.abs(token.length - value.length) <= 1 && levenshteinDistance(token, value) <= 1
    )
  )
    ? 10
    : 0
}

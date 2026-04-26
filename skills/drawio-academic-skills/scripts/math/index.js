const DISCOURAGED_BLOCK_DELIMITER = /\\\[([\s\S]+?)\\\]/g
const DISCOURAGED_INLINE_DELIMITER = /(^|[^\\$])\$(?!\$)([^$\n]+?)\$(?!\$)/g
const OFFICIAL_DELIMITER_PATTERN = /\$\$|\\\(|`[^`]+`/
const MATH_COMMAND_PATTERN = /\\(?:frac|sqrt|sum|prod|int|lim|mathbb|mathcal|text|begin|end|alpha|beta|gamma|delta|theta|lambda|sigma|phi|omega|pi|mu|epsilon|times|div|pm|leq|geq|neq|approx|infty|partial|nabla|rightarrow|vec|hat|mathbf)\b/i
const RELATION_OPERATOR_PATTERN = /[=≈≤≥<>∈→⇒]/
const MATH_OPERATOR_PATTERN = /[+\-*/^]|\\(?:cdot|times|log|ln|exp|sin|cos|tan|sum|prod|int|lim)\b/i
const FUNCTION_LIKE_PATTERN = /\b[a-zA-Z]+\s*\([^)]*\)/

function hasOfficialMathDelimiters(text) {
  return typeof text === 'string' && OFFICIAL_DELIMITER_PATTERN.test(text)
}

export function wrapAsciiMathInline(expression) {
  if (typeof expression !== 'string' || expression.trim().length === 0) {
    throw new TypeError('AsciiMath expression must be a non-empty string')
  }
  if (expression.includes('`')) {
    throw new Error('AsciiMath expression must not contain backticks (`)')
  }
  return `\`${expression}\``
}

export function wrapLatexInline(expression) {
  if (typeof expression !== 'string' || expression.trim().length === 0) {
    throw new TypeError('LaTeX expression must be a non-empty string')
  }
  if (expression.includes('\\(') || expression.includes('\\)')) {
    throw new Error('LaTeX inline expression must not include \\( or \\) delimiters')
  }
  return `\\(${expression}\\)`
}

export function wrapLatexBlock(expression) {
  if (typeof expression !== 'string' || expression.trim().length === 0) {
    throw new TypeError('LaTeX expression must be a non-empty string')
  }
  if (expression.includes('$$')) {
    throw new Error('LaTeX block expression must not include $$ delimiters')
  }
  return `$$${expression}$$`
}

export function detectDiscouragedMathDelimiters(text) {
  if (typeof text !== 'string' || text.length === 0) {
    return []
  }

  const issues = []

  if (/\\\[/.test(text) || /\\\]/.test(text)) {
    issues.push('\\[...\\]')
  }

  if (DISCOURAGED_INLINE_DELIMITER.test(text)) {
    issues.push('$...$')
  }

  DISCOURAGED_INLINE_DELIMITER.lastIndex = 0

  return issues
}

export function normalizeDiscouragedMathDelimiters(text) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return text
  }

  let normalized = text.replace(DISCOURAGED_BLOCK_DELIMITER, (match, expression) => {
    const trimmed = expression.trim()
    return trimmed ? wrapLatexBlock(trimmed) : match
  })

  normalized = normalized.replace(DISCOURAGED_INLINE_DELIMITER, (match, prefix, expression) => {
    const trimmed = expression.trim()
    return trimmed ? `${prefix}${wrapLatexInline(trimmed)}` : match
  })

  DISCOURAGED_INLINE_DELIMITER.lastIndex = 0

  return normalized
}

export function validateMathText(text) {
  if (typeof text !== 'string') {
    throw new TypeError('Math text must be a string')
  }

  const htmlTagLike = /<\s*\/?\s*[a-zA-Z][^>]*>/g
  if (htmlTagLike.test(text)) {
    throw new Error('Math text must not contain HTML tags; remove formatting and keep only LaTeX/AsciiMath')
  }

  const discouraged = detectDiscouragedMathDelimiters(text)
  if (discouraged.length > 0) {
    throw new Error(
      `Unsupported math delimiters detected: ${discouraged.join(', ')}. ` +
      'Use $$...$$ for standalone LaTeX, \\(...\\) for inline LaTeX, or `...` for AsciiMath.'
    )
  }

  const backtickCount = (text.match(/`/g) ?? []).length
  if (backtickCount % 2 !== 0) {
    throw new Error('Unbalanced AsciiMath delimiters: backticks (`) must be paired')
  }

  const latexBlockCount = (text.match(/\$\$/g) ?? []).length
  if (latexBlockCount % 2 !== 0) {
    throw new Error('Unbalanced LaTeX block delimiters: $$ must be paired')
  }

  const latexInlineOpenCount = (text.match(/\\\(/g) ?? []).length
  const latexInlineCloseCount = (text.match(/\\\)/g) ?? []).length
  if (latexInlineOpenCount !== latexInlineCloseCount) {
    throw new Error('Unbalanced LaTeX inline delimiters: \\( and \\) must be paired')
  }

  return true
}

export function escapeXmlAttr(value) {
  if (typeof value !== 'string') {
    throw new TypeError('XML attribute value must be a string')
  }
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function toMxCellValue(text, { validate = true } = {}) {
  if (validate) validateMathText(text)
  return escapeXmlAttr(text)
}

/**
 * Detects if text contains LaTeX math commands without proper delimiters.
 * Returns array of detected patterns (empty if none found or already wrapped).
 */
export function detectUnwrappedMath(text) {
  if (typeof text !== 'string') return []

  // Already has supported official delimiters - skip detection
  if (hasOfficialMathDelimiters(text)) {
    return []
  }

  const mathPatterns = [
    /\\(?:frac|sqrt|sum|prod|int|lim|mathbb|mathcal|text|begin|end)\s*[\{\[]/,
    /\\(?:alpha|beta|gamma|delta|theta|lambda|sigma|phi|omega|pi|mu|epsilon)/i,
    /\\(?:times|div|pm|leq|geq|neq|approx|infty|partial|nabla|rightarrow)/,
    /\^[\{\d]|_[\{\d]/,
    /\\vec\{|\\hat\{|\\mathbf\{/
  ]

  const detected = []
  for (const pattern of mathPatterns) {
    if (pattern.test(text)) {
      detected.push(pattern.source)
    }
  }

  return detected
}

export function looksLikeMathExpression(text) {
  if (typeof text !== 'string') return false

  const trimmed = text.trim()
  if (!trimmed) return false

  if (hasOfficialMathDelimiters(trimmed)) return true
  if (detectUnwrappedMath(trimmed).length > 0) return true

  if (!RELATION_OPERATOR_PATTERN.test(trimmed)) {
    return false
  }

  const parts = trimmed.split(/[=≈≤≥<>∈→⇒]/).map(part => part.trim()).filter(Boolean)
  if (parts.length < 2) {
    return false
  }

  const [left, ...rest] = parts
  const right = rest.join(' ').trim()

  const leftLooksMathy = /^[A-Za-z](?:[A-Za-z0-9_{}[\]()^]*|(?:\s+[A-Za-z][A-Za-z0-9_{}[\]()^]*){0,1})$/.test(left)
  const rightLooksMathy =
    MATH_OPERATOR_PATTERN.test(right) ||
    FUNCTION_LIKE_PATTERN.test(right) ||
    /[(){}\[\]]/.test(right) ||
    detectUnwrappedMath(right).length > 0

  return leftLooksMathy && rightLooksMathy
}

export function isLikelyStandaloneMathLabel(text) {
  if (typeof text !== 'string') return false

  const trimmed = text.trim()
  if (!trimmed) return false
  if (detectDiscouragedMathDelimiters(trimmed).length > 0) return false
  if (hasOfficialMathDelimiters(trimmed)) return true
  if (trimmed.includes(':')) return false

  return looksLikeMathExpression(trimmed)
}

function wrapTrailingMathSuffix(text) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return text
  }

  const colonMatch = /^([\s\S]*?:\s*)([^:]+)$/.exec(text)
  if (!colonMatch) {
    return text
  }

  const [, prefix, candidateRaw] = colonMatch
  const candidate = candidateRaw.trim()
  if (!candidate || hasOfficialMathDelimiters(candidate)) {
    return text
  }

  if (!looksLikeMathExpression(candidate)) {
    return text
  }

  return `${prefix}${wrapLatexInline(candidate)}`
}

/**
 * Wraps detected math content in appropriate LaTeX delimiters.
 * - Block math (standalone equations): $$...$$
 * - Inline math (within text): \(...\)
 *
 * @param {string} text - The text potentially containing unwrapped math
 * @param {object} options
 * @param {'block'|'inline'|'auto'} options.mode - Wrapping mode (default: 'auto')
 * @returns {string} Text with properly wrapped math
 */
export function ensureLatexDelimiters(text, { mode = 'auto' } = {}) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return text
  }

  const normalized = normalizeDiscouragedMathDelimiters(text)
  if (normalized !== text) {
    return normalized
  }

  // Already wrapped with supported official delimiters - return as-is
  if (hasOfficialMathDelimiters(text)) {
    return text
  }

  const wrappedSuffix = wrapTrailingMathSuffix(text)
  if (wrappedSuffix !== text) {
    return wrappedSuffix
  }

  const detected = detectUnwrappedMath(text)
  if (detected.length === 0) {
    return text
  }

  // Auto mode: use block for pure math, inline for mixed content
  let useBlock = mode === 'block'
  if (mode === 'auto') {
    const pureMatch = /^\\/.test(text.trim()) || /^[^a-zA-Z]*\\/.test(text)
    useBlock = pureMatch
  }

  if (useBlock) {
    return wrapLatexBlock(text)
  }

  return wrapLatexInline(text)
}

/**
 * Validates and optionally auto-wraps math in label text for mxCell value.
 * This is the recommended function for preparing diagram labels with math.
 *
 * @param {string} text - Label text
 * @param {object} options
 * @param {boolean} options.autoWrap - Auto-wrap unwrapped math (default: true)
 * @param {'block'|'inline'|'auto'} options.mode - Wrapping mode for autoWrap
 * @param {boolean} options.strict - Throw if unwrapped math found and autoWrap=false
 * @returns {string} XML-safe value for mxCell
 */
export function prepareMathLabel(text, { autoWrap = true, mode = 'auto', strict = false } = {}) {
  if (typeof text !== 'string') {
    throw new TypeError('Label text must be a string')
  }

  text = normalizeDiscouragedMathDelimiters(text)

  const wrappedCandidate = ensureLatexDelimiters(text, { mode })
  const detected = detectUnwrappedMath(text)
  const wouldWrap = wrappedCandidate !== text

  if (detected.length > 0 || wouldWrap) {
    if (strict && !autoWrap) {
      throw new Error(
        `Unwrapped math detected: ${detected.join(', ') || 'expression heuristic'}. ` +
        'Use $$ for block math, \\(...\\) for inline math, or `...` for AsciiMath.'
      )
    }
    if (autoWrap) {
      text = wrappedCandidate
    }
  }

  validateMathText(text)
  return escapeXmlAttr(text)
}

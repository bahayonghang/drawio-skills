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

export function validateMathText(text) {
  if (typeof text !== 'string') {
    throw new TypeError('Math text must be a string')
  }

  const htmlTagLike = /<\s*\/?\s*[a-zA-Z][^>]*>/g
  if (htmlTagLike.test(text)) {
    throw new Error('Math text must not contain HTML tags; remove formatting and keep only LaTeX/AsciiMath')
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

  // Already has delimiters - skip detection
  if (/\$\$/.test(text) || /\\\(/.test(text) || /`[^`]+`/.test(text)) {
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

  // Already wrapped - return as-is
  if (/\$\$/.test(text) || /\\\(/.test(text) || /`[^`]+`/.test(text)) {
    return text
  }

  const detected = detectUnwrappedMath(text)
  if (detected.length === 0) {
    return text
  }

  // Auto mode: use block for pure math, inline for mixed content
  let useBlock = mode === 'block'
  if (mode === 'auto') {
    // Pure math: starts with \ or contains mostly math symbols
    const pureMatch = /^\\/.test(text.trim()) || /^[^a-zA-Z]*\\/.test(text)
    useBlock = pureMatch
  }

  if (useBlock) {
    return `$$${text}$$`
  } else {
    return `\\(${text}\\)`
  }
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

  const detected = detectUnwrappedMath(text)

  if (detected.length > 0) {
    if (strict && !autoWrap) {
      throw new Error(
        `Unwrapped math detected: ${detected.join(', ')}. ` +
        'Use $$ for block math or \\( \\) for inline math.'
      )
    }
    if (autoWrap) {
      text = ensureLatexDelimiters(text, { mode })
    }
  }

  validateMathText(text)
  return escapeXmlAttr(text)
}


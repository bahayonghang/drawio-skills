import assert from 'node:assert/strict'
import test from 'node:test'
import {
  detectDiscouragedMathDelimiters,
  ensureLatexDelimiters,
  isLikelyStandaloneMathLabel,
  looksLikeMathExpression,
  normalizeDiscouragedMathDelimiters,
  prepareMathLabel,
  validateMathText
} from './index.js'

test('normalizeDiscouragedMathDelimiters converts \\[...\\] to $$...$$', () => {
  assert.equal(
    normalizeDiscouragedMathDelimiters('\\[\\mathcal{L} = \\sum_i x_i\\]'),
    '$$\\mathcal{L} = \\sum_i x_i$$'
  )
})

test('normalizeDiscouragedMathDelimiters converts $...$ to inline LaTeX', () => {
  assert.equal(
    normalizeDiscouragedMathDelimiters('Score: $x_i^2$'),
    'Score: \\(x_i^2\\)'
  )
})

test('validateMathText rejects discouraged math delimiters', () => {
  assert.throws(
    () => validateMathText('\\[E = mc^2\\]'),
    /Unsupported math delimiters detected/
  )

  assert.throws(
    () => validateMathText('$x_i^2$'),
    /Unsupported math delimiters detected/
  )
})

test('ensureLatexDelimiters auto-wraps raw standalone LaTeX as block math', () => {
  assert.equal(
    ensureLatexDelimiters('\\sum_{i=1}^{n} x_i'),
    '$$\\sum_{i=1}^{n} x_i$$'
  )
})

test('ensureLatexDelimiters wraps colon-delimited algebraic suffix inline', () => {
  assert.equal(
    ensureLatexDelimiters('Linear: y = mx + b'),
    'Linear: \\(y = mx + b\\)'
  )
})

test('ensureLatexDelimiters wraps colon-delimited bare LaTeX suffix inline', () => {
  assert.equal(
    ensureLatexDelimiters('Output: \\alpha + \\beta'),
    'Output: \\(\\alpha + \\beta\\)'
  )
})

test('looksLikeMathExpression detects plain algebraic equations but ignores config-style assignments', () => {
  assert.equal(looksLikeMathExpression('y = mx + b'), true)
  assert.equal(looksLikeMathExpression('x \\in \\mathbb{R}^d'), true)
  assert.equal(looksLikeMathExpression('API version = v1'), false)
})

test('isLikelyStandaloneMathLabel is true only for equation-like full labels', () => {
  assert.equal(isLikelyStandaloneMathLabel('E = mc^2'), true)
  assert.equal(isLikelyStandaloneMathLabel('Linear: y = mx + b'), false)
})

test('prepareMathLabel normalizes discouraged delimiters and escapes XML safely', () => {
  assert.equal(
    prepareMathLabel('\\[a & b\\]'),
    '$$a &amp; b$$'
  )
})

test('prepareMathLabel auto-wraps mixed labels without wrapping the prose prefix', () => {
  assert.equal(
    prepareMathLabel('Linear: y = mx + b'),
    'Linear: \\(y = mx + b\\)'
  )

  assert.equal(
    prepareMathLabel('Output: \\alpha + \\beta'),
    'Output: \\(\\alpha + \\beta\\)'
  )
})

test('prepareMathLabel leaves non-math assignment labels unchanged', () => {
  assert.equal(
    prepareMathLabel('Config: API version = v1'),
    'Config: API version = v1'
  )
})

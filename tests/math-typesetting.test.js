import test from 'node:test'
import assert from 'node:assert/strict'

import {
  escapeXmlAttr,
  toMxCellValue,
  validateMathText,
  wrapAsciiMathInline,
  wrapLatexBlock,
  wrapLatexInline,
  detectUnwrappedMath,
  ensureLatexDelimiters,
  prepareMathLabel
} from '../skills/drawio/src/math/index.js'

test('wrapLatexInline wraps \\( ... \\) and forbids nested delimiters', () => {
  assert.equal(wrapLatexInline('y=Wx+b'), '\\(y=Wx+b\\)')
  assert.throws(() => wrapLatexInline('\\(y\\)'), /must not include \\\( or \\\)/)
})

test('wrapLatexBlock wraps $$ ... $$ and forbids nested $$', () => {
  assert.equal(wrapLatexBlock('\\alpha+\\beta'), '$$\\alpha+\\beta$$')
  assert.throws(() => wrapLatexBlock('$$x$$'), /must not include \$\$/)
})

test('wrapAsciiMathInline wraps ` ... ` and forbids backticks inside', () => {
  assert.equal(wrapAsciiMathInline('a^2+b^2=c^2'), '`a^2+b^2=c^2`')
  assert.throws(() => wrapAsciiMathInline('a`b'), /must not contain backticks/)
})

test('validateMathText rejects HTML tags and unbalanced delimiters', () => {
  assert.equal(validateMathText('LaTeX \\(x^2\\) and AsciiMath `a^2`'), true)
  assert.throws(() => validateMathText('`a^2'), /Unbalanced AsciiMath delimiters/)
  assert.throws(() => validateMathText('$$x'), /Unbalanced LaTeX block delimiters/)
  assert.throws(() => validateMathText('\\(x'), /Unbalanced LaTeX inline delimiters/)
  assert.throws(() => validateMathText('x <span>y</span>'), /must not contain HTML tags/)
})

test('escapeXmlAttr escapes XML attribute special characters', () => {
  assert.equal(escapeXmlAttr('a&b'), 'a&amp;b')
  assert.equal(escapeXmlAttr('<>'), '&lt;&gt;')
  assert.equal(escapeXmlAttr('"'), '&quot;')
})

test('toMxCellValue validates then escapes', () => {
  assert.equal(toMxCellValue('Model: \\(y=Wx+b\\)'), 'Model: \\(y=Wx+b\\)')
  assert.equal(toMxCellValue('x < y'), 'x &lt; y')
})

// New tests for unwrapped math detection and auto-wrapping

test('detectUnwrappedMath returns empty array for already-wrapped math', () => {
  assert.deepEqual(detectUnwrappedMath('$$\\frac{a}{b}$$'), [])
  assert.deepEqual(detectUnwrappedMath('\\(\\alpha + \\beta\\)'), [])
  assert.deepEqual(detectUnwrappedMath('`x^2`'), [])
  assert.deepEqual(detectUnwrappedMath('plain text'), [])
})

test('detectUnwrappedMath detects bare LaTeX commands', () => {
  const result1 = detectUnwrappedMath('\\frac{a}{b}')
  assert.ok(result1.length > 0, 'should detect \\frac')

  const result2 = detectUnwrappedMath('\\alpha + \\beta')
  assert.ok(result2.length > 0, 'should detect Greek letters')

  const result3 = detectUnwrappedMath('x^{2} + y_{1}')
  assert.ok(result3.length > 0, 'should detect superscript/subscript')

  const result4 = detectUnwrappedMath('\\sqrt{x}')
  assert.ok(result4.length > 0, 'should detect \\sqrt')
})

test('ensureLatexDelimiters wraps unwrapped math in $$ by default', () => {
  assert.equal(ensureLatexDelimiters('\\frac{a}{b}'), '$$\\frac{a}{b}$$')
  assert.equal(ensureLatexDelimiters('\\alpha'), '$$\\alpha$$')
})

test('ensureLatexDelimiters respects inline mode', () => {
  assert.equal(
    ensureLatexDelimiters('\\frac{a}{b}', { mode: 'inline' }),
    '\\(\\frac{a}{b}\\)'
  )
})

test('ensureLatexDelimiters returns already-wrapped text unchanged', () => {
  assert.equal(ensureLatexDelimiters('$$x^2$$'), '$$x^2$$')
  assert.equal(ensureLatexDelimiters('\\(x^2\\)'), '\\(x^2\\)')
  assert.equal(ensureLatexDelimiters('`x^2`'), '`x^2`')
})

test('ensureLatexDelimiters returns plain text unchanged', () => {
  assert.equal(ensureLatexDelimiters('Hello World'), 'Hello World')
  assert.equal(ensureLatexDelimiters('Model Output'), 'Model Output')
})

test('prepareMathLabel auto-wraps and escapes by default', () => {
  const result = prepareMathLabel('\\frac{a}{b}')
  assert.equal(result, '$$\\frac{a}{b}$$')
})

test('prepareMathLabel throws in strict mode without autoWrap', () => {
  assert.throws(
    () => prepareMathLabel('\\frac{a}{b}', { autoWrap: false, strict: true }),
    /Unwrapped math detected/
  )
})

test('prepareMathLabel escapes XML special characters', () => {
  // Note: validateMathText rejects HTML-like tags, so we test with & and "
  const result = prepareMathLabel('x & y "quoted"')
  assert.match(result, /&amp;/)
  assert.match(result, /&quot;/)
})

test('prepareMathLabel handles mixed text and math', () => {
  const result = prepareMathLabel('Model: \\(y=Wx+b\\)')
  assert.equal(result, 'Model: \\(y=Wx+b\\)')
})


import test from 'node:test'
import assert from 'node:assert/strict'

import { ERROR_CODES } from './identity.js'
import { MAX_SOURCE_BYTES, parseStructuredDocuments } from './config-common.js'

test('structured config decoder rejects unsafe YAML tags', () => {
  assert.throws(
    () => parseStructuredDocuments('value: !!js/function "function () {}"', { adapter: 'test-config' }),
    (error) => error.code === ERROR_CODES.ADAPTER_PARSE
  )
})

test('structured config decoder rejects prototype keys and recursive aliases', () => {
  assert.throws(
    () => parseStructuredDocuments('{"__proto__":{"polluted":true}}', { adapter: 'test-config' }),
    (error) => error.code === ERROR_CODES.ADAPTER_PARSE && /forbidden key/.test(error.message)
  )
  assert.equal(Object.prototype.polluted, undefined)

  assert.throws(
    () => parseStructuredDocuments('value: &loop [*loop]', { adapter: 'test-config' }),
    (error) => error.code === ERROR_CODES.ADAPTER_PARSE && /recursive alias/.test(error.message)
  )
})

test('structured config decoder enforces the source-size limit', () => {
  assert.throws(
    () => parseStructuredDocuments(`value: ${'x'.repeat(MAX_SOURCE_BYTES)}`, { adapter: 'test-config' }),
    (error) => error.code === ERROR_CODES.ADAPTER_PARSE && /byte limit/.test(error.message)
  )
})

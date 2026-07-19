import test from 'node:test'
import assert from 'node:assert/strict'

import { ERROR_CODES } from './identity.js'
import { runOptionalPythonParser } from './optional-python.js'

const request = { adapter: 'terraform', source: 'resource "x" "y" {}' }

test('runOptionalPythonParser decodes a bounded successful response', () => {
  const result = runOptionalPythonParser(request, {
    spawn: () => ({ status: 0, stdout: '{"ok":true,"result":{"resources":[]}}', stderr: '' })
  })
  assert.deepEqual(result, { resources: [] })
})

test('runOptionalPythonParser maps missing Python and parser packages', () => {
  assert.throws(
    () => runOptionalPythonParser(request, { spawn: () => ({ error: { code: 'ENOENT' }, stdout: '', stderr: '' }) }),
    (error) => error.code === ERROR_CODES.OPTIONAL_DEPENDENCY_MISSING
  )
  assert.throws(
    () =>
      runOptionalPythonParser(request, {
        spawn: () => ({
          status: 3,
          stdout: '{"ok":false,"code":"OPTIONAL_DEPENDENCY_MISSING","message":"python-hcl2 is unavailable"}',
          stderr: ''
        })
      }),
    (error) => error.code === ERROR_CODES.OPTIONAL_DEPENDENCY_MISSING && !('source' in error.context)
  )
})

test('runOptionalPythonParser maps timeout, malformed output, and output overflow', () => {
  assert.throws(
    () => runOptionalPythonParser(request, { spawn: () => ({ error: { code: 'ENOBUFS' }, stdout: '', stderr: '' }) }),
    (error) => error.code === ERROR_CODES.ADAPTER_PARSE && /output limit/.test(error.message)
  )
  assert.throws(
    () => runOptionalPythonParser(request, { spawn: () => ({ error: { code: 'ETIMEDOUT' }, stdout: '', stderr: '' }) }),
    (error) => error.code === ERROR_CODES.ADAPTER_PARSE && /timed out/.test(error.message)
  )
  assert.throws(
    () => runOptionalPythonParser(request, { spawn: () => ({ status: 0, stdout: 'not-json', stderr: 'raw source' }) }),
    (error) => error.code === ERROR_CODES.ADAPTER_PARSE && !error.message.includes('raw source')
  )
  assert.throws(
    () =>
      runOptionalPythonParser(request, {
        maxOutputBytes: 10,
        spawn: () => ({ status: 0, stdout: '{"ok":true,"result":{}}', stderr: '' })
      }),
    (error) => error.code === ERROR_CODES.ADAPTER_PARSE && /output limit/.test(error.message)
  )
})

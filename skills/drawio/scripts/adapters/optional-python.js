import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

import { AdapterContractError, ERROR_CODES } from './identity.js'
import { MAX_SOURCE_BYTES } from './config-common.js'

const WORKER_PATH = fileURLToPath(new URL('./python/config-parser-worker.py', import.meta.url))
const DEFAULT_TIMEOUT_MS = 10000
const DEFAULT_MAX_OUTPUT_BYTES = 1024 * 1024

function protocolError(message, cause) {
  throw new AdapterContractError(ERROR_CODES.ADAPTER_PARSE, message, {}, { cause })
}

function optionalDependencyError(message, cause) {
  throw new AdapterContractError(ERROR_CODES.OPTIONAL_DEPENDENCY_MISSING, message, {}, { cause })
}

function workerEnvironment() {
  const env = { PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }
  for (const key of ['PATH', 'SYSTEMROOT', 'WINDIR', 'TEMP', 'TMP']) {
    if (process.env[key]) env[key] = process.env[key]
  }
  return env
}

export function runOptionalPythonParser(
  request,
  {
    spawn = spawnSync,
    pythonCommand = process.platform === 'win32' ? 'python' : 'python3',
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxOutputBytes = DEFAULT_MAX_OUTPUT_BYTES
  } = {}
) {
  if (!request || typeof request !== 'object' || !['terraform', 'sql'].includes(request.adapter)) {
    protocolError('optional parser request has an invalid adapter')
  }
  const input = JSON.stringify(request)
  if (Buffer.byteLength(input, 'utf8') > MAX_SOURCE_BYTES) protocolError('optional parser input exceeds the size limit')

  const result = spawn(pythonCommand, ['-I', WORKER_PATH], {
    input,
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: maxOutputBytes,
    windowsHide: true,
    shell: false,
    cwd: fileURLToPath(new URL('.', import.meta.url)),
    env: workerEnvironment()
  })

  if (result?.error?.code === 'ENOENT') optionalDependencyError('Python 3.9+ is unavailable', result.error)
  if (result?.error?.code === 'ETIMEDOUT') protocolError(`optional parser timed out after ${timeoutMs}ms`, result.error)
  if (result?.error?.code === 'ENOBUFS') protocolError('optional parser exceeded the output limit', result.error)
  if (result?.error) protocolError('optional parser process failed', result.error)

  const stdout = typeof result?.stdout === 'string' ? result.stdout : String(result?.stdout || '')
  if (Buffer.byteLength(stdout, 'utf8') > maxOutputBytes) protocolError('optional parser exceeded the output limit')
  if (result.status !== 0 && stdout.trim() === '') {
    protocolError(`optional parser exited with status ${result.status}`)
  }

  let response
  try {
    response = JSON.parse(stdout)
  } catch (error) {
    protocolError('optional parser returned malformed JSON', error)
  }
  if (!response || typeof response !== 'object') protocolError('optional parser returned an invalid response')

  if (response.ok === true && result.status === 0 && response.result && typeof response.result === 'object') {
    return response.result
  }
  if (response.code === ERROR_CODES.OPTIONAL_DEPENDENCY_MISSING) {
    optionalDependencyError(String(response.message || 'optional parser dependency is unavailable'))
  }
  protocolError(String(response.message || `optional parser exited with status ${result.status}`))
}

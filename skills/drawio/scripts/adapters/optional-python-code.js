import { fileURLToPath } from 'node:url'

import { MAX_CODE_PROJECT_BYTES } from './code-common.js'
import { runFixedPythonWorker } from './optional-python.js'

const WORKER_PATH = fileURLToPath(new URL('./python/code-parser-worker.py', import.meta.url))

export function runOptionalPythonCodeParser(request, options = {}) {
  return runFixedPythonWorker(request, {
    ...options,
    allowedAdapters: ['python-imports', 'python-classes'],
    workerPath: WORKER_PATH,
    maxInputBytes: MAX_CODE_PROJECT_BYTES,
    pythonUnavailableMessage: 'Python 3.11+ is unavailable'
  })
}

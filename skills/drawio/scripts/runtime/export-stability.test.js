import test from 'node:test'
import assert from 'node:assert/strict'

import { waitForStableFile } from './export-stability.js'

function deterministicClock() {
  let value = 0
  return {
    now: () => value,
    wait: async (milliseconds) => {
      value += milliseconds
    }
  }
}

function missing() {
  return Object.assign(new Error('missing'), { code: 'ENOENT' })
}

test('waitForStableFile accepts two consecutive non-zero size samples', async () => {
  const clock = deterministicClock()
  const sizes = [128, 128]
  let index = 0

  const result = await waitForStableFile('preview.png', {
    stat: async () => ({ size: sizes[index++] }),
    ...clock,
    pollIntervalMs: 10,
    timeoutMs: 100
  })

  assert.deepEqual(result, { path: 'preview.png', size: 128, polls: 2, waitedMs: 10 })
})

test('waitForStableFile handles delayed appearance and growing output', async () => {
  const clock = deterministicClock()
  const states = [missing(), missing(), { size: 16 }, { size: 32 }, { size: 32 }]
  let index = 0

  const result = await waitForStableFile('preview.png', {
    stat: async () => {
      const state = states[index++]
      if (state instanceof Error) throw state
      return state
    },
    ...clock,
    pollIntervalMs: 5,
    timeoutMs: 100
  })

  assert.deepEqual(result, { path: 'preview.png', size: 32, polls: 5, waitedMs: 20 })
})

test('waitForStableFile times out with path and duration', async () => {
  const clock = deterministicClock()

  await assert.rejects(
    waitForStableFile('late-preview.png', {
      stat: async () => {
        throw missing()
      },
      ...clock,
      pollIntervalMs: 10,
      timeoutMs: 30
    }),
    /late-preview\.png.*30ms/i
  )
})

test('waitForStableFile propagates non-missing filesystem failures', async () => {
  const denied = Object.assign(new Error('access denied'), { code: 'EACCES' })

  await assert.rejects(
    waitForStableFile('preview.png', {
      stat: async () => {
        throw denied
      }
    }),
    /access denied/i
  )
})

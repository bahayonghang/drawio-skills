import { stat as statFile } from 'node:fs/promises'
import { setTimeout as delay } from 'node:timers/promises'

function positiveInteger(value, name) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${name} must be a positive integer`)
  }
  return value
}

export async function waitForStableFile(
  path,
  {
    stat = statFile,
    now = Date.now,
    wait = delay,
    timeoutMs = 5000,
    pollIntervalMs = 50,
    stableSamples = 2,
    maxPolls = Math.ceil(timeoutMs / pollIntervalMs) + 1
  } = {}
) {
  if (typeof path !== 'string' || path.trim() === '') {
    throw new TypeError('waitForStableFile path must be a non-empty string')
  }
  positiveInteger(timeoutMs, 'timeoutMs')
  positiveInteger(pollIntervalMs, 'pollIntervalMs')
  positiveInteger(stableSamples, 'stableSamples')
  positiveInteger(maxPolls, 'maxPolls')

  const startedAt = now()
  let previousSize = null
  let stableCount = 0
  let polls = 0

  while (polls < maxPolls) {
    polls++
    try {
      const metadata = await stat(path)
      const size = Number(metadata?.size)
      if (Number.isFinite(size) && size > 0) {
        if (size === previousSize) {
          stableCount++
        } else {
          previousSize = size
          stableCount = 1
        }

        if (stableCount >= stableSamples) {
          return {
            path,
            size,
            polls,
            waitedMs: Math.max(0, now() - startedAt)
          }
        }
      } else {
        previousSize = null
        stableCount = 0
      }
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        throw new Error(`Could not inspect exported file "${path}": ${error.message}`, { cause: error })
      }
      previousSize = null
      stableCount = 0
    }

    const elapsed = Math.max(0, now() - startedAt)
    if (elapsed >= timeoutMs || polls >= maxPolls) break
    await wait(Math.min(pollIntervalMs, timeoutMs - elapsed))
  }

  throw new Error(`Timed out waiting for exported file "${path}" to stabilize after ${timeoutMs}ms`)
}

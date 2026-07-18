import { randomUUID } from 'node:crypto'
import { readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'

const PNG_SIGNATURE = Buffer.from('89504e470d0a1a0a', 'hex')
const IEND_SUFFIX = Buffer.from('49454e44ae426082', 'hex')
const IHDR_LENGTH = 13

function requireBuffer(value) {
  if (!Buffer.isBuffer(value)) {
    throw new TypeError('PNG input must be a Buffer')
  }
}

function assertChunkType(type) {
  if (!/^[A-Za-z]{4}$/.test(type)) {
    throw new Error(`PNG contains an invalid chunk type at byte boundary: ${JSON.stringify(type)}`)
  }
}

export function inspectPng(buffer) {
  requireBuffer(buffer)
  if (buffer.length < PNG_SIGNATURE.length || !buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    throw new Error('PNG signature is missing or invalid')
  }

  const chunks = []
  let offset = PNG_SIGNATURE.length
  let width = null
  let height = null
  let hasIdat = false
  let hasIend = false
  let knownTruncation = false

  while (offset < buffer.length) {
    const remaining = buffer.length - offset
    if (remaining === 4 && buffer.readUInt32BE(offset) === 0) {
      knownTruncation = chunks.length > 0 && hasIdat && !hasIend
      if (!knownTruncation) {
        throw new Error('PNG ends with an unknown four-byte truncated chunk')
      }
      break
    }
    if (remaining < 8) {
      throw new Error(`PNG has a truncated chunk header at byte ${offset}`)
    }

    const length = buffer.readUInt32BE(offset)
    const type = buffer.toString('ascii', offset + 4, offset + 8)
    assertChunkType(type)
    const end = offset + 12 + length
    if (!Number.isSafeInteger(end) || end > buffer.length) {
      throw new Error(`PNG has a truncated ${type} chunk at byte ${offset}`)
    }

    if (chunks.length === 0 && type !== 'IHDR') {
      throw new Error('PNG first chunk must be IHDR')
    }
    if (type === 'IHDR') {
      if (chunks.length !== 0 || length !== IHDR_LENGTH) {
        throw new Error('PNG IHDR chunk must be first and contain exactly 13 bytes')
      }
      width = buffer.readUInt32BE(offset + 8)
      height = buffer.readUInt32BE(offset + 12)
      if (width === 0 || height === 0) {
        throw new Error('PNG IHDR width and height must be greater than zero')
      }
    }
    if (type === 'IDAT') hasIdat = true

    chunks.push({ type, length, offset })
    offset = end

    if (type === 'IEND') {
      if (length !== 0) throw new Error('PNG IEND chunk must have zero data length')
      if (!hasIdat) throw new Error('PNG IEND appears before any IDAT chunk')
      hasIend = true
      if (offset !== buffer.length) {
        throw new Error(`PNG contains trailing data after IEND at byte ${offset}`)
      }
      break
    }
  }

  if (width === null || height === null) {
    throw new Error('PNG is missing a valid IHDR chunk')
  }
  if (!hasIdat) {
    throw new Error('PNG is missing an IDAT chunk')
  }
  if (!hasIend && !knownTruncation) {
    throw new Error('PNG is missing terminal IEND data and does not match the known truncation')
  }

  return {
    width,
    height,
    chunks,
    hasIend,
    knownTruncation,
    byteLength: buffer.length
  }
}

export function repairKnownIendTruncation(buffer) {
  requireBuffer(buffer)
  try {
    const metadata = inspectPng(buffer)
    if (!metadata.knownTruncation) {
      return { status: 'unchanged', buffer, metadata }
    }

    const repaired = Buffer.concat([buffer, IEND_SUFFIX])
    return {
      status: 'repaired',
      buffer: repaired,
      metadata: inspectPng(repaired)
    }
  } catch (error) {
    return { status: 'rejected', buffer, error }
  }
}

export function repairKnownIendTruncationFile(
  filePath,
  {
    readFile = readFileSync,
    writeFile = writeFileSync,
    rename = renameSync,
    remove = rmSync,
    temporaryPath = (path) => `${path}.${process.pid}.${randomUUID()}.repair.tmp`
  } = {}
) {
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    throw new TypeError('PNG file path must be a non-empty string')
  }

  const result = repairKnownIendTruncation(readFile(filePath))
  if (result.status === 'rejected') {
    throw new Error(`PNG repair rejected "${filePath}": ${result.error.message}`, { cause: result.error })
  }
  if (result.status === 'unchanged') return result

  const tempFile = temporaryPath(filePath)
  try {
    writeFile(tempFile, result.buffer)
    rename(tempFile, filePath)
  } catch (error) {
    try {
      remove(tempFile, { force: true })
    } catch {
      // Preserve the original write/rename error.
    }
    throw new Error(`Could not atomically repair PNG "${filePath}": ${error.message}`, { cause: error })
  }

  return result
}

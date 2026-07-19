import { rmSync } from 'node:fs'
import { extname } from 'node:path'
import { exportWithDrawioDesktop } from './desktop.js'
import { repairKnownIendTruncationFile } from './png-inspection.js'

function positiveInteger(value, name) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${name} must be a positive integer`)
  }
}

function validateInspection(result, maxDimension) {
  const metadata = result?.metadata
  if (!metadata || !Number.isInteger(metadata.width) || !Number.isInteger(metadata.height)) {
    throw new Error('Vision preview inspection did not return integer PNG dimensions')
  }
  if (!metadata.hasIend) {
    throw new Error('Vision preview PNG is missing terminal IEND after inspection and repair')
  }
  if (Math.max(metadata.width, metadata.height) > maxDimension) {
    throw new Error(
      `Vision preview longest edge is ${Math.max(metadata.width, metadata.height)}px; expected at most ${maxDimension}px`
    )
  }
  return metadata
}

export async function exportVisionPreview({
  inputFile,
  outputFile,
  maxDimension = 2000,
  exportDesktop = exportWithDrawioDesktop,
  inspectFile = repairKnownIendTruncationFile,
  removeFile = rmSync,
  desktopOptions = {}
}) {
  if (typeof inputFile !== 'string' || inputFile.trim() === '') {
    throw new TypeError('Vision preview inputFile must be a non-empty string')
  }
  if (typeof outputFile !== 'string' || extname(outputFile).toLowerCase() !== '.png') {
    throw new Error('Vision preview outputFile must end with .png')
  }
  positiveInteger(maxDimension, 'maxDimension')

  const shared = {
    ...desktopOptions,
    inputFile,
    outputFile,
    format: 'png',
    profile: 'vision-preview'
  }
  const exports = []

  removeFile(outputFile, { force: true })
  exports.push(await exportDesktop({ ...shared, width: maxDimension }))
  let inspection = inspectFile(outputFile)
  let reexported = false

  if (inspection?.metadata?.height > maxDimension) {
    removeFile(outputFile, { force: true })
    exports.push(await exportDesktop({ ...shared, height: maxDimension }))
    inspection = inspectFile(outputFile)
    reexported = true
  }

  const metadata = validateInspection(inspection, maxDimension)
  return {
    profile: 'vision-preview',
    outputFile,
    width: metadata.width,
    height: metadata.height,
    maxDimension,
    reexported,
    repairStatus: inspection.status,
    exports
  }
}

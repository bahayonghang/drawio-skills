import { execFile, execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve, win32 } from 'node:path'
import { waitForStableFile } from './export-stability.js'

const EMBEDDABLE_FORMATS = new Set(['png', 'svg', 'pdf'])
const EXPORTABLE_FORMATS = new Set(['png', 'svg', 'pdf', 'jpg', 'jpeg'])
const RASTER_FORMATS = new Set(['png', 'jpg', 'jpeg'])
const EXPORT_PROFILES = new Set(['final', 'vision-preview'])

function isShellUnsafe(value) {
  return /["'`;&|><\n\r]/.test(value) || value.includes('..')
}

function looksLikePath(value) {
  return value.includes('/') || value.includes('\\') || /^[A-Za-z]:/.test(value)
}

function resolveForPlatform(platform, ...parts) {
  return platform === 'win32' ? win32.resolve(...parts) : resolve(...parts)
}

function isSafeExecutableCandidate(value, platform = process.platform) {
  if (!value || typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed) return false
  if (isShellUnsafe(trimmed)) return false

  if (looksLikePath(trimmed)) {
    return trimmed === resolveForPlatform(platform, trimmed)
  }

  return /^[A-Za-z0-9._-]+(?:\.exe)?$/.test(trimmed)
}

function uniq(values) {
  return [...new Set(values.filter(Boolean))]
}

export function listDrawioDesktopCandidates({ platform = process.platform, env = process.env } = {}) {
  const candidates = []

  if (isSafeExecutableCandidate(env.DRAWIO_CMD, platform)) {
    candidates.push(env.DRAWIO_CMD.trim())
  }

  if (platform === 'win32') {
    if (env.ProgramFiles) {
      candidates.push(resolveForPlatform(platform, env.ProgramFiles, 'draw.io', 'draw.io.exe'))
    }
    if (env.LOCALAPPDATA) {
      candidates.push(resolveForPlatform(platform, env.LOCALAPPDATA, 'Programs', 'draw.io', 'draw.io.exe'))
    }
    candidates.push('draw.io.exe', 'drawio.exe')
  } else if (platform === 'darwin') {
    candidates.push('/Applications/draw.io.app/Contents/MacOS/draw.io', 'draw.io', 'drawio')
  } else {
    candidates.push('/usr/bin/drawio', '/usr/local/bin/drawio', '/snap/bin/drawio', 'drawio', 'draw.io')
  }

  return uniq(candidates)
}

export function detectDrawioDesktop({
  platform = process.platform,
  env = process.env,
  exists = existsSync,
  probeCommand = null
} = {}) {
  for (const candidate of listDrawioDesktopCandidates({ platform, env })) {
    if (!looksLikePath(candidate)) {
      if (typeof probeCommand === 'function' && probeCommand(candidate)) {
        return { executable: candidate, source: 'path' }
      }
      continue
    }
    if (exists(candidate)) {
      return { executable: candidate, source: 'filesystem' }
    }
  }

  return null
}

export function formatSupportsEmbed(format) {
  return EMBEDDABLE_FORMATS.has(String(format || '').toLowerCase())
}

export function isDesktopExportFormat(format) {
  return EXPORTABLE_FORMATS.has(String(format || '').toLowerCase())
}

export function buildDrawioExportArgs({
  inputFile,
  outputFile,
  format,
  profile = 'final',
  embedDiagram = true,
  border = 10,
  scale,
  width,
  height
}) {
  const normalizedFormat = String(format).toLowerCase()
  if (!EXPORT_PROFILES.has(profile)) {
    throw new Error(`Unsupported draw.io export profile "${profile}"`)
  }
  const args = ['-x', '-f', normalizedFormat]

  if (profile === 'vision-preview') {
    if (normalizedFormat !== 'png') {
      throw new Error('The vision-preview export profile supports PNG only')
    }
    const dimensions = [width, height].filter((value) => value !== undefined)
    if (dimensions.length !== 1) {
      throw new Error('The vision-preview export profile requires exactly one of width or height')
    }
    const dimension = width !== undefined ? ['--width', width] : ['--height', height]
    if (!Number.isInteger(dimension[1]) || dimension[1] <= 0) {
      throw new Error(`The vision-preview ${dimension[0].slice(2)} must be a positive integer`)
    }
    if (typeof border === 'number') args.push('-b', String(border))
    args.push(dimension[0], String(dimension[1]))
  } else {
    if (embedDiagram && formatSupportsEmbed(normalizedFormat)) {
      args.push('-e')
    }
    if (typeof border === 'number') {
      args.push('-b', String(border))
    }
    if (typeof scale === 'number' && scale > 0 && RASTER_FORMATS.has(normalizedFormat)) {
      args.push('-s', String(scale))
    }
  }

  args.push('-o', outputFile, inputFile)
  return args
}

export async function exportWithDrawioDesktop({
  inputFile,
  outputFile,
  format,
  profile = 'final',
  scale,
  width,
  height,
  env = process.env,
  platform = process.platform,
  exists = existsSync,
  execute = execFileSync,
  waitForStable = waitForStableFile,
  stabilityOptions
}) {
  const args = buildDrawioExportArgs({ inputFile, outputFile, format, profile, scale, width, height })
  const failures = []

  for (const executable of listDrawioDesktopCandidates({ platform, env })) {
    if (looksLikePath(executable) && !exists(executable)) {
      continue
    }

    try {
      execute(executable, args, {
        stdio: 'pipe',
        windowsHide: true
      })
      const file = await waitForStable(outputFile, stabilityOptions)
      return { executable, args, file }
    } catch (error) {
      if (error.code === 'ENOENT') {
        failures.push(executable)
        continue
      }
      throw new Error(`draw.io Desktop export failed via "${executable}": ${error.message}`)
    }
  }

  const checked = failures.length > 0 ? failures.join(', ') : listDrawioDesktopCandidates({ platform, env }).join(', ')
  throw new Error(
    `draw.io Desktop CLI was not found. Checked: ${checked}. ` +
      'Install draw.io Desktop or set DRAWIO_CMD to an absolute executable path.'
  )
}

export function openWithDrawioDesktop({
  filePath,
  env = process.env,
  platform = process.platform,
  exists = existsSync
}) {
  const desktop = detectDrawioDesktop({ env, platform, exists })
  if (!desktop) {
    throw new Error('draw.io Desktop CLI was not found. Install draw.io Desktop or set DRAWIO_CMD.')
  }

  execFile(desktop.executable, [filePath], {
    windowsHide: true,
    detached: true,
    stdio: 'ignore'
  }).unref()

  return desktop
}

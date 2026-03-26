import { execFile, execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const EMBEDDABLE_FORMATS = new Set(['png', 'svg', 'pdf'])
const EXPORTABLE_FORMATS = new Set(['png', 'svg', 'pdf', 'jpg', 'jpeg'])

function isShellUnsafe(value) {
  return /["'`;&|><\n\r]/.test(value) || value.includes('..')
}

function looksLikePath(value) {
  return value.includes('/') || value.includes('\\') || /^[A-Za-z]:/.test(value)
}

function isSafeExecutableCandidate(value) {
  if (!value || typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed) return false
  if (isShellUnsafe(trimmed)) return false

  if (looksLikePath(trimmed)) {
    return trimmed === resolve(trimmed)
  }

  return /^[A-Za-z0-9._-]+(?:\.exe)?$/.test(trimmed)
}

function uniq(values) {
  return [...new Set(values.filter(Boolean))]
}

export function listDrawioDesktopCandidates({ platform = process.platform, env = process.env } = {}) {
  const candidates = []

  if (isSafeExecutableCandidate(env.DRAWIO_CMD)) {
    candidates.push(env.DRAWIO_CMD.trim())
  }

  if (platform === 'win32') {
    if (env.ProgramFiles) {
      candidates.push(resolve(env.ProgramFiles, 'draw.io', 'draw.io.exe'))
    }
    if (env.LOCALAPPDATA) {
      candidates.push(resolve(env.LOCALAPPDATA, 'Programs', 'draw.io', 'draw.io.exe'))
    }
    candidates.push('draw.io.exe', 'drawio.exe')
  } else if (platform === 'darwin') {
    candidates.push(
      '/Applications/draw.io.app/Contents/MacOS/draw.io',
      'draw.io',
      'drawio'
    )
  } else {
    candidates.push(
      '/usr/bin/drawio',
      '/usr/local/bin/drawio',
      '/snap/bin/drawio',
      'drawio',
      'draw.io'
    )
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
  embedDiagram = true,
  border = 10
}) {
  const normalizedFormat = String(format).toLowerCase()
  const args = ['-x', '-f', normalizedFormat]

  if (embedDiagram && formatSupportsEmbed(normalizedFormat)) {
    args.push('-e')
  }
  if (typeof border === 'number') {
    args.push('-b', String(border))
  }

  args.push('-o', outputFile, inputFile)
  return args
}

export function exportWithDrawioDesktop({
  inputFile,
  outputFile,
  format,
  env = process.env,
  platform = process.platform,
  exists = existsSync
}) {
  const args = buildDrawioExportArgs({ inputFile, outputFile, format })
  const failures = []

  for (const executable of listDrawioDesktopCandidates({ platform, env })) {
    if (looksLikePath(executable) && !exists(executable)) {
      continue
    }

    try {
      execFileSync(executable, args, {
        stdio: 'pipe',
        windowsHide: true
      })
      return { executable, args }
    } catch (error) {
      if (error.code === 'ENOENT') {
        failures.push(executable)
        continue
      }
      throw new Error(
        `draw.io Desktop export failed via "${executable}": ${error.message}`
      )
    }
  }

  const checked = failures.length > 0
    ? failures.join(', ')
    : listDrawioDesktopCandidates({ platform, env }).join(', ')
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
    throw new Error(
      'draw.io Desktop CLI was not found. Install draw.io Desktop or set DRAWIO_CMD.'
    )
  }

  execFile(desktop.executable, [filePath], {
    windowsHide: true,
    detached: true,
    stdio: 'ignore'
  }).unref()

  return desktop
}

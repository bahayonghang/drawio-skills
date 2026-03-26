import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildDrawioExportArgs,
  detectDrawioDesktop,
  formatSupportsEmbed,
  listDrawioDesktopCandidates
} from '../skills/drawio/scripts/runtime/desktop.js'

test('listDrawioDesktopCandidates prefers explicit DRAWIO_CMD when safe', () => {
  const candidates = listDrawioDesktopCandidates({
    platform: 'win32',
    env: {
      DRAWIO_CMD: 'C:\\Tools\\draw.io\\draw.io.exe',
      ProgramFiles: 'C:\\Program Files',
      LOCALAPPDATA: 'C:\\Users\\me\\AppData\\Local'
    }
  })

  assert.equal(candidates[0], 'C:\\Tools\\draw.io\\draw.io.exe')
})

test('detectDrawioDesktop rejects suspicious DRAWIO_CMD values', () => {
  const detection = detectDrawioDesktop({
    platform: 'win32',
    env: {
      DRAWIO_CMD: 'C:\\tmp\\drawio.exe";--malicious',
      ProgramFiles: 'C:\\Program Files'
    },
    exists: candidate => candidate === 'C:\\Program Files\\draw.io\\draw.io.exe'
  })

  assert.equal(detection.executable, 'C:\\Program Files\\draw.io\\draw.io.exe')
})

test('detectDrawioDesktop returns null when no trusted candidate exists', () => {
  const detection = detectDrawioDesktop({
    platform: 'linux',
    env: {
      DRAWIO_CMD: '../drawio'
    },
    exists: () => false
  })

  assert.equal(detection, null)
})

test('buildDrawioExportArgs embeds editable XML for png and svg exports', () => {
  const pngArgs = buildDrawioExportArgs({
    inputFile: 'diagram.drawio',
    outputFile: 'diagram.drawio.png',
    format: 'png'
  })
  const svgArgs = buildDrawioExportArgs({
    inputFile: 'diagram.drawio',
    outputFile: 'diagram.drawio.svg',
    format: 'svg'
  })

  assert.ok(pngArgs.includes('-e'))
  assert.ok(svgArgs.includes('-e'))
  assert.equal(pngArgs[pngArgs.length - 1], 'diagram.drawio')
})

test('buildDrawioExportArgs does not request embed for jpg', () => {
  const args = buildDrawioExportArgs({
    inputFile: 'diagram.drawio',
    outputFile: 'diagram.jpg',
    format: 'jpg'
  })

  assert.ok(!args.includes('-e'))
  assert.equal(formatSupportsEmbed('jpg'), false)
  assert.equal(formatSupportsEmbed('pdf'), true)
})

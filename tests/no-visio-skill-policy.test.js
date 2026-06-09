import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = resolve(__dirname, '..')
const SKILLS_DIR = resolve(PROJECT_ROOT, 'skills')

function listFilesRecursive(rootDir) {
  const out = []
  const walk = (absDir) => {
    for (const entry of readdirSync(absDir)) {
      const abs = resolve(absDir, entry)
      if (statSync(abs).isDirectory()) {
        walk(abs)
      } else {
        out.push(abs)
      }
    }
  }
  if (existsSync(rootDir)) walk(rootDir)
  return out
}

test('drawio skills do not include Visio-specific implementation guidance', () => {
  const forbidden = /\bVisio\b|\.vsdx\b|\bvsdx\b|Auto-Visio|pywin32|COM automation|Microsoft Visio/i
  const matches = []

  for (const file of listFilesRecursive(SKILLS_DIR)) {
    const text = readFileSync(file, 'utf8')
    if (forbidden.test(text)) {
      matches.push(relative(PROJECT_ROOT, file).replaceAll('\\', '/'))
    }
  }

  assert.deepEqual(matches, [])
})

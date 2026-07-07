/**
 * academic-templates-strict.test.js
 * Guard: every academic template and example must convert under strict mode
 * (zero warning-level findings) so the committed references stay drift-free.
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { parseSpecYaml, specToDrawioXml } from '../skills/drawio/scripts/dsl/spec-to-drawio.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = resolve(__dirname, '..')
const TEMPLATES_DIR = resolve(PROJECT_ROOT, 'skills/drawio-academic-skills/references/templates')
const EXAMPLES_DIR = resolve(PROJECT_ROOT, 'skills/drawio-academic-skills/references/examples')

function yamlFiles(dir) {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.yaml'))
    .map((name) => resolve(dir, name))
}

test('academic templates and examples convert cleanly under strict warnings', () => {
  const files = [...yamlFiles(TEMPLATES_DIR), ...yamlFiles(EXAMPLES_DIR)]
  assert.ok(files.length >= 9, `expected at least 9 academic specs, found ${files.length}`)
  for (const file of files) {
    const spec = parseSpecYaml(readFileSync(file, 'utf-8'))
    assert.doesNotThrow(
      () => specToDrawioXml(spec, { strict: true, silent: true }),
      `strict conversion failed for ${file}`
    )
  }
})

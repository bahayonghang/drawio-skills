import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseSpecYaml, specToDrawioXml } from './spec-to-drawio.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Zero-false-kill baseline: every bundled example and academic template must
// convert in default (non-strict) mode now that unknown covered stencil names
// are hard errors. A regenerated catalog that drops entries breaks this first.
const SPEC_DIRS = [
  resolve(__dirname, '../../references/examples'),
  resolve(__dirname, '../../../drawio-academic-skills/assets/templates'),
  resolve(__dirname, '../../../drawio-academic-skills/references/examples')
]

test('bundled examples and academic templates convert with zero errors in default mode', () => {
  let checked = 0
  for (const dir of SPEC_DIRS.filter((candidate) => existsSync(candidate))) {
    for (const file of readdirSync(dir).filter((name) => name.endsWith('.yaml'))) {
      const spec = parseSpecYaml(readFileSync(join(dir, file), 'utf-8'))
      const xml = specToDrawioXml(spec, { silent: true })
      assert.ok(typeof xml === 'string' && xml.length > 0, `${join(dir, file)} produced empty XML`)
      checked++
    }
  }
  assert.ok(checked >= 20, `expected at least 20 bundled specs, found ${checked}`)
})

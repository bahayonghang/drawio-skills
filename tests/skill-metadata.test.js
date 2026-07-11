import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = resolve(__dirname, '..')

function readFrontmatterField(skillPath, field) {
  const skillText = readFileSync(skillPath, 'utf8')
  const frontmatterMatch = skillText.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  assert.ok(frontmatterMatch, `missing frontmatter in ${skillPath}`)

  const fieldMatch = frontmatterMatch[1].match(new RegExp(`^${field}:\\s*["']?([^"'\\r\\n]+)["']?\\s*$`, 'm'))
  assert.ok(fieldMatch, `missing ${field} in ${skillPath}`)

  return fieldMatch[1]
}

function readDescription(skillPath) {
  return readFrontmatterField(skillPath, 'description')
}

test('skill metadata versions match package.json', () => {
  const packageJson = JSON.parse(readFileSync(resolve(PROJECT_ROOT, 'package.json'), 'utf8'))
  const skillPaths = [
    resolve(PROJECT_ROOT, 'skills/drawio/SKILL.md'),
    resolve(PROJECT_ROOT, 'skills/drawio-academic-skills/SKILL.md')
  ]

  for (const skillPath of skillPaths) {
    assert.equal(readFrontmatterField(skillPath, 'version'), packageJson.version, `${skillPath} version is out of sync`)
  }
})

test('skill metadata descriptions stay within installer limits', () => {
  const skillPaths = [
    resolve(PROJECT_ROOT, 'skills/drawio/SKILL.md'),
    resolve(PROJECT_ROOT, 'skills/drawio-academic-skills/SKILL.md')
  ]

  for (const skillPath of skillPaths) {
    const description = readDescription(skillPath)

    assert.ok(description.length <= 1024, `${skillPath} description exceeds 1024 characters: ${description.length}`)
    assert.ok(
      Buffer.byteLength(description, 'utf8') <= 1024,
      `${skillPath} description exceeds 1024 UTF-8 bytes: ${Buffer.byteLength(description, 'utf8')}`
    )
  }
})

test('image icon resolver stays bundled and offline', () => {
  const packageJson = JSON.parse(readFileSync(resolve(PROJECT_ROOT, 'package.json'), 'utf8'))
  const resolverText = readFileSync(
    resolve(PROJECT_ROOT, 'skills/drawio/scripts/dsl/icon-resolver.js'),
    'utf8'
  )

  assert.equal(packageJson.dependencies['lucide-static'], undefined)
  assert.doesNotMatch(resolverText, /readFileSync|createRequire|require\.resolve|LOBE_CDN_BASE/)
  assert.doesNotMatch(resolverText, /image=https?:\/\//)
})

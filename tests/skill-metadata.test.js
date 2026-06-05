import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = resolve(__dirname, '..')

function readDescription(skillPath) {
  const skillText = readFileSync(skillPath, 'utf8')
  const frontmatterMatch = skillText.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  assert.ok(frontmatterMatch, `missing frontmatter in ${skillPath}`)

  const descriptionMatch = frontmatterMatch[1].match(/^description:\s*"([\s\S]*?)"$/m)
  assert.ok(descriptionMatch, `missing description in ${skillPath}`)

  return descriptionMatch[1]
}

test('skill metadata descriptions stay within installer limits', () => {
  const skillPaths = [
    resolve(PROJECT_ROOT, 'skills/drawio/SKILL.md'),
    resolve(PROJECT_ROOT, 'skills/drawio-academic-skills/SKILL.md')
  ]

  for (const skillPath of skillPaths) {
    const description = readDescription(skillPath)

    assert.ok(
      description.length <= 1024,
      `${skillPath} description exceeds 1024 characters: ${description.length}`
    )
    assert.ok(
      Buffer.byteLength(description, 'utf8') <= 1024,
      `${skillPath} description exceeds 1024 UTF-8 bytes: ${Buffer.byteLength(description, 'utf8')}`
    )
  }
})

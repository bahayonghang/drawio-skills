import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = resolve(__dirname, '..')

function readProjectFile(path) {
  return readFileSync(resolve(PROJECT_ROOT, path), 'utf8')
}

test('drawio visual verification policy prefers exported artifacts over screenshots', () => {
  const baseSkill = readProjectFile('skills/drawio/SKILL.md')
  const createWorkflow = readProjectFile('skills/drawio/references/workflows/create.md')
  const replicateWorkflow = readProjectFile('skills/drawio/references/workflows/replicate.md')
  const academicSkill = readProjectFile('skills/drawio-academic-skills/SKILL.md')
  const publicationOverlay = readProjectFile(
    'skills/drawio-academic-skills/references/docs/publication-overlay.md'
  )
  const exportGuide = readProjectFile('docs/guide/export.md')

  assert.match(baseSkill, /Perform visual self-checks on exported artifacts first/)
  assert.match(baseSkill, /Do not create browser or Playwright screenshots when a CLI\/Desktop export exists/)
  assert.match(baseSkill, /inspect exported SVG first, or Desktop-exported PNG\/PDF\/JPG\/embedded SVG/i)

  assert.match(createWorkflow, /Exported-Artifact Verification/)
  assert.match(createWorkflow, /Do not create browser or Playwright screenshots when an exported SVG\/PNG\/PDF\/JPG exists/)

  assert.match(replicateWorkflow, /Export standalone SVG first/)
  assert.match(replicateWorkflow, /Use browser\/live screenshots only as a last-resort review aid/)

  assert.match(academicSkill, /Do not substitute browser or Playwright screenshots when an exported artifact exists/)
  assert.match(publicationOverlay, /Use exported artifacts for paper-readability checks before any browser path/)
  assert.match(exportGuide, /Use exported artifacts for visual checks before any browser screenshot/)
})

test('drawio skills keep final deliverables separate from intermediate sidecars', () => {
  const baseSkill = readProjectFile('skills/drawio/SKILL.md')
  const academicSkill = readProjectFile('skills/drawio-academic-skills/SKILL.md')

  assert.match(baseSkill, /deliver `<name>\.drawio` and `<name>\.svg`/)
  assert.match(baseSkill, /`\.drawio-tmp\/<name>\/`/)
  assert.match(baseSkill, /--sidecar-dir \.drawio-tmp\/output/)
  assert.match(baseSkill, /Do not create or modify scratch JS scripts under a user's project-local `\.agents\/skills\/drawio`/)

  assert.match(academicSkill, /default academic final deliverables/)
  assert.match(academicSkill, /`\.drawio-tmp\/<name>\/`/)
  assert.match(academicSkill, /--sidecar-dir \.drawio-tmp\/figure/)
  assert.match(academicSkill, /Do not create or modify scratch JS scripts under a user's project-local `\.agents\/skills\/drawio`/)

  const defaultDeliverables = academicSkill.match(/Default deliverables:\s*\n\n([\s\S]*?)\n\nIntermediate work directory:/)
  assert.ok(defaultDeliverables, 'academic skill should separate final deliverables from intermediate work')
  assert.doesNotMatch(defaultDeliverables[1], /<name>\.spec\.yaml/)
  assert.doesNotMatch(defaultDeliverables[1], /<name>\.arch\.json/)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const read = (path) => readFileSync(resolve(root, path), 'utf8')

test('base and academic skills encode distinct palette question policies', () => {
  const base = read('skills/drawio/SKILL.md')
  const academic = read('skills/drawio-academic-skills/SKILL.md')

  assert.match(base, /AskUserQuestion[\s\S]{0,500}(palette|colorblind|grayscale|black-and-white|multi-category)/i)
  assert.match(base, /(already|explicitly|specified)[\s\S]{0,250}(do not ask|skip)/i)
  assert.match(base, /replicat[\s\S]{0,500}(preserve|source palette)[\s\S]{0,300}(do not ask|skip)/i)

  assert.match(academic, /venue[\s\S]{0,500}AskUserQuestion/i)
  assert.match(academic, /\(Recommended\)/)
  assert.match(academic, /meta\.palette/)
  assert.match(academic, /(safety|colorblind|grayscale)/i)
  assert.match(academic, /completion report[\s\S]{0,200}palette/i)
})

test('palette docs describe the orthogonal contract, venue map, and print gate', () => {
  const colorGuide = read('skills/drawio/references/docs/design-system/color-guide.md')
  const themes = read('skills/drawio/references/docs/design-system/themes.md')
  const specification = read('skills/drawio/references/docs/design-system/specification.md')
  const playbook = read('skills/drawio-academic-skills/references/docs/academic-figure-playbook.md')
  const overlay = read('skills/drawio-academic-skills/references/docs/publication-overlay.md')

  assert.match(colorGuide, /theme[\s\S]{0,200}(orthogonal|independent)[\s\S]{0,200}palette/i)
  assert.match(themes, /theme[\s\S]{0,100}(x|×)[\s\S]{0,100}palette/i)
  assert.match(specification, /meta\.palette/)
  assert.match(specification, /\$paletteN-fill/)
  assert.match(specification, /~\/\.drawio-skill\/palettes\//)

  for (const value of ['ieee-bw', 'ieee-color', 'okabe-ito', 'tol-high-contrast', 'journal-npg', 'c4-blue', 'cloud-aws']) {
    assert.match(playbook, new RegExp(value))
  }
  assert.match(overlay, /PALETTE_PRINT_GATE/)
  assert.match(overlay, /strict[\s\S]{0,200}(ieee-bw|tol-high-contrast)/i)
})

test('palette release surfaces and eval cases stay synchronized at 2.7.0', () => {
  const packageJson = JSON.parse(read('package.json'))
  const baseEvals = JSON.parse(read('skills/drawio/evals/evals.json'))
  const academicEvals = JSON.parse(read('skills/drawio-academic-skills/evals/evals.json'))
  const releaseSurfaces = [
    read('skills/drawio/agents/interface.yaml'),
    read('skills/drawio-academic-skills/agents/interface.yaml'),
    read('skills/drawio-academic-skills/agents/openai.yaml')
  ]

  assert.equal(packageJson.version, '2.7.0')
  assert.equal(baseEvals.version, '2.7.0')
  assert.equal(academicEvals.version, '2.7.0')
  assert.ok(baseEvals.evals.some((item) => item.id === 'base-palette-selection'))
  assert.ok(baseEvals.evals.some((item) => item.id === 'base-replicate-palette-preservation'))
  assert.ok(academicEvals.evals.some((item) => item.id === 'academic-ieee-print-palette'))
  assert.ok(academicEvals.evals.some((item) => item.id === 'academic-explicit-palette'))
  for (const surface of releaseSurfaces) assert.match(surface, /palette/i)

  assert.match(read('skills/drawio/CHANGELOG.md'), /## 2\.7\.0 \(2026-07-14\)[\s\S]{0,500}palette/i)
  assert.match(read('skills/drawio-academic-skills/CHANGELOG.md'), /## 2\.7\.0 \(2026-07-14\)[\s\S]{0,500}palette/i)
  assert.match(read('README.md'), /2\.7\.0/)
})

import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import test from 'node:test'

const ROOT = resolve(import.meta.dirname, '..')
const read = (path) => readFileSync(resolve(ROOT, path), 'utf8')

const UPSTREAM_SCRIPTS = [
  'aiicons.py',
  'autolayout.py',
  'buildup.py',
  'c4.py',
  'ciimports.py',
  'composeimports.py',
  'compress.py',
  'dockerimports.py',
  'drawio2mermaid.py',
  'drawio2pptx.py',
  'drawiodiff.py',
  'drawiohtml.py',
  'encode_drawio_url.py',
  'explain.py',
  'goimports.py',
  'heatmap.py',
  'jsimports.py',
  'k8simports.py',
  'openapiimports.py',
  'prdiff.py',
  'pyclasses.py',
  'pyimports.py',
  'raster2drawio.py',
  'relabel.py',
  'repair_png.py',
  'restyle.py',
  'runbook.py',
  'rustimports.py',
  'seqlayout.py',
  'shapesearch.py',
  'sqlerd.py',
  'svgflow.py',
  'tfimports.py',
  'tfstate.py',
  'timelapse.py',
  'tubemap.py',
  'validate.py'
]

const SHIPPED_POSTPROCESS = ['mermaid', 'explain', 'relabel', 'restyle', 'heatmap', 'html']
const DEFERRED_POSTPROCESS = ['runbook', 'svgflow', 'tubemap', 'seqlayout', 'compress', 'buildup', 'pptx', 'timelapse', 'prdiff']

function recursiveFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? recursiveFiles(path) : [path]
  })
}

test('publishes one authoritative 37-script compatibility matrix with honest evidence', () => {
  const path = 'skills/drawio/references/docs/upstream-capability-compatibility.md'
  assert.equal(existsSync(resolve(ROOT, path)), true, `${path} must be published`)

  const text = read(path)
  const rows = [...text.matchAll(/^\| `([^`]+\.py)` \| `(bridge|adapt|replace|defer)` \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$/gm)]
  assert.equal(rows.length, 37, 'compatibility matrix must contain exactly 37 script rows')
  assert.deepEqual(rows.map((row) => row[1]).sort(), UPSTREAM_SCRIPTS)
  assert.equal(new Set(rows.map((row) => row[1])).size, 37)

  for (const row of rows) {
    assert.ok(row[3].trim().length > 3, `${row[1]} requires an owner or entry point`)
    assert.ok(row[4].trim().length > 10, `${row[1]} requires a reason`)
    assert.match(row[5], /command-executed|recorded fixture|Desktop-executed|missing evidence/)
  }

  for (const operation of DEFERRED_POSTPROCESS) {
    const script = operation === 'pptx' ? 'drawio2pptx.py' : `${operation}.py`
    assert.ok(text.includes(`| \`${script}\` | \`defer\` |`), `${script} must remain deferred`)
  }
})

test('registers at least five valid file-backed cross-capability eval cases', () => {
  const path = 'skills/drawio/evals/upstream-integration-cases.json'
  assert.equal(existsSync(resolve(ROOT, path)), true, `${path} must be published`)

  const manifest = JSON.parse(read(path))
  assert.equal(manifest.version, 1)
  assert.ok(manifest.cases.length >= 5)
  assert.equal(new Set(manifest.cases.map((entry) => entry.id)).size, manifest.cases.length)

  for (const entry of manifest.cases) {
    assert.equal(entry.evidence_kind, 'file-backed fixture')
    assert.equal(entry.execution_kind, 'command-executed')
    assert.equal(entry.status, 'pass')
    assert.ok(entry.focused_command.startsWith('node --test '))
    assert.ok(entry.input_files.length > 0)
    for (const file of entry.input_files) {
      assert.equal(existsSync(resolve(ROOT, file)), true, `${entry.id} fixture must exist: ${file}`)
    }
  }
})

test('promotes shipped routes across skills, interfaces, docs, and release evidence without runtime duplication', () => {
  const baseSkill = read('skills/drawio/SKILL.md')
  const academicSkill = read('skills/drawio-academic-skills/SKILL.md')
  const packageJson = JSON.parse(read('package.json'))

  assert.match(baseSkill, /`multi-page`/)
  assert.match(baseSkill, /`raster-replicate`/)
  assert.match(baseSkill, /`postprocess`/)
  for (const operation of SHIPPED_POSTPROCESS) assert.match(baseSkill, new RegExp(`\\b${operation}\\b`))
  assert.match(academicSkill, /upstream-capability-compatibility\.md/)

  const baseDescription = 'Create, edit, replicate, import, and export draw.io diagrams with an offline YAML-first workflow: architecture, network topologies, flowcharts, UML/ER, org charts, Mermaid/CSV conversion, existing .drawio bundles, style presets, themes, and non-publication formula diagrams. For publication figures (paper, thesis, IEEE, camera-ready) use drawio-academic-skills instead.'
  assert.match(baseSkill, new RegExp(`description: "${baseDescription.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`))
  assert.match(baseSkill, new RegExp(`version: "${packageJson.version}"`))
  assert.match(academicSkill, new RegExp(`version: "${packageJson.version}"`))

  for (const file of [
    'skills/drawio/agents/interface.yaml',
    'skills/drawio/agents/openai.yaml',
    'skills/drawio-academic-skills/agents/interface.yaml',
    'skills/drawio-academic-skills/agents/openai.yaml'
  ]) {
    const text = read(file)
    assert.match(text, /multi-page/i, `${file} must advertise multi-page support`)
    assert.match(text, /postprocess/i, `${file} must advertise postprocess support`)
  }

  assert.match(read('docs/guide/cli.md'), /Upstream capability promotion/i)
  assert.match(read('docs/zh/guide/cli.md'), /上游能力整合/)
  assert.match(read('skills/drawio/reports/output_quality_scorecard.md'), /^# Output Quality Scorecard: Upstream Integration/m)
  assert.match(read('skills/drawio/reports/upstream-port-release-evidence.md'), /remote release.*missing evidence/i)

  const academicRuntime = recursiveFiles(resolve(ROOT, 'skills/drawio-academic-skills'))
    .filter((path) => ['.js', '.ts', '.py'].includes(extname(path)))
  assert.deepEqual(academicRuntime, [], 'academic overlay must not own executable runtime')
})

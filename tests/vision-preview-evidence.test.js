import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parseSpecYaml, specToDrawioXml, validateXml } from '../skills/drawio/scripts/dsl/spec-to-drawio.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const CASES_FILE = resolve(PROJECT_ROOT, 'skills/drawio/evals/vision-preview-cases.json')
const EXPECTED_CATEGORIES = ['cjk', 'dense-academic', 'small', 'tall', 'wide']
const PROBLEM_TAXONOMY = new Set([
  'overlap',
  'clipped-label',
  'missing-connection',
  'off-canvas',
  'edge-through-object',
  'stacked-edge',
  'edge-label-overlap',
  'missing-content',
  'source-mismatch'
])

test('vision preview evidence cases are file-backed and deterministically renderable', () => {
  assert.ok(existsSync(CASES_FILE), 'vision-preview-cases.json must exist')
  const manifest = JSON.parse(readFileSync(CASES_FILE, 'utf8'))

  assert.equal(manifest.schema_version, 1)
  assert.equal(manifest.suite, 'drawio-vision-preview')
  assert.equal(manifest.review_cadence, 'per-release')
  assert.equal(manifest.output_contract?.format, 'png')
  assert.equal(manifest.output_contract?.profile, 'vision-preview')
  assert.equal(manifest.output_contract?.embed_diagram, false)
  assert.equal(manifest.output_contract?.max_longest_edge, 2000)
  assert.equal(manifest.output_contract?.artifact_root, '.drawio-tmp/vision-preview')
  assert.equal(manifest.output_contract?.canonical_source, 'YAML')
  assert.equal(manifest.output_contract?.final_artifact_unchanged, true)
  assert.ok(typeof manifest.rollback_boundary === 'string' && manifest.rollback_boundary.length > 0)

  assert.deepEqual(
    manifest.cases.map((entry) => entry.category).sort(),
    EXPECTED_CATEGORIES
  )
  assert.equal(new Set(manifest.cases.map((entry) => entry.output_path)).size, manifest.cases.length)
  assert.deepEqual(
    manifest.input_files.slice().sort(),
    manifest.cases.map((entry) => entry.source_file).sort()
  )

  for (const entry of manifest.cases) {
    assert.equal(entry.evidence_kind, 'file-backed fixture', `${entry.id} must preserve its evidence kind`)
    assert.match(entry.source_file, /\.ya?ml$/)
    assert.match(entry.output_path, /^\.drawio-tmp\/vision-preview\/[a-z-]+\.preview\.png$/)
    assert.match(
      entry.review_record_path,
      /^\.drawio-tmp\/vision-preview\/reviews\/[a-z-]+\.visual-review\.json$/
    )

    const sourcePath = resolve(PROJECT_ROOT, entry.source_file)
    assert.ok(existsSync(sourcePath), `${entry.id} source file must exist: ${entry.source_file}`)
    const spec = parseSpecYaml(readFileSync(sourcePath, 'utf8'))
    const xml = specToDrawioXml(spec)
    const xmlValidation = validateXml(xml)
    assert.equal(xmlValidation.valid, true, `${entry.id} YAML must render to valid draw.io XML`)

    assert.ok(Number.isInteger(entry.rework_result?.rounds))
    assert.ok(entry.rework_result.rounds >= 0 && entry.rework_result.rounds <= 2)
    assert.ok(['not-needed', 'resolved', 'warning'].includes(entry.rework_result.status))
    if (entry.rework_result.status === 'warning') {
      assert.ok(entry.rework_result.remaining_issues.length > 0)
    } else {
      assert.deepEqual(entry.rework_result.remaining_issues, [])
    }

    const reviewIssues = [...entry.observed_issues, ...entry.rework_result.remaining_issues]
    for (const issue of reviewIssues) {
      for (const field of ['pageId', 'objectId', 'problem', 'severity', 'evidence', 'suggestedAction', 'source']) {
        assert.ok(Object.hasOwn(issue, field), `${entry.id} issue must include ${field}`)
      }
      assert.ok(PROBLEM_TAXONOMY.has(issue.problem), `${entry.id} issue must use the shared problem taxonomy`)
      assert.equal(issue.source, 'visual')
      assert.ok(['blocker', 'warning', 'info'].includes(issue.severity))

      const target = issue.canonicalPatchTarget
      assert.equal(target?.kind, 'edge', `${entry.id} issue must identify its canonical patch target`)
      assert.ok(
        spec.edges.some((edge) => edge.from === target.from && edge.to === target.to),
        `${entry.id} canonical edge target must exist in the YAML source`
      )
      assert.equal(issue.objectId, `edge:${target.from}->${target.to}`)
    }
  }
})

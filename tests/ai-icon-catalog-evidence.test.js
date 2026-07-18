import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'

import { parseSpecYaml, specToDrawioXml, validateXml } from '../skills/drawio/scripts/dsl/spec-to-drawio.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const CASES_FILE = resolve(PROJECT_ROOT, 'skills/drawio/evals/ai-icon-catalog-cases.json')
const CATALOG_FILE = resolve(PROJECT_ROOT, 'skills/drawio/assets/catalog/ai-icons.json.gz')
const EXPECTED_CASES = ['advanced-svg', 'cjk-agent-rag', 'core-aliases', 'current-color', 'gradients']
const FEATURE_PATTERNS = {
  linearGradient: /<linearGradient\b/i,
  radialGradient: /<radialGradient\b/i,
  currentColor: /currentColor/i,
  clipPath: /<clipPath\b/i,
  mask: /<mask\b/i,
  filter: /<filter\b/i
}

test('AI icon catalog evidence cases are file-backed, offline, and deterministically renderable', () => {
  const manifest = JSON.parse(readFileSync(CASES_FILE, 'utf8'))
  const evidence = JSON.parse(readFileSync(resolve(PROJECT_ROOT, manifest.evidence_file), 'utf8'))
  const catalog = JSON.parse(gunzipSync(readFileSync(CATALOG_FILE)).toString('utf8'))
  const iconsBySlug = new Map(catalog.icons.map((record) => [record.slug, record]))
  const evidenceById = new Map(evidence.cases.map((entry) => [entry.id, entry]))

  assert.equal(manifest.schema_version, 1)
  assert.equal(manifest.suite, 'drawio-ai-icon-catalog')
  assert.equal(manifest.canonical_source, 'YAML')
  assert.equal(manifest.artifact_root, '.drawio-tmp/ai-icons')
  assert.equal(manifest.runtime_network, false)
  assert.deepEqual(manifest.cases.map((entry) => entry.id).sort(), EXPECTED_CASES)
  assert.equal(new Set(manifest.cases.map((entry) => entry.source_file)).size, EXPECTED_CASES.length)
  assert.equal(evidence.desktop.version, '30.3.14')
  assert.equal(evidence.model_executed.status, 'missing evidence')
  assert.deepEqual(evidence.cases.map((entry) => entry.id).sort(), EXPECTED_CASES)

  const coveredFeatures = new Set()
  for (const entry of manifest.cases) {
    assert.equal(entry.evidence.recorded_fixture, true, `${entry.id} must remain a recorded fixture`)
    assert.equal(entry.evidence.command_executed, true, `${entry.id} CLI evidence must be explicit`)
    assert.equal(entry.evidence.desktop_executed, true, `${entry.id} Desktop evidence must be explicit`)
    assert.equal(entry.evidence.model_executed, 'missing evidence')
    assert.match(entry.source_file, /^skills\/drawio\/evals\/fixtures\/ai-icons-[a-z-]+\.yaml$/)
    assert.match(entry.preview_file, /^\.drawio-tmp\/ai-icons\/[a-z-]+\.preview\.png$/)
    assert.match(entry.review_file, /^\.drawio-tmp\/ai-icons\/reviews\/[a-z-]+\.visual-review\.json$/)

    const sourcePath = resolve(PROJECT_ROOT, entry.source_file)
    const spec = parseSpecYaml(readFileSync(sourcePath, 'utf8'))
    const xml = specToDrawioXml(spec)
    assert.equal(validateXml(xml).valid, true, `${entry.id} must produce valid draw.io XML`)
    assert.match(xml, /image=data:image\/svg\+xml,/, `${entry.id} must embed SVG data URIs`)
    assert.doesNotMatch(xml, /image=https?:\/\//i, `${entry.id} must not emit remote images`)

    const desktopEvidence = evidenceById.get(entry.id)
    assert.equal(desktopEvidence.png.has_iend, true)
    assert.ok(Math.max(desktopEvidence.png.width, desktopEvidence.png.height) <= 2000)
    assert.ok(desktopEvidence.png.bytes > 0)
    assert.ok(desktopEvidence.png.idat_bytes > 0)
    assert.match(desktopEvidence.png.sha256, /^[a-f0-9]{64}$/)
    assert.ok(desktopEvidence.pixel_sample.non_white > 0)
    assert.ok(desktopEvidence.pixel_sample.unique_colors > 1)
    assert.equal(desktopEvidence.visual_adjudication, 'missing evidence')
    assert.deepEqual(desktopEvidence.issues, [])

    for (const feature of entry.features) coveredFeatures.add(feature)
    for (const [slug, features] of Object.entries(entry.catalog_feature_icons || {})) {
      const record = iconsBySlug.get(slug)
      assert.ok(record, `${entry.id} references catalog slug ${slug}`)
      for (const feature of features) {
        assert.match(record.svg, FEATURE_PATTERNS[feature], `${slug} must preserve ${feature}`)
      }
    }
  }

  assert.deepEqual([...coveredFeatures].sort(), Object.keys(FEATURE_PATTERNS).sort())
})

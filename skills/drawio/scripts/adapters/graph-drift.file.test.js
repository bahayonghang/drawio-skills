import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import yaml from 'js-yaml'

import {
  compareGraphProjections,
  parseComposeConfig,
  parseDockerInspectSnapshot,
  projectDriftReportToSpec,
  renderDriftGraph
} from './index.js'

const fixtureUrl = new URL('../../references/examples/importers/live/', import.meta.url)

function readText(name) {
  return readFileSync(new URL(name, fixtureUrl), 'utf8')
}

test('file-backed declared/live drift case pins sanitized report, canonical spec, and C0 evidence', async () => {
  const baseline = parseComposeConfig(readText('drift-declared-compose.yaml'), {
    locator: 'fixtures/drift-declared-compose.yaml'
  })
  const observed = parseDockerInspectSnapshot(readText('docker-inspect.json'), {
    locator: 'fixtures/docker-inspect.json'
  })
  const report = compareGraphProjections(baseline, observed, {
    baselineContext: 'shop-production',
    observedContext: 'shop-production'
  })
  const spec = projectDriftReportToSpec(report, baseline, observed, {
    locator: 'fixtures/compose-drift-report.json'
  })
  const expectedReport = JSON.parse(readText('compose-drift-report.json'))
  const expectedSpec = yaml.load(readText('compose-drift.spec.yaml'))
  const evidence = JSON.parse(readText('compose-drift-evidence.json'))

  assert.deepEqual(report, expectedReport)
  assert.deepEqual(spec, expectedSpec)
  assert.deepEqual(evidence.rendererIds, {
    nodes: spec.nodes.map((node) => node.id),
    edges: spec.edges.map((edge) => edge.id)
  })
  assert.equal(evidence.outputs.preview, null)
  assert.equal(evidence.execution.providerCli, 'missing evidence')
  assert.equal(evidence.execution.desktop, 'missing evidence')
  assert.equal(evidence.execution.model, 'missing evidence')
  assert.equal(evidence.stopping.autonomousRoundLimit, 2)
  assert.equal(evidence.stopping.userRoundLimit, 5)

  const rendered = await renderDriftGraph(report, baseline, observed, {
    locator: 'fixtures/compose-drift-report.json'
  })
  assert.equal(rendered.layoutApplied, true)
  assert.equal(rendered.xmlValidation.valid, true)

  const serialized = JSON.stringify({ report, spec, evidence, xml: rendered.xml })
  for (const forbidden of [
    'docker-secret-must-not-cross',
    'docker-label-secret-must-not-cross',
    'host-path-must-not-cross',
    'container-web-1-must-not-cross',
    'standalone-container-must-not-cross'
  ]) {
    assert.equal(serialized.includes(forbidden), false, forbidden)
  }
})

import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'

import { parseDocumentYaml } from '../dsl/document-spec.js'
import { validateDrawioDocument } from '../dsl/multi-page.js'

const CLI = resolve('skills/drawio/scripts/cli.js')
const BUNDLE = readFileSync(new URL('./fixtures/bundle.yaml', import.meta.url), 'utf8')

function run(args) {
  return execFileSync(process.execPath, [CLI, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

function runResult(args) {
  return spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' })
}

test('CLI runs all six approved postprocess operations and writes deterministic sidecars', () => {
  const directory = mkdtempSync(join(tmpdir(), 'drawio-postprocess-cli-'))
  const input = join(directory, 'bundle.yaml')
  const map = join(directory, 'labels.json')
  const metrics = join(directory, 'metrics.json')
  writeFileSync(input, BUNDLE, 'utf8')
  writeFileSync(map, JSON.stringify({ 'context/gateway': 'Gateway CLI' }), 'utf8')
  writeFileSync(metrics, JSON.stringify({ 'context/gateway': 0, 'context/cache': 10, unmatched: 5 }), 'utf8')

  try {
    const mermaid = join(directory, 'bundle.mmd')
    const explain = join(directory, 'bundle.md')
    const relabel = join(directory, 'relabel.spec.yaml')
    const restyle = join(directory, 'restyle.drawio')
    const heatmap = join(directory, 'heatmap.spec.yaml')
    const html = join(directory, 'bundle.html')

    run(['postprocess', 'mermaid', input, mermaid, '--page', 'context', '--direction', 'TB'])
    run(['postprocess', 'explain', input, explain, '--all-pages'])
    run(['postprocess', 'relabel', input, relabel, '--map', map])
    run(['postprocess', 'restyle', input, restyle, '--preset', 'corporate'])
    run(['postprocess', 'heatmap', input, heatmap, '--metrics', metrics, '--palette', 'heat'])
    run(['postprocess', 'html', input, html, '--title', 'Offline bundle'])

    assert.match(readFileSync(mermaid, 'utf8'), /^flowchart TB/)
    assert.match(readFileSync(explain, 'utf8'), /^# Postprocess bundle fixture/)
    assert.equal(parseDocumentYaml(readFileSync(relabel, 'utf8')).pages[0].nodes[0].label, 'Gateway CLI')
    assert.equal(validateDrawioDocument(readFileSync(restyle, 'utf8')).valid, true)
    assert.equal(parseDocumentYaml(readFileSync(heatmap, 'utf8')).pages[0].nodes[0].style.fillColor, '#FFF7EC')
    assert.match(readFileSync(html, 'utf8'), /^<!doctype html>/)

    for (const [path, operation] of [
      [mermaid, 'mermaid'], [explain, 'explain'], [relabel, 'relabel'], [restyle, 'restyle'], [heatmap, 'heatmap'], [html, 'html']
    ]) {
      const sidecar = `${path}.postprocess.json`
      const metadata = JSON.parse(readFileSync(sidecar, 'utf8'))
      assert.equal(metadata.operation, operation)
      assert.equal(JSON.stringify(metadata).includes(directory), false)
      if (operation === 'relabel') assert.match(metadata.auxiliaryDigests.map, /^sha256:[0-9a-f]{64}$/)
      if (operation === 'heatmap') {
        assert.match(metadata.auxiliaryDigests.metrics, /^sha256:[0-9a-f]{64}$/)
        assert.deepEqual(metadata.diagnostics.unmatched, ['unmatched'])
      }
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('CLI rejects selector conflicts, source aliasing, deferred operations, and mutator stdout', () => {
  const directory = mkdtempSync(join(tmpdir(), 'drawio-postprocess-errors-'))
  const input = join(directory, 'bundle.yaml')
  const map = join(directory, 'labels.json')
  writeFileSync(input, BUNDLE, 'utf8')
  writeFileSync(map, JSON.stringify({ 'context/gateway': 'Gateway CLI' }), 'utf8')

  try {
    const conflict = runResult(['postprocess', 'html', input, join(directory, 'x.html'), '--page', 'context', '--all-pages'])
    assert.notEqual(conflict.status, 0)
    assert.match(conflict.stderr, /--all-pages cannot be combined with --page/i)

    const alias = runResult(['postprocess', 'mermaid', input, input])
    assert.notEqual(alias.status, 0)
    assert.match(alias.stderr, /must not overwrite the source/i)

    const deferred = runResult(['postprocess', 'runbook', input, join(directory, 'runbook.html')])
    assert.notEqual(deferred.status, 0)
    assert.match(deferred.stderr, /unsupported postprocess operation.*runbook/i)

    const stdout = runResult(['postprocess', 'relabel', input, '-', '--map', map])
    assert.notEqual(stdout.status, 0)
    assert.match(stdout.stderr, /canonical postprocess output requires an explicit file path/i)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('CLI records Mermaid downgrade warnings and preserves auxiliary input files', () => {
  const directory = mkdtempSync(join(tmpdir(), 'drawio-postprocess-inputs-'))
  const input = join(directory, 'unsupported.yaml')
  const mermaid = join(directory, 'unsupported.mmd')
  const mapAsOutput = join(directory, 'protected-map.yaml')
  const outputWithSidecarMap = join(directory, 'sidecar-output.yaml')
  const sidecarMap = `${outputWithSidecarMap}.postprocess.json`
  const mapText = JSON.stringify({ api: 'Renamed' })
  writeFileSync(input, 'nodes:\n  - id: api\n    label: API\n    type: document\nedges: []\nmodules: []\n', 'utf8')
  writeFileSync(mapAsOutput, mapText, 'utf8')
  writeFileSync(sidecarMap, mapText, 'utf8')

  try {
    run(['postprocess', 'mermaid', input, mermaid])
    const metadata = JSON.parse(readFileSync(`${mermaid}.postprocess.json`, 'utf8'))
    assert.equal(metadata.diagnostics.warnings.length, 1)
    assert.match(metadata.diagnostics.warnings[0], /unsupported Mermaid type.*document/i)

    const outputAlias = runResult(['postprocess', 'relabel', input, mapAsOutput, '--map', mapAsOutput])
    assert.notEqual(outputAlias.status, 0)
    assert.match(outputAlias.stderr, /must not overwrite the source/i)
    assert.equal(readFileSync(mapAsOutput, 'utf8'), mapText)

    const sidecarAlias = runResult(['postprocess', 'relabel', input, outputWithSidecarMap, '--map', sidecarMap])
    assert.notEqual(sidecarAlias.status, 0)
    assert.match(sidecarAlias.stderr, /must not overwrite the source/i)
    assert.equal(readFileSync(sidecarMap, 'utf8'), mapText)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

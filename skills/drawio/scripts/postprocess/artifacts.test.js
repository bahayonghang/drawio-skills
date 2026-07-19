import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { normalizePostprocessInput } from './input.js'
import {
  assertDistinctPostprocessPaths,
  buildPostprocessMetadata,
  derivePostprocessSidecarPath,
  serializePostprocessMetadata,
  writePostprocessArtifact
} from './artifacts.js'

const bundleText = readFileSync(new URL('./fixtures/bundle.yaml', import.meta.url), 'utf8')
const bundle = normalizePostprocessInput(bundleText)

test('builds deterministic path-free postprocess provenance from canonical input bytes', () => {
  const options = {
    direction: 'TB',
    page: 'context',
    nested: { z: 2, a: 1 },
    outputPath: 'C:\\Users\\lyh\\secret.html',
    apiToken: 'do-not-record'
  }
  const first = buildPostprocessMetadata({
    operation: 'mermaid',
    input: bundle,
    options,
    auxiliaryInputs: { metrics: '{"context/gateway":5}' },
    outputKind: 'mermaid',
    evidence: 'command-executed'
  })
  const second = buildPostprocessMetadata({
    operation: 'mermaid',
    input: bundle,
    options,
    auxiliaryInputs: { metrics: '{"context/gateway":5}' },
    outputKind: 'mermaid',
    evidence: 'command-executed'
  })
  const changedAuxiliaryInput = buildPostprocessMetadata({
    operation: 'mermaid',
    input: bundle,
    options,
    auxiliaryInputs: { metrics: '{"context/gateway":6}' },
    outputKind: 'mermaid',
    evidence: 'command-executed'
  })

  assert.deepEqual(first, second)
  assert.equal(first.version, 1)
  assert.equal(first.inputKind, 'multi-page-v1')
  assert.deepEqual(first.pages, [{ index: 0, id: 'context', name: 'Context' }])
  assert.match(first.inputDigest, /^sha256:[0-9a-f]{64}$/)
  assert.match(first.auxiliaryDigests.metrics, /^sha256:[0-9a-f]{64}$/)
  assert.notEqual(first.auxiliaryDigests.metrics, changedAuxiliaryInput.auxiliaryDigests.metrics)
  assert.deepEqual(first.options, { direction: 'TB', nested: { a: 1, z: 2 }, page: 'context' })
  const serialized = serializePostprocessMetadata(first)
  assert.equal(serialized.includes('Users'), false)
  assert.equal(serialized.includes('do-not-record'), false)
  assert.equal(serialized.includes('context/gateway'), false)
  assert.equal(serialized.includes('timestamp'), false)
})

test('derives an adjacent postprocess sidecar and atomically writes without source aliasing', () => {
  const directory = mkdtempSync(join(tmpdir(), 'drawio-postprocess-'))
  const source = join(directory, 'source.yaml')
  const output = join(directory, 'viewer.html')
  writeFileSync(source, bundleText, 'utf8')

  try {
    assert.equal(derivePostprocessSidecarPath(output), join(directory, 'viewer.html.postprocess.json'))
    assert.throws(() => assertDistinctPostprocessPaths(source, source), /must not overwrite the source/i)
    assert.throws(() => writePostprocessArtifact(source, 'changed', { inputPath: source }), /must not overwrite the source/i)
    assert.equal(readFileSync(source, 'utf8'), bundleText)

    writePostprocessArtifact(output, '<!doctype html>\n', { inputPath: source })
    assert.equal(readFileSync(output, 'utf8'), '<!doctype html>\n')
    assert.equal(readdirSync(directory).some((name) => name.includes('.postprocess-tmp-')), false)
    assert.equal(existsSync(output), true)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

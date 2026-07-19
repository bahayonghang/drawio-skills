import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { normalizePostprocessInput } from './input.js'
import { explainDocument, renderMermaid, renderMermaidProjection } from './projection.js'

const bundle = normalizePostprocessInput(
  readFileSync(new URL('./fixtures/bundle.yaml', import.meta.url), 'utf8')
)

test('renders deterministic Mermaid subgraphs in page and object order with structured links', () => {
  const first = renderMermaid(bundle, { direction: 'TB' })
  const second = renderMermaid(bundle, { direction: 'TB' })

  assert.equal(first, second)
  assert.match(first, /^flowchart TB\n/)
  assert.ok(first.indexOf('subgraph context') < first.indexOf('subgraph detail'))
  assert.ok(first.indexOf('context_gateway["Gateway"]') < first.indexOf('context_cache[("Redis")]'))
  assert.match(first, /context_gateway -->\|query\| context_cache/)
  assert.match(first, /context_gateway -.-> detail_gateway/)
  assert.match(first, /structured-link context\/gateway -> detail\/gateway/)
})

test('escapes Mermaid labels and reports bounded semantic downgrade warnings', () => {
  const value = {
    meta: {},
    nodes: [{ id: 'unsafe', label: 'A"\\B\nC|D', type: 'document' }],
    edges: [],
    modules: []
  }
  const { text, warnings } = renderMermaidProjection(value)

  assert.match(text, /A\\"\\\\B<br>C&#124;D/)
  assert.equal(text.includes('C|D'), false)
  assert.equal(warnings.length, 1)
  assert.match(warnings[0], /document/)
})

test('explains only observable canonical fields and keeps author order', () => {
  const text = explainDocument(bundle)

  assert.match(text, /^# Postprocess bundle fixture\n/)
  assert.ok(text.indexOf('## Page: Context') < text.indexOf('## Page: Detail'))
  assert.match(text, /- `gateway`: `Gateway` \(service\); icon `lucide\.server-cog`; identity `fixture:context\/gateway`/)
  assert.match(text, /- `context\/gateway` -> `detail\/gateway`/)
  assert.doesNotMatch(text, /should|intended|risk|owner|executive|architecture intent/i)
})

test('uses a safe Markdown code-span fence for labels containing backticks', () => {
  const text = explainDocument({
    meta: { title: 'Backtick fixture' },
    nodes: [{ id: 'code', label: 'A`B', type: 'service' }],
    edges: [],
    modules: []
  })

  assert.match(text, /`` A`B ``/)
  assert.equal(text.includes('`A\\`B`'), false)
})

test('supports deterministic selected-page Mermaid and Markdown projections', () => {
  assert.equal(renderMermaid(bundle, { page: 'detail' }), renderMermaid(bundle, { page: 1 }))
  const text = explainDocument(bundle, { page: 'detail' })
  assert.match(text, /^# Detail\n/)
  assert.doesNotMatch(text, /## Page: Context/)
})

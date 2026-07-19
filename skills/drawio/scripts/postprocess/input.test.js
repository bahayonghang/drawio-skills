import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { serializeDocumentSpecYaml, serializeSpecYaml } from '../runtime/artifacts.js'
import { parseDocumentYaml } from '../dsl/document-spec.js'
import {
  mapPostprocessPages,
  normalizePostprocessInput,
  selectPostprocessPages
} from './input.js'

const fixture = (name) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')

test('normalizes legacy YAML without changing its canonical serialization', () => {
  const normalized = normalizePostprocessInput(fixture('legacy.yaml'))

  assert.equal(normalized.kind, 'legacy-single-page')
  assert.equal(normalized.legacy, true)
  assert.equal(serializeSpecYaml(normalized.spec), serializeSpecYaml(parseDocumentYaml(fixture('legacy.yaml')).spec))
  assert.deepEqual(selectPostprocessPages(normalized).pages.map((page) => page.id), ['page-1'])
})

test('preserves bundle order, page-local identity, links, icons, adapter, and academic metadata', () => {
  const normalized = normalizePostprocessInput(fixture('bundle.yaml'))

  assert.equal(normalized.kind, 'multi-page-v1')
  assert.deepEqual(normalized.pages.map((page) => page.id), ['context', 'detail'])
  assert.equal(normalized.pages[0].nodes[0].id, 'gateway')
  assert.equal(normalized.pages[1].nodes[0].id, 'gateway')
  assert.deepEqual(normalized.links, [
    {
      from: { pageId: 'context', objectId: 'gateway' },
      to: { pageId: 'detail', objectId: 'gateway' }
    }
  ])
  assert.deepEqual(normalized.pages[0].nodes.map((node) => node.icon), [
    'lucide.server-cog',
    'redis.server',
    'lobe.openai',
    'aws.lambda'
  ])
  assert.equal(normalized.pages[0].meta.adapter.locator, 'fixtures/context.yaml')
  assert.equal(normalized.pages[1].meta.profile, 'academic-paper')
  assert.equal(
    serializeDocumentSpecYaml(normalized),
    serializeDocumentSpecYaml(parseDocumentYaml(fixture('bundle.yaml')))
  )
})

test('selects a page by index, id, or unique name and rejects page/all-pages conflicts', () => {
  const normalized = normalizePostprocessInput(fixture('bundle.yaml'))

  assert.deepEqual(selectPostprocessPages(normalized, { page: 1 }).pages.map((page) => page.id), ['detail'])
  assert.deepEqual(selectPostprocessPages(normalized, { page: 'context' }).pages.map((page) => page.id), ['context'])
  assert.deepEqual(selectPostprocessPages(normalized, { page: 'Detail' }).pages.map((page) => page.id), ['detail'])
  assert.throws(() => selectPostprocessPages(normalized, { page: 'context', allPages: true }), /cannot combine page and allPages/i)
})

test('maps selected pages without mutating the source or changing unselected pages and links', () => {
  const normalized = normalizePostprocessInput(fixture('bundle.yaml'))
  const original = structuredClone(normalized)
  const mapped = mapPostprocessPages(
    normalized,
    (page) => ({ ...page, meta: { ...page.meta, title: `${page.meta.title} mapped` } }),
    { page: 'detail' }
  )

  assert.deepEqual(normalized, original)
  assert.equal(mapped.pages[0].meta.title, 'Context')
  assert.equal(mapped.pages[1].meta.title, 'Detail mapped')
  assert.deepEqual(mapped.links, normalized.links)
})

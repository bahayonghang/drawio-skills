import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { normalizePostprocessInput } from './input.js'
import { renderHtml } from './html.js'

const bundle = normalizePostprocessInput(
  readFileSync(new URL('./fixtures/bundle.yaml', import.meta.url), 'utf8')
)

test('renders deterministic self-contained HTML with tabs, zoom, search, inline SVG, and safe page links', async () => {
  const first = await renderHtml(bundle, { title: 'Offline viewer', search: 'Gateway' })
  const second = await renderHtml(bundle, { title: 'Offline viewer', search: 'Gateway' })

  assert.equal(first, second)
  assert.match(first, /^<!doctype html>\n/)
  assert.match(first, /id="page-toggle-context"/)
  assert.match(first, /id="page-toggle-detail"/)
  assert.match(first, /type="search"/)
  assert.match(first, /<ol class="search-results">/)
  assert.match(first, /<label for="page-toggle-context"[^>]*>Context: Gateway<\/label>/)
  assert.match(first, /<label for="page-toggle-detail"[^>]*>Detail: Detail gateway<\/label>/)
  assert.match(first, /data-zoom="75"/)
  assert.match(first, /data-zoom="125"/)
  assert.match(first, /<svg\b/)
  assert.match(first, /<label for="page-toggle-detail"[^>]*data-page-link="data:page\/id,detail"/)
  assert.doesNotMatch(first, /<script\b|\bon[a-z]+\s*=|javascript:|(?:href|src)="https?:\/\//i)
  assert.doesNotMatch(first, /fonts\.googleapis|cdnjs|unpkg|data:text\/html/i)
})

test('renders only the explicitly selected page and escapes HTML title/search payloads', async () => {
  const html = await renderHtml(bundle, { page: 'detail', title: 'A < B & C', search: '"quoted"' })

  assert.match(html, /id="page-toggle-detail"/)
  assert.doesNotMatch(html, /id="page-toggle-context"/)
  assert.match(html, /A &lt; B &amp; C/)
  assert.match(html, /value="&quot;quoted&quot;"/)
})

test('rejects executable labels, unsafe page ids, and unsafe rendered SVG payloads', async () => {
  const unsafe = normalizePostprocessInput({
    meta: {},
    nodes: [{ id: 'node', label: '<script>alert(1)</script>' }],
    edges: [],
    modules: []
  })
  await assert.rejects(() => renderHtml(unsafe), /unsafe HTML text.*label/i)
  await assert.rejects(() => renderHtml(bundle, { title: 'javascript:bad' }), /unsafe HTML text/i)
})

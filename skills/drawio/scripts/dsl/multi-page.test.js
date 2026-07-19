import test, { describe } from 'node:test'
import assert from 'node:assert/strict'

import {
  compressDiagramXml,
  createMultiPageDrawioFileContent,
  drawioToDocumentSpec,
  renderDocumentFile,
  renderDocumentPages,
  validateDrawioDocument
} from './multi-page.js'
import { normalizeDocumentSpec } from './document-spec.js'

function makeDocument() {
  return normalizeDocumentSpec({
    schemaVersion: 1,
    meta: { title: 'Multi page', source: 'generated' },
    pages: [
      {
        id: 'context',
        name: 'Context <A>',
        meta: { theme: 'tech-blue', layout: 'horizontal' },
        nodes: [
          { id: 'api', label: 'API', type: 'service' },
          { id: 'db', label: 'DB', type: 'database' }
        ],
        edges: [{ id: 'calls', from: 'api', to: 'db', type: 'data' }],
        modules: []
      },
      {
        id: 'detail',
        name: 'Detail',
        meta: { theme: 'dark', layout: 'vertical' },
        nodes: [{ id: 'api', label: 'Detail API', type: 'service' }],
        edges: [],
        modules: []
      }
    ],
    links: [{ from: { pageId: 'context', objectId: 'api' }, to: { pageId: 'detail', objectId: 'api' } }]
  })
}

describe('multi-page renderer and XML validation', () => {
  test('renders ordered pages with canonical wrappers and page links', async () => {
    const document = makeDocument()
    const pages = await renderDocumentPages(document)
    assert.deepEqual(pages.map((page) => page.id), ['context', 'detail'])
    assert.match(pages[0].xml, /<UserObject[^>]+dataPageId="context"[^>]+dataObjectId="api"/)
    assert.match(pages[0].xml, /link="data:page\/id,detail"[^>]+dataTargetObjectId="api"/)
    assert.match(pages[0].xml, /dataObjectKind="edge"/)

    const file = createMultiPageDrawioFileContent(pages, { documentMeta: document.meta })
    assert.ok(file.indexOf('id="context"') < file.indexOf('id="detail"'))
    assert.equal((file.match(/<diagram\b/g) || []).length, 2)
    assert.equal(validateDrawioDocument(file).valid, true)
  })

  test('validates each page independently so repeated root cells are allowed', async () => {
    const pages = await renderDocumentPages(makeDocument())
    const file = createMultiPageDrawioFileContent(pages)
    const result = validateDrawioDocument(file)
    assert.equal(result.valid, true)
    assert.equal(result.pages.length, 2)
    assert.deepEqual(result.pages.map((page) => page.errors), [[], []])
  })
})

describe('multi-page import and round-trip', () => {
  test('restores page metadata, object ids, edge ids, links, and order', async () => {
    const original = makeDocument()
    const file = await renderDocumentFile(original)
    const imported = drawioToDocumentSpec(file)
    assert.equal(imported.meta.title, 'Multi page')
    assert.deepEqual(imported.pages.map((page) => page.id), ['context', 'detail'])
    assert.equal(imported.pages[0].name, 'Context <A>')
    assert.deepEqual(imported.pages[0].meta, original.pages[0].meta)
    assert.deepEqual(imported.pages[0].nodes.map((node) => node.id), ['api', 'db'])
    assert.equal(imported.pages[0].edges[0].id, 'calls')
    assert.deepEqual(imported.links, original.links)
  })

  test('round-trips uncompressed, compressed, and mixed page contents', async () => {
    const original = makeDocument()
    const pages = await renderDocumentPages(original)
    const compressed = pages.map((page, index) => {
      const content = index === 0 ? compressDiagramXml(page.xml) : page.xml
      return { ...page, xml: content }
    })
    const mixed = createMultiPageDrawioFileContent(compressed, { documentMeta: original.meta })
    const imported = drawioToDocumentSpec(mixed)
    assert.deepEqual(imported.pages.map((page) => page.id), ['context', 'detail'])
    assert.deepEqual(imported.pages.map((page) => page.nodes.map((node) => node.id)), [
      ['api', 'db'],
      ['api']
    ])
    assert.deepEqual(imported.links, original.links)
  })

  test('assigns deterministic ids to pages without ids and rejects unsafe or duplicate ids', async () => {
    const pages = await renderDocumentPages(makeDocument())
    const file = createMultiPageDrawioFileContent(pages).replace('id="detail"', 'id="context"')
    assert.throws(() => drawioToDocumentSpec(file), /pages\[1\]\.id.*duplicate/i)

    const unsafe = file.replace('id="context"', 'id="bad:page"')
    assert.throws(() => drawioToDocumentSpec(unsafe), /pages\[0\]\.id.*safe page id/i)
  })
})

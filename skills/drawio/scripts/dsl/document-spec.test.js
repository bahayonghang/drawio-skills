import test, { describe } from 'node:test'
import assert from 'node:assert/strict'

import { parseSpecYaml } from './spec-to-drawio.js'
import { serializeSpecYaml, buildArchMetadata } from '../runtime/artifacts.js'
import {
  buildPageLink,
  classifyDocumentSpec,
  normalizeDocumentSpec,
  resolveDocumentObject,
  selectDocumentPage,
  validateDocumentSpec
} from './document-spec.js'

const page = (id, name = id) => ({
  id,
  name,
  nodes: [{ id: 'api', label: `${name} API`, type: 'service' }],
  modules: [],
  edges: []
})

const bundle = {
  schemaVersion: 1,
  meta: { title: 'Ordered document', source: 'generated' },
  pages: [page('context', 'Context'), page('detail', 'Detail')],
  links: [{ from: { pageId: 'context', objectId: 'api' }, to: { pageId: 'detail', objectId: 'api' } }]
}

describe('document spec classification and normalization', () => {
  test('freezes the legacy YAML and arch v1 baseline before bundle routing', () => {
    const value = parseSpecYaml(
      'meta:\n  theme: dark\nnodes:\n  - id: api\n    label: API\n    type: service\nedges: []\nmodules: []\n'
    )
    assert.equal(
      serializeSpecYaml(value),
      'meta:\n  theme: dark\nnodes:\n  - id: api\n    label: API\n    type: service\nedges: []\nmodules: []\n'
    )
    assert.deepEqual(buildArchMetadata(value, { outputFile: 'legacy.drawio' }), {
      version: 1,
      title: 'legacy',
      type: 'diagram',
      source: 'generated',
      profile: 'default',
      theme: 'dark',
      layout: 'horizontal',
      counts: { nodes: 1, edges: 0, modules: 0 },
      nodes: [{ id: 'api', label: 'API', type: 'service' }],
      edges: [],
      modules: []
    })
  })

  test('preserves legacy single-page shape and does not add bundle fields', () => {
    const value = parseSpecYaml('meta:\n  theme: dark\nnodes:\n  - id: api\n    label: API\n')
    assert.equal(classifyDocumentSpec(value), 'legacy-single-page')
    const normalized = normalizeDocumentSpec(value)
    assert.equal(normalized.kind, 'legacy-single-page')
    assert.equal(normalized.legacy, true)
    assert.deepEqual(normalized.spec, value)
    assert.equal('schemaVersion' in normalized.spec, false)
    assert.equal('pages' in normalized.spec, false)
  })

  test('accepts explicit bundle v1 while preserving page and object order', () => {
    assert.equal(classifyDocumentSpec(bundle), 'multi-page-v1')
    const normalized = normalizeDocumentSpec(bundle)
    assert.equal(normalized.kind, 'multi-page-v1')
    assert.equal(normalized.schemaVersion, 1)
    assert.deepEqual(normalized.pages.map((item) => item.id), ['context', 'detail'])
    assert.equal(normalized.pages[0].nodes[0].id, 'api')
    assert.equal(normalized.links[0].to.pageId, 'detail')
  })

  test('rejects unknown or mixed document versions instead of guessing', () => {
    assert.throws(() => classifyDocumentSpec({ schemaVersion: 2, pages: [] }), /schemaVersion.*1/)
    assert.throws(() => classifyDocumentSpec({ pages: [page('p')] }), /pages.*schemaVersion/)
    assert.throws(
      () => classifyDocumentSpec({ schemaVersion: 1, pages: [page('p')], nodes: [] }),
      /top-level.*nodes|mixed/i
    )
  })
})

describe('document identity and page links', () => {
  test('allows object ids to repeat across pages but rejects same-page cross-kind collisions', () => {
    assert.doesNotThrow(() => validateDocumentSpec(bundle))
    const invalid = structuredClone(bundle)
    invalid.pages[0].modules = [{ id: 'api', label: 'API module' }]
    assert.throws(() => validateDocumentSpec(invalid), /pages\[0\].*duplicate object id.*api/i)
  })

  test('requires explicit multi-page edge ids and validates edge references', () => {
    const missingId = structuredClone(bundle)
    missingId.pages[0].edges = [{ from: 'api', to: 'api' }]
    assert.throws(() => validateDocumentSpec(missingId), /pages\[0\]\.edges\[0\]\.id.*required/i)

    const dangling = structuredClone(bundle)
    dangling.pages[0].edges = [{ id: 'calls', from: 'missing', to: 'api' }]
    assert.throws(() => validateDocumentSpec(dangling), /pages\[0\]\.edges\[0\]\.from.*missing/i)
  })

  test('rejects missing, duplicate, wrong-kind and unsafe links', () => {
    const missing = structuredClone(bundle)
    missing.links[0].to.objectId = 'missing'
    assert.throws(() => validateDocumentSpec(missing), /links\[0\]\.to.*missing/i)

    const duplicate = structuredClone(bundle)
    duplicate.links.push(structuredClone(duplicate.links[0]))
    assert.throws(() => validateDocumentSpec(duplicate), /links\[1\].*duplicate/i)

    const wrongKind = structuredClone(bundle)
    wrongKind.pages[0].edges = [{ id: 'edge', from: 'api', to: 'api' }]
    wrongKind.links[0].from.objectId = 'edge'
    assert.throws(() => validateDocumentSpec(wrongKind), /links\[0\]\.from.*node or module/i)

    assert.throws(() => buildPageLink('javascript:alert(1)'), /unsafe page id/i)
    assert.throws(() => buildPageLink('page</diagram>'), /unsafe page id/i)
  })

  test('encodes and resolves structured page links without raw URI fallback', () => {
    assert.equal(buildPageLink('detail-page'), 'data:page/id,detail-page')
    const normalized = normalizeDocumentSpec(bundle)
    assert.deepEqual(resolveDocumentObject(normalized, { pageId: 'detail', objectId: 'api' }), {
      pageId: 'detail',
      objectId: 'api',
      kind: 'node',
      object: normalized.pages[1].nodes[0]
    })
  })
})

describe('page selectors', () => {
  test('selects by zero-based index, then id, then unique name', () => {
    const normalized = normalizeDocumentSpec(bundle)
    assert.equal(selectDocumentPage(normalized, 1).id, 'detail')
    assert.equal(selectDocumentPage(normalized, 'context').id, 'context')
    assert.equal(selectDocumentPage(normalized, 'Detail').id, 'detail')
  })

  test('reports ambiguous duplicate page names with candidate ids', () => {
    const duplicateNames = structuredClone(bundle)
    duplicateNames.pages[1].name = duplicateNames.pages[0].name
    const normalized = normalizeDocumentSpec(duplicateNames)
    assert.throws(() => selectDocumentPage(normalized, 'Context'), /ambiguous.*context.*detail/i)
  })
})

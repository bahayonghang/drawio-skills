import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { gzipSync, gunzipSync } from 'node:zlib'

import {
  createAiIconCatalogLoader,
  getAiIcon,
  loadAiIconCatalog,
  searchAiIcons
} from './ai-icon-catalog.js'

const CATALOG_BYTES = readFileSync(new URL('../../assets/catalog/ai-icons.json.gz', import.meta.url))

function mutatedCatalog(change) {
  const catalog = JSON.parse(gunzipSync(CATALOG_BYTES).toString('utf8'))
  change(catalog)
  return gzipSync(JSON.stringify(catalog))
}

test('bundled AI icon catalog loads the fixed 309 immutable records', () => {
  const catalog = loadAiIconCatalog()
  assert.equal(catalog.icons.length, 309)
  assert.equal(catalog.icons[0].slug, 'ace')
  assert.equal(catalog.icons.at(-1).slug, 'zhipu')
  assert.equal(Object.isFrozen(catalog), true)
  assert.equal(Object.isFrozen(catalog.icons[0]), true)
  assert.equal(getAiIcon('openai').slug, 'openai')
  assert.equal(getAiIcon('definitely-not-real'), null)
})

test('AI icon loader caches one successful read and one hard failure', () => {
  let reads = 0
  const loader = createAiIconCatalogLoader({
    readCatalog: () => {
      reads++
      return CATALOG_BYTES
    }
  })
  assert.equal(loader.get('openai').slug, 'openai')
  assert.equal(loader.get('anthropic').slug, 'anthropic')
  assert.equal(loader.load().icons.length, 309)
  assert.equal(reads, 1)

  let corruptReads = 0
  const corrupt = createAiIconCatalogLoader({
    readCatalog: () => {
      corruptReads++
      return Buffer.from('not-gzip')
    }
  })
  assert.throws(() => corrupt.get('openai'), /AI icon catalog.*loaded/i)
  assert.throws(() => corrupt.load(), /AI icon catalog.*loaded/i)
  assert.equal(corruptReads, 1)
})

test('searchAiIcons ranks exact and edit-distance suggestions deterministically', () => {
  assert.deepEqual(searchAiIcons('openai', { limit: 1 })[0], {
    name: 'lobe.openai',
    title: 'openai',
    tags: ['ai', 'brand', 'openai'],
    spec: 'icon: lobe.openai',
    score: 100
  })
  assert.equal(searchAiIcons('opnai', { limit: 3 })[0].name, 'lobe.openai')
  assert.deepEqual(searchAiIcons('', { limit: 3 }), [])
})

test('AI icon loader rejects schema, provenance, count, duplicate, and ordering drift', () => {
  const cases = [
    ['schemaVersion', (catalog) => { catalog.schemaVersion = 2 }, /schemaVersion/],
    ['provenance', (catalog) => { catalog.source.version = 'latest' }, /version/],
    ['count', (catalog) => { catalog.icons.pop() }, /309 icons/],
    ['duplicate', (catalog) => { catalog.icons[1] = catalog.icons[0] }, /duplicate slug/],
    ['ordering', (catalog) => { [catalog.icons[0], catalog.icons[1]] = [catalog.icons[1], catalog.icons[0]] }, /ASCII-sorted/]
  ]
  for (const [name, change, expected] of cases) {
    const loader = createAiIconCatalogLoader({ readCatalog: () => mutatedCatalog(change) })
    assert.throws(() => loader.load(), expected, name)
  }

  const missing = createAiIconCatalogLoader({
    readCatalog: () => { throw Object.assign(new Error('missing'), { code: 'ENOENT' }) }
  })
  assert.throws(() => missing.get('openai'), /AI icon catalog.*missing/i)
})

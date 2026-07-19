import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildArchMetadata,
  buildMultiPageArchMetadata,
  deriveArtifactPaths,
  serializeDocumentSpecYaml,
  serializeSpecYaml
} from '../skills/drawio/scripts/runtime/artifacts.js'
import { parseSpecYaml } from '../skills/drawio/scripts/dsl/spec-to-drawio.js'
import { normalizeDocumentSpec, parseDocumentYaml } from '../skills/drawio/scripts/dsl/document-spec.js'

test('deriveArtifactPaths keeps drawio stem for embedded export filenames', () => {
  const paths = deriveArtifactPaths('diagram.drawio.png')
  assert.ok(paths.drawioPath.endsWith('diagram.drawio'))
  assert.ok(paths.specPath.endsWith('diagram.spec.yaml'))
  assert.ok(paths.archPath.endsWith('diagram.arch.json'))
})

test('deriveArtifactPaths derives drawio companion for plain svg filenames', () => {
  const paths = deriveArtifactPaths('research-figure.svg')
  assert.ok(paths.drawioPath.endsWith('research-figure.drawio'))
  assert.ok(paths.specPath.endsWith('research-figure.spec.yaml'))
  assert.ok(paths.archPath.endsWith('research-figure.arch.json'))
})

test('serializeSpecYaml emits parseable canonical yaml', () => {
  const spec = {
    meta: { theme: 'tech-blue', layout: 'horizontal' },
    nodes: [{ id: 'A', label: 'Service A', type: 'service' }],
    edges: [],
    modules: []
  }

  const yamlText = serializeSpecYaml(spec)
  const parsed = parseSpecYaml(yamlText)
  assert.equal(parsed.nodes[0].id, 'A')
  assert.equal(parsed.meta.theme, 'tech-blue')
})

test('buildArchMetadata omits raw xml/style fields and keeps stable graph metadata', () => {
  const spec = {
    meta: {
      title: 'Hybrid Flow',
      profile: 'engineering-review',
      theme: 'tech-blue',
      layout: 'horizontal'
    },
    nodes: [
      { id: 'api', label: 'API Gateway', type: 'service', style: { fillColor: '#fff' } },
      { id: 'db', label: 'PostgreSQL', type: 'database', module: 'data' }
    ],
    edges: [{ from: 'api', to: 'db', type: 'data', label: 'queries', style: { strokeWidth: 2 } }],
    modules: [{ id: 'data', label: 'Data Layer', color: '$accent' }]
  }

  const arch = buildArchMetadata(spec, { outputFile: 'hybrid-flow.drawio' })
  assert.equal(arch.title, 'Hybrid Flow')
  assert.equal(arch.type, 'engineering-diagram')
  assert.deepEqual(arch.counts, { nodes: 2, edges: 1, modules: 1 })
  assert.deepEqual(arch.nodes[0], {
    id: 'api',
    label: 'API Gateway',
    type: 'service'
  })
  assert.deepEqual(arch.edges[0], {
    id: 'edge-1',
    from: 'api',
    to: 'db',
    type: 'data',
    label: 'queries'
  })
  assert.ok(!('style' in arch.nodes[0]))
  assert.ok(!('style' in arch.edges[0]))
})

test('buildArchMetadata keeps sanitized replication metadata for replicated specs', () => {
  const spec = {
    meta: {
      title: 'Replicated Figure',
      source: 'replicated',
      theme: 'tech-blue',
      replication: {
        colorMode: 'preserve-original',
        background: '#FFF7ED',
        palette: [
          {
            hex: '#FDBA74',
            role: 'warm fill',
            appliesTo: 'nodes',
            confidence: 'high',
            notes: 'main box color'
          }
        ],
        confidenceNotes: ['Footer gradient flattened to a solid cream background']
      }
    },
    nodes: [{ id: 'api', label: 'API Gateway', type: 'service', style: { fillColor: '#FDBA74' } }],
    edges: [],
    modules: []
  }

  const arch = buildArchMetadata(spec, { outputFile: 'replicated-figure.drawio' })
  assert.equal(arch.source, 'replicated')
  assert.deepEqual(arch.replication, {
    colorMode: 'preserve-original',
    background: '#FFF7ED',
    palette: [
      {
        hex: '#FDBA74',
        role: 'warm fill',
        appliesTo: 'nodes',
        confidence: 'high',
        notes: 'main box color'
      }
    ],
    confidenceNotes: ['Footer gradient flattened to a solid cream background']
  })
  assert.ok(!('style' in arch.nodes[0]), 'arch sidecar should still omit raw node styles')
})

test('multi-page artifacts keep ordered bundle YAML and arch v2 identity metadata', () => {
  const document = normalizeDocumentSpec({
    schemaVersion: 1,
    meta: { title: 'Bundle', source: 'generated' },
    pages: [
      { id: 'first', name: 'First', nodes: [{ id: 'api', label: 'API' }], edges: [], modules: [] },
      { id: 'second', name: 'Second', nodes: [{ id: 'api', label: 'API 2' }], edges: [], modules: [] }
    ],
    links: [{ from: { pageId: 'first', objectId: 'api' }, to: { pageId: 'second', objectId: 'api' } }]
  })
  const yaml = serializeDocumentSpecYaml(document)
  assert.match(yaml, /^schemaVersion: 1/m)
  assert.ok(yaml.indexOf('id: first') < yaml.indexOf('id: second'))
  assert.equal(yaml.includes('kind:'), false)

  const arch = buildMultiPageArchMetadata(document, { outputFile: 'bundle.drawio' })
  assert.equal(arch.version, 2)
  assert.deepEqual(arch.counts, { nodes: 2, edges: 0, modules: 0 })
  assert.deepEqual(arch.pages.map((page) => page.id), ['first', 'second'])
  assert.deepEqual(arch.links, document.links)
  assert.equal(JSON.stringify(arch).includes('bundle.drawio'), false)
})

test('multi-page artifact serialization is deterministic and preserves document metadata', () => {
  const document = normalizeDocumentSpec({
    schemaVersion: 1,
    meta: { source: 'generated', title: 'Deterministic bundle', description: 'stable order' },
    pages: [
      { id: 'zeta', name: 'Zeta', meta: { theme: 'dark' }, nodes: [{ id: 'n', label: 'N' }], edges: [], modules: [] },
      { id: 'alpha', name: 'Alpha', meta: { theme: 'tech-blue' }, nodes: [{ id: 'n', label: 'N2' }], edges: [], modules: [] }
    ],
    links: [{ from: { pageId: 'zeta', objectId: 'n' }, to: { pageId: 'alpha', objectId: 'n' } }]
  })
  const firstYaml = serializeDocumentSpecYaml(document)
  const secondYaml = serializeDocumentSpecYaml(parseDocumentYaml(firstYaml))
  assert.equal(secondYaml, firstYaml)

  const firstArch = JSON.stringify(buildMultiPageArchMetadata(document), null, 2)
  const secondArch = JSON.stringify(buildMultiPageArchMetadata(document), null, 2)
  assert.equal(secondArch, firstArch)
  assert.match(firstYaml, /description: stable order/)
  assert.equal(firstArch.includes('timestamp'), false)
  assert.equal(firstArch.includes('absolute'), false)
})

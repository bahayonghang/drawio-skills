import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildArchMetadata,
  deriveArtifactPaths,
  serializeSpecYaml
} from '../skills/drawio/scripts/runtime/artifacts.js'
import { parseSpecYaml } from '../skills/drawio/scripts/dsl/spec-to-drawio.js'

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
    edges: [
      { from: 'api', to: 'db', type: 'data', label: 'queries', style: { strokeWidth: 2 } }
    ],
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
    nodes: [
      { id: 'api', label: 'API Gateway', type: 'service', style: { fillColor: '#FDBA74' } }
    ],
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

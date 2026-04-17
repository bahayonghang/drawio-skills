import test from 'node:test'
import assert from 'node:assert/strict'

import {
  calculateLayout,
  loadTheme,
  validateAcademicProfile,
  validateSpec,
  validateConnectionPointPolicy,
  validateEdgeQuality
} from '../skills/drawio/scripts/dsl/spec-to-drawio.js'
import { parseCsvToSpec, parseMermaidToSpec } from '../skills/drawio/scripts/adapters/index.js'

test('parseMermaidToSpec supports flowchart', () => {
  const spec = parseMermaidToSpec(`flowchart TD
    A[Start] --> B{Check}
    B --> C[Done]
  `)
  assert.equal(spec.meta.layout, 'horizontal')
  assert.equal(spec.nodes.length, 3)
  assert.equal(spec.edges.length, 2)
})

test('parseMermaidToSpec supports sequenceDiagram', () => {
  const spec = parseMermaidToSpec(`sequenceDiagram
participant Alice
participant Bob
Alice->>Bob: Hello
`)
  assert.equal(spec.nodes.length, 2)
  assert.equal(spec.edges.length, 1)
})

test('parseMermaidToSpec supports classDiagram', () => {
  const spec = parseMermaidToSpec(`classDiagram
class Book
class Member
Book <|-- Member : inherits
`)
  assert.equal(spec.nodes.length, 2)
  assert.equal(spec.edges.length, 1)
})

test('parseMermaidToSpec supports stateDiagram-v2', () => {
  const spec = parseMermaidToSpec(`stateDiagram-v2
[*] --> Pending
Pending --> Confirmed : ok
Confirmed --> [*]
`)
  assert.ok(spec.nodes.length >= 3)
  assert.ok(spec.edges.length >= 2)
})

test('parseMermaidToSpec supports erDiagram', () => {
  const spec = parseMermaidToSpec(`erDiagram
CUSTOMER ||--o{ ORDER : places
`)
  assert.equal(spec.nodes.length, 2)
  assert.equal(spec.edges.length, 1)
})

test('parseMermaidToSpec supports gantt', () => {
  const spec = parseMermaidToSpec(`gantt
title Demo
dateFormat YYYY-MM-DD
section Build
Task 1 :done, 2024-01-01, 1d
Task 2 :active, 2024-01-02, 1d
`)
  assert.ok(spec.nodes.length >= 2)
  assert.ok(spec.edges.length >= 1)
})

test('parseMermaidToSpec rejects unsupported diagram type', () => {
  assert.throws(
    () => parseMermaidToSpec('journey\n  title Demo'),
    /Unsupported Mermaid diagram type/
  )
})

test('parseCsvToSpec builds parent-child edges', () => {
  const spec = parseCsvToSpec(`name,parent,label
CEO,,Chief Executive Officer
CTO,CEO,Chief Technology Officer`)
  assert.equal(spec.nodes.length, 2)
  assert.equal(spec.edges.length, 1)
  assert.equal(spec.edges[0].from, 'CEO')
  assert.equal(spec.edges[0].to, 'CTO')
})

test('validateConnectionPointPolicy warns on partial connection points', () => {
  const warnings = validateConnectionPointPolicy({
    meta: {},
    nodes: [],
    edges: [
      {
        from: 'A',
        to: 'B',
        style: { exitX: 1, exitY: 0.5 }
      }
    ],
    modules: []
  })
  assert.equal(warnings.length, 1)
  assert.match(warnings[0], /partial connection points/)
})

test('validateAcademicProfile requires title and legend for academic-paper', () => {
  const warnings = validateAcademicProfile({
    meta: { profile: 'academic-paper', theme: 'academic-color' },
    nodes: [{ id: 'A', label: 'API', icon: 'aws.lambda' }],
    edges: [{ from: 'A', to: 'B', type: 'data' }],
    modules: []
  })
  assert.ok(warnings.some(w => /meta.title/.test(w)))
  assert.ok(warnings.some(w => /meta.legend/.test(w)))
})

test('validateAcademicProfile warns on missing figureType and dense academic labels', () => {
  const warnings = validateAcademicProfile({
    meta: {
      profile: 'academic-paper',
      theme: 'academic',
      title: 'Fig. 2',
      description: 'Academic workflow'
    },
    nodes: [
      {
        id: 'A',
        label: 'This label is intentionally much too long for a paper figure node',
        style: { fillColor: '#FF0000' }
      },
      { id: 'B', label: 'Line 1\nLine 2\nLine 3\nLine 4' }
    ],
    edges: [],
    modules: []
  })
  assert.ok(warnings.some(w => /meta\.figureType/.test(w)))
  assert.ok(warnings.some(w => /labels should stay concise/.test(w)))
  assert.ok(warnings.some(w => /grayscale-safe explicit overrides/.test(w)))
})

test('validateAcademicProfile warns on dense single-page academic figures', () => {
  const warnings = validateAcademicProfile({
    meta: {
      profile: 'academic-paper',
      theme: 'academic-color',
      figureType: 'workflow',
      title: 'Fig. 3',
      description: 'Dense workflow'
    },
    nodes: Array.from({ length: 13 }, (_, index) => ({
      id: `N${index}`,
      label: `Node ${index}`
    })),
    edges: [],
    modules: []
  })
  assert.ok(warnings.some(w => /dense for a single-page figure/.test(w)))
})

test('validateSpec accepts academic figureType and rejects invalid values', () => {
  assert.doesNotThrow(() => {
    validateSpec({
      meta: { theme: 'academic', profile: 'academic-paper', figureType: 'architecture' },
      nodes: [],
      edges: [],
      modules: []
    })
  })

  assert.throws(
    () => validateSpec({
      meta: { figureType: 'timeline' },
      nodes: [],
      edges: [],
      modules: []
    }),
    /Invalid meta\.figureType/
  )
})

test('validateEdgeQuality warns on short final segment', () => {
  const spec = {
    meta: { layout: 'horizontal' },
    nodes: [
      { id: 'A', label: 'Alpha', position: { x: 100, y: 100 } },
      { id: 'B', label: 'Beta', position: { x: 180, y: 100 } }
    ],
    edges: [{ from: 'A', to: 'B', label: 'tight' }],
    modules: []
  }
  const layout = calculateLayout(spec, loadTheme('tech-blue'))
  const warnings = validateEdgeQuality(spec, layout)
  assert.ok(warnings.some(w => /short final segment/.test(w)))
})

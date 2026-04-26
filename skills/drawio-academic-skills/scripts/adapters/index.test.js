/**
 * index.test.js
 * Unit tests for Mermaid and CSV input adapters
 * Uses Node.js built-in test runner
 */

import { describe, it } from 'node:test'
import assert from 'node:assert'
import { parseMermaidToSpec, parseCsvToSpec } from './index.js'

// ============================================================================
// Mermaid Adapter Tests
// ============================================================================

describe('parseMermaidToSpec', () => {
  describe('flowchart', () => {
    it('should parse a simple flowchart LR with nodes and edges', () => {
      const input = 'flowchart LR\n  A[Start] --> B[Process] --> C[End]'
      const spec = parseMermaidToSpec(input)

      assert.ok(spec.nodes.length >= 3, `Expected at least 3 nodes, got ${spec.nodes.length}`)
      const ids = spec.nodes.map(n => n.id)
      assert.ok(ids.includes('A'), 'Should contain node A')
      assert.ok(ids.includes('B'), 'Should contain node B')
      assert.ok(ids.includes('C'), 'Should contain node C')

      assert.ok(spec.edges.length >= 2, `Expected at least 2 edges, got ${spec.edges.length}`)
      assert.strictEqual(spec.edges[0].from, 'A')
      assert.strictEqual(spec.edges[0].to, 'B')
      assert.strictEqual(spec.edges[1].from, 'B')
      assert.strictEqual(spec.edges[1].to, 'C')

      assert.strictEqual(spec.meta.layout, 'horizontal', 'Flowchart should have horizontal layout')
    })
  })

  describe('sequence diagram', () => {
    it('should parse participants as user type nodes', () => {
      const input = 'sequenceDiagram\n  Alice->>Bob: Hello'
      const spec = parseMermaidToSpec(input)

      assert.ok(spec.nodes.length >= 2, `Expected at least 2 nodes, got ${spec.nodes.length}`)
      for (const node of spec.nodes) {
        assert.strictEqual(node.type, 'user', `Node "${node.label}" should be type "user"`)
      }

      assert.ok(spec.edges.length >= 1, 'Should have at least 1 edge')
      assert.strictEqual(spec.edges[0].label, 'Hello')
    })
  })

  describe('state diagram', () => {
    it('should parse [*] as Start/End terminal types', () => {
      const input = 'stateDiagram-v2\n  [*] --> Active\n  Active --> [*]'
      const spec = parseMermaidToSpec(input)

      const startNode = spec.nodes.find(n => n.id === 'Start')
      const endNode = spec.nodes.find(n => n.id === 'End')
      assert.ok(startNode, 'Should have a Start node')
      assert.ok(endNode, 'Should have an End node')
      assert.strictEqual(startNode.type, 'terminal', 'Start node should be terminal type')
      assert.strictEqual(endNode.type, 'terminal', 'End node should be terminal type')

      assert.ok(spec.edges.length >= 2, `Expected at least 2 edges, got ${spec.edges.length}`)
    })
  })

  describe('ER diagram', () => {
    it('should parse entities as database type nodes', () => {
      const input = 'erDiagram\n  CUSTOMER ||--o{ ORDER : places'
      const spec = parseMermaidToSpec(input)

      assert.ok(spec.nodes.length >= 2, `Expected at least 2 nodes, got ${spec.nodes.length}`)
      for (const node of spec.nodes) {
        assert.strictEqual(node.type, 'database', `Node "${node.label}" should be type "database"`)
      }

      assert.ok(spec.edges.length >= 1, 'Should have at least 1 edge')
      assert.strictEqual(spec.edges[0].label, 'places')
    })
  })

  describe('class diagram', () => {
    it('should parse classes as service type nodes', () => {
      const input = 'classDiagram\n  Animal <|-- Dog'
      const spec = parseMermaidToSpec(input)

      assert.ok(spec.nodes.length >= 2, `Expected at least 2 nodes, got ${spec.nodes.length}`)
      for (const node of spec.nodes) {
        assert.strictEqual(node.type, 'service', `Node "${node.label}" should be type "service"`)
      }

      assert.ok(spec.edges.length >= 1, 'Should have at least 1 edge')
    })
  })

  describe('error handling', () => {
    it('should throw on empty input', () => {
      assert.throws(
        () => parseMermaidToSpec(''),
        { message: 'Mermaid input is empty' }
      )
      assert.throws(
        () => parseMermaidToSpec('   \n  \n  '),
        { message: 'Mermaid input is empty' }
      )
    })

    it('should throw on unsupported diagram type', () => {
      assert.throws(
        () => parseMermaidToSpec('pie\n  "A": 50\n  "B": 50'),
        /Unsupported Mermaid diagram type/
      )
    })
  })
})

// ============================================================================
// CSV Adapter Tests
// ============================================================================

describe('parseCsvToSpec', () => {
  it('should parse CSV with name and parent columns into nodes and edges', () => {
    const input = [
      'name,parent',
      'Root,',
      'Child1,Root',
      'Child2,Root'
    ].join('\n')

    const spec = parseCsvToSpec(input)

    assert.ok(spec.nodes.length >= 3, `Expected at least 3 nodes, got ${spec.nodes.length}`)
    const ids = spec.nodes.map(n => n.id)
    assert.ok(ids.includes('Root'), 'Should contain Root node')
    assert.ok(ids.includes('Child1'), 'Should contain Child1 node')
    assert.ok(ids.includes('Child2'), 'Should contain Child2 node')

    assert.ok(spec.edges.length >= 2, `Expected at least 2 edges, got ${spec.edges.length}`)
    const edgePairs = spec.edges.map(e => `${e.from}->${e.to}`)
    assert.ok(edgePairs.includes('Root->Child1'), 'Should have edge Root->Child1')
    assert.ok(edgePairs.includes('Root->Child2'), 'Should have edge Root->Child2')
  })

  it('should respect explicit type column', () => {
    const input = [
      'name,parent,type',
      'MyDB,,database',
      'MyService,MyDB,queue'
    ].join('\n')

    const spec = parseCsvToSpec(input)

    const dbNode = spec.nodes.find(n => n.id === 'MyDB')
    const svcNode = spec.nodes.find(n => n.id === 'MyService')
    assert.ok(dbNode, 'Should have MyDB node')
    assert.ok(svcNode, 'Should have MyService node')
    assert.strictEqual(dbNode.type, 'database', 'MyDB should have type "database"')
    assert.strictEqual(svcNode.type, 'queue', 'MyService should have type "queue"')
  })

  it('should throw when name or parent columns are missing', () => {
    assert.throws(
      () => parseCsvToSpec('label,description\nFoo,Bar'),
      { message: 'CSV input must include "name" and "parent" columns' }
    )
    assert.throws(
      () => parseCsvToSpec('name,description\nFoo,Bar'),
      { message: 'CSV input must include "name" and "parent" columns' }
    )
  })
})

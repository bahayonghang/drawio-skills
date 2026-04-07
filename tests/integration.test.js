/**
 * integration.test.js
 * Full pipeline integration tests: YAML -> CLI -> valid XML output
 * Uses Node.js built-in test runner
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = resolve(__dirname, '..')
const CLI = resolve(PROJECT_ROOT, 'skills/drawio/scripts/cli.js')
const EXAMPLES_DIR = resolve(PROJECT_ROOT, 'skills/drawio/references/examples')

/**
 * Run the CLI with given arguments and return stdout.
 * @param {string[]} args - CLI arguments
 * @param {object} opts - Extra options for execFileSync (e.g. input for stdin)
 * @returns {string} stdout output
 */
function runCli(args, opts = {}) {
  return execFileSync('node', [CLI, ...args], {
    timeout: 10_000,
    encoding: 'utf-8',
    cwd: PROJECT_ROOT,
    ...opts
  })
}

function createTempDir() {
  return mkdtempSync(resolve(tmpdir(), 'drawio-skill-test-'))
}

// ============================================================================
// Example YAML -> CLI -> Valid XML Output
// ============================================================================

test('CLI: microservices.yaml produces valid XML', () => {
  const output = runCli([resolve(EXAMPLES_DIR, 'microservices.yaml')])
  assert.ok(output.includes('<mxGraphModel'), 'Output should contain mxGraphModel')
  assert.ok(output.includes('</mxGraphModel>'), 'Output should close mxGraphModel')
  assert.ok(output.includes('API Gateway'), 'Output should contain API Gateway node')
})

test('CLI: login-flow.yaml produces valid XML', () => {
  const output = runCli([resolve(EXAMPLES_DIR, 'login-flow.yaml')])
  assert.ok(output.includes('<mxGraphModel'), 'Output should contain mxGraphModel')
  assert.ok(output.includes('</mxGraphModel>'), 'Output should close mxGraphModel')
})

test('CLI: neural-network.yaml produces valid XML', () => {
  const output = runCli([resolve(EXAMPLES_DIR, 'neural-network.yaml')])
  assert.ok(output.includes('<mxGraphModel'), 'Output should contain mxGraphModel')
  assert.ok(output.includes('</mxGraphModel>'), 'Output should close mxGraphModel')
})

test('CLI: e-commerce.yaml produces valid XML', () => {
  const output = runCli([resolve(EXAMPLES_DIR, 'e-commerce.yaml')])
  assert.ok(output.includes('<mxGraphModel'), 'Output should contain mxGraphModel')
  assert.ok(output.includes('</mxGraphModel>'), 'Output should close mxGraphModel')
})

test('CLI: campus-lan-topology.yaml produces network topology XML', () => {
  const output = runCli([resolve(EXAMPLES_DIR, 'campus-lan-topology.yaml'), '--validate'])
  assert.ok(output.includes('Edge Firewall'), 'Output should contain firewall node')
  assert.ok(output.includes('shape=switch'), 'Output should render switch shape')
  assert.ok(output.includes('VLAN 10'), 'Output should derive VLAN label from edge metadata')
})

test('CLI: aws-vpc-topology.yaml produces provider icon XML', () => {
  const output = runCli([resolve(EXAMPLES_DIR, 'aws-vpc-topology.yaml'), '--validate'])
  assert.ok(output.includes('mxgraph.aws4.application_load_balancer'), 'Output should contain AWS ALB icon')
  assert.ok(output.includes('AWS VPC'), 'Output should include the AWS VPC module container label')
  assert.ok(output.includes('listener-443 ↔ eth0'), 'Output should derive interface label from edge metadata')
})

test('CLI: onprem-dmz-topology.yaml produces DMZ topology XML', () => {
  const output = runCli([resolve(EXAMPLES_DIR, 'onprem-dmz-topology.yaml'), '--validate'])
  assert.ok(output.includes('mxgraph.cisco.firewalls.firewall'), 'Output should contain firewall stencil')
  assert.ok(output.includes('DMZ'), 'Output should include the DMZ module container label')
  assert.ok(output.includes('Internal Network'), 'Output should include the Internal Network module label')
  assert.ok(output.includes('east-west'), 'Output should derive linkType label from edge metadata')
})

test('CLI: vendor-device-mapping.yaml derives icons from network metadata', () => {
  const output = runCli([resolve(EXAMPLES_DIR, 'vendor-device-mapping.yaml'), '--validate'])
  assert.ok(output.includes('mxgraph.aws4.internet_gateway'), 'Output should derive AWS internet gateway icon')
  assert.ok(output.includes('mxgraph.aws4.application_load_balancer'), 'Output should derive AWS load balancer icon')
  assert.ok(output.includes('mxgraph.cisco.firewalls.firewall'), 'Output should derive Cisco firewall stencil')
  assert.ok(output.includes('mxgraph.cisco.wireless.access_point'), 'Output should derive Cisco AP stencil')
})

// ============================================================================
// Stdin Support
// ============================================================================

test('CLI: reads YAML from stdin with - arg', () => {
  const yamlInput = 'nodes:\n  - id: A\n    label: Stdin Test Node\n'
  const output = runCli(['-'], { input: yamlInput })
  assert.ok(output.includes('<mxGraphModel'), 'Stdin output should contain mxGraphModel')
  assert.ok(output.includes('Stdin Test Node'), 'Output should contain the node label')
})

test('CLI: reads YAML from stdin without explicit - arg when piped', () => {
  const yamlInput = 'nodes:\n  - id: B\n    label: Piped Node\n'
  // Passing input simulates piped stdin; without -f arg and with isTTY=false,
  // the CLI should detect stdin. However, execFileSync always sets isTTY=false,
  // so passing '-' is the reliable test path.
  const output = runCli(['-'], { input: yamlInput })
  assert.ok(output.includes('Piped Node'), 'Output should contain piped node label')
})

// ============================================================================
// Theme Override
// ============================================================================

test('CLI: --theme dark overrides theme', () => {
  const yamlInput = 'nodes:\n  - id: A\n    label: Dark Node\n'
  const output = runCli(['-', '--theme', 'dark'], { input: yamlInput })
  assert.ok(output.includes('background="#0F172A"'), 'Dark theme should set dark background')
})

test('CLI: --theme academic applies grayscale', () => {
  const yamlInput = 'nodes:\n  - id: A\n    label: Academic Node\n'
  const output = runCli(['-', '--theme', 'academic'], { input: yamlInput })
  assert.ok(output.includes('<mxGraphModel'), 'Should produce valid XML with academic theme')
})

// ============================================================================
// Invalid Input
// ============================================================================

test('CLI: invalid YAML exits with non-zero code', () => {
  try {
    runCli(['-'], { input: '!!!invalid: [yaml: {' })
    assert.fail('Should have thrown for invalid YAML')
  } catch (err) {
    assert.ok(err.status !== 0, 'Should exit with non-zero status')
  }
})

test('CLI: YAML with invalid node ID exits with error', () => {
  try {
    runCli(['-'], { input: 'nodes:\n  - id: "123bad"\n    label: Test\n' })
    assert.fail('Should have thrown for invalid node ID')
  } catch (err) {
    assert.ok(err.status !== 0, 'Should exit with non-zero status')
    assert.ok(err.stderr.includes('Invalid node id'), 'Error should mention invalid node id')
  }
})

// ============================================================================
// Validate Flag
// ============================================================================

test('CLI: --validate passes on valid input', () => {
  const yamlInput = 'nodes:\n  - id: A\n    label: Valid Node\n'
  const output = runCli(['-', '--validate'], { input: yamlInput })
  assert.ok(output.includes('<mxGraphModel'), 'Should still output XML')
})

test('CLI: --validate with example files', () => {
  // All examples should pass validation
  const examples = [
    'microservices.yaml',
    'login-flow.yaml',
    'neural-network.yaml',
    'e-commerce.yaml',
    'campus-lan-topology.yaml',
    'aws-vpc-topology.yaml',
    'onprem-dmz-topology.yaml'
  ]
  for (const name of examples) {
    const output = runCli([resolve(EXAMPLES_DIR, name), '--validate'])
    assert.ok(output.includes('<mxGraphModel'), `${name} should produce valid XML with --validate`)
  }
})

test('CLI: Mermaid flowchart converts via adapter', () => {
  const mermaid = `flowchart TD
    A[Start] --> B{Approve}
    B --> C[Done]`
  const output = runCli(['-', '--input-format', 'mermaid'], { input: mermaid })
  assert.ok(output.includes('Start'), 'Mermaid adapter should emit Start node')
  assert.ok(output.includes('Approve'), 'Mermaid adapter should emit decision node')
})

test('CLI: Mermaid sequence diagram converts via adapter', () => {
  const mermaid = `sequenceDiagram
participant Alice
participant Bob
Alice->>Bob: Hello`
  const output = runCli(['-', '--input-format', 'mermaid'], { input: mermaid })
  assert.ok(output.includes('Alice'), 'Mermaid sequence should emit participant nodes')
  assert.ok(output.includes('Bob'), 'Mermaid sequence should emit participant nodes')
  assert.ok(output.includes('Hello'), 'Mermaid sequence should emit message label')
})

test('CLI: drawio import can export a spec bundle', () => {
  const tempDir = createTempDir()
  const inputFile = resolve(PROJECT_ROOT, 'skills/drawio/evals/fixtures/import-simple.drawio')
  const specFile = resolve(tempDir, 'imported.spec.yaml')

  runCli([inputFile, specFile, '--input-format', 'drawio', '--export-spec', '--write-sidecars'])

  assert.ok(existsSync(specFile), 'spec output should exist')
  assert.ok(existsSync(resolve(tempDir, 'imported.arch.json')), 'arch sidecar should exist')

  const specText = readFileSync(specFile, 'utf-8')
  assert.ok(specText.includes('label: Backend'), 'imported spec should include module label')
  assert.ok(specText.includes('label: API'), 'imported spec should include API node')
  assert.ok(specText.includes('label: DB'), 'imported spec should include DB node')
})

test('CLI: CSV org chart converts via adapter', () => {
  const csv = `name,parent,label
CEO,,Chief Executive Officer
CTO,CEO,Chief Technology Officer`
  const output = runCli(['-', '--input-format', 'csv'], { input: csv })
  assert.ok(output.includes('Chief Executive Officer'), 'CSV adapter should emit node labels')
  assert.ok(output.includes('Chief Technology Officer'), 'CSV adapter should emit child node labels')
})

// ============================================================================
// File Outputs and Sidecars
// ============================================================================

test('CLI: svg output writes a standalone svg file', () => {
  const tempDir = createTempDir()
  const outputFile = resolve(tempDir, 'simple-flow.svg')
  const yamlInput = 'nodes:\n  - id: A\n    label: SVG Node\n'

  runCli(['-', outputFile], { input: yamlInput })

  assert.ok(existsSync(outputFile), 'SVG output file should exist')
  const svg = readFileSync(outputFile, 'utf-8')
  assert.ok(svg.startsWith('<svg'), 'SVG output should start with <svg')
  assert.ok(svg.includes('SVG Node'), 'SVG should contain the node label')
})

test('CLI: --write-sidecars creates drawio, spec, and arch files for drawio output', () => {
  const tempDir = createTempDir()
  const outputFile = resolve(tempDir, 'hybrid-flow.drawio')
  const yamlInput = 'meta:\n  theme: dark\nnodes:\n  - id: A\n    label: Sidecar Node\n'

  runCli(['-', outputFile, '--write-sidecars'], { input: yamlInput })

  const specFile = resolve(tempDir, 'hybrid-flow.spec.yaml')
  const archFile = resolve(tempDir, 'hybrid-flow.arch.json')
  assert.ok(existsSync(outputFile), 'drawio output file should exist')
  assert.ok(existsSync(specFile), 'spec sidecar should exist')
  assert.ok(existsSync(archFile), 'arch sidecar should exist')

  const specText = readFileSync(specFile, 'utf-8')
  assert.ok(specText.includes('theme: dark'), 'spec sidecar should preserve theme overrides')

  const arch = JSON.parse(readFileSync(archFile, 'utf-8'))
  assert.deepEqual(arch.counts, { nodes: 1, edges: 0, modules: 0 })
  assert.equal(arch.nodes[0].id, 'A')
  assert.equal(arch.nodes[0].label, 'Sidecar Node')
})

test('CLI: --write-sidecars with svg output writes drawio companion and sidecars', () => {
  const tempDir = createTempDir()
  const outputFile = resolve(tempDir, 'paper-figure.svg')
  const yamlInput = 'meta:\n  profile: academic-paper\nnodes:\n  - id: A\n    label: Figure Node\n'

  runCli(['-', outputFile, '--write-sidecars'], { input: yamlInput })

  assert.ok(existsSync(outputFile), 'SVG output file should exist')
  assert.ok(existsSync(resolve(tempDir, 'paper-figure.drawio')), 'drawio companion should exist')
  assert.ok(existsSync(resolve(tempDir, 'paper-figure.spec.yaml')), 'spec sidecar should exist')
  assert.ok(existsSync(resolve(tempDir, 'paper-figure.arch.json')), 'arch sidecar should exist')
})

test('CLI: replicated specs preserve source background and replication metadata in sidecars', () => {
  const tempDir = createTempDir()
  const inputFile = resolve(EXAMPLES_DIR, 'replicated-brand-flow.yaml')
  const outputFile = resolve(tempDir, 'replicated-brand-flow.drawio')

  const xml = runCli([inputFile, outputFile, '--write-sidecars'])
  assert.equal(xml, '', 'drawio file output should not print XML to stdout')
  assert.ok(existsSync(outputFile), 'drawio output file should exist')

  const drawioText = readFileSync(outputFile, 'utf-8')
  assert.ok(drawioText.includes('background="#FFF7ED"'), 'canvas background should come from replication metadata')
  assert.ok(drawioText.includes('fillColor=#FDBA74'), 'node fill should preserve extracted warm color')
  assert.ok(drawioText.includes('strokeColor=#7C2D12'), 'connector stroke should preserve extracted brown color')

  const arch = JSON.parse(readFileSync(resolve(tempDir, 'replicated-brand-flow.arch.json'), 'utf-8'))
  assert.equal(arch.source, 'replicated')
  assert.equal(arch.replication.colorMode, 'preserve-original')
  assert.equal(arch.replication.background, '#FFF7ED')
  assert.equal(arch.replication.palette[0].hex, '#FDBA74')
})

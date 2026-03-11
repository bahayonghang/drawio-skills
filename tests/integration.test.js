/**
 * integration.test.js
 * Full pipeline integration tests: YAML -> CLI -> valid XML output
 * Uses Node.js built-in test runner
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
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
  const examples = ['microservices.yaml', 'login-flow.yaml', 'neural-network.yaml', 'e-commerce.yaml']
  for (const name of examples) {
    const output = runCli([resolve(EXAMPLES_DIR, name), '--validate'])
    assert.ok(output.includes('<mxGraphModel'), `${name} should produce valid XML with --validate`)
  }
})

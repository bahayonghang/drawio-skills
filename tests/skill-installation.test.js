import test from 'node:test'
import assert from 'node:assert/strict'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = resolve(__dirname, '..')
const SKILL_ROOT = resolve(PROJECT_ROOT, 'skills/drawio')

function withoutNodePath() {
  const env = { ...process.env }
  for (const key of Object.keys(env)) {
    if (key.toUpperCase() === 'NODE_PATH') delete env[key]
  }
  return env
}

function writePoisonYamlPackage(root) {
  const packageDir = join(root, 'node_modules', 'js-yaml')
  mkdirSync(packageDir, { recursive: true })
  writeFileSync(
    join(packageDir, 'package.json'),
    `${JSON.stringify({ name: 'js-yaml', version: '0.0.0-poison', type: 'module', exports: './index.js' }, null, 2)}\n`
  )
  writeFileSync(join(packageDir, 'index.js'), "throw new Error('ambient js-yaml dependency was loaded')\n")
}

function disconnectAmbientParserPackages(root) {
  for (const name of ['es-module-lexer', 'tree-sitter', 'tree-sitter-go', 'tree-sitter-rust']) {
    const packageDir = join(root, 'node_modules', name)
    mkdirSync(packageDir, { recursive: true })
    writeFileSync(
      join(packageDir, 'package.json'),
      `${JSON.stringify(
        {
          name,
          version: '0.0.0-disconnected',
          type: 'module',
          exports: {
            '.': './missing.mjs',
            './js': './missing.mjs'
          }
        },
        null,
        2
      )}\n`
    )
  }
}

function collectProductionScripts(root, files = []) {
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== 'vendor') collectProductionScripts(path, files)
      continue
    }
    if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.endsWith('.test.js')) {
      files.push(path)
    }
  }
  return files
}

test('installed base skill owns its mandatory YAML runtime', () => {
  const tempRoot = mkdtempSync(join(tmpdir(), 'drawio-skill-install-'))
  const installedSkill = join(tempRoot, 'installed', 'drawio')
  const inputFile = join(tempRoot, 'input.yaml')
  const outputFile = join(tempRoot, 'output.drawio')

  try {
    cpSync(SKILL_ROOT, installedSkill, { recursive: true })
    writePoisonYamlPackage(tempRoot)
    writeFileSync(inputFile, 'nodes:\n  - id: start\n    label: Start\n')

    const result = spawnSync(
      process.execPath,
      [join(installedSkill, 'scripts', 'cli.js'), inputFile, outputFile, '--validate'],
      {
        cwd: tempRoot,
        env: withoutNodePath(),
        encoding: 'utf8',
        timeout: 10_000,
        windowsHide: true
      }
    )

    assert.equal(result.status, 0, `isolated CLI failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`)
    assert.equal(existsSync(outputFile), true)
    const xml = readFileSync(outputFile, 'utf8')
    assert.match(xml, /<mxGraphModel[\s>]/)
    assert.match(xml, /<\/mxGraphModel>/)
  } finally {
    rmSync(tempRoot, { recursive: true, force: true })
  }
})

test('installed base skill keeps YAML working when optional parsers are disconnected', () => {
  const tempRoot = mkdtempSync(join(tmpdir(), 'drawio-skill-parser-install-'))
  const installedSkill = join(tempRoot, 'installed', 'drawio')
  const yamlInput = join(tempRoot, 'input.yaml')
  const yamlOutput = join(tempRoot, 'output.drawio')
  const jsProject = join(tempRoot, 'js-project')
  const cli = join(installedSkill, 'scripts', 'cli.js')

  try {
    cpSync(SKILL_ROOT, installedSkill, { recursive: true })
    writePoisonYamlPackage(tempRoot)
    disconnectAmbientParserPackages(tempRoot)
    writeFileSync(yamlInput, 'nodes:\n  - id: start\n    label: Start\n')
    mkdirSync(jsProject)
    writeFileSync(join(jsProject, 'a.js'), "import './b.js'\n")
    writeFileSync(join(jsProject, 'b.js'), 'export const b = 1\n')

    const yamlResult = spawnSync(process.execPath, [cli, yamlInput, yamlOutput, '--validate'], {
      cwd: tempRoot,
      env: withoutNodePath(),
      encoding: 'utf8',
      timeout: 10_000,
      windowsHide: true
    })
    assert.equal(
      yamlResult.status,
      0,
      `isolated YAML CLI failed\nstdout:\n${yamlResult.stdout}\nstderr:\n${yamlResult.stderr}`
    )
    assert.equal(existsSync(yamlOutput), true)

    const jsResult = spawnSync(process.execPath, [cli, jsProject, '--input-format', 'js-imports'], {
      cwd: tempRoot,
      env: withoutNodePath(),
      encoding: 'utf8',
      timeout: 10_000,
      windowsHide: true
    })
    assert.notEqual(jsResult.status, 0)
    assert.match(jsResult.stderr, /\[OPTIONAL_DEPENDENCY_MISSING\]/)
  } finally {
    rmSync(tempRoot, { recursive: true, force: true })
  }
})

test('production scripts do not import js-yaml as an ambient package', () => {
  const bareImport = /\b(?:from\s+|import\s*\(\s*|require\s*\(\s*)['"]js-yaml(?:\/[^'"]*)?['"]/
  const offenders = collectProductionScripts(resolve(SKILL_ROOT, 'scripts'))
    .filter((path) => bareImport.test(readFileSync(path, 'utf8')))
    .map((path) => path.slice(PROJECT_ROOT.length + 1).replaceAll('\\', '/'))

  assert.deepEqual(offenders, [])
})

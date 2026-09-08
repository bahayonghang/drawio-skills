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
const OVERLAY_ROOT = resolve(PROJECT_ROOT, 'skills/drawio-academic-skills')

function packageVersion() {
  return JSON.parse(readFileSync(resolve(PROJECT_ROOT, 'package.json'), 'utf8')).version
}

function skillFrontmatterVersion(skillPath) {
  const text = readFileSync(skillPath, 'utf8')
  const match = text.match(/^version:\s*["']?([^"'\r\n]+)["']?/m)
  assert.ok(match, `missing version in ${skillPath}`)
  return match[1]
}

function runIsolatedCli(cli, args, cwd, extra = {}) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd,
    env: withoutNodePath(),
    encoding: 'utf8',
    timeout: extra.timeout ?? 10_000,
    windowsHide: true,
    input: extra.input
  })
}

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

test('installed same-source copy keeps current SKILL version and compose import', () => {
  const tempRoot = mkdtempSync(join(tmpdir(), 'drawio-skill-same-source-'))
  const installedSkill = join(tempRoot, 'installed', 'drawio')
  const inputFile = join(tempRoot, 'compose.yaml')
  const outputFile = join(tempRoot, 'output.drawio')
  const cli = join(installedSkill, 'scripts', 'cli.js')

  try {
    cpSync(SKILL_ROOT, installedSkill, { recursive: true })
    writePoisonYamlPackage(tempRoot)
    writeFileSync(
      inputFile,
      'name: audit\nservices:\n  api:\n    image: example/api:1\n'
    )

    assert.equal(skillFrontmatterVersion(join(installedSkill, 'SKILL.md')), packageVersion())

    const help = runIsolatedCli(cli, ['--help'], tempRoot)
    assert.equal(help.status, 0, `installed --help failed\nstdout:\n${help.stdout}\nstderr:\n${help.stderr}`)
    assert.match(help.stdout, /compose/)
    assert.match(help.stdout, /js-imports/)

    const result = runIsolatedCli(cli, [inputFile, outputFile, '--input-format', 'compose', '--validate'], tempRoot)
    assert.equal(result.status, 0, `isolated compose CLI failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`)
    assert.equal(existsSync(outputFile), true)
    const xml = readFileSync(outputFile, 'utf8')
    assert.match(xml, /<mxGraphModel[\s>]/)
    assert.match(xml, /<\/mxGraphModel>/)
    assert.match(xml, /api/)
  } finally {
    rmSync(tempRoot, { recursive: true, force: true })
  }
})

test('installed academic overlay uses sibling ../drawio CLI', () => {
  const tempRoot = mkdtempSync(join(tmpdir(), 'drawio-academic-sibling-'))
  const installedRoot = join(tempRoot, 'installed')
  const installedBase = join(installedRoot, 'drawio')
  const installedOverlay = join(installedRoot, 'drawio-academic-skills')
  const outputFile = join(tempRoot, 'output.drawio')
  const overlayExample = join(
    installedOverlay,
    'references',
    'examples',
    'system-architecture-paper.yaml'
  )
  const siblingCli = join(installedOverlay, '..', 'drawio', 'scripts', 'cli.js')

  try {
    cpSync(SKILL_ROOT, installedBase, { recursive: true })
    cpSync(OVERLAY_ROOT, installedOverlay, { recursive: true })
    writePoisonYamlPackage(tempRoot)

    assert.equal(existsSync(join(installedOverlay, 'scripts', 'cli.js')), false)
    assert.equal(skillFrontmatterVersion(join(installedOverlay, 'SKILL.md')), packageVersion())
    assert.match(readFileSync(join(installedOverlay, 'SKILL.md'), 'utf8'), /\.\.\/drawio\/scripts\/cli\.js/)
    assert.equal(existsSync(overlayExample), true)
    assert.equal(resolve(siblingCli), resolve(installedBase, 'scripts', 'cli.js'))

    const result = runIsolatedCli(
      siblingCli,
      [overlayExample, outputFile, '--validate'],
      installedOverlay
    )
    assert.equal(
      result.status,
      0,
      `academic sibling CLI failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
    )
    assert.equal(existsSync(outputFile), true)
    const xml = readFileSync(outputFile, 'utf8')
    assert.match(xml, /<mxGraphModel[\s>]/)
    assert.match(xml, /<\/mxGraphModel>/)
    assert.match(xml, /API Service/)
  } finally {
    rmSync(tempRoot, { recursive: true, force: true })
  }
})

test('installed skill-only copy can read the portable harness matrix', () => {
  const tempRoot = mkdtempSync(join(tmpdir(), 'drawio-skill-harness-matrix-'))
  const installedSkill = join(tempRoot, 'installed', 'drawio')
  const matrixPath = join(installedSkill, 'references', 'docs', 'harness-compatibility.md')

  try {
    cpSync(SKILL_ROOT, installedSkill, { recursive: true })
    assert.equal(existsSync(matrixPath), true)
    const matrix = readFileSync(matrixPath, 'utf8')
    assert.match(matrix, /2026-09-07/)
    assert.match(matrix, /Claude Code/)
    assert.match(matrix, /Codex/)
    assert.match(matrix, /Grok Build/)
    assert.match(matrix, /Kimi Code/)
    assert.match(matrix, /Oh My Pi/)
    assert.match(matrix, /\.agents\/skills/)
    assert.match(readFileSync(join(installedSkill, 'SKILL.md'), 'utf8'), /harness-compatibility\.md/)
  } finally {
    rmSync(tempRoot, { recursive: true, force: true })
  }
})

test('installed academic overlay reads the harness matrix from sibling base', () => {
  const tempRoot = mkdtempSync(join(tmpdir(), 'drawio-academic-harness-matrix-'))
  const installedRoot = join(tempRoot, 'installed')
  const installedBase = join(installedRoot, 'drawio')
  const installedOverlay = join(installedRoot, 'drawio-academic-skills')
  const overlayCopy = join(installedOverlay, 'references', 'docs', 'harness-compatibility.md')
  const siblingMatrix = join(installedOverlay, '..', 'drawio', 'references', 'docs', 'harness-compatibility.md')

  try {
    cpSync(SKILL_ROOT, installedBase, { recursive: true })
    cpSync(OVERLAY_ROOT, installedOverlay, { recursive: true })

    assert.equal(existsSync(overlayCopy), false)
    assert.equal(existsSync(siblingMatrix), true)
    assert.equal(resolve(siblingMatrix), resolve(installedBase, 'references', 'docs', 'harness-compatibility.md'))
    assert.match(
      readFileSync(join(installedOverlay, 'SKILL.md'), 'utf8'),
      /\.\.\/drawio\/references\/docs\/harness-compatibility\.md/
    )
  } finally {
    rmSync(tempRoot, { recursive: true, force: true })
  }
})

test('public install docs point at the five-tool matrix and Codex .agents/skills', () => {
  const files = ['README.md', 'README_CN.md', 'docs/guide/installation.md', 'docs/zh/guide/installation.md']
  for (const rel of files) {
    const text = readFileSync(resolve(PROJECT_ROOT, rel), 'utf8')
    assert.match(text, /Claude Code/)
    assert.match(text, /Grok Build/)
    assert.match(text, /Kimi Code/)
    assert.match(text, /Oh My Pi|\bOMP\b/)
    assert.match(text, /\.agents\/skills/)
    assert.match(text, /harness-compatibility\.md/)
    assert.doesNotMatch(text, /git clone[\s\S]{0,200}\.codex\/skills/)
    assert.doesNotMatch(text, /~\/\.codex\/skills/)
    assert.doesNotMatch(text, /%USERPROFILE%\\.codex\\skills/)
  }
})

test('production scripts do not import js-yaml as an ambient package', () => {
  const bareImport = /\b(?:from\s+|import\s*\(\s*|require\s*\(\s*)['"]js-yaml(?:\/[^'"]*)?['"]/
  const offenders = collectProductionScripts(resolve(SKILL_ROOT, 'scripts'))
    .filter((path) => bareImport.test(readFileSync(path, 'utf8')))
    .map((path) => path.slice(PROJECT_ROOT.length + 1).replaceAll('\\', '/'))

  assert.deepEqual(offenders, [])
})

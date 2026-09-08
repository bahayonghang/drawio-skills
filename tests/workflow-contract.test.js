import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const JUSTFILE = join(PROJECT_ROOT, 'justfile')
const QUALITY_WORKFLOW = join(PROJECT_ROOT, '.github', 'workflows', 'ci.yml')
const DEPLOY_WORKFLOW = join(PROJECT_ROOT, '.github', 'workflows', 'deploy-docs.yml')
const VERSION_PATHS = [
  'package.json',
  'package-lock.json',
  'scripts/version-sync.js',
  'skills/drawio/SKILL.md',
  'skills/drawio-academic-skills/SKILL.md',
  'skills/drawio/evals/evals.json',
  'skills/drawio-academic-skills/evals/evals.json'
]

function hashFile(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function snapshot(root, relPaths) {
  return Object.fromEntries(relPaths.map((rel) => [rel, hashFile(join(root, rel))]))
}

function copyVersionTree(dest) {
  for (const rel of VERSION_PATHS) {
    const target = join(dest, rel)
    mkdirSync(dirname(target), { recursive: true })
    cpSync(join(PROJECT_ROOT, rel), target)
  }
}

function spawnTool(command, args, options) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    shell: false,
    windowsHide: true,
    env: process.env,
    timeout: 60_000,
    ...options
  })
  if (result.error) {
    result.stderr = `${result.stderr || ''}\n${result.error.stack}`
  }
  return result
}

function runJust(args, cwd = PROJECT_ROOT) {
  return spawnTool('just', args, { cwd })
}

function resolveNpmCli() {
  const execDir = dirname(process.execPath)
  const candidates = [
    process.env.npm_execpath,
    join(execDir, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    join(execDir, '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js')
  ].filter((candidate) => typeof candidate === 'string' && candidate.endsWith('.js'))

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }
  throw new Error(`npm CLI not found (tried ${candidates.join(', ') || 'no .js candidates'})`)
}

function justIsAvailable() {
  const result = spawnTool('just', ['--version'])
  return result.status === 0 && !result.error
}

function runNpm(args, cwd) {
  return spawnTool(process.execPath, [resolveNpmCli(), ...args], { cwd })
}

function indentOf(line) {
  return line.match(/^ */)[0].length
}

function parseKey(raw) {
  const trimmed = raw.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function stripInlineComment(text) {
  let inSingle = false
  let inDouble = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === "'" && !inDouble) inSingle = !inSingle
    else if (ch === '"' && !inSingle) inDouble = !inDouble
    else if (ch === '#' && !inSingle && !inDouble && (i === 0 || text[i - 1] === ' ')) {
      return text.slice(0, i).trimEnd()
    }
  }
  return text
}

function parseScalar(raw) {
  const trimmed = raw.trim()
  if (trimmed === '' || trimmed === '~' || trimmed === 'null') return null
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1).trim()
    if (!inner) return []
    return inner.split(',').map((item) => parseScalar(item))
  }
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  if (/^-?\d+$/.test(trimmed)) return Number(trimmed)
  return trimmed
}

function skipIgnored(lines, index) {
  while (index < lines.length) {
    const trimmed = lines[index].trim()
    if (trimmed === '' || trimmed.startsWith('#')) {
      index++
      continue
    }
    break
  }
  return index
}

function parseMapping(lines, index, indent) {
  const value = {}
  let i = index
  while (i < lines.length) {
    i = skipIgnored(lines, i)
    if (i >= lines.length) break
    const lineIndent = indentOf(lines[i])
    if (lineIndent < indent) break
    if (lineIndent > indent) {
      throw new Error(`Unexpected nested indent at line ${i + 1}: ${lines[i]}`)
    }
    const trimmed = stripInlineComment(lines[i].slice(lineIndent))
    if (trimmed.startsWith('- ')) {
      throw new Error(`Expected mapping key at line ${i + 1}: ${lines[i]}`)
    }
    const colon = trimmed.indexOf(':')
    if (colon < 0) throw new Error(`Missing colon at line ${i + 1}: ${lines[i]}`)
    const key = parseKey(trimmed.slice(0, colon))
    const rest = trimmed.slice(colon + 1).trim()
    if (rest !== '') {
      value[key] = parseScalar(rest)
      i++
      continue
    }
    const next = skipIgnored(lines, i + 1)
    if (next >= lines.length || indentOf(lines[next]) <= indent) {
      value[key] = null
      i++
      continue
    }
    const childIndent = indentOf(lines[next])
    const nested = lines[next].trim().startsWith('- ')
      ? parseSequence(lines, next, childIndent)
      : parseMapping(lines, next, childIndent)
    value[key] = nested.value
    i = nested.next
  }
  return { value, next: i }
}

function parseSequence(lines, index, indent) {
  const value = []
  let i = index
  while (i < lines.length) {
    i = skipIgnored(lines, i)
    if (i >= lines.length) break
    const lineIndent = indentOf(lines[i])
    if (lineIndent !== indent) break
    const trimmed = stripInlineComment(lines[i].slice(lineIndent))
    if (!trimmed.startsWith('-')) break
    const rest = trimmed.slice(1).trim()
    if (rest === '') {
      const next = skipIgnored(lines, i + 1)
      if (next >= lines.length || indentOf(lines[next]) <= indent) {
        value.push(null)
        i++
        continue
      }
      const childIndent = indentOf(lines[next])
      const nested = lines[next].trim().startsWith('- ')
        ? parseSequence(lines, next, childIndent)
        : parseMapping(lines, next, childIndent)
      value.push(nested.value)
      i = nested.next
      continue
    }
    if (/^[^:]+:(\s|$)/.test(rest)) {
      const keyIndent = indent + 2
      const colon = rest.indexOf(':')
      const item = {}
      const inline = rest.slice(colon + 1).trim()
      item[parseKey(rest.slice(0, colon))] = inline === '' ? null : parseScalar(inline)
      const nested = parseMapping(lines, i + 1, keyIndent)
      Object.assign(item, nested.value)
      value.push(item)
      i = nested.next
      continue
    }
    value.push(parseScalar(rest))
    i++
  }
  return { value, next: i }
}

function parseYaml(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\n/).map((line) => line.replace(/\r$/, ''))
  const start = skipIgnored(lines, 0)
  if (start >= lines.length) return null
  if (lines[start].trim().startsWith('- ')) {
    return parseSequence(lines, start, indentOf(lines[start])).value
  }
  return parseMapping(lines, start, indentOf(lines[start])).value
}

function collectJobSteps(job) {
  return Array.isArray(job?.steps) ? job.steps : []
}

function findStep(job, predicate) {
  return collectJobSteps(job).find(predicate)
}

function writeFixtureTree(root) {
  mkdirSync(join(root, 'docs', '.vitepress', 'dist'), { recursive: true })
  mkdirSync(join(root, 'docs', '.vitepress', 'cache'), { recursive: true })
  mkdirSync(join(root, 'node_modules', 'pkg'), { recursive: true })
  mkdirSync(join(root, 'dir with spaces'), { recursive: true })
  writeFileSync(join(root, 'docs', '.vitepress', 'dist', 'index.html'), 'dist-artifact\n')
  writeFileSync(join(root, 'docs', '.vitepress', 'cache', 'cache.json'), '{}\n')
  writeFileSync(join(root, 'node_modules', 'pkg', 'index.js'), 'export {}\n')
  writeFileSync(join(root, 'sentinel.txt'), 'keep-sentinel\n')
  writeFileSync(join(root, 'keep file.txt'), 'keep-me\n')
  writeFileSync(join(root, 'dir with spaces', 'nested.txt'), 'spaced\n')
}

function tryDirLink(target, dest) {
  try {
    symlinkSync(target, dest, process.platform === 'win32' ? 'junction' : 'dir')
    return true
  } catch (error) {
    if (error.code === 'EPERM' || error.code === 'EACCES' || error.code === 'EUNKNOWN') {
      return false
    }
    throw error
  }
}

test('package.json ci is a read-only npm-script chain', () => {
  const pkg = JSON.parse(readFileSync(join(PROJECT_ROOT, 'package.json'), 'utf8'))
  assert.equal(pkg.scripts['version:check'], 'node scripts/version-sync.js --check')
  assert.equal(
    pkg.scripts.lint,
    'markdownlint "docs/**/*.md" "skills/**/*.md" "README*.md" --ignore "skills/drawio/references/official/**" --ignore "skills/drawio/references/upstream/**" --ignore "skills/drawio/scripts/vendor/**"'
  )
  assert.equal(
    pkg.scripts.ci,
    'npm run version:check && npm run lint && npm test && npm run test:parsers && npm run docs:build'
  )
  assert.equal(pkg.scripts['test:parsers'], 'node scripts/run-tests.js --code-parsers')
  assert.doesNotMatch(pkg.scripts.ci, /version-sync\.js(?! --check)/)
})

test('just ci dry-run only proxies npm run ci', (t) => {
  const justfile = readFileSync(JUSTFILE, 'utf8')
  const header = /^ci:(.*)$/m.exec(justfile)
  assert.ok(header, 'missing ci recipe')
  assert.equal(header[1].trim(), '')
  const bodyMatch = /^ci:\r?\n((?:[ \t].*\r?\n)*)/m.exec(justfile)
  assert.ok(bodyMatch, 'missing ci recipe body')
  assert.match(bodyMatch[1], /npm run ci/)
  assert.doesNotMatch(bodyMatch[1], /version-sync/)

  if (!justIsAvailable()) {
    t.skip('missing evidence: just is not installed')
    return
  }

  const result = runJust(['--dry-run', 'ci'])
  assert.equal(result.status, 0, result.stderr || result.stdout)
  const output = `${result.stdout}\n${result.stderr}`
  assert.match(output, /npm run ci/)
  assert.doesNotMatch(output, /version-sync/)
})

test('version drift fails the npm ci gate without rewriting files', () => {
  const copyRoot = mkdtempSync(join(tmpdir(), 'drawio-version-drift-'))
  try {
    copyVersionTree(copyRoot)
    const skillPath = join(copyRoot, 'skills', 'drawio', 'SKILL.md')
    const original = readFileSync(skillPath, 'utf8')
    const drifted = original.replace(/^version:\s*.*$/m, 'version: "0.0.0-drift"')
    assert.notEqual(drifted, original)
    writeFileSync(skillPath, drifted)
    const before = snapshot(copyRoot, VERSION_PATHS)

    const result = runNpm(['run', 'ci'], copyRoot)
    const output = `${result.stdout || ''}\n${result.stderr || ''}`
    assert.notEqual(result.status, 0, output)
    assert.notEqual(result.status, null, output)
    assert.match(output, /Version mismatch|version:check/)
    assert.deepEqual(snapshot(copyRoot, VERSION_PATHS), before)
    assert.equal(readFileSync(skillPath, 'utf8'), drifted)
  } finally {
    rmSync(copyRoot, { recursive: true, force: true })
  }
})

test('consistent versions pass version:check without rewriting files', () => {
  const copyRoot = mkdtempSync(join(tmpdir(), 'drawio-version-ok-'))
  try {
    copyVersionTree(copyRoot)
    const before = snapshot(copyRoot, VERSION_PATHS)
    const result = spawnTool(process.execPath, [join(copyRoot, 'scripts', 'version-sync.js'), '--check'], {
      cwd: copyRoot
    })
    assert.equal(result.status, 0, result.stderr || result.stdout)
    assert.deepEqual(snapshot(copyRoot, VERSION_PATHS), before)
  } finally {
    rmSync(copyRoot, { recursive: true, force: true })
  }
})

test('quality workflow is a read-only pull_request gate', () => {
  const text = readFileSync(QUALITY_WORKFLOW, 'utf8')
  const workflow = parseYaml(text)
  assert.deepEqual(workflow.permissions, { contents: 'read' })
  assert.equal(Object.keys(workflow.permissions).length, 1)
  assert.ok(Object.prototype.hasOwnProperty.call(workflow.on, 'pull_request'))
  assert.equal(workflow.on.push, undefined)
  assert.equal(workflow.on.release, undefined)
  assert.doesNotMatch(text, /issues:\s*write/)
  assert.doesNotMatch(text, /pull-requests:\s*write/)
  assert.doesNotMatch(text, /createComment/)
  assert.doesNotMatch(text, /\bjust\b/)
  assert.doesNotMatch(text, /continue-on-error:\s*true/)

  const job = workflow.jobs.quality
  assert.deepEqual(job.strategy.matrix.os, ['ubuntu-latest', 'windows-latest'])
  assert.equal(job.permissions, undefined)

  const checkout = findStep(job, (step) => step.uses === 'actions/checkout@v4')
  assert.equal(checkout.with['persist-credentials'], false)

  const node = findStep(job, (step) => step.uses === 'actions/setup-node@v4')
  assert.equal(String(node.with['node-version']), '24')

  const install = findStep(job, (step) => step.run === 'npm ci')
  assert.ok(install, 'quality job must install locked dependencies with npm ci')

  const python = findStep(job, (step) => /python\/requirements\.txt/.test(step.run || ''))
  assert.match(python.run, /skills\/drawio\/scripts\/adapters\/python\/requirements\.txt/)

  const gate = findStep(job, (step) => step.run === 'npm run ci')
  assert.equal(gate.env.DRAWIO_TEST_PYTHON, '${{ steps.setup-python.outputs.python-path }}')
  assert.equal(findStep(job, (step) => /provider|MCP|Desktop/i.test(`${step.name || ''} ${step.run || ''}`)), undefined)
})

test('deploy workflow stays release-only and reuses the quality gate', () => {
  const text = readFileSync(DEPLOY_WORKFLOW, 'utf8')
  const workflow = parseYaml(text)
  assert.deepEqual(workflow.on, { release: { types: ['published'] } })
  assert.equal(workflow.on.pull_request, undefined)
  assert.equal(workflow.on.push, undefined)
  assert.deepEqual(workflow.permissions, { contents: 'read' })
  assert.doesNotMatch(text, /issues:\s*write/)
  assert.doesNotMatch(text, /pull-requests:\s*write/)
  assert.doesNotMatch(text, /createComment/)

  const { build, deploy } = workflow.jobs
  assert.equal(build.permissions, undefined)
  assert.equal(deploy.permissions.pages, 'write')
  assert.equal(deploy.permissions['id-token'], 'write')
  assert.notEqual(build.permissions?.pages, 'write')
  assert.notEqual(build.permissions?.['id-token'], 'write')

  const checkout = findStep(build, (step) => step.uses === 'actions/checkout@v4')
  assert.equal(checkout.with['persist-credentials'], false)

  const node = findStep(build, (step) => step.uses === 'actions/setup-node@v4')
  assert.equal(String(node.with['node-version']), '24')

  const steps = collectJobSteps(build)
  const gateIndex = steps.findIndex((step) => step.run === 'npm run ci')
  const uploadIndex = steps.findIndex((step) => step.uses === 'actions/upload-pages-artifact@v3')
  const docsOnlyIndex = steps.findIndex((step) => step.run === 'npm run docs:build')
  assert.ok(gateIndex >= 0, 'build job must run npm run ci')
  assert.ok(uploadIndex > gateIndex, 'npm run ci must run before artifact upload')
  assert.equal(docsOnlyIndex, -1, 'build job must not replace the quality gate with docs-build alone')
  assert.equal(steps[gateIndex].env.DRAWIO_TEST_PYTHON, '${{ steps.setup-python.outputs.python-path }}')
  assert.ok(steps.some((step) => step.run === 'npm ci'))
  assert.ok(steps.some((step) => /python\/requirements\.txt/.test(step.run || '')))
})

test('just clean and tree operate only inside a temp fixture', (t) => {
  if (!justIsAvailable()) {
    t.skip('missing evidence: just is not installed')
    return
  }

  const parent = mkdtempSync(join(tmpdir(), 'drawio-clean-'))
  const work = join(parent, 'work dir')
  mkdirSync(work)
  writeFixtureTree(work)
  writeFileSync(join(parent, 'sibling-sentinel.txt'), 'outside\n')
  assert.equal(resolve(work).startsWith(resolve(PROJECT_ROOT) + sep), false)

  try {
    const tree = runJust(['--justfile', JUSTFILE, '--working-directory', work, 'tree'])
    assert.equal(tree.status, 0, tree.stderr || tree.stdout)
    assert.match(tree.stdout, /dir with spaces\/nested\.txt/)
    assert.match(tree.stdout, /sentinel\.txt/)
    assert.doesNotMatch(tree.stdout, /node_modules/)
    assert.doesNotMatch(tree.stdout, /index\.html/)

    const cleaned = runJust(['--justfile', JUSTFILE, '--working-directory', work, 'clean'])
    assert.equal(cleaned.status, 0, cleaned.stderr || cleaned.stdout)
    assert.equal(existsSync(join(work, 'docs', '.vitepress', 'dist')), false)
    assert.equal(existsSync(join(work, 'docs', '.vitepress', 'cache')), false)
    assert.equal(existsSync(join(work, 'node_modules')), false)
    assert.equal(readFileSync(join(work, 'sentinel.txt'), 'utf8'), 'keep-sentinel\n')
    assert.equal(readFileSync(join(work, 'keep file.txt'), 'utf8'), 'keep-me\n')
    assert.equal(readFileSync(join(work, 'dir with spaces', 'nested.txt'), 'utf8'), 'spaced\n')
    assert.equal(readFileSync(join(parent, 'sibling-sentinel.txt'), 'utf8'), 'outside\n')
  } finally {
    rmSync(parent, { recursive: true, force: true })
  }
})

test('just clean refuses link traversal and keeps the escape target', (t) => {
  if (!justIsAvailable()) {
    t.skip('missing evidence: just is not installed')
    return
  }

  const parent = mkdtempSync(join(tmpdir(), 'drawio-clean-link-'))
  const work = join(parent, 'work dir')
  const escapeTarget = join(parent, 'escape-target')
  mkdirSync(join(work, 'docs', '.vitepress'), { recursive: true })
  mkdirSync(escapeTarget)
  writeFileSync(join(escapeTarget, 'secret.txt'), 'do-not-delete\n')
  writeFileSync(join(work, 'sentinel.txt'), 'keep-sentinel\n')
  mkdirSync(join(work, 'node_modules', 'pkg'), { recursive: true })
  writeFileSync(join(work, 'node_modules', 'pkg', 'index.js'), 'export {}\n')

  const linked = tryDirLink(escapeTarget, join(work, 'docs', '.vitepress', 'dist'))
  if (!linked) {
    t.skip('missing evidence: Windows directory link could not be created')
    rmSync(parent, { recursive: true, force: true })
    return
  }

  try {
    const cleaned = runJust(['--justfile', JUSTFILE, '--working-directory', work, 'clean'])
    assert.notEqual(cleaned.status, 0, cleaned.stdout + cleaned.stderr)
    assert.match(`${cleaned.stdout}\n${cleaned.stderr}`, /via link|out-of-scope/)
    assert.equal(readFileSync(join(escapeTarget, 'secret.txt'), 'utf8'), 'do-not-delete\n')
    assert.equal(readFileSync(join(work, 'sentinel.txt'), 'utf8'), 'keep-sentinel\n')
  } finally {
    rmSync(parent, { recursive: true, force: true })
  }
})

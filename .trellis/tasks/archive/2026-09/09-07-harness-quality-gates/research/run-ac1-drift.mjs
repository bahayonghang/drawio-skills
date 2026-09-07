import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const TASK_RESEARCH = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(TASK_RESEARCH, '..', '..', '..', '..')
const npmCli = join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js')

const VERSION_PATHS = [
  'package.json',
  'package-lock.json',
  'scripts/version-sync.js',
  'skills/drawio/SKILL.md',
  'skills/drawio-academic-skills/SKILL.md',
  'skills/drawio/evals/evals.json',
  'skills/drawio-academic-skills/evals/evals.json',
  'justfile'
]

function hashFile(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function snapshot(root) {
  return Object.fromEntries(VERSION_PATHS.map((rel) => [rel, hashFile(join(root, rel))]))
}

const copyRoot = mkdtempSync(join(tmpdir(), 'drawio-quality-ac1-'))
for (const rel of VERSION_PATHS) {
  const target = join(copyRoot, rel)
  mkdirSync(dirname(target), { recursive: true })
  cpSync(join(PROJECT_ROOT, rel), target)
}

const skillPath = join(copyRoot, 'skills', 'drawio', 'SKILL.md')
const original = readFileSync(skillPath, 'utf8')
writeFileSync(skillPath, original.replace(/^version:\s*.*$/m, 'version: "0.0.0-drift"'))
const before = snapshot(copyRoot)
writeFileSync(join(TASK_RESEARCH, 'ac1-drift-hashes-before.json'), `${JSON.stringify(before, null, 2)}\n`)

const npmResult = spawnSync(process.execPath, [npmCli, 'run', 'ci'], {
  cwd: copyRoot,
  encoding: 'utf8',
  shell: false,
  windowsHide: true
})
const justResult = spawnSync(
  'just',
  ['--justfile', join(copyRoot, 'justfile'), '--working-directory', copyRoot, 'ci'],
  { cwd: copyRoot, encoding: 'utf8', shell: false, windowsHide: true }
)

const after = snapshot(copyRoot)
writeFileSync(join(TASK_RESEARCH, 'ac1-drift-hashes-after.json'), `${JSON.stringify(after, null, 2)}\n`)
writeFileSync(
  join(TASK_RESEARCH, 'ac1-drift-npm-ci.log'),
  `exit=${npmResult.status}\nstdout:\n${npmResult.stdout || ''}\nstderr:\n${npmResult.stderr || ''}\n`
)
writeFileSync(
  join(TASK_RESEARCH, 'ac1-drift-just-ci.log'),
  `exit=${justResult.status}\nstdout:\n${justResult.stdout || ''}\nstderr:\n${justResult.stderr || ''}\n`
)

const unchanged = JSON.stringify(before) === JSON.stringify(after)
const meta = {
  copyRoot,
  npmExit: npmResult.status,
  justExit: justResult.status,
  hashesUnchanged: unchanged,
  driftedFile: 'skills/drawio/SKILL.md'
}
writeFileSync(join(TASK_RESEARCH, 'ac1-drift.meta.json'), `${JSON.stringify(meta, null, 2)}\n`)
rmSync(copyRoot, { recursive: true, force: true })

if (npmResult.status === 0 || justResult.status === 0 || !unchanged) {
  throw new Error(`AC1 drift evidence failed: ${JSON.stringify(meta)}`)
}

console.log(JSON.stringify(meta, null, 2))

import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const outputPath = process.argv[2]
if (!outputPath) {
  throw new Error('Usage: node hash-tracked.mjs <output.json>')
}

const listing = spawnSync('git', ['ls-files'], {
  encoding: 'utf8',
  shell: false,
  windowsHide: true
})
if (listing.status !== 0) {
  throw new Error(listing.stderr || 'git ls-files failed')
}

const hashes = {}
for (const file of listing.stdout.split(/\r?\n/).filter(Boolean)) {
  hashes[file] = createHash('sha256').update(readFileSync(file)).digest('hex')
}

writeFileSync(outputPath, `${JSON.stringify(hashes, null, 2)}\n`)
console.log(`hashed ${Object.keys(hashes).length} tracked files -> ${outputPath}`)

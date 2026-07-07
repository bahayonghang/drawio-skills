// Offset solver: for each warned labeled edge, try candidate labelOffsets and
// report the first set that clears all label-collision warnings for the file.
import fs from 'node:fs'
import { parseSpecYaml, loadTheme, calculateLayout, validateLabelCollisions } from './dsl/spec-to-drawio.js'

const CANDIDATES = [
  { x: 44, y: 0 },
  { x: -44, y: 0 },
  { x: 56, y: 0 },
  { x: -56, y: 0 },
  { x: 68, y: 0 },
  { x: -68, y: 0 },
  { x: 0, y: -24 },
  { x: 0, y: -32 },
  { x: 0, y: 28 },
  { x: 44, y: -24 },
  { x: -44, y: -24 },
  { x: 56, y: -28 },
  { x: -56, y: -28 },
  { x: 68, y: -32 },
  { x: -68, y: 32 },
  { x: 80, y: 0 },
  { x: -80, y: 0 }
]

const file = process.argv[2]
const spec = parseSpecYaml(fs.readFileSync(file, 'utf8'))
const theme = loadTheme(spec.meta?.theme || 'tech-blue')
const layout = calculateLayout(spec, theme)

const initial = validateLabelCollisions(spec, layout)
console.log('initial warnings:', initial.length)
if (initial.length === 0) process.exit(0)

const warnedKeys = new Set()
for (const w of initial) {
  for (const m of w.matchAll(/"([\w-]+)->([\w-]+)"/g)) warnedKeys.add(`${m[1]}->${m[2]}`)
  const pair = /Labels ([\w-]+)->([\w-]+) and ([\w-]+)->([\w-]+) overlap/.exec(w)
  if (pair) {
    warnedKeys.add(`${pair[1]}->${pair[2]}`)
    warnedKeys.add(`${pair[3]}->${pair[4]}`)
  }
}
const targets = (spec.edges || []).filter((e) => e.label && warnedKeys.has(`${e.from}->${e.to}`))
console.log('tuning edges:', targets.map((e) => `${e.from}->${e.to}`).join(', '))

function search(index) {
  if (index === targets.length) {
    return validateLabelCollisions(spec, layout).length === 0
  }
  const edge = targets[index]
  const original = edge.labelOffset
  for (const candidate of [original, ...CANDIDATES].filter(Boolean)) {
    edge.labelOffset = candidate
    const current = validateLabelCollisions(spec, layout)
    const stillBad = current.some((w) => w.includes(`"${edge.from}->${edge.to}"`))
    if (!stillBad && search(index + 1)) return true
  }
  edge.labelOffset = original
  return false
}

if (search(0)) {
  console.log('SOLVED:')
  for (const e of targets)
    console.log(`  ${e.from}->${e.to}: labelOffset: { x: ${e.labelOffset.x}, y: ${e.labelOffset.y} }`)
} else {
  console.log('NO FULL SOLUTION; best-known warnings:')
  for (const w of validateLabelCollisions(spec, layout)) console.log('  -', w)
}

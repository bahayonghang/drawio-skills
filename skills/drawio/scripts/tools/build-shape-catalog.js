#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync, gunzipSync } from 'node:zlib'
import { COVERED_PREFIXES } from '../dsl/shape-catalog.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const skillRoot = resolve(__dirname, '../..')
const sourcePath = resolve(skillRoot, 'assets/catalog/shape-index.json.gz')
const outputPath = resolve(skillRoot, 'assets/catalog/shape-catalog.json.gz')
const FAMILY_KINDS = new Map([
  ['mxgraph.kubernetes.icon2', 'k8sParamIcon'],
  ['mxgraph.cisco19.rect', 'cisco19ParamIcon'],
  ['mxgraph.aws4.productIcon', 'aws4ProductIcon'],
  ['mxgraph.aws4.group', 'aws4GroupIcon']
])

function styleValue(style, key) {
  return new RegExp(`(?:^|;)${key}=([^;]+)`).exec(style)?.[1] || null
}

function metadata(row) {
  return { t: row.title || '', g: String(row.tags || '').split(/\s+/).filter(Boolean) }
}

export function buildCatalog(rows) {
  const entries = new Map()
  const families = new Map()
  const builtin = new Set()

  for (const row of rows) {
    const style = row.style || ''
    const shape = styleValue(style, 'shape')
    const meta = metadata(row)
    if (shape && !shape.startsWith('mxgraph.')) builtin.add(shape)

    for (const name of [shape, styleValue(style, 'resIcon')]) {
      if (!name || !COVERED_PREFIXES.some((prefix) => name.startsWith(prefix))) continue
      const kind = name === shape ? 'stencil' : 'aws4ResourceIcon'
      const key = `${kind}:${name}`
      const existing = entries.get(key)
      if (existing) {
        existing.g = [...new Set([...existing.g, ...meta.g])].sort()
        if (!existing.t && meta.t) existing.t = meta.t
      } else {
        entries.set(key, { n: name, k: kind, ...meta, g: [...new Set(meta.g)].sort() })
      }
    }

    if (!shape || !FAMILY_KINDS.has(shape)) continue
    const param = ['prIcon', 'resIcon', 'grIcon'].find((key) => styleValue(style, key))
    if (!param) continue
    const value = styleValue(style, param)
    const familyKey = `${shape}:${param}`
    if (!families.has(familyKey)) {
      families.set(familyKey, { base: shape, param, k: FAMILY_KINDS.get(shape), values: new Map() })
    }
    families.get(familyKey).values.set(value, { v: value, ...meta })
  }

  return {
    version: 2,
    generatedFrom: 'shape-index.json.gz (jgraph/drawio-mcp, Apache-2.0)',
    builtin: [...builtin].sort(),
    entries: [...entries.values()].sort((a, b) => a.n.localeCompare(b.n) || a.k.localeCompare(b.k)),
    families: [...families.values()]
      .map((family) => ({ ...family, values: [...family.values.values()].sort((a, b) => a.v.localeCompare(b.v)) }))
      .sort((a, b) => a.base.localeCompare(b.base))
  }
}

export function writeCatalog(source = sourcePath, output = outputPath) {
  const rows = JSON.parse(gunzipSync(readFileSync(source)).toString('utf-8'))
  const catalog = buildCatalog(rows)
  mkdirSync(dirname(output), { recursive: true })
  writeFileSync(output, gzipSync(`${JSON.stringify(catalog)}\n`))
  return catalog
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const catalog = writeCatalog()
  console.log(`catalog v${catalog.version}: ${catalog.entries.length} entries, ${catalog.families.map((f) => `${f.base}=${f.values.length}`).join(', ')}`)
}

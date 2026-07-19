/**
 * shape-catalog.js
 * Lazy-loaded catalog of shape names this repository is allowed to emit.
 *
 * Data file: ../../assets/catalog/shape-catalog.json.gz, filtered from the
 * draw.io default shape libraries (see the _source note inside the file).
 * Used to emit aws4 resource icons with the correct compound style and by
 * validateSpec to warn on unknown `shape=` names before they reach draw.io
 * Desktop, where a typo renders as an empty box.
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const CATALOG_PATH = resolve(__dirname, '../../assets/catalog/shape-catalog.json.gz')

// mxgraph library prefixes this repository can emit; names under other
// prefixes are never produced here and stay unchecked to avoid false alarms.
export const COVERED_PREFIXES = [
  'mxgraph.aws4.',
  'mxgraph.gcp2.',
  'mxgraph.azure.',
  'mxgraph.mscae.',
  'mxgraph.kubernetes.',
  'mxgraph.cisco.',
  'mxgraph.cisco19.',
  'mxgraph.networks.',
  'mxgraph.sysml.',
  'mxgraph.bpmn.'
]

let _catalog = null

/**
 * Load and cache the shape catalog. Returns null when the data file is
 * missing or unreadable so callers can degrade to "no validation".
 * @returns {{ builtin: Set<string>, entries: Object[], stencils: Set<string>, aws4ResourceIcons: Set<string>, families: Map<string, Object> }|null}
 */
export function loadShapeCatalog() {
  if (_catalog !== null) return _catalog
  try {
    const raw = JSON.parse(gunzipSync(readFileSync(CATALOG_PATH)).toString('utf-8'))
    const entries = raw.entries || []
    _catalog = {
      builtin: new Set(raw.builtin || []),
      entries,
      stencils: new Set(raw.stencils || entries.filter((entry) => entry.k === 'stencil').map((entry) => entry.n)),
      aws4ResourceIcons: new Set(raw.aws4ResourceIcons || entries.filter((entry) => entry.k === 'aws4ResourceIcon').map((entry) => entry.n)),
      families: new Map((raw.families || []).map((family) => [`${family.base}:${family.param}`, family]))
    }
  } catch {
    _catalog = false
  }
  return _catalog || null
}

/**
 * Classify a resolved `shape=` candidate name against the catalog.
 * @param {string} name
 * @returns {'stencil'|'builtin'|'aws4ResourceIcon'|'k8sParamIcon'|'cisco19ParamIcon'|'aws4ProductIcon'|'aws4GroupIcon'|'uncovered'|'unknown'|'unchecked'}
 *   - stencil: plain stencil shape, emit as shape=<name>
 *   - builtin: draw.io builtin shape name
 *   - aws4ResourceIcon: only exists as a resource icon, emit as
 *     shape=mxgraph.aws4.resourceIcon;resIcon=<name>
 *   - uncovered: mxgraph library outside the emitted prefixes (not checked)
 *   - unknown: under a covered namespace but absent from the catalog
 *   - unchecked: catalog data unavailable
 */
export function resolveShapeNameKind(name) {
  if (!name) return 'unknown'
  const catalog = loadShapeCatalog()
  if (!catalog) return 'unchecked'
  const parameterized = /^(.*):(prIcon|resIcon|grIcon)=([^;]+)$/.exec(name)
  if (parameterized) {
    const [, base, param, value] = parameterized
    const family = catalog.families.get(`${base}:${param}`)
    return family?.values.some((entry) => entry.v === value) ? family.k : 'unknown'
  }
  if (name.startsWith('mxgraph.')) {
    if (catalog.stencils.has(name)) return 'stencil'
    if (name.startsWith('mxgraph.aws4.') && catalog.aws4ResourceIcons.has(name)) return 'aws4ResourceIcon'
    return COVERED_PREFIXES.some((prefix) => name.startsWith(prefix)) ? 'unknown' : 'uncovered'
  }
  return catalog.builtin.has(name) ? 'builtin' : 'unknown'
}

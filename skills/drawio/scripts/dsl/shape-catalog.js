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
const COVERED_PREFIXES = [
  'mxgraph.aws4.',
  'mxgraph.gcp2.',
  'mxgraph.azure.',
  'mxgraph.kubernetes.',
  'mxgraph.cisco.',
  'mxgraph.cisco19.',
  'mxgraph.networks.'
]

let _catalog = null

/**
 * Load and cache the shape catalog. Returns null when the data file is
 * missing or unreadable so callers can degrade to "no validation".
 * @returns {{ builtin: Set<string>, stencils: Set<string>, aws4ResourceIcons: Set<string> }|null}
 */
export function loadShapeCatalog() {
  if (_catalog !== null) return _catalog
  try {
    const raw = JSON.parse(gunzipSync(readFileSync(CATALOG_PATH)).toString('utf-8'))
    _catalog = {
      builtin: new Set(raw.builtin || []),
      stencils: new Set(raw.stencils || []),
      aws4ResourceIcons: new Set(raw.aws4ResourceIcons || [])
    }
  } catch {
    _catalog = false
  }
  return _catalog || null
}

/**
 * Classify a resolved `shape=` candidate name against the catalog.
 * @param {string} name
 * @returns {'stencil'|'builtin'|'aws4ResourceIcon'|'uncovered'|'unknown'|'unchecked'}
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
  if (name.startsWith('mxgraph.')) {
    if (catalog.stencils.has(name)) return 'stencil'
    if (name.startsWith('mxgraph.aws4.') && catalog.aws4ResourceIcons.has(name)) return 'aws4ResourceIcon'
    return COVERED_PREFIXES.some((prefix) => name.startsWith(prefix)) ? 'unknown' : 'uncovered'
  }
  return catalog.builtin.has(name) ? 'builtin' : 'unknown'
}

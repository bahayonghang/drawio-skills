/**
 * icon-resolver.js
 * Resolves non-draw.io image icons to self-contained draw.io image styles.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const IMAGE_ICON_STYLE_PREFIX =
  'shape=image;html=1;imageAspect=0;aspect=fixed;verticalLabelPosition=bottom;verticalAlign=top;image='
const LOBE_CDN_BASE = 'https://unpkg.com/@lobehub/icons-static-svg@1.91.0/icons/'
const require = createRequire(import.meta.url)

let lucideIconsDir
const lucideSvgCache = new Map()

const LUCIDE_ALIASES = {
  ai: 'brain-circuit',
  brain: 'brain-circuit',
  cache: 'database-zap',
  database: 'database',
  document: 'file-text',
  docs: 'file-text',
  llm: 'bot',
  pipeline: 'workflow'
}

const BRAND_ALIASES = {
  redis: 'redis'
}

const LOBE_ALIASES = {
  anthropic: 'claude',
  chatgpt: 'openai',
  hugging_face: 'huggingface',
  'hugging-face': 'huggingface',
  open_ai: 'openai',
  'open-ai': 'openai'
}

// Normalized from @lobehub/icons-static-svg (MIT) for icons that draw.io does
// not reliably render from external SVG URLs during PNG export.
const LOBE_PATHS = {
  claude:
    '<path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z"/>',
  gemini:
    '<path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z"/>',
  openai:
    '<path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z"/>'
}

const LUCIDE_PATHS = {
  bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
  'brain-circuit':
    '<path d="M12 5a3 3 0 0 0-5.7-1.4A3.5 3.5 0 0 0 2 7c0 1.7 1.2 3.1 2.8 3.4A4 4 0 0 0 8 17h1"/><path d="M12 5a3 3 0 0 1 5.7-1.4A3.5 3.5 0 0 1 22 7c0 1.7-1.2 3.1-2.8 3.4A4 4 0 0 1 16 17h-1"/><path d="M9 17v3"/><path d="M15 17v3"/><path d="M9 20h6"/><path d="M12 12h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/>',
  cloud: '<path d="M17.5 19H8a6 6 0 1 1 1.6-11.8A7 7 0 0 1 23 10.5a4.5 4.5 0 0 1-5.5 8.5Z"/>',
  cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M20 15h2"/><path d="M9 2v2"/><path d="M9 20v2"/><path d="M2 9h2"/><path d="M20 9h2"/>',
  database:
    '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
  'database-zap':
    '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3 1.5 0 2.9-.1 4-.4"/><path d="M3 12c0 1.7 4 3 9 3 1 0 2-.1 2.9-.2"/><path d="m18 13-3 5h4l-2 5 5-7h-4l2-3Z"/>',
  'file-text':
    '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v6h6"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  layers:
    '<path d="m12 2 10 5-10 5L2 7Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
  network:
    '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M12 8v8"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  server:
    '<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.3 8.8a2 2 0 0 1-1.4 0C7.5 20.5 4 18 4 13V5l8-3 8 3Z"/>',
  workflow:
    '<rect width="8" height="8" x="3" y="3" rx="2"/><rect width="8" height="8" x="13" y="13" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><path d="M11 7h4a2 2 0 0 1 2 2v4"/>'
}

const BRAND_SVGS = {
  openai:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#ffffff"/><g fill="none" stroke="#111111" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M32 10c8 0 14 6 14 14 5 3 8 8 8 14 0 8-6 14-14 14-3 5-8 8-14 8-8 0-14-6-14-14-5-3-8-8-8-14 0-8 6-14 14-14 3-5 8-8 14-8z"/><path d="M24 25h16v14H24z"/><path d="M32 10v15M46 24l-14 8M47 46l-15-7M32 54V39M17 46l15-7M17 18l15 7"/></g></svg>',
  redis:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#DC382D"/><g fill="#ffffff"><path d="M12 21 32 12l20 9-20 9z"/><path d="M12 32v7l20 9 20-9v-7L32 41z"/><path d="M12 43v7l20 9 20-9v-7L32 52z"/></g></svg>'
}

function svgDataUri(svg) {
  return `data:image/svg+xml,${encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')}`
}

function lucideSvg(pathMarkup) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1E293B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${pathMarkup}</svg>`
}

function lucideStaticIconsDir() {
  if (lucideIconsDir !== undefined) return lucideIconsDir
  try {
    lucideIconsDir = path.join(path.dirname(require.resolve('lucide-static/package.json')), 'icons')
  } catch {
    lucideIconsDir = null
  }
  return lucideIconsDir
}

function safeLucideSlug(slug) {
  if (!slug || typeof slug !== 'string') return null
  const normalized = slug.trim().toLowerCase()
  return /^[a-z][a-z0-9-]*$/.test(normalized) ? normalized : null
}

function normalizeLucideStaticSvg(svg) {
  return svg.replace(/currentColor/g, '#1E293B').replace(/\s+/g, ' ').trim()
}

function loadLucideStaticSvg(slug) {
  const safeSlug = safeLucideSlug(slug)
  if (!safeSlug) return null
  if (lucideSvgCache.has(safeSlug)) return lucideSvgCache.get(safeSlug)

  const iconsDir = lucideStaticIconsDir()
  if (!iconsDir) return null

  try {
    const svg = normalizeLucideStaticSvg(readFileSync(path.join(iconsDir, `${safeSlug}.svg`), 'utf8'))
    lucideSvgCache.set(safeSlug, svg)
    return svg
  } catch {
    lucideSvgCache.set(safeSlug, null)
    return null
  }
}

function lucideIconStyle(slug) {
  const lucideName = LUCIDE_ALIASES[slug] || slug
  const svg = loadLucideStaticSvg(lucideName)
  if (svg) return `${IMAGE_ICON_STYLE_PREFIX}${svgDataUri(svg)}`

  const pathMarkup = LUCIDE_PATHS[lucideName]
  return pathMarkup ? `${IMAGE_ICON_STYLE_PREFIX}${svgDataUri(lucideSvg(pathMarkup))}` : null
}

function lobeSvg(pathMarkup) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#111827" fill-rule="evenodd">${pathMarkup}</svg>`
}

function safeIconSlug(slug) {
  if (!slug || typeof slug !== 'string') return null
  const normalized = slug.trim().toLowerCase()
  return /^[a-z][a-z0-9._-]*$/.test(normalized) ? normalized : null
}

function lobeIconStyle(slug) {
  const safeSlug = safeIconSlug(LOBE_ALIASES[slug] || slug)
  if (!safeSlug) return null
  const pathMarkup = LOBE_PATHS[safeSlug]
  if (pathMarkup) return `${IMAGE_ICON_STYLE_PREFIX}${svgDataUri(lobeSvg(pathMarkup))}`
  return `${IMAGE_ICON_STYLE_PREFIX}${LOBE_CDN_BASE}${safeSlug}.svg`
}

function normalizeImageIconName(icon) {
  if (typeof icon !== 'string') return null
  return icon.trim().toLowerCase()
}

export function isImageIconName(icon) {
  return resolveImageIconStyle(icon) !== null
}

export function resolveImageIconStyle(icon) {
  const name = normalizeImageIconName(icon)
  if (!name) return null

  if (name.startsWith('brand.')) {
    const brandKey = name.slice('brand.'.length)
    if (brandKey === 'openai') return lobeIconStyle('openai')
    const brandName = BRAND_ALIASES[brandKey] || brandKey
    const svg = BRAND_SVGS[brandName]
    return svg ? `${IMAGE_ICON_STYLE_PREFIX}${svgDataUri(svg)}` : null
  }

  if (name.startsWith('lobe.') || name.startsWith('ai.')) {
    return lobeIconStyle(name.slice(name.indexOf('.') + 1))
  }

  if (name.startsWith('lucide.')) {
    return lucideIconStyle(name.slice('lucide.'.length))
  }

  if (name === 'openai') return lobeIconStyle('openai')

  const brandName = BRAND_ALIASES[name]
  if (brandName) {
    return `${IMAGE_ICON_STYLE_PREFIX}${svgDataUri(BRAND_SVGS[brandName])}`
  }

  return null
}

/**
 * icon-resolver.js
 * Resolves non-draw.io image icons to self-contained draw.io image styles.
 */

const IMAGE_ICON_STYLE_PREFIX =
  'shape=image;html=1;imageAspect=0;aspect=fixed;verticalLabelPosition=bottom;verticalAlign=top;image='

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
  openai: 'openai',
  redis: 'redis'
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
    const brandName = BRAND_ALIASES[name.slice('brand.'.length)] || name.slice('brand.'.length)
    const svg = BRAND_SVGS[brandName]
    return svg ? `${IMAGE_ICON_STYLE_PREFIX}${svgDataUri(svg)}` : null
  }

  if (name.startsWith('lucide.')) {
    const lucideName = LUCIDE_ALIASES[name.slice('lucide.'.length)] || name.slice('lucide.'.length)
    const pathMarkup = LUCIDE_PATHS[lucideName]
    return pathMarkup ? `${IMAGE_ICON_STYLE_PREFIX}${svgDataUri(lucideSvg(pathMarkup))}` : null
  }

  const brandName = BRAND_ALIASES[name]
  if (brandName) {
    return `${IMAGE_ICON_STYLE_PREFIX}${svgDataUri(BRAND_SVGS[brandName])}`
  }

  return null
}


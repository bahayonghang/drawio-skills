import { buildPageLink } from '../dsl/document-spec.js'
import { renderDocumentPages } from '../dsl/multi-page.js'
import { drawioToSvg } from '../svg/drawio-to-svg.js'
import { normalizePostprocessInput, selectPostprocessPages } from './input.js'

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ')
}

function assertSafeHtmlText(value, context) {
  const text = String(value ?? '')
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)) {
    throw new Error(`unsafe HTML text in ${context}: control character`)
  }
  if (/javascript:|data:text\/html|<\s*script\b|\bon[a-z]+\s*=|https?:\/\//i.test(text)) {
    throw new Error(`unsafe HTML text in ${context}`)
  }
}

function assertSafeDocumentText(document) {
  assertSafeHtmlText(document.meta?.title, 'document title')
  for (const page of document.pages) {
    assertSafeHtmlText(page.id, `page ${page.id} id`)
    assertSafeHtmlText(page.name, `page ${page.id} name`)
    assertSafeHtmlText(page.meta?.title, `page ${page.id} title`)
    for (const collection of [page.nodes, page.modules, page.edges]) {
      for (const object of collection || []) assertSafeHtmlText(object.label, `${page.id}/${object.id} label`)
    }
  }
}

function assertSafeSvg(svg, pageId) {
  if (
    /<\s*script\b|\bon[a-z]+\s*=|javascript:|data:text\/html/i.test(svg) ||
    /(?:href|xlink:href|src)\s*=\s*["']https?:\/\//i.test(svg) ||
    /url\(\s*["']?https?:\/\//i.test(svg) ||
    /<foreignObject\b/i.test(svg)
  ) {
    throw new Error(`unsafe SVG payload on page "${pageId}"`)
  }
  if (!svg.startsWith('<svg')) throw new Error(`SVG renderer returned an invalid payload for page "${pageId}"`)
}

function cssSafeId(id) {
  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(id)) throw new Error(`unsafe HTML page id "${id}"`)
  return id
}

function selectedRenderDocument(document, pages) {
  const pageIds = new Set(pages.map((page) => page.id))
  return {
    kind: 'multi-page-v1',
    legacy: false,
    schemaVersion: 1,
    meta: document.meta || {},
    pages,
    links: (document.links || []).filter((link) => pageIds.has(link.from.pageId) && pageIds.has(link.to.pageId))
  }
}

function linkMarkup(document, page) {
  const links = (document.links || []).filter((link) => link.from.pageId === page.id)
  if (links.length === 0) return ''
  const lines = ['<ul class="page-links">']
  for (const link of links) {
    const href = buildPageLink(link.to.pageId)
    const targetPage = document.pages.find((item) => item.id === link.to.pageId)
    const target = targetPage?.nodes.concat(targetPage.modules).find((object) => object.id === link.to.objectId)
    const text = target ? `${targetPage.name}: ${target.label}` : `${link.to.pageId}/${link.to.objectId}`
    lines.push(
      `  <li><label for="page-toggle-${cssSafeId(link.to.pageId)}" data-page-link="${escapeHtml(href)}" data-from="${escapeHtml(`${link.from.pageId}/${link.from.objectId}`)}">${escapeHtml(text)}</label></li>`
    )
  }
  lines.push('</ul>')
  return lines.join('\n')
}

function searchMarkup(pages, query) {
  const normalizedQuery = String(query || '').trim().toLowerCase()
  if (!normalizedQuery) return ''
  const results = []
  for (const page of pages) {
    for (const collection of [page.nodes, page.modules, page.edges]) {
      for (const object of collection || []) {
        const label = String(object.label || object.id)
        if (label.toLowerCase().includes(normalizedQuery)) results.push({ page, label })
      }
    }
  }
  const lines = ['  <section class="search-summary" aria-label="Search results">']
  lines.push(`    <div>Search results for <strong>${escapeHtml(query)}</strong></div>`)
  if (results.length === 0) {
    lines.push('    <p class="search-empty">No matching labels</p>')
  } else {
    lines.push('    <ol class="search-results">')
    for (const { page, label } of results) {
      lines.push(
        `      <li><label for="page-toggle-${cssSafeId(page.id)}">${escapeHtml(`${page.name}: ${label}`)}</label></li>`
      )
    }
    lines.push('    </ol>')
  }
  lines.push('  </section>')
  return lines.join('\n')
}

const VIEWER_CSS = `
:root { color-scheme: light; font-family: Arial, Helvetica, sans-serif; background: #f7f9fc; color: #182230; }
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
.toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; padding: 1rem 1.25rem; background: #ffffff; border-bottom: 1px solid #d9e1ec; }
.title { font-size: 1.05rem; font-weight: 700; margin-right: auto; }
.control-group { display: inline-flex; align-items: center; gap: 0.25rem; }
.control-group label, .tabs label { cursor: pointer; border: 1px solid #b8c5d6; background: #ffffff; padding: 0.35rem 0.6rem; font-size: 0.85rem; }
.control-group label:hover, .tabs label:hover { background: #eef4fb; }
.tabs { display: flex; flex-wrap: wrap; gap: 0.4rem; padding: 0.8rem 1.25rem; background: #ffffff; border-bottom: 1px solid #d9e1ec; }
.tabs label { border-radius: 3px; }
.page-toggle:checked + label { color: #ffffff; background: #245b9e; border-color: #245b9e; }
.zoom-toggle:checked + label { color: #ffffff; background: #245b9e; border-color: #245b9e; }
.viewer { overflow: auto; padding: 1.25rem; }
.page-panel { display: none; max-width: 1400px; margin: 0 auto; padding: 1rem; background: #ffffff; border: 1px solid #d9e1ec; }
.page-panel h2 { margin: 0 0 0.75rem; font-size: 1.1rem; }
.page-svg-wrap { overflow: auto; min-height: 160px; transform-origin: top left; }
.page-svg { display: block; transform-origin: top left; }
.page-links { display: flex; flex-wrap: wrap; gap: 0.75rem; padding: 0.75rem 0 0; margin: 0; list-style: none; border-top: 1px solid #e4eaf2; }
.page-links label, .search-results label { color: #245b9e; cursor: pointer; text-decoration: underline; }
.search-summary { padding: 0.75rem 1.25rem; background: #ffffff; border-bottom: 1px solid #d9e1ec; }
.search-results { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; margin: 0.5rem 0 0; padding-left: 1.25rem; }
.search-empty { margin: 0.5rem 0 0; color: #5c6c80; }
.postprocess-note { margin: 0.75rem 0 0; color: #5c6c80; font-size: 0.8rem; }
#zoom-75:checked ~ .viewer .page-svg { transform: scale(0.75); }
#zoom-100:checked ~ .viewer .page-svg { transform: scale(1); }
#zoom-125:checked ~ .viewer .page-svg { transform: scale(1.25); }
`

export async function renderHtml(value, options = {}) {
  const document = normalizePostprocessInput(value)
  assertSafeDocumentText(document)
  if (options.title != null) assertSafeHtmlText(options.title, 'viewer title')
  if (options.search != null) assertSafeHtmlText(options.search, 'search value')
  const { pages } = selectPostprocessPages(document, {
    page: options.page,
    allPages: options.page == null ? options.allPages !== false : options.allPages
  })
  const renderDocument = selectedRenderDocument(document, pages)
  const renderedPages = await renderDocumentPages(renderDocument, { silent: true })
  const renderedById = new Map(renderedPages.map((page) => [page.id, page]))
  const title = options.title || document.meta?.title || pages[0]?.name || 'Draw.io viewer'
  const firstPageId = pages[0].id
  const lines = ['<!doctype html>', '<html lang="en">', '<head>', '  <meta charset="utf-8">', '  <meta name="viewport" content="width=device-width, initial-scale=1">']
  lines.push(`  <title>${escapeHtml(title)}</title>`, `  <style>${VIEWER_CSS}</style>`, '</head>', '<body>')

  for (const zoom of [75, 100, 125]) {
    lines.push(
      `  <input class="sr-only zoom-toggle" type="radio" id="zoom-${zoom}" name="zoom" value="${zoom}" data-zoom="${zoom}"${zoom === 100 ? ' checked' : ''}>`
    )
  }
  for (const page of pages) cssSafeId(page.id)
  for (const page of pages) {
    lines.push(
      `  <input class="sr-only page-toggle" type="radio" id="page-toggle-${page.id}" name="page" value="${page.id}"${page.id === firstPageId ? ' checked' : ''}>`
    )
  }

  lines.push('  <header class="toolbar">', `    <div class="title">${escapeHtml(title)}</div>`)
  lines.push('    <div class="control-group" aria-label="Zoom">', '      <span>Zoom</span>')
  for (const zoom of [75, 100, 125]) lines.push(`      <label for="zoom-${zoom}">${zoom}%</label>`)
  lines.push('    </div>', '    <div class="control-group">', '      <label for="search">Search</label>')
  lines.push(`      <input type="search" id="search" value="${escapeHtml(options.search || '')}" placeholder="Search labels" autocomplete="off" readonly>`)
  lines.push('    </div>', '  </header>')
  const search = searchMarkup(pages, options.search)
  if (search) lines.push(search)
  lines.push('  <nav class="tabs" aria-label="Pages">')
  for (const page of pages) lines.push(`    <label for="page-toggle-${page.id}">${escapeHtml(page.name)}</label>`)
  lines.push('  </nav>')
  lines.push(`  <main class="viewer" data-search="${escapeHtml(options.search || '')}">`)
  for (const page of pages) {
    const rendered = renderedById.get(page.id)
    const svg = drawioToSvg(rendered.xml)
    assertSafeSvg(svg, page.id)
    lines.push(`    <section class="page-panel page-${page.id}" data-page-id="${page.id}">`)
    lines.push(`      <h2>${escapeHtml(page.name)}</h2>`, `      <div class="page-svg-wrap"><div class="page-svg">${svg}</div></div>`)
    lines.push(linkMarkup(renderDocument, page))
    lines.push(`      <p class="postprocess-note">Page ${escapeHtml(page.id)} · offline projection</p>`, '    </section>')
  }
  lines.push('  </main>')
  for (const page of pages) lines.push(`  <style>#page-toggle-${page.id}:checked ~ .viewer .page-${page.id} { display: block; }</style>`)
  lines.push('</body>', '</html>', '')
  return lines.join('\n')
}

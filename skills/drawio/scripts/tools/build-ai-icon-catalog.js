#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { gzipSync, gunzipSync } from 'node:zlib'

import {
  AI_ICON_CATALOG_COUNTS,
  AI_ICON_CATALOG_SCHEMA_VERSION,
  AI_ICON_SOURCE
} from '../shared/ai-icon-contract.js'

export { AI_ICON_SOURCE } from '../shared/ai-icon-contract.js'

const DEFAULT_EXPECTED = AI_ICON_CATALOG_COUNTS
const VARIANT_SUFFIX = /(?:-text-color|-text-[a-z]{2}|-text|-brand-color|-brand|-color)$/
const LOCAL_FRAGMENT = /^#[A-Za-z_][A-Za-z0-9_.:-]*$/
const MAX_SVG_BYTES = 128 * 1024

function sourcePath(value) {
  return value instanceof URL ? fileURLToPath(value) : resolve(String(value))
}

function asciiCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0
}

function normalizeSvg(svg, filename) {
  if (Buffer.byteLength(svg, 'utf8') > MAX_SVG_BYTES) {
    throw new Error(`AI icon source ${filename} exceeds ${MAX_SVG_BYTES} bytes`)
  }
  if (!/^\s*<svg\b/i.test(svg) || !/\bviewBox\s*=\s*["'][^"']+["']/i.test(svg)) {
    throw new Error(`AI icon source ${filename} must have an SVG root and viewBox`)
  }
  if (/<!DOCTYPE\b|<!ENTITY\b|<\?[\s\S]*?\?>/i.test(svg)) {
    throw new Error(`AI icon source ${filename} contains a forbidden declaration or processing instruction`)
  }
  if (/<\/?(?:[A-Za-z_][\w.-]*:)?(?:script|foreignObject|image)\b/i.test(svg)) {
    throw new Error(`AI icon source ${filename} contains a forbidden active or embedded element`)
  }
  if (/\s(?:[A-Za-z_][\w.-]*:)?on[a-z0-9_-]+\s*=/i.test(svg)) {
    throw new Error(`AI icon source ${filename} contains an event attribute`)
  }
  if (/@import\b/i.test(svg)) {
    throw new Error(`AI icon source ${filename} contains an external CSS import`)
  }
  for (const match of svg.matchAll(/\s((?:xlink:)?href|src)\s*=\s*(["'])(.*?)\2/gi)) {
    const [, attribute, , value] = match
    if (attribute.toLowerCase() === 'src' || !LOCAL_FRAGMENT.test(value.trim())) {
      throw new Error(`AI icon source ${filename} contains an external ${attribute} reference; only local fragments are allowed`)
    }
  }
  if (/\s(?:xlink:)?href\s*=\s*[^"']/i.test(svg) || /\ssrc\s*=\s*[^"']/i.test(svg)) {
    throw new Error(`AI icon source ${filename} contains an unquoted resource reference`)
  }
  for (const match of svg.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)) {
    if (!LOCAL_FRAGMENT.test(match[2].trim())) {
      throw new Error(`AI icon source ${filename} contains an external CSS URL; only local fragments are allowed`)
    }
  }
  return svg
    .replace(/(<svg\b[^>]*\bwidth\s*=\s*)["']1em["']/i, '$1"24"')
    .replace(/(<svg\b[^>]*\bheight\s*=\s*)["']1em["']/i, '$1"24"')
    .trim()
}

function deterministicGzip(text) {
  const bytes = gzipSync(Buffer.from(text, 'utf8'), { level: 9, mtime: 0 })
  bytes[3] = 0
  bytes.fill(0, 4, 8)
  bytes[8] = 2
  bytes[9] = 255
  return bytes
}

function validatePackage(sourceDir) {
  const metadata = JSON.parse(readFileSync(join(sourceDir, 'package.json'), 'utf8'))
  for (const [key, expected] of Object.entries({
    name: AI_ICON_SOURCE.package,
    version: AI_ICON_SOURCE.version,
    license: AI_ICON_SOURCE.license
  })) {
    if (metadata[key] !== expected) {
      throw new Error(`AI icon source package ${key} must be ${JSON.stringify(expected)}; received ${JSON.stringify(metadata[key])}`)
    }
  }
}

function selectIcons(sourceDir, expected) {
  const iconsDir = join(sourceDir, 'icons')
  const variants = readdirSync(iconsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.svg'))
    .map((entry) => entry.name.slice(0, -4))
    .sort(asciiCompare)
  if (variants.length !== expected.variants) {
    throw new Error(`AI icon source must contain ${expected.variants} SVG variants; received ${variants.length}`)
  }

  const families = new Map()
  for (const variant of variants) {
    const slug = variant.replace(VARIANT_SUFFIX, '')
    if (!families.has(slug)) families.set(slug, new Set())
    families.get(slug).add(variant)
  }
  if (families.size !== expected.brands) {
    throw new Error(`AI icon source must contain ${expected.brands} base brands; received ${families.size}`)
  }

  const distribution = { color: 0, brandColor: 0, base: 0 }
  const icons = []
  for (const slug of [...families.keys()].sort(asciiCompare)) {
    const family = families.get(slug)
    let variant
    let kind
    if (family.has(`${slug}-color`)) {
      variant = `${slug}-color`
      kind = 'color'
    } else if (family.has(`${slug}-brand-color`)) {
      variant = `${slug}-brand-color`
      kind = 'brandColor'
    } else if (family.has(slug)) {
      variant = slug
      kind = 'base'
    } else {
      throw new Error(`AI icon family ${slug} has no canonical color, brand-color, or base variant`)
    }
    distribution[kind]++
    const filename = `${variant}.svg`
    icons.push({ slug, variant, svg: normalizeSvg(readFileSync(join(iconsDir, filename), 'utf8'), filename) })
  }

  assertDistribution(distribution, expected.distribution)
  return { icons, distribution, variants: variants.length }
}

function assertDistribution(actual, expected) {
  for (const key of ['color', 'brandColor', 'base']) {
    if (actual[key] !== expected[key]) {
      throw new Error(`AI icon ${key} variant count must be ${expected[key]}; received ${actual[key]}`)
    }
  }
}

export function buildAiIconCatalog({ sourceDir, output, integrity, expected = DEFAULT_EXPECTED }) {
  if (!sourceDir || !output) throw new TypeError('buildAiIconCatalog requires sourceDir and output')
  if (integrity !== AI_ICON_SOURCE.integrity) {
    throw new Error(`AI icon source integrity must be ${AI_ICON_SOURCE.integrity}`)
  }
  const input = sourcePath(sourceDir)
  const destination = resolve(String(output))
  validatePackage(input)
  const selected = selectIcons(input, expected)
  const catalog = {
    schemaVersion: AI_ICON_CATALOG_SCHEMA_VERSION,
    source: {
      package: AI_ICON_SOURCE.package,
      version: AI_ICON_SOURCE.version,
      integrity: AI_ICON_SOURCE.integrity,
      license: AI_ICON_SOURCE.license,
      variantOrder: [...AI_ICON_SOURCE.variantOrder]
    },
    icons: selected.icons
  }
  const json = `${JSON.stringify(catalog)}\n`
  const bytes = deterministicGzip(json)
  const temporary = `${destination}.tmp`
  mkdirSync(dirname(destination), { recursive: true })
  try {
    writeFileSync(temporary, bytes)
    JSON.parse(gunzipSync(readFileSync(temporary)).toString('utf8'))
    renameSync(temporary, destination)
  } finally {
    rmSync(temporary, { force: true })
  }
  return {
    variants: selected.variants,
    brands: selected.icons.length,
    distribution: selected.distribution,
    output: destination,
    uncompressedBytes: Buffer.byteLength(json),
    gzipBytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex')
  }
}

function parseCliArgs(args) {
  const options = {}
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index]
    const value = args[index + 1]
    if (!['--source-dir', '--integrity', '--output'].includes(flag) || value === undefined) {
      throw new Error('Usage: build-ai-icon-catalog --source-dir <dir> --integrity <sri> --output <file>')
    }
    options[flag.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value
  }
  return options
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = buildAiIconCatalog(parseCliArgs(process.argv.slice(2)))
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

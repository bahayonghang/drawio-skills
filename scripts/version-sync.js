#!/usr/bin/env node
/**
 * Version sync utility for this repo.
 *
 * Default source of truth: skills/drawio/SKILL.md frontmatter version.
 * Can override with a positional version arg or --version.
 *
 * Sync targets:
 * - package.json (root)
 * - package-lock.json (root + packages[""].version)
 * - skills/drawio/SKILL.md frontmatter version
 * - skills/drawio/evals/evals.json version
 *
 * Usage:
 *   node scripts/version-sync.js --check
 *   node scripts/version-sync.js
 *   node scripts/version-sync.js 2.3.0
 *   node scripts/version-sync.js --version 2.3.0
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const REPO_ROOT = resolve(__dirname, '..')

const PATHS = {
  packageJson: resolve(REPO_ROOT, 'package.json'),
  packageLock: resolve(REPO_ROOT, 'package-lock.json'),
  skillMd: resolve(REPO_ROOT, 'skills/drawio/SKILL.md'),
  evalsJson: resolve(REPO_ROOT, 'skills/drawio/evals/evals.json')
}

const SEMVER_RE = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/

function usageAndExit(code = 2) {
  // eslint-disable-next-line no-console
  console.error(
    [
      'Usage:',
      '  node scripts/version-sync.js [--check] [<version>]',
      '  node scripts/version-sync.js [--check] --version <version>'
    ].join('\n')
  )
  process.exit(code)
}

function parseArgs(argv) {
  const out = { check: false, version: null }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--check') {
      out.check = true
      continue
    }
    if (arg === '--version') {
      const next = argv[i + 1]
      if (!next) usageAndExit()
      out.version = next
      i++
      continue
    }
    if (arg.startsWith('-')) {
      usageAndExit()
    }
    if (out.version == null) {
      out.version = arg
      continue
    }
    usageAndExit()
  }
  return out
}

function readText(path) {
  return readFileSync(path, 'utf-8')
}

function writeText(path, text) {
  writeFileSync(path, text, 'utf-8')
}

function parseSkillFrontmatter(text) {
  const match = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n/m.exec(text)
  if (!match) {
    throw new Error('SKILL.md is missing YAML frontmatter')
  }
  return { frontmatter: match[1], fullMatch: match[0] }
}

function getSkillVersion(text) {
  const { frontmatter } = parseSkillFrontmatter(text)
  const match = /^version:\s*["']?([^"'\r\n]+)["']?\s*$/m.exec(frontmatter)
  if (!match) throw new Error('SKILL.md frontmatter missing version field')
  return match[1].trim()
}

function setSkillVersion(text, version) {
  const { frontmatter, fullMatch } = parseSkillFrontmatter(text)
  const hasVersion = /^version:\s*/m.test(frontmatter)
  const updatedFrontmatter = hasVersion
    ? frontmatter.replace(/^version:\s*.*$/m, `version: "${version}"`)
    : frontmatter + `\nversion: "${version}"\n`
  const updatedHeader = fullMatch.replace(frontmatter, updatedFrontmatter.trimEnd())
  return text.replace(fullMatch, updatedHeader)
}

function readJson(path) {
  return JSON.parse(readText(path))
}

function writeJson(path, obj) {
  const text = JSON.stringify(obj, null, 2) + '\n'
  writeText(path, text)
}

function getPackageVersion(pkg) {
  if (!pkg || typeof pkg !== 'object') throw new Error('Invalid package.json')
  if (typeof pkg.version !== 'string') throw new Error('package.json missing version field')
  return pkg.version
}

function patchPackageLockText(text, version) {
  let updated = text

  const topLevelRe = /("name"\s*:\s*"drawio-skills"\s*,\s*\r?\n\s*)"version"\s*:\s*"[^"]+"/m
  const packagesRootRe = /("packages"\s*:\s*\{\s*\r?\n\s*"":\s*\{\s*\r?\n\s*"name"\s*:\s*"drawio-skills"\s*,\s*\r?\n\s*)"version"\s*:\s*"[^"]+"/m

  let replacements = 0
  updated = updated.replace(topLevelRe, (_m, prefix) => {
    replacements++
    return `${prefix}"version": "${version}"`
  })
  updated = updated.replace(packagesRootRe, (_m, prefix) => {
    replacements++
    return `${prefix}"version": "${version}"`
  })

  if (replacements !== 2) {
    throw new Error(`package-lock.json format unexpected; version patch replacements=${replacements}`)
  }

  return updated
}

function ensureSemver(version) {
  if (!SEMVER_RE.test(version)) {
    throw new Error(`Invalid version "${version}". Expected semver like 2.2.0`)
  }
}

function readAllVersions() {
  const pkg = readJson(PATHS.packageJson)
  const packageVersion = getPackageVersion(pkg)

  const lockText = readText(PATHS.packageLock)
  const lockTop = /"name"\s*:\s*"drawio-skills"\s*,\s*\r?\n\s*"version"\s*:\s*"([^"]+)"/m.exec(lockText)?.[1] || null
  const lockPackages = /"packages"\s*:\s*\{\s*\r?\n\s*"":\s*\{\s*\r?\n\s*"name"\s*:\s*"drawio-skills"\s*,\s*\r?\n\s*"version"\s*:\s*"([^"]+)"/m.exec(lockText)?.[1] || null

  const skillText = readText(PATHS.skillMd)
  const skillVersion = getSkillVersion(skillText)

  const evals = readJson(PATHS.evalsJson)
  const evalsVersion = typeof evals.version === 'string' ? evals.version : null

  return {
    packageVersion,
    lockTop,
    lockPackages,
    skillVersion,
    evalsVersion
  }
}

function main() {
  const { check, version: requestedVersion } = parseArgs(process.argv.slice(2))

  const skillText = readText(PATHS.skillMd)
  const defaultVersion = getSkillVersion(skillText)
  const targetVersion = requestedVersion ?? defaultVersion
  ensureSemver(targetVersion)

  const versions = readAllVersions()
  const mismatches = []

  if (versions.packageVersion !== targetVersion) mismatches.push(`package.json: ${versions.packageVersion} != ${targetVersion}`)
  if (versions.lockTop !== targetVersion) mismatches.push(`package-lock.json (root): ${versions.lockTop} != ${targetVersion}`)
  if (versions.lockPackages !== targetVersion) mismatches.push(`package-lock.json (packages[""]): ${versions.lockPackages} != ${targetVersion}`)
  if (versions.skillVersion !== targetVersion) mismatches.push(`skills/drawio/SKILL.md: ${versions.skillVersion} != ${targetVersion}`)
  if (versions.evalsVersion !== targetVersion) mismatches.push(`skills/drawio/evals/evals.json: ${versions.evalsVersion} != ${targetVersion}`)

  if (check) {
    if (mismatches.length > 0) {
      // eslint-disable-next-line no-console
      console.error('Version mismatch detected:\n' + mismatches.map(m => `- ${m}`).join('\n'))
      process.exit(1)
    }
    // eslint-disable-next-line no-console
    console.log(`OK: versions are synced at ${targetVersion}`)
    return
  }

  const pkg = readJson(PATHS.packageJson)
  if (pkg.version !== targetVersion) {
    pkg.version = targetVersion
    writeJson(PATHS.packageJson, pkg)
    // eslint-disable-next-line no-console
    console.log(`Updated package.json -> ${targetVersion}`)
  }

  const lockText = readText(PATHS.packageLock)
  const patchedLock = patchPackageLockText(lockText, targetVersion)
  if (patchedLock !== lockText) {
    writeText(PATHS.packageLock, patchedLock)
    // eslint-disable-next-line no-console
    console.log(`Updated package-lock.json -> ${targetVersion}`)
  }

  const updatedSkill = setSkillVersion(skillText, targetVersion)
  if (updatedSkill !== skillText) {
    writeText(PATHS.skillMd, updatedSkill)
    // eslint-disable-next-line no-console
    console.log(`Updated skills/drawio/SKILL.md -> ${targetVersion}`)
  }

  const evals = readJson(PATHS.evalsJson)
  if (evals.version !== targetVersion) {
    evals.version = targetVersion
    writeJson(PATHS.evalsJson, evals)
    // eslint-disable-next-line no-console
    console.log(`Updated skills/drawio/evals/evals.json -> ${targetVersion}`)
  }

  const post = readAllVersions()
  const stillBad = [
    post.packageVersion,
    post.lockTop,
    post.lockPackages,
    post.skillVersion,
    post.evalsVersion
  ].some(v => v !== targetVersion)

  if (stillBad) {
    throw new Error('Version sync did not converge; please inspect files manually')
  }
}

try {
  main()
} catch (err) {
  // eslint-disable-next-line no-console
  console.error(`Error: ${err.message}`)
  process.exit(1)
}


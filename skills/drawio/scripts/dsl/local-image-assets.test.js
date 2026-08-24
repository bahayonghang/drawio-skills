import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parseDocumentYaml } from './document-spec.js'
import { specToDrawioXml, validateAcademicProfile, validateSpec } from './spec-to-drawio.js'
import { drawioToSpec } from './drawio-to-spec.js'
import { createDrawioFileContent } from '../runtime/artifacts.js'
import { serializeSpecYaml } from '../runtime/artifacts.js'
import { applyHeatmap, applyRelabel, applyRestyle } from '../postprocess/mutate.js'
import { explainDocument, renderMermaid } from '../postprocess/projection.js'
import { renderHtml } from '../postprocess/html.js'
import { ASSET_SIZE_ERROR_BYTES, ASSET_SIZE_WARNING_BYTES, ASSET_TOTAL_ERROR_BYTES } from './asset-resolver.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CLI = resolve(__dirname, '../cli.js')
const SKILL_ROOT = resolve(__dirname, '../..')
const PNG_1X1 = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082',
  'hex'
)
const PNG_SHA256 = createHash('sha256').update(PNG_1X1).digest('hex').toUpperCase()

function posixRel(from, to) {
  return relative(from, to).split('\\').join('/')
}

function paddedPng(byteLength) {
  if (byteLength < PNG_1X1.length) throw new Error('padded png too small')
  const buf = Buffer.alloc(byteLength)
  PNG_1X1.copy(buf)
  return buf
}

function writeYaml(root, name, spec) {
  const text = typeof spec === 'string' ? spec : serializeSpecYaml(spec)
  const path = join(root, name)
  writeFileSync(path, text)
  return path
}

function runCli(args, { cwd, input, timeout } = {}) {
  return spawnSync(process.execPath, [CLI, ...args], {
    cwd: cwd || process.cwd(),
    encoding: 'utf8',
    timeout: timeout || 20_000,
    windowsHide: true,
    input
  })
}

function miniSpec(root, overrides = {}) {
  writeFileSync(join(root, 'a.png'), PNG_1X1)
  return {
    meta: { theme: 'tech-blue', title: 'Asset figure' },
    assets: {
      photo: {
        path: 'a.png',
        sha256: PNG_SHA256,
        raster_reason: 'complex outline',
        atomic_raster_unit: true,
        contains_reconstructable_content: false,
        decomposition_note: 'labels are native'
      }
    },
    nodes: [
      {
        id: 'pic',
        label: 'Device',
        image: 'photo',
        bounds: { x: 40, y: 40, width: 80, height: 80 }
      }
    ],
    edges: [],
    modules: [],
    ...overrides
  }
}

test('parseDocumentYaml keeps spec.assets on the ownership chain (AC1)', () => {
  const doc = parseDocumentYaml(`
meta:
  theme: tech-blue
assets:
  chimney:
    path: ref/materials/a.png
nodes:
  - id: kiln
    label: Chimney
    image: chimney
    bounds: { x: 10, y: 10, width: 40, height: 60 }
`)
  assert.equal(doc.kind, 'legacy-single-page')
  assert.ok(doc.spec.assets)
  assert.notEqual(Object.keys(doc.spec.assets).length, 0)
  assert.equal(doc.spec.assets.chimney.path, 'ref/materials/a.png')
  assert.equal(doc.spec.nodes[0].image, 'chimney')
})

test('node.icon and node.image are mutually exclusive', () => {
  assert.throws(
    () =>
      validateSpec({
        meta: {},
        assets: { photo: { path: 'a.png' } },
        nodes: [{ id: 'n1', label: 'X', icon: 'lucide.bot', image: 'photo' }],
        edges: [],
        modules: []
      }),
    /cannot set both icon and image/
  )
})

test('assets records reject a data field', () => {
  assert.throws(
    () =>
      validateSpec({
        meta: {},
        assets: { photo: { path: 'a.png', data: 'data:image/png;base64,AAAA' } },
        nodes: [{ id: 'n1', label: 'X', image: 'photo' }],
        edges: [],
        modules: []
      }),
    /unknown field "data"/
  )
})

test('CLI renders a local PNG as shape=image data URI with zero strict warnings (AC1)', () => {
  const root = mkdtempSync(join(tmpdir(), 'drawio-img-'))
  try {
    const spec = miniSpec(root)
    writeYaml(root, 'in.yaml', spec)
    const out = join(root, 'out.drawio')
    const result = runCli(['in.yaml', out, '--validate', '--strict-warnings', '--asset-root', root], { cwd: root })
    assert.equal(result.status, 0, result.stderr)
    const xml = readFileSync(out, 'utf8')
    assert.match(xml, /shape=image/)
    assert.match(xml, /data:image\/png;base64,/)
    assert.match(xml, /dataAssetId="photo"/)
    assert.match(xml, /dataAssetPath="a.png"/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('one asset can be cited by two nodes (AC2)', () => {
  const root = mkdtempSync(join(tmpdir(), 'drawio-img-'))
  try {
    writeFileSync(join(root, 'a.png'), PNG_1X1)
    const spec = {
      meta: { theme: 'tech-blue' },
      assets: { photo: { path: 'a.png' } },
      nodes: [
        { id: 'left', label: 'Left', image: 'photo', bounds: { x: 20, y: 20, width: 64, height: 64 } },
        { id: 'right', label: 'Right', image: 'photo', bounds: { x: 120, y: 20, width: 64, height: 64 } }
      ],
      edges: [],
      modules: []
    }
    const xml = specToDrawioXml(spec, { silent: true, assetRoot: root })
    const matches = xml.match(/dataAssetId="photo"/g) || []
    assert.equal(matches.length, 2)
    assert.equal(Object.keys(spec.assets).length, 1)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('drawio export-spec round-trips six fields, path, sidecar-dir, and academic-paper (AC3)', () => {
  const root = mkdtempSync(join(tmpdir(), 'drawio-img-'))
  try {
    const spec = miniSpec(root)
    writeFileSync(join(root, 'a.png'), PNG_1X1)
    const yamlPath = writeYaml(root, 'in.yaml', spec)
    const drawioPath = join(root, 'out.drawio')
    const render = runCli(['in.yaml', drawioPath, '--validate', '--asset-root', root], { cwd: root })
    assert.equal(render.status, 0, render.stderr)

    const sidecar = join(root, 'sidecar')
    mkdirSync(sidecar)
    const exported = join(sidecar, 'rt.spec.yaml')
    const roundTrip = runCli(
      [
        drawioPath,
        exported,
        '--input-format',
        'drawio',
        '--export-spec',
        '--write-sidecars',
        '--sidecar-dir',
        sidecar
      ],
      { cwd: root }
    )
    assert.equal(roundTrip.status, 0, roundTrip.stderr)
    const exportedDoc = parseDocumentYaml(readFileSync(exported, 'utf8'))
    const asset = exportedDoc.spec.assets.photo
    assert.equal(asset.path, 'a.png')
    assert.equal(asset.sha256, PNG_SHA256)
    assert.equal(asset.raster_reason, 'complex outline')
    assert.equal(asset.atomic_raster_unit, true)
    assert.equal(asset.contains_reconstructable_content, false)
    assert.equal(asset.decomposition_note, 'labels are native')
    assert.equal(exportedDoc.spec.nodes[0].image, 'photo')

    spec.meta = {
      profile: 'academic-paper',
      theme: 'academic',
      figureType: 'architecture',
      title: 'Equipment',
      description: 'Atomic device rasters',
      legend: 'Photos are atomic rasters'
    }
    writeYaml(root, 'academic.yaml', spec)
    const academicOut = join(root, 'academic.drawio')
    const academicRender = runCli(
      ['academic.yaml', academicOut, '--validate', '--strict-warnings', '--asset-root', root],
      { cwd: root }
    )
    assert.equal(academicRender.status, 0, academicRender.stderr)
    const academicSpecPath = join(root, 'academic.spec.yaml')
    const academicExport = runCli(
      [academicOut, academicSpecPath, '--input-format', 'drawio', '--export-spec'],
      { cwd: root }
    )
    assert.equal(academicExport.status, 0, academicExport.stderr)
    const rerender = runCli(
      [academicSpecPath, join(root, 'academic-2.drawio'), '--validate', '--strict-warnings', '--asset-root', root],
      { cwd: root }
    )
    assert.equal(rerender.status, 0, rerender.stderr)
    void yamlPath
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('conflicting XML carriers for one asset id are a hard error (AC4)', () => {
  const xml = `<mxfile><diagram name="Page-1"><mxGraphModel><root>
<mxCell id="0"/><mxCell id="1" parent="0"/>
<UserObject label="A" dataAssetId="photo" dataAssetPath="a.png" dataAssetRasterReason="one">
  <mxCell id="2" value="" style="shape=image;image=data:image/png;base64,AA==;" vertex="1" parent="1">
    <mxGeometry x="0" y="0" width="40" height="40" as="geometry"/>
  </mxCell>
</UserObject>
<UserObject label="B" dataAssetId="photo" dataAssetPath="b.png" dataAssetRasterReason="two">
  <mxCell id="3" value="" style="shape=image;image=data:image/png;base64,AA==;" vertex="1" parent="1">
    <mxGeometry x="80" y="0" width="40" height="40" as="geometry"/>
  </mxCell>
</UserObject>
</root></mxGraphModel></diagram></mxfile>`
  assert.throws(() => drawioToSpec(xml), /XML carriers disagree/)
})

test('stdin YAML with assets is a hard error (AC5)', () => {
  const result = runCli(['-', 'out.drawio'], {
    input: 'assets:\n  photo:\n    path: a.png\nnodes:\n  - id: n1\n    label: A\n    image: photo\n'
  })
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /stdin input cannot include assets/)
})

test('validateSpec still rejects icon values that contain a slash (AC6)', () => {
  assert.throws(
    () =>
      validateSpec({
        meta: {},
        nodes: [{ id: 'n1', label: 'A', icon: 'path/to/icon' }],
        edges: [],
        modules: []
      }),
    /invalid icon/
  )
})

test('size guardrails assert diagnostic level and strict vs non-strict (AC7)', () => {
  const root = mkdtempSync(join(tmpdir(), 'drawio-img-'))
  const writeCase = (fileName, byteLength, citations = 1) => {
    writeFileSync(join(root, fileName), paddedPng(byteLength))
    const nodes = []
    for (let i = 0; i < citations; i++) {
      nodes.push({
        id: `n${i + 1}`,
        label: `N${i + 1}`,
        image: 'photo',
        bounds: { x: 8 + i * 50, y: 8, width: 40, height: 40 }
      })
    }
    writeYaml(root, `${fileName}.yaml`, {
      meta: { theme: 'tech-blue' },
      assets: { photo: { path: fileName } },
      nodes,
      edges: [],
      modules: []
    })
  }
  const validate = (fileName, { strict = false, timeout } = {}) => {
    const args = [`${fileName}.yaml`, `${fileName}.drawio`, '--validate', '--asset-root', root]
    if (strict) args.push('--strict')
    return runCli(args, { cwd: root, timeout })
  }
  try {
    writeCase('exact2.png', ASSET_SIZE_WARNING_BYTES)
    const exact2 = validate('exact2.png')
    assert.equal(exact2.status, 0, exact2.stderr)
    assert.doesNotMatch(exact2.stderr, /\[warning\]/)
    assert.doesNotMatch(exact2.stderr, /2 MiB warning/)

    writeCase('over2.png', ASSET_SIZE_WARNING_BYTES + 1)
    const over2 = validate('over2.png')
    assert.equal(over2.status, 0, over2.stderr)
    assert.match(over2.stderr, /\[warning\]/)
    assert.match(over2.stderr, /ASSET_SIZE|2 MiB warning/)
    assert.match(over2.stderr, /references\/docs\/local-image-assets\.md/)
    const over2Strict = validate('over2.png', { strict: true })
    assert.equal(over2Strict.status, 1, over2Strict.stderr)
    assert.match(over2Strict.stderr, /\[warning\]/)
    assert.match(over2Strict.stderr, /ASSET_SIZE/)

    writeCase('exact8.png', ASSET_SIZE_ERROR_BYTES)
    const exact8 = validate('exact8.png')
    assert.equal(exact8.status, 0, exact8.stderr)
    assert.match(exact8.stderr, /\[warning\]/)
    assert.doesNotMatch(exact8.stderr, /8 MiB error/)
    const exact8Strict = validate('exact8.png', { strict: true })
    assert.equal(exact8Strict.status, 1, exact8Strict.stderr)
    assert.match(exact8Strict.stderr, /\[warning\]/)
    assert.match(exact8Strict.stderr, /ASSET_SIZE/)

    writeCase('over8.png', ASSET_SIZE_ERROR_BYTES + 1)
    const over8 = validate('over8.png')
    assert.equal(over8.status, 1, over8.stderr)
    assert.match(over8.stderr, /\[error\]/)
    assert.match(over8.stderr, /ASSET_SIZE/)
    assert.match(over8.stderr, /8 MiB error/)
    const over8Strict = validate('over8.png', { strict: true })
    assert.equal(over8Strict.status, 1, over8Strict.stderr)
    assert.match(over8Strict.stderr, /\[error\]/)

    const chunk = Math.floor(ASSET_TOTAL_ERROR_BYTES / 8)
    writeCase('exact24.png', chunk, 8)
    const exact24 = validate('exact24.png', { timeout: 60_000 })
    assert.equal(exact24.status, 0, exact24.stderr)
    assert.doesNotMatch(exact24.stderr, /24 MiB/)

    writeCase('over24.png', chunk + 1, 8)
    const over24 = validate('over24.png', { timeout: 60_000 })
    assert.equal(over24.status, 1, over24.stderr)
    assert.match(over24.stderr, /\[error\]/)
    assert.match(over24.stderr, /24 MiB/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('foreign shape=image requires --extract-assets and round-trips bytes (AC8)', () => {
  const root = mkdtempSync(join(tmpdir(), 'drawio-img-'))
  try {
    const dataUri = `data:image/png;base64,${PNG_1X1.toString('base64')}`
    const drawio = createDrawioFileContent(
      `<mxGraphModel pageWidth="400" pageHeight="300"><root><mxCell id="0"/><mxCell id="1" parent="0"/>` +
        `<mxCell id="2" value="Shot" style="shape=image;html=1;image=${dataUri};" vertex="1" parent="1">` +
        `<mxGeometry x="20" y="20" width="80" height="80" as="geometry"/></mxCell></root></mxGraphModel>`
    )
    const foreign = join(root, 'foreign.drawio')
    writeFileSync(foreign, drawio)
    const missing = runCli([foreign, 'out.yaml', '--input-format', 'drawio', '--export-spec'], { cwd: root })
    assert.notEqual(missing.status, 0)
    assert.match(missing.stderr, /--extract-assets/)

    const extractDir = join(root, 'extracted')
    const specPath = join(root, 'out.yaml')
    const extracted = runCli(
      [
        foreign,
        specPath,
        '--input-format',
        'drawio',
        '--export-spec',
        '--extract-assets',
        extractDir,
        '--asset-root',
        root
      ],
      { cwd: root }
    )
    assert.equal(extracted.status, 0, extracted.stderr)
    const spec = parseDocumentYaml(readFileSync(specPath, 'utf8')).spec
    const assetId = spec.nodes[0].image
    const written = readFileSync(join(root, spec.assets[assetId].path))
    assert.deepEqual(written, PNG_1X1)
    const rerender = specToDrawioXml(spec, { silent: true, assetRoot: root })
    const encoded = /data:image\/png;base64,([A-Za-z0-9+/=]+)/.exec(rerender)
    assert.ok(encoded)
    assert.deepEqual(Buffer.from(encoded[1], 'base64'), PNG_1X1)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('academic-paper gates raster audit fields; default profile does not (AC10)', () => {
  const root = mkdtempSync(join(tmpdir(), 'drawio-img-'))
  try {
    writeFileSync(join(root, 'a.png'), PNG_1X1)
    const spec = {
      meta: { profile: 'academic-paper', theme: 'academic', figureType: 'architecture', title: 'T', description: 'D' },
      assets: {
        photo: { path: 'a.png', atomic_raster_unit: false, contains_reconstructable_content: true }
      },
      nodes: [{ id: 'n1', label: 'A', image: 'photo', bounds: { x: 8, y: 8, width: 40, height: 40 } }],
      edges: [],
      modules: []
    }
    const academic = validateAcademicProfile(spec)
    assert.ok(academic.some((w) => /raster_reason/.test(w)))
    assert.ok(academic.some((w) => /atomic_raster_unit/.test(w)))
    assert.ok(academic.some((w) => /contains_reconstructable_content/.test(w)))
    assert.throws(
      () => specToDrawioXml(spec, { silent: true, strict: true, assetRoot: root }),
      (error) => /\[warning\]/.test(error.message) && /raster_reason/.test(error.message)
    )
    spec.meta.profile = 'default'
    assert.equal(validateAcademicProfile(spec).some((w) => /raster_reason/.test(w)), false)
    specToDrawioXml(spec, { silent: true, strict: true, assetRoot: root })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('multi-page bundles reject assets with MULTI_PAGE_INVALID (AC11)', () => {
  assert.throws(
    () =>
      parseDocumentYaml(`
schemaVersion: 1
meta: { title: Bundle }
assets:
  photo: { path: a.png }
pages:
  - id: p1
    name: One
    nodes:
      - id: n1
        label: A
`),
    (error) => error.code === 'MULTI_PAGE_INVALID' && error.path === 'assets'
  )
  assert.throws(
    () =>
      parseDocumentYaml(`
schemaVersion: 1
meta: { title: Bundle }
pages:
  - id: p1
    name: One
    assets:
      photo: { path: a.png }
    nodes:
      - id: n1
        label: A
`),
    (error) => error.code === 'MULTI_PAGE_INVALID' && error.path === 'pages[0].assets'
  )
})

test('canonical postprocess mutators keep assets and node.image (AC12)', () => {
  const root = mkdtempSync(join(tmpdir(), 'drawio-img-'))
  try {
    const spec = miniSpec(root)
    const relabel = applyRelabel(spec, { pic: 'Renamed' })
    assert.equal(relabel.assets.photo.path, 'a.png')
    assert.equal(relabel.nodes[0].image, 'photo')
    assert.equal(relabel.nodes[0].label, 'Renamed')

    const restyle = applyRestyle(spec, { node: { strokeWidth: 2 } })
    assert.equal(restyle.assets.photo.path, 'a.png')
    assert.equal(restyle.nodes[0].image, 'photo')

    const heatmap = applyHeatmap(spec, [{ key: 'pic', value: 3 }], { palette: 'heat' })
    assert.equal(heatmap.assets.photo.path, 'a.png')
    assert.equal(heatmap.nodes[0].image, 'photo')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('mermaid, explain, and html degrade image nodes without dropping the node (AC12)', async () => {
  const root = mkdtempSync(join(tmpdir(), 'drawio-img-'))
  const htmlDir = resolve(process.cwd(), '.drawio-tmp', 'local-image-html')
  try {
    const spec = miniSpec(root)
    const mermaid = renderMermaid(spec, { returnWarnings: true })
    assert.match(mermaid.text, /Device/)
    assert.ok(mermaid.warnings.some((w) => /raster image asset/.test(w)))
    assert.doesNotMatch(mermaid.text, /data:image\/png/)

    const explained = explainDocument(spec)
    assert.match(explained, /image `photo`/)
    assert.match(explained, /Device/)

    mkdirSync(htmlDir, { recursive: true })
    const pngPath = join(htmlDir, 'a.png')
    writeFileSync(pngPath, PNG_1X1)
    const htmlSpec = miniSpec(root)
    htmlSpec.assets.photo.path = posixRel(process.cwd(), pngPath)
    const html = await renderHtml(htmlSpec)
    assert.match(html, /Asset figure|Page-1/)
    assert.doesNotMatch(html, /<image[\s>]/)
  } finally {
    rmSync(root, { recursive: true, force: true })
    rmSync(htmlDir, { recursive: true, force: true })
  }
})

test('copied skill renders local images without NODE_PATH (AC13)', () => {
  const tempRoot = mkdtempSync(join(tmpdir(), 'drawio-skill-asset-install-'))
  const installedSkill = join(tempRoot, 'installed', 'drawio')
  try {
    cpSync(SKILL_ROOT, installedSkill, { recursive: true })
    writeFileSync(join(tempRoot, 'a.png'), PNG_1X1)
    writeYaml(tempRoot, 'input.yaml', {
      meta: { theme: 'tech-blue' },
      assets: { photo: { path: 'a.png' } },
      nodes: [{ id: 'pic', label: 'Device', image: 'photo', bounds: { x: 8, y: 8, width: 48, height: 48 } }],
      edges: [],
      modules: []
    })
    const env = { ...process.env }
    for (const key of Object.keys(env)) {
      if (key.toUpperCase() === 'NODE_PATH') delete env[key]
    }
    const result = spawnSync(
      process.execPath,
      [join(installedSkill, 'scripts', 'cli.js'), 'input.yaml', 'output.drawio', '--validate', '--asset-root', tempRoot],
      { cwd: tempRoot, env, encoding: 'utf8', timeout: 15_000, windowsHide: true }
    )
    assert.equal(result.status, 0, result.stderr)
    assert.equal(existsSync(join(tempRoot, 'output.drawio')), true)
    assert.match(readFileSync(join(tempRoot, 'output.drawio'), 'utf8'), /data:image\/png;base64,/)
  } finally {
    rmSync(tempRoot, { recursive: true, force: true })
  }
})

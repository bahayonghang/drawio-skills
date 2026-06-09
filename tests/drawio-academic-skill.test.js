import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inflateRawSync } from 'node:zlib'
import { buildDiagramsNetUrl } from '../skills/drawio/scripts/runtime/diagrams-net-url.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = resolve(__dirname, '..')
const BASE_DIR = resolve(PROJECT_ROOT, 'skills/drawio')
const SKILL_DIR = resolve(PROJECT_ROOT, 'skills/drawio-academic-skills')
const logger = { info: () => {} }

function listFilesRecursive(rootDir) {
  // 返回相对 rootDir 的 POSIX 风格文件路径列表（目录不存在时返回空数组）
  const out = []
  const walk = (absDir, relPrefix) => {
    for (const entry of readdirSync(absDir)) {
      const abs = join(absDir, entry)
      const rel = relPrefix ? `${relPrefix}/${entry}` : entry
      if (statSync(abs).isDirectory()) walk(abs, rel)
      else out.push(rel)
    }
  }
  if (existsSync(rootDir)) walk(rootDir, '')
  return out.sort()
}

test('drawio-academic-skills: overlay shape depends on sibling base without copied runtime', () => {
  /*
   * ========================================================================
   * 步骤1：校验 academic overlay 目录结构
   * ========================================================================
   * 数据源：skills/drawio 与 skills/drawio-academic-skills
   * 操作要点：
   * 1) 确认 base 拥有共享 runtime 与资源
   * 2) 确认 academic overlay 不再复制底层 runtime
   */
  logger.info('开始校验 academic overlay 目录结构...')

  // 1.1 base 是唯一共享底层能力面
  assert.equal(existsSync(resolve(BASE_DIR, 'scripts/cli.js')), true)
  assert.equal(existsSync(resolve(BASE_DIR, 'scripts/runtime/diagrams-net-url.js')), true)
  assert.equal(existsSync(resolve(BASE_DIR, 'references/docs/design-system/specification.md')), true)
  assert.equal(existsSync(resolve(BASE_DIR, 'references/workflows/create.md')), true)
  assert.equal(existsSync(resolve(BASE_DIR, 'references/official/xml-reference.md')), true)
  assert.equal(existsSync(resolve(BASE_DIR, 'assets/themes/academic.json')), true)
  assert.equal(existsSync(resolve(BASE_DIR, 'styles/built-in/default.json')), true)

  // 1.2 overlay 保留入口和 academic 专属资源，不携带底层复制件
  assert.equal(existsSync(SKILL_DIR), true)
  assert.equal(existsSync(resolve(SKILL_DIR, 'SKILL.md')), true)
  assert.equal(existsSync(resolve(SKILL_DIR, '.git')), false)
  assert.equal(existsSync(resolve(SKILL_DIR, '.mcp.json')), false)
  assert.equal(existsSync(resolve(SKILL_DIR, 'scripts/cli.js')), false)
  assert.equal(existsSync(resolve(SKILL_DIR, 'assets/themes/academic.json')), false)
  assert.equal(existsSync(resolve(SKILL_DIR, 'assets/schemas/spec.schema.json')), false)
  assert.equal(existsSync(resolve(SKILL_DIR, 'references/official/xml-reference.md')), false)
  assert.equal(existsSync(resolve(SKILL_DIR, 'references/workflows/create.md')), false)
  assert.equal(existsSync(resolve(SKILL_DIR, 'styles/built-in/default.json')), false)

  // 1.3 overlay SKILL 明确 sibling base 边界且不引用 live/MCP 文档
  const skillText = readFileSync(resolve(SKILL_DIR, 'SKILL.md'), 'utf8')
  const publicationOverlayText = readFileSync(
    resolve(SKILL_DIR, 'references/docs/publication-overlay.md'),
    'utf8'
  )
  assert.match(skillText, /^name: drawio-academic-skills$/m)
  assert.match(skillText, /\.\.\/drawio\/scripts\/cli\.js/)
  assert.match(skillText, /\.\.\/drawio\/assets\/themes\//)
  assert.match(skillText, /\.\.\/drawio\/styles\/built-in\//)
  assert.match(skillText, /Never create, require, or route through `\.mcp\.json`/)
  assert.doesNotMatch(skillText, /mcp-tools\.md/)
  assert.match(skillText, /## Source Understanding/)
  assert.match(skillText, /## Diagram Plan Gate/)
  assert.match(skillText, /## Optional Image Preview/)
  assert.match(skillText, /external image-generation previews as optional concept previews only/)
  assert.match(publicationOverlayText, /## Research Evidence Chain/)
  assert.match(publicationOverlayText, /## Optional Image Preview/)
  assert.match(publicationOverlayText, /Ask before sending unpublished papers/)
  assert.match(publicationOverlayText, /adjust the YAML spec and rerender once/)

  // 1.4 eval prompt fixtures live under evals, not the overlay root
  assert.equal(existsSync(resolve(SKILL_DIR, 'test-prompts.json')), false)
  assert.equal(existsSync(resolve(SKILL_DIR, 'evals/test-prompts.json')), true)

  // 1.5 overlay references/ 是不变量白名单：修复后只应保留 publication 专属指南。
  //     枚举式黑名单会漏掉新混入的副本，所以这里断言“恰好等于”白名单。
  const overlayRefs = listFilesRecursive(resolve(SKILL_DIR, 'references'))
  assert.deepEqual(overlayRefs, ['docs/publication-overlay.md'])

  // 1.6 overlay 的资源子树不得出现与 base 字节相同的文件，
  //     防止 themes/scripts/styles/references 等共享资源被复制进 overlay 而长期漂移。
  const baseHashes = new Map()
  for (const rel of listFilesRecursive(BASE_DIR)) {
    baseHashes.set(
      createHash('sha256')
        .update(readFileSync(resolve(BASE_DIR, rel)))
        .digest('hex'),
      rel
    )
  }
  for (const sub of ['references', 'assets', 'scripts', 'styles']) {
    for (const rel of listFilesRecursive(resolve(SKILL_DIR, sub))) {
      const hash = createHash('sha256')
        .update(readFileSync(resolve(SKILL_DIR, sub, rel)))
        .digest('hex')
      assert.equal(
        baseHashes.has(hash),
        false,
        `overlay ${sub}/${rel} 与 base ${baseHashes.get(hash)} 字节相同，应改为引用 ../drawio`
      )
    }
  }
  logger.info('校验 academic overlay 目录结构完成')
})

test('drawio-academic-skills: diagrams.net URL helper round-trips drawio XML from base', () => {
  /*
   * ========================================================================
   * 步骤2：校验 base diagrams.net URL 编码
   * ========================================================================
   * 数据源：内联 draw.io XML
   * 操作要点：
   * 1) 生成 #R URL 片段
   * 2) 解码并确认 XML 可无损还原
   */
  logger.info('开始校验 base diagrams.net URL 编码...')

  // 2.1 构造最小 draw.io XML 并生成 URL
  const xml =
    '<mxfile host="drawio"><diagram><mxGraphModel><root><mxCell id="0"/></root></mxGraphModel></diagram></mxfile>'
  const url = buildDiagramsNetUrl(xml)
  assert.match(url, /^https:\/\/viewer\.diagrams\.net\//)
  assert.match(url, /#R/)

  // 2.2 从 #R 片段还原 XML
  const encoded = decodeURIComponent(url.split('#R')[1])
  const restored = inflateRawSync(Buffer.from(encoded, 'base64')).toString('utf8')
  assert.equal(restored, xml)
  logger.info('校验 base diagrams.net URL 编码完成')
})

test('drawio-academic-skills: sibling base CLI separates final artifacts from sidecars', () => {
  /*
   * ========================================================================
   * 步骤3：校验 academic overlay 通过 base CLI 导出
   * ========================================================================
   * 数据源：base publication 示例
   * 操作要点：
   * 1) 使用 sibling base CLI 生成 SVG
   * 2) 校验最终目录只包含 .svg 和 .drawio
   * 3) 校验 .spec.yaml、.arch.json sidecars 写入工作目录
   */
  logger.info('开始校验 sibling base CLI academic clean-final 导出...')

  // 3.1 准备输入和临时输出路径
  const tempDir = mkdtempSync(join(tmpdir(), 'drawio-academic-overlay-'))
  const sidecarDir = resolve(tempDir, '.drawio-tmp', 'academic-system')
  const input = resolve(BASE_DIR, 'references/examples/system-architecture-paper.yaml')
  const output = resolve(tempDir, 'academic-system.svg')

  try {
    // 3.2 运行 base CLI 并将 sidecars 写入工作目录
    execFileSync(
      process.execPath,
      [
        resolve(BASE_DIR, 'scripts/cli.js'),
        input,
        output,
        '--validate',
        '--write-sidecars',
        '--sidecar-dir',
        sidecarDir
      ],
      { cwd: PROJECT_ROOT, stdio: 'pipe' }
    )

    // 3.3 校验导出产物存在
    assert.equal(existsSync(output), true)
    assert.equal(existsSync(resolve(tempDir, 'academic-system.drawio')), true)
    assert.equal(existsSync(resolve(tempDir, 'academic-system.spec.yaml')), false)
    assert.equal(existsSync(resolve(tempDir, 'academic-system.arch.json')), false)
    assert.equal(existsSync(resolve(sidecarDir, 'academic-system.spec.yaml')), true)
    assert.equal(existsSync(resolve(sidecarDir, 'academic-system.arch.json')), true)
  } finally {
    // 3.4 清理临时目录
    rmSync(tempDir, { recursive: true, force: true })
  }
  logger.info('校验 sibling base CLI academic clean-final 导出完成')
})

test('drawio examples: scientific paper examples render through base CLI', () => {
  /*
   * ========================================================================
   * 步骤4：校验 scientific academic 示例可渲染
   * ========================================================================
   * 数据源：base references/examples
   * 操作要点：
   * 1) 使用 sibling base CLI 渲染新增科学图示例
   * 2) 开启 strict warnings，保证示例符合 academic profile 质量门槛
   * 3) 校验最终目录与 sidecar 目录分离
   */
  logger.info('开始校验 scientific academic 示例渲染...')

  const examples = [
    ['yolo-model-architecture-paper.yaml', 'yolo'],
    ['max-pooling-operation-paper.yaml', 'max-pooling']
  ]

  const tempDir = mkdtempSync(join(tmpdir(), 'drawio-scientific-examples-'))

  try {
    for (const [exampleName, outputName] of examples) {
      const input = resolve(BASE_DIR, 'references/examples', exampleName)
      const output = resolve(tempDir, `${outputName}.svg`)
      const sidecarDir = resolve(tempDir, '.drawio-tmp', outputName)

      execFileSync(
        process.execPath,
        [
          resolve(BASE_DIR, 'scripts/cli.js'),
          input,
          output,
          '--validate',
          '--write-sidecars',
          '--sidecar-dir',
          sidecarDir,
          '--strict-warnings'
        ],
        { cwd: PROJECT_ROOT, stdio: 'pipe' }
      )

      assert.equal(existsSync(output), true)
      assert.equal(existsSync(resolve(tempDir, `${outputName}.drawio`)), true)
      assert.equal(existsSync(resolve(tempDir, `${outputName}.spec.yaml`)), false)
      assert.equal(existsSync(resolve(tempDir, `${outputName}.arch.json`)), false)
      assert.equal(existsSync(resolve(sidecarDir, `${outputName}.spec.yaml`)), true)
      assert.equal(existsSync(resolve(sidecarDir, `${outputName}.arch.json`)), true)
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
  logger.info('校验 scientific academic 示例渲染完成')
})

test('drawio evals: base and academic sets encode separate responsibilities', () => {
  /*
   * ========================================================================
   * 步骤5：校验 evals 拆分结果
   * ========================================================================
   * 数据源：base 与 academic eval JSON
   * 操作要点：
   * 1) base 覆盖通用任务与 live refinement boundary
   * 2) academic 只覆盖 publication-facing overlay 场景
   */
  logger.info('开始校验 evals 拆分结果...')

  const baseEvals = JSON.parse(readFileSync(resolve(BASE_DIR, 'evals/evals.json'), 'utf8'))
  const academicEvals = JSON.parse(readFileSync(resolve(SKILL_DIR, 'evals/evals.json'), 'utf8'))

  assert.equal(baseEvals.skill_name, 'drawio')
  assert.equal(academicEvals.skill_name, 'drawio-academic-skills')

  const baseIds = baseEvals.evals.map((item) => item.id)
  const academicIds = academicEvals.evals.map((item) => item.id)

  assert.ok(baseIds.includes('base-mermaid-conversion'))
  assert.ok(baseIds.includes('base-csv-orgchart-conversion'))
  assert.ok(baseIds.includes('base-import-drawio-export-spec'))
  assert.ok(baseIds.includes('base-optional-live-refinement-boundary'))
  assert.ok(baseIds.includes('base-desktop-unavailable-fallback'))

  assert.ok(academicIds.includes('academic-ieee-campus-network'))
  assert.ok(academicIds.includes('academic-yolo-model-architecture'))
  assert.ok(academicIds.includes('academic-max-pooling-operation-figure'))
  assert.ok(academicIds.includes('academic-thesis-word-a4-bundle'))
  assert.ok(academicIds.includes('academic-formula-publication-figure'))
  assert.ok(academicIds.includes('academic-paper-evidence-chain-preview'))
  assert.ok(academicIds.includes('academic-reference-redraw-native-scientific'))
  assert.ok(academicIds.includes('academic-image-improvement-preview-gate'))
  assert.ok(academicIds.includes('academic-desktop-png-pdf-unavailable-fallback'))

  assert.equal(
    baseIds.some((id) => id.startsWith('academic-')),
    false
  )
  assert.equal(
    academicIds.every((id) => id.startsWith('academic-')),
    true
  )
  logger.info('校验 evals 拆分结果完成')
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inflateRawSync } from 'node:zlib'
import { buildDiagramsNetUrl } from '../skills/drawio-academic-skills/scripts/runtime/diagrams-net-url.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = resolve(__dirname, '..')
const SKILL_DIR = resolve(PROJECT_ROOT, 'skills/drawio-academic-skills')
const logger = { info: () => {} }

test('drawio-academic-skills: copied skill shape is complete and isolated', () => {
  /*
   * ========================================================================
   * 步骤1：校验新 skill 目录结构
   * ========================================================================
   * 数据源：skills/drawio-academic-skills
   * 操作要点：
   * 1) 确认上游内容已复制且排除 .git/.mcp.json
   * 2) 确认融合版 SKILL 使用独立名称和样式目录
   */
  logger.info('开始校验新 skill 目录结构...')

  // 1.1 确认目录和核心入口存在
  assert.equal(existsSync(SKILL_DIR), true)
  assert.equal(existsSync(resolve(SKILL_DIR, 'SKILL.md')), true)
  assert.equal(existsSync(resolve(SKILL_DIR, '.git')), false)

  // 1.2 确认融合后的资源存在且不携带 MCP 配置
  assert.equal(existsSync(resolve(SKILL_DIR, 'scripts/cli.js')), true)
  assert.equal(existsSync(resolve(SKILL_DIR, 'references/docs/upstream-pure-drawio-skill.md')), true)
  assert.equal(existsSync(resolve(SKILL_DIR, '.mcp.json')), false)

  // 1.3 确认新 SKILL 名称和独立 preset 目录
  const skillText = readFileSync(resolve(SKILL_DIR, 'SKILL.md'), 'utf8')
  assert.match(skillText, /^name: drawio-academic-skills$/m)
  assert.match(skillText, /~\/\.drawio-academic-skills\/styles\//)
  assert.doesNotMatch(skillText, /~\/\.drawio-skill\/styles\//)
  logger.info('校验新 skill 目录结构完成')
})

test('drawio-academic-skills: diagrams.net URL helper round-trips drawio XML', () => {
  /*
   * ========================================================================
   * 步骤2：校验 diagrams.net URL 编码
   * ========================================================================
   * 数据源：内联 draw.io XML
   * 操作要点：
   * 1) 生成 #R URL 片段
   * 2) 解码并确认 XML 可无损还原
   */
  logger.info('开始校验 diagrams.net URL 编码...')

  // 2.1 构造最小 draw.io XML 并生成 URL
  const xml = '<mxfile host="drawio"><diagram><mxGraphModel><root><mxCell id="0"/></root></mxGraphModel></diagram></mxfile>'
  const url = buildDiagramsNetUrl(xml)
  assert.match(url, /^https:\/\/viewer\.diagrams\.net\//)
  assert.match(url, /#R/)

  // 2.2 从 #R 片段还原 XML
  const encoded = decodeURIComponent(url.split('#R')[1])
  const restored = inflateRawSync(Buffer.from(encoded, 'base64')).toString('utf8')
  assert.equal(restored, xml)
  logger.info('校验 diagrams.net URL 编码完成')
})

test('drawio-academic-skills: CLI renders academic bundle sidecars', () => {
  /*
   * ========================================================================
   * 步骤3：校验 academic bundle 导出
   * ========================================================================
   * 数据源：system-architecture-paper.yaml 示例
   * 操作要点：
   * 1) 运行复制后的 CLI 生成 SVG
   * 2) 校验 .drawio、.spec.yaml、.arch.json sidecars 同步生成
   */
  logger.info('开始校验 academic bundle 导出...')

  // 3.1 准备输入和临时输出路径
  const tempDir = mkdtempSync(join(tmpdir(), 'drawio-academic-skill-'))
  const input = resolve(SKILL_DIR, 'references/examples/system-architecture-paper.yaml')
  const output = resolve(tempDir, 'academic-system.svg')

  try {
    // 3.2 运行 CLI 并写出 sidecars
    execFileSync(process.execPath, [
      resolve(SKILL_DIR, 'scripts/cli.js'),
      input,
      output,
      '--validate',
      '--write-sidecars'
    ], { cwd: PROJECT_ROOT, stdio: 'pipe' })

    // 3.3 校验导出产物存在
    assert.equal(existsSync(output), true)
    assert.equal(existsSync(resolve(tempDir, 'academic-system.drawio')), true)
    assert.equal(existsSync(resolve(tempDir, 'academic-system.spec.yaml')), true)
    assert.equal(existsSync(resolve(tempDir, 'academic-system.arch.json')), true)
  } finally {
    // 3.4 清理临时目录
    rmSync(tempDir, { recursive: true, force: true })
  }
  logger.info('校验 academic bundle 导出完成')
})

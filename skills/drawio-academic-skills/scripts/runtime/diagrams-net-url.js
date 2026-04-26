import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { deflateRawSync } from 'node:zlib'

const logger = {
  info: (...args) => {
    if (process.env.DRAWIO_ACADEMIC_VERBOSE === '1') {
      console.error(...args)
    }
  }
}

export function encodeDrawioXmlForDiagramsNet(xml) {
  /*
   * ========================================================================
   * 步骤1：校验 draw.io XML 输入
   * ========================================================================
   * 数据源：调用方传入的 XML 字符串
   * 操作要点：
   * 1) 确认输入是非空字符串
   * 2) 确认内容看起来像 draw.io XML
   */
  logger.info('开始校验 draw.io XML 输入...')

  // 1.1 检查输入类型和内容长度
  if (typeof xml !== 'string' || xml.trim().length === 0) {
    throw new Error('draw.io XML must be a non-empty string')
  }

  // 1.2 检查 draw.io 常见根节点
  if (!xml.includes('<mxfile') && !xml.includes('<mxGraphModel')) {
    throw new Error('Input does not look like draw.io XML')
  }
  logger.info('校验 draw.io XML 输入完成')

  /*
   * ========================================================================
   * 步骤2：编码为 diagrams.net 片段
   * ========================================================================
   * 数据源：已校验的 draw.io XML 字符串
   * 操作要点：
   * 1) 使用 raw deflate 压缩 XML
   * 2) 使用标准 base64 编码，满足 diagrams.net #R 片段要求
   */
  logger.info('开始编码 diagrams.net URL 片段...')

  // 2.1 raw deflate 压缩，避免 zlib header
  const compressed = deflateRawSync(Buffer.from(xml, 'utf8'), { level: 9 })

  // 2.2 标准 base64 编码并移除换行
  const encoded = compressed.toString('base64').replace(/\n/g, '')
  logger.info('编码 diagrams.net URL 片段完成')

  return encoded
}

export function buildDiagramsNetUrl(xml, options = {}) {
  /*
   * ========================================================================
   * 步骤3：构建 diagrams.net 浏览器 URL
   * ========================================================================
   * 数据源：draw.io XML 和可选 URL 参数
   * 操作要点：
   * 1) 复用 XML 片段编码
   * 2) 把图内容放入 #R fragment，避免作为请求参数发送
   */
  logger.info('开始构建 diagrams.net URL...')

  // 3.1 读取 URL 前缀，默认使用 viewer.diagrams.net
  const baseUrl = options.baseUrl || 'https://viewer.diagrams.net/?tags=%7B%7D&lightbox=1&edit=_blank'

  // 3.2 压缩编码图内容并放入 fragment
  const encoded = encodeDrawioXmlForDiagramsNet(xml)
  const url = `${baseUrl}#R${encodeURIComponent(encoded)}`
  logger.info('构建 diagrams.net URL 完成')

  return url
}

function printUsageAndExit() {
  /*
   * ========================================================================
   * 步骤4：输出命令行用法
   * ========================================================================
   * 数据源：命令行参数为空或错误
   * 操作要点：
   * 1) 打印最小可用命令
   * 2) 用非零状态退出
   */
  logger.info('开始输出命令行用法...')

  // 4.1 打印用法文本
  console.error('Usage: node diagrams-net-url.js <input.drawio>')

  // 4.2 非零退出，提示调用方参数错误
  logger.info('输出命令行用法完成')
  process.exit(2)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  /*
   * ========================================================================
   * 步骤5：处理命令行入口
   * ========================================================================
   * 数据源：process.argv[2] 指向的 draw.io 文件
   * 操作要点：
   * 1) 读取本地 .drawio 文件
   * 2) 输出可编辑 diagrams.net URL
   */
  logger.info('开始处理 diagrams.net URL 命令行入口...')

  // 5.1 获取输入路径
  const inputFile = process.argv[2]
  if (!inputFile || process.argv.includes('--help') || process.argv.includes('-h')) {
    printUsageAndExit()
  }

  // 5.2 读取 XML 并输出 URL
  const xml = readFileSync(inputFile, 'utf8')
  console.log(buildDiagramsNetUrl(xml))
  logger.info('处理 diagrams.net URL 命令行入口完成')
}

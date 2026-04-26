#!/usr/bin/env node
import { readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { spawnSync } from 'node:child_process'

const logger = {
  info: (...args) => {
    if (process.env.DRAWIO_TEST_VERBOSE === '1') {
      console.error(...args)
    }
  }
}

function collectTestFiles(root, files = []) {
  /*
   * ========================================================================
   * 步骤1：递归收集测试文件
   * ========================================================================
   * 数据源：仓库内受控测试目录
   * 操作要点：
   * 1) 跳过 node_modules 和构建产物
   * 2) 只收集 *.test.js 文件
   */
  logger.info('开始递归收集测试文件...')

  // 1.1 读取当前目录下的文件和子目录
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name)

    // 1.2 跳过不属于项目测试面的目录
    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'dist', '.vitepress'].includes(entry.name)) continue
      collectTestFiles(path, files)
      continue
    }

    // 1.3 收集 Node test runner 文件
    if (entry.isFile() && entry.name.endsWith('.test.js')) {
      files.push(path)
    }
  }
  logger.info('递归收集测试文件完成')

  return files
}

function main() {
  /*
   * ========================================================================
   * 步骤2：运行项目测试集
   * ========================================================================
   * 数据源：tests 目录与 skills 子目录下的测试文件
   * 操作要点：
   * 1) 明确限定测试目录，避免 Node 新版本误扫 node_modules
   * 2) 使用 node --test 运行完整项目测试集
   */
  logger.info('开始运行项目测试集...')

  // 2.1 收集仓库级和 skill 级测试
  const files = [
    ...collectTestFiles('tests'),
    ...collectTestFiles('skills')
  ].sort()

  // 2.2 缩短输出路径，便于失败时定位
  for (const file of files) {
    logger.info(`发现测试文件: ${relative(process.cwd(), file)}`)
  }

  // 2.3 交给 Node test runner 执行
  const result = spawnSync(process.execPath, ['--test', ...files], {
    stdio: 'inherit',
    shell: false,
    windowsHide: true
  })

  // 2.4 透传退出码
  logger.info('运行项目测试集完成')
  process.exit(result.status ?? 1)
}

main()

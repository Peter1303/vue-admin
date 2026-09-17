/**
 * 页面组件生成器（`yarn new`）
 * ============================================================
 * 由 `generateView.js` 迁移为 TypeScript（`.mts`，理由同 vite.config.mts）。
 * 除了语言/模块形式的转换，另有两处「去依赖/去死代码」的调整：
 *
 *   1. 不再使用 chalk —— 它**并未声明在 package.json 里**（只是被其它包顺带上来的间接依赖），
 *      依赖树一变就会 `Cannot find module 'chalk'`。这里用 ANSI 转义序列代替，零依赖。
 *   2. 原来手写的递归 `mkdirs` + `dotExistDirectoryCreate`（回调套 Promise）等价于
 *      `fs.mkdirSync(dir, {recursive: true})`，直接替换掉那 20 行。
 *
 * 注意：Node 的 CJS 解析**不会**把 `.ts` 加进后缀尝试列表，
 * 所以 `.ts`/`.mts` 之间必须用 ESM 且写全后缀（`./template.mts`）才能互相引用（已实测）。
 */
import path from 'node:path'
import fs from 'node:fs'
import {vueTemplate} from './template.mts'

/** 极简 ANSI 着色，替代未声明的 chalk */
const paint = (code: number, message: string): string => `\u001B[${code}m${message}\u001B[0m`
const log = (message: string): void => console.log(paint(32, message)) // green
const successLog = (message: string): void => console.log(paint(34, message)) // blue
const errorLog = (message: string): void => console.log(paint(31, message)) // red

/** 组件输出目录：<项目根>/src/views */
const VIEWS_DIR = path.resolve(import.meta.dirname, '../src/views')

async function generateFile(filePath: string, data: string): Promise<boolean> {
  if (fs.existsSync(filePath)) {
    errorLog(`${filePath}文件已存在`)
    return false
  }
  await fs.promises.writeFile(filePath, data, 'utf8')
  return true
}

/** 大驼峰 → 短横线 */
function toLowerLine(str: string): string {
  const temp = str.replace(/[A-Z]/g, match => '-' + match.toLowerCase())
  // 首字母是大写时，replace 会多出一个前导 '-'，这里去掉
  return temp.startsWith('-') ? temp.slice(1) : temp
}

log('请输入要生成的页面组件名称、会生成在 src/views/目录下')

process.stdin.on('data', async chunk => {
  const inputName = toLowerLine(String(chunk).trim())
  if (!inputName) return

  /**
   * Vue 页面组件路径
   */
  let componentVueName = path.resolve(VIEWS_DIR, inputName)
  // 如果不是以 .vue 结尾的话，自动加上
  if (!componentVueName.endsWith('.vue')) {
    componentVueName += '.vue'
  }
  /**
   * vue 组件目录路径
   */
  const componentDirectory = path.dirname(componentVueName)

  if (fs.existsSync(componentVueName)) {
    errorLog(`${inputName}页面组件已存在，请重新输入`)
    return
  }

  log(`正在生成 component 目录 ${componentDirectory}`)
  fs.mkdirSync(componentDirectory, {recursive: true})

  try {
    const inputArr = inputName.split('/')
    const componentName = inputArr[inputArr.length - 1]
    log(`正在生成 vue 文件 ${componentVueName}`)
    await generateFile(componentVueName, vueTemplate(componentName))
    successLog('生成成功')
  } catch (e) {
    errorLog(e instanceof Error ? e.message : String(e))
  }

  // 保留原实现的单次执行语义：处理完一次输入即结束进程
  process.stdin.emit('end')
})

process.stdin.on('end', () => {
  log('exit')
  process.exit()
})

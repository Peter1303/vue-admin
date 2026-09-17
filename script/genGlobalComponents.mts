/**
 * 全局组件「静态声明」生成器（`yarn gen:components`）
 * ============================================================
 * 要解决的问题
 * ------------------------------------------------------------
 * 自研组件的全局注册是**动态**的：src/packages/index.ts 用 import.meta.glob 扫描
 * 目录，组件名取自各组件自己的 defineOptions({name})。运行时没问题，但任何静态分析
 * （WebStorm 的 Vue 插件、Volar/vue-tsc）都看不见这层注册，于是模板里的
 * `<v-card>` `<v-crud>` 这类标签会被报成
 *   「Component v-card is not imported」+ 一个会把组件重复 import 一遍的 quick fix。
 *
 * 本脚本把「运行时到底注册了哪些名字」翻译成两份静态元数据：
 *   1. src/components.d.ts —— `declare module 'vue'` 的 GlobalComponents
 *                              （TS / Volar / vue-tsc / WebStorm 2025.2+ 都会读）
 *   2. web-types.json      —— JetBrains 自己的 Vue 组件元数据格式，由项目根
 *                              package.json 的 "web-types" 字段挂载。
 *                              ant-design-vue 用同一机制（vetur/web-types.json），
 *                              所以 WebStorm 认得 `<a-card>` 却不认得 `<v-card>`。
 *
 * 两份产物都提交进仓库；**新增 / 改名 / 删除组件后重跑本脚本**即可保持一致。
 *
 * 为什么是「生成」而不是手写：注册集合由目录内容决定，手写必然随增删而漂移。
 */

import fs from 'node:fs'
import path from 'node:path'

/** 项目根目录（script/ 的上一级） */
const ROOT = path.resolve(import.meta.dirname, '..')
const SRC_DIR = path.join(ROOT, 'src')
const PACKAGES_DIR = path.join(SRC_DIR, 'packages')
const PLUGINS_INDEX = path.join(SRC_DIR, 'plugins', 'index.ts')
const OUT_DTS = path.join(SRC_DIR, 'components.d.ts')
const OUT_WEB_TYPES = path.join(ROOT, 'web-types.json')

/** ant-design-vue 自己声明的全局组件名，用来避开重复声明（同名会触发 TS2717） */
const ANTDV_GLOBAL_DTS = path.join(
  ROOT,
  'node_modules',
  'ant-design-vue',
  'typings',
  'global.d.ts'
)

/** 极简 ANSI 着色（同 script/generateView.mts，避免引入未声明的 chalk） */
const paint = (code: number, message: string): string => `\u001B[${code}m${message}\u001B[0m`
const info = (message: string): void => console.log(paint(36, message))
const ok = (message: string): void => console.log(paint(32, message))
const warn = (message: string): void => console.log(paint(33, message))

/**
 * 声明里的组件类型取哪种写法
 * ------------------------------------------------------------
 * false（当前）：「DefineComponent」，只声明「这个标签对应哪个全局组件」，**不做 props 校验**。
 *                WebStorm 的「Component v-card is not imported」只看名字能不能解析到组件，
 *                所以这已经足够解决问题，且对现有 `vue-tsc --noEmit`（yarn build 的第一关）零影响。
 *
 * true         ：「typeof import('./xxx.vue')['default']」，连 props 一起校验、IDE 补全更准，
 *                但实测会让 `vue-tsc --noEmit` 多出 **5 个既有类型错误** —— 都是被这次声明
 *                「解锁」后才暴露出来的旧代码，属于独立的技术债，不该混进这次改动：
 *                  · src/layouts/menu/solo-menu.vue:16、sub-menu.vue:4,13
 *                    `<a-iconfont :type="xxx?.icon">`：shims/AIconFont.vue 把 type 声明成了必填
 *                  · src/views/crud/antd-table-creater2.vue:64
 *                    `<v-create-table :bordered="bordered">`：旧代码里 bordered 是 boolean|string，
 *                    且第 32 行 `bordered === 'bordered'` 是刻意保留的历史写法（见那里的 REVIEW 注释）
 *                  · src/views/live/workspace.vue:40、src/views/widgets/guide.vue:77
 *                    `<v-guide :steps="steps">`：driver.js 1.8 的 `Side` 只剩 top/right/bottom/left，
 *                    而旧数据里还有 'top-left' 这类 v0.9 写法（改它会影响引导弹窗的实际位置）
 *                等这些清干净了，把本开关翻成 true 重新生成即可。
 */
const STRICT_COMPONENT_TYPES = false

interface ComponentEntry {
  /** 注册用的全局标签名 */
  name: string

  /** 组件文件绝对路径 */
  file: string

  /** 注册来源：packages 目录扫描 / plugins 显式注册 */
  origin: 'packages' | 'plugins'
}

/** 绝对路径 → 仓库内 POSIX 相对路径（如 src/packages/card/Card.vue） */
const repoPath = (abs: string): string => path.relative(ROOT, abs).split(path.sep).join('/')

/**
 * 从 .vue 源码里读 defineOptions({name})。
 * 这是**唯一**的组件名来源 —— 与运行时注册用的是同一个值，不另起一套命名规则。
 */
function readDefineOptionsName(source: string): string | null {
  const block = /defineOptions\(\s*\{([\s\S]*?)\}\s*\)/.exec(source)
  if (!block) return null
  const name = /name\s*:\s*['"]([^'"]+)['"]/.exec(block[1])
  return name ? name[1] : null
}

/** 递归列出目录下所有 .vue（Node 20.12+ 的 readdirSync recursive） */
function listVueFiles(dir: string): string[] {
  return fs
    .readdirSync(dir, {recursive: true, withFileTypes: true})
    .filter((entry) => entry.isFile() && entry.name.endsWith('.vue'))
    .map((entry) => path.join(entry.parentPath, entry.name))
}

/**
 * packages/ 目录扫描结果。
 * 与 src/packages/index.ts 严格对齐：
 *   - 按路径字典序（等价于运行时 Object.keys(glob).sort()）
 *   - 同名组件后者覆盖前者（packages/skeleton 下三个都叫 Skeleton，最终生效的是字典序最后一个）
 */
function collectPackagesComponents(): {
  entries: ComponentEntry[]
  skippedNoName: string[]
  shadowed: string[]
} {
  const files = listVueFiles(PACKAGES_DIR).sort((a, b) =>
    repoPath(a) < repoPath(b) ? -1 : 1
  )

  const byName = new Map<string, ComponentEntry>()
  const skippedNoName: string[] = []
  const shadowed: string[] = []

  for (const file of files) {
    const name = readDefineOptionsName(fs.readFileSync(file, 'utf8'))
    if (!name) {
      // 运行时同样会跳过并告警，这里保持一致（不要把没有 name 的组件写进声明）
      skippedNoName.push(repoPath(file))
      continue
    }
    if (byName.has(name)) shadowed.push(`${name} ← ${repoPath(file)}`)
    byName.set(name, {name, file, origin: 'packages'})
  }

  return {entries: [...byName.values()], skippedNoName, shadowed}
}

/**
 * src/plugins/index.ts 里显式 `app.component('Name', Xxx)` 的注册。
 * 通过「解析 import 映射 → 解析注册调用」拿到名字与源文件，避免手抄一份清单。
 * plugins 在 main.ts 里于 setupGlobalComponents 之后调用，因此同名时以它为准。
 */
function collectPluginsComponents(): {entries: ComponentEntry[]; unresolved: string[]} {
  const source = fs.readFileSync(PLUGINS_INDEX, 'utf8')

  const importMap = new Map<string, string>()
  for (const match of source.matchAll(/^import\s+(\w+)\s+from\s+'(@\/[^']+)'/gm)) {
    importMap.set(match[1], path.join(SRC_DIR, match[2].slice(2)))
  }

  const entries: ComponentEntry[] = []
  const unresolved: string[] = []
  for (const match of source.matchAll(
    /(?:app|Vue)\.component\(\s*'([^']+)'\s*,\s*([A-Za-z\d_$]+)\s*\)/g
  )) {
    const [, name, localVar] = match
    const file = importMap.get(localVar)
    if (!file) {
      unresolved.push(`${name} → ${localVar}（未在本文件 import）`)
      continue
    }
    entries.push({name, file, origin: 'plugins'})
  }

  return {entries, unresolved}
}

/**
 * antdv 已声明的全局组件名。
 * Vue 解析标签时会依次尝试「原样 / camelCase / PascalCase」，
 * 所以要按这三个候选名去比对，否则 `<a-icon>`（antdv 声明的是 AIcon）会被漏判。
 */
function readAntdvGlobalNames(): Set<string> {
  if (!fs.existsSync(ANTDV_GLOBAL_DTS)) return new Set()
  const source = fs.readFileSync(ANTDV_GLOBAL_DTS, 'utf8')
  return new Set([...source.matchAll(/^\s{4}([A-Za-z\d_]+):/gm)].map((m) => m[1]))
}

const camelize = (value: string): string =>
  value.replace(/-(\w)/g, (_, char: string) => char.toUpperCase())
const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1)

/** 标签名在 GlobalComponents 里可能命中的全部写法 */
const lookupKeys = (name: string): string[] => [name, camelize(name), capitalize(camelize(name))]

/** 生成 src/components.d.ts */
function renderDts(
  entries: ComponentEntry[],
  stats: {packages: number; plugins: number; shadowed: string[]}
): string {
  const lines = entries.map((entry) => `    '${entry.name}': ${componentType(entry.file)},`)

  const shadowNote = stats.shadowed.length
    ? `同名覆盖（取后者，与运行时一致）：${stats.shadowed.join('; ')}`
    : '无同名组件。'

  return `/**
 * 自研全局组件的类型声明（**自动生成，请勿手改**）
 * ============================================================
 * 生成方式：yarn gen:components（脚本：script/genGlobalComponents.mts）
 * 数据来源：src/packages 下所有 .vue 的 defineOptions({name}) + src/plugins/index.ts 的 app.component()
 *
 * 注册是运行时动态完成的（import.meta.glob 扫目录 + 用组件自带 name），静态分析看不到，
 * 所以模板里的 <v-card> / <v-crud> 会被 IDE 报「Component ... is not imported」。
 * 这里把这批名字显式声明进 Vue 的 GlobalComponents，让 IDE / Volar / vue-tsc 能解析、
 * 并停止给出「Import 'VCard' component」这种会把组件重复 import 一遍的误导性修复。
 *
 * 类型写法：${STRICT_COMPONENT_TYPES ? '严格（连同组件的 props 一起校验）' : '宽松（DefineComponent，只声明标签对应哪个组件，不做 props 校验）'}
 *   —— 为什么宽松：解决 IDE 误报只需要「名字能解析到组件」；一旦改成严格写法，
 *      会额外暴露出 5 个**既有**类型错误（详见 script/genGlobalComponents.mts 里的说明与开关）。
 *
 * 共 ${entries.length} 个（packages ${stats.packages} + plugins ${stats.plugins}）。
 * ${shadowNote}
 * 每个标签对应的源文件见项目根的 web-types.json（IDE 里点标签可直接跳转）。
 */
export {}

declare module 'vue' {
  export interface GlobalComponents {
${lines.join('\n')}
  }
}
`
}

/** src/components.d.ts 所在的 src/ 目录 → 目标文件的相对引用（如 ./packages/card/Card.vue） */
function relativeFromSrc(abs: string): string {
  const rel = path.relative(SRC_DIR, abs).split(path.sep).join('/')
  return rel.startsWith('.') ? rel : `./${rel}`
}

/** GlobalComponents 里每个名字对应的类型（两种写法见 STRICT_COMPONENT_TYPES 的说明） */
const componentType = (file: string): string =>
  STRICT_COMPONENT_TYPES
    ? `typeof import('${relativeFromSrc(file)}')['default']`
    : `import('vue').DefineComponent`

/**
 * 生成项目根 web-types.json（JetBrains 的 Vue 组件元数据）
 * ------------------------------------------------------------
 * 用 legacy 的 `contributions.html.tags` + `"framework": "vue"`，格式与 ant-design-vue
 * 自带的 vetur/web-types.json 完全一致 —— 那份文件正是 WebStorm 认得 `<a-card>`
 * 却不认得 `<v-card>` 的原因，照着写就等于复用同一条已经被验证过的解析路径。
 * （schema 里 `tags` 标了 deprecated、推荐改用 v2 的 `elements`，但 v2 的 elements 是
 *  通用 HTML 元素符号，Vue 的「组件是否已导入」判定走的是 Vue 插件自己的组件索引，
 *  所以这里刻意沿用 legacy 格式。）
 */
function renderWebTypes(entries: ComponentEntry[], name: string, version: string): string {
  const payload = {
    $schema: 'https://raw.githubusercontent.com/JetBrains/web-types/master/schema/web-types.json',
    framework: 'vue',
    name,
    version,
    description:
      '项目内全局注册的自研组件（src/packages/** + src/plugins/index.ts）。' +
      '由 yarn gen:components 生成，勿手改。',
    contributions: {
      html: {
        tags: entries.map((entry) => ({
          name: entry.name,
          description: `全局注册的自研组件（${repoPath(entry.file)}）`,
          source: {
            module: `./${repoPath(entry.file)}`,
            symbol: 'default'
          }
        }))
      }
    }
  }
  return `${JSON.stringify(payload, null, 2)}\n`
}

function main(): void {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as {
    name: string
    version: string
  }

  const packages = collectPackagesComponents()
  const plugins = collectPluginsComponents()

  // plugins 在 main.ts 里晚于 setupGlobalComponents 执行，同名以 plugins 为准
  const byName = new Map<string, ComponentEntry>()
  for (const entry of [...packages.entries, ...plugins.entries]) byName.set(entry.name, entry)

  const antdvNames = readAntdvGlobalNames()
  const declared: ComponentEntry[] = []
  const delegated: string[] = []
  for (const entry of [...byName.values()]) {
    const hit = lookupKeys(entry.name).find((key) => antdvNames.has(key))
    if (hit) {
      // 重复声明同一个名字会触发 TS2717；antdv 那边的声明已经够 IDE 解析出标签了
      delegated.push(`${entry.name}（ant-design-vue 已声明 ${hit}）`)
      continue
    }
    declared.push(entry)
  }
  declared.sort((a, b) => (a.name < b.name ? -1 : 1))

  const stats = {
    packages: declared.filter((entry) => entry.origin === 'packages').length,
    plugins: declared.filter((entry) => entry.origin === 'plugins').length,
    shadowed: packages.shadowed
  }

  const dts = renderDts(declared, stats)
  // 防御：块注释里若出现「星号紧跟斜杠」就会被提前终止。本脚本第一版在文件头注释里
  // 写了 glob 路径（packages 下的星号星号斜杠星号.vue），其中的星号斜杠把注释截断，
  // vue-tsc 直接报了一屏 TS1109/TS1127。正常输出只该有一个收尾标记，多出来就抛错。
  const commentClosers = dts.match(/\*\//g)?.length ?? 0
  if (commentClosers !== 1) {
    throw new Error(
      `生成的 d.ts 里出现了 ${commentClosers} 处注释收尾标记（应为 1 处），块注释会被提前终止，请检查模板字符串`
    )
  }
  fs.writeFileSync(OUT_DTS, dts, 'utf8')
  fs.writeFileSync(
    OUT_WEB_TYPES,
    renderWebTypes(declared, pkg.name, pkg.version),
    'utf8'
  )

  ok(`已生成 ${repoPath(OUT_DTS)}（${declared.length} 个全局组件）`)
  ok(`已生成 ${repoPath(OUT_WEB_TYPES)}（${declared.length} 个 tag）`)
  if (packages.shadowed.length) info(`同名覆盖：${packages.shadowed.join('; ')}`)
  if (delegated.length) {
    info(`交由第三方声明（未重复声明）：${delegated.join('; ')}`)
  }
  if (packages.skippedNoName.length) {
    warn(
      `以下组件缺少 defineOptions({name})，运行时也会被跳过，未写入声明：${packages.skippedNoName.join(', ')}`
    )
  }
  if (plugins.unresolved.length) {
    warn(`plugins/index.ts 中无法解析源文件，未写入声明：${plugins.unresolved.join(', ')}`)
  }
}

main()

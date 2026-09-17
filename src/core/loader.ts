import {type Component, defineAsyncComponent} from 'vue'
import loadingError from '@/packages/exception/routeError.vue'

/**
 * 页面懒加载
 * ------------------------------------------------------------
 * 原实现依赖 webpack 的 `import(`@/${path}`)` —— webpack 会把动态表达式
 * 转换成一个「src 下所有文件的 context」，从而在运行期按路径取模块。
 * Vite 不支持这种完全动态的 import（无法静态分析前缀），
 * 必须改用 `import.meta.glob` 预先生成路径 → 模块加载器的映射表。
 *
 * 路径写法兼容原来的两种习惯：
 *   loader('views/dashboard/workplace')     ← 省略 .vue（routes.js 里大量这么写）
 *   loader('views/crud/crud.vue')
 */

/** 关键：glob 必须是「字面量字符串」，不能拼接变量，否则 Vite 无法静态分析 */
const pageModules = import.meta.glob('/src/**/*.vue') as Record<
  string,
  () => Promise<Record<string, unknown>>
>

const normalize = (p: string): string =>
  p.replace(/^@\//, '').replace(/^\.\//, '/').replace(/^\/?src\//, '').replace(/^\//, '')

/** 依次尝试 `xxx.vue` 与 `xxx/index.vue` */
const resolveKey = (path: string): string | undefined => {
  const p = normalize(path)
  const candidates = p.endsWith('.vue')
    ? [`/src/${p}`]
    : [`/src/${p}.vue`, `/src/${p}/index.vue`]
  return candidates.find((k) => k in pageModules)
}

/**
 * 路由位使用：返回「函数形态」的懒加载组件
 * （vue-router 会自行 await 并解包 default）
 *
 * ⚠️ 不要把本函数整体换成 defineAsyncComponent ——
 *    vue-router 5 会对 `component:` 上的 defineAsyncComponent 包装打
 *    `VUE_ROUTER_R0029` 警告，每次导航刷一条。
 */
export function loader(path: string): () => Promise<{ default: Component }> {
  const key = resolveKey(path)
  if (!key) {
    console.error(
      `[loader] 未找到页面 "${path}"，已回退到通用错误页。` +
      `可解析路径来自 import.meta.glob('/src/**/*.vue')`
    )
    return () => Promise.resolve({default: loadingError as Component})
  }

  const importer = pageModules[key]
  return () =>
    importer()
      .then((m) => m as unknown as { default: Component })
      .catch((e: unknown) => {
        console.error(`获取页面失败：${key}`, e)
        return {default: loadingError as Component}
      })
}

/**
 * 模板位使用：显式包一层 defineAsyncComponent
 * ------------------------------------------------------------
 * Vue 3 取消了「函数即异步组件」的隐式识别 —— 直接把 loader() 的返回值
 * 放进 `components: {}` 会被当成*函数式组件*调用，把 Promise 渲染成字面量
 * `[object Promise]`。
 */
export function loaderAsync(path: string) {
  return defineAsyncComponent(loader(path))
}

/** 一次拿到两种形态，避免在同一个文件里写两遍路径 */
export function loaderBoth(path: string) {
  return {component: loader(path), async: loaderAsync(path)}
}

export default loader

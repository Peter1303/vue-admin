import type {RouteRecordRaw} from 'vue-router'
import {createRouter, createWebHashHistory} from 'vue-router'
import NProgress from 'nprogress'
import configs from '@config'
// 直接引用 observable，避免引入 @layouts 桶文件（那会连带加载 App.vue，与 router 形成循环依赖）
import {anthNavTabs} from '@/layouts/observable/navTabs'
import baseRoutes from './baseRoutes'

/**
 * 路由
 * ------------------------------------------------------------
 * vue-router 3 → 5 的改动点：
 *   1. `new Router({ mode: 'hash' })` → `createRouter({ history: createWebHashHistory() })`
 *   2. `require.context(...)` → `import.meta.glob(...)`
 *   3. `base: process.env.BASE_URL` → `createWebHashHistory(import.meta.env.BASE_URL)`
 *   4. catch-all `path: '*'` 已移除，必须写 `/:pathMatch(.*)*`（见 baseRoutes.ts）
 *   5. `router.addRoutes()` 已删除（原代码里本来也是注释状态）
 *   6. `beforeEach` 的 `next` 回调写法已废弃 → 改为「返回值」写法，
 *      详见下方守卫实现与 `@config` 里 `router_before_each` 的注释
 */
NProgress.configure({
  showSpinner: false
})

const routeModules = import.meta.glob('/src/router/modules/*.ts', {eager: true}) as Record<
  string,
  { default?: RouteRecordRaw[] }
>

let routes: RouteRecordRaw[] = []
Object.keys(routeModules)
  .sort()
  .forEach((key) => {
    const mod = routeModules[key]
    const list = (mod.default || []) as RouteRecordRaw[]
    routes = [...routes, ...list]
  })

// 原实现把 baseRoutes 放在了 forEach 内部，模块数 > 1 时会重复追加；
// 这里改为只追加一次（结果等价且不会产生重复路由记录）
routes = [...routes, ...(baseRoutes as RouteRecordRaw[])]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

/**
 * 全局前置守卫（vue-router 5 的「返回值」写法）
 * ------------------------------------------------------------
 * `next()` 回调在 vue-router 5 已废弃：不只是类型上标了 `@deprecated`，
 * 运行时 `guardToPromiseFn` 里那句 `guard.length < 3` 才是真正的分水岭 ——
 *   · 形参个数 < 3  → 按返回值处理，守卫的 return 会喂给内部 next
 *   · 形参个数 ≥ 3  → 走老回调路径，并在开发模式打一条
 *                    `VUE_ROUTER_R0025: The 'next()' callback in navigation guards is deprecated.`
 * 所以这里去掉第三个形参、直接 return 结果。
 *
 * 另一个刻意的行为修正：原实现是 `next()` 之后**无条件**执行 `anthNavTabs(to)`，
 * 等于「被中断 / 被重定向掉的那次导航也会写进标签页」。这里只在实际放行时写。
 * 默认配置永远放行，所以常规路径的标签页行为与原实现一致。
 */
router.beforeEach((to, from) => {
  // 第一步鉴权，第二步写入 navtabs
  NProgress.start()
  const guardResult = configs.router_auth ? configs.router_before_each(to, from) : true
  // `false`（中断）/ location（重定向）/ Error 一律原样交还给 router
  if (guardResult !== true && guardResult !== undefined) return guardResult
  // 将访问过的路由写入 navTabs（与原实现保持同步调用时机）
  anthNavTabs(to)
  return true
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})

export {routes}
export default router

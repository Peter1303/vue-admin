import {createApp} from 'vue'
import Antd from 'ant-design-vue'

// antdv 4 是 CSS-in-JS，不再需要 less 入口，只需一份样式重置
import 'ant-design-vue/dist/reset.css'
import 'nprogress/nprogress.css'
import './assets/styles/main.less'

import {App} from '@layouts'
import router from '@router'
import pinia from '@store'
import {Api} from '@core'
import {setupGlobalComponents} from './packages'
import {setupPlugins} from './plugins'

/**
 * 应用入口
 * ------------------------------------------------------------
 * Vue 2 → Vue 3 的差异：
 *   - `new Vue({ render })` → `createApp(App)`
 *   - `Vue.use(Antd)`        → `app.use(Antd)`
 *   - `Vue.use(Api)`（改写 Vue.prototype.$api）→ app.use(Api)（改写 globalProperties.$api）
 *   - `Vue.filter(...)`      → 已移除，改为 globalProperties.$fmt（见 plugins/index.ts）
 *   - `import '@babel/polyfill'` → 已移除（Vite 按 browserslist 生成目标，无需整套 polyfill）
 *
 * 注册顺序很重要：
 *   `app.use(Antd)` 会注册它自带的 a-icon（已废弃），
 *   setupPlugins 里注册的同名 a-icon 适配器必须在其之后才能覆盖生效。
 */
const app = createApp(App)

/**
 * 全局错误兜底（必须保留，不要删）
 * ------------------------------------------------------------
 * Vue 2 与 Vue 3 在这里的行为完全不同，这是迁移过程中最容易「静默炸全站」的一处：
 *
 *   Vue 2：组件内未捕获的错误只会 console.error，调度器完全不受影响。
 *   Vue 3：handleError() 在 dev 下会把错误**重新抛出**（throwInDev = true），
 *          而生命周期钩子的包装函数（injectHook）里
 *          `pauseTracking()` 与 `resetTracking()` 之间**没有 try/finally**，
 *          flushPostFlushCbs 里也没有 try/catch。错误一旦逃逸出去就会同时造成：
 *            · shouldTrack 永久停在 false → 之后所有 effect 都收集不到依赖
 *            · isFlushing  永久停在 true  → 调度队列再也不 flush
 *            · currentFlushPromise 变成 rejected → nextTick() 永远 reject
 *          最终表现：**整个应用「点哪儿都没反应」** —— 侧边菜单点不开、
 *          路由跳不动、设置抽屉/开关/单选框全部失效，而且刷新前不可恢复，
 *          控制台里只有一行 [Vue warn] Unhandled error ...，非常难定位。
 *
 * 只要挂了 errorHandler，handleError() 就会直接 return、不再重抛，
 * 上面三个全局状态都不会被破坏，单个组件出问题只影响它自己。
 *
 * 实测触发场景：@antv/g2 的 tooltip 在 render 期抛错（见 shims/g2-tooltip-crosshairs.ts）。
 */
app.config.errorHandler = (err, _instance, info) => {
  console.error(`[app error] ${info}`, err)
}

app.use(Antd)
app.use(router)
app.use(pinia)
app.use(Api)
setupGlobalComponents(app)
setupPlugins(app)

app.mount('#app')

console.log(
  `
    █████▒█    ██  ▄████▄   ██ ▄█▀       ██████╗ ██╗   ██╗ ██████╗
 ▓██   ▒ ██  ▓██▒▒██▀ ▀█   ██▄█▒        ██╔══██╗██║   ██║██╔════╝
 ▒████ ░▓██  ▒██░▒▓█    ▄ ▓███▄░        ██████╔╝██║   ██║██║  ███╗
 ░▓█▒  ░▓▓█  ░██░▒▓▓▄ ▄██▒▓██ █▄        ██╔══██╗██║   ██║██║   ██║
 ░▒█░   ▒▒█████▓ ▒ ▓███▀ ░▒██▒ █▄       ██████╔╝╚██████╔╝╚██████╔╝
  ▒ ░   ░▒▓▒ ▒ ▒ ░ ░▒ ▒  ░▒ ▒▒ ▓▒       ╚═════╝  ╚═════╝  ╚═════╝
  ░     ░░▒░ ░ ░   ░  ▒   ░ ░▒ ▒░
  ░ ░    ░░░ ░ ░ ░        ░ ░░ ░
           ░     ░ ░      ░  ░
`,
  `version: ${__APP_VERSION__}`
)

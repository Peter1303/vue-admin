import {createPinia} from 'pinia'
import utils from '@/common/utils'
import {configurePersist, createPersistedStatePlugin} from '@/shims/persist'

/**
 * 状态管理
 * ------------------------------------------------------------
 * Vuex 3 → Pinia 的替换。
 *
 * 原实现（core/store.js）用 require.context 扫描 @store/modules 动态注册模块，
 * 并加载 vuex-persistedstate（key = 版本号，storage = sessionStorage）。
 * Pinia 的 store 用法是「按需 import 使用」，不再需要集中注册，
 * 因此这里只负责创建实例 + 装上等价语义的持久化插件。
 */
const pinia = createPinia()

// 与原实现一致：以版本号为前缀，存 sessionStorage，
// 这样发版后旧缓存自然失效
configurePersist({
  key: utils.getVersion(),
  storage: window.sessionStorage
})

pinia.use(createPersistedStatePlugin())

export default pinia
export {pinia}

/**
 * Vue 组件实例的全局属性类型增强
 * ------------------------------------------------------------
 * plugins/index.ts 和 core/api.ts 通过 `app.config.globalProperties` 注入了两个全局属性：
 *   - `$fmt`  ← 原 Vue 2 的 `Vue.filter(...)`（Vue 3 已移除过滤器）
 *   - `$api`  ← 原 `Vue.prototype.$api`
 *
 * 不声明这里的话，`vue-tsc --noEmit` 会在模板里报
 * 「Property '$fmt' does not exist on type ...」，构建脚本 `vue-tsc --noEmit && vite build` 直接失败。
 *
 * 注意：本文件必须是一个 **模块**（有顶层 import/export），
 * 才能对 'vue' 做模块增强（module augmentation）。放在 env.d.ts 里不行 ——
 * 那个文件是无 import/export 的全局脚本，`declare module 'vue'` 会被当成
 * 「重新声明 vue 模块」从而把官方类型整体覆盖掉。
 */
import type {ApiMap} from '@core/api'

/** @/common/filter 的默认导出（star / currency / timeFormat / telFormat ...） */
type GlobalFilters = typeof import('@/common/filter')['default']

export {}

declare module 'vue' {
  interface ComponentCustomProperties {
    /** 全局格式化方法，模板里写 `{{ $fmt.currency(1000) }}` */
    $fmt: GlobalFilters
    /** 全局接口集合，等价于原来的 Vue.prototype.$api */
    $api: ApiMap
  }
}

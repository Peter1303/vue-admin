import type {App} from 'vue'
import filters from '@/common/filter'
import {setupDirectives} from '@/common/directive'
import PerfectScrollbar from '@/shims/PerfectScrollbar.vue'
import AIcon from '@/shims/AIcon.vue'
import AIconFont from '@/shims/AIconFont.vue'
import TheMask from '@/shims/TheMask.vue'
import {vMask} from '@/shims/vue-the-mask'
import LazyRender from '@/shims/LazyRender.vue'

/**
 * 全局插件装配
 * ------------------------------------------------------------
 * 原实现（plugins/index.js）里 Vue.use(...) 的那批包都没有 Vue 3 版本：
 *   vue-amap / vue-perfect-scrollbar / vue-the-mask / vue-lazy-render
 * 处理方式：
 *   - vue-the-mask：  自研兼容层。原 `Vue.use(VueTheMask)` 会同时注册
 *                     组件 `TheMask` 与指令 `v-mask`：
 *                       · `<the-mask>` 在 2 处被使用
 *                         （packages/licence-plate、views/widgets/mask）
 *                       · `v-mask` 指令无外部引用（仅组件内部自用）
 *                     见 shims/vue-the-mask.ts + shims/TheMask.vue
 *   - vue-lazy-render：自研兼容层。`<lazy-render>` 在 packages/actionbar 里被使用
 *                     （v-actionbar 的外层延迟渲染），原注册缺失会让该组件整块渲染为空。
 *                     见 shims/LazyRender.vue
 *   - vue-amap：     改用 @amap/amap-jsapi-loader，见 shims/amap.ts
 *   - perfect-scrollbar：包装成 shims/PerfectScrollbar.vue
 *   - moment.locale('zh-cn') 已移入 shims/moment.ts
 */
export function setupPlugins(app: App): void {
  // 原 Vue.use(VuePerfectScrollbar) 的全局组件名
  app.component('VuePerfectScrollbar', PerfectScrollbar)

  // 覆盖 antdv 4 内置的 a-icon（antdv 1 的图标字体写法全站大量使用）
  app.component('a-icon', AIcon)
  // 原 packages/IconFont/IconFont.vue 依赖第三方组件自带 name 自动注册，这里显式注册
  app.component('a-iconfont', AIconFont)

  // 原 Vue.use(VueTheMask)：同时注册组件 <the-mask> 与指令 v-mask
  app.component('TheMask', TheMask)
  app.directive('mask', vMask)

  // 原 Vue.use(LazyRender)：全局组件 <lazy-render>
  app.component('LazyRender', LazyRender)

  // 过滤器在 Vue 3 已移除，改为 globalProperties.$fmt（模板里用 $fmt.currency(x)）
  app.config.globalProperties.$fmt = filters

  setupDirectives(app)
}

export default setupPlugins

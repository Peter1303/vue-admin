import App from './App.vue'
import loader, {loaderAsync} from '@core/loader'
import {layout, mediaQuery, setFontSize, setPrimaryColor} from './observable/layout'
import {anthNavTabs} from './observable/navTabs'

/**
 * 布局壳的两种导出形态（关键，别混用）
 * ------------------------------------------------------------
 * Vue 2 时代 `loader()` 返回的「函数」在两种位置都能用：
 *   - 路由 `component:`  → ✅
 *   - 模板 `<v-home>`    → ✅（Vue 2 会把没有 cid 的函数隐式当异步组件工厂）
 * Vue 3 取消了这一隐式识别：裸函数会被当成*函数式组件*直接调用，
 * 返回值（Promise）被 toDisplayString 渲染成字面量 `[object Promise]`。
 *
 * 因此：
 *   Home      → 给 vue-router 的 `component:`
 *   HomeAsync → 给模板里的普通子组件
 * 同时不要给路由位套 defineAsyncComponent，vue-router 5 会打 VUE_ROUTER_R0029 警告。
 */
const Home = loader('layouts/layout/default.vue')
const HomeAsync = loaderAsync('layouts/layout/default.vue')

export {Home, HomeAsync, App, layout, mediaQuery, setFontSize, setPrimaryColor, anthNavTabs}

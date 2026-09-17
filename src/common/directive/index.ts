import type {App, Directive} from 'vue'
import clipboard from './modules/clipboard'
import clickaway from './modules/clickaway'
import currency from './modules/currency'
import delHtmlTag from './modules/delHtmlTag'
import drag from './modules/drag'
import draggable from './modules/draggable'
import highlight from './modules/highlight'
import isAuth from './modules/isAuth'
import resize from './modules/resize'

/**
 * 全局指令注册
 * ------------------------------------------------------------
 * 原实现用 `require.context('./modules', true, /\.js$/)` 扫描目录、
 * 以「文件名即指令名」的方式批量注册，Vite 下改用 import.meta.glob 也能做，
 * 但显式列举在 TS 下类型更清晰，也避免新增文件时被静默漏注册。
 *
 * 指令名与原来的对应关系：
 *   v-clipboard / v-currency / v-delHtmlTag / v-drag / v-draggable
 *   v-highlight / v-isAuth / v-resize
 *   v-on-clickaway  ← 原来由 vue-clickaway 提供（配合 mixins: [clickaway]）
 */
const directives: Record<string, Directive> = {
  clipboard,
  currency,
  delHtmlTag,
  drag,
  draggable,
  highlight,
  isAuth,
  resize,
  clickaway,
  // vue-clickaway 的原始指令名
  'on-clickaway': clickaway
}

export function setupDirectives(app: App): void {
  Object.keys(directives).forEach((name) => {
    app.directive(name, directives[name])
  })
}

export {directives}
export default setupDirectives

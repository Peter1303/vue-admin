/**
 * v-on-clickaway —— 替代 vue-clickaway（无 Vue 3 版本）
 * ------------------------------------------------------------
 * 原用法是 `mixins: [clickaway]` + `v-on-clickaway="handler"`，
 * Vue 3 下不再需要 mixin，指令本身即可完成绑定与清理。
 */
import type {Directive} from 'vue'

type ClickawayEl = HTMLElement & { __clickawayHandler__?: (e: MouseEvent) => void }

export default {
  mounted(el: ClickawayEl, binding) {
    const handler = (e: MouseEvent) => {
      // 点击发生在元素内部则不算 away
      if (el === e.target || el.contains(e.target as Node)) return
      if (typeof binding.value === 'function') binding.value(e)
    }
    el.__clickawayHandler__ = handler
    // 冒泡阶段监听，避免和内部的 click 抢执行顺序；下一帧再挂，防止「打开」的那次点击立刻触发 away
    setTimeout(() => document.addEventListener('click', handler, true), 0)
  },
  unmounted(el: ClickawayEl) {
    if (el.__clickawayHandler__) {
      document.removeEventListener('click', el.__clickawayHandler__, true)
      delete el.__clickawayHandler__
    }
  }
} as Directive<ClickawayEl>

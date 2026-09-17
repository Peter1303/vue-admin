/**
 * v-resize —— 替代 vue-resize-directive（无 Vue 3 版本）
 * ------------------------------------------------------------
 * 用法：`v-resize="handler"` / `v-resize.debounce.500="handler"`
 * 内部改用 ResizeObserver，比监听 window.resize 更准确
 * （原实现监听 window，容器自身尺寸变化时不会触发）。
 */
import type {Directive, DirectiveBinding} from 'vue'

type ResizeEl = HTMLElement & {
  __resizeObserver__?: ResizeObserver
  __resizeHandler__?: () => void
  __resizeTimer__?: ReturnType<typeof setTimeout>
}

const apply = (el: ResizeEl, binding: DirectiveBinding) => {
  const mods = Object.keys(binding.modifiers || {})
  const useDebounce = mods.includes('debounce')
  const delayMod = mods.find((m) => /^\d+$/.test(m))
  const delay = delayMod ? Number(delayMod) : 250

  const run = () => {
    const fn = binding.value
    if (typeof fn !== 'function') return
    if (useDebounce) {
      clearTimeout(el.__resizeTimer__)
      el.__resizeTimer__ = setTimeout(() => fn(el), delay)
    } else {
      fn(el)
    }
  }

  el.__resizeHandler__ = run
  el.__resizeObserver__?.disconnect()
  const ro = new ResizeObserver(run)
  ro.observe(el)
  el.__resizeObserver__ = ro
}

export default {
  mounted: apply,
  updated(el: ResizeEl, binding: DirectiveBinding) {
    // 回调闭包可能捕获了新的作用域，重建 observer
    apply(el, binding)
  },
  unmounted(el: ResizeEl) {
    el.__resizeObserver__?.disconnect()
    clearTimeout(el.__resizeTimer__)
    delete el.__resizeObserver__
    delete el.__resizeHandler__
    delete el.__resizeTimer__
  }
} as Directive<ResizeEl>

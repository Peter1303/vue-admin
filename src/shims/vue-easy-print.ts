import {defineComponent, h, ref} from 'vue'

/**
 * vue-easy-print 的 Vue 3 自研替代件
 * ------------------------------------------------------------
 * 原库（vue-easy-print）只发布过 Vue 2 版本，没有 Vue 3 版本，也没有可替代的等价库。
 * 这里按原库对外的**公开契约**重新实现：
 *
 *   - 组件名：`vue-easy-print`（模板里用 `<vue-easy-print>`）
 *   - props：`table-show`（原库用于「连表格一起打印」的开关，这里保留以免调用方属性失效）
 *   - 通过 ref 暴露 `print()` 方法，父组件调 `printRef.print()` 触发打印
 *   - 插槽内容即「要打印的内容」，组件本身不额外包裹可见 DOM 结构
 *
 * 实现思路与常见打印方案一致：把要打印的 DOM 片段连同当前页面的样式一起
 * 写进一个隐藏 iframe，再调该 iframe 的 `print()`。这样打印出来的内容与
 * 屏幕所见基本一致，且不会干扰当前页面。
 *
 * 用法（与 src/views/plugin/print.vue 一致）：
 *   <vue-easy-print table-show ref="easyPrint"><div>...</div></vue-easy-print>
 *   easyPrint.value?.print()
 */
export default defineComponent({
  name: 'vue-easy-print',
  props: {
    // 原库的「打印表格」开关。当前实现统一打印插槽内的全部内容，
    // 该 prop 仅用于兼容调用方传参，不影响输出。
    tableShow: {
      type: Boolean,
      default: false
    }
  },
  setup(_props, {slots, expose}) {
    const rootRef = ref<HTMLElement | null>(null)

    /** 收集当前页面的样式节点，保证打印结果与屏幕一致 */
    function collectStyles(): string {
      return Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((node) => node.outerHTML)
        .join('')
    }

    function print(): void {
      const root = rootRef.value
      if (!root) return

      const iframe = document.createElement('iframe')
      iframe.setAttribute('aria-hidden', 'true')
      Object.assign(iframe.style, {
        position: 'fixed',
        right: '0',
        bottom: '0',
        width: '0',
        height: '0',
        border: '0'
      })
      document.body.appendChild(iframe)

      const win = iframe.contentWindow
      const doc = iframe.contentDocument
      if (!win || !doc) {
        iframe.remove()
        return
      }

      doc.open()
      doc.write(
        `<!DOCTYPE html><html><head><meta charset="utf-8">${collectStyles()}</head>` +
        `<body>${root.innerHTML}</body></html>`
      )
      doc.close()

      const doPrint = () => {
        win.focus()
        win.print()
        // 打印对话框（含「另存为 PDF」）关闭后再移除 iframe，过早移除会打断打印
        window.setTimeout(() => iframe.remove(), 0)
      }

      // 等待样式生效再打印，否则可能出现「打印出无样式内容」
      if (doc.readyState === 'complete') {
        window.setTimeout(doPrint, 100)
      } else {
        win.addEventListener('load', () => window.setTimeout(doPrint, 100), {once: true})
      }
    }

    expose({print})

    return () =>
      h('div', {ref: rootRef, class: 'vue-easy-print'}, slots.default ? slots.default() : [])
  }
})

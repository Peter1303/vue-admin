import Clipboard from 'clipboard'
import type {Directive, DirectiveBinding} from 'vue'

/**
 * 复制到剪贴板
 * ------------------------------------------------------------
 * 用法：v-clipboard="{ value: '要复制的内容', success, error }"
 * 依赖仍是 clipboard@2（与 Vue 2 版项目一致，这个库与框架无关）。
 *
 * 说明：原文件在迁移过程中丢失（directive/index.ts 仍引用它），此处按 git 历史恢复，
 * 并把 Vue 2 钩子名换成 Vue 3 等价钩子：
 *   bind → mounted / update → updated / unbind → unmounted
 */

interface ClipboardValue {
  value: string
  success?: (e: Clipboard.Event) => void
  error?: (e: Clipboard.Event) => void
}

/**
 * clipboard@2 的实例在运行时会挂一个 `text` 字段（用于 update 时改复制内容），
 * 但官方 d.ts 没有声明它，这里补一个交叉类型。
 */
type ClipboardInstance = Clipboard & { text?: (elem: Element) => string }

/** 挂在元素上的临时字段，用于在 updated / unmounted 阶段取回实例与回调 */
type ClipboardEl = HTMLElement & {
  __clipboard__?: ClipboardInstance
  __success_callback__?: ClipboardValue['success']
  __error_callback__?: ClipboardValue['error']
}

function readValue(binding: DirectiveBinding): ClipboardValue {
  return (binding.value || {value: ''}) as ClipboardValue
}

function bindClipboard(el: HTMLElement, binding: DirectiveBinding): void {
  const target = el as ClipboardEl
  const {value, success, error} = readValue(binding)

  const clipboard: ClipboardInstance = new Clipboard(el, {
    text: () => value
  })

  target.__success_callback__ = success
  target.__error_callback__ = error

  clipboard.on('success', (e) => {
    const callback = target.__success_callback__
    callback && callback(e)
  })
  clipboard.on('error', (e) => {
    const callback = target.__error_callback__
    callback && callback(e)
  })

  target.__clipboard__ = clipboard
}

function updateClipboard(el: HTMLElement, binding: DirectiveBinding): void {
  const target = el as ClipboardEl
  // 原实现直接假设实例存在；这里补一个守卫，避免首次 updated 早于 mounted 时报错
  if (!target.__clipboard__) return

  const {value, success, error} = readValue(binding)
  target.__clipboard__.text = () => value
  target.__success_callback__ = success
  target.__error_callback__ = error
}

function unbindClipboard(el: HTMLElement): void {
  const target = el as ClipboardEl
  delete target.__success_callback__
  delete target.__error_callback__
  target.__clipboard__?.destroy()
  delete target.__clipboard__
}

export default {
  mounted: bindClipboard,
  updated: updateClipboard,
  unmounted: unbindClipboard
} as Directive<HTMLElement>

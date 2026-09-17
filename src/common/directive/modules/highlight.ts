import type {Directive, DirectiveBinding} from 'vue'

/**
 * v-highlight —— 关键词高亮
 * 用法：`v-highlight="{ value: 文本, keyword: 关键词, color: '#f86c6b' }"`
 */
interface HighlightValue {
  value: string
  keyword?: string
  color?: string
}

const highlight = (el: HTMLElement, binding: DirectiveBinding<HighlightValue>): void => {
  const value0 = binding.value
  if (!value0) return

  const keywords = value0.keyword
  const color = value0.color || 'red'
  let value = value0.value ?? ''

  if (keywords) {
    const reg = new RegExp(keywords, 'ig')
    const regB = new RegExp(' ', 'ig')
    value = value.replace(regB, '')
    el.innerHTML = value.replace(reg, `<span style="color:${color}">${keywords}</span>`)
  } else {
    el.innerHTML = value
  }
}

export default {
  mounted: highlight,
  updated: highlight
} as Directive<HTMLElement>

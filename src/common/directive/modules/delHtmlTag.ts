import type {Directive} from 'vue'

/**
 * v-delHtmlTag —— 去掉元素内容里的 HTML 标签
 * 用法：`v-delHtmlTag`
 */
const strip = (el: HTMLElement): void => {
  const str = el.innerText
  el.innerHTML = str.replace(/<[^>]+>/g, '')
}

export default {
  mounted: strip,
  updated: strip
} as Directive<HTMLElement>

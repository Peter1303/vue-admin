<template>
  <div class="pre-code" v-html="highlighted"></div>
</template>

<script lang="ts" setup>
import {computed, Text, useSlots} from 'vue'
import hljs from 'highlight.js'
import javascript from 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/github.css'

hljs.registerLanguage('javascript', javascript)

defineOptions({name: 'v-pre-code'})

const props = withDefaults(
  defineProps<{
    lang?: string
    highlight?: boolean
  }>(),
  {
    lang: 'javascript',
    highlight: false
  }
)

const slots = useSlots()

/**
 * 递归提取插槽 vnode 的纯文本内容（原高亮方案也是把默认插槽的文本交给 highlight 渲染，
 * 这里用 highlight.js v11 自行实现同样效果）。
 */
function getText(nodes: any[]): string {
  let str = ''
  for (const n of nodes) {
    if (n == null) continue
    if (typeof n.children === 'string') {
      str += n.children
    } else if (Array.isArray(n.children)) {
      str += getText(n.children)
    } else if (n.type === Text && n.children == null) {
      str += ''
    }
  }
  return str
}

const code = computed(() => getText(slots.default?.() || []))

const highlighted = computed(() => {
  if (!code.value) return ''
  try {
    if (props.lang && hljs.getLanguage(props.lang)) {
      return hljs.highlight(code.value, {language: props.lang}).value
    }
    return hljs.highlightAuto(code.value).value
  } catch (e) {
    return code.value
  }
})
</script>

<style lang="less">
.pre-code {
  font-size: 16px;
}
</style>

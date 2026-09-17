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

/*
 * 深色模式下重刷 highlight.js 的配色
 * ------------------------------------------------------------
 * 上面 `import 'highlight.js/styles/github.css'` 引入的是**浅色**主题，
 * 它给 token 的词法色都是深色系（关键字 #d73a49、字符串 #032f62、常量 #005cc5…）。
 * 这些颜色画在白底上很清楚，一旦背景变成 #141414 就几乎看不见了 ——
 * 实测 /filterbox 里 `.pre-code .hljs-string` 是 rgb(3,47,98) 配 rgb(20,20,20)，
 * 对比度只有 1.39（WCAG 要求 ≥ 3）。
 *
 * 这里按 github-dark 的同名 token 配色覆盖一遍。只覆盖颜色、不动字号行高，
 * 浅色模式完全不受影响（选择器带 html[data-theme='dark'] 前缀）。
 *
 * ⚠️ 选择器要一行写完（逗号 + 完整选择器）：less 里逗号换行续写会被格式化工具
 *    当成「后代组合器」插错位置，生成空选择器让整条规则被丢弃。
 */
html[data-theme='dark'] .pre-code {
  color: #c9d1d9;

  .hljs-doctag, .hljs-keyword, .hljs-meta .hljs-keyword, .hljs-template-tag, .hljs-template-variable, .hljs-type, .hljs-variable.language_ {
    color: #ff7b72;
  }

  .hljs-title, .hljs-title.class_, .hljs-title.class_.inherited__, .hljs-title.function_ {
    color: #d2a8ff;
  }

  .hljs-attr, .hljs-attribute, .hljs-literal, .hljs-meta, .hljs-number, .hljs-operator, .hljs-variable, .hljs-selector-attr, .hljs-selector-class, .hljs-selector-id {
    color: #79c0ff;
  }

  .hljs-regexp, .hljs-string, .hljs-meta .hljs-string {
    color: #a5d6ff;
  }

  .hljs-built_in, .hljs-symbol {
    color: #ffa657;
  }

  .hljs-comment, .hljs-code, .hljs-formula {
    color: #8b949e;
  }

  .hljs-name, .hljs-quote, .hljs-selector-tag, .hljs-selector-pseudo {
    color: #7ee787;
  }

  .hljs-subst {
    color: #c9d1d9;
  }

  .hljs-section {
    color: #79c0ff;
  }

  .hljs-bullet {
    color: #f2cc60;
  }

  .hljs-emphasis, .hljs-strong {
    color: #c9d1d9;
  }

  .hljs-addition {
    color: #aff5b4;
    background-color: #033a16;
  }

  .hljs-deletion {
    color: #ffdcd7;
    background-color: #67060c;
  }
}
</style>

<!--
  TheMask —— vue-the-mask 的 Vue 3 兼容组件（自研）
  ============================================================
  逐行对应原库 `vue-the-mask@0.11.1` 的 `src/component.vue`，
  只改了「契约形态」这一件事：

    原库（Vue 2）            本兼容层（Vue 3）
    value  + input      →   同时支持三套，任意一种写法都能用：
                              · modelValue + update:modelValue（普通 v-model）
                              · value      + update:value     （v-model:value）
                              · value      + input            （历史写法）

  内部逻辑（display / lastValue / isTrusted 拦截 / refresh 去重）与原实现完全一致：
  原生 input 事件被忽略，只处理 v-mask 指令派发出来的「非 trusted」自定义事件。
-->
<script lang="ts" setup>
import {computed, ref, watch} from 'vue'
import {theme} from 'ant-design-vue'
import type {MaskConfig, MaskInput, MaskTokens} from '@/shims/vue-the-mask'
import {masker, tokens as defaultTokens, vMask} from '@/shims/vue-the-mask'

defineOptions({name: 'TheMask'})

/**
 * antdv 4 的样式是 CSS-in-JS：组件的规则形如 `:where(.css-xxx).ant-input { ... }`，
 * **必须「hash 类 + 语义类」同时存在才命中**（实测本项目里含 ant-input 的 172 条规则全是这个形态）。
 *
 * 而 vue-the-mask 时代的用法是「给原生 input 挂一个 class="ant-input" 就当 antd 输入框用」——
 * antdv 1 的样式来自全局静态 CSS，那样写成立；antdv 4 下只挂 ant-input 不命中任何规则，
 * 于是渲染成浏览器默认外观（实测 26px 高、`border: 2px inset rgb(118,118,118)`、直角、width 180px），
 * 与旁边真正的 a-input（32px / `1px solid #d9d9d9` / 圆角 6px / width 100%）明显不一致。
 *
 * 这里把当前主题的 hashId 一并挂上，等价于恢复 antdv 1 时代的行为。
 * 两个调用点（views/widgets/mask.vue、packages/licence-plate）仍然照旧传 `class="ant-input"`，
 * 不需要改。hashId 单独存在时不影响任何东西，所以无条件挂上是安全的。
 *
 * ⚠️ 验证须知（踩过两次的坑）：hashId 是**运行时**从 antd 取的，所以「改完就生效」只对**全新加载**成立。
 *   SPA 内部切路由不会重新加载模块；HMR 断连时（页面挂久了 / dev server 重启过 / 标签页被 bfcache 恢复）
 *   浏览器会一直用旧组件 —— 表现就是这里没有 hashId、输入框退回成 26px 的原生外观（黑/灰粗边、更矮）。
 *   排查「明明改好了却还是旧的」时，先 `Ctrl+Shift+R` 硬刷新、或新开标签页再看，别急着改代码。
 */
const {hashId} = theme.useToken()

const props = withDefaults(
  defineProps<{
    /** Vue 2 时代的契约；v-model / v-model:value 都会落到这个 prop */
    value?: string | number
    /** Vue 3 标准契约（普通 v-model） */
    modelValue?: string | number
    mask: MaskInput
    /** false = 向外发原始值（默认），true = 把掩码字符一起发出去 */
    masked?: boolean
    tokens?: MaskTokens
  }>(),
  {
    masked: false,
    tokens: () => defaultTokens
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'update:value', v: string): void
  /** 原库的事件名，保留以兼容历史调用方 */
  (e: 'input', v: string): void
}>()

// 原组件 data 里的 display / lastValue
const display = ref<string>(String(props.value ?? props.modelValue ?? ''))
let lastValue: string | null = null

const config = computed<MaskConfig>(() => ({
  mask: props.mask,
  tokens: props.tokens,
  masked: props.masked
}))

// 原 watch: value(newValue) { if (newValue !== this.lastValue) this.display = newValue }
watch(
  () => props.value ?? props.modelValue,
  (newValue) => {
    if (newValue !== lastValue) {
      display.value = String(newValue ?? '')
    }
  }
)

// 原 watch: masked() { this.refresh(this.display) }
watch(
  () => props.masked,
  () => {
    refresh(display.value)
  }
)

// 原 methods.refresh
function refresh(value: string): void {
  display.value = value
  const next = masker(value, props.mask, props.masked, props.tokens)
  if (next !== lastValue) {
    lastValue = next
    emit('update:modelValue', next)
    emit('update:value', next)
    emit('input', next)
  }
}

// 原 methods.onInput：忽略原生事件，只处理 v-mask 派发的自定义事件
function onInput(e: Event): void {
  if (e.isTrusted) return
  refresh((e.target as HTMLInputElement).value)
}
</script>

<template>
  <input
    v-mask="config"
    :class="hashId"
    :value="display"
    type="text"
    @input="onInput"
  />
</template>

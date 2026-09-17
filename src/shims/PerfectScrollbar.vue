<script lang="ts" setup>
/**
 * VuePerfectScrollbar —— 替代 vue-perfect-scrollbar（仅支持 Vue 2）
 * ------------------------------------------------------------
 * 直接使用底层的 perfect-scrollbar，保持原来的 props：
 *   :settings  初始化选项
 *   @ps-scroll-y 等滚动事件
 * 本项目只在 views/live/scrollbar.vue 使用。
 */
import {onBeforeUnmount, onMounted, ref, watch} from 'vue'
import PerfectScrollbar from 'perfect-scrollbar'
import 'perfect-scrollbar/css/perfect-scrollbar.css'

defineOptions({name: 'VuePerfectScrollbar'})

const props = withDefaults(defineProps<{ settings?: Record<string, unknown> }>(), {
  settings: () => ({})
})

const emit = defineEmits<{
  (e: 'ps-scroll-y', event: Event): void
  (e: 'ps-scroll-x', event: Event): void
  (e: 'ps-scroll-up' | 'ps-scroll-down' | 'ps-scroll-left' | 'ps-scroll-right'): void
}>()

const container = ref<HTMLElement | null>(null)
let instance: PerfectScrollbar | null = null

const scrollY = (e: Event) => emit('ps-scroll-y', e)
const scrollX = (e: Event) => emit('ps-scroll-x', e)

onMounted(() => {
  if (!container.value) return
  container.value.style.position = container.value.style.position || 'relative'
  instance = new PerfectScrollbar(container.value, props.settings)
  container.value.addEventListener('ps-scroll-y', scrollY)
  container.value.addEventListener('ps-scroll-x', scrollX)
})

watch(
  () => props.settings,
  () => {
    instance?.update()
  },
  {deep: true}
)

onBeforeUnmount(() => {
  container.value?.removeEventListener('ps-scroll-y', scrollY)
  container.value?.removeEventListener('ps-scroll-x', scrollX)
  instance?.destroy()
  instance = null
})
</script>

<template>
  <div ref="container" class="ps-container">
    <slot/>
  </div>
</template>

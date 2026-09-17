<!--
  LazyRender —— vue-lazy-render 的 Vue 3 兼容组件（自研）
  ============================================================
  原库 `vue-lazy-render@1.0.20` 仅支持 Vue 2（`main.js` 里是 `Vue.component`）。
  本文件逐行对应原库 `src/lazy.vue`，逻辑完全一致：

    · 未传 data（或 data.length > limit）→ 先隐藏、等待 time 毫秒后再渲染，期间显示遮罩
    · 其余情况 → 立即渲染
    · 路由变化时（未开启 trackByData）重新走一次延迟渲染
    · immediately 由假变真时立刻重开一次延迟渲染

  唯一的行为差异：组件卸载时会清掉那个 setTimeout。原实现在卸载后仍会触发回调，
  Vue 2/3 下那次 setState 与 emit 都是空操作，清掉只是避免无意义的定时器悬挂。
-->
<script lang="ts" setup>
import {onUnmounted, ref, watch} from 'vue'
import {useRoute} from 'vue-router'

defineOptions({name: 'LazyRender'})

const props = withDefaults(
  defineProps<{
    /** 需要延迟渲染的列表数据（用于判断数据量是否超过 limit） */
    data?: unknown[]
    /** 等待渲染时的遮罩层样式 */
    maskClass?: string
    /** 等待渲染时的提示文字 */
    tip?: string
    /** 延迟渲染的毫秒数 */
    time?: number
    /** 数据超过多少条才开启延迟渲染 */
    limit?: number
    /** 是否跟随 data 的变化重新渲染（开启后路由切换不再触发） */
    trackByData?: boolean
    /** 是否在变为 true 时立即重新渲染 */
    immediately?: boolean
  }>(),
  {
    tip: '正在渲染,请稍候',
    time: 10,
    limit: 30
  }
)

const emit = defineEmits<{ (e: 'loaded'): void }>()

const show = ref(true)
let timer: ReturnType<typeof setTimeout> | null = null

function clearTimer(): void {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
}

/** 延迟渲染：隐藏 → 等 time 毫秒 → 显示并抛出 loaded */
function syncLoader(): void {
  clearTimer()
  show.value = false
  timer = setTimeout(() => {
    timer = null
    show.value = true
    emit('loaded')
  }, props.time)
}

/** 判断是否要开启延迟渲染（对应原 showLazy） */
function showLazy(): void {
  if ((props.data && props.data.length > props.limit) || !props.data) {
    syncLoader()
  } else {
    clearTimer()
    show.value = true
    emit('loaded')
  }
}

// 原 created() { this.showLazy() }
showLazy()

// 原 watch.data：仅当 trackByData 开启时才重新渲染
watch(
  () => props.data,
  () => {
    if (props.trackByData) showLazy()
  }
)

// 原 watch.$route：未开启 trackByData 时，路由变化重新渲染
const route = useRoute()
watch(
  () => route?.fullPath,
  () => {
    if (!props.trackByData) showLazy()
  }
)

// 原 watch.immediately：由假变真时立刻重开一次
watch(
  () => props.immediately,
  (v) => {
    if (v) showLazy()
  }
)

onUnmounted(clearTimer)
</script>

<template>
  <div class="lazy-load">
    <slot v-if="show"/>
    <slot
      v-else
      name="tip"
    >
      <div
        :class="[maskClass ? maskClass : 'lazy-load-mask']"
        v-html="tip"
      />
    </slot>
  </div>
</template>

<style scoped>
.lazy-load {
  position: relative;
  width: 100%;
}

.lazy-load-mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  text-align: center;
  color: #fff;
  font-size: 14px;
  line-height: 24px;
}
</style>

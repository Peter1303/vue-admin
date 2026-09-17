<template>
<span class="count-to number">
    <slot name="prefix"><span class="prefix">{{ prefix }}</span></slot><span
  class="number">{{ displayValue }}</span></span>
</template>
<script lang="ts" setup>
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {cancelAnimationFrame, requestAnimationFrame} from './requestAnimationFrame.js'

defineOptions({name: 'v-count-to'})

interface EasingFn {
  (t: number, b: number, c: number, d: number): number
}

const props = withDefaults(
  defineProps<{
    startVal?: number
    endVal?: number
    duration?: number
    autoplay?: boolean
    decimals?: number
    decimal?: string
    separator?: string
    prefix?: string
    suffix?: string
    useEasing?: boolean
    easingFn?: EasingFn
  }>(),
  {
    startVal: 0,
    endVal: 2019,
    duration: 3000,
    autoplay: true,
    decimals: 0,
    decimal: '.',
    separator: ',',
    prefix: '',
    suffix: '',
    useEasing: true,
    easingFn: (t: number, b: number, c: number, d: number) => c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b
  }
)

const emit = defineEmits<{
  (e: 'mountedCallback'): void
  (e: 'callback'): void
}>()

const localStartVal = ref(props.startVal)
const displayValue = ref(formatNumber(props.startVal))
const printVal = ref<number | null>(null)
const paused = ref(false)
const localDuration = ref(props.duration)
const startTime = ref<number | null>(null)
const timestamp = ref<number | null>(null)
const remaining = ref<number | null>(null)
const rAF = ref<number | null>(null)

const countDown = computed(() => props.startVal > props.endVal)

watch(() => props.startVal, () => {
  if (props.autoplay) {
    start()
  }
})
watch(() => props.endVal, () => {
  if (props.autoplay) {
    start()
  }
})

function start() {
  localStartVal.value = props.startVal
  startTime.value = null
  localDuration.value = props.duration
  paused.value = false
  rAF.value = requestAnimationFrame(count)
}

function pauseResume() {
  if (paused.value) {
    resume()
    paused.value = false
  } else {
    pause()
    paused.value = true
  }
}

function pause() {
  if (rAF.value !== null) cancelAnimationFrame(rAF.value)
}

function resume() {
  startTime.value = null
  localDuration.value = +remaining.value!
  localStartVal.value = +printVal.value!
  requestAnimationFrame(count)
}

function reset() {
  startTime.value = null
  if (rAF.value !== null) cancelAnimationFrame(rAF.value)
  displayValue.value = formatNumber(props.startVal)
}

function count(timestampParam: number) {
  if (!startTime.value) startTime.value = timestampParam
  timestamp.value = timestampParam
  const progress = timestamp.value - startTime.value!
  remaining.value = localDuration.value - progress

  if (props.useEasing) {
    if (countDown.value) {
      printVal.value = localStartVal.value - props.easingFn(progress, 0, localStartVal.value - props.endVal, localDuration.value)
    } else {
      printVal.value = props.easingFn(progress, localStartVal.value, props.endVal - localStartVal.value, localDuration.value)
    }
  } else {
    if (countDown.value) {
      printVal.value = localStartVal.value - (localStartVal.value - props.endVal) * (progress / localDuration.value)
    } else {
      printVal.value = localStartVal.value + (props.endVal - localStartVal.value) * (progress / localDuration.value)
    }
  }
  if (countDown.value) {
    printVal.value = printVal.value < props.endVal ? props.endVal : printVal.value
  } else {
    printVal.value = printVal.value > props.endVal ? props.endVal : printVal.value
  }

  displayValue.value = formatNumber(printVal.value)
  if (progress < localDuration.value) {
    rAF.value = requestAnimationFrame(count)
  } else {
    emit('callback')
  }
}

function isNumber(val: any) {
  return !isNaN(parseFloat(val))
}

function formatNumber(num: number) {
  let n = num.toFixed(props.decimals)
  n += ''
  const x = n.split('.')
  let x1 = x[0]
  const x2 = x.length > 1 ? props.decimal + x[1] : ''
  const rgx = /(\d+)(\d{3})/
  if (props.separator && !isNumber(props.separator)) {
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + props.separator + '$2')
    }
  }
  return x1 + x2 + props.suffix
}

onMounted(() => {
  if (props.autoplay) {
    start()
  }
  emit('mountedCallback')
})

onBeforeUnmount(() => {
  if (rAF.value !== null) cancelAnimationFrame(rAF.value)
})
</script>
<style lang="less" scoped>
.count-to {
  font-family: DINPro-Medium;

  .prefix {
    font-size: .5em
  }
}
</style>

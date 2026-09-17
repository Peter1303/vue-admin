<template>
  <span :class="{numerical: !isCapital}" class="md-amount ">
    <!-- 其他 -->
    <template v-if="!isCapital">
      <span v-if="prefix" :style="{fontSize:prefixSize+'em'}">{{ prefix }}</span>
      <span class="number">{{ normalText }}</span>
      <span v-if="suffix" :style="{fontSize:suffixSize+'em'}">{{ suffix }}</span>
    </template>
    <!-- 大写 -->
    <template v-else>{{ capitalText }}</template>
  </span>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue'
import utils from '@/common/utils'

import numberCapital from './number-capital'

const {inBrowser, Animate, formatValueByGapStep} = utils

defineOptions({name: 'v-amount'})

const props = withDefaults(
  defineProps<{
    value?: number
    precision?: number
    isRoundUp?: boolean
    hasSeparator?: boolean
    separator?: string
    isAnimated?: boolean
    transition?: boolean
    isCapital?: boolean
    duration?: number
    prefix?: string
    prefixSize?: number
    suffix?: string
    suffixSize?: number
  }>(),
  {
    value: 0,
    precision: 2,
    isRoundUp: true,
    hasSeparator: true,
    separator: '',
    isAnimated: false,
    transition: false,
    isCapital: false,
    duration: 1000,
    prefix: '',
    prefixSize: 1,
    suffix: '',
    suffixSize: 1
  }
)

const formatValue = ref(props.value)
const isMounted = ref(false)

const legalPrecision = computed(() => (props.precision > 0 ? props.precision : 0))

function doPrecision(value: number, precision: number, isRoundUp: boolean) {
  const exponentialForm = Number(`${value}e${precision}`)
  const rounded = isRoundUp ? Math.round(exponentialForm) : Math.floor(exponentialForm)
  return Number(`${rounded}e-${precision}`).toFixed(precision)
}

function doFormat(value: string, hasSeparator: boolean, separator: string) {
  if (!hasSeparator) {
    return value
  }
  const numberParts = value.split('.')
  const integerValue = numberParts[0]
  const decimalValue = numberParts[1] || ''
  const formateValue = formatValueByGapStep(3, integerValue, separator, 'right', 0, 1)
  return decimalValue ? `${formateValue.value}.${decimalValue}` : `${formateValue.value}`
}

function doCapital(value: string) {
  return numberCapital(value)
}

const normalText = computed(() =>
  doFormat(doPrecision(formatValue.value, legalPrecision.value, props.isRoundUp), props.hasSeparator, props.separator)
)
const capitalText = computed(() => doCapital(doPrecision(formatValue.value, 4, props.isRoundUp)))

watch(
  () => props.value,
  (val, oldVal) => {
    /* istanbul ignore if  */
    if (!inBrowser && !isMounted.value) {
      formatValue.value = val
      return
    }
    if (props.isAnimated || props.transition) {
      doAnimateDisplay(oldVal ?? 0, val)
    } else {
      formatValue.value = val
    }
  },
  {immediate: true}
)

function doAnimateDisplay(fromValue = 0, toValue = 0) {
  /* istanbul ignore next  */
  const step = (percent: number) => {
    if (percent === 1) {
      formatValue.value = toValue
      return
    }
    formatValue.value = fromValue + (toValue - fromValue) * percent
  }

  /* istanbul ignore next  */
  const verify = (id: any) => id
  Animate.start(step, verify, () => {
  }, props.duration)
}

onMounted(() => {
  isMounted.value = true
})
</script>

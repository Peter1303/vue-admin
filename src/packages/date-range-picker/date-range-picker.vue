<template>
  <div>
    <span @mouseenter="handleHover">
      <slot/>
    </span>
    <a-range-picker
      ref="v-date-range-picker"
      :getPopupContainer="(e: HTMLElement) => e.parentNode as HTMLElement"
      :open="open"
      class="v-date-range-picker"
      close
      @change="onChange"
    >
      <template #renderExtraFooter>
        <slot name="footer">
          <a-button-group size="small">
            <a-button
              v-for="(time,k) in options"
              :key="k"
              type="primary"
              @click="handleTimeLink(time)"
            >{{ time.label }}
            </a-button>
            <a-button @click="colseTime">清空</a-button>
          </a-button-group>
        </slot>
      </template>
    </a-range-picker>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import utils from '@utils'

defineOptions({name: 'v-date-range-picker'})

const open = ref(false)
const options = ref([
  {label: '今日', value: 'day'},
  {label: '本周', value: 'week'},
  {label: '本月', value: 'month'},
  {label: '上月', value: 'prevMonth'},
  {label: '本年', value: 'year'}
])

const emit = defineEmits<{ (e: 'change', val: any): void }>()

function onChange(date: any, dateString: any) {
  open.value = false
  dateString = [`${dateString[0]} 00:00:00`, `${dateString[1]} 23:59:59`]
  emit('change', dateString)
}

function handleHover() {
  open.value = true
}

function colseTime() {
  open.value = false
  emit('change', [])
}

function handleTimeLink(item: any) {
  open.value = false
  const dateString = utils.timeRange(item.value)
  emit('change', dateString)
}
</script>

<style lang="less">
.v-date-range-picker {
  // display: none;
  .ant-calendar-picker-input {
    width: 0;
    height: 0;
    padding: 0;
    margin: 0;
    overflow: hidden;
    opacity: 0;
  }
}
</style>

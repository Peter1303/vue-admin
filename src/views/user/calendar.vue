<template>
  <a-card :body-style="{ padding: 0 }">
    <a-switch
      v-model:checked="lunarInfoShow"
      :loading="loading"
      checked-children="农历开"
      un-checked-children="农历关"
    />
    <a-calendar>
      <!--
        antdv 4 的作用域插槽参数形状变了：SlotProps 是 `{ current }`，
        而 v1 里作用域插槽拿到的那个 value 就是 current（Dayjs）。
        这里用解构重命名保留原变量名，模板内部不用改。
      -->
      <template #dateCellRender="{ current: value }">
        <ul class="events">
          <format-date-to-zh v-if="lunarInfoShow" :date="value"/>
          <a-popover title="事件详情">
            <template #content>
              <li v-for="item in getListData(value)" :key="item.content">
                <a-badge :status="item.type" :text="item.content"/>
              </li>
            </template>
            <template v-if="getListData(value).length <= 2">
              <li v-for="item in getListData(value).slice(0, 2)" :key="item.content">
                <a-badge :status="item.type" :text="item.content"/>
              </li>
            </template>
            <template v-else>
              <li v-for="item in getListData(value).slice(0, 1)" :key="item.content">
                <a-badge :status="item.type" :text="item.content"/>
              </li>
              <a-badge
                v-if="getListData(value).length && getListData(value).length > 2"
                :count="`${getListData(value).length - 1} 个更多事件`"
                :number-style="{ backgroundColor: '#52c41a' }"
              />
            </template>
          </a-popover>
        </ul>
      </template>
      <template #monthCellRender="{ current: value }">
        <div v-if="getMonthData(value)" class="notes-month">
          <section>{{ getMonthData(value) }}</section>
          <span>Backlog number</span>
        </div>
      </template>
    </a-calendar>
  </a-card>
</template>

<script lang="ts" setup>
import {onUnmounted, ref, watch} from 'vue'
import moment from 'moment'
import calendarLib from './lib/calendar'
import FormatDateToZh from './template/formatDateToZh.vue'

defineOptions({name: 'CalendarPage'})

// 原 data() 里把 moment / calendar 挂成只读实例字段（供模板扩展用，当前模板未直接引用）。
// 保留以维持原状；lib/calendar.js 是内置的农历转换库（第三方 vendored，保持 .js 不动）。
const momentRef = Object.freeze(moment)
const calendar = Object.freeze(calendarLib)
void momentRef
void calendar

const lunarInfoShow = ref(false)
const loading = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

// 原 watch.lunarInfoShow
watch(lunarInfoShow, (val) => {
  if (val) {
    loading.value = true
    timer = setTimeout(() => {
      loading.value = false
    }, 2000)
  }
})

interface EventItem {
  type: 'warning' | 'success' | 'error'
  content: string
}

// value 是 antdv4 日历传进来的 Dayjs（原代码直接当 moment 用，接口一致）
function getListData(value: { date: () => number }): EventItem[] {
  let listData: EventItem[] | undefined
  switch (value.date()) {
    case 8:
      listData = [
        {type: 'warning', content: 'This is warning event.'},
        {type: 'success', content: 'This is usual event.'}
      ]
      break
    case 10:
      listData = [
        {type: 'warning', content: 'This is warning event.'},
        {type: 'success', content: 'This is usual event.'},
        {type: 'error', content: 'This is error event.'}
      ]
      break
    case 15:
      listData = [
        {type: 'warning', content: 'This is warning event'},
        {type: 'success', content: 'This is very long usual event。。....'},
        {type: 'error', content: 'This is error event 1.'},
        {type: 'error', content: 'This is error event 2.'},
        {type: 'error', content: 'This is error event 3.'},
        {type: 'error', content: 'This is error event 4.'}
      ]
      break
    default:
  }
  return listData || []
}

function getMonthData(value: { month: () => number }): number | undefined {
  if (value.month() === 8) {
    return 1394
  }
  return undefined
}

// 原 destroyed() { clearTimeout(this.timer) }
onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style scoped>
.events {
  list-style: none;
  margin: 0;
  padding: 0;
}

.events .ant-badge-status {
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  text-overflow: ellipsis;
  font-size: 12px;
}

.notes-month {
  text-align: center;
  font-size: 28px;
}

.notes-month section {
  font-size: 28px;
}
</style>

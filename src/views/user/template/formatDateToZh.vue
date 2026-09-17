<template>
  <div class="format-cn">
    {{ chinaDate.gzDay }}
    {{ chinaDate.IDayCn }}
    <a-tag v-if="chinaDate.lunarValue" color="purple" style="display: inline-block">
      {{ chinaDate.lunarValue }}
    </a-tag>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'
import moment from 'moment'
import calendar from '../lib/calendar'

defineOptions({name: 'FormatDateToZh'})

const props = withDefaults(
  defineProps<{
    /**
     * antdv4 的 a-calendar 会把 current（Dayjs）传进来；
     * moment 在本项目已别名到 dayjs 兼容层，两者可互换使用。
     * 原代码声明的是 `Object`，这里收宽成 moment 能吃进去的类型。
     */
    date?: unknown
  }>(),
  {date: undefined}
)

const festival = Object.freeze({
  lunar: {
    '01-01': '春节',
    '01-15': '元宵节',
    '02-02': '龙头节',
    '05-05': '端午节',
    '07-07': '七夕节',
    '07-15': '中元节',
    '08-15': '中秋节',
    '09-09': '重阳节',
    '10-01': '寒衣节',
    '10-15': '下元节',
    '12-08': '腊八节',
    '12-23': '祭灶节'
  } as Record<string, string>,
  gregorian: {
    '01-01': '元旦',
    '02-14': '情人节',
    '03-08': '妇女节',
    '03-12': '植树节',
    '04-05': '清明节',
    '05-01': '劳动节',
    '05-04': '青年节',
    '06-01': '儿童节',
    '07-01': '建党节',
    '08-01': '建军节',
    '09-10': '教师节',
    '10-01': '国庆节',
    '12-24': '平安夜',
    '12-25': '圣诞节'
  } as Record<string, string>
})

interface LunarInfo {
  lMonth: number | string
  lDay: number | string
  gzDay: string
  IDayCn: string
}

function addZero(val: number | string): string {
  return val.toString().length > 2 ? `${val}` : `0${val}`
}

const chinaDate = computed(() => {
  const dateArr = moment(props.date as string | number | Date)
    .format('YYYY-MM-DD')
    .split('-')
  // calendar.solar2lunar 的形参按库的 JSDoc 是数字（年份/月份/日）。
  // 原先传的是 split('-') 出来的字符串，靠 JS 隐式转换才成立；这里显式 Number()，
  // 转换结果与原来一致（m / d 下面还要按字符串拼 key，故保留原字符串变量）。
  const lunarInfo = calendar.solar2lunar(
    Number(dateArr[0]),
    Number(dateArr[1]),
    Number(dateArr[2])
  ) as unknown as LunarInfo
  const m = dateArr[1]
  const d = dateArr[2]

  let lunarValue: string | null
  const lunarKey = `${addZero(lunarInfo.lMonth)}-${addZero(lunarInfo.lDay)}`
  if (festival.lunar[lunarKey] !== undefined) {
    lunarValue = festival.lunar[lunarKey]
  } else if (festival.gregorian[`${m}-${d}`] !== undefined) {
    lunarValue = festival.gregorian[`${m}-${d}`]
  } else {
    lunarValue = null
  }
  return {...lunarInfo, lunarValue}
})
</script>

<style lang="less" scoped>
.format-cn {
  text-align: right;
  font-size: 10px;
}
</style>

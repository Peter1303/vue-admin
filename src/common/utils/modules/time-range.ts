import moment from 'moment'

/**
 * 返回时间范围
 *
 * 参数值 day 返回今日的时间范围
 * 参数值 week 返回本周的时间范围
 * 参数值 month 返回本月的时间范围
 * 参数值 prevMonth 返回上月的时间范围
 * 参数值 year 返回本年度的时间范围
 *
 * 注：原实现注释里还提到 season / prevSeason，但代码从未实现，
 * 传入时返回 [undefined, undefined]，此处保持原有行为不做扩展。
 */
export type TimeRangeType = 'day' | 'week' | 'month' | 'prevMonth' | 'year'

export function timeRange(timeType: TimeRangeType | string): [string?, string?] {
  let startTime: string | undefined
  let endTime: string | undefined

  switch (timeType) {
    case 'day':
      startTime = moment().startOf('day').format('YYYY-MM-DD') + ' 00:00:00'
      endTime = moment().format('YYYY-MM-DD') + ' 23:59:59'
      break
    case 'week':
      startTime = moment().startOf('week').format('YYYY-MM-DD') + ' 00:00:00'
      endTime = moment().format('YYYY-MM-DD') + ' 23:59:59'
      break
    case 'month':
      startTime = moment().startOf('month').format('YYYY-MM-DD') + ' 00:00:00'
      endTime = moment().format('YYYY-MM-DD') + ' 23:59:59'
      break
    case 'prevMonth':
      startTime = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD') + ' 00:00:00'
      endTime = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD') + ' 23:59:59'
      break
    case 'year':
      startTime = moment().startOf('year').format('YYYY-MM-DD') + ' 00:00:00'
      endTime = moment().format('YYYY-MM-DD') + ' 23:59:59'
      break
    default:
      break
  }

  return [startTime, endTime]
}

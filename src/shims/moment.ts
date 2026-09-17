/**
 * moment → dayjs 兼容层
 * ------------------------------------------------------------
 * 通过 vite.config.mts / tsconfig.json 的 `moment` 别名指向本文件，
 * 因此所有 `import moment from 'moment'` 的调用点无需修改。
 *
 * 额外收益：antdv 4 的 DatePicker 只接受 dayjs 对象，
 * 而底层就是 dayjs，所以表单里的默认值可以直接互相传递。
 */
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isBetween from 'dayjs/plugin/isBetween'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekday from 'dayjs/plugin/weekday'
import isoWeek from 'dayjs/plugin/isoWeek'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.extend(isBetween)
dayjs.extend(quarterOfYear)
dayjs.extend(weekOfYear)
dayjs.extend(weekday)
dayjs.extend(isoWeek)
dayjs.extend(duration)
dayjs.extend(utc)

// 等价于原来的 moment.locale('zh-cn')
// 注意：dayjs 的 zh-cn locale 自带 weekStart: 1，因此 startOf('week') 与 moment 一致（周一）
dayjs.locale('zh-cn')

export const moment = dayjs
export default dayjs

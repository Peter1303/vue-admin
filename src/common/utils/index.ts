/**
 * 一个文件一个函数
 * ------------------------------------------------------------
 * 原实现用 webpack 的 `require.context('./modules/', true, /\.js$/)` 扫描合并，
 * Vite 下对应 `import.meta.glob(..., { eager: true })`。
 * 为了类型可读性，这里改为静态 import（副作用更明确，也便于 tree-shaking）。
 */
import * as animate from './modules/animate'
import * as auth from './modules/auth'
import * as env from './modules/env'
import * as event from './modules/event'
import * as formateValue from './modules/formate-value'
import * as instanceOf from './modules/instanceof'
import * as pxtorem from './modules/pxtorem'
import * as timeRange from './modules/time-range'

export * from './modules/animate'
export * from './modules/auth'
export * from './modules/env'
export * from './modules/event'
export * from './modules/formate-value'
export * from './modules/instanceof'
export * from './modules/pxtorem'
export * from './modules/time-range'

/** 聚合对象：兼容历史上的 `import utils from '@/common/utils'` 写法 */
const utils = {
  ...animate,
  ...auth,
  ...env,
  ...event,
  ...formateValue,
  ...instanceOf,
  ...pxtorem,
  ...timeRange
}

export default utils

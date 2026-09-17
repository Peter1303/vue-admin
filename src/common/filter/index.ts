import moment from 'moment'

/**
 * 全局格式化函数
 * ------------------------------------------------------------
 * Vue 3 移除了过滤器（filters），原来的 `Vue.filter(key, fn)` + 模板里的
 * `{{ x | currency }}` 不再可用（`|` 会被解析成按位或）。
 * 这里保留同名函数，并在 main.ts 挂到 `app.config.globalProperties.$fmt`，
 * 模板里改写为 `{{ $fmt.currency(x) }}`。
 */

/**
 * 隐藏姓名 / 手机号 / 身份证 / 银行卡 等中间字符信息
 */
export function star(value: string | number): string {
  const str = String(value)
  if (str.length > 0 && str.length < 3) {
    return '*' + str.substring(1)
  } else if (str.length > 5 && str.length < 12) {
    return str.substr(0, 3) + '****' + str.substr(-4)
  } else if (str.length > 14) {
    return str.substr(0, 4) + '***********' + str.substr(-4)
  } else {
    return str
  }
}

/** 格式货币 */
const digitsRE = /(\d{3})(?=\d)/g

export function currency(
  input: string | number,
  currencySymbol?: string,
  decimals?: number,
  separator = ''
): string {
  const value = parseFloat(String(input))
  if (!isFinite(value) || (!value && value !== 0)) return ''
  const symbol = currencySymbol != null ? currencySymbol : '￥'
  const fixed = decimals != null ? decimals : 2
  const stringified = Math.abs(value).toFixed(fixed)
  const _int = fixed ? stringified.slice(0, -1 - fixed) : stringified
  const i = _int.length % 3
  const head = i > 0 ? _int.slice(0, i) + (_int.length > 3 ? separator : '') : ''
  const _float = fixed ? stringified.slice(-1 - fixed) : ''
  const sign = value < 0 ? '-' : ''
  return sign + symbol + head + _int.slice(i).replace(digitsRE, '$1,') + _float
}

/** 格式化时间 */
export function timeFormat(time: string | number | Date, format?: string): string {
  if (!time) return ''
  return moment(time).format(format != null ? format : 'YYYY-MM-DD HH:mm:ss')
}

/**
 * 格式化显示手机号 159 9999 9999
 * show 为 true 时隐藏中间四位
 */
export function telFormat(tel: string, show?: boolean): string {
  if (!tel) return ''
  const startTel = tel.slice(0, 3)
  const midTel = show ? '****' : tel.slice(3, 7)
  const endTel = tel.slice(7, 11)
  return `${startTel} ${midTel} ${endTel}`
}

/** 格式化时间 -> 转化为天数 */
export function timeFormatToDays(time: string | number | Date): string | number {
  if (!time) return ''
  return moment(time).diff(moment(), 'days') + 1
}

/** 车牌格式化：鄂A88888 -> 鄂A 88888 */
export function carIdFormat(val: string): string {
  if (!val) return ''
  const pre = val.slice(0, 2)
  const end = val.slice(2)
  return `${pre} ${end}`
}

/** 结算方式 */
export function chargeType(val: string | number): string | undefined {
  if (!val && val !== 0) return ''
  switch (String(val)) {
    case '0':
      return '其他'
    case '1':
      return '现金'
    case '2':
      return '银行/卡'
    case '3':
      return '支付宝'
    case '4':
      return '微信'
    case '5':
      return '储值账户'
    case '6':
      return '折扣卡'
    case '7':
      return '次卡'
    case '8':
      return '线上收款'
    default:
      return undefined
  }
}

/** 业务类型 */
export function serviceTypeFormat(val: string | number): string | undefined {
  let serviceType: string | undefined = '--'
  if (!val && val !== 0) return undefined
  switch (String(val)) {
    case '0':
      serviceType = '收款单'
      break
    case '1':
      serviceType = '付款单'
      break
    case '2':
      serviceType = '记一笔'
      break
    case '3':
      serviceType = '库存盘点'
      break
    case '4':
      serviceType = '账户期初'
      break
    case '5':
      serviceType = '出入库'
      break
    case '6':
      serviceType = '销售订单'
      break
    case '7':
      serviceType = '充值'
      break
    case '8':
      serviceType = '办卡'
      break
    case '9':
      serviceType = '直接收银'
      break
    case '12':
      serviceType = '提现服务费'
      break
    default:
      break
  }
  return serviceType
}

/** 客户来源 / 办理类型 */
export function srcType(val: string | number): string | undefined {
  if (!val && val !== 0) return undefined
  switch (String(val)) {
    case '1':
      return '主动新增'
    case '2':
      return '开单新增'
    case '3':
      return '充卡新增'
    case '4':
      return '收银新增'
    case '5':
      return '领券新增'
    default:
      return undefined
  }
}

/** 会员卡消费记录来源业务类型 */
export function srcBusType(val: string): string | undefined {
  if (!val) return undefined
  switch (val) {
    case 'A1':
      return '充值活动'
    case 'A2':
      return '直接充值'
    case 'A3':
      return '批量导入'
    case 'A4':
      return '充值活动赠送'
    case 'D1':
      return '销售订单'
    default:
      return undefined
  }
}

/** 聚合对象，便于一次性挂到 globalProperties.$fmt */
export const filters = {
  star,
  currency,
  timeFormat,
  telFormat,
  timeFormatToDays,
  carIdFormat,
  chargeType,
  serviceTypeFormat,
  srcType,
  srcBusType
}

export default filters

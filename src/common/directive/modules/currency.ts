import {currency} from '@/common/filter'
import {isObject} from '@/common/utils'
import type {Directive, DirectiveBinding} from 'vue'

/**
 * 格式化金额 展示小羊角
 * 参数 v-currency="1000" 或 v-currency="{value:1000,decimals:0}"
 * 需要设置位数的时候用对象格式
 *
 * v-currency="{value:1000,decimals:0}" -> ￥1,000
 * v-currency="{value:1000,decimals:2}" -> ￥1,000.00
 * v-currency:w="{value:10000,decimals:2}" -> ￥1.00万
 */
interface CurrencyValue {
  value?: number | string
  decimals?: number
  unit?: string
  style?: boolean
  pre?: string
  zoom?: number
  separator?: string
}

function format(el: HTMLElement, binding: DirectiveBinding): void {
  const w = binding.arg === 'w'
  let formatMoney = ''

  let value: number | string = 0
  let pre = '￥'
  let unit = '元'
  let decimals = 2
  let style = true
  let zoom = 0.5
  let separator = ','

  if (isObject(binding.value)) {
    const v = binding.value as CurrencyValue
    decimals = v.decimals !== undefined ? v.decimals : 2
    value = v.value || 0
    unit = v.unit || ''
    style = v.style !== undefined ? v.style : true
    pre = v.pre !== undefined ? v.pre : '￥'
    zoom = v.zoom || 0.5
    separator = v.separator !== undefined ? v.separator : ','
  } else {
    value = binding.value || 0
  }

  const myStyle = style ? `font-size:${zoom}em` : ''

  if (w) {
    const numeric = Number(value)
    let len = parseInt(String(numeric)).toString().length
    // 负数减去 '-' 的长度
    if (numeric < 0) {
      len = len - 1
    }
    if (len > 10) {
      value = numeric / 1000000000
      formatMoney = currency(value as number, '', decimals, separator)
      el.innerHTML = `<span style="font-family:DINPro-Medium"><span style=${myStyle}>${pre}</span>${formatMoney}<span style=${myStyle}>亿${unit}</span></span>`
    } else if (len > 4) {
      value = numeric / 10000
      formatMoney = currency(value as number, '', decimals, separator)
      el.innerHTML = `<span style="font-family:DINPro-Medium"><span style=${myStyle}>${pre}</span>${formatMoney}<span style=${myStyle}>万${unit}</span></span>`
    } else {
      formatMoney = currency(value as number, '', decimals, separator)
      el.innerHTML = `<span style="font-family:DINPro-Medium"><span style=${myStyle}>${pre}</span>${formatMoney}<span style=${myStyle}>${unit}</span></span>`
    }
  } else {
    formatMoney = currency(value as number, '', decimals, separator)
    el.innerHTML = `<span style="font-family:DINPro-Medium"><span style=${myStyle}>${pre}</span>${formatMoney}<span style=${myStyle}>${unit}</span></span>`
  }
}

export default {
  // Vue 2 的 bind → Vue 3 的 mounted
  mounted: format,
  // Vue 2 的 update（每次重渲染都触发）→ Vue 3 的 updated
  updated: format
} as Directive<HTMLElement>

/**
 * 格式化工具（原样移植 + 补类型）
 * 被 packages/amount/Amount.vue、packages/licence-plate 等使用
 */

export interface GapResult {
  value: string
  range: number | undefined
}

export function formatValueByGapRule(
  gapRule: string,
  value: string | null | undefined,
  gap = ' ',
  range?: number,
  isAdd = 1
): GapResult {
  const arr = value ? value.split('') : []
  let showValue = ''
  const rule: number[] = []
  gapRule.split('|').some((n, j) => {
    rule[j] = +n + (rule[j - 1] ? +rule[j - 1] : 0)
  })
  let j = 0
  arr.some((n, i) => {
    if (i > rule[rule.length - 1] - 1) {
      return true
    }
    if (i > 0 && i === rule[j]) {
      showValue = showValue + gap + n
      j++
    } else {
      showValue = showValue + '' + n
    }
    return false
  })
  let adapt = 0
  rule.some((n, idx) => {
    if (range === +n + 1 + idx) {
      adapt = isAdd
    }
    return false
  })
  const resultRange =
    typeof range !== 'undefined' ? (range === 0 ? 0 : range + adapt) : showValue.length
  return {value: showValue, range: resultRange}
}

export function formatValueByGapStep(
  step: number,
  value: string,
  gap = ' ',
  direction: 'left' | 'right' = 'right',
  range?: number,
  isAdd = 1,
  oldValue = ''
): GapResult {
  if (value.length === 0) {
    return {value, range}
  }

  const arr = value.split('')
  let _range = range
  let showValue = ''

  if (direction === 'right') {
    for (let j = arr.length - 1, k = 0; j >= 0; j--, k++) {
      const m = arr[j]
      showValue = k > 0 && k % step === 0 ? m + gap + showValue : m + '' + showValue
    }
    if (isAdd === 1) {
      // 添加时多了一个间隔符，需要调整 range
      if (oldValue.length - showValue.length === -2) {
        _range = (range ?? 0) + 1
      }
    } else {
      if (oldValue.length - showValue.length === 2) {
        _range = (range ?? 0) - 1
      }
      if ((_range ?? 0) <= 0) {
        _range = 0
      }
    }
  } else {
    arr.some((n, i) => {
      showValue = i > 0 && i % step === 0 ? showValue + gap + n : showValue + '' + n
      return false
    })
    const adapt = (range ?? 0) % (step + 1) === 0 ? isAdd : 0
    _range = typeof range !== 'undefined' ? (range === 0 ? 0 : range + adapt) : showValue.length
  }

  return {value: showValue, range: _range}
}

export function trimValue(value: string | undefined, gap = ' '): string {
  const v = typeof value === 'undefined' ? '' : value
  const reg = new RegExp(gap, 'g')
  return v.toString().replace(reg, '')
}

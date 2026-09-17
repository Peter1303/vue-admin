/** 动态的将 px 转换成 rem 单位 */
export function pxtorem(val: string | number): string {
  return parseFloat(String(val)) / 16 + 'rem'
}

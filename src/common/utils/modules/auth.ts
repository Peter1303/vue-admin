/** 登录态存取 */

export interface TokenInfo {
  token: string
  storeid: string
}

/** 移除登录信息 */
export function removeToken(): void {
  window.localStorage.removeItem('token')
  window.localStorage.removeItem('storeid')
}

/** 设置登录信息 */
export function setToken(params: { token: string; storeid: string }): void {
  window.localStorage.setItem('token', params.token)
  window.localStorage.setItem('storeid', params.storeid)
}

/** 获取登录信息 */
export function getToken(): TokenInfo {
  const token = localStorage.getItem('token') || ''
  const storeid = localStorage.getItem('storeid') || ''
  return {token, storeid}
}

/**
 * 版本号
 * 原实现硬编码返回 ''（用于 vuex-persistedstate 的 storage key），
 * 这里改为读取构建期注入的版本号，语义不变但更可控。
 */
export function getVersion(): string {
  return typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : ''
}

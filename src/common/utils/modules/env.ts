/**
 * 运行环境探测
 * ------------------------------------------------------------
 * 原实现用 `Vue.prototype.$isServer` 判断 SSR，Vue 3 已移除该属性。
 * 本项目是纯浏览器端应用（hash 路由 + express 静态托管，无 SSR），
 * 因此直接以 window 是否存在判断。
 */

export const inBrowser = typeof window !== 'undefined'

export const isProd = import.meta.env.PROD

export const UA = inBrowser ? window.navigator.userAgent.toLowerCase() : ''

export const isAndroid = !!UA && UA.indexOf('android') > 0

export const isIOS = !!UA && /iphone|ipad|ipod|ios/.test(UA)

export const root: Window | typeof globalThis = inBrowser ? window : globalThis

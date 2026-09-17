/**
 * 请求层
 * ------------------------------------------------------------
 * 支持：断网提示、请求取消、失败重试。
 * `__noCancel` 字段可以让特殊的请求不被取消。
 * 注意：取消请求并不会真正中止已发出的 HTTP 请求，只是放弃对结果的处理。
 */
import type {AxiosError, AxiosInstance, Canceler, InternalAxiosRequestConfig} from 'axios'
import axios from 'axios'
import qs from 'qs'
import {message} from 'ant-design-vue'
import errorHandler from './error-handler'
import configs from '@config'
import type {ApiSchema} from './api'

/** axios 没有内置 retry 配置，这里扩展出用到的几个字段 */
interface RetryConfig extends InternalAxiosRequestConfig {
  retry?: number
  retryDelay?: number
  shouldRetry?: (error: AxiosError) => boolean
  __retryCount?: number
  _keyString?: string
}

type CancelHandler = (message?: string, config?: unknown) => void

/** 存储请求的映射，用于防重复提交 */
const requestMap = new Map<string, CancelHandler>()

window.addEventListener('offline', () => {
  message.warning('当前网络已断开！')
})

export default function fetch(options: ApiSchema): Promise<unknown> {
  configs.api.before_fetch?.()

  const headers = Object.assign(
    {
      'Cache-Control': 'no-cache',
      'Content-type': 'application/x-www-form-urlencoded'
    },
    configs.api.headers
  )
  const timeout = configs.api.timeout || 10000

  const instance: AxiosInstance = axios.create({
    baseURL: configs.api.url,
    headers,
    validateStatus: (status: number) => status === 200,
    responseType: 'json',
    responseEncoding: 'utf8',
    // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
    //
    // ⚠️ 这里必须自己 JSON.parse，不能像原实现那样「原样返回」。
    //    原写法在 axios 0.18（迁移前）下是成立的：0.x 的 xhr 适配器会把
    //    `responseType: 'json'` 真正写到 XMLHttpRequest 上，`request.response`
    //    已经是解析好的对象。axios 1.x 改掉了这个行为——
    //    （见 node_modules/axios/lib/adapters/xhr.js）
    //      · `if (responseType && responseType !== 'json')` → 'json' 反而**不再**
    //        写入 request.responseType，于是 responseText 是原始字符串；
    //      · `responseType === 'json' ? request.responseText : request.response`
    //        → 取的就是这个字符串，**指望着默认的 transformResponse 去解析**。
    //    而本项目把 transformResponse 整个覆盖了（axios 的 mergeConfig 对它是
    //    「替换」而非「追加」，已实测 `defaults.transformResponse.length === 1`），
    //    默认解析被丢掉 → 每个接口 resolve 出来的都是**字符串**，
    //    页面里 `res.list` / `res.data.xxx` 恒为 undefined，
    //    于是所有调接口的页面都拿不到数据（高级表格就是这个症状）。
    //    解析失败（如代理直接返回纯文本报错页）时按 axios 默认语义原样返回。
    transformResponse: [
      (data: unknown) => {
        if (!data) {
          return {status: 500}
        }
        if (typeof data === 'string') {
          try {
            return JSON.parse(data)
          } catch {
            return data
          }
        }
        return data
      }
    ],
    timeout,
    withCredentials: false
  })

  // 重试相关默认值（原来是直接挂在 axios.defaults 上的全局字段）
  // axios 的 AxiosDefaults.headers 与自定义 RetryConfig 结构不重叠，需经 unknown 中转
  const defaults = instance.defaults as unknown as RetryConfig
  defaults.retry = configs.api.retry
  defaults.retryDelay = configs.api.retryDelay
  defaults.shouldRetry = configs.api.shouldRetry

  /**
   * 请求前拦截
   */
  instance.interceptors.request.use(
    (config) => {
      const retryConfig = config as RetryConfig
      // 防重复提交（以最后也就是最新的一次请求为准）
      const keyString = qs.stringify({url: config.url})

      if (requestMap.has(keyString)) {
        requestMap.get(keyString)?.('请求重复', config)
        // 取消后不用删记录：Map 相同 key 会覆盖；就算前一次已完成，再取消也无副作用
      }

      // 注意：axios 类型里 `CancelToken` 只是 interface，类值挂在 axios.CancelToken 上
      config.cancelToken = new axios.CancelToken((cancel: Canceler) => {
        // 有 __noCancel 属性的请求不取消
        const body = config.data as Record<string, unknown> | undefined
        if (!body || !body.__noCancel) {
          requestMap.set(keyString, cancel as unknown as CancelHandler)
        }
      })

      Object.assign(config, {_keyString: keyString})

      const cusConfig = configs.api.set_config(config)
      return {...config, ...cusConfig} as InternalAxiosRequestConfig
    },
    (error) => Promise.reject(error)
  )

  /**
   * 请求响应拦截
   */
  instance.interceptors.response.use(
    (response) => {
      if (response.status === 200) {
        return Promise.resolve(response)
      }
      return Promise.reject(response)
    },
    (error: AxiosError) => {
      const config = error.config as RetryConfig | undefined

      if (!config || !config.retry) {
        errorHandler(error)
        return Promise.reject(error)
      }

      if (!config.shouldRetry || typeof config.shouldRetry !== 'function') {
        errorHandler(error)
        return Promise.reject(error)
      }

      if (!config.shouldRetry(error)) {
        errorHandler(error)
        return Promise.reject(error)
      }

      config.__retryCount = config.__retryCount || 0

      if (config.__retryCount >= config.retry) {
        errorHandler(error)
        return Promise.reject(error)
      }

      config.__retryCount += 1

      const backoff = new Promise<void>((resolve) => {
        setTimeout(resolve, config.retryDelay || 1)
      })

      // 重新发起请求
      return backoff
        .then(() => axios(config as InternalAxiosRequestConfig))
        .catch((e: AxiosError) => {
          errorHandler(e)
          // 原实现这里没有 return，重试链路失败后 resolve 成 undefined，
          // 会把「失败」伪装成「成功拿到 undefined」，故显式抛出
          throw e
        })
    }
  )

  return new Promise((resolve, reject) => {
    instance(options as unknown as InternalAxiosRequestConfig)
      .then((res) => {
        resolve(res.data)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

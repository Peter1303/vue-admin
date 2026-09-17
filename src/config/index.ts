import qs from 'qs'
import {message} from 'ant-design-vue'
import type {AxiosError, InternalAxiosRequestConfig} from 'axios'
import type {
  NavigationGuardReturn,
  RouteLocationNormalized,
  RouteLocationNormalizedLoaded
} from 'vue-router'
import router from '@router'
import utils from '@utils'

/**
 * 业务模式：现在**只用于控制台提示**，不再参与任何推导。
 * 值来自各模式的 `.env.<mode>`（dev / test / production / release）。
 *
 * 它和下面的 `VITE_APP_BASE_URL` 一样都是 **Vite 的编译期常量**：
 * `import.meta.env.X` 在构建时会被原地替换成字面量（dev 下的转换产物同样如此），
 * 所以运行时不存在任何环境变量读取，也没有分支需要执行。
 *
 * 原先这里是一段 `switch (MODE)` 推导 BASE_URL 的运行时逻辑，四个分支的值还完全相同
 * （都是 'api/'）；现在 BASE_URL 由各环境自己的 `.env.<mode>` 定义 —— 换环境的接口地址
 * 只需改对应的 env 文件，代码不用动。
 */
const MODE = import.meta.env.VITE_APP_MODE

console.log(
  `%c当前的模式是 ${MODE}`,
  'font-size:14px;color:#fff;background:red;padding:4px;font-family:Artiely;letter-spacing:2px'
)

export interface Configs {
  api: {
    retry: number
    retryDelay: number
    shouldRetry: (error: AxiosError) => boolean
    url: string
    timeout: number
    /** 附加请求头 */
    headers: Record<string, string>
    /** 自定义配置（例如修改请求头、序列化 body） */
    set_config: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig
    /** 请求错误自定义处理（如登录失效跳转） */
    error_handler?: (error: AxiosError) => void
    /** 请求之前的处理（如判断当前是否有网络等） */
    before_fetch?: () => void
  }
  router_auth: boolean
  /**
   * 路由鉴权钩子
   * ------------------------------------------------------------
   * 返回值语义（vue-router 5 的「返回值」写法）：
   *   · `true` / `undefined` / 不写 return → 放行
   *   · `false`                            → 中断本次导航
   *   · 一个 location（字符串或对象）       → 重定向到该地址
   *
   * 原实现是 `(to, from, next) => void` 的回调写法。`NavigationGuardNext`
   * 在 vue-router 5 已标记 `@deprecated`（官方原话：回调会在未来版本被移除），
   * 而且它不只是「类型过期」—— 运行时 `guardToPromiseFn` 里的
   * `withDeprecationWarning(next)` 会在**开发模式下每次导航都往控制台推一条
   * `VUE_ROUTER_R0025: The 'next()' callback in navigation guards is deprecated.`**
   * 所以这里按官方推荐改成返回式，`next()` → `return`、
   * `next(false)` → `return false`、`next('/x')` → `return '/x'`。
   *
   * `to` / `from` 的类型与 vue-router 自身的守卫签名对齐
   * （`beforeEach` 的 `from` 是 `RouteLocationNormalizedLoaded`）。
   */
  router_before_each: (
    to: RouteLocationNormalized,
    from: RouteLocationNormalizedLoaded
  ) => NavigationGuardReturn
}

export default {
  // api 请求地址的根路径
  api: {
    retry: 1, // 失败重试次数
    retryDelay: 1000, // 失败重试延时
    shouldRetry: () => true, // 失败重试条件，默认只要是错误都需要重试
    // 取自各模式的 `.env.<mode>`：VITE_APP_BASE_URL
    // 相对写法（'api/'）由 vite.config.mts 的 server.proxy 在 dev 下转发、生产下同级部署；
    // 跨域部署时可以直接写完整地址（如 'https://api.example.com/'）
    url: import.meta.env.VITE_APP_BASE_URL,
    timeout: 1000,
    // 设置请求头（原实现里这个字段叫 `header`，而 fetch 读的是 `headers`，
    // 等于整块配置从未生效；这里改名以让配置真正起作用，取值与 fetch 的默认值一致）
    headers: {
      'Cache-Control': 'no-cache',
      'Content-type': 'application/x-www-form-urlencoded'
    },
    // 自定义一些配置(包括修改请求头等)
    set_config: (config: InternalAxiosRequestConfig) => {
      config.data = qs.stringify(config.data, {
        arrayFormat: 'indices',
        allowDots: true
      })
      return config
    },
    // 请求错误自定义
    error_handler: (error: AxiosError) => {
      // 原实现直接 `error.response.data.status`，无响应体时这里会二次抛错，
      // 把真正的错误盖掉；这里做空值收敛
      const data = error.response?.data as { status?: number } | undefined
      const responseCode = data?.status
      switch (responseCode) {
        case 4:
          router.replace({
            name: 'login',
            params: {
              message: '您已在其他地方登录，或登录信息失效，请重新登录'
            }
          })
          utils.removeToken()
          break
        default:
      }
    },
    // 请求之前的处理（如判断当前是否有网络等）
    before_fetch: () => {
      if (!navigator.onLine) {
        // 原实现是箭头函数里写 `this.$message`，这里的 this 并不是组件实例，
        // 断网时会直接 TypeError 并中断整个请求流程
        message.warning('请检查当前网络！')
      }
    }
  },
  // 是否开启路由鉴权
  router_auth: true,
  router_before_each: (_to, _from) => {
    // 鉴权逻辑原实现整体被注释掉了，这里保持「直接放行」的现状
    // （原写法是 `next()`，等价于这里的 `return true`）
    return true
  }
} as Configs

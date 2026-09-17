import type {App} from 'vue'
import fetch from './fetch'

/**
 * 接口注册表
 * ------------------------------------------------------------
 * 原实现用 `require.context('@api/modules/', true, /\.js$/)` 扫描目录，
 * 把每个模块的具名导出（接口描述对象）聚合成 `api`，
 * 并包装成 `api.XXX(params)` 的可调用形式，同时挂到 Vue.prototype.$api。
 *
 * Vite 下改用 `import.meta.glob`。注意：这里用 `eager: true`，
 * 因为需要拿到「所有模块的具名导出」而不是它们的加载器。
 */

export interface ApiSchema {
  url: string
  method?: string
  /** 接口备注 */
  __remark?: string
  /** 默认参数，会与调用时传入的参数合并 */
  defaultData?: Record<string, unknown>
  data?: Record<string, unknown>

  [key: string]: unknown
}

export type ApiFunction = (params?: Record<string, unknown>) => Promise<unknown>
export type ApiMap = Record<string, ApiFunction>

const apiModules = import.meta.glob('/src/api/modules/*.ts', {eager: true}) as Record<
  string,
  Record<string, unknown>
>

function initApi(): ApiMap {
  let apiList: Record<string, ApiSchema> = {}

  Object.keys(apiModules).forEach((key) => {
    const mod = apiModules[key]
    // 具名导出的都是接口描述对象；跳过 default
    const named: Record<string, unknown> = {}
    Object.keys(mod).forEach((k) => {
      if (k !== 'default') named[k] = mod[k]
    })
    apiList = {...apiList, ...(named as Record<string, ApiSchema>)}
  })

  const obj: ApiMap = {}
  Object.keys(apiList).forEach((name) => {
    obj[name] = (params?: Record<string, unknown>) => {
      const schema = apiList[name]
      const oldData = schema.defaultData || {}
      const newParams = params || {}
      schema.data = {...oldData, ...newParams}
      return fetch(schema)
    }
  })
  return obj
}

const apiList = initApi()

/** 处理后的接口集合：api.XXX(params) */
export const api: ApiMap = {...apiList}

/** 未处理的接口源数据，暴露给 api 管理模块（views/plugin/api-test.vue 会用到） */
export let apiSource: Record<string, ApiSchema> = {}
Object.keys(apiModules).forEach((key) => {
  const mod = apiModules[key]
  const named: Record<string, unknown> = {}
  Object.keys(mod).forEach((k) => {
    if (k !== 'default') named[k] = mod[k]
  })
  apiSource = {...apiSource, ...(named as Record<string, ApiSchema>)}
})

/**
 * Vue 3 插件形态：原来通过 `Vue.prototype.$api` 注入，
 * 现在挂到 `app.config.globalProperties.$api`（选项式组件里 this.$api 依旧可用）。
 */
export const Api = {
  install(app: App): void {
    app.config.globalProperties.$api = api
  }
}

export default Api

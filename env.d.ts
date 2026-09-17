/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 业务模式（仅用于控制台提示），定义在各模式的 .env.<mode> 里 */
  readonly VITE_APP_MODE: 'dev' | 'test' | 'production' | 'release'
  /** api 根路径，定义在各模式的 .env.<mode> 里；构建期被替换成字面量 */
  readonly VITE_APP_BASE_URL: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_AMAP_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** 由 vite.config.mts 的 define 注入（编译期常量，构建时被内联成字面量） */
declare const __APP_VERSION__: string

declare module '*.md' {
  const src: string
  export default src
}

/**
 * china-city-data 不自带类型声明。它导出的是「按首字母/热门分组的城市列表」，
 * 形如 { hot: City[], A: City[], B: City[], ... }。
 * 原来只声明成 unknown，导致 packages/city-picker 里 Object.keys / 下标访问全部报错。
 */
declare module 'china-city-data' {
  interface ChinaCity {
    name: string

    [key: string]: unknown
  }

  const cityData: Record<string, ChinaCity[]>
  export default cityData
}

declare module 'nprogress' {
  interface NProgress {
    status: number | null

    start(): NProgress

    done(force?: boolean): NProgress

    configure(options: Record<string, unknown>): NProgress
  }

  const nprogress: NProgress
  export default nprogress
}

/**
 * @antv/data-set 0.10.x 不带类型声明（package.json 里没有 types 字段），
 * 不补的话 strict + noImplicitAny 下 `import { DataSet } from '@antv/data-set'`
 * 会直接报 TS7016。这里只声明项目实际用到的部分。
 */
declare module '@antv/data-set' {
  export class DataView {
    source(data: unknown): this

    transform(options: Record<string, unknown>): this

    [key: string]: unknown
  }

  export class DataSet {
    // 运行时这两个静态成员是 data-set 自己挂上去的（原代码用的就是 DataSet.DataView）
    static DataSet: typeof DataSet
    static DataView: typeof DataView

    constructor(options?: Record<string, unknown>)

    source(data: unknown): this

    transform(options: Record<string, unknown>): this

    createView(options?: Record<string, unknown>): DataView
  }

  export default DataSet
}

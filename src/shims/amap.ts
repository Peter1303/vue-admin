import AMapLoader from '@amap/amap-jsapi-loader'

/**
 * 高德地图加载器
 * ------------------------------------------------------------
 * 原实现用 vue-amap（仅 Vue 2）+ webpack 插件在构建期注入 SDK。
 * vue-amap 没有 Vue 3 版本，改用官方 @amap/amap-jsapi-loader 运行时加载。
 *
 * ⚠️ views/map/amap.vue 原来的模板用的是 element-ui 的 `<el-amap>` / `<el-amap-marker>`
 *    标签（element-ui 在本项目里只是 package.json 里的死依赖，src 零引用），
 *    Vue 3 对未知标签只当普通元素渲染 → 整块内容静默为空。
 *    该页已改为直接用下面的 createAMap() 命令式创建地图。
 */

export const AMAP_KEY: string = import.meta.env.VITE_APP_AMAP_KEY || ''

/** JSAPI 2.0 的插件名必须带 AMap. 前缀 */
export const AMAP_PLUGINS = [
  'AMap.Autocomplete',
  'AMap.PlaceSearch',
  'AMap.Scale',
  'AMap.OverView',
  'AMap.ToolBar',
  'AMap.MapType',
  'AMap.PolyEditor',
  'AMap.CircleEditor',
  'AMap.Geolocation'
]

export interface AMapMapOptions {
  /** [经度, 纬度] */
  center: [number, number]
  zoom?: number
  resizeEnable?: boolean
  mapStyle?: string
}

export interface AMapMapInstance {
  destroy(): void

  setZoomAndCenter(zoom: number, center: [number, number]): void

  setCenter(center: [number, number]): void

  add(overlay: unknown): void

  remove(overlay: unknown): void

  clearMap(): void

  on(event: string, handler: (...args: unknown[]) => void): void

  off(event: string, handler: (...args: unknown[]) => void): void
}

/** AMap JSAPI 命名空间（只声明本项目用到的部分，不引入 @types/amap-js-api） */
export interface AMapNamespace {
  Map: new (container: HTMLElement | string, options?: Record<string, unknown>) => AMapMapInstance
  Marker: new (options: Record<string, unknown>) => unknown

  [key: string]: unknown
}

/** 缓存实例，避免同一页面重复加载 SDK */
let amapPromise: Promise<AMapNamespace> | null = null

/** 加载 AMap 命名空间；失败时抛出可读错误，便于页面用 <a-alert> 兜底提示 */
export async function loadAMap(): Promise<AMapNamespace> {
  if (!AMAP_KEY) {
    throw new Error('未配置高德地图 key（VITE_APP_AMAP_KEY）')
  }
  if (!amapPromise) {
    amapPromise = (AMapLoader.load({
      key: AMAP_KEY,
      version: '2.0',
      plugins: AMAP_PLUGINS
    }) as unknown as Promise<AMapNamespace>).catch((e: unknown) => {
      // 加载失败要清掉缓存，否则后续重试会一直拿到同一个 rejected promise
      amapPromise = null
      const msg = e instanceof Error ? e.message : String(e)
      throw new Error(`${msg}（常见原因：高德后台未把当前域名加入 key 的白名单）`)
    })
  }
  return amapPromise
}

/** 在指定容器上创建地图 */
export async function createAMap(
  container: HTMLElement,
  options: AMapMapOptions
): Promise<AMapMapInstance> {
  const AMapNS = await loadAMap()
  return new AMapNS.Map(container, {
    zoom: 15,
    resizeEnable: true,
    ...options
  })
}

export default loadAMap

import type {PiniaPluginContext} from 'pinia'

/**
 * Pinia 持久化插件 —— 替代 vuex-persistedstate
 * ------------------------------------------------------------
 * 原实现（core/store.js）的语义：
 *   createPersistedState({ key: getVersion(), storage: window.sessionStorage })
 *   即「整个 store 平铺存进 sessionStorage 的某一个 key 下」。
 *
 * 这里保持同样的语义：以 store.$id 为 namespace 存入 sessionStorage，
 * 并在应用启动时回填。
 *
 * 注意：与 vuex-persistedstate 不同，本插件只持久化「值」，不持久化 getter/action，
 * 且会跳过显式标记 `persist: false` 的 store。
 */
export interface PersistOptions {
  /** 存储介质，默认 sessionStorage（与原实现一致） */
  storage?: Storage
  /** key 前缀，默认 '' */
  key?: string
  /** 需要持久化的字段白名单；不传则全量 */
  paths?: string[]
  /** 设为 false 可关闭该 store 的持久化 */
  persist?: boolean
}

/** 全局配置，由 main.ts 在注册插件前设置 */
export const persistConfig: Required<Pick<PersistOptions, 'storage' | 'key'>> = {
  storage: window.sessionStorage,
  key: ''
}

export function configurePersist(options: Partial<PersistOptions>): void {
  if (options.storage) persistConfig.storage = options.storage
  if (options.key !== undefined) persistConfig.key = options.key
}

const storageKey = (id: string, prefix: string) => `${prefix}${id}`

export function createPersistedStatePlugin(options: PersistOptions = {}) {
  return ({store, options: storeOptions}: PiniaPluginContext): void => {
    // 允许单个 store 通过 defineStore(id, setup, { persist: false }) 关闭持久化
    const storePersist = (storeOptions as { persist?: boolean | PersistOptions }).persist
    if (storePersist === false) return

    const merged: PersistOptions = {
      storage: persistConfig.storage,
      key: persistConfig.key,
      ...(typeof storePersist === 'object' ? storePersist : {}),
      ...options
    }
    const storage = merged.storage ?? window.sessionStorage
    const prefix = merged.key ?? ''
    const fullKey = storageKey(store.$id, prefix)

    // 恢复
    const raw = storage.getItem(fullKey)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>
        const patch: Record<string, unknown> = {}
        const keys = merged.paths && merged.paths.length ? merged.paths : Object.keys(parsed)
        keys.forEach((k) => {
          // 只回填 store 上真实存在的字段，避免把脏数据带进来
          if (k in parsed && k in store.$state) {
            patch[k] = parsed[k]
          }
        })
        if (Object.keys(patch).length) {
          // Pinia 的 $patch(object) 签名要求 _DeepPartial<StateTree>，
          // 而这里的值来自 JSON.parse，静态上无法证明形状（key 已按 $state 过滤过），
          // 故走 mutator 重载：显式 Object.assign，语义等价且不需要断言。
          store.$patch((state) => {
            Object.assign(state, patch)
          })
        }
      } catch (e) {
        console.warn(`[persist] ${fullKey} 解析失败，已忽略`, e)
      }
    }

    // 保存
    store.$subscribe(
      (_mutation, state) => {
        try {
          const data: Record<string, unknown> = {}
          const keys = merged.paths && merged.paths.length ? merged.paths : Object.keys(state)
          keys.forEach((k) => {
            data[k] = (state as Record<string, unknown>)[k]
          })
          storage.setItem(fullKey, JSON.stringify(data))
        } catch (e) {
          console.warn(`[persist] ${fullKey} 写入失败`, e)
        }
      },
      {detached: true}
    )
  }
}

export default createPersistedStatePlugin

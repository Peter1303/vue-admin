import {defineStore} from 'pinia'
import type {RouteRecordRaw} from 'vue-router'

/**
 * 系统级状态
 * 原实现是一个 Vuex module（namespaced: true, id = 'sys'），
 * 这里 1:1 迁移为 Pinia store，id 保持 'sys'。
 *
 * 原用法：this.$store.state.sys.menu / commit('sys/setMenu', payload)
 * 新用法：const sys = useSysStore(); sys.menu / sys.setMenu(payload)
 */
export const useSysStore = defineStore('sys', {
  state: () => ({
    menu: [] as RouteRecordRaw[]
  }),
  actions: {
    setMenu(payload: RouteRecordRaw[]) {
      this.menu = payload
    }
  }
})

export default useSysStore

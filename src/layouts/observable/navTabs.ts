import {reactive} from 'vue'
import type {RouteLocationNormalized} from 'vue-router'

/**
 * 标签页（navTabs）状态
 * `Vue.observable` → `reactive`
 */

let tabsArr = localStorage.getItem('navTabs') || '[]'

export const navTabs = reactive({
  navTabs: [] as Partial<RouteLocationNormalized>[]
})

try {
  const parsed = JSON.parse(tabsArr)
  navTabs.navTabs = Array.isArray(parsed) ? parsed : []
} catch {
  navTabs.navTabs = []
}

export const anthNavTabs = (menu: RouteLocationNormalized): void => {
  // 所有的鉴权条件符合后 push 进 navTabs
  // 第一步判断是否存在，存在就选中
  const path = menu.path
  const pathIndex = navTabs.navTabs.findIndex((el) => el.path === path)
  // meta 可能为空，原实现直接 menu.meta.hide 会在无 meta 的路由上抛错
  if (pathIndex === -1 && !menu.meta?.hide) {
    navTabs.navTabs.push(menu)
    localStorage.setItem('navTabs', JSON.stringify(navTabs.navTabs))
  }
}

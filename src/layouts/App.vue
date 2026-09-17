<template>
  <div id="app">
    <template v-if="layout.appReload">
      <a-config-provider
        :get-popup-container="getPopupContainer"
        :locale="locale"
        :theme="antdTheme"
      >
        <!--
          根 router-view 刻意不设 :key
          原代码写的是 `:key="$route.fullpath"`（小写 p，取到 undefined），
          等于「没有 key」。迁移时如果"顺手修正"成 $route.fullPath，
          每次跳转都会销毁重建整棵布局树 → 菜单组件的展开态被重置，
          表现为「点一次子菜单，父级就自己收起来了」。
        -->
        <router-view class="router-view"/>
      </a-config-provider>
    </template>
  </div>
</template>

<script lang="ts" setup>
// nextTick 不再需要：切回前台不再重建视图树（见下方 onVisibilityChange）
import {computed, onBeforeUnmount, onMounted, watch} from 'vue'
// ⚠️ antdv 4 里 `ant-design-vue/lib/locale-provider/zh_CN` 已不存在（该目录下只剩 index/LocaleReceiver），
// 被 Vite import 到会直接返回 500，入口模块挂掉 = 整站白屏。正确路径是 es/locale/zh_CN
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import {layout, mediaQuery} from '@layouts'

defineOptions({name: 'App'})

/** a-locale-provider 已废弃，统一交给 a-config-provider */
const locale = zhCN

/**
 * antd 组件的主题色
 * 原来靠 window.less.modifyVars() 运行时重编译 less，antdv 4 已无 less.js；
 * 现在改成 ConfigProvider token，配合 layout.setPrimaryColor() 写的
 * `--primary-color` CSS 变量，让 antd 组件与自有 less 用同一套主题色。
 */
const antdTheme = computed(() => ({
  token: {colorPrimary: layout.primaryColor}
}))

/** 弹层挂载点：trigger 可能为空，直接读 parentNode 会抛错 */
const getPopupContainer = (trigger?: HTMLElement): HTMLElement => {
  if (layout.layoutShap === 'layout2' && trigger && trigger.parentNode) {
    return trigger.parentNode as HTMLElement
  }
  return document.body
}

watch(
  layout,
  (val) => {
    localStorage.setItem('layout', JSON.stringify(val))
  },
  {deep: true, immediate: true}
)

/**
 * 浏览器切换事件
 * ------------------------------------------------------------
 * ⚠️ 切回前台时**不要**再切 `layout.appReload`（原 Vue2 模板就是这么写的）。
 * 这里只保留标题的「冻结 / 解冻」，不再重建视图树。
 *
 * 原因：`layout.appReload` 控制的是本文件最外层那个 `<template v-if>`，
 * 一关一开会把 `<a-config-provider>` 以下的**整棵 layout 树**销毁重建。于是
 * 每次从别的窗口切回来都会连带丢掉：
 *   · 侧边栏已展开的子菜单 —— `openKeys` 是 solo-menu 的组件内状态，重挂载即归零
 *   · `<keep-alive>` 里缓存的页面实例 —— 表单填了一半、表格筛选/页码全部清空
 *   · 页面滚动位置与其它组件局部状态
 *
 * 实测（CDP 双标签页真实抢焦点）：切回前台后打在 `.ant-layout-sider` 与
 * `#router-view` 上的 DOM 标记双双消失（siderMarker / pageMarker MISSING），
 * 已展开的子菜单数量 1 → 0，而 `visibilitychange` 只触发了 hidden / visible 两次 ——
 * 也就是说菜单并不是被"关掉"的，而是随着整棵树一起被销毁了。
 *
 * 注意：原 Vue2 版就有这个问题（它的 `openKeys` 同样是组件内 data，`appReload`
 * 同样被 toggle），所以「切窗口回来菜单收起」是继承来的老缺陷，不是迁移回归。
 *
 * 「刷新全部」按钮走的仍是 `refreshAll()` 里的 `appReload` —— 那是用户主动触发的，
 * 整树重建正是它的语义，保持不变。
 */
const onVisibilityChange = (): void => {
  // 浏览器切换事件
  if (document.visibilityState === 'hidden') {
    document.title = 'Artiely（冻结）'
  } else {
    document.title = 'Artiely'
  }
}

onMounted(() => {
  mediaQuery().init()
  document.addEventListener('visibilitychange', onVisibilityChange)
})

// Vue 2 的 destroyed → Vue 3 的 onBeforeUnmount
onBeforeUnmount(() => {
  mediaQuery().remove()
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<style>
#app {
  height: 100%;
}
</style>

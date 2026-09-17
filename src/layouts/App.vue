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
import {theme} from 'ant-design-vue'
import {brandLinkTokens, layout, mediaQuery, resolvedTheme} from '@layouts'

defineOptions({name: 'App'})

/** a-locale-provider 已废弃，统一交给 a-config-provider */
const locale = zhCN

/**
 * antd 组件的主题
 * ------------------------------------------------------------
 * 两条腿之一（另一条是自有 less 的 CSS 变量，见 observable/layout.ts 的说明）：
 *
 *   · `algorithm` 管深浅 —— darkAlgorithm 会把全部 token 重新派生一遍
 *     （colorBgLayout/ colorBgContainer / colorText / colorBorder…），
 *     a-card / a-table / a-modal / a-menu 等所有 antd 组件随之变深，
 *     连 reset 里的 body 底色也一起算在内；
 *   · `token` 管品牌色 —— 主题色与 colorLink 三件套，和深浅无关，两种模式下都生效。
 *
 * ⚠️ 必须放在 computed 里：algorithm 依赖 resolvedTheme，
 *    若把它固化成常量对象，切模式时 antd 不会重算 token（整个界面停在旧色）。
 *
 * ⚠️ 主题色那条腿不要跟着深浅走：`--primary-color` 由 setPrimaryColor() 写在 <html> 上，
 *    深色下保持同一个品牌色（antd 的 darkAlgorithm 会自己把它调成适合暗底的色阶）。
 *
 * ⚠️ 必须一并下发 `colorLink` 三件套（brandLinkTokens）。
 *    antd v4 的 `colorLink` 派生自**独立的** seed token `colorInfo`（默认 #1677ff），
 *    跟 `colorPrimary` 没有关系 —— 只设 colorPrimary 时，主按钮/选中态都跟着换，
 *    但裸 `<a>` 会原地不动：最显眼的就是右上角个人中心那个
 *    `<a class="ant-dropdown-link">`（用户名 + 下拉箭头），
 *    默认态是 #1677ff、换肤后仍是 #1677ff，是全站唯一"两种蓝"的地方。
 *    （门店/表格里的 `<a-button type="link">` 同理，见 es/button/style 的 colorLink 引用。）
 */
const antdTheme = computed(() => ({
  algorithm: resolvedTheme.value === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: {
    colorPrimary: layout.primaryColor,
    ...brandLinkTokens(layout.primaryColor)
  }
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

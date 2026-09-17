<template>
  <a-layout-sider
    v-model:collapsed="layout.isCollapse"
    :class="className"
    :collapsed-width="collapsedWidth"
    :style="style"
    :trigger="null"
    :width="menuWidth"
    breakpoint="xl"
    collapsible
  >
    <solo-menu/>
  </a-layout-sider>
</template>

<script lang="ts" setup>
import {computed} from 'vue'
import soloMenu from '../menu/solo-menu.vue'
import {layout} from '@layouts'
import utils from '@/common/utils'

defineOptions({name: 'SiderMenu'})

const {pxtorem} = utils

const menuWidth = pxtorem(layout.menuWidth)
const collapsedWidth = pxtorem(layout.collapsedWidth)

const className = computed(() => [
  layout.menuTheme === 'dark' ? 'dark' : 'light',
  layout.isCollapse ? 'is-collapse' : ''
])
const style = computed(() => [
  layout.layoutMode === 'fixed' ? {overflow: 'hidden', height: '100vh', position: 'fixed', left: 0} : '',
  layout.isCollapse ? {
    width: collapsedWidth,
    maxWidth: collapsedWidth,
    minWidth: collapsedWidth,
    flex: `0 0 ${collapsedWidth}`
  } : ''
])
</script>

<style lang="less">
@import "@/assets/styles/var.less";

.ant-menu-inline-collapsed {
  width: 100% !important;
  text-align: center;
}

.ant-layout-sider {
  /*
   * 侧边栏底色必须接主题令牌，而且必须保留 `!important`：
   * 这两条是同权重、位置更靠后的自有样式，用来压 antd 给 .ant-layout-sider 的 token 底色。
   * 深色模式下的取值为：深色菜单仍是深蓝 #001529（与 antd 暗色 Menu 同色系），
   * 浅色菜单换成 #141414（colorBgContainer）—— 否则「深色模式 + 白色菜单」
   * 会是一整条白底配浅色文字，等于整列菜单都看不见。
   */
  &.light {
    background: var(--menu-background-light, @menu-background-light) !important;
  }

  &.dark {
    background: var(--menu-background-dark, @menu-background-dark) !important;
  }

  &.is-collapse {
    .ant-layout-sider-children {
      // width: 97px;
      // overflow-y:hidden;
    }
  }

  .ant-layout-sider-children {
    height: 100vh;
    overflow-y: auto;
  }
}
</style>

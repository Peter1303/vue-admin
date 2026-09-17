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
  &.light {
    background: @menu-background-light !important;
  }

  &.dark {
    background: @menu-background-dark !important;
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

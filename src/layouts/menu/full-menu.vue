<template>
  <a-drawer
    v-if="layout.isMobile"
    :closable="false"
    :open="!layout.isCollapse"
    :width="layout.menuWidth"
    :wrap-class-name="`my-draw-menu ${layout.menuTheme==='dark'?'dark':'light'}`"
    mask-closable
    placement="left"
    @close="handleChange"
  >
    <solo-menu logo/>
    <template #handle>
      <div
        v-if="trigger"
        :style="{left:menuWidth}"
        class="menu-drawer-index-handle"
        @click="toggle"
      >
        <a-icon v-if="!layout.isCollapse" type="menu-fold"/>
        <a-icon v-else type="menu-unfold"/>
      </div>
    </template>
  </a-drawer>
  <sider-menu v-else/>
</template>

<script lang="ts" setup>
import siderMenu from './sider-menu.vue'
import soloMenu from './solo-menu.vue'
import {layout} from '@layouts'
import utils from '@/common/utils'

defineOptions({name: 'FullMenu'})

const {pxtorem} = utils

interface Props {
  // 是否展示trigger按钮
  trigger?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  trigger: false
})

const menuWidth = pxtorem(layout.menuWidth)

// 小屏打开时折叠起菜单，解决无法初始化 style 属性的问题（原 created 逻辑）
if (layout.isMobile) {
  layout.isCollapse = true
}

function handleChange() {
  layout.isCollapse = true
}

function toggle() {
  layout.isCollapse = !layout.isCollapse
}
</script>

<style lang="less">
@import "@/assets/styles/var.less";

.menu-drawer-index-handle {
  position: absolute;
  top: 62px;
  background: @primary-color;
  background: var(--primary-color, @primary-color);
  width: 40px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  pointer-events: auto;
  z-index: 1001;
  text-align: center;
  font-size: 16px;
  border-radius: 0px 4px 4px 0px;

  .anticon {
    color: rgb(255, 255, 255);
    font-size: 20px;
  }
}

.my-draw-menu {
  .ant-drawer-content {
    .ant-drawer-body {
      padding: 0 !important;
    }
  }

  &.light {
    .ant-drawer-wrapper-body {
      background: @menu-background-light;
    }
  }

  &.dark {
    .ant-drawer-wrapper-body {
      background: @menu-background-dark;
    }
  }
}
</style>

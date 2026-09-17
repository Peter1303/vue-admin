<template>
  <a-layout
    id="components-layout-demo-top"
    class="layout"
  >
    <a-layout-header :class="layout.layoutMode==='fixed'?'fixed':''" class="layout2-header">
      <v-logo :isCollapse="false" style="display:inline"></v-logo>
      <common-header></common-header>
      <div v-if="!layout.isMobile" :class="layout.menuTheme==='dark'?'dark':'light'" class="layout2-menu">
        <solo-menu
          :logo="false"
          class="layout2-solo-menu"
          mode="horizontal"
        />
      </div>
    </a-layout-header>
    <full-menu v-if="layout.isMobile" trigger/>
    <div v-if="layout.layoutMode==='fixed' && !layout.isMobile" style="height:64px"></div>
    <a-layout-content :style="contentStyle">
      <breadcrumb/>
      <slot/>
    </a-layout-content>
    <v-footer></v-footer>
  </a-layout>
</template>
<script lang="ts" setup>
import soloMenu from '../menu/solo-menu.vue'
import breadcrumb from '../breadcrumb/index.vue'
import {layout} from '../observable/layout'
import fullMenu from '../menu/full-menu.vue'
import VFooter from './footer.vue'
import commonHeader from './common-header.vue'
import utils from '@utils'

const contentTop = utils.pxtorem(layout.headerHeight)

const contentStyle = {
  paddingTop: contentTop
}
</script>

<style lang="less">
@import "@/assets/styles/var.less";

#components-layout-demo-top {
  min-height: 100%;

  .layout2-header {
    padding: 0;

    &.fixed {
      position: fixed;
      width: 100%;
      top: 0;
      left: 0;
      z-index: 999;
    }

    .layout2-menu {
      position: absolute;
      top: 64px;
      left: 0;
      right: 0;
      background: @layout-sider-background;
      transition: all .28s;

      &.dark {
        background: @menu-background-dark;
      }

      &.light {
        background: @menu-background-light
      }

      .layout2-solo-menu {
        padding: 0 50px;
      }
    }
  }
}

#components-layout-demo-top .logo {
  // width: 120px;
  // height: 31px;
  // background: rgba(255,255,255,.2);
  // margin: 16px 24px 16px 0;
  // float: left;
  // display: none
}
</style>

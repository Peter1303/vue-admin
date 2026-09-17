<template>
  <a-layout id="components-layout-demo-side" style="min-height: 100vh">
    <full-menu/>
    <a-layout :style="layoutFixed">
      <!--
        ⚠️ 先读 less 里 `.layout1-header` 那一段的说明再改这两个元素。

        一句话结论：**内容区不再有任何上边距**，它的顶边由 Header 的盒子高度决定 ——
        所以 Header 必须是「真实高度」并且能吸顶，这两件事分别由 `height: auto` 与
        `position: sticky` 负责。

        老写法（fixed / flow 两套 token 拼算 marginTop）为什么会做出「间距不一致」：
          · antd 给 `.ant-layout-header` 钉了 `height: 64px`，而标签条是 Header 的**子元素**，
            于是标签条被挤到 Header 盒子外面 —— Header 盒高 64、chrome 实际视觉底边 105。
          · 内容区只能靠 token 去猜这个高度差：fixed 用 64 + 45 = 109、flow 用 45 或 16。
            45 是「标签页高度」这个 token 的值，而标签条的真实高度是 41（胶囊模式 35）
            ⇒ 猜出来的 109 比「标签条底边 + 24」多 4px，胶囊模式下多 10px。
          · 更要命的是 flow 分支：flow 下 Header（64）**本身就在文档流里**，
            再叠一个 marginTop 就是重复计算 —— 关掉标签页时 flow = 64 + 16 = 80，
            而 fixed = 64，同页面同配置两种模式下顶部间距差 16px。

        现在：
          · `.layout1-header { height: auto }` → Header 盒子包住标签条，盒高 = chrome 实高；
          · 固定布局 `position: sticky; top: 0` → 既吸顶又占文档流（`:style="headerFixed"`
            那种 `position: fixed` 必须靠外部 marginTop 补高度，正是上面所有偏差的来源）；
          · 内容区只保留左右 16px，**上边距交给文档流**。

        结果：fixed / flow 两种模式、标签页开关、卡片/内联/胶囊三种标签样式下，
        内容区顶边都严格等于 chrome 视觉底边，页面顶端间距恒为 router-page 的 24px。
      -->
      <a-layout-header
        :class="{'is-fixed': layout.layoutMode === 'fixed'}"
        class="layout1-header"
        style="padding: 0"
      >
        <v-header>
          <a-icon
            :style="{cursor:flag?'pointer':'not-allowed'}"
            :type="layout.isCollapse ? 'menu-unfold' : 'menu-fold'"
            class="trigger"
            @click="handleClick"
          />
          <common-header></common-header>
        </v-header>
      </a-layout-header>
      <a-layout-content class="layout1-content" style="margin: 0 16px;">
        <div>
          <slot/>
        </div>
      </a-layout-content>
      <v-footer></v-footer>
    </a-layout>
  </a-layout>
</template>
<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref} from 'vue'
import fullMenu from '../menu/full-menu.vue'
import {layout} from '../observable/layout'
import VFooter from './footer.vue'
import VHeader from './header1.vue'
import commonHeader from './common-header.vue'
import utils from '@/common/utils'

const {pxtorem} = utils

const {layoutTransition, collapsedWidth, menuWidth} = layout

const collapsedWidthRem = pxtorem(collapsedWidth)
const menuWidthRem = pxtorem(menuWidth)

const flag = ref(true)
const o = ref<HTMLElement | null>(null)
const timer = ref<ReturnType<typeof setTimeout> | null>(null)

const marginLeft = computed(() => {
  if (layout.breakPoint === 'xs' || layout.breakPoint === 'sm') {
    return 0
  }
  return layout.isCollapse ? collapsedWidthRem : menuWidthRem
})

/**
 * flow 模式下侧边栏是普通流元素（在 sider-menu 里静态排布），内层 a-layout 不能加左边距，
 * 否则会再被推开一整个菜单宽度。
 */
const layoutFixed = computed(() => {
  if (layout.layoutMode === 'flow') {
    return null
  }
  return {
    'margin-left': marginLeft.value,
    transition: layoutTransition
  }
})

function callBack() {
  flag.value = true
  if (o.value) o.value.removeEventListener('transitionend', callBack)
}

function handleClick() {
  if (o.value) o.value.addEventListener('transitionend', callBack)
  if (flag.value) {
    layout.isCollapse = !layout.isCollapse
    flag.value = false
  }
  timer.value = setTimeout(() => {
    flag.value = true
  }, 200)
}

onMounted(() => {
  o.value = document.querySelector('.ant-layout-sider') as HTMLElement | null
})

onUnmounted(() => {
  if (o.value) o.value.removeEventListener('transitionend', callBack)
  if (timer.value) clearTimeout(timer.value)
  timer.value = null
  // 原实现里的调试日志，保留原行为
  console.log('TCL: destroyed -> this.timer', timer.value)
})
</script>

<style lang="less">
@import "@/assets/styles/var.less";

#components-layout-demo-side {
  min-height: 100%;

  /*
   * Header = 应用 chrome（顶栏 + 标签条）。这两个属性是「顶部间距一致」的地基，
   * 少任何一个都会退回成靠 token 猜高度：
   *
   * ① `height: auto`
   *    antd 的 `.ant-layout-header` 是 `height: 64px`（死高，不是 min-height），
   *    而标签条 `.layout-nav-tabs-wrapper` 是它的子元素 —— 盒高 64 装不下 64 + 41，
   *    标签条就溢出到盒子外面去了。于是「Header 盒高 64」与「chrome 视觉底边 105」
   *    长期是两个数，内容区只能靠 token 猜（fixed: 64+45=109 / flow: 45 或 16），
   *    而 token 里的 45 与标签条真实高度 41（胶囊模式 35）对不上 ⇒ 4~10px 漂移；
   *    flow 分支还把已经在流里的 Header 高度又算了一遍 ⇒ 关掉标签页时多 16px。
   *    这里让盒子老老实实包住标签条，盒高 = chrome 实高，之后谁也不用再猜。
   *    （`min-height: 64px` 只是兜底：`.layout1-header-inner` 里 `.header-right` 是浮动元素，
   *      万一以后 trigger 被删掉，Header 也不会塌成 0。）
   *
   * ② 固定布局用 `position: sticky` 而不是 `fixed`
   *    sticky 同时满足「占文档流」和「吸顶」：内容区自然排在 Header 下方，不需要任何 marginTop；
   *    而 `fixed` 会让 Header 脱离文档流，内容区就必须自己让出一个和 Header 等高的上边距 ——
   *    那个 marginTop 正是 fixed/flow 出现 16px 差异的根源。
   *    z-index 沿用 99（原来 fixed 时就是 99，见 cover.less 里 nprogress 那段层级说明）。
   */
  .layout1-header {
    height: auto;
    min-height: 64px;

    &.is-fixed {
      position: sticky;
      top: 0;
      z-index: 99;
    }
  }

  .trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 64px;
    padding: 0 24px;
    font-size: 18px;
    line-height: 1;
    vertical-align: top;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      background: fade(@primary-color, 10%);
      background: color-mix(in srgb, var(--primary-color, @primary-color) 10%, transparent);
      border-radius: 4px;
    }
  }
}
</style>

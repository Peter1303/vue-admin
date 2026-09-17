<template>
  <a-drawer
    v-if="layout.isMobile"
    :closable="false"
    :open="!layout.isCollapse"
    :root-class-name="`my-draw-menu ${layout.menuTheme==='dark'?'dark':'light'}`"
    :width="layout.menuWidth"
    mask-closable
    placement="left"
    @after-open-change="onAfterOpenChange"
    @close="handleChange"
  >
    <solo-menu logo/>
    <!--
      自带关闭按钮。不用 antd 的 `closable`：它在没有 title 的时候会渲染一条
      48px 高的 header，只为放一个叉，白白吃掉菜单的纵向空间，而这行 logo 本来就
      空着右边 —— 直接压在这里。44×44 是触屏最小点击区。
    -->
    <button
      aria-label="收起菜单"
      class="menu-drawer-close"
      type="button"
      @click="handleChange"
    >
      <a-icon type="close"/>
    </button>
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
import {watch} from 'vue'
import {useRoute} from 'vue-router'
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
const route = useRoute()

/**
 * 首屏 / 屏幕跨过 768px 断点时，把抽屉收起来
 * ------------------------------------------------------------
 * `layout.isCollapse` 在移动端就是「抽屉是否打开」（`:open="!layout.isCollapse"`），
 * 而它是**会和桌面端共用、还会被写进 localStorage** 的同一个字段：
 * 桌面端侧边栏是展开的（isCollapse=false）时把窗口缩到手机宽度，
 * 抽屉会直接弹出来盖住页面 —— 只靠「组件 setup 时置一次 true」挡不住这种情况
 * （setup 只在挂载那一刻跑，resize 不会重跑）。
 *
 * 原来的写法就是这一句裸的赋值，这里改成带 immediate 的 watch，行为等价且覆盖 resize。
 */
watch(
  () => layout.isMobile,
  (isMobile: boolean) => {
    if (isMobile) layout.isCollapse = true
  },
  {immediate: true}
)

/**
 * 路由一变就收起抽屉
 * ------------------------------------------------------------
 * 抽屉是覆盖式导航（占屏 2/3），点完菜单必须收起，否则页面已经在抽屉背后完成跳转，
 * 用户看到的是「点了没反应」—— 实测点 `/workplace` 后 hash 已变、`.ant-drawer-open`
 * 仍然在，只能再去找右边那条 100 多 px 的遮罩点一下才能看到页面。
 *
 * 这里用「watch 路由」而不是只在菜单的 select 里关：页面内部的按钮、程序化跳转
 * 同样应该收起抽屉。solo-menu 的 select 里另有一处（覆盖 window.open 的外链项，
 * 那种点击不会变更 route）。
 */
watch(
  () => route.path,
  () => {
    if (layout.isMobile && !layout.isCollapse) layout.isCollapse = true
  }
)

function handleChange() {
  layout.isCollapse = true
}

/**
 * 抽屉滑入动画结束后，把当前选中项滚进可视区
 * ------------------------------------------------------------
 * 为什么需要：抽屉里 47 个条目、每个 48px，全展开时内容实测 1152px，
 * 而 357×827 的视口只有 827px —— 抽屉体虽然可滚动，但**打开时 scrollTop 恒为 0**，
 * 于是选中项靠下时（实测 `/licence-plate`「车牌选择器」在 y=932）用户拉开抽屉
 * 只看到菜单顶部，完全不知道自己在哪一页。
 *
 * 为什么挂 `@after-open-change` 而不是在打开那一刻就滚：
 *   · antd 的 Drawer 内容是**懒渲染**的，首次打开时 `.artiely-menu` 还在挂载，
 *     同一帧里查不到（实测：用 rAF 逐帧重试到超时都没等到准确位置）；
 *   · 这个事件由 CSSMotion 的 afterEnter 触发，此时动画已结束、菜单展开与
 *     布局都已稳定，一次就能算准，不需要任何 sleep / 轮询。
 *
 * 两个实现要点：
 *   · **不调用 `scrollIntoView`** —— 它会把页面本身也一起滚了。这里只改容器 scrollTop。
 *   · 只算「容器与条目的相对位置」，所以不受抽屉位移影响。
 */
function onAfterOpenChange(open: boolean): void {
  if (!open) return
  const root = document.querySelector('.artiely-menu')
  const scroller = root ? (root.closest('.ant-drawer-body') as HTMLElement | null) : null
  const sel = root ? (root.querySelector('.ant-menu-item-selected') as HTMLElement | null) : null
  if (!scroller || !sel) return

  const b = scroller.getBoundingClientRect()
  const s = sel.getBoundingClientRect()
  if (s.top >= b.top - 0.5 && s.bottom <= b.bottom + 0.5) return
  scroller.scrollTop += s.top - b.top - Math.max(0, (b.height - s.height) / 2)
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
  /*
   * ⚠️ 这个类名必须由 `root-class-name` 下发，**不能写回 `wrap-class-name`**。
   *
   *    `wrapClassName` 在 antdv 4 的 Drawer 里已经被移除（改名 rootClassName，
   *    见 node_modules/ant-design-vue/es/drawer/index.js 的 props 定义），
   *    而且它是**静默失效**：不报错、不告警，类名压根没渲染到 DOM 上，整块样式跟着一起失效。
   *    实测（CDP 357×827，真实浏览器）当时实际发生的三件事：
   *      ① 下面 `.ant-drawer-body` 的 `padding: 0` 没生效 → 面板左右各被啃掉 24px，
   *         240 的抽屉实际只剩 192px 可用宽度；
   *      ② 因为只剩 192px，`.logo` 装不下 img(32) + 定宽文字(160) + 间距(12) = 204，
   *         文字换行到第二行，又被 `.logo { height: 32px; overflow: hidden }` 整行裁掉
   *         —— 用户看到的就是「抽屉顶部只有一个居中图标，应用名不见了」；
   *      ③ light / dark 两套背景色也没生效。
   */
  .ant-drawer-body {
    padding: 0 !important;
    /* 关闭按钮是它的绝对定位子元素（solo-menu 与它同级，不是它的祖先） */
    position: relative;
  }

  /*
   * 关闭按钮：压在 logo 行右端，44×44 达到触屏最小点击区。
   * 移动端原本 `:closable="false"` 且没有 header，**整屏没有任何关闭入口**，
   * 唯一退路是去点右侧那条遮罩（357px 视口下只有 117px 宽）。
   */
  .menu-drawer-close {
    position: absolute;
    top: 12px;
    right: 6px;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    padding: 0;
    border: 0;
    background: transparent;
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
  }

  /*
   * logo 行：原本是「img + 定宽 160px 的 h1」两个 inline 元素，容器一窄就换行，
   * 而 `.logo` 是定高 32px + overflow:hidden —— 换行的那一行会被整行裁掉。
   * 改成 flex 后两者永远同一行：图标固定，文字 `flex: 1 + min-width: 0` 收缩出省略号。
   * 选择器带了 3 层类名，权重高于 logo.vue 里的 `.logo` / `.logo .logo-text`，
   * 不依赖样式注入顺序（那个组件的样式在 dev 下是异步 chunk，注入得更晚）。
   *
   * 尺寸是按「这一行必须同时装下 图标 + 应用名 + 关闭按钮」倒推的
   *（抽屉 240px：左边距 16 + 图标 28 + 间距 12 + 文字 + 右边距 46 = 240）：
   * 20px 字号下 "Ant Desgin Pro" 约 150px，装不下会被省略号截成 "Ant Desgi…"，
   * 反而比不显示更难看，所以这里降到 16px 字号 / 28px 图标。
   */
  .artiely-menu .logo {
    display: flex;
    align-items: center;
    margin-right: 48px;
    white-space: nowrap;

    img {
      width: 28px;
    }

    .logo-text {
      width: auto;
      min-width: 0;
      flex: 1;
      font-size: 16px;
    }
  }

  /*
   * 抽屉底色同样接主题令牌：深色模式下「浅色菜单」也得是深底（#141414），
   * 否则这一整屏抽屉是白的、而菜单文字按 antd 暗色渲染成浅色 —— 整个菜单消失。
   */
  &.light {
    .ant-drawer-wrapper-body {
      background: var(--menu-background-light, @menu-background-light);
    }

    .menu-drawer-close {
      color: rgba(0, 0, 0, 0.45);

      // 深色模式下 .light 拿到的是深底 #141414，深灰的叉会看不见
      html[data-theme='dark'] & {
        color: rgba(255, 255, 255, 0.65);
      }
    }
  }

  &.dark {
    .ant-drawer-wrapper-body {
      background: var(--menu-background-dark, @menu-background-dark);
    }

    .menu-drawer-close {
      color: rgba(255, 255, 255, 0.65);
    }
  }
}

/*
 * 移动端触摸目标与缩进
 * ------------------------------------------------------------
 * antd 的 inline 菜单条目是 40px 高，低于 Apple HIG 的 44px 下限
 * （实测抽屉内 47/47 个条目全部是 40px、字号 14px）。
 * 抬到 48px + 15px 字号；二级缩进从 48/72px 收到 40/56px，
 * 把省下的横向空间还给文字（一级 padding-left 仍是 antd 的 24px，不额外改动）。
 */
@media only screen and (max-width: 767px) {
  .my-draw-menu {
    .ant-menu-inline .ant-menu-item,
    .ant-menu-inline .ant-menu-submenu-title {
      height: 48px;
      line-height: 48px;
      font-size: 15px;
    }

    .ant-menu-sub .ant-menu-item,
    .ant-menu-sub .ant-menu-submenu-title {
      padding-left: 40px !important;
    }

    .ant-menu-sub .ant-menu-sub .ant-menu-item,
    .ant-menu-sub .ant-menu-sub .ant-menu-submenu-title {
      padding-left: 56px !important;
    }
  }
}
</style>

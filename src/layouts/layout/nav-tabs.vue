<template>
  <div class="layout-nav-tabs-wrapper">
    <a-tabs
      :activeKey="activeKey"
      :class="layout.navTabsShap==='capsule'?'capsule':''"
      :type="layout.navTabsShap==='capsule'?'card':layout.navTabsShap"
      animated
      class="layout-nav-tabs"
      @change="handleNavTab"
    >
      <a-tab-pane v-for="item in panes" :key="item.path">
        <template #tab>
          <a-iconfont v-if="item.meta && item.meta.icon" :type="item.meta.icon"/>
          {{ item.meta && item.meta.title }}
          <a-icon
            v-if="panes.length!=1"
            class="nav-tabs-close-icon"
            type="close-circle"
            @click.prevent.stop="del(item)"
          />
        </template>
      </a-tab-pane>
    </a-tabs>
    <div class="layout-nav-tabs-actions">
      <a-dropdown>
        <template #overlay>
          <a-menu @click="handleMenuClick">
            <a-menu-item key="refresh-curr">
              <v-icon name="icon-refresh"/>
              刷新当前标签
            </a-menu-item>
            <a-menu-item key="refresh-all">
              <v-icon name="icon-refresh"/>
              刷新全部标签
            </a-menu-item>
            <a-menu-item key="close-curr" :disabled="panes.length==1">
              <v-icon name="icon-delete"/>
              关闭当前标签
            </a-menu-item>
            <a-menu-item key="close-other" :disabled="panes.length==1">
              <v-icon name="icon-delete"/>
              关闭其他标签
            </a-menu-item>
            <a-menu-item key="close-all" :disabled="panes.length==1">
              <v-icon name="icon-delete"/>
              关闭所有标签
            </a-menu-item>
            <a-menu-divider/>
            <a-menu-item key="line">
              <v-icon name="icon-keyboard"/>
              内联模式
            </a-menu-item>
            <a-menu-item key="card">
              <v-icon name="icon-label"/>
              卡片模式
            </a-menu-item>
            <a-menu-item key="capsule">
              <v-icon name="icon-label"/>
              胶囊模式
            </a-menu-item>
          </a-menu>
        </template>
        <div class="layout-nav-tabs-actions-inner">
          <a-icon type="down-square"/>
        </div>
      </a-dropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, nextTick} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {navTabs} from '../observable/navTabs'
import {layout} from '@layouts'

interface NavTabItem {
  path: string
  meta?: { icon?: string; title?: string; hide?: boolean }
}

const route = useRoute()
const router = useRouter()
const panes = navTabs.navTabs as unknown as NavTabItem[]

const activeKey = computed(() => route.path)

function del(item: NavTabItem) {
  /**
   * 只剩一个禁止删除
   * 找出对应的索引并删除
   * 删除后对应跳转的路由
   * 如果删除的不是当前标签不做响应
   * 如果删除当前标签并且当前标签不是最后一个则跳转至下一个标签，如果是最后一个标签则跳转至上一个
   */
  if (navTabs.navTabs.length === 1) return
  const findIndexPath = (el: NavTabItem) => el.path === item.path
  const index = navTabs.navTabs.findIndex(findIndexPath as (el: unknown) => boolean)
  if (index !== -1) {
    navTabs.navTabs.splice(index, 1)
  }

  const currPath = route.path
  const navTabsLength = navTabs.navTabs.length
  if (item.path === currPath) {
    if (index === navTabsLength) {
      router.push({path: (navTabs.navTabs[navTabsLength - 1] as unknown as NavTabItem).path})
    } else {
      router.push({path: (navTabs.navTabs[index] as unknown as NavTabItem).path})
    }
  }
}

function handleNavTab(path: string) {
  router.push({path})
}

function handleMenuClick(e: { key: string }) {
  switch (e.key) {
    case 'line':
      layout.navTabsShap = 'line'
      break
    case 'card':
      layout.navTabsShap = 'card'
      break
    // 胶囊模式只是对样式的覆写
    case 'capsule':
      layout.navTabsShap = 'capsule'
      break
    case 'close-curr':
      closeCurr()
      break
    case 'close-all':
      closeAll()
      break
    case 'close-other':
      closeOther()
      break
    case 'refresh-curr':
      refreshCurr()
      break
    case 'refresh-all':
      refreshAll()
  }
}

function closeCurr() {
  // 关闭当前标签
  const {currItem} = getCurrTab()
  del(currItem as NavTabItem)
}

function getCurrTab() {
  const currPath = route.path
  const findIndexCurrPath = (el: NavTabItem) => el.path === currPath
  const currPathIndex = navTabs.navTabs.findIndex(findIndexCurrPath as (el: unknown) => boolean)
  const currItem = navTabs.navTabs[currPathIndex] as unknown as NavTabItem
  return {currPathIndex, currItem}
}

function closeOther() {
  // 关闭其他标签
  const {currItem} = getCurrTab()
  navTabs.navTabs.splice(0)
  navTabs.navTabs.splice(0, 0, currItem as NavTabItem)
  router.push((currItem as NavTabItem).path)
}

function closeAll() {
  navTabs.navTabs.splice(1)
  router.push((navTabs.navTabs[0] as unknown as NavTabItem).path)
}

function refreshCurr() {
  // 刷新当前标签
  layout.homeReload = false
  nextTick(() => {
    layout.homeReload = true
  })
}

function refreshAll() {
  // 刷新当前标签
  layout.appReload = false
  nextTick(() => {
    layout.appReload = true
  })
}
</script>

<style lang="less">
@import "@/assets/styles/var.less";

/*
 * 标签条是「顶部 chrome」的一部分，底色必须接主题令牌（--nav-tab-bg）：
 * 浅色下 未选中 #f9f9f9 / 选中 #fff，深色下 未选中 #000 / 选中 #141414 ——
 * 都是「未选中比选中更暗」，选中项自然浮起来，两种模式方向一致。
 * 不接令牌的话，深色模式下会横着一条浅灰，直接盖住整个顶栏。
 */
.layout-nav-tabs-wrapper .layout-nav-tabs.capsule .ant-tabs-tab {
  height: 30px !important;
  line-height: 30px !important;
  border-radius: 17px !important;
  border: 1px solid var(--nav-tab-bg, @nav-tab-bg) !important;
  margin-top: 5px !important;
  margin-right: 5px !important;

  .nav-tabs-close-icon {
    top: 8px !important;
  }

  &.ant-tabs-tab-active {
    border-color: #1690ff !important;
  }
}

.layout-nav-tabs-wrapper {
  display: flex;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: relative;
  z-index: 100;
  user-select: none;
  background: var(--nav-tab-bg, @nav-tab-bg);

  .layout-nav-tabs {
    flex: 1;
    /*
     * ⚠️ `min-width: 0` 不能省 —— 这是「标签开多了整页横向滚动」的根因。
     *
     * flex item 的 `min-width` 默认是 `auto`：它**不能被收缩到内容宽度以下**。
     * 于是 `flex: 1` 完全压不住内容 —— 每多开一个标签，.layout-nav-tabs 就被
     * 撑宽一点，顺着 wrapper 一路把 documentElement 撑开：
     * 实测连开 26 个标签时 `.layout-nav-tabs` 宽 3550px、整页横向滚动 3550px，
     * 而 antd 自带的 `.ant-tabs-nav-wrap{overflow:hidden}` 与左右滚动箭头全程失效
     * （因为轮到它们收缩的容器压根没被收缩）。
     *
     * 置 0 把收缩权交还 flex，antd 的标签溢出滚动机制才真正接管。
     */
    min-width: 0;
  }

  .layout-nav-tabs-actions {
    width: 32px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    color: var(--text-color, @text-color);
    cursor: pointer;
    font-size: 12px;

    .layout-nav-tabs-actions-inner {
      width: 100%;
      height: 100%;

      .anticon {
        color: var(--text-color, @text-color);
      }
    }
  }
}

.layout-nav-tabs {
  /*
   * ⚠️ 标签条（tabs bar）必须保持 41px 高，`margin: 0; border: 0` 这两条不能少。
   *
   * 老产物（Vue2 + antd v1）的编译结果就是 `layout-nav-tabs .ant-tabs-bar{margin:0;border:0}`
   * （dist/static/css/chunk-57fa8fdc.3c742cae.css 可查），
   * 但 **antdv4 把类名从 `.ant-tabs-bar` 改成了 `.ant-tabs-nav`**，
   * 于是这两条落空，antd 默认的 `margin-bottom: 16px` 生效 —— 标签条整块从 41px 涨到 57px。
   *
   * 固定布局下这会直接咬到内容区，而且是静默的：
   *   - 内容区原来靠 token 拼算上边距（headerHeight 64 + navTabsHeight 45 = 109px），
   *   - 而 Header 的视觉底边被顶到 64 + 57 = 121px，
   *   → 内容区顶部 12px 落进固定 Header 底下。
   *
   * 页面根元素**就是卡片**的那一批（/crud /error /success /todo /calendar /help
   * /filter /iconbox /avatar-group /mask /level1）自身没有上边距，
   * 于是卡片的圆角与上边框被直接切平 —— 用户看到的就是「距离顶部距离异常」。
   * 根元素是 div 的页面因为内部还压着 24px 上边距，恰好把 12px 挡住了，所以看不出问题。
   *
   * 实测（CDP 真实 Chrome，1440×900，fixed + 标签页开）：
   *   |            | Header 视觉底边 | 内容区顶边 | 卡片顶边 | 卡片被盖 |
   *   | 修前       | 121             | 109        | 109      | 12px     |
   *   | 本规则生效 | 105             | 109        | 109      | 0（留 4px）|
   * （内容区顶边 109 是当时的 token 算法；后来 layout1 改成「Header 盒高 = chrome 实高 +
   *   sticky 吸顶」，内容区顶边直接等于 105，见 layout1.vue 的说明。
   *   **但 41px 这条必须保住** —— 标签条一旦变高，chrome 底边就会越过内容区顶边，
   *   卡片照旧被切。上面那张表里的 121 随时可能因为这条规则失效而复现。）
   *
   * 两处 `!important` 是为了压过 antdv4 CSS-in-JS 运行时注入的
   * `.ant-tabs-top > .ant-tabs-nav{margin-bottom:16px}` —— 它权重相同但在运行时注入、位置更靠后。
   * `::before` 是 antdv4 画「标签条下边线」的方式，老产物里那 1px 被 `border: 0` 一并去掉了。
   */
  .ant-tabs-bar,
  .ant-tabs-nav {
    margin: 0 !important;
    border: 0 !important;

    &::before {
      border-bottom: 0 !important;
    }
  }

  .nav-tabs-close-icon {
    position: absolute;
    right: -2px;
    top: 12px;
    display: none;
  }

  .ant-tabs-tab:hover {
    .nav-tabs-close-icon {
      display: block;
    }
  }

  .ant-tabs-tab-prev {
    box-shadow: 1px 0 6px rgba(0, 21, 41, 0.2);
  }

  .ant-tabs-tab-next {
    box-shadow: -1px 0 6px rgba(0, 21, 41, 0.2);
  }

  .ant-tabs-nav .ant-tabs-tab {
    height: 41px;
    line-height: 40px;
    padding: 0 30px;
    margin: 0;
    border: 1px solid transparent;
  }

  &.ant-tabs.ant-tabs-card .ant-tabs-card-bar .ant-tabs-tab {
    padding: 0 30px 0 15px;
    border-radius: 0;
    margin-right: -1px;
    font-weight: 500;
  }
}
</style>

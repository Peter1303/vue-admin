<template>
  <div class="artiely-menu select-none">
    <v-logo v-if="logo"/>
    <!-- :selectedKeys="selectedKeys" -->
    <a-menu
      :mode="mode"
      :openKeys="openKeys"
      :selectedKeys="selectedKeys"
      :theme="layout.menuTheme"
      @openChange="onOpenChange"
      @select="select"
    >
      <!-- 两个分支各套一层 <template>：Vue 3 不允许同一 v-if 链的分支 key 重复
           （编译器 vue(29)），而 antd 又必须从 vnode.key 取菜单项标识（= item.path）。
           完整来龙去脉见 sub-menu.vue 里那段注释。 -->
      <template v-for="item in menu">
        <template v-if="!item.meta?.hide">
          <template v-if="!item.children && !item.meta?.hide">
            <a-menu-item :key="item.path">
              <a-iconfont :type="item.meta?.icon"/>
              <!-- 折叠态不要靠 v-if 删掉标题：文字保留、由样式隐藏（antd 的
                   `opacity: 0` + cover.less 把宽度归零），否则折叠态的 tooltip
                   取不到文本，只剩一个空壳。 -->
              <span>{{ item.meta?.title }}</span>
            </a-menu-item>
          </template>
          <template v-else>
            <sub-menu :key="item.path" :menu-info="item" />
          </template>
        </template>
      </template>
    </a-menu>
  </div>
</template>

<script lang="ts" setup>
import {computed, nextTick, onDeactivated, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import subMenu from './sub-menu.vue'
import {layout} from '@layouts'
import {applyRouteOpenKeys, type MenuNode, menuOpenKeys, routeOpenKeys} from '../observable/menu'
import {routes} from '@router'

defineOptions({name: 'SoloMenu'})

interface Props {
  mode?: string
  logo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'inline',
  logo: true
})

const route = useRoute()
const router = useRouter()

let reg = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?/

const menu = Object.freeze(routes) as unknown as MenuNode[]

/**
 * 展开态来自 observable，**不要**改回组件内 `ref([])`。
 *
 * 进出 `/level1` 会让 App 层 router-view 在「布局组件 ↔ 页面组件」之间切换，
 * 整棵布局树（含本组件）被销毁重建，组件内的 openKeys 会归零 ——
 * 表现为「从一级可点击菜单切到别的菜单后，刚展开的子菜单自己收起来了」。
 * 详见 `layouts/observable/menu.ts` 里的实测记录。
 */
const openKeys = menuOpenKeys

watch(
  () => layout.isCollapse,
  (val: boolean) => {
    console.log('TCL: handler -> val', val)
    if (val) {
      openKeys.value = []
    }
  },
  {immediate: true}
)

/**
 * 刷新 / 首次进入时，按当前路由把侧边菜单展开到所在层级
 * ------------------------------------------------------------
 * 只做一次（`applyRouteOpenKeys` 内部有模块级开关，重复调用是空操作），
 * 之后的展开态交给用户操作，避免把「跨菜单跳转后保持已展开项」的行为打回去。
 *
 * 三个坑，都踩过：
 *
 * 1) `matched.length` —— 首次导航是异步的，路由还没解析完时 `route.path` 是
 *    `/`（START_LOCATION）、matched 为空，此时算出来的链是错的，必须跳过。
 *
 * 2) `layout.isCollapse` —— 折叠态下 antd 会把子菜单渲染进悬浮弹层，这时塞
 *    openKeys 会让弹层在页面一打开就自己弹出来。所以折叠时不做，等用户把菜单
 *    展开（isCollapse → false，手机端就是点开抽屉）时本 watch 会再触发一次。
 *
 * 3) **必须延后一个 tick 再放**（`nextTick`）—— 从折叠态切回展开态时，
 *    antdv4 的 Menu 会用它自己缓存的 openKeys **直接覆盖**内部状态：
 *    `node_modules/ant-design-vue/es/menu/src/Menu.js` 的 Restore watch 里是
 *    `mergedOpenKeys.value = inlineCacheOpenKeys.value`，不看受控 prop；
 *    而缓存是一路「vertical 模式下不更新」的，等于空。
 *    同一批更新里我们刚写的值会被它盖掉，且之后 prop 没再变化、Menu 也不会重读 ——
 *    实测表现为「折叠态刷新后点开侧边栏，菜单仍然不展开」。
 *    延后一个 tick，让这次赋值落在它的 Restore 之后，才能真正生效。
 *
 * 4) **移动端每次打开抽屉都要重新定位**（`routeOpenKeys` 直接赋值，不走
 *    `applyRouteOpenKeys` 的「只生效一次」开关）。移动端 `isCollapse` 是「抽屉开合」，
 *    关抽屉时上面那个 watch 会把 openKeys 清空，而 `applyRouteOpenKeys` 第二次调用
 *    是空操作 —— 结果是「开一次抽屉、关掉、再开，菜单全收起，得自己一层层点开」。
 *    更糟的是修好「不清空」之后：抽屉里会留着上一个子菜单的展开态，而当前选中项在
 *    另一个子菜单里（收起状态）⇒ 打开抽屉反而找不到自己在哪。
 *    所以每次打开都按当前路由重新展开一次 —— 这也正是导航抽屉该有的行为。
 *    桌面端不受影响，仍走「只生效一次」。
 *
 * 展开之后还要把选中项滚进可视区，那一步不在这里做（需要等抽屉动画结束），
 * 见 full-menu.vue 的 `@after-open-change`。
 */
watch(
  () => [route.path, route.matched.length, layout.isCollapse] as const,
  ([path, matched, collapsed]) => {
    if (collapsed || !matched) return
    nextTick(() => {
      // 再次确认：这一 tick 内用户可能又把菜单收起来了
      if (layout.isCollapse || !route.matched.length) return
      if (layout.isMobile) {
        openKeys.value = routeOpenKeys(path, menu)
      } else {
        applyRouteOpenKeys(path, menu)
      }
    })
  },
  {immediate: true}
)

console.log('TCL: created -> layout', layout.isCollapse)

const selectedKeys = computed(() => [route.path])

function select(payload: { item: unknown; key: string; selectedKeys: string[] }) {
  const {key} = payload
  const bool = reg.test(key)
  if (bool) {
    window.open(key, '_blank')
  } else {
    router.push(key)
  }
  /*
   * 移动端：点了菜单就把抽屉收起来。
   * ------------------------------------------------------------
   * 抽屉是覆盖式导航（240px 的抽屉盖在 357px 的屏上，右侧只剩一条遮罩），
   * 不收起来的话页面已经在它背后完成了跳转，用户看到的是「点了没反应」，
   * 得再去找那条遮罩点一下 —— 实测点 /workplace 后 hash 已变、`.ant-drawer-open`
   * 仍然在。
   *
   * 放在这里而不是只放在 full-menu 的路由 watch 里，是为了覆盖**外链菜单项**
   * （key 命中 reg 时走 window.open，不会变更 route，路由 watch 收不到）。
   * 桌面端不受影响：那里 isCollapse 是「侧边栏折叠」，点菜单当然不该把它折起来。
   */
  if (layout.isMobile) layout.isCollapse = true
}

function onOpenChange(keys: string[]) {
  console.log('TCL: onOpenChange -> openKeys', keys)
  const latestOpenKey = keys.find((k) => openKeys.value.indexOf(k) === -1)
  console.log('TCL: onOpenChange -> latestOpenKey', latestOpenKey)
  const findIndex = (el: MenuNode) => el.path === (latestOpenKey as string)
  const index = menu.findIndex(findIndex)
  console.log('TCL: onOpenChange -> index', index)
  if (index === -1) {
    openKeys.value = keys
  } else {
    openKeys.value = latestOpenKey ? [latestOpenKey] : []
  }
}

onDeactivated(() => {
  // 原实现中 timer 未赋值，clearTimeout(undefined) 为 no-op，这里保持原行为
})
</script>

<style lang="less">
.artiely-menu {
  .ant-menu-item .anticon,
  .ant-menu-submenu-title .anticon {
    opacity: 0.8;
  }
}

/**
 * 折叠态条目的左右内边距（语义与 antdv1 时代的原样式完全一致）。
 *
 * ⚠️ 原样式把选择器拆成多行、靠「换行 = 后代组合器」连接（只有行内才写逗号）：
 *     .ant-menu-inline-collapsed
 *       > .ant-menu-item-group
 *       > .ant-menu-item-group-list
 *       > .ant-menu-item
 *   迁移期被格式化工具在续行前补了逗号 → 变成 `.ant-menu-inline-collapsed,`
 *   后面跟以 `>` 开头的空选择器。后果有两条，都已实测：
 *     ① 浏览器按无效选择器丢掉**整条**规则 → padding 从未生效，
 *        折叠态里唯一的叶子项图标中心在 x=44，而子菜单标题是 x=40（差 4px）；
 *     ② Vite 8 的 lightningcss 压缩 CSS 时直接 `Invalid empty selector`，
 *        整个 `vite build` 中断。
 *   这里展开写成 4 条单行选择器，语义不变，且不再怕被格式化。
 */
.ant-menu-inline-collapsed > .ant-menu-item,
.ant-menu-inline-collapsed > .ant-menu-item-group > .ant-menu-item-group-list > .ant-menu-item,
.ant-menu-inline-collapsed > .ant-menu-item-group > .ant-menu-item-group-list > .ant-menu-submenu > .ant-menu-submenu-title,
.ant-menu-inline-collapsed > .ant-menu-submenu > .ant-menu-submenu-title {
  padding: 0 1rem !important;
}
</style>

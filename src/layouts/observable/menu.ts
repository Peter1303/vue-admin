import {ref} from 'vue'

/**
 * 侧边菜单：已展开的子菜单 key
 * ------------------------------------------------------------
 * ⚠️ 这个状态必须放在组件外（与 navTabs / layout 同级的 observable），
 *    不能写成 solo-menu 里的组件内 `ref`。
 *
 * 原因：本项目的布局壳是「可被整体重建」的 —— 只要 App.vue 最外层
 * `<router-view>` 渲染的组件类型变了，`<a-config-provider>` 以下的整棵布局树
 * （侧边栏 + Header + router-page）就会销毁重建，solo-menu 作为其中一员，
 * 组件内状态一律归零，而这一层重建从组件内部是看不见的。
 *
 * 已知会触发整树重建的路径：
 *   · 进出 `/level1` —— 它是唯一一条「页面自己用 <v-home> 包布局」的顶层路由
 *     （routes.ts 里没有父级布局 record，router-page 也不参与），
 *     于是 App 层 router-view 在「布局组件 default.vue ↔ 页面组件 level1.vue」
 *     之间切换，两侧类型不同 → 整棵树 unmount + mount。
 *     用户看到的就是「从一级可点击菜单切到别的菜单后，刚展开的子菜单自己收起来了」。
 *   · 小屏/大屏切换（full-menu.vue 的 `<a-drawer v-if>` / `<sider-menu v-else>` 分支切换）。
 *   · 「刷新全部标签」（nav-tabs 的 refreshAll → `layout.appReload` 开关）——
 *     这一条是用户主动触发的，整树重建正是它的语义。
 *
 * 实测（CDP 真实 Chrome 1440×900，fixed + 标签页开，全部用真实点击驱动菜单）：
 *   | 操作                                       | 已展开项 | 布局 created/destroyed |
 *   | /crud 展开「组件使用」→ 点其子项「验证码组件」   | 1 → 1   | 0 / 0                  |
 *   | 点「一级可点击菜单」→ /level1                 | 1 → 0   | 1 / 1  ← 整树被重建     |
 *   | 在 /level1 展开「组件使用」→ 点其子项           | 1 → 0   | 1 / 1  ← 整树被重建     |
 * （DOM 标记法：`.ant-layout-sider` / `.ant-menu` / `#router-view` 上打的标记
 *   在 /level1 往返后全部 MISSING，证明是重挂载而非被“关掉”。）
 *
 * 不做 localStorage 持久化。
 * 折叠菜单时清空展开态的既有行为保持不变，见 solo-menu.vue 里对 layout.isCollapse 的 watch。
 */
export const menuOpenKeys = ref<string[]>([])

/**
 * 菜单树的节点形状（就是 `src/router/modules/routes.ts` 里的路由记录，
 * 只有 path / meta / children 三个字段参与侧边菜单的渲染）
 */
export interface MenuNode {
  path: string
  meta?: {icon?: string; title?: string; hide?: boolean}
  children?: MenuNode[]
}

/**
 * 由路由路径推导出「这条路由对应的子菜单链」
 * ------------------------------------------------------------
 * 菜单的 `:key` 用的就是各节点的 `path`，所以要展开的 key 就是祖先链上
 * 「有 children」的那些节点的 path：
 *   '/captcha'    → ['/widgets-home']
 *   '/api-test1'  → ['/router-home', '/print1']
 *   '/analysis'   → ['/']            （现场管理是顶层首个节点，path 就是 '/'）
 *   '/level1'     → []               （顶层叶子菜单，没有父级可展开）
 * 命中的节点自己也是子菜单（有 children）时把它自己也带上，
 * 这样直接命中 '/user' 这种「父级菜单本身的路径」也能展开。
 *
 * 返回 [] 与「没找到」是两种情况：前者是「找到了但无需展开」，
 * 用 null 表示没找到。
 */
export function routeOpenKeys(path: string, menu: MenuNode[]): string[] {
  if (!path) return []
  const walk = (nodes: MenuNode[], chain: string[]): string[] | null => {
    for (const node of nodes) {
      const hasChildren = !!node.children && node.children.length > 0
      const nextChain = hasChildren ? [...chain, node.path] : chain
      if (node.path === path) return nextChain
      if (hasChildren && node.children) {
        const found = walk(node.children, nextChain)
        if (found) return found
      }
    }
    return null
  }
  return walk(menu, []) || []
}

/**
 * 是否已经按「首次解析出的路由」展开过
 * ------------------------------------------------------------
 * 同样必须放在模块作用域：整棵布局树可能被重建（进出 /level1 等），
 * 组件内的标记会跟着重置，那就会在用户已经手工展开别的菜单之后再被覆盖一次。
 *
 * 只做「一次」而不是「每次路由变化都跟随」是刻意的：
 * 上一次修复要求「从一级可点击菜单切到别的菜单后，之前展开的菜单保持展开」，
 * 若每次跳转都把 openKeys 重置成新路由的祖先链，那条行为会立刻被打回去
 * （例如 /level1 没有父级菜单，一跳过去就会把别人展开的菜单全部收起）。
 * 因此这里只负责「刷新/首次进入时怎么展开」，之后的展开态完全交给用户操作。
 */
let routeOpenKeysApplied = false

/**
 * 按当前路由展开一次子菜单（只生效一次，重复调用无副作用）
 * 返回是否真的执行了。
 */
export function applyRouteOpenKeys(path: string, menu: MenuNode[]): boolean {
  if (routeOpenKeysApplied) return false
  routeOpenKeysApplied = true
  const keys = routeOpenKeys(path, menu)
  if (keys.length) menuOpenKeys.value = keys
  return true
}

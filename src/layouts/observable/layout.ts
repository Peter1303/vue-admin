import {reactive} from 'vue'

/**
 * 布局状态
 * ------------------------------------------------------------
 * `Vue.observable` → `reactive`（Vue 3 的内置响应式 API。
 * 注意 `Vue.observable` 在 Vue 3 里仍存在但已不推荐，直接用 reactive 更清晰）。
 *
 * 新增 primaryColor：原来换肤靠 `window.less.modifyVars()` 在浏览器里重编译 less，
 * antdv 4 是 CSS-in-JS，没有 less.js，`window.less` 是 undefined，
 * 点了会直接 `Cannot read properties of undefined (reading 'modifyVars')`。
 * 现在改为「ConfigProvider token + CSS 变量」两条腿（见 setPrimaryColor）。
 */
export const layout = reactive({
  // 响应式断点设置
  breakPoint: 'lg',
  // 是否小屏
  isMobile: false,
  // 菜单是否折叠
  isCollapse: false,
  // 布局模式 flow fixed
  layoutMode: 'flow',
  // 当前选择的布局
  layoutShap: 'layout1',
  // 是否展示标签页
  isNavTabs: true,
  // 菜单的主题
  menuTheme: 'dark',
  // 默认字体大小(不建议修改)
  fontSize: 16,
  // 菜单折叠的宽度
  collapsedWidth: 80,
  //  菜单的宽度
  menuWidth: 240,
  //  刷新当前页使用
  homeReload: true,
  // 这个应用重置
  appReload: true,
  // 标签页的高度
  // ⚠️ 仅供展示/兼容，**不再参与任何布局计算**。真实高度由 nav-tabs.vue 的 CSS 决定
  //    （卡片/内联 41px、胶囊 35px），而且 layout1 的内容区顶边现在直接等于 Header 盒高，
  //    不再拿这个数去拼 marginTop —— 之前正是用 45 当标签条高度去算，
  //    跟真实的 41 差 4px，才让「顶部间距」在不同布局模式/标签样式下对不齐。
  navTabsHeight: 45,
  // 标签页的样式
  navTabsShap: 'card',
  // 头部的高度
  headerHeight: 64,
  // 菜单收起的动画和时间
  layoutTransition: 'all 0.2s',
  // 主题色（运行时可换肤）
  primaryColor: '#1890ff'
})

/** 各枚举字段的合法取值，用于本地缓存校验 */
const LAYOUT_SHAPS = ['layout1', 'layout2']
const LAYOUT_MODES = ['flow', 'fixed']
const MENU_THEMES = ['dark', 'light']
const NAV_TABS_SHAPS = ['card', 'inline', 'capsule']
const HEX_COLOR = /^#[0-9a-fA-F]{3}$|^#[0-9a-fA-F]{6}$/

/**
 * 从本地缓存恢复布局设置
 * ------------------------------------------------------------
 * ⚠️ 每个字段都必须校验，不能整体 Object.assign ——
 *    缓存里可能残留旧版本或被手工改过的脏值，
 *    比如 `layoutShap: 'bogus'` 会让布局壳的 `<component :is>` 渲染成空白，
 *    表现为「一打开就白屏、且控制台没有报错」，非常难排查。
 */
function restoreFromCache(): void {
  const raw = localStorage.getItem('layout')
  if (!raw) return
  try {
    const cached = JSON.parse(raw) as Record<string, unknown>

    if (typeof cached.isCollapse === 'boolean') layout.isCollapse = cached.isCollapse
    if (LAYOUT_MODES.includes(cached.layoutMode as string)) {
      layout.layoutMode = cached.layoutMode as string
    }
    if (LAYOUT_SHAPS.includes(cached.layoutShap as string)) {
      layout.layoutShap = cached.layoutShap as string
    }
    if (typeof cached.isNavTabs === 'boolean') layout.isNavTabs = cached.isNavTabs
    if (MENU_THEMES.includes(cached.menuTheme as string)) {
      layout.menuTheme = cached.menuTheme as string
    }
    if (NAV_TABS_SHAPS.includes(cached.navTabsShap as string)) {
      layout.navTabsShap = cached.navTabsShap as string
    }
    if (typeof cached.fontSize === 'number' && cached.fontSize > 0) {
      setFontSize(cached.fontSize)
    }
    if (typeof cached.primaryColor === 'string' && HEX_COLOR.test(cached.primaryColor)) {
      setPrimaryColor(cached.primaryColor)
    }
  } catch (e) {
    console.warn('[layout] 本地缓存解析失败，已忽略（将使用默认布局）', e)
  }
}

export function setFontSize(val?: number): void {
  layout.fontSize = val || 16
  layout.collapsedWidth = (80 / 16) * layout.fontSize
  const html = document.querySelector('html')
  if (html) html.style.fontSize = layout.fontSize + 'px'
}

/**
 * 切换主题色
 * ------------------------------------------------------------
 * 1. 写 CSS 变量 → 自有 less 里用 `var(--primary-color, @primary-color)` 的地方会跟随
 * 2. 写 layout.primaryColor → App.vue 的 <a-config-provider :theme="{ token: { colorPrimary } }">
 *    让 antd 组件跟随
 * 3. 缓存到 localStorage（App.vue 里对 layout 做了 deep watch），刷新后仍生效
 */
export function setPrimaryColor(color: string): void {
  if (!HEX_COLOR.test(color)) return
  layout.primaryColor = color
  document.documentElement.style.setProperty('--primary-color', color)
}

export interface MediaQueryApi {
  init(): void

  remove(): void

  outputSize(): void
}

export function mediaQuery(): MediaQueryApi {
  let timer: ReturnType<typeof setTimeout> | null = null

  const outputSize = () => {
    const result1 = window.matchMedia('(min-width:1200px)')
    const result2 = window.matchMedia('(min-width:992px)')
    const result3 = window.matchMedia('(min-width:768px)')
    if (result1.matches) {
      layout.breakPoint = 'lg'
      layout.isMobile = false
    } else if (result2.matches) {
      layout.breakPoint = 'md'
      layout.isMobile = false
    } else if (result3.matches) {
      layout.breakPoint = 'sm'
      layout.isMobile = true
    } else {
      layout.breakPoint = 'xs'
      layout.isMobile = true
    }
  }

  const onResize = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(outputSize, 500)
  }

  return {
    init() {
      outputSize()
      window.addEventListener('resize', onResize, false)
    },
    remove() {
      // 原实现里 remove 时新传了一个「空实现」的匿名函数，
      // removeEventListener 的引用不匹配，监听从未真正解绑；这里修正
      window.removeEventListener('resize', onResize, false)
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    },
    outputSize
  }
}

// 模块加载即恢复缓存（与原实现一致）
restoreFromCache()

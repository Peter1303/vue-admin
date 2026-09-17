import {computed, reactive, ref, watch} from 'vue'
import {generate} from '@ant-design/colors'

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
  primaryColor: '#1890ff',
  // 主题模式：light 浅色 / dark 深色 / auto 跟随系统
  themeMode: 'light'
})

/** 主题模式：浅色 / 深色 / 跟随系统 */
export type ThemeMode = 'light' | 'dark' | 'auto'
/** 真正生效的主题 —— 'auto' 解析之后只剩这两种 */
export type ResolvedTheme = 'light' | 'dark'

/** 各枚举字段的合法取值，用于本地缓存校验 */
const LAYOUT_SHAPS = ['layout1', 'layout2']
const LAYOUT_MODES = ['flow', 'fixed']
const MENU_THEMES = ['dark', 'light']
const NAV_TABS_SHAPS = ['card', 'inline', 'capsule']
const THEME_MODES: ThemeMode[] = ['light', 'dark', 'auto']
/** 系统深色偏好媒体查询 —— 必须是这个字符串，浏览器只认它 */
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'
const HEX_COLOR = /^#[0-9a-fA-F]{3}$|^#[0-9a-fA-F]{6}$/
/** 主题色兜底值，与 `layout.primaryColor` 的初始值一致 */
const FALLBACK_PRIMARY = '#1890ff'

/**
 * 主题色 → antd 的「链接三件套」
 * ------------------------------------------------------------
 * 为什么必须显式下发：antd v4 是 CSS-in-JS，`colorLink` **不从 `colorPrimary` 派生**，
 * 它的来源是一条独立链路 ——
 *
 *     colorLink       = colorInfoText     = infoColors[9] = palette[5]
 *     colorLinkHover  = colorInfoHover    = infoColors[4] = palette[3]
 *     colorLinkActive = colorInfoActive   = infoColors[7] = palette[6]
 *
 * 而 `colorInfo` 是独立的 seed token，默认写死 `#1677ff`。所以只设 `colorPrimary` 时：
 *   主按钮 / 选中态 / 标签下划线 → 跟随主题色 ✅
 *   裸 `<a>`（典型：右上角个人中心 `.ant-dropdown-link` 的用户名+下拉箭头、
 *   表格里的 `<a-button type="link">`）→ 仍是 antd 默认蓝 `#1677ff` ❌
 *
 * 由此还会带出一个更隐蔽的现象：**换主题色后这些链接纹丝不动**，
 * 因为它们跟的是 `colorInfo`，跟 `colorPrimary` 没关系。
 *
 * 取色口径与 antd 内部 `theme/themes/default/colors.js` 的 `generateColorPalettes`
 * 完全一致（palette[5]/[3]/[6] 分别对应 colors[5]/[3]/[6]），
 * 用的是 antd 自己依赖的那个包与算法，所以 hover/active 不会闪出别的色。
 *
 * ⚠️ 不要把 `colorInfo` 本身改成主题色：它还承载 `a-alert type="info"` /
 *    `a-typography-text type="info"` / `.ant-modal-confirm-info` 的**语义色**，
 *    染成品牌色会让「信息提示」和「报错」长得一样。
 */
export function brandLinkTokens(color: string): {
  colorLink: string
  colorLinkHover: string
  colorLinkActive: string
} {
  // generate() 对非法输入**不抛错**，而是返回一串灰阶（#404040、#333…），
  // 一旦静默走到那条分支，链接会变成深灰而不是主题色，所以先自己校验一遍
  const base = HEX_COLOR.test(String(color || '')) ? color : FALLBACK_PRIMARY
  const palette = generate(base)
  if (!palette || palette.length < 7) {
    const fallback = generate(FALLBACK_PRIMARY)
    return {colorLink: fallback[5], colorLinkHover: fallback[3], colorLinkActive: fallback[6]}
  }
  return {colorLink: palette[5], colorLinkHover: palette[3], colorLinkActive: palette[6]}
}

/**
 * 主题模式（浅色 / 深色 / 自动）
 * ============================================================
 * 一套主题要同时管两条腿，缺一条就会出现「只深了一半」：
 *
 *   ① antd 组件 —— 靠 App.vue 的 <a-config-provider :theme="{ algorithm }">
 *      下发 darkAlgorithm；antd 4 是 CSS-in-JS，所有组件颜色由它重新算一遍。
 *   ② 自有 less —— 编译期常量换不了，只能走 CSS 变量：
 *      html[data-theme='dark'] 下的令牌覆盖写在 assets/styles/theme-runtime.less。
 *
 * 所以这里只负责「把解析结果写到 <html> 上」，颜色本身两边各自负责。
 *
 * ⚠️ 为什么是 `<html>` 上的 `data-theme` 而不是 body 上的 class：
 *    ① 首屏要防白闪，而 index.html 里的预置脚本在 <head> 里执行，
 *       此时 `<body>` 还不存在，只有 `<html>` 可以立刻写属性；
 *    ② 弹层（Modal / Drawer / Dropdown）teleport 到 body 下，
 *       但它们依然是 `html` 的后代，`html[data-theme='dark'] ...` 照样命中；
 *       而 `#app` 那一套前缀就盖不到弹层（见 mobile.less 的说明）。
 *
 * ⚠️ 同时写 `colorScheme`：它管的是**浏览器原生部分** ——
 *    滚动条、`<input>`/`<textarea>` 的默认外观、日期选择器的弹层、
 *    以及 Chrome 的自动填充底色。只改 antd 不改它的话，
 *    深色下输入框被自动填充会闪出「白底黑字」。
 */
const darkMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  ? window.matchMedia(DARK_MEDIA_QUERY)
  : null

/**
 * 系统当前是否偏好深色
 * 单独用 ref 存一份，是为了让 'auto' 模式下的联动也能被 Vue 追踪到
 * （直接读 matchMedia().matches 不是响应式的，改变了也不会重算）
 */
const systemDark = ref(darkMedia ? darkMedia.matches : false)

/**
 * 真正生效的主题
 * 单独导出、不塞进 `layout`，原因有两条：
 *   1. 它是个派生态，不该被 App.vue 对 layout 的 deep watch 写进 localStorage；
 *   2. 'auto' 的值来自系统偏好，和 layout 里那些「用户显式选择」的字段不是一类东西。
 */
export const resolvedTheme = computed<ResolvedTheme>(() => {
  if (layout.themeMode === 'auto') return systemDark.value ? 'dark' : 'light'
  // 显式比较而不是直接 `return layout.themeMode`：
  // ① `layout.themeMode` 的类型是 string（reactive 对象里的字面量会被放宽），需要收窄；
  // ② 顺带兜住被手工改坏的缓存值 —— 任何非 'dark' 的值都按浅色处理
  return layout.themeMode === 'dark' ? 'dark' : 'light'
})

/** 把当前主题写到 <html>（data-theme + color-scheme），CSS 与原生控件据此切换 */
export function applyTheme(): void {
  const theme = resolvedTheme.value
  const html = document.documentElement
  html.setAttribute('data-theme', theme)
  html.style.colorScheme = theme
}

/**
 * 切换主题模式（唯一写入口，带白名单校验）
 * 只改 `layout.themeMode` —— 真正落地由下面那个对 resolvedTheme 的 watch 完成，
 * 这样「用户切换」和「系统偏好变化」两条路径共用同一段落盘逻辑。
 */
export function setThemeMode(mode: ThemeMode): void {
  if (!THEME_MODES.includes(mode)) return
  layout.themeMode = mode
}

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
    if (THEME_MODES.includes(cached.themeMode as ThemeMode)) {
      layout.themeMode = cached.themeMode as ThemeMode
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
 * 2. 写 layout.primaryColor → App.vue 的 <a-config-provider :theme> 让 antd 组件跟随
 *    （主题对象由 brandLinkTokens() 补齐 colorLink 三件套，否则裸 `<a>`
 *      —— 典型是右上角个人中心的用户名 —— 会停在 antd 默认蓝 `#1677ff`）
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

/**
 * 系统偏好在 'auto' 模式下变化时跟着切
 * 非 auto 模式不必额外处理：resolvedTheme 不依赖 systemDark，watch 不会触发；
 * 但 systemDark 仍然会被更新，等用户切回 auto 时立刻就是正确的值。
 */
darkMedia?.addEventListener('change', (e) => {
  systemDark.value = e.matches
})

/**
 * 主题落盘
 * ① 先显式跑一次：index.html 的预置脚本已按缓存写过一次 data-theme，
 *    这里是「事实来源」的校正 —— 缓存缺失、被手工改坏、脚本被禁都能兜住；
 * ② `flush: 'sync'` 是刻意的：默认的 pre 要等微任务才改 data-theme，
 *    而 antd 的 CSS-in-JS 在同一轮渲染里就换了算法，两者错开会出现一帧
 *    「深色组件 + 浅色页面底」，肉眼能看见闪一下。
 */
applyTheme()
watch(resolvedTheme, applyTheme, {flush: 'sync'})

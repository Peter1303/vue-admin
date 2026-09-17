<template>
  <div class="fr header-right">
    <!--
      ⚠️ 移动端顶栏的空间账（实测，349px 视口 / layout1）：
         trigger（汉堡）占 44px，右区可用 ≈ 305px；而桌面右区实测 487.81px（1440 视口）
         —— 8 个功能按钮各 42px（图标 22 + 内边距 10×2）+ 用户名 52px + 两条竖分隔线，
         是可用宽度的 1.6 倍，塞不下。

      所以分两档渲染，**不靠魔法断点硬塞**：
        · 桌面（≥768px）：8 个图标 + 用户名，原样平铺
        · 移动（<768px）：4 个高频功能平铺 +「更多」popover 收走其余 3 个
          （代办事项 / 全屏 / 锁屏），分隔线之后是主题三项（浅色 / 深色 / 自动）；
          用户名文字隐藏、只留头像 —— 那 52px 换 1.5 个图标更值
      这样 320px→767px 全部适用，**不需要「超窄屏再压一档」那种补丁**，
      而且 8 个功能在移动端一个都不少（原先有 6 个被 hidden-xs-only 直接藏掉、完全不可达）。
      主题切换按钮同样带 `hidden-xs-only`（被隐藏时宽度为 0，移动端空间账不变），
      而那三项在「更多」里都在 —— 移动端不丢功能。

      ⚠️ 两个「空格坑」（踩过，会让桌面端整条右区位移）：
         ① 用户名两端的空格**必须写在 span 里面**：Vue 模板编译默认 `whitespace: 'condense'`，
            两个元素之间、且含换行的空白节点会被**整段删除**。写成
            `</a-badge> <span>Artiely</span> <a-icon/>` 会丢掉前后两个空格 ——
            桌面端整条右区窄 6.3px、里面所有图标连带左移（实测 445.8 → 439.5）。
         ② **别在这条右区里随手加注释**：注释同样是节点，夹在两个元素之间会让周围空白节点
            不再被 condense 掉，凭空多出空格把右区挤宽。注释只放在「第一个元素之前」的行首位置
            （行首空白会被浏览器丢弃）。
    -->
    <v-button tip="点击新增一个订单">
      <a-icon type="search"/>
    </v-button>
    <v-button tip="查看今日订单">
      <a-iconfont type="icon-commodity"/>
    </v-button>
    <v-button tip="查看今日营业额">
      <a-iconfont type="icon-financial_fill"/>
    </v-button>
    <v-button tip="预约消息">
      <a-iconfont type="icon-wangwang"/>
    </v-button>
    <v-button class="hidden-xs-only" tip="代办事项">
      <a-iconfont type="icon-time"/>
    </v-button>
    <v-button class="hidden-xs-only" :tip="screen?'退出全屏':'全屏'" @click="toggleScreen">
      <a-iconfont :type="screen?'icon-smallscreen':'icon-send'"/>
    </v-button>
    <v-button class="hidden-xs-only" tip="锁屏" @click="router.push('/lock')">
      <a-iconfont type="icon-lock"/>
    </v-button>
    <a-dropdown overlay-class-name="header-theme-menu" placement="bottomRight" trigger="click">
      <v-button class="hidden-xs-only" :tip="themeTip">
        <theme-icon :mode="themeMode"/>
      </v-button>
      <template #overlay>
        <a-menu :selected-keys="[layout.themeMode]" @click="handleMenuClick">
          <a-menu-item key="light">
            <theme-icon mode="light"/>
            <span>浅色</span>
          </a-menu-item>
          <a-menu-item key="dark">
            <theme-icon mode="dark"/>
            <span>深色</span>
          </a-menu-item>
          <a-menu-item key="auto">
            <theme-icon mode="auto"/>
            <span>自动（跟随系统）</span>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>

    <!--
      移动端「更多」：把上面 3 个低频功能收进 popover（与右上角头像下拉同一套交互）。
      只在 <768px 出现（`hidden-sm-and-up` = 仅小屏可见），桌面端它 display:none，
      7 个图标照旧平铺 —— 桌面布局零影响。
      `trigger="click"`：触屏上 hover 触发的浮层容易「点开又被下一次触摸关掉」，
      这里显式用 click。该按钮只存在于移动端，不会改变桌面交互。
    -->
    <a-dropdown overlay-class-name="header-more-menu" placement="bottomRight" trigger="click">
      <v-button class="hidden-sm-and-up" tip="更多功能">
        <a-icon type="more"/>
      </v-button>
      <template #overlay>
        <a-menu :selected-keys="[layout.themeMode]" @click="handleMenuClick">
          <a-menu-item key="todo" @click="router.push('/todo')">
            <a-iconfont type="icon-time"/>
            <span>代办事项</span>
          </a-menu-item>
          <a-menu-item key="screen" @click="toggleScreen">
            <a-iconfont :type="screen?'icon-smallscreen':'icon-send'"/>
            <span>{{ screen?'退出全屏':'全屏' }}</span>
          </a-menu-item>
          <a-menu-item key="lock" @click="router.push('/lock')">
            <a-iconfont type="icon-lock"/>
            <span>锁屏</span>
          </a-menu-item>
          <a-menu-divider/>
          <a-menu-item key="light">
            <theme-icon mode="light"/>
            <span>浅色</span>
          </a-menu-item>
          <a-menu-item key="dark">
            <theme-icon mode="dark"/>
            <span>深色</span>
          </a-menu-item>
          <a-menu-item key="auto">
            <theme-icon mode="auto"/>
            <span>自动（跟随系统）</span>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>

    <a-divider class="hidden-xs-only" type="vertical"/>
    <a-dropdown>
      <a class="ant-dropdown-link" href="#">
        <a-badge :count="99">
          <a-avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>
        </a-badge>
        <span class="hidden-xs-only"> Artiely </span>
        <a-icon type="down"/>
      </a>
      <template #overlay>
        <a-menu>
          <a-menu-item key="-1">
            <a href="javascript:;" rel="noopener noreferrer" @click="router.push('/userinfo')">个人中心</a>
          </a-menu-item>
          <a-menu-item key="0">
            <a href="javascript:;" rel="noopener noreferrer" @click="router.push('/todo')">代办事项</a>
          </a-menu-item>
          <a-menu-item key="1">
            <a
              href="javascript:;"
              rel="noopener noreferrer"
              @click="router.push('/handler-over')"
            >交班下班</a>
          </a-menu-item>
          <a-menu-divider/>
          <a-menu-item key="2">
            <a href="javascript:;" rel="noopener noreferrer" @click="router.replace('/login')">退出登录</a>
          </a-menu-item>
          <a-menu-divider/>
          <a-menu-item key="3" disabled>切换店铺</a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
    <a-divider class="hidden-xs-only" type="vertical"/>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue'
import {useRouter} from 'vue-router'
import {message} from 'ant-design-vue'
import ThemeIcon from './theme-icon.vue'
import {layout, resolvedTheme, setThemeMode} from '@layouts'
import type {ThemeMode} from '@layouts'

const router = useRouter()
const screen = ref(false)

/*
 * 主题模式快捷开关（桌面平铺一个下拉，移动端收进上面那个「更多」菜单）
 * ------------------------------------------------------------
 * · 数值来源只有一个：layouts/observable/layout.ts 的 layout.themeMode。
 *   这里既不做本地副本、也不缓存 —— 所以本组件和右侧悬浮的「布局设置」抽屉
 *   天然同源同步，两处来回点不会各说各话。
 * · 三项菜单的 :selected-keys 直接用 themeMode，'light'/'dark'/'auto' 正好是
 *   合法 key；「更多」菜单里混着 todo/screen/lock，它们不在这个集合里所以不受影响。
 * · 写值统一走 setThemeMode()（内部有白名单校验），不直接改 layout.themeMode。
 */
const THEME_KEYS = ['light', 'dark', 'auto']

/**
 * `layout.themeMode` 在 store 里是宽 `string`（`reactive({...})` 没标类型，
 * 同类字段还有 layoutShap / menuTheme 等），而 theme-icon 的 `mode` 要收窄的 ThemeMode。
 * 边界上收窄一次即可 —— 与 more-group.vue 里 `as ThemeMode` 的做法一致。
 */
const themeMode = computed(() => layout.themeMode as ThemeMode)

/** 悬浮提示里带上「自动模式下当前实际生效的是深还是浅」，免得用户以为按钮没反应 */
const themeTip = computed(() => {
  const effective = resolvedTheme.value === 'dark' ? '深色' : '浅色'
  return layout.themeMode === 'auto' ? `主题：自动（当前${effective}）` : `主题：${effective}`
})

/**
 * 菜单点击统一入口。
 * 只认主题三个 key，其余（todo / screen / lock）直接忽略 ——
 * 那几个项各自还挂着自己的 @click，不会被这里重复触发。
 */
function handleMenuClick(e: { key: string | number }) {
  const key = String(e.key)
  if (THEME_KEYS.includes(key)) {
    setThemeMode(key as ThemeMode)
  }
}

function toggleScreen() {
  if (!screen.value) {
    const docElm = document.documentElement
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen()
    } else if ((docElm as HTMLElement & { mozRequestFullScreen?: () => void }).mozRequestFullScreen) {
      (docElm as HTMLElement & { mozRequestFullScreen?: () => void }).mozRequestFullScreen!()
    } else if ((docElm as HTMLElement & { webkitRequestFullScreen?: () => void }).webkitRequestFullScreen) {
      (docElm as HTMLElement & { webkitRequestFullScreen?: () => void }).webkitRequestFullScreen!()
    } else if ((docElm as HTMLElement & { msRequestFullscreen?: () => void }).msRequestFullscreen) {
      (docElm as HTMLElement & { msRequestFullscreen?: () => void }).msRequestFullscreen!()
    } else {
      message.error({
        content: '除了让你升级浏览器对方没什么好说的！',
        duration: 3
      })
    }
    screen.value = true
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if ((document as Document & { mozCancelFullScreen?: () => void }).mozCancelFullScreen) {
      (document as Document & { mozCancelFullScreen?: () => void }).mozCancelFullScreen!()
    } else if ((document as Document & { webkitCancelFullScreen?: () => void }).webkitCancelFullScreen) {
      (document as Document & { webkitCancelFullScreen?: () => void }).webkitCancelFullScreen!()
    } else if ((document as Document & { msExitFullscreen?: () => void }).msExitFullscreen) {
      (document as Document & { msExitFullscreen?: () => void }).msExitFullscreen!()
    } else {
      message.error({
        content: '请升级浏览器，不然我是不会理你的！',
        duration: 3
      })
    }
    screen.value = false
  }
}
</script>

<style scoped>
.header-right {
  height: 64px;
  overflow: hidden;
  padding-right: 20px;
}

/*
 * 移动端（<768px）：4 个高频功能平铺 +「更多」popover 收走其余 3 个
 * ============================================================
 * 症状：移动端顶栏只剩 1 个图标（预约消息），搜索/订单/营业额/代办/全屏/锁屏全不见了。
 *
 * 空间账（349px 视口，layout1，实测）：右区可用 ≈ 305px，而要平铺 7 个图标 + 用户名
 * 需要 ~530px。这里**不做「把 7 个硬挤进去」的尝试**，而是：
 *   · 只平铺 4 个（搜索 / 今日订单 / 今日营业额 / 预约消息）
 *   · 其余 3 个（代办事项 / 全屏 / 锁屏）收进「更多」popover（模板里的 a-dropdown）
 *   · 按钮内边距 10px → 6px（42 → 34px/个），用户名文字隐藏、竖分隔线隐藏
 * 实测右区 248px：320px 视口（可用 268px）也放得下，**因此不需要任何超窄屏补丁档**。
 *
 * 同时把 `display` 改成 flex，不是为了好看，是为了**不再被静默裁掉**：
 *   右区是 `float: right`，box 宽 = shrink-to-fit；一旦内容放不下，**float 会换行**，
 *   而 `.header-right { height: 64px; overflow: hidden }` 会把换行出来的第二行整行裁掉 ——
 *   表现就是「图标莫名其妙不见了」。flex 默认 `flex-wrap: nowrap`，宁可横向溢出也不换行。
 *   （`flex: none` 保证按钮不被压缩变形；`align-items: center` 让 32→40px 的按钮仍然垂直居中，
 *     不碰 Header 盒高 —— Header 盒高是「顶部间距一致」的地基，见 layout1.vue 的说明。）
 *
 * ⚠️ 覆盖 v-button 必须加 `:deep()` —— `v-button` 的模板根是 `<a-tooltip>`（又一个组件），
 *    父组件的 scoped 属性**落不到它最终渲染出的那个 `<a>` 上**：写
 *    `.header-right .artiely-button` 会被编译成 `.artiely-button[data-v-x]`，永远匹配不到 ——
 *    实测「按钮仍是 42×32、内边距纹丝不动」，而同一段里的 `display: flex` 却生效了，
 *    表现为「一半生效」，极易误判成已经改好。
 */
@media only screen and (max-width: 767px) {
  .header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    padding-right: 8px;
  }

  .header-right :deep(.artiely-button) {
    flex: none;
    height: 40px;
    /* Button.vue 里带 !important，这里必须同权才能覆盖 */
    line-height: 40px !important;
    padding: 0 6px;
  }

  /* 原来靠竖分隔线分隔「图标区 / 账号区」，移动端改为一道间距 */
  .header-right :deep(.ant-dropdown-link) {
    margin-left: 6px;
  }
}
</style>

<!--
  两个浮层菜单的样式：antd 把浮层渲染到 body 下的 portal，**不在本组件的 DOM 子树里**，
  scoped 样式对它无效，所以单独写一个非 scoped 块，并用 overlay-class-name 限定的类名兜住范围。

  `header-theme-menu` 与 `header-more-menu` 共用一份：同样的三项（浅色/深色/自动）
  在移动端「更多」里是 16px，桌面下拉里默认只有 14px —— 两处不一致看着就是没对齐，
  这里统一成 16px。图标本身由 theme-icon.vue 负责几何，字号只决定它的整体大小。
-->
<style lang="less">
.header-more-menu,
.header-theme-menu {
  .ant-dropdown-menu-item {
    .anticon {
      margin-right: 8px;
      font-size: 16px;
    }
  }
}
</style>

<template>
  <div class="fr header-right">
    <!--
      ⚠️ 移动端顶栏的空间账（实测，349px 视口 / layout1）：
         trigger（汉堡）占 44px，右区可用 ≈ 305px；而桌面 7 个功能按钮就要 446px
         （每个 42px = 图标 22 + 内边距 10×2），再加用户名 52px、两条竖分隔线各 17px
         —— 全平铺需要 ~530px，是可用宽度的 1.7 倍，塞不下。

      所以分两档渲染，**不靠魔法断点硬塞**：
        · 桌面（≥768px）：7 个图标 + 用户名，原样平铺
        · 移动（<768px）：4 个高频功能平铺 +「更多」popover 收走其余 3 个
          （代办事项 / 全屏 / 锁屏）；用户名文字隐藏、只留头像 —— 那 52px 换 1.5 个图标更值
      这样 320px→767px 全部适用，**不需要「超窄屏再压一档」那种补丁**，
      而且 7 个功能在移动端一个都不少（原先有 6 个被 hidden-xs-only 直接藏掉、完全不可达）。

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
        <a-menu>
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
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {message} from 'ant-design-vue'

const router = useRouter()
const screen = ref(false)

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
  「更多」popover 的浮层内容：antd 把浮层渲染到 body 下的 portal，**不在本组件的 DOM 子树里**，
  scoped 样式对它无效，所以单独写一个非 scoped 块，并用 overlay-class-name 限定的类名兜住范围。
-->
<style lang="less">
.header-more-menu {
  .ant-dropdown-menu-item {
    .anticon {
      margin-right: 8px;
      font-size: 16px;
    }
  }
}
</style>

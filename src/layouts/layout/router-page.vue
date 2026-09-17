<template>
  <!--
    ⚠️ 这里的 24px 必须落在**真实元素**上，不能继续写在 `<router-view>` 的属性里。

    原写法（Vue2 版一直如此，迁移时原样保留）：
      <router-view id="router-view" :style="{ padding: '24px', minHeight: '360px' }" />
    单根组件的根元素会「属性透传」接收上面这些属性 —— Vue 2 与 Vue 3 在这点上行为一致，
    于是这 24px 变成**页面自己的内边距**，而不是「页面之上的一段留白」。

    后果是静默的、且只出现在**部分路由**上：
      · 根元素是卡片的页面（/crud /error /success /todo /calendar /help /filter /iconbox
        /avatar-group /mask /userinfo /captcha /directive /antd-table-creater{,2} …）：
        卡片的盒子被顶到内容区顶边。固定布局下内容区顶边是 109px、而 Header 视觉底边是
        105px —— 卡片圆角/上边框只剩 4px 余量（而根元素是普通 div 的页面视觉上是 28px），
        看上去就是「这几页顶部贴住了标签条」。
        同一批页面的卡片也因为内边距进了卡片内部，左右各少 24px 缩进 → 比别的页面宽 48px。
      · 另外它还顺手把页面根自己的样式压掉了（如 analysis.vue 根的 `padding: 10px` 被吃成 24px），
        并给每个页面根注入 `min-height: 360px` 与 `id="router-view"`。

    改成显式包一层之后：24px 成为页面之上的留白，页面根的盒子（连同它自己的边框/背景）
    整体下移 24px —— 卡片类页面的卡片圆角从 109px 落到 133px，与其它页面的 28px 留白一致；
    卡片内部的第一行内容随之下移同样距离（这 24px 原本就该在卡片外面，只是以前被吃进了卡片内部）；
    左右缩进同时恢复成与其它页面一致的 24px（卡片宽度因此收窄 48px）。

    注：这是老模板（Vue 2）就有的写法 —— Vue 2 同样会把非 prop 属性透传到单根组件上，
    所以基线版本里卡片类页面也是「顶边 109px / 左右宽 48px」。属继承下来的缺陷，不是迁移引入的。
  -->
  <div id="router-view" class="router-page">
    <transition
      mode="out-in"
      name="slide-fade"
    >
      <keep-alive>
        <router-view v-if="layout.homeReload"/>
      </keep-alive>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import {layout} from '@layouts'
</script>

<style lang="less" scoped>
#router-view {
  position: relative;
  // transform: translate3d(0,0,0);
  transform-style: preserve-3d;
  backface-visibility: hidden;
  /*
   * 单位不能省。老模板写的是 `perspective: 1000`（无单位），它是**无效声明** ——
   * Chrome / Firefox 都会把整条丢掉，这个值从未真正生效过。
   *
   * 它之所以看起来"有在跑"，纯属 autoprefixer 的副产物：autoprefixer 会补一条
   * `-webkit-perspective: 1000`，而 Blink 对这条遗留前缀属性网开一面、把无单位数字
   * 当 px 收下（实测：`perspective:1000` → computed none；`-webkit-perspective:1000` → 1000px）。
   * 于是透视一直被按 1000px 渲染 —— 但走的是「前缀属性的兼容怪癖」这条路。
   *
   * 补上 px：标准属性与 webkit 兜底都合法，computed 仍是 1000px（页面内无 3D 变换元素，
   * 视觉零变化），不再依赖怪癖，WebStorm 的 `Mismatched property value` 告警一并消失。
   * 注：会经 postcss-pxtorem(rootValue:16) 换算成 62.5rem，与 index.html 的 html{font-size:16px} 相乘仍是 1000px。
   */
  perspective: 1000px;
  // 页面四周的留白（原先是透传到页面根上的内边距）
  padding: 24px;
  min-height: 360px;
}

.slide-fade-enter {
  // transform: translate3d(0, -100px, 0);
}

.slide-fade-enter-active {
  // transform: translate3d(0, 40px, 0);
  // transition: transform 0.2s cubic-bezier(0.1, 0.88, 0.45, 0.94);
}

.slide-fade-leave {
  // transform: translate3d(0, 0, 0);
}

.slide-fade-leave-active {
  // transform: translate3d(0, 0, 0);
}
</style>

<template>
  <div class="logo">
    <img :src="logoUrl" alt="logo">
    <h1 class="logo-text textover1">{{ logoText }}</h1>
  </div>
</template>

<script lang="ts" setup>
import logoDefault from '@/assets/img/logo.svg'

defineOptions({name: 'v-logo'})

const props = withDefaults(
  defineProps<{
    logoUrl?: string
    logoText?: string
  }>(),
  {
    logoUrl: logoDefault,
    logoText: 'Ant Desgin Pro'
  }
)
</script>

<style lang="less">
@import "@/assets/styles/var.less";

.logo {
  height: 32px;
  margin: 16px;
  text-align: center;
  transition: all .3s;
  overflow: hidden;
  user-select: none;

  .logo-text {
    width: 160px;
    /*
     * ⚠️ line-height 必须显式写死，不能靠继承。
     *
     * 字体 Artiely 的 em 盒实测是 27px（canvas 度量 ascent 21 + descent 6），
     * 而这里继承到的行高只有 1.15 —— 来自 normalize 的 `html{line-height:1.15}`：
     * antd 1 的 reset 曾在 body 上再写一层 `line-height:1.5` 把它覆盖掉
     * （老产物 CSS 可查：`body{margin:0;font-family:...;font-size:.875rem;
     * font-variant:tabular-nums;line-height:1.5;color:rgba(0,0,0,.65);...}`），
     * antdv 4 的 reset 不再设置 body 行高，于是行盒缩到 20×1.15 = 23px < em 盒 27px。
     *
     * 本元素带 .textover1（overflow:hidden，用于长文案出省略号），
     * 行盒装不下的那 2px 会被直接裁掉 —— 表现就是 g / y 的降部被切平。
     * 实测裁切前：h1 盒 20.5→43.5，而 g 的降部要到 45.5，正好切掉 2px。
     *
     * 1.5 与原版 antd 1 的计算值一致（30px ≥ 27px 有余量，字体加载失败
     * 退回系统字体时也不会再切），且基线位置仍是 39.5，视觉位置不变。
     */
    line-height: 1.5;
  }

  img {
    width: 32px;
  }

  h1 {
    display: inline-block;
    margin: 0 0 0 12px;
    color: var(--primary-color, @primary-color);
    font-size: 20px;
    vertical-align: middle;
  }
}
</style>

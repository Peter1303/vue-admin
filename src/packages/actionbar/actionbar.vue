<template>
  <div>
    <lazy-render :time="500" immediately maskClass="action-box2" tip="loading">
      <div class="action-box clearfix">
        <slot/>
        <div class="fr">
          <slot name="right"/>
        </div>
      </div>
    </lazy-render>
  </div>
</template>

<script lang="ts" setup>
import {layout} from '@layouts'

defineOptions({name: 'v-actionbar'})
</script>

<style lang="less">
@import "@/assets/styles/var.less";

/*
 * ⚠️ 这里**不能**写 `fade(@component-background, 90%)`。
 *    less 的 fade() 在**构建期**求值 ⇒ 编译成死的 `rgba(255,255,255,.9)`，
 *    深色模式下这就是一条糊在页面顶部的白色横条（handler-over / 接口管理页最明显）。
 *    改走运行时令牌 + color-mix，浅色下取值与原来完全相同（仍是 90% 白，观感零变化），
 *    深色下自动变成 90% 的 #141414。
 */
.action-box {
  background: color-mix(in srgb, var(--component-background, @component-background) 90%, transparent);
  padding: 10px;
  box-shadow: 0 4px 3px -3px rgba(10, 10, 10, 0.1);
  position: relative;
  z-index: 100;
  border-radius: 4px;
  height: 100%;
  width: 100%
}

.action-box2 {
  background: color-mix(in srgb, var(--component-background, @component-background) 90%, transparent);
  box-shadow: 0 4px 3px -3px rgba(10, 10, 10, 0.1);
  height: 56px;
  width: 100%;
  padding: 10px;
  border-radius: 4px;
}
</style>

<template>
  <exception-page type="600"/>
</template>

<script lang="ts" setup>
import ExceptionPage from './ExceptionPage.vue'

/*
 * 路由配置错误页（/600）。
 *
 * 这里原来是自己写的一套 h1 + p + 一张 50% 宽的照片：左对齐、标题 24px、按钮直接塞在
 * 段落文字中间，和 403/404/500 那套「居中插画 + 大号状态码 + 描述 + 按钮」不是一套设计。
 * 现在和 e403 / e404 / e500.vue 一样只当壳、共用 ExceptionPage，
 * 图片与文案登记在 type.ts 的 600 里。
 *
 * 组件名保持 router-error 不变：`core/loader.ts` 在「路径解析不到页面」与「动态 import 失败」
 * 两种情况下都会回退渲染这个文件，`components.d.ts` / `web-types.json` 也按这个名字登记。
 */
defineOptions({name: 'router-error'})
</script>

<style scoped>
</style>

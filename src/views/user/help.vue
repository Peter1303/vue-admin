<template>
  <a-card>
    <!-- FIXME:这个组件太大 暂不使用 -->
  </a-card>
</template>

<script lang="ts" setup>
import markdown from '../../../README.md?raw'
import 'highlight.js/styles/github.css'

// 原 vue-markdown 渲染被注释禁用（组件太大），markdown 原文先保留在 msg 上以备后续启用。
const msg = markdown
</script>

<style scoped>
</style>

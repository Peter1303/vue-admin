<template>
  <div class="scrollbar">
    <VuePerfectScrollbar
      v-once
      :settings="settings"
      class="scroll-area"
      @ps-scroll-y="scrollHandle"
    >
      <div height="720" width="1280">
        <h1 v-for="i in 100" :key="i">{{ i }}</h1>
      </div>
    </VuePerfectScrollbar>
  </div>
</template>
<script lang="ts" setup>
import {ref} from 'vue'

// 原 vue-perfect-scrollbar 已替换为自研 shim，并以全局名 <VuePerfectScrollbar> 注册，模板无需改动、无需 import。

defineOptions({name: 'scrollbar'})

const settings = ref({
  maxScrollbarLength: 60
})

function scrollHandle(evt: any) {
}
</script>
<style lang="less" scoped>
.scrollbar {
  .scroll-area {
    position: relative;
    margin: auto;
    width: 400px;
    height: 300px;
    background: #eee;
  }

}
</style>

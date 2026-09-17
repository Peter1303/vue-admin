<template>
  <div>
    <vue-easy-print ref="easyPrint" table-show>
      <div>
        <p>葫芦娃，葫芦娃</p>
        <p>一根藤上七朵花</p>
        <p>小小树藤是我家 啦啦啦啦</p>
        <p>啦啦啦啦</p>
        <p>...</p>
      </div>
    </vue-easy-print>
    <a-button @click="print">打印</a-button>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import vueEasyPrint from 'vue-easy-print'

const easyPrint = ref<{ print: () => void } | null>(null)

function print() {
  easyPrint.value?.print()
}
</script>

<style>
</style>

<template>
  <v-card>
    <a-alert description="用于菜单管理等需要使用图标的场景" message="图标组件" show-icon type="info"/>
    <a-divider>默认（根据所选属性自动复制到剪贴板）</a-divider>
    <v-iconbox/>
    <a-divider>获取选择的值</a-divider>
    {{ icon }}
    <v-iconbox v-model="icon"/>
    <a-divider>指定选择类型</a-divider>
    <v-iconbox v-model="icon" select-type="name"/>

    <a-divider>自定义输入框</a-divider>
    <v-iconbox v-model="icon" select-type="name">
      <a-button>选择的内容是{{ icon }}</a-button>
    </v-iconbox>
  </v-card>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

const icon = ref('')
</script>

<style>
</style>

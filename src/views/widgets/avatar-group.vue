<template>
  <v-card>
    <a-alert description="用于展示多个用户的使用场景" message="头像组" showIcon type="info"></a-alert>
    <a-divider>默认</a-divider>
    <v-avatar-group :avatar-list="list1"></v-avatar-group>
    <a-divider>设置最大显示</a-divider>
    <v-avatar-group :avatar-list="list1" maxlength="4"></v-avatar-group>
    <a-divider>设置尺寸</a-divider>
    <v-avatar-group :avatar-list="list1" :size="64" maxlength="4"></v-avatar-group>
    123
  </v-card>
</template>

<script lang="ts" setup>
const list1 = [
  {
    url: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    label: '头像提示1'
  },
  {
    url: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    label: '头像提示2'
  },
  {
    url: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    label: '头像提示3'
  },
  {
    url: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    label: '头像提示4'
  },
  {
    url: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    label: '头像提示5'
  },
  {
    url: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    label: '头像提示6'
  }
]
</script>

<style>

</style>

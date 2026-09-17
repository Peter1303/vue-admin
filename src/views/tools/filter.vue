<template>
  <v-card>
    <p>
      手机号码格式化
      <br>
      {{ telFormat(tel) }}
    </p>
    <p>
      数据脱敏<br>
      {{ telFormat(tel, true) }}
    </p>
    <p>
      车牌格式化
      <br>{{ carIdFormat('粤A00000') }}
    </p>
  </v-card>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import {carIdFormat, telFormat} from '@/common/filter'

const tel = ref('18999999999')
</script>

<style>
</style>

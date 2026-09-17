<template>
  <div>
    <v-card>
      <a-alert description="用于发票等使用金额场景"
               message="金额组件"
               showIcon
               type="info"></a-alert>
      <a-divider>转大写</a-divider>
      <v-amount
        :value="1234"
        is-capital
      ></v-amount>
      <a-divider>千分符</a-divider>
      <v-amount
        :value="1234"
        separator=","
      ></v-amount>
      <a-divider>小数精度</a-divider>
      <v-amount :precision="3" :value="1234.125"></v-amount>
      <p>

        <a-divider>四舍五入</a-divider>
        <v-amount :value="1234.125"></v-amount>
      </p>
      <p>
        <a-divider>不四舍五入</a-divider>
        <v-amount :is-round-up="false" :value="1234.123"></v-amount>
        <br>
        <a-divider>动画</a-divider>
        <v-amount
          :duration="800"
          :value="value"
          transition
        ></v-amount>
        <a-button @click="value = value + 100">数字改变动画</a-button>
      </p>
      <a-divider>货币符号</a-divider>
      <v-amount :value="1234.123" prefix="¥"></v-amount>
      <a-divider>货币符号大小</a-divider>
      <v-amount :prefix-size="0.5" :value="1234.123" prefix="¥"></v-amount>
      <a-divider>后缀</a-divider>
      <v-amount :value="1234.123" suffix="元"></v-amount>
      <a-divider>后缀大小</a-divider>
      <v-amount :suffix-size="0.7" :value="1234.123" suffix="元"></v-amount>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

const value = ref(1000)
</script>

<style>

</style>

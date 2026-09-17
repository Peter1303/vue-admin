<template>
  <div>
    <v-card>
      <a-alert description="用于验证码及密码输入"
               message="验证码组件"
               showIcon
               type="info"></a-alert>
      <a-divider>掩码输入</a-divider>
      <a-button @click="visible = true">输入密码 {{ code }}</a-button>
      <v-captcha v-model="visible" v-model:code="code" desc="默认密码为123456" mask title="请输入密码"></v-captcha>
      <a-divider>明码输入</a-divider>
      <a-button @click="visible2 = true">输入验证码 {{ code2 }}</a-button>
      <v-captcha v-model="visible2" v-model:code="code2" desc="验证码已发送至手机159 **** 0460"></v-captcha>
      <a-divider>自定义密码长度</a-divider>
      <a-button @click="visible3 = true">输入验证码 {{ code3 }}</a-button>
      <v-captcha v-model="visible3" v-model:code="code3" maxlength="6"></v-captcha>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

const visible = ref(false)
const visible2 = ref(false)
const visible3 = ref(false)
const code = ref('')
const code2 = ref('')
const code3 = ref('')
</script>

<style>

</style>

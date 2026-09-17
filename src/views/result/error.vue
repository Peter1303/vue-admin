<template>
  <a-card :bordered="false">
    <result :description="description" :is-success="false" :title="title">
      <template #action>
        <a-button type="primary">返回修改</a-button>
      </template>
      <div>
        <div
          style="font-size: 16px;  font-weight: 500; margin-bottom: 16px"
        >您提交的内容有如下错误：
        </div>
        <div style="margin-bottom: 16px">
          <a-icon style="color: #f5222d; margin-right: 8px" type="close-circle-o"/>
          您的账户已被冻结
          <a style="margin-left: 16px">立即解冻
            <a-icon type="right"/>
          </a>
        </div>
        <div>
          <a-icon style="color: #f5222d; margin-right: 8px" type="close-circle-o"/>
          您的账户还不具备申请资格
          <a style="margin-left: 16px">立即升级
            <a-icon type="right"/>
          </a>
        </div>
      </div>
    </result>
  </a-card>
</template>

<script lang="ts" setup>
import Result from './template/result.vue'

defineOptions({name: 'error'})

const title = '提交失败'
const description = '请核对并修改以下信息后，再重新提交。'
</script>

<style scoped>
</style>

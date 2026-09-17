<template>
  <a-list :data-source="data" item-layout="horizontal">
    <template #renderItem="{ item, index }">
      <a-list-item :key="index">
        <a-list-item-meta>
          <template #title>
            <a>{{ item.title }}</a>
          </template>
          <template #description>
            <span>
              <span class="security-list-description">{{ item.description }}</span>
              <span v-if="item.value">:</span>
              <span class="security-list-value">{{ item.value }}</span>
            </span>
          </template>
        </a-list-item-meta>
        <template v-if="item.actions" #actions>
          <a @click="item.actions.callback">{{ item.actions.title }}</a>
        </template>
      </a-list-item>
    </template>
  </a-list>
</template>

<script lang="ts" setup>
import {message} from 'ant-design-vue'

defineOptions({name: 'UserSettingsSecurity'})

interface SecurityAction {
  title: string
  callback: () => void
}

interface SecurityItem {
  title: string
  description: string
  value: string
  actions?: SecurityAction
}

// ------------------------------------------------------------
// REVIEW(迁移): 原代码把 data 定义在**模块作用域**，但每个 callback 里写的是
// `this.$message.info(...)` —— ES 模块顶层没有 `this`（是 undefined），
// 模板又通过 `@click="item.actions.callback"` 调用，`this` 会是 `item.actions`（没有 $message）。
// 所以这五个回调在过去**必然抛 TypeError**，点「修改」是没有任何反应的。
//
// 这里按「最小可用修复」处理：直接用从 ant-design-vue 引入的 message。
// 语义与作者意图一致（点击弹一条对应级别的提示），未改变任何业务分支。
// ------------------------------------------------------------
const data = Object.freeze<SecurityItem[]>([
  {
    title: '账户密码',
    description: '当前密码强度',
    value: '强',
    actions: {
      title: '修改',
      callback: () => {
        message.info('This is a normal message')
      }
    }
  },
  {
    title: '密保手机',
    description: '已绑定手机',
    value: '138****8293',
    actions: {
      title: '修改',
      callback: () => {
        message.success('This is a message of success')
      }
    }
  },
  {
    title: '密保问题',
    description: '未设置密保问题，密保问题可有效保护账户安全',
    value: '',
    actions: {
      title: '设置',
      callback: () => {
        message.error('This is a message of error')
      }
    }
  },
  {
    title: '备用邮箱',
    description: '已绑定邮箱',
    value: 'ant***sign.com',
    actions: {
      title: '修改',
      callback: () => {
        message.warning('This is message of warning')
      }
    }
  },
  {
    title: 'MFA 设备',
    description: '未绑定 MFA 设备，绑定后，可以进行二次确认',
    value: '',
    actions: {
      title: '绑定',
      callback: () => {
        message.info('This is a normal message')
      }
    }
  }
])
</script>

<style scoped>
</style>

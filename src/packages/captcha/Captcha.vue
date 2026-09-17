<template>
  <a-modal :footer="null" :maskClosable="false" :open="modelValue" centered class="captcha" @cancel="cancel">
    <h1>{{ title }}</h1>
    <p>{{ desc }}</p>
    <v-codebox v-model="tempCode" :mask="mask" :maxlength="maxlength"></v-codebox>
  </a-modal>
</template>

<script lang="ts" setup>
import {ref, watch} from 'vue'

defineOptions({name: 'v-captcha'})

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    code?: string
    maxlength?: number | string
    title?: string
    mask?: boolean
    desc?: string
  }>(),
  {
    modelValue: false,
    code: '',
    title: '请输入验证码',
    mask: false,
    desc: '验证码已发送'
  }
)

const tempCode = ref(props.code)

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'update:code', v: string): void
}>()

watch(tempCode, (val) => {
  emit('update:code', val)
})

function cancel() {
  emit('update:modelValue', false)
}
</script>

<style lang="less">
.captcha {
  .ant-modal-body {
    text-align: center;

    p {
      padding-bottom: 20px;
    }
  }

  .ant-modal-content {
    min-width: 320px;
  }
}
</style>

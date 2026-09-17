<template>
  <v-card>
    <a-alert
      description="示例中展示了the-mask结合antd的表单一起使用"
      message="输入内容格式化"
      show-icon
      type="info"
    />
    <div>
      <a-form ref="formRef" :model="state" :rules="rules">
        <a-form-item
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
          label="手机号"
          name="phone"
        >
          <!-- the-mask 已由 src/shims/TheMask.vue 提供（原 vue-the-mask 只有 Vue2 版）。
               它是仿 a-input 的输入控件，故沿用 antdv 的 v-model:value 约定；
               兼容层同时支持 modelValue / value 两套契约，写 v-model 也等价。
               注意默认 masked=false：向外发的是**原始值**（如 138xxxxxxxx），
               输入框里显示的才是带空格的掩码文本 —— 与原库行为一致。 -->
          <the-mask
            v-model:value="state.phone"
            :mask="['### #### ####']"
            class="v-input ant-input"
          />
        </a-form-item>
        <a-form-item
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
          label="银行卡"
          name="card"
        >
          <the-mask
            v-model:value="state.card"
            :mask="['#### #### #### ####']"
            class="v-input ant-input"
          />
        </a-form-item>
        <a-form-item
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
          label="姓名"
          name="name"
        >
          <a-input
            v-model:value="state.name"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
      <a-button type="primary" @click="check">Check</a-button>
      {{ result }}
    </div>
  </v-card>
</template>

<script lang="ts" setup>
import {reactive, ref} from 'vue'
// 表单实例类型用 FormInstance（它才带 validate / validateFields 等方法）；
// `InstanceType<typeof Form>` 解析出来的是组件实例，类型上并没有 validate
import type {FormInstance} from 'ant-design-vue'

const formItemLayout = Object.freeze({
  labelCol: {span: 4},
  wrapperCol: {span: 8}
})

interface FormState {
  phone: string
  card: string
  name: string
}

const state = reactive<FormState>({
  phone: '',
  card: '',
  name: ''
})

// ⚠️ name / state 的键 / rules 的键三者必须一致
const rules: Record<string, { required: boolean; message: string }[]> = {
  phone: [{required: true, message: 'Input something!'}],
  card: [{required: true, message: 'Input something!'}],
  name: [{required: true, message: 'Please input your phone number!'}]
}

const result = ref<Record<string, unknown>>({})

const formRef = ref<FormInstance | null>(null)

function check() {
  // REVIEW(迁移): 原代码在 validateFields 回调前还调了 this.form.setFieldsValue('phone')，
  // 该用法期望传对象、实际传了字符串，是无效调用，已在 v-decorator→受控表单迁移中移除。
  formRef.value
    ?.validate()
    .then((values: unknown) => {
      result.value = values as Record<string, unknown>
    })
    .catch(() => {
      // 校验失败：不更新 result
    })
}
</script>

<style lang="scss" scoped>
</style>

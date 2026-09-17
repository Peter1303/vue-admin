<template>
  <div>
    <a-modal
      v-if="model=='modal'"
      v-model:open="open"
      :confirmLoading="confirmLoading"
      :width="layout.isMobile?'90%':'70%'"
      title="Title"
      @cancel="handleCancel"
      @ok="handleOk"
    >
      <v-create-form-view ref="formViewRef" :defaultData="defaultData" :sourceData="sourceData">
      </v-create-form-view>
    </a-modal>
    <a-drawer
      v-else-if="model=='drawer'"
      v-model:open="open"
      :closable="true"
      :width="layout.isMobile?'90%':'70%'"
      placement="right"
      title="Basic Drawer"
      wrapClassName="create-form-drawer"
      @close="onClose"
    >
      <v-create-form-view ref="formViewRef" :defaultData="defaultData" :sourceData="sourceData"></v-create-form-view>
      <div class="create-form-footer">
        <a-button class="pull-right" type="primary" @click="handleOk">ok</a-button>
      </div>
    </a-drawer>
    <v-create-form-view v-else ref="formViewRef" :defaultData="defaultData"
                        :sourceData="sourceData"></v-create-form-view>
  </div>

</template>

<script lang="ts" setup>
import {ref, watch} from 'vue'
import {layout} from '@layouts'

defineOptions({name: 'v-create-form'})

const props = withDefaults(
  defineProps<{
    sourceData?: any[]
    /**
     * 弹层可见性。
     * ⚠️ 迁移前是 Vue 2 的 `value` + `@input` 组合（老式 v-model 约定），
     * 而 Vue 3 的 `v-model` 绑定的是 `modelValue` / `update:modelValue`。
     * 若沿用旧名，`<v-create-form v-model="visible">`（views/crud/crud.vue 就是这么写的）
     * 会**静默失效**：弹层永远打不开，编译和运行都不报错。
     * 因此这里统一改成 Vue 3 标准契约。
     */
    modelValue?: boolean
    model?: string
    confirmLoading?: boolean
    defaultData?: Record<string, any>
    labelCol?: number | string
    wrapperCol?: number | string
    size?: string
  }>(),
  {
    sourceData: () => [],
    modelValue: false,
    model: 'modal',
    confirmLoading: false,
    defaultData: () => ({}),
    labelCol: 5,
    wrapperCol: 18,
    size: 'large'
  }
)

const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const formViewRef = ref<any>(null)

// 原弹层用 visible 控制，antdv4 用 v-model:open，并回写父级 v-model
const open = ref(Boolean(props.modelValue))
watch(
  () => props.modelValue,
  (v) => {
    open.value = Boolean(v)
  }
)
watch(open, (v) => {
  if (!v) emit('update:modelValue', false)
})

function onClose() {
  emit('update:modelValue', false)
}

function handleOk(e: Event) {
  formViewRef.value?.handleSubmit(e)
}

function handleCancel() {
  emit('update:modelValue', false)
}
</script>

<style lang="less">
.create-form-footer {
  padding: 10px 16px;
  position: absolute;
  bottom: 0;
  width: 100%;
  right: 10px;
  border-top: 1px solid #e8e8e8;
  background: #fff;
}

.create-form-drawer .ant-drawer-body {
  height: calc(100vh - 100px);
}

.create-form-drawer .ant-drawer-content-wrapper {
  height: 100vh;
  overflow: hidden
}
</style>

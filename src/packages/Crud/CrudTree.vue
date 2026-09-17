<template>
  <a-tree
    v-model:checked-keys="checked"
    :tree-data="treeData"
    auto-expand-parent
    checkable
    default-expand-all
    multiple
    show-line
    @check="checkTree"
  />
</template>

<script lang="ts" setup>
import {computed} from 'vue'

defineOptions({name: 'VCrudTree'})

const props = withDefaults(
  defineProps<{
    treeData?: any[]
    field?: string
    initialValue?: any[]
    /**
     * ⚠️ 迁移前是 `value` + `@update:value`（Vue 2 写法）。
     * 改成 Vue 3 标准 `modelValue`，这样父组件可写通用的 `<v-crud-tree v-model="x">`，
     * 不必记住要拼成 `v-model:value` —— 写错了是静默失效。
     */
    modelValue?: any[]
  }>(),
  {
    treeData: () => [],
    initialValue: () => [],
    modelValue: () => []
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: any): void
  // 原写法第四个参数也叫 e（与事件名形参重名），TS 会报 Duplicate identifier，这里改名
  (e: 'check-tree', field: string, checkedKeys: any, evt: any): void
}>()

const checked = computed({
  get: () => props.modelValue,
  set: (v: any) => emit('update:modelValue', v)
})

function checkTree(checkedKeys: any, e: any) {
  emit('check-tree', props.field as string, checkedKeys, e)
}
</script>

<style>
</style>

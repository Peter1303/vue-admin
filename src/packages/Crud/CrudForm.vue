<template>
  <div v-if="modelValue">
    <a-modal
      v-model:open="visible"
      @cancel="cancel"
      @ok="handleSubmit"
    >
      <template #title>
        <a-icon :type="icon"/>
        &nbsp;{{ title }}
      </template>
      <a-form ref="formRef" :model="model" :rules="rules" @submit.prevent="handleSubmit">
        <template v-for="(item) in columns" :key="item._uuid">
          <a-form-item
            v-if="item.formOptions"
            :label="item.title"
            :label-col="{ span: labelCol }"
            :name="item.dataIndex"
            :wrapper-col="{ span: wrapperCol }"
          >
            <!-- input -->
            <a-input
              v-if="item.formOptions.el == 'input'"
              v-model:value="model[item.dataIndex]"
              :disabled="item._disabled"
              :placeholder="item.formOptions.placeholder"
              :size="size"
              :type="item.formOptions.type"
            />
            <!-- input.search -->
            <a-input-search
              v-else-if="item.formOptions.el == 'input.search'"
              v-model:value="model[item.dataIndex]"
              :disabled="item._disabled"
              :placeholder="item.formOptions.placeholder"
              :size="size"
              :type="item.formOptions.type"
            />
            <!-- select -->
            <a-select
              v-else-if="item.formOptions.el == 'select'"
              v-model:value="model[item.dataIndex]"
              :disabled="item._disabled"
              :mode="item.formOptions.type"
              :options="item.formOptions.options"
              :placeholder="item.formOptions.placeholder"
              :size="size"
            />
            <!-- switch -->
            <a-switch
              v-else-if="item.formOptions.el == 'switch'"
              v-model:checked="model[item.dataIndex]"
              :disabled="item._disabled"
              :size="size"
            />
            <!-- radio -->
            <a-radio-group
              v-else-if="item.formOptions.el == 'radio'"
              v-model:value="model[item.dataIndex]"
              :disabled="item._disabled"
              :options="item.formOptions.options"
              :size="size"
            />
            <!-- checkbox -->
            <template v-else-if="item.formOptions.el == 'checkbox'">
              <a-checkbox-group
                v-model:value="model[item.dataIndex]"
                :disabled="item._disabled"
                :options="item.formOptions.options"
                :size="size"
              />
            </template>
            <!-- range-picker -->
            <template v-else-if="item.formOptions.el == 'datepicker' && item.formOptions.type == 'range'">
              <a-range-picker
                v-model:value="model[item.dataIndex]"
                :format="item.formOptions.format"
                style="width:100%"
              />
            </template>
            <!-- datepicker -->
            <a-date-picker
              v-else-if="item.formOptions.el == 'datepicker'"
              v-model:value="model[item.dataIndex]"
              :disabled="item._disabled"
              :format="item.formOptions.format"
              :size="size"
              style="width:100%"
            />
            <!-- rate -->
            <a-rate
              v-else-if="item.formOptions.el == 'rate'"
              v-model:value="model[item.dataIndex]"
              allow-half
            />
            <!-- textarea -->
            <a-textarea
              v-else-if="item.formOptions.el == 'textarea'"
              v-model:value="model[item.dataIndex]"
              :rows="3"
            />
            <!-- slider -->
            <a-slider
              v-else-if="item.formOptions.el == 'slider'"
              v-model:value="model[item.dataIndex]"
              :marks="item.formOptions.values"
            />
            <!-- tree -->
            <template v-else-if="item.formOptions.el == 'tree'">
              <v-crud-tree
                v-model:value="model[item.dataIndex]"
                :field="item.dataIndex"
                :initial-value="decRow[item.dataIndex]"
                :tree-data="item.formOptions.values"
                @check-tree="checkTree"
              />
            </template>
          </a-form-item>
        </template>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import {computed, reactive, ref, watch} from 'vue'
import deepmerge from 'deepmerge'
import moment from 'moment'

defineOptions({name: 'VCrudForm'})

const props = withDefaults(
  defineProps<{
    sourceColumns?: any[]
    asyncCols?: any[]
    row?: Record<string, any>
    asyncRow?: Record<string, any>
    /**
     * 弹层可见性。
     * ⚠️ 迁移前是 Vue 2 的 `value` + `@input`（老式 v-model 约定），
     * 而 Vue 3 的 `v-model` 绑定 `modelValue` / `update:modelValue`；
     * 沿用旧名会让父组件的 `v-model` **静默失效**（弹层打不开、不报错）。
     */
    modelValue?: boolean
    title?: string
    icon?: string
    isEdit?: boolean
    labelCol?: number | string
    wrapperCol?: number | string
    size?: string
  }>(),
  {
    sourceColumns: () => [],
    asyncCols: () => [],
    row: () => ({}),
    asyncRow: () => ({}),
    modelValue: false,
    title: '',
    icon: 'form',
    isEdit: false,
    labelCol: 5,
    wrapperCol: 18,
    size: 'large'
  }
)

const emit = defineEmits<{
  (e: 'handle-submit', values: any): void
  (e: 'update:modelValue', visible: boolean): void
}>()

const formRef = ref<any>(null)
const model = reactive<Record<string, any>>({})
const decRow = reactive<Record<string, any>>({...(props.row as any)})

function concatCols(): any[] {
  return (props.sourceColumns as any[]).map((v: any) => {
    let item = v
    ;(props.asyncCols as any[]).forEach((s: any) => {
      if (v.dataIndex === s.dataIndex) {
        item = deepmerge(v, s)
      }
    })
    if (item._uuid == null) item._uuid = item.dataIndex
    return item
  })
}

const columns = ref<any[]>(concatCols())

// 把 decRow 同步进受控表单 model，日期类字段用 moment 包成 dayjs（antdv4 DatePicker 只吃 dayjs）
function applyModel() {
  ;(columns.value as any[]).forEach((col: any) => {
    const fo = col.formOptions
    if (!fo) return
    const field = col.dataIndex
    let val = decRow[field]
    if (fo.el === 'datepicker' && fo.type === 'range') {
      const start = val && val[0] ? val[0] : ''
      const end = val && val[1] ? val[1] : ''
      val = start || end ? [moment(start), moment(end)] : []
    } else if (fo.el === 'datepicker') {
      val = val ? moment(val) : ''
    } else if (fo.el === 'switch') {
      val = Boolean(val)
    }
    model[field] = val
  })
}

watch(
  () => props.asyncRow,
  (val) => {
    Object.assign(decRow, props.row, val)
  },
  {deep: true, immediate: true}
)
watch(
  () => props.row,
  (val) => {
    Object.assign(decRow, props.asyncRow, val)
  },
  {deep: true, immediate: true}
)
watch(() => decRow, applyModel, {deep: true, immediate: true})
watch(columns, applyModel)
// sourceColumns/asyncCols 后续变化时重新合并列（原逻辑在 columns watcher 里 concatCols）
watch(
  [() => props.sourceColumns, () => props.asyncCols],
  () => {
    columns.value = concatCols()
  },
  {deep: true}
)

const rules = computed<Record<string, any>>(() => {
  const r: Record<string, any> = {}
  ;(columns.value as any[]).forEach((c: any) => {
    if (c.formOptions && c.formOptions.rules) r[c.dataIndex] = c.formOptions.rules
  })
  return r
})

// 弹层可见性：原用 visible 控制，antdv4 改为 v-model:open，并回写父级 v-model
const visible = ref(Boolean(props.modelValue))
watch(
  () => props.modelValue,
  (v) => {
    visible.value = Boolean(v)
  }
)
watch(visible, (v) => {
  if (!v) emit('update:modelValue', false)
})

function handleSubmit(e?: Event) {
  e?.preventDefault?.()
  formRef.value
    ?.validate()
    .then(() => {
      emit('handle-submit', {...model})
      formRef.value?.resetFields()
    })
    .catch(() => {
      // 校验未通过：原实现会滚动到首个错误项，这里略过滚动定位
    })
}

function cancel() {
  visible.value = false
}

function checkTree(field: string, checkedKeys: any) {
  model[field] = checkedKeys
}
</script>

<style scoped>
</style>

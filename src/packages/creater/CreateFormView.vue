<template>
  <a-spin :spinning="loading">
    <a-form ref="formRef" :model="model" :rules="rules" class="form" @submit.prevent="handleSubmit">
      <a-row>
        <template v-for="(item) in sourceData" :key="item.dataIndex">
          <a-col :lg="12" :md="12" :sm="24" :xs="24">
            <slot :name="item.dataIndex" :scope="item" :value="defaultData[item.dataIndex]">
              <a-form-item
                v-if="item.formOptions"
                :label="item.title"
                :label-col="{ span: labelCol }"
                :name="item.dataIndex"
                :wrapper-col="{ span: wrapperCol }"
              >
                <!-- input -->
                <a-input
                  v-if="item.formOptions.el=='input'"
                  :ref="item.dataIndex"
                  v-model:value="model[item.dataIndex]"
                  :disabled="item._disabled"
                  :placeholder="item.formOptions.placeholder"
                  :size="size"
                  :type="item.formOptions.type"
                >
                  <template #suffix>
                    <a-icon
                      v-if="item.formOptions.allowClear && model[item.dataIndex] && model[item.dataIndex].length"
                      theme="filled"
                      type="close-circle"
                      @click="emitEmpty(item.dataIndex)"
                    />
                  </template>
                </a-input>
                <!-- input.search -->
                <a-input-search
                  v-else-if="item.formOptions.el=='input.search'"
                  v-model:value="model[item.dataIndex]"
                  :disabled="item._disabled"
                  :placeholder="item.formOptions.placeholder"
                  :size="size"
                  :type="item.formOptions.type"
                />
                <!-- select -->
                <a-select
                  v-else-if="item.formOptions.el=='select'"
                  v-model:value="model[item.dataIndex]"
                  :disabled="item._disabled"
                  :mode="item.formOptions.type"
                  :options="item.formOptions.options"
                  :placeholder="item.formOptions.placeholder"
                  :size="size"
                ></a-select>
                <!-- switch -->
                <a-switch
                  v-else-if="item.formOptions.el=='switch'"
                  v-model:checked="model[item.dataIndex]"
                  :checkedChildren="item.formOptions.checkedChildren"
                  :disabled="item._disabled"
                  :size="size"
                  :unCheckedChildren="item.formOptions.unCheckedChildren"
                />
                <!-- radio -->
                <a-radio-group
                  v-else-if="item.formOptions.el=='radio'"
                  v-model:value="model[item.dataIndex]"
                  :disabled="item._disabled"
                  :options="item.formOptions.options"
                  :size="size"
                ></a-radio-group>
                <!-- checkbox -->
                <template v-else-if="item.formOptions.el=='checkbox'">
                  <a-checkbox-group
                    v-model:value="model[item.dataIndex]"
                    :disabled="item._disabled"
                    :options="item.formOptions.options"
                    :size="size"
                  ></a-checkbox-group>
                </template>
                <!-- datepicker -->
                <a-date-picker
                  v-else-if="item.formOptions.el=='datepicker'"
                  v-model:value="model[item.dataIndex]"
                  :disabled="item._disabled"
                  :format="item.formOptions.format"
                  :size="size"
                  style="width:100%"
                />
                <!-- timepicker -->
                <a-time-picker
                  v-else-if="item.formOptions.el=='timepicker'"
                  v-model:value="model[item.dataIndex]"
                  :disabled="item._disabled"
                  :format="item.formOptions.format"
                  :size="size"
                  style="width:100%"
                />
                <!-- cascader -->
                <a-cascader
                  v-else-if="item.formOptions.el=='cascader'"
                  v-model:value="model[item.dataIndex]"
                  :options="item.formOptions.options"
                />
                <!-- rate -->
                <a-rate
                  v-else-if="item.formOptions.el=='rate'"
                  v-model:value="model[item.dataIndex]"
                  allowHalf
                />
                <!-- textarea -->
                <a-textarea
                  v-else-if="item.formOptions.el=='textarea'"
                  v-model:value="model[item.dataIndex]"
                  :rows="3"
                ></a-textarea>
                <!-- slider -->
                <a-slider
                  v-else-if="item.formOptions.el=='slider'"
                  v-model:value="model[item.dataIndex]"
                />
                <!-- upload -->
                <div v-else-if="item.formOptions.el=='upload'" class="clearfix">
                  <a-upload
                    v-model:file-list="model[item.dataIndex]"
                    :action="item.formOptions.action"
                    :remove="handleRemove"
                    listType="picture-card"
                    @change="(info: any) => handleChange(item.dataIndex, info)"
                    @preview="handlePreview"
                  >
                    <div v-if="defaultData[item.dataIndex].length < 3">
                      <a-icon type="plus"/>
                      <div class="ant-upload-text">上传</div>
                    </div>
                  </a-upload>
                  <a-modal :footer="null" :open="previewVisible" @cancel="handleCancel">
                    <img :src="previewImage" alt="example" style="width: 100%"/>
                  </a-modal>
                </div>
                <!-- tree -->
                <template v-else-if="item.formOptions.el=='tree'">
                  <a-tree
                    v-model:checked-keys="model[item.dataIndex]"
                    :treeData="item.formOptions.options"
                    defaultExpandAll
                    multiple
                    @expand="onExpand"
                    @select="onSelect"
                  ></a-tree>
                </template>
              </a-form-item>
            </slot>
          </a-col>
        </template>
      </a-row>
    </a-form>
  </a-spin>
</template>

<script lang="ts" setup>
import {computed, reactive, ref} from 'vue'
import moment from 'moment'

defineOptions({name: 'v-create-form-view'})

const props = withDefaults(
  defineProps<{
    sourceData?: any[]
    defaultData?: Record<string, any>
    labelCol?: number | string
    wrapperCol?: number | string
    size?: string
    loading?: boolean
  }>(),
  {
    sourceData: () => [],
    defaultData: () => ({}),
    labelCol: 5,
    wrapperCol: 18,
    size: 'default',
    loading: false
  }
)

const emit = defineEmits<{ (e: 'handle-submit', values: any): void }>()

const formRef = ref<any>(null)
const model = reactive<Record<string, any>>({})
const previewVisible = ref(false)
const previewImage = ref('')

// 原 myQs: 按点路径读 defaultData（原实现用 eval('this.defaultData.'+s)，这里等价实现）
function myQs(s: string): any {
  return s
    .split('.')
    .reduce((o: any, k) => (o == null ? o : o[k]), props.defaultData as any)
}

// 把每个字段的初始值（原表单装饰器的 initialValue）落到受控 model
function initialValue(item: any): any {
  const el = item.formOptions.el
  const di = item.dataIndex
  switch (el) {
    case 'input':
    case 'input.search':
    case 'rate':
    case 'textarea':
      return myQs(di)
    case 'switch':
      return Boolean(props.defaultData[di])
    case 'datepicker':
      return moment(myQs(di))
    case 'timepicker':
      return moment(props.defaultData[di], 'HH:mm:ss')
    default:
      return props.defaultData[di]
  }
}

;(props.sourceData as any[]).forEach((item: any) => {
  if (item.formOptions) {
    model[item.dataIndex] = initialValue(item)
  }
})

const rules = computed<Record<string, any>>(() => {
  const r: Record<string, any> = {}
  ;(props.sourceData as any[]).forEach((item: any) => {
    if (item.formOptions && item.formOptions.rules) r[item.dataIndex] = item.formOptions.rules
  })
  return r
})

function emitEmpty(value: string) {
  model[value] = ''
}

function handleSubmit(e?: Event) {
  e?.preventDefault?.()
  formRef.value
    ?.validate()
    .then(() => {
      emit('handle-submit', {...model})
      formRef.value?.resetFields()
    })
    .catch(() => {
    })
}

function handleCancel() {
  previewVisible.value = false
}

function handlePreview(file: any) {
  previewImage.value = file.url || file.thumbUrl
  previewVisible.value = true
}

// 原硬写 'upload' 字段名，这里改为按当前列 dataIndex 写回，避免字段名错配
function handleChange(field: string, info: any) {
  model[field] = info.fileList
}

function handleRemove(file: any) {
  console.log('TCL: remove -> file', file)
}

function onSelect(keys: any) {
  console.log('Trigger Select', keys)
}

function onExpand() {
  console.log('Trigger Expand')
}
</script>

<style scoped>
.form .anticon-close-circle {
  cursor: pointer;
  color: #ccc;
  transition: color 0.3s;
  font-size: 12px;
}

.form .anticon-close-circle:hover {
  color: #999;
}

.form .anticon-close-circle:active {
  color: #666;
}
</style>

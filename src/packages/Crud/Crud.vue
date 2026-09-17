<template>
  <div>
    <!-- table -->
    <a-card :bordered="false" @click="delegateCick">
      <slot :columns="columns" :dataSource="dataSource">
        <div class="clearfix" style="padding-bottom:8px">
          <a-button type="primary" @click="handleAdd">新增</a-button>
        </div>
        <a-table
          :bordered="false"
          :columns="columns"
          :data-source="dataSource"
          :loading="loading"
          :pagination="false"
          size="large"
        >
          <template #bodyCell="{ column, text, record, index }">
            <template v-if="column.dataIndex === 'operation'">
              <span @click="handleEdit(text, record, index)">编辑</span>
              <a-divider type="vertical"/>
              <a-popconfirm
                v-if="dataSource.length"
                title="确定删除？"
                @confirm="() => handleDel(text, record, index)"
              >
                <span style="color:#f00">删除</span>
              </a-popconfirm>
              <a-divider type="vertical"/>
              <span @click="handleInfo(text, record, index)">详情</span>
            </template>
          </template>
        </a-table>
        <div class="clearfix" style="padding-top:8px">
          <a-pagination
            v-model:current="page"
            v-model:page-size="pageSize"
            :total="totalCount"
            class="pull-right"
            show-size-changer
            @change="pageChange"
            @showSizeChange="showSizeChange"
          />
        </div>
      </slot>
    </a-card>
    <!-- form -->
    <v-crud-form
      :async-cols="asyncCols"
      :async-row="asyncRow"
      :icon="icon"
      :is-edit="isEdit"
      :label-col="labelCol"
      :row="row"
      :source-columns="sourceColumns"
      :title="title"
      :value="actionVisible"
      :wrapper-col="wrapperCol"
      @input="actionVisible = $event"
      @handle-submit="handleSubmit"
    />
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

defineOptions({name: 'VCrud'})

const props = withDefaults(
  defineProps<{
    sourceColumns?: any[]
    dataSource?: any[]
    loading?: boolean
    asyncRow?: Record<string, any>
    asyncCols?: any[]
    labelCol?: number | string
    wrapperCol?: number | string
    totalCount?: number | string
  }>(),
  {
    sourceColumns: () => [],
    dataSource: () => [],
    loading: false,
    asyncRow: () => ({}),
    asyncCols: () => [],
    labelCol: 5,
    wrapperCol: 18,
    totalCount: 10
  }
)

const emit = defineEmits<{
  (e: 'handle-submit', values: any, isEdit: boolean): void
  (e: 'handle-edit', text: any, record: any, index: any): void
  (e: 'handle-add'): void
  (e: 'handle-info', text: any, record: any, index: any): void
  (e: 'handle-delete', text: any, record: any, index: any): void
  (e: 'handle-page', page: number, pageSize: number): void
}>()

const actionVisible = ref(false)
const row = ref<Record<string, any>>({})
const isEdit = ref(false)
const icon = ref('')
const title = ref('')
const page = ref(1)
const pageSize = ref(10)

// 操作列：原用 customRender 具名插槽渲染，antdv4 改为 dataIndex + #bodyCell 判断
const columns = ref<any[]>(
  (props.sourceColumns as any[])
    .filter((v) => !v.hidden)
    .concat([{title: '操作', key: 'operation', dataIndex: 'operation', width: 200}])
)

function handleSubmit(values: any) {
  emit('handle-submit', values, isEdit.value)
  actionVisible.value = false
}

function handleEdit(text: any, record: any, index: any) {
  row.value = record
  title.value = '编辑'
  icon.value = 'form'
  actionVisible.value = true
  isEdit.value = true
  emit('handle-edit', text, record, index)
}

function handleAdd() {
  row.value = {}
  title.value = '新增'
  icon.value = 'plus-square'
  actionVisible.value = true
  isEdit.value = false
  emit('handle-add')
}

function handleInfo(text: any, record: any, index: any) {
  emit('handle-info', text, record, index)
}

function handleDel(text: any, record: any, index: any) {
  emit('handle-delete', text, record, index)
}

function pageChange(p: number, size: number) {
  page.value = p
  pageSize.value = size
  emit('handle-page', p, size)
}

function showSizeChange(current: number, size: number) {
  page.value = current
  pageSize.value = size
  emit('handle-page', current, size)
}

function delegateCick(e: MouseEvent) {
  const target = e.target as HTMLElement
  const index = target.dataset.index
  const type = target.dataset.type
  const list = props.dataSource as any[]
  const record = index !== undefined ? list[index as any] : undefined
  if (type) {
    if (type === 'edit' && index !== undefined) {
      handleEdit(record, record, index)
    } else if (type === 'add') {
      handleAdd()
    } else if (type === 'delete' && index !== undefined) {
      handleDel(record, record, index)
    }
  }
}
</script>

<style scoped>
</style>

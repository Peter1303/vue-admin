<template>
  <a-spin :spinning="loading||!reRender" :style="{minHeight:tableBoxHeight+'px'}">
    <template v-if="tableData.length&&reRender">
      <div ref="tableBox">
        <a-table
          v-resize.debounce.500="getDomWidth"
          :bordered="bordered"
          :columns="columns"
          :dataSource="tableData"
          :indentSize="0"
          :loading="!reRender"
          :rowKey="rowKey"
          :rowSelection="rowSelection"
          :scroll="{x:width}"
          :size="size"
        >
          <!--
            消费方（页面）传入的 #bodyCell 必须在这里转发出去。
            原来本组件自己声明了 #bodyCell，Vue 不会把父级同名插槽自动接进来，
            于是页面里写的一堆自定义列（头像/悬浮卡片/星级/复制手机号）全被吞掉、恒不生效。

            为什么未命中的列不会因此变空：Vue 与 antd 都把「插槽存在、但只渲染出注释节点」
            视为空，会自动使用 <slot> 的兜底内容（antd 侧见 _util/vnode.js 的
            customRenderSlot → ensureValidVNode）。所以没写进消费方 v-if 分支的列，
            仍然走下面这套内建的 tooltip / 省略号渲染。
          -->
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'action'">
              <div :style="{width:(column.width||200)+'px'}">
                <a href="javascript:void(0);">
                  <span @click="handleInfo(text, record)">详情</span>
                  <a-divider type="vertical"/>
                  <span @click="handleEdit(text, record)">编辑</span>
                  <a-divider type="vertical"/>
                  <a-popconfirm
                    v-if="tableData.length"
                    title="确定删除？"
                    @confirm="() => handleDel(text, record)"
                  >
                    <span style="color:#f00">删除</span>
                  </a-popconfirm>
                </a>
              </div>
            </template>
            <slot
              v-else
              name="bodyCell"
              :column="column"
              :record="record"
              :text="cellText(text, column, record)"
            >
              <div v-if="column.tooltip">
                <a-tooltip>
                  <template #title>{{ cellText(text, column, record) }}</template>
                  <div :style="{width:(column.width||0)+'px'}" class="textover1">{{ cellText(text, column, record) }}</div>
                </a-tooltip>
              </div>
              <div
                v-else
                :style="{width:(column.width||0)+'px'}"
                class="textover1"
              >{{ cellText(text, column, record) }}
              </div>
            </slot>
          </template>
        </a-table>
      </div>
      <div class="clearfix" style="padding:20px 0">
      </div>
    </template>
    <a-card v-else :loading="loading" :style="{minHeight:tableBoxHeight+'px'}">暂无数据</a-card>

  </a-spin>
</template>
<script lang="ts" setup>
import {computed, nextTick, onMounted, ref, watch} from 'vue'
import {layout} from '@layouts'

defineOptions({name: 'v-create-table'})

const props = withDefaults(
  defineProps<{
    sourceData?: any[]
    tableData?: any[]
    rowKey?: (record: any) => string | number
    loading?: boolean
    size?: string
    bordered?: boolean
  }>(),
  {
    sourceData: () => [],
    tableData: () => [],
    loading: true,
    size: 'default',
    bordered: false
  }
)

const reRender = ref(true)
const tableBoxWidth = ref(0)
const tableBoxHeight = ref(0)
const tableBox = ref<HTMLElement | null>(null)

const emit = defineEmits<{
  (e: 'handle-edit', text: any, record: any): void
  (e: 'handleEdit', text: any, record: any): void
  (e: 'handle-info', text: any, record: any): void
  (e: 'handleInfo', text: any, record: any): void
  (e: 'handle-del', text: any, record: any): void
  (e: 'handleDel', text: any, record: any): void
}>()

const rowSelection = computed(() => ({
  columnWidth: '50px',
  onChange: (selectedRowKeys: any, selectedRows: any) => {
    console.log(
      `selectedRowKeys: ${selectedRowKeys}`,
      'selectedRows: ',
      selectedRows
    )
  }
}))

// 表格的固定宽之和用于滚动
const width = computed(() => {
  let w = 0
  const tdPadding = props.size === 'small' ? 16 : 32
  ;(props.sourceData as any[]).forEach((v: any) => {
    if (!v.hidden) {
      w += (v.width || 0) + tdPadding
    }
  })
  return w + 200 + 32
})

const columns = computed(() =>
  (props.sourceData as any[])
    .map((v: any, i: number) => {
      // 滚动宽度小于容器宽度的时候去掉 fixed
      if (i === 0 && width.value > tableBoxWidth.value) {
        v.fixed = 'left'
      } else {
        v.fixed = false
      }
      v.key = v.dataIndex
      return v
    })
    .filter((v: any) => !v.hidden)
    .concat([
      {
        title: '操作',
        key: 'operation',
        dataIndex: 'action',
        width: 200,
        fixed: width.value < tableBoxWidth.value ? false : 'right'
      }
    ])
)

/**
 * 取单元格显示文本
 * ------------------------------------------------------------
 * antdv 4 的默认取值**只认数组路径**：
 *   node_modules/ant-design-vue/es/vc-table/utils/valueUtil.js → getPathValue()
 *   `toArray(path)` 之后逐层取值，所以 'userinfo.name' 这种点号字符串会被当成
 *   **一个**属性名去取，结果恒为 undefined。
 *
 * 而本项目 columns 里大量沿用 antd 1 时代的点号 dataIndex（'userinfo.name'、
 * 'userinfo.motor.licence'、'order.remark' …）。在 antd 1 下这些列是靠
 * 「以 dataIndex 命名的具名插槽」里手写 `row.userinfo.name` 渲染出来的，
 * 迁移后插槽机制不复存在，整列就变成空白 —— 这是「高级表格看不到数据」的另一半原因。
 *
 * 这里在 antd 自己取不到值时，按点号路径再取一次。不改 columns 的 dataIndex 形态
 * （改成数组会连带影响 v-create-form 的表单字段名、排序 field 与 :key，改动面太大）。
 */
function cellText(text: unknown, column: any, record: any): unknown {
  if (text !== null && text !== undefined) return text
  const path = column?.dataIndex
  if (typeof path !== 'string' || !path.includes('.') || !record) return text
  return path
    .split('.')
    .reduce((acc: any, key: string) => (acc === null || acc === undefined ? acc : acc[key]), record)
}

function getDomWidth() {
  if (tableBox.value) {
    tableBoxWidth.value = tableBox.value.clientWidth
    tableBoxHeight.value = tableBox.value.clientHeight
  }
}

watch(
  () => props.size,
  () => {
    reRender.value = false
    nextTick(() => {
      reRender.value = true
    })
  }
)
watch(
  () => layout.isCollapse,
  () => {
    reRender.value = false
    nextTick(() => {
      reRender.value = true
    })
  }
)

onMounted(() => {
  getDomWidth()
})

function handleEdit(text: any, record: any) {
  emit('handle-edit', text, record)
  emit('handleEdit', text, record)
}

function handleInfo(text: any, record: any) {
  emit('handle-info', text, record)
  emit('handleInfo', text, record)
}

function handleDel(text: any, record: any) {
  emit('handle-del', text, record)
  emit('handleDel', text, record)
}
</script>

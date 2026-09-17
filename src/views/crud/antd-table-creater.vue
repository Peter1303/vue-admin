<template>
  <div>
    <!-- 基本表格 -->
    <a-card>
      <a-alert
        description="配置一段JSON即可完成支持CRUD的表格与表单，并且自动响应式"
        message="表格生成器"
        showIcon
        type="info"
      />
      <br>
      <v-create-table
        :loading="loading"
        :sourceData="columns"
        :tableData="data"
        @handle-edit="handleEdit"
      >
        <!--
          REVIEW(迁移): 原 Vue2 通过 v-slot:name/rate/select/checkbox 给 v-create-table 传按列自定义渲染，
          依赖 packages 把列 dataIndex 转成具名插槽转发到内部 a-table。迁移后的 v-create-table
          内部自带 #bodyCell 且未转发消费方具名插槽，该组件没有提供任何 <slot/> 出口，
          因此以下 #bodyCell 在 packages 当前实现下不会被渲染（与旧的 v-slot 同样处于“未生效”状态）。
          如需恢复头像/星级/悬浮自定义列，需要 packages 层转发消费方插槽，已超出本批次 views 改写范围。
        -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'name'">
            <a-avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>
            {{ record.name }}
          </template>
          <template v-else-if="column.dataIndex === 'rate'">
            <a-rate :value="record.rate" disabled/>
          </template>
          <template v-else-if="column.dataIndex === 'select'">
            <a-popover title="Title">
              <template #content>
                <p>{{ record.select }}</p>
                <p>{{ record.select }}</p>
              </template>
              <a style="display:block;width:120px">更多信息点我</a>
            </a-popover>
          </template>
          <template v-else-if="column.dataIndex === 'checkbox'">
            <a-tag
              v-for="item in record.checkbox"
              :key="item"
              :color="item == 'Apple' ? 'red' : 'pink'"
            >{{ item }}
            </a-tag>
          </template>
        </template>
      </v-create-table>
    </a-card>
    <v-create-form
      v-model="showForm"
      :defaultData="defaultData"
      :sourceData="columns"
      model="modal"
    ></v-create-form>
  </div>
</template>
<script lang="ts" setup>
import {ref} from 'vue'

const columns = [
  // input基本使用
  {
    title: '型号',
    dataIndex: 'name',
    width: 80,
    tooltip: true,
    fixed: 'left',
    sortable: true,
    formOptions: {
      el: 'input'
    },
    sorter: (a: any, b: any) => a.name - b.name
  },
  // input.search
  {
    title: '手机号(固定长度)',
    dataIndex: 'input2',
    width: 150,
    formOptions: {
      el: 'input.search'
    }
  },
  // 自定义
  {
    title: '自定义(内容长)',
    dataIndex: 'input3',
    tooltip: true,
    width: 100,
    formOptions: {
      el: 'input'
    }
  },
  // 复选
  {
    title: '复选框',
    dataIndex: 'checkbox',
    width: 150,
    formOptions: {
      el: 'checkbox',
      options: [
        {label: 'Apple', value: 'Apple'},
        {label: 'Pear', value: 'Pear'},
        {label: 'Orange', value: 'Orange'}
      ]
    },
    filters: [
      {
        text: 'Apple',
        value: 'Apple'
      },
      {
        text: 'Pear',
        value: 'Pear'
      }
    ],
    filterMultiple: true,
    onFilter(value: any, row: any) {
    }
  },
  // 星级
  {
    title: '星级',
    dataIndex: 'rate',
    width: 200,
    formOptions: {
      el: 'rate'
    }
  },
  // 同步select值
  {
    title: '下拉框',
    className: 'select',
    dataIndex: 'select',
    width: 100,
    tooltip: true,
    formOptions: {
      el: 'select',
      options: [
        {
          label: 'John Brown',
          value: 'John Brown',
          disabled: true
        },
        {
          label: 'artiely',
          value: 'artiely'
        }
      ]
    }
  },
  // 异步select值
  {
    title: '异步下拉框',
    className: 'selectAsync',
    dataIndex: 'selectAsync',
    tooltip: true,
    width: 100,
    formOptions: {
      el: 'select',
      options: []
    }
  },
  // 输入框
  {
    title: '输入框',
    dataIndex: 'address',
    tooltip: true,
    width: 100,
    formOptions: {
      el: 'input'
    }
  },
  // 单选
  {
    title: '单选框',
    dataIndex: 'radio',
    width: 100,
    formOptions: {
      el: 'radio',
      options: [
        {
          label: 'John Brown',
          value: 'John Brown',
          disabled: true
        },
        {
          label: 'artiely',
          value: 'artiely'
        }
      ]
    }
  },
  // 开关
  {
    title: '开关',
    dataIndex: 'switch',
    width: 100,
    formOptions: {
      el: 'switch',
      checkedChildren: '开',
      unCheckedChildren: '关'
    }
  },

  // 日期
  {
    title: '日期',
    dataIndex: 'datepicker',
    width: 100,
    formOptions: {
      el: 'datepicker',
      options: {}
    }
  },
  // 时间
  {
    title: '时间',
    dataIndex: 'timepicker',
    width: 100,
    formOptions: {
      el: 'timepicker',
      options: {}
    }
  },
  // 级联
  {
    title: '级联',
    dataIndex: 'cascader',
    width: 100,
    tooltip: true,
    formOptions: {
      el: 'cascader',
      options: [
        {
          value: 'zhejiang',
          label: 'Zhejiang',
          children: [
            {
              value: 'hangzhou',
              label: 'Hangzhou',
              children: [
                {
                  value: 'xihu',
                  label: 'West Lake'
                }
              ]
            }
          ]
        },
        {
          value: 'jiangsu',
          label: 'Jiangsu',
          children: [
            {
              value: 'nanjing',
              label: 'Nanjing',
              children: [
                {
                  value: 'zhonghuamen',
                  label: 'Zhong Hua Men'
                }
              ]
            }
          ]
        }
      ]
    }
  },

  // 文本域
  {
    title: '文本域',
    dataIndex: 'textarea',
    width: 100,
    formOptions: {
      el: 'textarea'
    }
  },
  // 滑块
  {
    title: '滑块',
    dataIndex: 'slider',
    width: 100,
    formOptions: {
      el: 'slider'
    }
  },
  // 上传
  {
    title: '上传',
    dataIndex: 'upload',
    tooltip: true,
    width: 100,
    formOptions: {
      el: 'upload',
      // 上传地址
      action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76'
    }
  },
  // 树
  {
    title: '树',
    dataIndex: 'tree',
    width: 100,
    formOptions: {
      el: 'tree',
      options: [
        {
          title: 'parent 1',
          key: '0-0',
          slots: {
            icon: 'smile'
          },
          children: [
            {title: 'leaf', key: '0-0-0', slots: {icon: 'meh'}},
            {title: 'leaf', key: '0-0-1', slots: {icon: 'custom'}}
          ]
        }
      ]
    }
  }
]

const data: any[] = []
for (let i = 0; i < 10; i++) {
  data.push({
    key: i,
    name: `${i}`,
    input2: `1592629046${i}`,
    input3: '这是一个完全自定义的输入框',
    select: '这是一个基本输入框',
    selectAsync: '这是一个异步数据输入框',
    address: 'New York No. 1 Lake Park',
    radio: 'artiely',
    switch: true,
    checkbox: ['Apple', 'Pear'],
    datepicker: '2019/10/20',
    timepicker: '23:59:59',
    cascader: ['zhejiang', 'hangzhou', 'xihu'],
    rate: 3,
    textarea: '这是一个文本域',
    slider: 30,
    upload: [
      {
        uid: '-1',
        name: 'xxx.png',
        status: 'done',
        url:
          'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
      }
    ],
    tree: []
  })
}

const loading = ref(false)
const showForm = ref(false)
const defaultData = ref<Record<string, any>>({})

function handleEdit(text: any, record: any) {
  showForm.value = true
  defaultData.value = record
}
</script>

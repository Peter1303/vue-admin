<template>
  <div>
    <!-- 基本表格 -->
    <a-card>
      <a-alert description="在表格生成器下支持自定义实现丰富的业务需求" message="高级表格" showIcon type="info"/>
      <br/>
      <div>
        <a-button-group>
          <a-button type="primary">
            <template #icon>
              <a-icon type="cloud-download"/>
            </template>
            导入数据
          </a-button>
          <a-button type="dashed">
            <template #icon>
              <a-icon type="cloud"/>
            </template>
            备份到邮箱
          </a-button>
          <a-button type="dashed">
            <template #icon>
              <a-icon type="cloud-download"/>
            </template>
            下载到本地
          </a-button>
          <a-popover title="显示设置">
            <template #content>
              <div style="width:200px">
                <v-cell onoff title="紧凑型" @change="onChangeSize"></v-cell>
                <v-cell
                  :defaultChecked="bordered === 'bordered'"
                  onoff
                  title="显示边框"
                  @change="onChangeBorder"
                ></v-cell>
              </div>
              <p>显示字段</p>
              <div>
                <a-row>
                  <a-col v-for="(item, index) in columns" :key="item.title" :span="8">
                    <a-checkbox
                      :checked="!item.hidden"
                      :disabled="index === 0"
                      :value="index"
                      @change="onChangeTableColumn"
                    >{{ item.title }} {{ item.hidden }}
                    </a-checkbox>
                  </a-col>
                </a-row>
              </div>
            </template>
            <a-button type="default">
              <template #icon>
                <a-icon type="setting"/>
              </template>
              显示
            </a-button>
          </a-popover>
        </a-button-group>
      </div>
      <br/>
      <v-create-table
        :bordered="bordered"
        :loading="loading"
        :rowKey="(record: any) => record.userinfo.id"
        :size="size"
        :sourceData="columns"
        :tableData="data"
        @handle-edit="handleEdit"
      >
        <!--
          REVIEW(迁移): 同 antd-table-creater.vue —— v-create-table 迁移后内部自带 #bodyCell 且不转发
          消费方具名插槽，以下自定义列在当前 packages 实现下不会被渲染（旧 v-slot:userinfo.name 等同样失效）。
          按规范将按列自定义渲染收敛为 #bodyCell 写法，落点以 column.dataIndex 判断。
        -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'userinfo.name'">
            <a-popover :title="record.userinfo.name + ' 的信息'">
              <template #content>
                <p>电话：{{ telFormat(record.userinfo.tel) }}</p>
                <p>邮箱：{{ record.userinfo.email }}</p>
                <p>生日：{{ record.userinfo.birthday }}</p>
                <p>地址：{{ record.userinfo.province }}</p>
                <p>描述：{{ record.userinfo.desc }}</p>
                <p style="max-width:400px">备注：{{ record.userinfo.remark }}</p>
              </template>
              <a-avatar
                :style="{ backgroundColor: record.userinfo.color }"
              >{{ record.userinfo.name.split('')[0] }}
              </a-avatar>
              {{ record.userinfo.name }}
            </a-popover>
          </template>
          <template v-else-if="column.dataIndex === 'userinfo.tel'">
            <a-tooltip placement="topLeft">
              <template #title>
                <span>点击复制</span>
              </template>
              <div
                v-clipboard="{ value: record.userinfo.tel, success: clipboardSuccess, error: clipboardError }"
                class="select-none textover1 number"
              >{{ telFormat(record.userinfo.tel) }}
              </div>
            </a-tooltip>
          </template>
          <template v-else-if="column.dataIndex === 'order.rate'">
            <a-rate :value="record.order.rate" disabled/>
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
import {onMounted, ref} from 'vue'
import {message} from 'ant-design-vue'
import {api} from '@core'
import {telFormat} from '@/common/filter'

// input基本使用
const columns = ref<any[]>(
  [
    {
      title: '用户',
      dataIndex: 'userinfo.name',
      width: 120,
      tooltip: true,
      fixed: 'left',
      sortable: true,
      formOptions: {
        el: 'input'
      }
    },
    // input.search
    {
      title: '手机号',
      dataIndex: 'userinfo.tel',
      width: 150,
      hidden: false,
      formOptions: {
        el: 'input'
      },
      sorter: (a: any, b: any) => a.userinfo.tel - b.userinfo.tel
    },
    {
      title: '执照',
      dataIndex: 'userinfo.motor.licence',
      width: 150,
      tooltip: true,
      hidden: true,
      formOptions: {
        el: 'input'
      }
    },
    // 自定义
    {
      title: '备注',
      dataIndex: 'order.remark',
      tooltip: true,
      width: 100,
      formOptions: {
        el: 'textarea'
      }
    },
    // 星级
    {
      title: '星级',
      dataIndex: 'order.rate',
      width: 200,
      formOptions: {
        el: 'rate'
      }
    },
    // 日期
    {
      title: '日期',
      dataIndex: 'order.createtime',
      width: 200,
      formOptions: {
        el: 'datepicker',
        options: {}
      }
    }
  ]
)

const data = ref<any[]>([])
const loading = ref(true)
const showForm = ref(false)
const defaultData = ref<Record<string, any>>({})
const size = ref<string>('default')
// REVIEW(迁移): 原代码即如此 —— bordered 为布尔值，却用 bordered==='bordered' 作为 v-cell 的 :defaultChecked，
// 该比较永远为 false（边框开关默认关）。未擅自改动业务语义。
const bordered = ref<boolean | string>(false)

/**
 * 兜底数据
 * ------------------------------------------------------------
 * 本页的数据来自 `api.ORDER_LIST()`（GET /api/order），而它的代理目标
 * https://www.easy-mock.com 已经停服（域名连 DNS 都解析不了），
 * 开发期经 vite 代理只会拿到 **502**，于是表格恒为「暂无数据」。
 *
 * 这里沿用 workplace.vue / analysis.vue 已有的做法：接口异常时用本地数据渲染，
 * 保证这个演示页可用。字段与 columns 的 dataIndex、以及 #bodyCell 里用到的
 * 路径严格对齐（userinfo.* / userinfo.motor.licence / order.*），
 * 少一个字段对应的列就是空白。
 */
const FALLBACK_LIST = [
  {
    userinfo: {
      id: 1,
      name: '张三',
      color: '#1890ff',
      tel: '15926290460',
      email: 'zhangsan@artiely.dev',
      birthday: '1990-03-12',
      province: '北京市朝阳区建国路 88 号',
      desc: '前端工程师，负责中后台系统',
      remark: '长期合作客户',
      motor: { licence: '京A·8Z6K2' }
    },
    order: { remark: '加急处理', rate: 3, createtime: '2019-10-20 10:00:00' }
  },
  {
    userinfo: {
      id: 2,
      name: '李四',
      color: '#52c41a',
      tel: '15926290461',
      email: 'lisi@artiely.dev',
      birthday: '1992-07-01',
      province: '上海市浦东新区世纪大道 100 号',
      desc: '产品经理，负责需求评审',
      remark: '本周内回访',
      motor: { licence: '沪B·3F9M1' }
    },
    order: { remark: '普通', rate: 5, createtime: '2019-10-21 11:30:00' }
  },
  {
    userinfo: {
      id: 3,
      name: '王五',
      color: '#fa8c16',
      tel: '15926290462',
      email: 'wangwu@artiely.dev',
      birthday: '1988-11-23',
      province: '广东省深圳市南山区科技园',
      desc: '视觉设计师，负责品牌规范',
      remark: '已寄送样册',
      motor: { licence: '粤C·7K2P8' }
    },
    order: { remark: '加急处理', rate: 2, createtime: '2019-10-22 09:15:00' }
  },
  {
    userinfo: {
      id: 4,
      name: '赵六',
      color: '#722ed1',
      tel: '15926290463',
      email: 'zhaoliu@artiely.dev',
      birthday: '1995-05-09',
      province: '浙江省杭州市西湖区文三路 158 号',
      desc: '后端工程师，负责网关与鉴权',
      remark: '待确认合同',
      motor: { licence: '浙D·1Q5R7' }
    },
    order: { remark: '普通', rate: 4, createtime: '2019-10-23 14:40:00' }
  },
  {
    userinfo: {
      id: 5,
      name: '钱七',
      color: '#eb2f96',
      tel: '15926290464',
      email: 'qianqi@artiely.dev',
      birthday: '1991-09-27',
      province: '四川省成都市高新区天府大道 966 号',
      desc: '测试工程师，负责自动化回归',
      remark: '需补充发票',
      motor: { licence: '川E·6T4W9' }
    },
    order: { remark: '加急处理', rate: 5, createtime: '2019-10-24 16:05:00' }
  },
  {
    userinfo: {
      id: 6,
      name: '孙八',
      color: '#13c2c2',
      tel: '15926290465',
      email: 'sunba@artiely.dev',
      birthday: '1986-01-30',
      province: '湖北省武汉市洪山区珞喻路 1037 号',
      desc: '项目经理，负责交付节奏',
      remark: '下周约会议',
      motor: { licence: '鄂F·9Y3H5' }
    },
    order: { remark: '普通', rate: 3, createtime: '2019-10-25 08:50:00' }
  },
  {
    userinfo: {
      id: 7,
      name: '周九',
      color: '#fa541c',
      tel: '15926290466',
      email: 'zhoujiu@artiely.dev',
      birthday: '1994-12-18',
      province: '江苏省南京市鼓楼区中山北路 200 号',
      desc: '数据分析师，负责指标体系',
      remark: '已发送报价单',
      motor: { licence: '苏G·2L8C4' }
    },
    order: { remark: '普通', rate: 4, createtime: '2019-10-26 13:20:00' }
  },
  {
    userinfo: {
      id: 8,
      name: '吴十',
      color: '#2f54eb',
      tel: '15926290467',
      email: 'wushi@artiely.dev',
      birthday: '1989-06-06',
      province: '陕西省西安市雁塔区高新四路 9 号',
      desc: '运维工程师，负责容器平台',
      remark: '续约意向明确',
      motor: { licence: '陕H·4B7N6' }
    },
    order: { remark: '加急处理', rate: 5, createtime: '2019-10-27 17:45:00' }
  }
]

onMounted(() => {
  api.ORDER_LIST()
    .then((v: any) => {
      data.value = (v && v.list) || []
    })
    .catch(() => {
      // 接口异常（原 easy-mock 服务已停服）时用兜底数据渲染，保证页面可用
      data.value = FALLBACK_LIST
    })
    .finally(() => {
      // 必须放在 finally：否则接口失败时 loading 永远为 true，页面会一直转圈
      loading.value = false
    })
})

function onChangeTableColumn(val: any) {
  const cols = columns.value
  const i = Number(val.target.value)
  cols[i].hidden = cols[i].hidden ? !cols[i].hidden : true
  columns.value = [...cols]

  console.log('TCL: onChangeTableColumn -> val', val)
}

function onChangeSize(val: boolean) {
  size.value = val ? 'small' : 'default'
}

function onChangeBorder(val: boolean) {
  bordered.value = val
}

function clipboardSuccess() {
  message.info('已复制到粘贴板')
}

function clipboardError() {
  message.info('复制失败')
}

function handleEdit(text: any, record: any) {
  console.log('TCL: handleEdit -> record', record)
  console.log('TCL: handleEdit -> text', text)
  showForm.value = true
  defaultData.value = record
}
</script>

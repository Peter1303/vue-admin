<template>
  <div>
    <a-spin :spinning="loading">
      <a-row :gutter="24" style="margin-bottom: 25px">
        <a-col :lg="8" :md="8" :sm="24" :xs="24">
          <card-chart
            :data="dataBar"
            :loading="loading"
            :transform="transform"
            subTitle="查看每个列以获取更多详细信息"
            title="每日销售"
            type="bar"
          ></card-chart>
        </a-col>
        <a-col :lg="8" :md="8" :sm="24" :xs="24">
          <card-chart
            :data="dataPie"
            :loading="loading"
            subTitle="利润在客户之间分享"
            title="分享利益"
            type="pie"
          ></card-chart>
        </a-col>
        <a-col :lg="8" :md="8" :sm="24" :xs="24">
          <card-chart
            :data="dataTriangle"
            :loading="loading"
            subTitle="按城市划分的收入变化细分"
            title="收入变化"
            type="triangle"
          ></card-chart>
        </a-col>
      </a-row>
      <a-card>
        <div id="timeline-chart" ref="timelineRef"></div>
      </a-card>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import {nextTick, onMounted, ref} from 'vue'
import ApexCharts from 'apexcharts'
import {api} from '@core'
import CardChart from './template/card-chart.vue'

type ApexOptions = NonNullable<ConstructorParameters<typeof ApexCharts>[1]>

defineOptions({name: 'DashboardWorkplace'})

const timelineRef = ref<HTMLDivElement | null>(null)

const dataTriangle = ref<unknown[]>([])
const dataPie = ref<unknown[]>([])
const transform = ref<Record<string, unknown>>({})
const dataBar = ref<unknown[]>([])
const loading = ref(false)

onMounted(() => {
  getData()
  nextTick(() => {
    render()
  })
})

/** 生成按天的时间序列（原实现是 render() 内部被提升的函数声明，这里提到顶层，行为一致） */
function generateDayWiseTimeSeries(s: number, count: number): [number, number][] {
  const values = [
    [4, 3, 10, 9, 29, 19, 25, 9, 12, 7, 19, 5, 13, 9, 17, 2, 7, 5],
    [2, 3, 8, 7, 22, 16, 23, 7, 11, 5, 12, 5, 10, 4, 15, 2, 6, 2]
  ]
  let i = 0
  const series: [number, number][] = []
  let x = new Date('11 Nov 2012').getTime()
  while (i < count) {
    series.push([x, values[s][i]])
    x += 86400000
    i++
  }
  return series
}

// 图表配置原样保留（apexcharts 与框架无关，不随 Vue 2/3 变化）
function render() {
  // ⚠️ apexcharts 的官方类型里没有声明 `chart.scroller.scrollButtons`
  // 与 `chart.dropShadow.enabledSeries`（运行时是支持的），
  // 因此这里整体断言为 ApexOptions，跳过对象字面量的多余属性检查。
  const options = {
    chart: {
      type: 'area',
      height: 300,
      foreColor: '#999',
      scroller: {
        enabled: true,
        track: {
          height: 7,
          background: '#e0e0e0'
        },
        thumb: {
          height: 10,
          background: '#94E3FF'
        },
        scrollButtons: {
          enabled: true,
          size: 9,
          borderWidth: 2,
          borderColor: '#008FFB',
          fillColor: '#008FFB'
        },
        padding: {
          left: 30,
          right: 20
        }
      },
      stacked: true,
      dropShadow: {
        enabled: true,
        enabledSeries: [0],
        top: -2,
        left: 2,
        blur: 5,
        opacity: 0.06
      }
    },
    colors: ['#00E396', '#0090FF'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    dataLabels: {
      enabled: false
    },
    series: [
      {
        name: 'Total Views',
        data: generateDayWiseTimeSeries(0, 18)
      },
      {
        name: 'Unique Views',
        data: generateDayWiseTimeSeries(1, 18)
      }
    ],
    markers: {
      size: 0,
      strokeColor: '#fff',
      strokeWidth: 3,
      strokeOpacity: 1,
      fillOpacity: 1,
      hover: {
        size: 6
      }
    },
    xaxis: {
      type: 'datetime',
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      tickAmount: 4,
      min: 0,
      labels: {
        offsetX: 24,
        offsetY: -5
      },
      tooltip: {
        enabled: true
      }
    },
    grid: {
      padding: {
        left: -5,
        right: 5
      }
    },
    tooltip: {
      x: {
        format: 'dd MMM yyyy'
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left'
    },
    fill: {
      type: 'solid',
      fillOpacity: 0.7
    }
  } as unknown as ApexOptions

  // 原用 document.querySelector('#timeline-chart')，改用模板 ref（保留原 id）
  const el = timelineRef.value
  if (!el) return

  const chart = new ApexCharts(el, options)
  chart.render()
}

function getData() {
  loading.value = true
  api
    .GET_DASHBOARD()
    .then((res) => {
      const r = res as {
        data?: {
          dataTriangle?: unknown[]
          dataPie?: unknown[]
          transform?: Record<string, unknown>
          dataBar?: unknown[]
        }
      }
      nextTick(() => {
        // 原实现这四行都用了 Object.freeze（此处保留该语义）。
        // Object.freeze 的返回类型是 readonly 数组，与 ref<unknown[]> 的可变类型不兼容，
        // 故显式断言回可变类型；数据本身只读，运行时行为不变。
        dataTriangle.value = Object.freeze(r.data?.dataTriangle ?? []) as unknown[]
        dataPie.value = Object.freeze(r.data?.dataPie ?? []) as unknown[]
        transform.value = Object.freeze(r.data?.transform ?? {})
        dataBar.value = Object.freeze(r.data?.dataBar ?? []) as unknown[]
      })
    })
    .catch(() => {
      // 接口异常（原 easy-mock 服务已停服）时用兜底数据渲染，保证页面可用
      transform.value = {
        type: 'fold',
        fields: ['本月', '上月'],
        key: 'name',
        value: 'value'
      }
      dataBar.value = [
        {城市: '北京', 本月: 32, 上月: 24},
        {城市: '上海', 本月: 45, 上月: 31},
        {城市: '广州', 本月: 28, 上月: 35},
        {城市: '深圳', 本月: 38, 上月: 29}
      ]
      dataPie.value = [
        {type: '线上', value: 42},
        {type: '门店', value: 31},
        {type: '代理', value: 27}
      ]
      dataTriangle.value = [
        {type: '华北', value: 46},
        {type: '华东', value: 38},
        {type: '华南', value: 34},
        {type: '西部', value: 22}
      ]
    })
    .finally(() => {
      // 必须放在 finally：否则接口失败时 loading 永远为 true，页面会一直转圈
      loading.value = false
    })
}
</script>

<style scoped>
</style>

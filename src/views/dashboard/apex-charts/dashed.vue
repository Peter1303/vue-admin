<template>
  <div id="chart" ref="chartRef"></div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import ApexCharts from 'apexcharts'

// apexcharts 用 `export = ApexCharts` + namespace 暴露选项类型，
// 从构造函数第二个参数反推类型，跨版本都成立。
type ApexOptions = NonNullable<ConstructorParameters<typeof ApexCharts>[1]>

defineOptions({name: 'ApexDashed'})

const chartRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  renderChart()
})

// 图表配置原样保留（apexcharts 与框架无关，不随 Vue 2/3 变化）
function renderChart() {
  const options: ApexOptions = {
    chart: {
      height: 350,
      type: 'line',
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: [2, 2, 2],
      curve: 'straight',
      dashArray: [0, 8, 5]
    },
    series: [
      {
        name: 'Session Duration',
        data: [45, 52, 38, 24, 33, 26, 21, 20, 6, 8, 15, 10]
      },
      {
        name: 'Page Views',
        data: [35, 41, 62, 42, 13, 18, 29, 37, 36, 51, 32, 35]
      },
      {
        name: 'Total Visits',
        data: [87, 57, 74, 99, 75, 38, 62, 47, 82, 56, 45, 47]
      }
    ],
    title: {
      text: 'Page Statistics',
      align: 'left'
    },
    markers: {
      size: 0,

      hover: {
        sizeOffset: 6
      }
    },
    xaxis: {
      categories: [
        '01 Jan',
        '02 Jan',
        '03 Jan',
        '04 Jan',
        '05 Jan',
        '06 Jan',
        '07 Jan',
        '08 Jan',
        '09 Jan',
        '10 Jan',
        '11 Jan',
        '12 Jan'
      ]
    },
    tooltip: {
      y: [
        {
          title: {
            // 原为 function (val) {...}，形参隐式 any 会在 strict 下报错，显式标注
            formatter: (val: any) => `${val} (mins)`
          }
        },
        {
          title: {
            formatter: (val: any) => `${val} per session`
          }
        },
        {
          title: {
            formatter: (val: any) => val
          }
        }
      ]
    },
    grid: {
      borderColor: '#f1f1f1'
    }
  }

  const el = chartRef.value
  if (!el) return

  const chart = new ApexCharts(el, options)
  chart.render()
}
</script>

<style></style>

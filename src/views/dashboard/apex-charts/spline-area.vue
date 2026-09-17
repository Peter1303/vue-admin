<template>
  <div>
    <div id="chart2" ref="chartRef"></div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import ApexCharts from 'apexcharts'

type ApexOptions = NonNullable<ConstructorParameters<typeof ApexCharts>[1]>

defineOptions({name: 'ApexSplineArea'})

const chartRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  renderChart()
})

// 图表配置原样保留（apexcharts 与框架无关，不随 Vue 2/3 变化）
function renderChart() {
  const options: ApexOptions = {
    chart: {
      height: 350,
      type: 'area'
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: [2, 2]
    },
    series: [
      {
        name: 'series1',
        data: [31, 40, 28, 51, 42, 109, 100]
      },
      {
        name: 'series2',
        data: [11, 32, 45, 32, 34, 52, 41]
      }
    ],

    xaxis: {
      type: 'datetime',
      categories: [
        '2018-09-19T00:00:00',
        '2018-09-19T01:30:00',
        '2018-09-19T02:30:00',
        '2018-09-19T03:30:00',
        '2018-09-19T04:30:00',
        '2018-09-19T05:30:00',
        '2018-09-19T06:30:00'
      ]
    },
    tooltip: {
      x: {
        format: 'dd/MM/yy HH:mm'
      }
    }
  }

  const el = chartRef.value
  if (!el) return

  const chart = new ApexCharts(el, options)
  chart.render()
}
</script>

<style></style>

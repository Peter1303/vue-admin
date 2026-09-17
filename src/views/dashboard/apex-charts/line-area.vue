<template>
  <div id="chart4" ref="chartRef"></div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import ApexCharts from 'apexcharts'

type ApexOptions = NonNullable<ConstructorParameters<typeof ApexCharts>[1]>

defineOptions({name: 'ApexLineArea'})

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
      stacked: false
    },
    stroke: {
      width: [0, 1, 2],
      curve: 'smooth'
    },
    plotOptions: {
      bar: {
        columnWidth: '50%'
      }
    },
    colors: ['#3A5794', '#A5C351', '#E14A84'],
    series: [
      {
        name: 'Facebook',
        type: 'column',
        data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30]
      },
      {
        name: 'Vine',
        type: 'area',
        data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43]
      },
      {
        name: 'Dribbble',
        type: 'line',
        data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39]
      }
    ],
    fill: {
      opacity: [0.85, 0.25, 1],
      gradient: {
        inverseColors: false,
        shade: 'light',
        type: 'vertical',
        opacityFrom: 0.85,
        opacityTo: 0.55,
        stops: [0, 100, 100, 100]
      }
    },
    labels: [
      '01/01/2003',
      '02/01/2003',
      '03/01/2003',
      '04/01/2003',
      '05/01/2003',
      '06/01/2003',
      '07/01/2003',
      '08/01/2003',
      '09/01/2003',
      '10/01/2003',
      '11/01/2003'
    ],
    markers: {
      size: 0
    },
    xaxis: {
      type: 'datetime'
    },
    yaxis: {
      min: 0
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        // 原 function (y) { if (typeof y !== 'undefined') return y.toFixed(0) + ' views'; return y }
        formatter: (y: any) => {
          if (typeof y !== 'undefined') {
            return `${y.toFixed(0)} views`
          }
          return y
        }
      }
    },
    legend: {
      labels: {
        useSeriesColors: true
      },
      markers: {
        customHTML: [() => '', () => '', () => '']
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

<template>
  <div id="chart3" ref="chartRef"></div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import ApexCharts from 'apexcharts'

// apexcharts 用 `export = ApexCharts` + namespace 暴露选项类型，
// 直接写 ApexCharts.ApexOptions 在不同版本间不稳定；
// 从构造函数第二个参数反推类型，跨版本都成立。
type ApexOptions = NonNullable<ConstructorParameters<typeof ApexCharts>[1]>

defineOptions({name: 'ApexColumnCharts'})

const chartRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  renderChart()
})

// 图表配置原样保留：apexcharts 是与框架无关的库，与 Vue 2/3 无关，不做任何改写
function renderChart() {
  const colors = [
    '#008FFB',
    '#00E396',
    '#FEB019',
    '#FF4560',
    '#775DD0',
    '#546E7A',
    '#26a69a',
    '#D10CE8'
  ]
  const options: ApexOptions = {
    chart: {
      height: 350,
      type: 'bar',
      events: {
        // apexcharts 的事件签名（event, chartContext, config）未导出可用类型，显式标注 any
        click: (chart: any, w: any, e: any) => {
          console.log(chart, w, e)
        }
      }
    },
    colors: colors,
    plotOptions: {
      bar: {
        columnWidth: '45%',
        distributed: true
      }
    },
    dataLabels: {
      enabled: false
    },
    series: [
      {
        data: [21, 22, 10, 28, 16, 21, 13, 30]
      }
    ],
    xaxis: {
      categories: ['John', 'Joe', 'Jake', 'Amber', 'Peter', 'Mary', 'David', 'Lily'],
      labels: {
        style: {
          colors: colors,
          fontSize: '14px'
        }
      }
    }
  }

  // 原用 document.querySelector('#chart3')，返回类型是 Element | null，
  // 且会与页面上其他同名 id 冲突；改用模板 ref（同时保留 id 属性不影响样式）
  const el = chartRef.value
  if (!el) return

  const chart = new ApexCharts(el, options)
  chart.render()
}
</script>

<style></style>

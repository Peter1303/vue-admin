<template>
  <div class="chart-min-chart-wrapper">
    <a-card :bordered="false" :loading="loading" hoverable>
      <div class="chart-min-chart">
        <div class="main">
          <v-count-to
            :decimals="decimals"
            :endVal="countValue"
            :prefix="prefix"
            :separator="separator"
            style="font-size: 34px"
          ></v-count-to>
          <a-tooltip>
            <template #title> 说明</template>
            <a-icon class="help-icon" type="question-circle"/>
          </a-tooltip>
          <p>{{ desc }}</p>
        </div>
        <div :id="'uuid' + id" ref="chartRef" class="min-chart"></div>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import {ref, watch} from 'vue'
import {v4 as uuidv4} from 'uuid'
import ApexCharts from 'apexcharts'
import {layout} from '@layouts'

type ApexOptions = NonNullable<ConstructorParameters<typeof ApexCharts>[1]>

defineOptions({name: 'ChartMinChart'})

interface Props {
  color?: string
  separator?: string
  countValue?: number
  decimals?: number
  desc?: string
  prefix?: string
  opacity?: number
  type?: string
  data?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  color: '#DCE6EC',
  opacity: 0.3,
  type: 'area',
  data: () => [15, 75, 47, 65, 14, 2, 41, 54, 4, 27, 15]
})

// 原 data(): id: uuid()（uuid 已升到 v14，改为具名导入的 v4）
const id = uuidv4()
const loading = ref(false)

// 原 data() 里把 layout 暴露给了实例；当前模板未引用，保留以维持原状
const layoutRef = layout
void layoutRef

const chartRef = ref<HTMLDivElement | null>(null)

// 原 watch: { data: { handler(){ this.renderChart() }, deep: true } }
watch(
  () => props.data,
  () => {
    renderChart()
  },
  {deep: true}
)

// ⚠️ 原 mounted 里的 renderChart() 是被注释掉的（见下方原注释），
// 也就是说这个图表**只在 data 变化时才渲染**，首屏是空的。
// 这是原代码的既有行为，迁移中未擅自恢复，避免改变页面表现。
//   mounted () {
//     // this.$nextTick(() => {
//     //   this.renderChart()
//     // })
//   }

// 图表配置原样保留（apexcharts 与框架无关，不随 Vue 2/3 变化）
function renderChart() {
  const options: ApexOptions = {
    chart: {
      type: props.type,
      height: 55,
      sparkline: {
        enabled: true
      }
    },
    colors: [props.color],
    fill: {
      opacity: props.opacity
    },
    stroke: {
      width: [2],
      curve: 'smooth'
    },
    series: [
      {
        // 原为 this.data ? this.data : [...]（注意空数组在 JS 里是真值），保持同样判断
        data: props.data ? props.data : [3, 4, 5, 7, 9]
      }
    ],
    tooltip: {
      fixed: {
        enabled: false
      },
      x: {
        show: false
      },
      y: {
        title: {
          // 原为 `function (seriesName)`，strict 下形参需显式标注
          formatter: (_seriesName: unknown) => ''
        }
      },
      marker: {
        show: false
      }
    }
  }
  // 原用 document.querySelector('#uuid' + this.id)，返回 Element|null 且受全局 id 影响；
  // 改用模板 ref，并保留原 id 属性
  const el = chartRef.value
  if (!el) return
  new ApexCharts(el, options).render()
}
</script>

<style lang="less" scoped>
.chart-min-chart-wrapper {
  margin-bottom: 25px;

  .chart-min-chart {
    width: 100%;
    height: 100%;
    min-height: 150px;
    position: relative;
    overflow: hidden;

    .main {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    }

    .help-icon {
      position: absolute;
      right: 0;
      top: 0;
    }

    .min-chart {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
    }
  }
}
</style>

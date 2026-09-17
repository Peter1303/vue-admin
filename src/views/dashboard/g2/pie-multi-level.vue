<template>
  <div :id="id"></div>
</template>

<script lang="ts" setup>
import {onMounted} from 'vue'
import {v4 as uuidv4} from 'uuid'
// 修复 @antv/component 的 tooltip crosshairs 崩溃，必须在 new G2.Chart() 之前加载
import '@/shims/g2-tooltip-crosshairs'
import G2 from '@antv/g2'
import {DataSet} from '@antv/data-set'

defineOptions({name: 'G2PieMultiLevel'})

const id = `uuid${uuidv4()}`

const DataView = DataSet.DataView

const data = [
  {value: 251, type: '大事例一', name: '子事例一'},
  {value: 1048, type: '大事例一', name: '子事例二'},
  {value: 610, type: '大事例二', name: '子事例三'},
  {value: 434, type: '大事例二', name: '子事例四'},
  {value: 335, type: '大事例三', name: '子事例五'},
  {value: 250, type: '大事例三', name: '子事例六'}
]

onMounted(() => {
  renderChart()
})

// 图表绘制逻辑原样保留（G2 v3 与框架无关，不随 Vue 2/3 变化）
function renderChart() {
  // 通过 DataSet 计算百分比
  const dv = new DataView()
  dv.source(data).transform({
    type: 'percent',
    field: 'value',
    dimension: 'type',
    as: 'percent'
  })
  const chart = new G2.Chart({
    container: id,
    forceFit: true,
    height: 400,
    padding: 0
  })
  chart.source(dv, {
    percent: {
      // 原为 `function formatter (val)`，strict 下形参需显式标注类型
      formatter: (val: number) => `${(val * 100).toFixed(2)}%`
    }
  })
  chart.coord('theta', {
    radius: 0.5
  })
  chart.tooltip({
    showTitle: false
  })
  chart.legend(false)
  chart
    .intervalStack()
    .position('percent')
    .color('type')
    .label('type', {
      offset: -10
    })
    .tooltip('name*percent', (item: unknown, percent: number) => ({
      name: item,
      value: `${(percent * 100).toFixed(2)}%`
    }))
    .select(false)
    .style({
      lineWidth: 1,
      stroke: '#fff'
    })

  const outterView = chart.view()
  const dv1 = new DataView()
  dv1.source(data).transform({
    type: 'percent',
    field: 'value',
    dimension: 'name',
    as: 'percent'
  })
  outterView.source(dv1, {
    percent: {
      formatter: (val: number) => `${(val * 100).toFixed(2)}%`
    }
  })
  outterView.coord('theta', {
    innerRadius: 0.5 / 0.75,
    radius: 0.75
  })
  outterView
    .intervalStack()
    .position('percent')
    .color('name', ['#BAE7FF', '#7FC9FE', '#71E3E3', '#ABF5F5', '#8EE0A1', '#BAF5C4'])
    .label('name')
    .tooltip('name*percent', (item: unknown, percent: number) => ({
      name: item,
      value: `${(percent * 100).toFixed(2)}%`
    }))
    .select(false)
    .style({
      lineWidth: 1,
      stroke: '#fff'
    })

  chart.render()
}
</script>

<style></style>

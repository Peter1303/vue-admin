<template>
  <div :id="id"></div>
</template>

<script lang="ts" setup>
import {v4 as uuidv4} from 'uuid'
// 修复 @antv/component 的 tooltip crosshairs 崩溃，必须在 new G2.Chart() 之前加载
import '@/shims/g2-tooltip-crosshairs'
import G2 from '@antv/g2'
import {useG2Chart} from '../g2-theme'
import type {G2ThemeOption} from '../g2-theme'

defineOptions({name: 'G2Pie'})

// REVIEW(迁移): 原代码是 `id: uuid + uuid()` —— 把**函数本身**拼进了字符串
// （大概是 `'uuid' + uuid()` 的笔误），于是 id 形如 "function uuid(){...}xxxxx"。
// 这里保留「函数本身参与拼接」的原语义，只把 uuid 换成 uuid v14 的具名导出。
// 若确认是笔误，可改成 `\`uuid${uuidv4()}\``。
const id = String(uuidv4) + uuidv4()

const data = [
  {item: '事例一', count: 40, percent: 0.4},
  {item: '事例二', count: 21, percent: 0.21},
  {item: '事例三', count: 17, percent: 0.17},
  {item: '事例四', count: 13, percent: 0.13},
  {item: '事例五', count: 9, percent: 0.09}
]

// 深色下 g2 的 canvas 颜色要重建才能跟随主题，挂载/重建/清理统一交给 useG2Chart
useG2Chart(id, renderChart)

// 图表绘制逻辑原样保留（G2 v3 与框架无关，不随 Vue 2/3 变化）
// 仅新增：① 接收主题并透传给 G2.Chart；② 返回实例供 useG2Chart 销毁重建
function renderChart(theme: G2ThemeOption): G2.Chart {
  const chart = new G2.Chart({
    container: id,
    forceFit: true,
    height: 400,
    animate: false,
    theme
  })
  chart.source(data, {
    percent: {
      // 原为 `function formatter (val)`，strict 下形参需显式标注类型
      formatter: (val: number) => `${val * 100}%`
    }
  })
  chart.coord('theta', {
    radius: 0.75,
    innerRadius: 0.6
  })
  chart.tooltip({
    showTitle: false,
    itemTpl:
      '<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
  })
  // 辅助文本
  // ⚠️ 原来把 `color:#8c8c8c` 写在内联 style 上，深色下无法跟随主题（内联样式还压过
  //    cover.less 的普通规则）。改为类名，配色统一由 cover.less 的 .g2-pie-center 给。
  chart.guide().html({
    position: ['50%', '50%'],
    html: '<div class="g2-pie-center">主机<br><span>200</span>台</div>',
    alignX: 'middle',
    alignY: 'middle'
  })
  const interval = chart
    .intervalStack()
    .position('percent')
    .color('item')
    .label('percent', {
      // 原为 `function formatter (val, item)`
      formatter: (val: unknown, item: { point: { item: string } }) => `${item.point.item}: ${val}`
    })
    .tooltip('item*percent', (item: unknown, percent: number) => ({
      name: item,
      value: `${percent * 100}%`
    }))
    .style({
      lineWidth: 1,
      stroke: '#fff'
    })
  chart.render()
  // ⚠️ G2 v3 的 Geom 类型面没有声明 setSelected（运行时是存在的），
  // 因此这里显式收窄一次，避免 strict 下报「属性不存在」。
  ;(interval as unknown as { setSelected(d: unknown): void }).setSelected(data[0])
  return chart
}
</script>

<style></style>

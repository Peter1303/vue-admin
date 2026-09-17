<template>
  <div :id="props.id"></div>
</template>

<script lang="ts" setup>
/**
 * g2 柱状图示例（独立组件，按容器 id 挂载）
 * ------------------------------------------------------------
 * 图表库保持 @antv/g2 的 v3 API 原样（`new G2.Chart` / `chart.source` / `chart.interval()`），
 * 这些跟 Vue 2/Vue 3 无关，不随迁移变化。
 *
 * 注意：本组件在当前 src 内**没有任何引用**（原项目同样是死代码），
 * 但 tsconfig 的 include 覆盖 src/**\/*.vue，所以仍会被类型检查，需保持可编译。
 */
import {onMounted} from 'vue'
// 修复 @antv/component 的 tooltip crosshairs 崩溃，必须在 new G2.Chart() 之前加载
import '@/shims/g2-tooltip-crosshairs'
import G2 from '@antv/g2'

defineOptions({name: 'ChartBar'})

const props = defineProps<{ id?: string }>()

const data = [
  {
    year: '1951 年',
    sales: 38
  },
  {
    year: '1952 年',
    sales: 52
  },
  {
    year: '1956 年',
    sales: 61
  },
  {
    year: '1957 年',
    sales: 145
  },
  {
    year: '1958 年',
    sales: 48
  },
  {
    year: '1959 年',
    sales: 38
  },
  {
    year: '1960 年',
    sales: 38
  },
  {
    year: '1962 年',
    sales: 38
  },
  {
    year: '1963 年',
    sales: 100
  },
  {
    year: '1964 年',
    sales: 38
  },
  {
    year: '1965 年',
    sales: 38
  },
  {
    year: '1966 年',
    sales: 38
  }
]

/**
 * @antv/g2 3.x 的 d.ts 对 `new Chart()` 返回实例上的部分方法（source / scale / render 等）
 * 标注不全，直接用推断类型会在 strict 下报错，这里显式声明本项目用到的那几个方法。
 * （原 data() 里还有一个 `timer: null`，全文件从未使用，迁移时未保留。）
 */
interface ChartLike {
  source(data: unknown): void

  scale(field: string, config: unknown): void

  interval(): { position(expression: string): void }

  render(): void
}

let chart: ChartLike | null = null

onMounted(() => {
  // 原写法 `container: this.id`；props.id 类型上可为 undefined，
  // 而 g2 的 container 只接受 string | HTMLElement
  const container = props.id
  if (!container) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chart = new G2.Chart({
    container,
    forceFit: true,
    height: 300
  }) as unknown as ChartLike

  chart.source(data)
  chart.scale('sales', {
    tickInterval: 20
  })
  chart.interval().position('year*sales')
  chart.render()
})
</script>

<style>
</style>

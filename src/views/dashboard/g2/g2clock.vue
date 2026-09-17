<template>
  <div>
    <div id="clock"></div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted} from 'vue'
// 修复 @antv/component 的 tooltip crosshairs 崩溃，必须在 new G2.Chart() 之前加载
import '@/shims/g2-tooltip-crosshairs'
import G2 from '@antv/g2'

defineOptions({name: 'G2Clock'})

interface G2ShapePoint {
  x: number
  y: number
}

interface G2ShapeCfg {
  points: G2ShapePoint[]
  color: string
}

interface G2ShapeContainer {
  addShape(type: string, opts: { attrs: Record<string, unknown> }): unknown
}

/** draw 里的 `this` 是 G2 注入的 shape 实例，strict 下必须显式声明 this 类型 */
interface G2ShapeThis {
  parsePath(path: unknown[]): unknown
}

const data = [
  {type: '分类一', value: 20},
  {type: '分类二', value: 18},
  {type: '分类三', value: 32},
  {type: '分类四', value: 15},
  {type: 'Other', value: 15}
]

onMounted(() => {
  render()
})

function render() {
  // 可以通过调整这个数值控制分割空白处的间距，0-1 之间的数值
  const sliceNumber = 0.01

  // 自定义 other 的图形，增加两条线
  // ⚠️ G2 v3 的 .d.ts 把 registerShape 声明为可选方法，strict 下必须用可选调用（?.）
  // 逻辑与原来完全一致：只是给 interval 注册一个名为 sliceShape 的图形。
  G2.Shape.registerShape?.('interval', 'sliceShape', {
    draw: function draw(
      this: G2ShapeThis,
      cfg: G2ShapeCfg,
      container: G2ShapeContainer
    ) {
      const points = cfg.points
      const path: unknown[] = []
      path.push(['M', points[0].x, points[0].y])
      path.push(['L', points[1].x, points[1].y - sliceNumber])
      path.push(['L', points[2].x, points[2].y - sliceNumber])
      path.push(['L', points[3].x, points[3].y])
      path.push('Z')
      const parsed = this.parsePath(path)
      return container.addShape('path', {
        attrs: {
          fill: cfg.color,
          path: parsed
        }
      })
    }
  })

  const chart = new G2.Chart({
    container: 'clock',
    forceFit: true,
    height: 300
  })

  chart.source(data)
  chart.coord('theta', {
    innerRadius: 0.75
  })
  chart.tooltip({
    showTitle: false
  })
  chart.intervalStack().position('value').color('type').shape('sliceShape')

  chart.render()
}
</script>

<style scoped>
</style>

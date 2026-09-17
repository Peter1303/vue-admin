<template>
  <div :id="id"></div>
</template>

<script lang="ts" setup>
import {onMounted} from 'vue'
import {v4 as uuidv4} from 'uuid'
// 修复 @antv/component 的 tooltip crosshairs 崩溃，必须在 new G2.Chart() 之前加载
import '@/shims/g2-tooltip-crosshairs'
import G2 from '@antv/g2'

defineOptions({name: 'G2PiePlatelets'})

const id = `uuid${uuidv4()}`

interface Pt {
  x: number
  y: number
}

interface G2ShapeCfg {
  points: Pt[]
  color: string
}

interface G2ShapeContainer {
  addShape(type: string, opts: { attrs: Record<string, unknown> }): unknown
}

/** draw 里的 `this` 是 G2 注入的 shape 实例，strict 下必须显式声明 this 类型 */
interface G2ShapeThis {
  parsePoint(p: Pt): Pt

  parsePoints(ps: Pt[]): Pt[]
}

/** G2 v3 的 ChartProps.padding 联合类型没覆盖「2 元数值数组」，抽个别名便于断言 */
type G2ChartPadding = NonNullable<G2.ChartProps['padding']>

const data = [
  {type: '分类一', value: 27},
  {type: '分类二', value: 25},
  {type: '分类三', value: 18},
  {type: '分类四', value: 15},
  {type: '分类五', value: 10},
  {type: 'Other', value: 5}
]

// 根据比例，获取两点之间的点
function getPoint(p0: Pt, p1: Pt, ratio: number): Pt {
  return {
    x: (1 - ratio) * p0.x + ratio * p1.x,
    y: (1 - ratio) * p0.y + ratio * p1.y
  }
}

onMounted(() => {
  renderChart()
})

// 图表绘制逻辑原样保留（G2 v3 与框架无关，不随 Vue 2/3 变化）
function renderChart() {
  const pointRatio = 0.7 // 设置开始变成圆弧的位置 0.7
  // 可以通过调整这个数值控制分割空白处的间距，0-1 之间的数值
  const sliceNumber = 0.005

  // 自定义 other 的图形，增加两条线
  // registerShape 在 d.ts 里是可选的，strict 下用可选调用
  G2.Shape.registerShape?.('interval', 'platelet', {
    draw: function draw(
      this: G2ShapeThis,
      cfg: G2ShapeCfg,
      container: G2ShapeContainer
    ) {
      cfg.points[1].y = cfg.points[1].y - sliceNumber
      cfg.points[2].y = cfg.points[2].y - sliceNumber
      let centerPoint: Pt = {
        x: cfg.points[3].x,
        y: (cfg.points[2].y + cfg.points[3].y) / 2
      }
      centerPoint = this.parsePoint(centerPoint)
      const points = this.parsePoints(cfg.points)
      const path: unknown[] = []
      const tmpPoint1 = getPoint(points[0], points[3], pointRatio)
      const tmpPoint2 = getPoint(points[1], points[2], pointRatio)
      path.push(['M', points[0].x, points[0].y])
      path.push(['L', tmpPoint1.x, tmpPoint1.y])
      path.push(['Q', points[3].x, points[3].y, centerPoint.x, centerPoint.y])
      path.push(['Q', points[2].x, points[2].y, tmpPoint2.x, tmpPoint2.y])
      path.push(['L', points[1].x, points[1].y])
      path.push(['z'])
      return container.addShape('path', {
        attrs: {
          fill: cfg.color,
          path: path
        }
      })
    }
  })

  const chart = new G2.Chart({
    container: id,
    forceFit: true,
    height: 400,
    // 运行时支持 [上下, 左右] 的 2 元数值写法，d.ts 未覆盖，故断言
    padding: [70, 70] as unknown as G2ChartPadding
  })

  chart.source(data)
  chart.coord('theta')
  chart.intervalStack().position('value').color('type').shape('platelet').label('type')

  chart.render()
}
</script>

<style></style>

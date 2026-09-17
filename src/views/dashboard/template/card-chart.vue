<template>
  <div>
    <a-card :body-style="{ padding: 0 }" class="card-chart">
      <h3 class="title">{{ title }}</h3>
      <p class="sub-title">{{ subTitle }}</p>
      <div :id="id" ref="chartRef" class="chart-box"></div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import {nextTick, ref, watch} from 'vue'
import {v4 as uuidv4} from 'uuid'
// 修复 @antv/component 的 tooltip crosshairs 崩溃，必须在 new G2.Chart() 之前加载
import '@/shims/g2-tooltip-crosshairs'
import G2 from '@antv/g2'
import DataSet from '@antv/data-set'

defineOptions({name: 'card-chart'})

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
  parsePath(path: unknown[]): unknown

  parsePoint(p: Pt): Pt

  parsePoints(ps: Pt[]): Pt[]
}

/** G2 v3 的 ChartProps.padding 联合类型没覆盖「2 元数值数组」，抽个别名便于断言 */
type G2ChartPadding = NonNullable<G2.ChartProps['padding']>

const props = withDefaults(
  defineProps<{
    title?: string
    subTitle?: string
    data?: unknown[] | Record<string, unknown>
    type?: string
    transform?: Record<string, unknown>
    loading?: boolean
  }>(),
  {
    title: undefined,
    subTitle: undefined,
    data: undefined,
    type: undefined,
    transform: undefined,
    loading: undefined
  }
)

// 原 data(): id: 'uuid' + uuid()（uuid 已升到 v14，改为具名导入的 v4）
const id = `uuid${uuidv4()}`
const chartRef = ref<HTMLDivElement | null>(null)

// 原 this.chart：G2 实例不该进响应式系统（会被 Proxy 包一层，影响性能且易出怪问题），
// 因此用普通变量承载，语义与 this.chart 一致。
let chart: G2.Chart | null = null

// 根据比例，获取两点之间的点
function getPoint(p0: Pt, p1: Pt, ratio: number): Pt {
  return {
    x: (1 - ratio) * p0.x + ratio * p1.x,
    y: (1 - ratio) * p0.y + ratio * p1.y
  }
}

// 原 watch: { data: { handler(){ this.render() }, deep: true } }
watch(
  () => props.data,
  () => {
    render()
  },
  {deep: true}
)

// 原 mounted() {} 是空函数，未主动渲染（与 chart-min-chart.vue 一致）

function render() {
  nextTick(() => {
    if (props.type === 'bar') {
      renderChart()
    } else if (props.type === 'pie') {
      renderChartPie()
    } else if (props.type === 'triangle') {
      renderChartTriangle()
    }
  })
}

// 图表绘制逻辑原样保留（G2 v3 与框架无关，不随 Vue 2/3 变化）
function renderChart() {
  // 此处数据使用了按行组织的模式，所以需要使用 DataSet 的 fold 方法对数据进行加工
  const ds = new DataSet()
  const dv = ds.createView().source(props.data)
  const transform = props.transform ?? {}
  dv.transform(transform)

  chart = new G2.Chart({
    container: id,
    forceFit: true,
    height: 120,
    // 运行时支持 [上下, 左右] 的 2 元数值写法，d.ts 未覆盖，故断言
    padding: [0, 0] as unknown as G2ChartPadding
  })
  chart.source(dv)
  chart
    .intervalStack()
    .position(`${String(transform.key)}*${String(transform.value)}`)
    .color('name', ['#e1e1ef', '#20c997'])
  chart.render()
}

function renderChartPie() {
  // 可以通过调整这个数值控制分割空白处的间距，0-1 之间的数值
  const sliceNumber = 0.01

  // 自定义 other 的图形，增加两条线
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

  chart = new G2.Chart({
    container: id,
    forceFit: true,
    height: 120,
    // 4 元形式在 d.ts 的联合类型里有声明（0 和 'auto' 都满足 number|string）
    padding: [0, 'auto', 0, 0]
  })
  const view = chart.view({
    start: {
      x: 0,
      y: 0
    },
    end: {
      x: 0.8,
      y: 1
    }, // 视图绘图区域的起始点，x、y 数值在 0 - 1 范围内
    // 视图绘图区域的结束点，x、y 数值在 0 - 1 范围内
    padding: 0
  })
  chart.legend({
    position: 'right-center'
    // offsetX: -100
  })

  view.source(props.data)
  view.coord('theta', {
    innerRadius: 0.75
  })
  // ⚠️ G2 v3 的 View 类型把 tooltip 收窄成了 boolean，
  // 但运行时支持完整配置对象（Chart 的声明就是 TooltipConfig）；这里显式收窄一次。
  ;(view as unknown as G2.Chart).tooltip({
    showTitle: false
  })
  view.intervalStack().position('value').color('type').shape('sliceShape')

  chart.render()
}

function renderChartTriangle() {
  const pointRatio = 0.7 // 设置开始变成三角形的位置 0.7

  // 自定义 other 的图形，增加两条线
  G2.Shape.registerShape?.('interval', 'triangleShape', {
    draw: function draw(
      this: G2ShapeThis,
      cfg: G2ShapeCfg,
      container: G2ShapeContainer
    ) {
      let centerPoint: Pt = {
        x: cfg.points[3].x,
        y: (cfg.points[2].y + cfg.points[3].y) / 2
      }
      centerPoint = this.parsePoint(centerPoint)

      const points = this.parsePoints(cfg.points)
      const tmpPoint1 = getPoint(points[0], points[3], pointRatio)
      const tmpPoint2 = getPoint(points[1], points[2], pointRatio)
      const path: unknown[] = []
      path.push(['M', points[0].x, points[0].y])
      path.push(['L', points[1].x, points[1].y])
      path.push(['L', tmpPoint2.x, tmpPoint2.y])
      path.push(['L', centerPoint.x, centerPoint.y])
      path.push(['L', tmpPoint1.x, tmpPoint1.y])
      path.push('Z')
      return container.addShape('path', {
        attrs: {
          fill: cfg.color,
          path: path,
          lineWidth: 1,
          stroke: 'white'
        }
      })
    }
  })

  chart = new G2.Chart({
    container: id,
    forceFit: true,
    height: 120,
    padding: [0, 'auto', 0, 0]
  })
  const view = chart.view({
    start: {
      x: 0,
      y: 0
    },
    end: {
      x: 0.8,
      y: 1
    }, // 视图绘图区域的起始点，x、y 数值在 0 - 1 范围内
    // 视图绘图区域的结束点，x、y 数值在 0 - 1 范围内
    padding: 0
  })
  chart.legend({
    position: 'right-center'
    // offsetX: -100
  })
  view.source(props.data)
  view.coord('theta', {
    radius: 1
  })
  view.intervalStack().position('value').color('type').shape('triangleShape')

  chart.render()
}
</script>

<style lang="less">
.card-chart {
  padding: 25px;
  height: 260px;
  border-radius: 4px;
  // border: 1px solid ;
  box-shadow: 0 0 13px 0 rgba(82, 63, 105, 0.05);
  position: relative;
  margin-bottom: 25px;

  .chart-box {
    position: absolute;
    left: 25px;
    right: 25px;
    bottom: 25px;
  }

  .title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 0;
    color: #595d6e;
  }

  .sub-title {
    font-size: 12px;
    display: inline-block;
    color: #74788d;
  }
}
</style>

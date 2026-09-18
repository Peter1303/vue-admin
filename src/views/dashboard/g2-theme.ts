/**
 * @antv/g2 图表的「深色可读性」适配
 * ============================================================
 * 背景：g2 v3 是 **canvas** 渲染 —— 坐标轴刻度、数据标签、图例文字都是画进画布的像素，
 * 颜色在**绘制那一刻**由主题决定，CSS 完全够不着。
 * 这和 apexcharts（SVG `fill` 属性 + HTML 图例，能用 cover.less 纯 CSS 覆盖）是两码事，
 * 别把两套修法混在一起看。
 *
 * 深色（卡片底 #141414）下的实测症状：
 *   · 数据标签 / 坐标轴刻度  #545454        → 对比度 2.4（WCAG 阈值 3）
 *   · 图例文字              #8C8C8C        → 4.9，勉强
 *   · 网格线 / 轴线          #E9E9E9 / #BFBFBF → 黑底上一片惨白，比文字还抢眼
 *   · tooltip              白底 rgba(255,255,255,.9) + rgb(87,87,87) 字
 *                          （且是**内联样式**写在 .g2-tooltip 上，CSS 得靠 !important 才压得住）
 *
 * 修法：给 `new G2.Chart({ theme })` 传一份**只改颜色**的主题对象。
 *   · g2 自带 `theme: 'dark'`，但不合用：它会把绘图区背景刷成 #1F1F1F（卡片里凭空多出
 *     一块发亮的矩形），图例文字反而更暗（#737373，对比度 3.6 < 出厂的 4.9）。
 *     本项目要的只是「看得清」，不是换一套皮肤。
 *   · 传对象会被 `chart/view.js:_setTheme()` 走 `Util.deepMix(viewTheme, Global, newTheme)`
 *     —— **逐键深合并**在出厂主题之上，所以只写要改的叶子，其余原样继承。
 *   · 浅色一律返回 `undefined`：`_setTheme()` 里 `isObject` 与「已知主题名」都不匹配时
 *     `newTheme` 保持 `{}`（**没有 else 分支**），等价于不传 ⇒ 浅色与改造前逐像素一致。
 *
 * ⚠️ canvas 颜色是绘制期写死的 ⇒ **切主题必须重建图表实例**，光改主题对象对已渲染的
 *    图表没有任何作用。所以这里同时给出 `useG2Chart()`，把「挂载渲染 / 主题变化重建 /
 *    卸载清理」收在一处，避免 5 个组件各写一遍（漏一处就有一个图表不跟随主题）。
 *
 * ⚠️ 只覆盖**默认主题里已经存在的键**。默认主题里 `axis.left.line/tickLine` 是 `null`
 *    （左轴本来不画轴线），若补上 `line: {stroke}` 会凭空画出一条轴线 —— 那是功能回归，
 *    不是配色问题。下面 `axis` 各分支用 spread 拼装就是为了只碰该碰的键。
 */
import type G2 from '@antv/g2'
import {onBeforeUnmount, onMounted, watch} from 'vue'
import {resolvedTheme} from '@layouts'
import type {ResolvedTheme} from '@layouts'

/** `G2.ChartProps.theme` 的取值（g2 的 d.ts 里就是 `Object | string`） */
export type G2ThemeOption = Record<string, unknown> | undefined

// ------------------------------------------------------------
// 深色取值：与 theme-runtime.less 的 `html[data-theme='dark']` 令牌对齐
//   --text-color           rgba(255,255,255,.85)
//   --text-color-secondary rgba(255,255,255,.65)
//   --popover-background   #1f1f1f
// canvas 只吃具体色值（`fillStyle = 'var(--x)'` 是无效的），所以这里必须写字面量。
// ------------------------------------------------------------
const DARK_TEXT = 'rgba(255, 255, 255, 0.85)'
const DARK_TEXT_SECONDARY = 'rgba(255, 255, 255, 0.65)'
const DARK_AXIS_LINE = 'rgba(255, 255, 255, 0.25)'
const DARK_SPLIT_LINE = 'rgba(255, 255, 255, 0.15)'
const DARK_POPOVER_BG = '#1f1f1f'

/**
 * 生成 g2 图表主题
 * 浅色返回 undefined（= 不传），深色返回只含改动项的对象。
 */
export function g2Theme(theme: ResolvedTheme): G2ThemeOption {
  if (theme !== 'dark') return undefined

  // 各轴的公共片段：分开命名是为了「只拼该轴默认已有的键」（见文件顶部第 2 条注意）
  const label = {label: {textStyle: {fill: DARK_TEXT_SECONDARY}}}
  const lineAndTick = {line: {stroke: DARK_AXIS_LINE}, tickLine: {stroke: DARK_AXIS_LINE}}
  const grid = {grid: {lineStyle: {stroke: DARK_SPLIT_LINE}}}
  const legendText = {textStyle: {fill: DARK_TEXT_SECONDARY}, unCheckColor: 'rgba(255, 255, 255, 0.3)'}

  return {
    // 坐标轴刻度（散点图 / 柱状图用得到）。默认 top/bottom 有 line+tickLine、无 grid；
    // left/right 有 grid、line 与 tickLine 是 null；circle/radius 两者都有。
    axis: {
      top: {...label, ...lineAndTick},
      bottom: {...label, ...lineAndTick},
      left: {...label, ...grid},
      right: {...label, ...grid},
      circle: {...label, ...lineAndTick, ...grid},
      radius: {...label, ...lineAndTick, ...grid},
      // 默认 helix 的 label/grid 都是 null，只改线
      helix: {...lineAndTick}
    },

    // 数据标签（环形图外圈的「事例五: 9%」）—— 是内容，用主文字色
    label: {textStyle: {fill: DARK_TEXT}},

    // 图例（canvas 绘制，不是 DOM）
    legend: {top: legendText, bottom: legendText, left: legendText, right: legendText},

    // guide().text() 的辅助文字
    guide: {text: {style: {fill: DARK_TEXT}}, line: {text: {style: {fill: DARK_TEXT}}}},

    // 提示框：出厂是白底 + rgb(87,87,87) 字（内联样式），深色下就是一块白板
    tooltip: {
      'g2-tooltip': {
        backgroundColor: DARK_POPOVER_BG,
        color: DARK_TEXT,
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.75)'
      }
    },

    // 折线 / 散点的十字准星：出厂是 rgba(0,0,0,.25) 的线（深色下消失）
    // + #CCD6EC 的矩形（深色下刺眼）
    tooltipCrosshairsLine: {lineStyle: {stroke: 'rgba(255, 255, 255, 0.45)'}},
    tooltipCrosshairsRect: {rectStyle: {fill: '#ffffff', opacity: 0.08}}
  }
}

/**
 * g2 图表的生命周期封装
 * ------------------------------------------------------------
 * @param containerId 图表容器的 DOM id（g2 的 `container` 就是按 id 找元素的）
 * @param render      真正的绘制逻辑，返回图表实例（供销毁）。拿到 theme 后应把它
 *                    原样传给 `new G2.Chart({ theme })`
 * @param immediate   是否在 mounted 时立刻渲染一次。默认 true；card-chart 这类
 *                    「只在数据变化时才画」的历史行为要传 false 才不会被改掉
 * @returns 手动重绘的函数（数据变化时用）
 *
 * ⚠️ 重建必须**同时清空容器**：`chart.destroy()` 只摘掉它自己创建的 canvas wrapper，
 *    而 tooltip 的 DOM 是挂在容器里的**兄弟节点**，不一起清掉的话每切一次主题就多
 *    攒一个（探针里 `.g2-tooltip` 的 `querySelector` 会先命中陈旧的孤儿节点，
 *    表现为「改了样式却没生效」这种极难排查的假象）。
 */
export function useG2Chart(
  containerId: string,
  render: (theme: G2ThemeOption) => G2.Chart | null | undefined,
  {immediate = true}: {immediate?: boolean} = {}
): (theme?: G2ThemeOption) => void {
  let chart: G2.Chart | null = null

  function teardown(): void {
    if (chart) {
      try {
        chart.destroy()
      } catch {
        // 实例可能已随容器一起被移除，销毁失败不影响后面的重建
      }
      chart = null
    }
    const el = document.getElementById(containerId)
    if (el) el.innerHTML = ''
  }

  function redraw(theme: G2ThemeOption = g2Theme(resolvedTheme.value)): void {
    teardown()
    chart = render(theme) ?? null
  }

  if (immediate) onMounted(() => redraw(g2Theme(resolvedTheme.value)))
  // canvas 颜色是绘制期写死的，主题一变只能重建（见文件顶部说明）
  watch(resolvedTheme, () => redraw(g2Theme(resolvedTheme.value)), {flush: 'post'})
  onBeforeUnmount(teardown)

  return redraw
}

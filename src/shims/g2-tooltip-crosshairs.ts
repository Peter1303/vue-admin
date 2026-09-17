/**
 * G2 tooltip crosshairs 崩溃修复（副作用模块）
 * ============================================================
 * ⚠️ 用法：凡是 import G2 的地方，都要在顶部加一行
 *      import '@/shims/g2-tooltip-crosshairs'
 *    它必须在 `new G2.Chart()` 之前执行（ESM 的 import 会被提升，放在哪一行都行）。
 *
 * ------------------------------------------------------------
 * 【现象】
 *   直角坐标系下的散点图 / 折线图 / 面积图 / 柱状图（point / line / area / interval）
 *   只要调用 `chart.render()`，就必然抛：
 *
 *     TypeError: Cannot create property 'lineStyle' on boolean 'false'
 *       at _mix            (@antv/util 的 mix)
 *       at mergeStyles     (@antv/component/src/tooltip/html.js)
 *       at new HtmlTooltip
 *       at TooltipController.renderTooltip
 *       at Chart.render
 *
 *   图既画不出来，tooltip 也不可用。极坐标（theta）图表不受影响。
 *
 * 【原因】@antv/component@0.3.10 的 HtmlTooltip 构造函数：
 *
 *     const TooltipTheme = { crosshairs: false, offset: 15, ... }   // ← 这里是布尔 false
 *
 *     function mergeStyles(styles, cfg) {
 *       Object.keys(styles).forEach(k => {
 *         if (cfg[k]) styles[k] = Util.mix(styles[k], cfg[k])       // ← 崩在这
 *       })
 *     }
 *     this.style = mergeStyles(TooltipTheme, cfg)
 *
 *   而 g2 的 TooltipController._getDefaultTooltipCfg()（lib/chart/controller/tooltip.js）
 *   会在「直角坐标系 + line/area/point（TYPE_SHOW_CROSSHAIRS）」时把 crosshairs 换成
 *   tooltipCrosshairsLine（= `{ lineStyle: {...} }`），
 *   在「直角坐标系 + interval」时换成 tooltipCrosshairsRect（= `{ type: 'rect', rectStyle: {...} }`）。
 *
 *   于是 mergeStyles 里就会执行 `Util.mix(false, { lineStyle })`，
 *   而 @antv/util 的 mix 不判断 target 是否为对象，直接往布尔值上挂属性 → 抛错。
 *
 * 【为什么迁移到 Vue 3 才“炸全站”】
 *   Vue 2 遇到组件内未捕获的错误只 console.error，调度器不受影响；
 *   Vue 3 在 dev 下 handleError() 会**重新抛出**，而生命周期钩子里
 *   pauseTracking() / resetTracking() 之间没有 try/finally，
 *   flushPostFlushCbs 也没有 try/catch —— 错误一旦逃逸，
 *   shouldTrack 会永久停在 false、isFlushing 会永久停在 true，
 *   整个应用从此不再响应任何交互（路由、菜单、抽屉全部点不动，且不可恢复）。
 *   详见 main.ts 里 errorHandler 的注释。
 *
 * 【修法】给每张图的 tooltip 配置兜底补上 `crosshairs: false`：
 *   · crosshairs: false 本来就是 G2 主题里 tooltip 的默认值
 *     （@antv/component/src/tooltip/theme.js 就是 `crosshairs: false`），
 *     显式传 false 只是把这个默认值真正落实，不改变设计意图；
 *   · 显式 false 之后 mergeStyles 里的 `if (cfg[k])` 不成立，不会走到 mix，崩溃消失；
 *   · 实测：直角坐标 point / line / area / interval 全部恢复正常，tooltip 可用，
 *     只是不再绘制十字瞄准线 —— 原代码本来也画不出来（每次都崩在创建 tooltip 那一步）。
 *   · 用户显式配置了 crosshairs 时以用户配置为准，不会被覆盖。
 *
 * 兜底做在 render() 上而不是只改 tooltip()：
 *   实测「完全没调用 chart.tooltip()」的图表同样会崩 —
 *   _getDefaultTooltipCfg() 用的是 chart 的 options.tooltip，缺失时也会走到默认分支。
 */
import G2 from '@antv/g2'

interface G2ChartOptions {
  tooltip?: Record<string, unknown> | boolean
}

interface G2ChartLike {
  get?: (key: string) => unknown
  render?: (...args: unknown[]) => unknown
}

interface G2Constructor {
  prototype?: G2ChartLike
}

let installed = false

/** 把 options.tooltip.crosshairs 兜底成 false（用户显式配置优先，tooltip: false 不动） */
function ensureCrosshairsOff(chart: G2ChartLike): void {
  if (typeof chart.get !== 'function') return

  const options = chart.get('options') as G2ChartOptions | undefined
  if (!options || typeof options !== 'object') return

  // 用户显式 chart.tooltip(false) 关闭了 tooltip，保持原样
  if (options.tooltip === false) return

  if (!options.tooltip || typeof options.tooltip !== 'object') {
    options.tooltip = {}
  }
  if (options.tooltip.crosshairs === undefined) {
    options.tooltip.crosshairs = false
  }
}

export function installG2TooltipCrosshairsFix(): void {
  if (installed) return
  installed = true

  const g2 = G2 as unknown as { Chart?: G2Constructor; View?: G2Constructor }

  // Chart 继承自 View，但 tooltip / render 两边各自覆写过，所以两个原型都要覆盖
  const prototypes = [g2.Chart?.prototype, g2.View?.prototype].filter(
    (p): p is G2ChartLike => !!p
  )

  prototypes.forEach((proto) => {
    const rawRender = proto.render
    if (typeof rawRender !== 'function') return

    proto.render = function (this: G2ChartLike, ...args: unknown[]) {
      ensureCrosshairsOff(this)
      return rawRender.apply(this, args)
    }
  })
}

installG2TooltipCrosshairsFix()

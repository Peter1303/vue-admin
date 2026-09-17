<script lang="ts" setup>
/**
 * 主题模式图标（浅色 / 深色 / 自动）
 * ============================================================
 * 为什么不直接 `<a-icon type="bulb">` / `type="skin"` / `type="desktop"`：
 *
 * ① **语义不对**。`skin` 在图标集里是「皮肤（衣服）」，和深色毫无关系；
 *    `bulb` 只能勉强算「亮」。业界（Tailwind / GitHub / Next 文档的主题切换）统一用
 *    太阳 / 月亮 / 显示器 这组，用户不需要猜。本项目自带的 iconfont（265 个）里
 *    **没有**日月图标，`@ant-design/icons-vue` 这一版也**没有** Moon/Sun，
 *    所以这 3 个只能自己画。
 *
 * ② **大小突兀**。三个 iconfont 图标（时钟/锁/全屏）实测：
 *      viewBox 1024×1024，字面只占 160..864（**占盒 0.688**），笔画 64 单位
 *      ⇒ 22px 盒子里字面 ≈ 15.1px、笔画 ≈ 1.38px
 *    而 antd 的 outline 图标（viewBox `64 64 896 896`）字面几乎撑满：
 *      search 19.6px（0.893）、**bulb 高度 22px（占满 1.0）**
 *    ⇒ 灯泡比邻居高 35%，插在中间就是「突兀」的来源。
 *
 * 因此这里**按 iconfont 的坐标系作画**，而不是缩放 antd 的图标：
 *   · viewBox `0 0 1024 1024`（与 iconfont 精灵图同坐标系）
 *   · 所有墨迹收在 **160..864** 这个 704 安全区内（占盒 0.688，与邻居逐位对齐）
 *   · 统一 `stroke-width="64"` + 圆头圆角（换算到 22px 就是 1.38px，与邻居同重）
 *   · 描边色用 `currentColor` ⇒ 自动跟随 v-button 的文字色（含 hover / 深色模式）
 *
 * 三个图形都内接在同一个「直径 640 的外接圆」里（圆心 512,512，半径 320），
 * 所以它们与时钟/锁的**视觉外径完全一致**，不会一个胖一个瘦。
 */
import type {ThemeMode} from '../observable/layout'

defineOptions({name: 'ThemeIcon'})

defineProps<{ mode: ThemeMode }>()
</script>

<template>
  <!--
    `width/height = 1em`：与 @ant-design/icons 的做法一致，
    于是字号从哪儿来就跟着哪儿走 —— 顶栏按钮里 Button.vue 给了 `.anticon{font-size:22px}`，
    下拉菜单里 antd 给菜单项字号，两处都不用特殊照顾。
    `aria-hidden`：纯装饰，语义由旁边的文字/悬浮提示承担。
  -->
  <span class="anticon theme-mode-icon" aria-hidden="true">
    <!-- 浅色：太阳 -->
    <svg v-if="mode === 'light'" viewBox="0 0 1024 1024" width="1em" height="1em" focusable="false">
      <g
        fill="none"
        stroke="currentColor"
        stroke-width="64"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <!-- 核心圆：中线半径 144（含 64 笔画后外径 176，占安全区的一半） -->
        <circle cx="512" cy="512" r="144"/>
        <!--
          8 道光芒：同一条竖线绕圆心每 45° 转一次。
          中线从 r=250 到 r=320，两端圆头各 32 ⇒ 墨迹 r=218..352；
          与核心圆（外径 176）之间留 42 的缝隙，整体墨迹正好 704 = 安全区。
          比例按常见线稿太阳取：核心 50% / 缝隙 6% / 光芒 19%（改前是 46% / 11% / 16%，
          光芒偏短、缝偏大，远看像「小刺球」）。
        -->
        <line v-for="a in 8" :key="a" x1="512" y1="262" x2="512" y2="192" :transform="`rotate(${(a - 1) * 45} 512 512)`"/>
      </g>
    </svg>

    <!--
      深色：月牙
      ------------------------------------------------------------
      两条圆弧拼成，都是「描边」而非填充，所以粗细天然与其它图标一致：
        · 外弧 = 半径 320 的圆，从上角 (738,286) 逆时针走 270° 到下角 (738,738)
          （sweep=0 = 逆时针，large-arc=1 因为跨了 270°）
        · 内弧 = 「咬掉」的那口，圆心 (708,512)、半径 228，
          从下角顺时针 195° 回到上角，途中经过该圆的西极 (480,512)
          —— 它决定了月牙最厚处的厚度（中线 480-192 = 288，约外径的 45%）
        上下两个尖角就是两弧的交点（圆头圆角处理），左缘墨迹落在 160、上缘 160、下缘 864。
    -->
    <svg v-else-if="mode === 'dark'" viewBox="0 0 1024 1024" width="1em" height="1em" focusable="false">
      <g
        fill="none"
        stroke="currentColor"
        stroke-width="64"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M738 286A320 320 0 1 0 738 738A228 228 0 1 1 738 286Z"/>
      </g>
    </svg>

    <!--
      自动：显示器（= 跟随系统，与菜单文字「自动（跟随系统）」呼应）
      ------------------------------------------------------------
      屏幕 640×480（rx 64 只做轻微圆角）、支架、底座三段；
      三者竖着拼起来墨迹恰好 160..864，横着也 160..864，与时钟那个圆等比。
    -->
    <svg v-else viewBox="0 0 1024 1024" width="1em" height="1em" focusable="false">
      <g
        fill="none"
        stroke="currentColor"
        stroke-width="64"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="192" y="192" width="640" height="480" rx="64"/>
        <line x1="512" y1="672" x2="512" y2="800"/>
        <line x1="400" y1="832" x2="624" y2="832"/>
      </g>
    </svg>
  </span>
</template>

<style scoped>
/*
 * 只做两件事：
 *  ① 把 `svg` 钉成 1em（antd 的 .anticon 里 svg 尺寸来自 width/height 属性，
 *     但某些全局规则会改，这里显式钉住更稳）；
 *  ② `fill:none` 兜一道 —— 万一某处 CSS 往 svg 上写了 `fill: currentColor`
 *     （antd 图标就是这种写法），CSS 会**覆盖**同名表现属性，描边图标会被填成实心。
 *     （子元素各自写了 fill="none"/stroke，属性自身优先于继承，不受影响。）
 */
.theme-mode-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.theme-mode-icon > svg {
  width: 1em;
  height: 1em;
  fill: none;
}
</style>

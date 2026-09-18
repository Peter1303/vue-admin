<script lang="ts" setup>
/**
 * 主题模式图标（浅色 / 深色 / 自动）
 * ============================================================
 * 为什么不直接 `<a-icon type="bulb">` / `type="skin"` / `type="desktop"`：
 *
 * ① **语义不对**。`skin` 在图标集里是「皮肤（衣服）」，和深色毫无关系；
 *    `bulb` 只能勉强算「亮」，`desktop` 与「自动」也隔了一层。业界（Tailwind / GitHub /
 *    Next 文档的主题切换）统一用 太阳 / 月牙 / 调色盘 这组，用户不需要猜。
 *    本项目自带的 iconfont（265 个）里**没有**日月图标，`@ant-design/icons-vue`
 *    这一版也**没有** Moon/Sun，所以这 3 个只能自己画。
 *
 * ② **月牙的朝向要对齐 emoji**。月牙是「镜像敏感」图形：开口朝左还是朝右，一眼就能看出别扭。
 *    这里不用手感判断 —— 把真实渲染的 🌙 截图取像素量：**墨迹质心相对包围盒中心在 227°**
 *    （y 轴向下坐标系：0°=右 / 90°=下 / 270°=上）⇒ 肉在右下、开口朝**左上 45°**，
 *    两个尖角落在正上、正左。改朝向时请以这个数为准。
 *
 * ③ **大小突兀**。三个 iconfont 图标（时钟/锁/全屏）实测：
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
 * 墨迹包围盒**都是 160..864 的正方形**，所以它们与时钟/锁的视觉外径完全一致。
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
      深色：月牙（朝向 = emoji 🌙）
      ------------------------------------------------------------
      ⚠️ 月牙的**朝向**不能凭手感画。实测真实渲染的 🌙（Segoe UI Emoji，取截图像素量）：
        墨迹质心相对包围盒中心的方向 = **227°**（y 轴向下坐标系：0°=右、90°=下、270°=上）
        ⇒ 月牙的「肉」在**右下**、开口朝**左上 45°**，两个尖角落在**正上**和**正左**。
      （曾经画成开口朝右的「C」（肉在左），看着就是「反了」——月牙是镜像敏感的图形。）

      两条圆弧拼成，都是「描边」而非填充，所以粗细天然与其它图标一致：
        · 外弧 = 半径 320 的圆（圆心就是盒子中心 512,512），从**正上**(512,192)
          顺时针走 270° 到**正左**(192,512)（sweep=1 = 顺时针，large-arc=1 因为跨了 270°）
        · 内弧 = 「咬掉」的那口，半径 228，圆心在开口方向（左上 45°）上距中心 198.3，
          从正左顺时针回到正上，途中经过中心右下方 30 处的 (533,533)
        ⇒ 最厚处 = 外弧最远点 (738,738) 到内弧最近点 (533,533) ≈ 290，约外径的 45%（与 emoji 肥瘦相当）
        两个尖角就是两弧的交点，正好落在**正上 / 正左**的轴线上。
        于是墨迹包围盒 = **160..864 的正方形**（704，占盒 0.688），与太阳、调色盘、
        以及 iconfont 的时钟/锁完全同框 —— 之前那版横向只有 610 且整体偏左 47，
        插在顶栏里会显得整个图标往左歪。
    -->
    <svg v-else-if="mode === 'dark'" viewBox="0 0 1024 1024" width="1em" height="1em" focusable="false">
      <g
        fill="none"
        stroke="currentColor"
        stroke-width="64"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M512 192A320 320 0 1 1 192 512A228 228 0 1 0 512 192Z"/>
      </g>
    </svg>

    <!--
      自动：调色盘（画板）
      ------------------------------------------------------------
      语义：自动 = 由系统/程序挑配色 ⇒ 调色盘比「显示器」更贴题，也与菜单文字对应。
      三笔：
        · 盘身 = 半径 320 的整圆（圆心即盒子中心），在**右下 45°** 方向被半径 190 的圆挖掉一口：
          挖口圆心距中心 400（挖到 210 为止，即咬掉 34% 半径），开口跨圆周约 56°
          ⇒ 墨迹仍取到四个正方向的极值，包围盒 160..864 正方形
        · 3 个颜料点 = 半径 76 的**实心**圆（fill 而非 stroke，刻意与描边区分），
          摆在距中心 175 的圆弧上、角度 195°/270°/345°，正对着挖口的反方向
      在 22px 下：点直径 ≈ 3.3px、挖口宽 ≈ 6.7px，都还看得清（见 memory 里的 22px 取证图）。
    -->
    <svg v-else viewBox="0 0 1024 1024" width="1em" height="1em" focusable="false">
      <g
        fill="none"
        stroke="currentColor"
        stroke-width="64"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M817.81 606.24A320 320 0 1 0 606.24 817.81A190 190 0 0 1 817.81 606.24Z"/>
        <circle cx="343" cy="466.7" r="76" fill="currentColor" stroke="none"/>
        <circle cx="512" cy="337" r="76" fill="currentColor" stroke="none"/>
        <circle cx="681" cy="466.7" r="76" fill="currentColor" stroke="none"/>
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

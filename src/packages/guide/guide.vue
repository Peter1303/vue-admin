<template>
  <span></span>
</template>

<script lang="ts" setup>
import type {Config, DriverHook, DriveStep} from 'driver.js'
/**
 * 引导组件 —— driver.js 0.9.7 → 1.8.0 迁移
 * ------------------------------------------------------------
 * v0.9 写法：`new Driver({...})` + `driver.defineSteps([...])` + `driver.start()`
 * v1 写法：`driver({ steps, ... })` 在配置里直接传 steps，`driver().drive()` 启动，`driver().destroy()` 销毁。
 * 步骤结构沿用父组件传入的 `steps`（已是 v1 的 `element` / `popover:{title,description}` 形态），只做透传。
 * 原 `onNext` / `onPrevious` 在 v1 里对应 `onNextClick` / `onPrevClick`，这里做映射以保留原有回调意图。
 * 父组件（views/widgets/guide.vue、views/live/workspace.vue）通过 `ref="guide"` 调 `start()`，故用 defineExpose 暴露。
 *
 * ⚠️ 除了钩子名，v1 还有一批**配置项改名**。旧键在 v1 里既不报错也不生效（静默失效），
 * 所以这里按 v1 的 Config 类型逐个校正：
 *   className         → popoverClass
 *   opacity           → overlayOpacity
 *   padding           → stagePadding
 *   overlayClickNext  → overlayClickBehavior（false 映射为 'close'：
 *                       配合 allowClose: false，效果同样是「点遮罩不前进也不关闭」）
 *   closeBtnText      → v1 的 Config 已无此项；且本项目 allowClose: false，
 *                       v1 不渲染关闭按钮，本就不需要
 */
import {driver} from 'driver.js'
import 'driver.js/dist/driver.css'

defineOptions({name: 'v-guide'})

const props = withDefaults(
  defineProps<{
    steps?: DriveStep[]
    onNext?: DriverHook
    onPrevious?: DriverHook
  }>(),
  {
    steps: () => [],
    onNext: undefined,
    onPrevious: undefined
  }
)

let driverInstance: ReturnType<typeof driver> | null = null

function start() {
  // 按 driver.js v1 的 Config 类型书写（键名已从 v0.9 校正，见文件头说明）
  const config: Config = {
    popoverClass: 'scoped-class', // 原 v0.9 的 className：包裹 driver.js popover 的类名
    animate: true, // 切换高亮元素时是否播放动画
    overlayOpacity: 0.75, // 原 v0.9 的 opacity：遮罩不透明度
    stagePadding: 10, // 原 v0.9 的 padding：高亮区域四周留白
    allowClose: false, // 点击遮罩是否关闭
    overlayClickBehavior: 'close', // 原 v0.9 的 overlayClickNext: false（不前进；配合 allowClose 也不关闭）
    doneBtnText: '完成', // 最后一步按钮文案
    nextBtnText: '下一步', // 下一步按钮文案
    prevBtnText: '上一步',
    // v1 的钩子名是 onNextClick / onPrevClick
    onNextClick: props.onNext,
    onPrevClick: props.onPrevious,
    steps: props.steps
  }
  driverInstance = driver(config)
  // 原 start()
  driverInstance.drive()
}

function destroy() {
  driverInstance?.destroy()
  driverInstance = null
}

defineExpose({start, destroy})
</script>

<style>

</style>

<script lang="ts" setup>
/**
 * <AIconFont> 兼容转发组件
 * ------------------------------------------------------------
 * ⚠️ 这里是迁移期的高危点，改动前务必读完：
 *
 * 原实现（antdv 1）是纯 JS 模块，直接导出第三方组件自带的 name：
 *    import { Icon } from 'ant-design-vue'
 *    const IconFont = Icon.createFromIconfontCN({ scriptUrl: '...' })
 *    export default IconFont          // 该组件自带 name: 'AIconFont'
 * 然后由 packages/index.js 的 `Vue.component(ctrl.name, ctrl)` 按自带 name 注册。
 *
 * antdv 4 已移除 `Icon.createFromIconfontCN`（搬到了 @ant-design/icons-vue）。
 * 若保留旧写法，`Icon.createFromIconfontCN(...)` 是 undefined 调用 →
 * 模块**求值阶段**就抛 TypeError；而 packages/index.ts 用的是
 * `import.meta.glob(..., { eager: true })`，会在启动时加载本目录下所有 .vue，
 * 于是整个应用白屏、且报错点离真正原因很远。
 *
 * 真实实现已统一收敛到 @/shims/AIconFont.vue，
 * 由 plugins/index.ts 显式注册为全局标签 `<a-iconfont>`（模板里实际使用的就是这个）。
 * 本文件仅做转发，保留 `AIconFont` 这个名字，避免老代码里出现过的
 * `<AIconFont>` / `<a-icon-font>` 标签变成未解析元素（静默降级）。
 */
import AIconFont from '@/shims/AIconFont.vue'

// inheritAttrs: false + 显式 v-bind="$attrs"，避免与子组件二次透传重复绑定
defineOptions({name: 'AIconFont', inheritAttrs: false})

// 透传目标（shims/AIconFont.vue）把 type 声明为必填 prop，
// 因此转发层也要显式声明并传入，否则仅靠 $attrs（类型上是 {}）过不了类型检查
const props = defineProps<{ type: string }>()
</script>

<template>
  <AIconFont :type="props.type" v-bind="$attrs"/>
</template>

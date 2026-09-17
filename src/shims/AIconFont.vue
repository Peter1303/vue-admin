<script lang="ts" setup>
/**
 * <a-iconfont> 兼容组件
 * ------------------------------------------------------------
 * 原实现（packages/IconFont/IconFont.vue）直接 export 了
 * `Icon.createFromIconfontCN({...})` 的返回值，靠 packages/index.js 的
 * `Vue.component(ctrl.name, ctrl)` 用组件内置 name 注册。
 * antdv 4 里 createFromIconfontCN 搬到了 @ant-design/icons-vue，
 * 且这种「依赖第三方组件自带 name」的自动注册在 <script setup> 下不可靠，
 * 因此这里包一层并显式声明 name，由 main.ts 固定注册为 a-iconfont。
 */
import {createFromIconfontCN} from '@ant-design/icons-vue'

defineOptions({name: 'AIconFont'})

/**
 * 显式声明 type 而不是只靠 `v-bind="$attrs"`：
 * createFromIconfontCN 返回的组件把 `type` 标成了必填 prop，
 * 仅透传 attrs（类型上等价于 `{}`）过不了类型检查。
 */
const props = defineProps<{ type: string }>()

// 保留原 scriptUrl，不改动 iconfont 资源
const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_1326052_lr1bez3k2nc.js'
})
</script>

<template>
  <component :is="IconFont" :type="props.type"/>
</template>

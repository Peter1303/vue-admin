<template>
  <div style="height: 100%">
    <component :is="currentLayout">
      <slot>
        <router-page></router-page>
      </slot>
    </component>
    <more-group></more-group>
    <scroll-top></scroll-top>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'
import layout1 from './layout1.vue'
import layout2 from './layout2.vue'
import moreGroup from './more-group.vue'
import scrollTop from './scroll-top.vue'
import routerPage from './router-page.vue'
import {layout} from '@layouts'

defineOptions({name: 'LayoutDefault'})

/**
 * ⚠️ 这是迁移中最容易踩的一处「语义静默变化」，务必保留显式映射的写法。
 *
 * 原代码：
 *   import { layout } from '../observable/layout'
 *   export default {
 *     components: { layout1, layout2 },
 *     computed: { layout () { return layout.layoutShap } }   // ← 故意遮蔽 import
 *   }
 * 模板 `<component :is="layout">` 拿到的是字符串 'layout1' / 'layout2'，
 * 再由 components 注册表解析成组件。
 *
 * 如果把 computed 改成别的名字（批量转换工具极易这么做），
 * 模板里的 `layout` 就会解析到 import 进来的 store 对象，
 * `<component :is="对象">` 抛 "Component is missing template or render function"，
 * 整棵布局（侧边栏 + 内容区）渲染成空白，而控制台里只有几条 Vue warn、没有 pageerror。
 *
 * 这里改为直接映射到组件对象，不再依赖「字符串 → 注册表」的隐式解析。
 */
const currentLayout = computed(() => (layout.layoutShap === 'layout2' ? layout2 : layout1))
</script>

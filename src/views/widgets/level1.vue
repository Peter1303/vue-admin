<template>
  <div>
    <v-home>
      <!--
        ⚠️ 这一层 `.level1-page` 不能省。

        本页是唯一「自己包一层布局」的页面（路由 `/level1` 在 routes.ts 里是顶层记录、没有父级布局壳），
        它把 `<v-card>` 直接塞进 `<v-home>` 的插槽 —— 而 default.vue 的插槽会**整体替换** `<router-page>`，
        所以 layout/router-page.vue 里那段 `padding: 24px` 的留白对它完全不生效。

        表现：固定布局下这一页的卡片顶边落在 109px（内容区顶边），距标签条只剩 4px，
        而其它页面是 133px（留白 28px）；左右也少 24px 缩进、卡片比别的页面宽 48px。
        补上同宽的内边距后与其它页面一致。
      -->
      <div class="level1-page">
        <v-card>我是一级可点击菜单
          <!-- <h1>{{ a.b.c }}</h1> -->
        </v-card>
      </div>
    </v-home>
  </div>
</template>

<script lang="ts" setup>
import {reactive} from 'vue'
// ⚠️ 这里必须用 HomeAsync，不能用 Home。
// `loader()` 返回的是裸函数：放在路由的 component 位没问题，
// 但放在模板位时 Vue 3 会把它当普通函数组件直接调用，返回值 Promise
// 会被渲染成字面量 [object Promise]（Vue 2 会把裸函数隐式当异步组件工厂，故原来能用）。
// 详见 src/layouts/index.ts 顶部说明。
import {HomeAsync as VHome} from '@layouts'

const a = reactive({
  b: {
    c: false
  }
})
</script>

<style lang="scss" scoped>
// 与 layout/router-page.vue 里给普通路由的留白对齐（24px）
.level1-page {
  padding: 24px;
}
</style>

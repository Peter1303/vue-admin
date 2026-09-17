/**
 * 页面组件模板（`script/generateView.mts` 使用）
 * ============================================================
 * 由 `template.js` 迁移为 TypeScript（`.mts`，理由同 vite.config.mts：包内没有 `"type": "module"`，
 * 用 `.mts` 显式声明 ESM 可避免 Node 的 MODULE_TYPELESS_PACKAGE_JSON 警告）。
 *
 * 模板内容也一并从 Vue 2 的 Options API 改成了 Vue 3 的 `<script setup lang="ts">`：
 * 迁移到 Vue 3 + TypeScript 之后，旧模板生成的是
 * `export default { data(){}, methods:{} }` 这种 Vue 2 写法、且没有 `lang="ts"`，
 * 生成出来就是一个 JS 组件 —— 与「工程内全是 TypeScript」的约定正好相反。
 *
 * 顺带修正：原函数参数名拼写为 `compoenntName`（少了一个 o）。
 */

/** 页面组件模板 */
export const vueTemplate = (componentName: string): string => {
  // 原实现会把 `xxx.vue` 这样的输入截断成 `xxx`
  const name = componentName.split('.')[0]
  return `<template>
  <div class="${name}">
    ${name}组件
  </div>
</template>

<script setup lang="ts">
// 页面逻辑写在这里（Vue 3 <script setup> + TypeScript）
</script>

<style lang="less" scoped>
.${name} {

}
</style>
`
}

/** 组件入口模板（保留原样：供 main.vue + 入口文件两件套的场景使用） */
export const entryTemplate = `import Main from './main.vue'
export default Main`

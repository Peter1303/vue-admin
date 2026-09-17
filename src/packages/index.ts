import type {App, Component} from 'vue'

/**
 * packages/ 下自研组件的全局注册
 * ------------------------------------------------------------
 * 原实现（packages/index.js）：
 *   const ctx = require.context('./', true, /\.vue$/)
 *   ctx.keys().forEach(k => { const c = ctx(k).default; Vue.component(c.name, c) })
 * 也就是「用组件自身的 name 选项作为全局标签名」。
 * 模板里因此在用 `<v-card>` `<v-icon>` `<v-button>` `<v-chat>` 这类标签。
 *
 * Vite 下改用 import.meta.glob（eager，保持与原实现一致的一次性注册）。
 *
 * ⚠️ <script setup> 编写的组件没有 name 选项，必须在组件里显式写
 *    `defineOptions({ name: 'v-xxx' })`，否则这里会跳过注册并告警，
 *    模板中的 `<v-xxx>` 会退化成未解析的未知元素 —— 而且是静默的。
 *
 * 注册顺序按路径字典序，与 require.context 的返回顺序一致，
 * 因此同名的组件（packages/skeleton 下三个都叫 'Skeleton'）最终生效者保持不变。
 *
 * ⚠️ 这里的注册是**运行时动态**的，静态分析（WebStorm / Volar）看不到，
 *    模板里的 `<v-card>` 会被报成「Component v-card is not imported」。
 *    为此有一份由本目录内容生成的静态声明：src/components.d.ts + web-types.json，
 *    **新增 / 改名组件后请重跑 `yarn gen:components`**（脚本 script/genGlobalComponents.mts）。
 */
const components = import.meta.glob('/src/packages/**/*.vue', {eager: true}) as Record<
  string,
  { default?: Component }
>

export function setupGlobalComponents(app: App): void {
  Object.keys(components)
    .sort()
    .forEach((path) => {
      const comp = components[path]?.default as (Component & { name?: string }) | undefined
      if (!comp) return

      const name = comp.name
      if (!name) {
        console.warn(
          `[packages] ${path} 未声明组件 name，已跳过全局注册。` +
          `请在该组件内补 defineOptions({ name: 'v-xxx' })`
        )
        return
      }
      app.component(name, comp)
    })
}

export default setupGlobalComponents

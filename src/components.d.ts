/**
 * 自研全局组件的类型声明（**自动生成，请勿手改**）
 * ============================================================
 * 生成方式：yarn gen:components（脚本：script/genGlobalComponents.mts）
 * 数据来源：src/packages 下所有 .vue 的 defineOptions({name}) + src/plugins/index.ts 的 app.component()
 *
 * 注册是运行时动态完成的（import.meta.glob 扫目录 + 用组件自带 name），静态分析看不到，
 * 所以模板里的 <v-card> / <v-crud> 会被 IDE 报「Component ... is not imported」。
 * 这里把这批名字显式声明进 Vue 的 GlobalComponents，让 IDE / Volar / vue-tsc 能解析、
 * 并停止给出「Import 'VCard' component」这种会把组件重复 import 一遍的误导性修复。
 *
 * 类型写法：宽松（DefineComponent，只声明标签对应哪个组件，不做 props 校验）
 *   —— 为什么宽松：解决 IDE 误报只需要「名字能解析到组件」；一旦改成严格写法，
 *      会额外暴露出 5 个**既有**类型错误（详见 script/genGlobalComponents.mts 里的说明与开关）。
 *
 * 共 41 个（packages 36 + plugins 5）。
 * 同名覆盖（取后者，与运行时一致）：Skeleton ← src/packages/skeleton/Skeleton2.vue; Skeleton ← src/packages/skeleton/Skeleton3.vue
 * 每个标签对应的源文件见项目根的 web-types.json（IDE 里点标签可直接跳转）。
 */
export {}

declare module 'vue' {
  export interface GlobalComponents {
    'AIconFont': import('vue').DefineComponent,
    'Exception': import('vue').DefineComponent,
    'LazyRender': import('vue').DefineComponent,
    'Skeleton': import('vue').DefineComponent,
    'TheMask': import('vue').DefineComponent,
    'VCrud': import('vue').DefineComponent,
    'VCrudForm': import('vue').DefineComponent,
    'VCrudTree': import('vue').DefineComponent,
    'VIcon': import('vue').DefineComponent,
    'VuePerfectScrollbar': import('vue').DefineComponent,
    'a-icon': import('vue').DefineComponent,
    'a-iconfont': import('vue').DefineComponent,
    'e403': import('vue').DefineComponent,
    'e404': import('vue').DefineComponent,
    'e500': import('vue').DefineComponent,
    'router-error': import('vue').DefineComponent,
    'v-actionbar': import('vue').DefineComponent,
    'v-amount': import('vue').DefineComponent,
    'v-avatar-group': import('vue').DefineComponent,
    'v-button': import('vue').DefineComponent,
    'v-captcha': import('vue').DefineComponent,
    'v-card': import('vue').DefineComponent,
    'v-cell': import('vue').DefineComponent,
    'v-chat': import('vue').DefineComponent,
    'v-city-picker': import('vue').DefineComponent,
    'v-codebox': import('vue').DefineComponent,
    'v-count-to': import('vue').DefineComponent,
    'v-create-form': import('vue').DefineComponent,
    'v-create-form-view': import('vue').DefineComponent,
    'v-create-table': import('vue').DefineComponent,
    'v-create-table-form': import('vue').DefineComponent,
    'v-date-range-picker': import('vue').DefineComponent,
    'v-drawer': import('vue').DefineComponent,
    'v-emoji-picker': import('vue').DefineComponent,
    'v-filter': import('vue').DefineComponent,
    'v-guide': import('vue').DefineComponent,
    'v-iconbox': import('vue').DefineComponent,
    'v-licence-plate': import('vue').DefineComponent,
    'v-logo': import('vue').DefineComponent,
    'v-overview': import('vue').DefineComponent,
    'v-pre-code': import('vue').DefineComponent,
  }
}

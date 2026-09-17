/**
 * Api 是 Vue 插件，通过 app.config.globalProperties.$api 注入，
 * 在选项式组件里用 this.$api 访问；
 * api 是在非 Vue 环境（纯 js 模块）里用 api.xxx 访问；
 * apiSource 是未处理的接口源数据，主要给 api 管理模块使用
 * （views/plugin/api-test.vue）。
 */
export {api, Api, apiSource} from '@core'

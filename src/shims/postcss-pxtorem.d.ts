/**
 * postcss-pxtorem@6 未随包提供类型声明，这里接管它的类型。
 *
 * 背景：原 `postcss.config.js` 是纯 JS、且不在 tsconfig 的检查范围内，所以它的
 * `require('postcss-pxtorem')` 没有类型也不报错。该文件被删除、配置内联进
 * `vite.config.mts` 之后，这个 import 就落进了 `vue-tsc --noEmit` 的检查范围，
 * 在 `noImplicitAny` 下会报 TS7016（隐式 any）。
 *
 * 注意本文件必须是**全局脚本**（没有顶层 import/export）：
 * 一旦有顶层 import/export，`declare module` 就变成模块增强，
 * 对「本来就没有类型声明的包」不再生效。所以 `import type` 写在 `declare module` 内部。
 *
 * 与 vue-cropper.d.ts 的区别：那个包有 typings 字段（只是坏的），
 * TS 会去用它、ambient 声明覆盖不掉，只能走 tsconfig `paths`；
 * 而 postcss-pxtorem 完全没有类型入口，ambient 声明正是标准做法。
 *
 * 只声明本项目实际用到的字段；运行时行为由真实包决定。
 */
declare module 'postcss-pxtorem' {
  import type {PluginCreator} from 'postcss'

  interface PxToRemOptions {
    /** 根元素字号，用于 px → rem 换算（本项目 16） */
    rootValue?: number | ((input: unknown) => number)
    /** rem 小数位精度 */
    unitPrecision?: number
    /**
     * 参与转换的属性白名单。v5 之前叫 propWhiteList，
     * 旧配置 `propWhiteList: []` 的语义是「全部转换」，对应 v6 的 `['*']`。
     */
    propList?: string[]
    /** 跳过的选择器 */
    selectorBlackList?: (string | RegExp)[]
    /** 是否替换原值（false 则额外补一条 rem 声明） */
    replace?: boolean
    /** 是否转换媒体查询里的 px */
    mediaQuery?: boolean
    /** 小于该值的 px 不转换 */
    minPixelValue?: number
    /** 排除的文件路径；本项目排除 node_modules */
    exclude?: string | RegExp | ((filePath: string) => boolean)
    /** 只处理的文件路径 */
    include?: string | RegExp | ((filePath: string) => boolean)
    /** 目标单位 */
    convert?: 'px' | 'rem'
  }

  const pxtorem: PluginCreator<PxToRemOptions>
  export default pxtorem
}

/**
 * vue-cropper@1.1.4 的类型入口是坏的，这里接管它的类型声明。
 *
 * 它 `package.json` 里的 `typings` 指向 `lib/typings/index.d.ts`，而那个文件：
 *   lib/typings/index.d.ts:1   import VueCropper from '../vue-cropper.vue'   ← 直接 import 一个 SFC
 *   lib/typings/index.d.ts:2   import { globalCropper } from '../index'      ← 拉到 lib/index.ts
 *   lib/index.ts:1             import VueCropper from './vue-cropper.vue'
 *
 * 该包没把 `*.vue` 的模块声明纳入程序，于是 vue-tsc 解析 `./vue-cropper.vue` 时在
 * `noImplicitAny` 下报 TS7016。注意**报错位置在 node_modules 的 .ts 文件上**：
 * `skipLibCheck` 只跳过 `.d.ts`，管不到它，所以这个错误靠 skipLibCheck 压不住。
 *
 * 处理办法：在 `tsconfig.json` 的 `paths` 里把 `vue-cropper` 指到本文件。
 * 为什么用 `paths` 而不是 `declare module 'vue-cropper'`（已实测无效）：
 * 模块能被正常解析到真实包时，ambient 声明不会覆盖它；而 `paths` 的优先级高于 node_modules，
 * 是可靠的接管方式。**只影响类型，运行时仍由 Vite 加载真实包**（没有配对应的 alias）。
 *
 * 这样也**不会**像全局 `declare module '*.vue'` 那样把本项目所有 SFC 的类型降级成 any。
 *
 * 组件 props 无法建模（该包也没给），这里显式用 `any` 并接受：
 * 本项目只在 `<template>` 里以组件形式使用它（传 :img / :info / :autoCrop 等），不调用实例方法。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export declare const VueCropper: any

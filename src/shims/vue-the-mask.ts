/**
 * vue-the-mask 的 Vue 3 兼容层（自研）
 * ============================================================
 * 背景：`vue-the-mask`（0.11.1）只有 Vue 2 版本，且本仓库并未在 package.json 声明它。
 * 原 `src/plugins/index.js` 里有一行 `Vue.use(VueTheMask)`，而该插件的 install 会同时注册：
 *   - 组件 `TheMask`  →  模板标签 `<the-mask>`
 *   - 指令 `v-mask`
 * 迁移时曾误判为「全项目零引用」而直接删掉注册，实际 `<the-mask>` 在 2 处被使用：
 *   - src/packages/licence-plate/licence-plate.vue（带自定义 tokens 的 F 位）
 *   - src/views/widgets/mask.vue（手机号 / 银行卡）
 *
 * 本文件的 maskit / dynamicMask / masker / tokens 四个函数是**逐行照搬**原库
 * `src/maskit.js`、`src/dynamic-mask.js`、`src/masker.js`、`src/tokens.js` 的算法，
 * 只补了 TypeScript 类型标注，**没有改动任何掩码语义**。
 * 原库源码见 yarn 缓存：
 *   %LOCALAPPDATA%/Yarn/Cache/v6/npm-vue-the-mask-0.11.1-<hash>/node_modules/vue-the-mask/src
 */

import type {App, Directive, DirectiveBinding} from 'vue'

/** 单个掩码 token 的定义 */
export interface MaskToken {
  /** 该位置允许的字符 */
  pattern?: RegExp
  /** true 表示「转义」：把下一个字符当字面量处理 */
  escape?: boolean
  /** 命中后对字符做变换（如统一大写） */
  transform?: (value: string) => string
}

export type MaskTokens = Record<string, MaskToken>
/** mask 可以是字符串，也可以是「候选择一」的数组（如 ['### #### ####']） */
export type MaskInput = string | string[]

/** 原库 tokens.js 的默认 token 表，逐条照搬 */
export const tokens: MaskTokens = {
  '#': {pattern: /\d/},
  X: {pattern: /[0-9a-zA-Z]/},
  S: {pattern: /[a-zA-Z]/},
  A: {pattern: /[a-zA-Z]/, transform: (v) => v.toLocaleUpperCase()},
  a: {pattern: /[a-zA-Z]/, transform: (v) => v.toLocaleLowerCase()},
  '!': {escape: true}
}

/**
 * 核心掩码算法：把用户输入 value 按 mask 逐位映射成显示串。
 * 照搬自原库 src/maskit.js。
 */
export function maskit(
  value: string,
  mask: string,
  masked = true,
  tokenMap: MaskTokens = tokens
): string {
  const raw = value || ''
  const pattern = mask || ''
  let iMask = 0
  let iValue = 0
  let output = ''

  while (iMask < pattern.length && iValue < raw.length) {
    let cMask = pattern[iMask]
    const tokenDef = tokenMap[cMask]
    const cValue = raw[iValue]

    if (tokenDef && !tokenDef.escape) {
      // token 位：字符必须匹配 pattern 才被接受，且无论接受与否 iValue 都前进
      if (tokenDef.pattern && tokenDef.pattern.test(cValue)) {
        output += tokenDef.transform ? tokenDef.transform(cValue) : cValue
        iMask++
      }
      iValue++
    } else {
      // 字面量位（或转义位）
      if (tokenDef && tokenDef.escape) {
        iMask++ // 取下一个 mask 字符，把它当字面量
        cMask = pattern[iMask]
      }
      if (masked) output += cMask
      if (cValue === cMask) iValue++ // 用户自己也敲了这个字面量字符
      iMask++
    }
  }

  // 补齐尾部「纯字面量」的剩余部分，例如 (#) 里的 ")"
  let restOutput = ''
  while (iMask < pattern.length && masked) {
    const cMask = pattern[iMask]
    if (tokenMap[cMask]) {
      restOutput = ''
      break
    }
    restOutput += cMask
    iMask++
  }

  return output + restOutput
}

/**
 * 当 mask 是数组时，动态挑一个「最贴合当前输入长度」的候选掩码。
 * 照搬自原库 src/dynamic-mask.js。
 * 注意：原实现在这里直接 `masks.sort(...)` 会**原地修改传入的 props 数组**，
 * 这里改为排序副本 —— 输出结果完全一致，但不再污染父组件的数组。
 */
export function dynamicMask(
  maskitFn: typeof maskit,
  masks: string[],
  tokenMap: MaskTokens
): (value: string, mask: string | string[], masked?: boolean) => string {
  const sorted = [...masks].sort((a, b) => a.length - b.length)
  return function (value: string, _mask: string | string[], masked = true): string {
    let i = 0
    while (i < sorted.length) {
      const currentMask = sorted[i]
      i++
      const nextMask = sorted[i]
      if (!(nextMask && maskitFn(value, nextMask, true, tokenMap).length > currentMask.length)) {
        return maskitFn(value, currentMask, masked, tokenMap)
      }
    }
    return '' // 空掩码数组
  }
}

/**
 * 对外的门面：mask 为字符串走 maskit，为数组走 dynamicMask。
 * 照搬自原库 src/masker.js。
 */
export function masker(
  value: string,
  mask: MaskInput,
  masked = true,
  tokenMap: MaskTokens = tokens
): string {
  return Array.isArray(mask)
    ? dynamicMask(maskit, mask, tokenMap)(value, mask, masked)
    : maskit(value, mask, masked, tokenMap)
}

/** v-mask 的配置对象形态 */
export interface MaskConfig {
  mask: MaskInput
  tokens?: MaskTokens
  /** true 表示把掩码字符一起发出来；默认 false（发原始值） */
  masked?: boolean
}

function resolveConfig(config: MaskInput | MaskConfig | undefined): MaskConfig {
  if (Array.isArray(config) || typeof config === 'string') {
    return {mask: config, tokens}
  }
  if (config && typeof config === 'object' && 'mask' in config) {
    return {
      mask: config.mask,
      tokens: config.tokens ?? tokens,
      masked: config.masked
    }
  }
  return {mask: '', tokens}
}

/** 原库是用 document.createEvent 造一个「非 trusted」的冒泡事件 */
function createCustomEvent(name: string): Event {
  const evt = document.createEvent('Event')
  evt.initEvent(name, true, true)
  return evt
}

/**
 * v-mask 指令。原库把它写成一个「同时用于 bind 和 update」的函数指令，
 * 这里对应 Vue 3 的 mounted / updated 两个钩子，逻辑逐行照搬。
 */
function applyMask(el: HTMLElement, binding: DirectiveBinding<MaskInput | MaskConfig>): void {
  const config = resolveConfig(binding.value)

  // 传入的可能是外层容器，需要定位到它内部的 input
  let input: HTMLInputElement | null = null
  if (el.tagName && el.tagName.toLocaleUpperCase() === 'INPUT') {
    input = el as HTMLInputElement
  } else {
    const els = el.getElementsByTagName('input')
    if (els.length !== 1) {
      throw new Error('v-mask directive requires 1 input, found ' + els.length)
    }
    input = els[0]
  }

  input.oninput = function (evt: Event) {
    if (!evt.isTrusted) return // 避免自定义事件造成的死循环
    const target = evt.target as HTMLInputElement
    // 默认策略：让光标停在掩码处理前的同一位置
    let position = target.selectionEnd ?? 0
    // 记录刚敲进去的那个字符
    const digit = target.value[position - 1]
    target.value = masker(target.value, config.mask, true, config.tokens ?? tokens)
    // 如果这个字符被掩码挪位了，就继续右移直到重新找到它
    while (position < target.value.length && target.value.charAt(position - 1) !== digit) {
      position++
    }
    if (input === document.activeElement) {
      target.setSelectionRange(position, position)
      setTimeout(function () {
        target.setSelectionRange(position, position)
      }, 0)
    }
    target.dispatchEvent(createCustomEvent('input'))
  }

  // 初次挂载时，把已有 value 也补上格式
  const newDisplay = masker(input.value, config.mask, true, config.tokens ?? tokens)
  if (newDisplay !== input.value) {
    input.value = newDisplay
    input.dispatchEvent(createCustomEvent('input'))
  }
}

export const vMask: Directive<HTMLElement, MaskInput | MaskConfig> = {
  mounted: applyMask,
  updated: applyMask
}

/**
 * 兼容原 `Vue.use(VueTheMask)` 的安装函数。
 * 组件注册由调用方传入（避免本文件反向 import .vue 造成循环依赖）。
 */
export function installTheMask(app: App, TheMaskComponent: Parameters<App['component']>[1]): void {
  app.component('TheMask', TheMaskComponent)
  app.directive('mask', vMask)
}

export default {tokens, maskit, dynamicMask, masker, vMask, installTheMask}

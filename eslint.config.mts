/**
 * ESLint 扁平配置（flat config）。
 *
 * 为什么后缀是 `.mts` 而不是 `.ts`：
 * 本项目的 package.json 没有 `"type": "module"`（同 vite.config.mts 的处境，见那边注释），
 * `.ts` 会被 Node 判定为「模块类型不明确」，需要重解析成 ESM 并打印
 * MODULE_TYPELESS_PACKAGE_JSON 警告；`.mts` 显式声明 ESM，直接消除该警告。
 *
 * 为什么能用 TS 写配置：
 * ESLint 10 在 `process.features.typescript` 为 "strip"/"transform" 时可**原生加载** TS 配置
 * （eslint/lib/config/config-loader.js 的 isNativeTypeScriptSupportEnabled），不需要安装 jiti。
 * 原生 TS 支持在 Node 22.18+ 默认开启；该路径还要显式打开 ESLint 的开关，
 * 因此 package.json 的 lint 脚本都带了 `--flag unstable_native_nodejs_ts_config`。
 * 若在 22.6~22.17 上跑 lint，需额外设 `NODE_OPTIONS=--experimental-strip-types`。
 *
 * 顺带说明两个被删掉的旧配置文件：
 *   - `.eslintrc.js`：ESLint 8 及以前的 eslintrc 格式，ESLint 10 已完全不支持（只认 flat config），
 *     且它 extends 的 `plugin:vue/essential` / `@vue/standard` 与 parser `babel-eslint` 都不在依赖里。
 *   - `eslint.config.js`：本文件的前身，`.js` 版本（迁移期的临时名）。
 */
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import ts from 'typescript-eslint'

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'public/**',
      'docs/**',
      '**/*.d.ts'
    ]
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    }
  },
  {
    rules: {
      // 迁移期：这些规则会淹没真正的问题
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/v-on-event-hyphenation': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/html-self-closing': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-empty': 'off',
      'no-useless-escape': 'off'
    }
  }
]

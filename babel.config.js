module.exports = {
  env: {
    // 新增插件配置
    development: {
      // 注意：不要在此处启用 dynamic-import-node
      // 它会把 import(`@/${path}`) 转成 require(`@/${path}`)，
      // 使 webpack 无法静态分析出前缀，导致动态路由的 context 为空（所有路由都跳到错误页）
      plugins: ['@babel/plugin-proposal-optional-chaining', '@babel/plugin-proposal-nullish-coalescing-operator']
    }
  },
  presets: [
    '@vue/app',
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry'
      }
    ]
  ]
}

/**
 * 静态站点预览 / 部署服务（pm2 入口，见 deploy.yml）
 * ============================================================
 *
 * 本文件由 `server.js` 迁移而来，改动只有「语言/模块形式」，逻辑未变：
 *
 *   1. `require(...)` → `import ...`；`__dirname` → `import.meta.dirname`。
 *      后缀用 `.mts` 而不是 `.ts`：package.json 没有 `"type": "module"`，
 *      `.ts` 会被 Node 判成「模块类型不明确」并打印 MODULE_TYPELESS_PACKAGE_JSON 警告，
 *      `.mts` 显式声明 ESM，与 vite.config.mts / eslint.config.mts 的做法一致。
 *   2. 为什么必须走 ESM：`http-proxy-middleware@4` 是 ESM-only
 *      （package.json 的 exports 只声明了 import 条件），ESM 写法才是它的正路。
 *      顺带记一笔：Node 的 CJS 解析**不会**把 `.ts` 加进后缀尝试列表，
 *      `.ts` 之间互相 require('./x') 是找不到的（已实测），所以原生 TS 必须配 ESM + 显式后缀。
 *   3. **运行要求 Node ≥ 22.18**（该版本起默认开启 TypeScript 类型擦除）。
 *      若部署机是 22.6~22.17，需给 pm2 的 env 加
 *      `NODE_OPTIONS: --experimental-strip-types`；低于 22.6 则只能改回 .js（逻辑未变，直接回滚即可）。
 *   4. express@5 不带类型声明，所以本文件**没有**纳入 tsconfig 的类型检查
 *      （与迁移前 server.js 的地位一致）。要纳入的话需装 @types/express。
 *
 * 迁移到 Vue 3 + Vite 后本文件做过的调整（都是让它在当前依赖下真能跑）：
 *
 *   1. `require('address')` → 该依赖已移除，改用内置 os.networkInterfaces() 取本机 IP
 *   2. `require('opn')`     → 该依赖已移除，不再自动开浏览器（只打印地址）
 *   3. `http-proxy-middleware` 的用法
 *        v0.x:  const proxy = require('http-proxy-middleware'); proxy(options)
 *        v1+:   const { createProxyMiddleware } = require('http-proxy-middleware')
 *      当前装的是 v4（ESM-only），故改为 `import { createProxyMiddleware } from ...`。
 *   4. 证书目录 ./key/ 在仓库里并不存在（只在服务器上），
 *      因此 HTTPS 改为「检测到证书才启动」，避免本地 `yarn server` 直接崩。
 */
import express from 'express'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import {createProxyMiddleware} from 'http-proxy-middleware'

const app = express()

// 托管 Vite 的构建产物
app.use(express.static(path.join(import.meta.dirname, '/dist')))

// 取本机 IPv4 地址（替代原来的 address.ip()）
function localIp(): string {
  const nets = os.networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) return net.address
    }
  }
  return 'localhost'
}

// 代理配置（原样保留线上测试用的 target）
const proxyOptions = {
  target: 'https://www.easy-mock.com/mock/5d5b9eddaf6abb3d1b4270ad',
  changeOrigin: true
}
app.use('/api', createProxyMiddleware(proxyOptions))

const HTTP_PORT = process.env.PORT || 80
http.createServer(app).listen(HTTP_PORT, () => {
  console.log(`HTTP  http://${localIp()}:${HTTP_PORT}`)
})

// 证书存在才启 HTTPS（原来无条件 readFileSync，缺文件会直接抛错）
const KEY_DIR = path.resolve(import.meta.dirname, './key')
const KEY_FILE = path.join(KEY_DIR, '3140499_08tj.com.key')
const CERT_FILE = path.join(KEY_DIR, '3140499_08tj.com.pem')
if (fs.existsSync(KEY_FILE) && fs.existsSync(CERT_FILE)) {
  const httpsOptions = {
    key: fs.readFileSync(KEY_FILE),
    cert: fs.readFileSync(CERT_FILE)
  }
  const HTTPS_PORT = process.env.HTTPS_PORT || 443
  https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
    console.log(`HTTPS https://${localIp()}:${HTTPS_PORT}`)
  })
} else {
  console.log(`[skip] 未找到 ./key/ 下的证书，已跳过 HTTPS（HTTP 服务不受影响）`)
}

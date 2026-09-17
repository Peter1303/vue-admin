/**
 * 注意文件后缀是 `.mts` 而不是 `.ts` —— 这是必需的，不要改回 `.ts`。
 *
 * 原因：本项目的 package.json 没有 `"type": "module"` —— 加上它会改变包内所有 `.js` 文件的
 * 模块解析方式，而 Node 侧还有由 pm2 直接执行的入口（见 deploy.yml），影响面大于收益，
 * 所以维持默认的 CommonJS 解析。Vite 判断配置文件的模块格式时，
 * `.ts` 这种情况会按 CJS 打包，于是下面这些 **ESM-only** 的依赖会被编译成 `require()`：
 *
 *   Error: Failed to resolve "rollup-plugin-visualizer".
 *   This package is ESM only but it was tried to load by `require`.
 *
 * `rollup-plugin-visualizer@7` 的 exports 只声明了 `import` 条件（没有 `require`），
 * 所以 CJS 下无法解析。用 `.mts` 后缀告诉 Vite 这份配置按 ESM 处理，import 条件即可正常命中，
 * 同时也是 Vite 生态的推荐做法（配置期插件已普遍 ESM-only）。
 */
import {fileURLToPath, URL} from 'node:url'
import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import viteCompression from 'vite-plugin-compression'
import {visualizer} from 'rollup-plugin-visualizer'
import pxtorem from 'postcss-pxtorem'
import autoprefixer from 'autoprefixer'

const resolve = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd(), '')
    const isProd = mode !== 'development'
    const isReport = mode === 'report'

    return {
        // 与原 vue.config.js 的 publicPath: './' 对齐（配合 hash 路由，产物可放任意子目录）
        base: './',
        publicDir: 'public',

        resolve: {
            // vue-cli 默认把 '.vue' 加进了模块后缀尝试列表，所以老代码里大量存在
            // `import layout1 from './layout1'` 这种无后缀写法（本项目 50+ 处）。
            // Vite 默认的 resolve.extensions 不含 '.vue'，不补上会整片解析失败。
            // 顺序与 webpack 保持一致：先 .js/.ts 再 .vue。
            extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
            alias: {
                '@': resolve('./src'),
                '@layouts': resolve('./src/layouts'),
                '@router': resolve('./src/router'),
                '@api': resolve('./src/api'),
                '@store': resolve('./src/store'),
                '@utils': resolve('./src/common/utils'),
                '@config': resolve('./src/config'),
                '@core': resolve('./src/core'),
                // moment 已无 Vue 生态，全量换成 dayjs 兼容层；
                // 用别名而不是改 53 个调用点，减少改动面
                moment: resolve('./src/shims/moment.ts'),
                // vue-easy-print 只发布过 Vue 2 版本，改为自研 Vue 3 替代件
                'vue-easy-print': resolve('./src/shims/vue-easy-print.ts')
            }
        },

        css: {
            /*
             * 原 postcss.config.js 的内容，已内联到这里（该文件随之删除）。
             * 内联的好处：少一个 CJS 配置文件，且这段配置现在与 .mts 一起被 vue-tsc 类型检查。
             * 注意 postcss-pxtorem 没有自带类型声明，类型由 src/shims/postcss-pxtorem.d.ts 接管。
             */
            postcss: {
                plugins: [
                    pxtorem({
                        rootValue: 16,
                        minPixelValue: 1,
                        // postcss-pxtorem 5+ 把 propWhiteList 改名为 propList；
                        // 旧配置 `propWhiteList: []` 的语义是「所有属性都转换」，对应 v6 的 ['*']
                        propList: ['*'],
                        // antdv 4 是 CSS-in-JS，运行时注入，不经 postcss；无需排除
                        exclude: /node_modules/
                    }),
                    autoprefixer()
                ]
            },
            preprocessorOptions: {
                less: {
                    // antdv 4 已是 CSS-in-JS，这里只服务项目自有 less
                    javascriptEnabled: true,
                    // 对齐 less 3 的默认求值行为（less 4 默认 math: parens-division，会让 `@a / @b` 静默不求值）
                    math: 'always'
                }
            }
        },

        server: {
            port: 8082,
            strictPort: true,
            proxy: {
                '/api': {
                    target: 'https://www.easy-mock.com/mock/5d5b9eddaf6abb3d1b4270ad',
                    changeOrigin: true
                }
            }
        },

        define: {
            // 编译期常量，供代码内 __APP_VERSION__ 使用
            // （api 根路径不在这里写死：由各模式的 .env.<mode> 提供 VITE_APP_BASE_URL，
            //   它是 Vite 内建的 import.meta.env 常量，构建时同样会被替换成字面量）
            __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION ?? '0.0.0')
        },

        build: {
            outDir: 'dist',
            assetsDir: 'static',
            sourcemap: false,
            chunkSizeWarningLimit: 1600,
            reportCompressedSize: false,
            rollupOptions: {
                output: {
                    manualChunks(id: string) {
                        if (!id.includes('node_modules')) return
                        if (id.includes('ant-design-vue') || id.includes('@ant-design')) return 'chunk-ant-design-vue'
                        return 'chunk-libs'
                    },
                    chunkFileNames: 'static/js/[name].[hash].js',
                    entryFileNames: 'static/js/[name].[hash].js',
                    assetFileNames: 'static/[ext]/[name].[hash].[ext]'
                }
            }
        },

        plugins: [
            vue(),
            ...(isProd && !isReport
                ? [
                    // 对齐原 compression-webpack-plugin，产出 .gz
                    viteCompression({threshold: 10240, algorithm: 'gzip', ext: '.gz'})
                ]
                : []),
            ...(isReport ? [visualizer({open: false, gzipSize: true, filename: 'dist/report.html'})] : [])
        ]
    }
})

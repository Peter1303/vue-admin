import type {RouteRecordRaw} from 'vue-router'
import loader from './loader'
import App from '@/layouts/App.vue'

/**
 * 基础路由（锁屏、系统错误页、404 兜底）
 *
 * vue-router 5 已移除 `path: '*'` 的写法，catch-all 必须写成
 * `/:pathMatch(.*)*`，否则通配路由不会被注册，访问不存在的地址会落到空白页。
 */
export default [
  {
    path: '/lock',
    name: 'lock',
    component: loader('layouts/layout/lock.vue'),
    meta: {
      title: '页面锁定',
      hide: true
    }
  },
  {
    path: '/sys-error',
    name: 'sys-error',
    component: App,
    meta: {
      title: '错误页',
      icon: 'icon-delete',
      hide: true
    },
    children: [
      {
        path: '/403',
        name: '403',
        component: loader('packages/exception/403.vue'),
        meta: {
          title: '403',
          icon: 'icon-xiaomi'
        }
      },
      {
        path: '/404',
        name: '404',
        component: loader('packages/exception/404.vue'),
        meta: {
          title: '404',
          icon: 'icon-xiaomi'
        }
      },
      {
        path: '/500',
        name: '500',
        component: loader('packages/exception/500.vue'),
        meta: {
          title: '500',
          icon: 'icon-xiaomi'
        }
      },
      {
        path: '/600',
        name: '600',
        component: loader('packages/exception/routeError.vue'),
        meta: {
          title: '路由配置错误',
          icon: 'icon-xiaomi'
        }
      }
    ]
  },
  {
    // vue-router 5 的 catch-all 语法
    path: '/:pathMatch(.*)*',
    name: 'notFount',
    // 原写法指向 `views/exception/404.vue`，该文件并不存在，
    // 实际一直靠 loader 的 catch 兜底渲染通用错误页 routeError.vue。
    // 这里改为指向项目里真实存在的 404 页面，语义（title: 该页面不存在）不变。
    component: loader('packages/exception/404.vue'),
    meta: {
      title: '该页面不存在',
      hide: true
    }
  }
] as RouteRecordRaw[]

import img403 from '@/assets/img/exception-403.svg'
import img404 from '@/assets/img/exception-404.svg'
import img500 from '@/assets/img/exception-500.svg'
import routeErrorImg from '@/assets/img/exception-600.svg'

interface ExceptionItem {
  img: string
  title: string
  desc: string
}

interface ExceptionTypes {
  403: ExceptionItem
  404: ExceptionItem
  500: ExceptionItem
  600: ExceptionItem

  [key: string]: ExceptionItem
}

const types: ExceptionTypes = {
  403: {
    img: img403,
    title: '403',
    desc: '抱歉，你无权访问该页面'
  },
  404: {
    img: img404,
    title: '404',
    desc: '抱歉，你访问的页面不存在或仍在开发中'
  },
  500: {
    img: img500,
    title: '500',
    desc: '抱歉，服务器出错了'
  },
  // /600 路由配置错误页（同时是 core/loader.ts 里动态 import 失败时的兜底页）。
  // 403 / 404 / 500 三张插画原来自 alipayobjects CDN，已下载到本地
  // src/assets/img/exception-{403,404,500}.svg（与 600 同一套视觉语言）；
  // 现在四张错误页插图全部走本地资源，不再依赖任何外部 CDN，避免远程链接丢失。
  600: {
    img: routeErrorImg,
    title: '600',
    desc: '页面找不到家了，你的路由地址可能配错了；具体错误请查看控制台'
  }
}

export default types

import type {AxiosError} from 'axios'
import configs from '@config'

/**
 * 请求错误处理
 * ------------------------------------------------------------
 * ⚠️ 与原实现的差异（有意为之）：
 *   原 error-handler.js 在非生产环境里会弹一个 `notification.error` 调试弹窗，
 *   把 url / 参数 / 状态码全量展示出来（`duration: 0` 永不自动关闭）。
 *   这在后端不可用（mock 停服、代理 502）时会让每个调接口的页面都弹一个红框，
 *   整个 UI 变成「错误提示墙」，反而掩盖了真正要看的现象。
 *   因此这里整段删除，改为 console.error 输出同等信息。
 *
 * 保留的部分：
 *   - `configs.api.error_handler(error)` —— 这是「鉴权失效跳转登录页」的业务逻辑，
 *     与「显示错误」无关，删了会导致登录过期后无任何提示。
 *   - 无响应体分支（timeout / 重复请求 / 主动取消）的诊断日志。
 */
export default function errorHandler(error: AxiosError): void {
  if (!error.response) {
    if (error.message && error.message.includes('timeout')) {
      console.error('[fetch] 请求超时', error.config?.url)
    } else if (error.message === '请求重复') {
      console.error('[fetch] 请求重复，已取消前一次', error.config?.url)
    } else if (error.message && error.message.includes('cancel')) {
      console.error('[fetch] 请求被取消', error.config?.url)
    } else {
      console.error('[fetch] 请求失败', error.config?.url, error.message)
    }
    return
  }

  // 业务侧的错误处理（如登录失效跳转），必须保留
  configs.api.error_handler?.(error)

  const response = error.response
  console.error(
    '[fetch] 接口返回异常',
    response.config?.url,
    '状态码=',
    response.status,
    '业务码=',
    (response.data as { status?: unknown } | undefined)?.status
  )
}

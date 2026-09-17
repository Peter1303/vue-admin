/**
 * 事件绑定工具
 * ------------------------------------------------------------
 * 原实现按 attachEvent / addEventListener 做能力探测并返回不同实现，
 * 目的地（IE8 及以下）早已不在支持范围内（.browserslistrc 为 "> 1%, last 3 versions"），
 * 这里收敛为单一实现，签名保持不变。
 */

/** 绑定事件 on(element, event, handler) */
export function on(
  element: EventTarget | null | undefined,
  event: string,
  handler: EventListener
): void {
  if (element && event && handler) {
    element.addEventListener(event, handler, false)
  }
}

/** 解绑事件 off(element, event, handler) */
export function off(
  element: EventTarget | null | undefined,
  event: string,
  handler: EventListener
): void {
  if (element && event) {
    element.removeEventListener(event, handler, false)
  }
}

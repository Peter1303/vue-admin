type RafFn = (callback: (time: number) => void) => number
type CafFn = (handle: number) => void

let lastTime = 0
const prefixes = 'webkit moz ms o'.split(' ') // 各浏览器前缀

let requestAnimationFrame: RafFn
let cancelAnimationFrame: CafFn

const isServer = typeof window === 'undefined'
if (isServer) {
  requestAnimationFrame = function () {
    // 服务端空实现
    return 0
  }
  cancelAnimationFrame = function () {
    // 服务端空实现
  }
} else {
  // 浏览器上的实现既可能是标准名，也可能是厂商前缀名，需要运行时逐个探测。
  // 注意：必须经由 Record<string, unknown> 索引取值再断言 —— lib.dom 把
  // window.requestAnimationFrame 声明为「一定存在」，直接读它会让 TS 把
  // undefined 分支收窄掉，下面的 `if (raf && caf)` 就会被判为恒真。
  const w = window as unknown as Record<string, unknown>
  let raf = w['requestAnimationFrame'] as RafFn | undefined
  let caf = w['cancelAnimationFrame'] as CafFn | undefined

  for (let i = 0; i < prefixes.length; i++) {
    if (raf && caf) {
      break
    }
    const prefix = prefixes[i]
    raf = raf || (w[prefix + 'RequestAnimationFrame'] as RafFn | undefined)
    caf =
      caf ||
      ((w[prefix + 'CancelAnimationFrame'] || w[prefix + 'CancelRequestAnimationFrame']) as
        | CafFn
        | undefined)
  }

  // 如果当前浏览器不支持 requestAnimationFrame / cancelAnimationFrame，则退回到 setTimeout
  if (!raf || !caf) {
    raf = function (callback) {
      const currTime = new Date().getTime()
      // 为了使 setTimeout 的尽可能的接近每秒 60 帧的效果
      const timeToCall = Math.max(0, 16 - (currTime - lastTime))
      const id = window.setTimeout(() => {
        callback(currTime + timeToCall)
      }, timeToCall)
      lastTime = currTime + timeToCall
      return id
    }

    caf = function (id) {
      window.clearTimeout(id)
    }
  }

  requestAnimationFrame = raf
  cancelAnimationFrame = caf
}

export {requestAnimationFrame, cancelAnimationFrame}

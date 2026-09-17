import {root} from './env'

/* istanbul ignore file */
/**
 * 动画工具（vendored 自 alloytouch，原样移植，仅补类型）
 * 被 packages/amount/Amount.vue 用于数字滚动。
 */
type StepCallback = (percent: number, now: number, render: boolean) => boolean | void
type VerifyCallback = (id: number) => boolean
type CompletedCallback = (droppedFrames: number, id: number, finished: boolean) => void
type EasingMethod = (percent: number) => number

interface AnimateApi {
  requestAnimationFrame(callback: FrameRequestCallback | ((t?: number) => void), root?: HTMLElement): number

  stop(id: number): boolean

  isRunning(id: number): boolean

  start(
    stepCallback: StepCallback,
    verifyCallback: VerifyCallback | undefined,
    completedCallback: CompletedCallback | undefined,
    duration?: number,
    easingMethod?: EasingMethod,
    root?: HTMLElement
  ): number
}

const Animate: AnimateApi = ((global: typeof root) => {
  const time = Date.now || (() => +new Date())
  const desiredFrames = 60
  const millisecondsPerSecond = 1000

  let running: Record<string, unknown> = {}
  let counter = 1

  return {
    requestAnimationFrame: (() => {
      const g = global as unknown as Record<string, ((cb: FrameRequestCallback) => number) | undefined> & {
        requestAnimationFrame?: (cb: FrameRequestCallback) => number
      }
      const nativeRaf =
        g.requestAnimationFrame ||
        g.webkitRequestAnimationFrame ||
        g.mozRequestAnimationFrame ||
        g.oRequestAnimationFrame

      let isNative = !!nativeRaf
      if (nativeRaf && !/requestAnimationFrame\(\)\s*\{\s*\[native code]\s*}/i.test(nativeRaf.toString())) {
        isNative = false
      }

      if (isNative && nativeRaf) {
        return (callback: FrameRequestCallback) => nativeRaf(callback)
      }

      const TARGET_FPS = 60
      let requests: Record<number, FrameRequestCallback> = {}
      let rafHandle = 1
      let intervalHandle: ReturnType<typeof setInterval> | null = null
      let lastActive = +new Date()

      return (callback: FrameRequestCallback) => {
        const callbackHandle = rafHandle++
        requests[callbackHandle] = callback

        if (intervalHandle === null) {
          intervalHandle = setInterval(() => {
            const now = +new Date()
            const currentRequests = requests
            requests = {}

            for (const key in currentRequests) {
              if (Object.prototype.hasOwnProperty.call(currentRequests, key)) {
                currentRequests[key](now)
                lastActive = now
              }
            }

            if (now - lastActive > 2500 && intervalHandle !== null) {
              clearInterval(intervalHandle)
              intervalHandle = null
            }
          }, 1000 / TARGET_FPS)
        }

        return callbackHandle
      }
    })(),

    stop(id: number) {
      const cleared = running[id] != null
      cleared && (running[id] = null)
      return cleared
    },

    isRunning(id: number) {
      return running[id] != null
    },

    start(stepCallback, verifyCallback, completedCallback, duration, easingMethod, renderRoot) {
      const startTime = time()
      let lastFrame = startTime
      let percent = 0
      let dropCounter = 0
      const id = counter++

      if (!renderRoot) {
        renderRoot = document.body
      }

      if (id % 20 === 0) {
        const newRunning: Record<string, unknown> = {}
        for (const usedId in running) {
          newRunning[usedId] = true
        }
        running = newRunning
      }

      // 参数类型写成 boolean | number：内部用 step(true) 表示「丢弃帧」，
      // 而 requestAnimationFrame 回调进来的是时间戳（number）。
      // 二者都靠 `virtual !== true` 判断是否真正渲染，语义与 alloytouch 原版一致。
      const step = (virtual?: boolean | number): void => {
        const render = virtual !== true
        const now = time()

        if (!running[id] || (verifyCallback && !verifyCallback(id))) {
          running[id] = null
          completedCallback &&
          completedCallback(
            desiredFrames - dropCounter / ((now - startTime) / millisecondsPerSecond),
            id,
            false
          )
          return
        }

        if (render) {
          const droppedFrames =
            Math.round((now - lastFrame) / (millisecondsPerSecond / desiredFrames)) - 1
          for (let j = 0; j < Math.min(droppedFrames, 4); j++) {
            step(true)
            dropCounter++
          }
        }

        if (duration) {
          percent = (now - startTime) / duration
          if (percent > 1) {
            percent = 1
          }
        }

        let value = easingMethod ? easingMethod(percent) : percent
        value = isNaN(value) ? 0 : value

        if ((stepCallback(value, now, render) === false || percent === 1) && render) {
          running[id] = null
          completedCallback &&
          completedCallback(
            desiredFrames - dropCounter / ((now - startTime) / millisecondsPerSecond),
            id,
            percent === 1 || duration == null
          )
        } else if (render) {
          lastFrame = now
          this.requestAnimationFrame(step, renderRoot)
        }
      }

      running[id] = true
      this.requestAnimationFrame(step, renderRoot)

      return id
    }
  }
})(root)

export const easeOutCubic = (pos: number): number => {
  return Math.pow(pos - 1, 3) + 1
}

export const easeInOutCubic = (pos: number): number => {
  if ((pos /= 0.5) < 1) {
    return 0.5 * Math.pow(pos, 3)
  }
  return 0.5 * (Math.pow(pos - 2, 3) + 2)
}

export {Animate}
export default {Animate}

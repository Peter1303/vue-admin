import type {Directive, DirectiveBinding} from 'vue'

/**
 * v-draggable —— 替代 draggable-vue-directive（仅支持 Vue 2）
 * ------------------------------------------------------------
 * 原指令的 API：
 *   `v-draggable` 或 `v-draggable="{ handle, body, recover, onPositionChange }"`
 * 元素脱离文档流（position: absolute + transform）跟随鼠标移动。
 *
 * 使用范围很小（views/tools/directive.vue、packages/chat 里的注释），
 * 因此这里按实际用到的能力重写，不引入新依赖。
 */
interface DraggableValue {
  /** 拖拽把手选择器；不传则整个元素可拖 */
  handle?: string | HTMLElement
  /** 实际移动的元素选择器；不传则移动自身 */
  body?: string | HTMLElement
  /** 每次更新时复位位置 */
  recover?: boolean
  onPositionChange?: (
    positionDiff: { x: number; y: number },
    absolutePosition: { x: number; y: number },
    event: MouseEvent
  ) => void
  onDragStart?: (position: { x: number; y: number }, event: MouseEvent) => void
  onDragEnd?: (position: { x: number; y: number }, event: MouseEvent) => void
}

type DragEl = HTMLElement & { __draggableCleanup__?: () => void }

const resolveEl = (target: string | HTMLElement | undefined, fallback: HTMLElement): HTMLElement => {
  if (!target) return fallback
  if (typeof target === 'string') {
    return document.querySelector<HTMLElement>(target) || fallback
  }
  return target
}

const mount = (el: DragEl, binding: DirectiveBinding<DraggableValue>): void => {
  const value = binding.value || {}

  const handleEl = resolveEl(value.handle, el)
  const bodyEl = resolveEl(value.body, el)

  // 脱离文档流所需的定位上下文
  if (getComputedStyle(el).position === 'static') {
    el.style.position = 'absolute'
  }
  handleEl.style.cursor = 'move'

  let startX = 0
  let startY = 0
  let originX = 0
  let originY = 0
  let dragging = false

  const readTransform = () => {
    const match = /translate\(\s*(-?[\d.]+)px\s*,\s*(-?[\d.]+)px\s*\)/.exec(bodyEl.style.transform)
    if (match) {
      originX = parseFloat(match[1])
      originY = parseFloat(match[2])
    }
  }

  const onMousedown = (e: MouseEvent) => {
    readTransform()
    startX = e.pageX
    startY = e.pageY
    dragging = true
    value.onDragStart?.({x: originX, y: originY}, e)
    e.preventDefault()
  }

  const onMousemove = (e: MouseEvent) => {
    if (!dragging) return
    const diffX = e.pageX - startX
    const diffY = e.pageY - startY
    const nextX = originX + diffX
    const nextY = originY + diffY
    bodyEl.style.transform = `translate(${nextX}px, ${nextY}px)`
    value.onPositionChange?.({x: diffX, y: diffY}, {x: nextX, y: nextY}, e)
  }

  const onMouseup = (e: MouseEvent) => {
    if (!dragging) return
    dragging = false
    readTransform()
    value.onDragEnd?.({x: originX, y: originY}, e)
  }

  handleEl.addEventListener('mousedown', onMousedown)
  document.addEventListener('mousemove', onMousemove)
  document.addEventListener('mouseup', onMouseup)

  el.__draggableCleanup__ = () => {
    handleEl.removeEventListener('mousedown', onMousedown)
    document.removeEventListener('mousemove', onMousemove)
    document.removeEventListener('mouseup', onMouseup)
  }
}

export default {
  mounted: mount,
  updated(el: DragEl, binding: DirectiveBinding<DraggableValue>) {
    const value = binding.value
    if (value?.recover) {
      const bodyEl = resolveEl(value.body, el)
      bodyEl.style.transform = ''
    }
  },
  unmounted(el: DragEl) {
    el.__draggableCleanup__?.()
    delete el.__draggableCleanup__
  }
} as Directive<DragEl>

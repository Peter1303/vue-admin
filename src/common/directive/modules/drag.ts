import {on} from '@/common/utils'
import type {Directive, DirectiveBinding} from 'vue'

/**
 * v-drag —— 元素内拖拽（不脱离文档流）
 * 用法：`v-drag="{ trigger: '.xxx', body: '.xxx', recover: false }"`
 *
 * 与 `v-draggable`（脱离文档流、用 transform 定位）是两个不同指令，
 * 本项目两者都在用，所以要分别保留。
 */
interface DragValue {
  trigger: string
  body: string
  recover?: boolean
}

type DragEl = HTMLElement & { __dragCleanup__?: () => void }

const drag = (el: DragEl, binding: DirectiveBinding<DragValue>): void => {
  const value = binding.value
  if (!value) return

  const triggerDom = document.querySelector<HTMLElement>(value.trigger)
  const bodyDom = document.querySelector<HTMLElement>(value.body)
  if (!triggerDom || !bodyDom) {
    console.warn('[v-drag] trigger / body 选择器未匹配到元素', value)
    return
  }

  triggerDom.style.cursor = 'move'

  let pageX = 0
  let pageY = 0
  let transformX = 0
  let transformY = 0
  let canMove = false

  const handleMousedown = (e: MouseEvent) => {
    const transform = /\(.*\)/.exec(bodyDom.style.transform)
    if (transform) {
      const inner = transform[0].slice(1, transform[0].length - 1)
      const splitxy = inner.split('px, ')
      transformX = parseFloat(splitxy[0])
      transformY = parseFloat(splitxy[1].split('px')[0])
    }
    pageX = e.pageX
    pageY = e.pageY
    canMove = true
  }

  const handleMousemove = (e: MouseEvent) => {
    const xOffset = e.pageX - pageX + transformX
    const yOffset = e.pageY - pageY + transformY
    if (canMove) {
      bodyDom.style.transform = `translate(${xOffset}px, ${yOffset}px)`
    }
  }

  const handleMouseup = () => {
    canMove = false
  }

  on(triggerDom, 'mousedown', handleMousedown as EventListener)
  on(document, 'mousemove', handleMousemove as EventListener)
  on(document, 'mouseup', handleMouseup as EventListener)

  // 原实现把监听挂在 document 上却从不解绑，组件销毁后会持续泄漏
  el.__dragCleanup__ = () => {
    triggerDom.removeEventListener('mousedown', handleMousedown as EventListener)
    document.removeEventListener('mousemove', handleMousemove as EventListener)
    document.removeEventListener('mouseup', handleMouseup as EventListener)
  }
}

export default {
  mounted: drag,
  updated(el: DragEl, binding: DirectiveBinding<DragValue>) {
    if (binding.value?.recover) {
      const bodyDom = document.querySelector<HTMLElement>(binding.value.body)
      if (bodyDom) bodyDom.style.transform = ''
    }
  },
  unmounted(el: DragEl) {
    el.__dragCleanup__?.()
    delete el.__dragCleanup__
  }
} as Directive<DragEl>

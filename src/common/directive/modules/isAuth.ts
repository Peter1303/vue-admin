import type {Directive, DirectiveBinding} from 'vue'

/**
 * v-isAuth —— 元素级权限控制
 * 用法：`v-isAuth="'some-permission-code'"`
 * sessionStorage.permissions 里没有该权限时隐藏元素。
 */
const check = (el: HTMLElement, binding: DirectiveBinding<string>): void => {
  let permissions: string[] = []
  try {
    permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]')
    if (!Array.isArray(permissions)) permissions = []
  } catch {
    permissions = []
  }
  const isAuth = permissions.indexOf(binding.value) !== -1
  if (!isAuth) {
    el.style.display = 'none'
  }
}

export default {
  mounted: check,
  updated: check
} as Directive<HTMLElement>

import type {ApiSchema} from '@core/api'

export const USERINFO: ApiSchema = {
  url: 'userinfo',
  method: 'get',
  __remark: '用户信息'
}

export const ORDER_LIST: ApiSchema = {
  url: 'order',
  method: 'get',
  __remark: '订单列表信息'
}

export const USER_LIST: ApiSchema = {
  url: 'userlist',
  method: 'get',
  __remark: '用户列表信息'
}

/*
原项目里以下接口全部处于注释状态（未启用），保持原样不恢复：

export const LOGIN = { url: 'login', method: 'post', __remark: '登录' }
export const LOGIN_EXP = { url: 'login/experience', method: 'post', __remark: '体验登录' }
export const ROLE_MENU = { url: 'login/st/app/menus', method: 'post' }
export const LOGOUT = { url: 'logout', method: 'post' }
export const PASSWORD_FORGET = { url: 'password/reset', method: 'post' }
export const MOBILE_CHECK = { url: 'official/register/validate', method: 'post' }
export const CAPTCHA_SYSTEM = { url: 'sms/captcha/send/system', method: 'post' }
export const REGISTER = { url: 'register/login/experience', method: 'post' }
export const QRCODE_SERVICE = { url: 'sys/config/qr/customer/service', method: 'post' }
export const CURRENT_USER = { url: 'sts/si/employee/current', method: 'post' }
export const STORE_INFO = { url: 'sts/si/store/info', method: 'post' }
*/

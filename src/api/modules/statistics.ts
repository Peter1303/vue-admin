import type {ApiSchema} from '@core/api'

export const GET_DASHBOARD: ApiSchema = {
  url: 'dashboard',
  method: 'get',
  __remark: '统计数据'
}

export const GET_ANALYSIS: ApiSchema = {
  url: 'analysis',
  method: 'get',
  __remark: '统计'
}

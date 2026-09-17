<template>
  <div>
    <v-actionbar>
      <a-button type="dashed" @click="getAuth">获取鉴权</a-button>
      <a-button type="dashed" @click="visible = true">历史接口</a-button>
    </v-actionbar>
    <v-card style="margin-top:10px">
      <div class="example">
        <div class="example-box">
          <div class="block">
            <a-divider orientation="left">鉴权信息</a-divider>
            <div v-if="token" style="font-size:12px">
              {{ token }}
              {{ storeid }}
            </div>
            <a-alert v-else banner message="还没有鉴权信息，请先获取鉴权"/>
            <a-divider orientation="left">参数JSON格式</a-divider>
            <a-textarea v-model:value="currData" :auto-size="true" placeholder="请输入参数JSON格式"/>
            <a-divider orientation="left">方法及地址</a-divider>
            <a-input-group compact>
              <a-select v-model:value="currApi.method" style="width:90px">
                <a-select-option value="get">get</a-select-option>
                <a-select-option value="post">post</a-select-option>
                <a-select-option value="put">put</a-select-option>
                <a-select-option value="delete">delete</a-select-option>
              </a-select>
              <a-input v-model:value="currApi.url" placeholder="输入接口地址查询结果" style="width: 50%"/>
              <a-button :loading="loading" style="width:100px" type="primary" @click="onSearch">查询</a-button>
            </a-input-group>
            <a-divider orientation="left">响应结果</a-divider>
            <vue-json-pretty
              v-if="renderOK"
              v-model="value"
              :data="json"
              :deep="3"
              :highlight-mouseover-node="true"
              :highlight-selected-node="true"
              :path-selectable="pathSelectable"
              :select-on-click-node="true"
              :selectable-type="'single'"
              :show-double-quotes="false"
              :show-length="true"
              :show-line="true"
              :show-select-controller="false"
              path="res"
            />
            <div v-else-if="error" style="font-size:14px;color:red">{{ error }}</div>
            <div v-else style="font-size:14px;color:#999">暂无数据，点击查询查看结果</div>
          </div>
        </div>
      </div>
    </v-card>

    <a-drawer v-model:open="visible" :show-btns="false" :width="370" mode="code" @close="visible = false">
      <a-radio-group v-model:value="currApi" class="apilist">
        <a-radio v-for="(item,i) in apiList" :key="i" :style="{display:'block'}" :value="item">
          <div style="display:inline-block">
            <h1>
              <a-tag color="#2db7f5">{{ item.key }}</a-tag>
              {{ item.remark }}
            </h1>
            <p>
              <a-tag v-if="item.method=='get'" color="cyan">get</a-tag>
              <a-tag v-if="item.method=='post'" color="blue">post</a-tag>
              <a-tag v-if="item.method=='put'" color="orange">put</a-tag>
              <a-tag v-if="item.method=='delete'" color="red">delete</a-tag>
              {{ item.url }}
            </p>
          </div>
          <a-divider dashed style="margin:5px 0"/>
        </a-radio>
      </a-radio-group>
    </a-drawer>
    <div style="height:500px"></div>
  </div>
</template>

<script lang="ts" setup>
import {computed, nextTick, ref, watch} from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import axios from 'axios'
import {apiSource} from '@/api'
import qs from 'qs'

defineOptions({name: 'app'})

interface ApiSourceItem {
  method: string
  url: string
  __remark?: string
  __argus?: Record<string, unknown>
  data?: Record<string, unknown>
}

// @/api 的 apiSource 缺乏类型，此处收窄后使用
const apiSourceTyped = apiSource as Record<string, ApiSourceItem>
const apiList = Object.keys(apiSourceTyped).map((v) => {
  const item = apiSourceTyped[v]
  return {
    method: item.method,
    url: item.url,
    remark: item.__remark ?? '',
    data: {...(item.__argus ?? {}), ...(item.data ?? {})},
    key: v
  }
})

const visible = ref(false)
const renderOK = ref(false)
const loading = ref(false)
const error = ref<unknown>('')
// 当前的接口
const currApi = ref({
  url: '',
  method: 'get',
  data: {} as Record<string, unknown>,
  remark: '',
  key: ''
})
const value = ref('res.error')
const token = ref('')
const storeid = ref('')
const currData = ref('{}')
// REVIEW(迁移): 原 computed.json 在 catch 分支返回 this.cache，但 data 中从未定义 cache，
// 原语义即为「解析失败时返回 undefined」，这里用 undefined 常量保留该行为。
const cache: unknown = undefined
const val = ref('')

watch(
  currApi,
  (newVal) => {
    currData.value = JSON.stringify(newVal.data, null, 2)
  },
  {deep: true, immediate: true}
)

const json = computed(() => {
  try {
    return JSON.parse(val.value)
  } catch (err) {
    return cache
  }
})

function pathSelectable(path: string, data: unknown): boolean {
  return typeof data !== 'number'
}

function getAuth() {
  currApi.value = {
    url: 'login',
    method: 'post',
    data: {
      username: 15926290460,
      code: 778899,
      password: 290460
    },
    remark: '',
    key: ''
  }
  nextTick(() => {
    onSearch()
  })
}

function onSearch() {
  renderOK.value = false
  loading.value = true
  let paramsObj: Record<string, unknown> = {}
  try {
    paramsObj = JSON.parse(currData.value)
  } catch (e) {
    paramsObj = currApi.value.data
  }
  const data = currApi.value.method !== 'get' ? paramsObj : {}
  axios({
    url: currApi.value.url,
    method: currApi.value.method || 'get',
    baseURL: '/api/',
    params: currApi.value.method === 'get' ? paramsObj : {},
    data: qs.stringify(data, {
      arrayFormat: 'indices',
      allowDots: true
    }),
    responseType: 'json',
    headers: {
      'Cache-Control': 'no-cache',
      'Content-type': 'application/x-www-form-urlencoded',
      token: token.value,
      storeid: storeid.value
    }
    // REVIEW(迁移): 原配置里还有
    //   proxy: { '/store': { host: 'https://www.easy-mock.com/mock/...' } }
    // 这是 vue.config.js devServer.proxy 的形状，不是 axios 的 AxiosProxyConfig
    // （axios 期望 { host, port, protocol }），在浏览器端 axios 也不会使用 proxy 字段，
    // 属于从 Vue 2 工程里带过来的无效配置，故移除。开发期跨域代理由 vite.config.ts 的 server.proxy 承担。
  }).then(res => {
    error.value = false
    val.value = JSON.stringify(res.data)

    if (currApi.value.url === 'login') {
      const resData = res.data as { message?: unknown; data?: unknown }
      token.value = resData.message as string
      storeid.value = resData.data as string
    }
    nextTick(() => {
      renderOK.value = true
      loading.value = false
    })
  }).catch((err) => {
    error.value = err
  })
}
</script>

<style lang="less" scoped>
.apilist {
  h1 {
    font-size: 16px;
    margin-bottom: 2px;
  }

  p {
    font-size: 12px;
  }
}
</style>
<style>
.vjs-tree .vjs-value__string {
  word-break: break-all;
}
</style>

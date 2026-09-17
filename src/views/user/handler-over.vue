<template>
  <div class="handler-over">
    <v-actionbar>
      <template #right>
        <a-button size="large" type="primary">交班</a-button>
      </template>
    </v-actionbar>
    <div style="height: 20px"></div>

    <a-row>
      <a-col :md="12" :sm="24" :xs="24">
        <a-card :bordered="false" hoverable title="今日交班数据">
          <h1>{{ $fmt.currency(7300) }} <span class="helper-text">总收银额</span></h1>
          <a-divider>概览</a-divider>
          <a-list :data-source="data" item-layout="vertical" size="small">
            <template #renderItem="{ item }">
              <a-list-item class="list-item">
                <a-list-item-meta>
                  <template #title>
                    <a href="https://vue.ant.design/">{{ item.title }}</a>
                  </template>
                  <template #avatar>
                    <div>
                      <v-icon :name="item.icon"></v-icon>
                    </div>
                  </template>
                </a-list-item-meta>
                <template #extra>
                  <div>123</div>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
    <div style="height: 500px"></div>
  </div>
</template>

<script lang="ts" setup>
import {reactive} from 'vue'

defineOptions({name: 'HandlerOver'})

interface HandlerItem {
  title: string
  icon: string
}

// 原写法是 `reactive<HandlerItem[]>(Object.freeze([...]))`：Object.freeze 返回 readonly 数组，
// 与可变的 HandlerItem[] 类型冲突（且 a-list 的 data-source 也需要可变数组）。
// 这份数据是常量、组件内没有任何写入，去掉 Object.freeze 即可，语义不变。
const data = reactive<HandlerItem[]>([
  {
    title: '今日开单量',
    icon: 'icon-commodity'
  },
  {
    title: '今日收银额',
    icon: 'icon-transaction_fill'
  },
  {
    title: '今日完工量',
    icon: 'icon-task'
  },
  {
    title: '今日待办事项',
    icon: 'icon-shielding'
  }
])
</script>

<style lang="less" scoped>
.helper-text {
  font-size: 14px;
  color: #666;
}

.handler-over {
  .ant-list-item-meta-avatar {
    .iconfont {
      font-size: 30px;
      color: #1690ff;
    }
  }
}
</style>

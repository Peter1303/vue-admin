<template>
  <a-card :bordered="false">
    <result :description="description" :is-success="true" :title="title">
      <template #action>
        <a-button type="primary">返回列表</a-button>
        <a-button style="margin-left: 8px">查看项目</a-button>
        <a-button style="margin-left: 8px">打印</a-button>
      </template>
      <div>
        <div
          style="font-size: 16px;  font-weight: 500; margin-bottom: 20px;"
        >项目名称
        </div>
        <a-row style="margin-bottom: 16px">
          <a-col :lg="12" :md="12" :sm="12" :xl="6" :xs="24">
            <span>项目 ID：</span>
            20180724089
          </a-col>
          <a-col :lg="12" :md="12" :sm="12" :xl="6" :xs="24">
            <span>负责人：</span>
            曲丽丽是谁？
          </a-col>
          <a-col :lg="24" :md="24" :sm="24" :xl="12" :xs="24">
            <span>生效时间：</span>
            2016-12-12 ~ 2017-12-12
          </a-col>
        </a-row>
        <a-steps
          :current="1"
          :direction="isMobile && directionType.vertical || directionType.horizontal"
          progressDot
        >
          <a-step>
            <template #title><span style="font-size: 14px">创建项目</span></template>
            <template #description>
              <div
                style="fontSize: 12px;  position: relative; left: 42px;"
              >
                <div style="margin: 8px 0 4px">曲丽丽
                  <a-icon style="margin-left: 8px" type="dingding-o"/>
                </div>
                <div>2016-12-12 12:32</div>
              </div>
            </template>
          </a-step>
          <a-step>
            <template #title><span style="font-size: 14px">部门初审</span></template>
            <template #description>
              <div
                style="fontSize: 12px; position: relative; left: 42px;"
              >
                <div style="margin: 8px 0 4px">周毛毛
                  <a-icon style="margin-left: 8px; color: #00A0E9" type="dingding-o"/>
                </div>
                <div>
                  <a href="">催一下</a>
                </div>
              </div>
            </template>
          </a-step>
          <a-step>
            <template #title><span style="font-size: 14px">财务复核</span></template>
          </a-step>
          <a-step>
            <template #title><span style="font-size: 14px">完成</span></template>
          </a-step>
        </a-steps>
      </div>
    </result>
  </a-card>
</template>

<script lang="ts" setup>
import Result from './template/result.vue'
import {computed} from 'vue'
import {useSysStore} from '@store/modules/sys'

defineOptions({name: 'success'})

const directionType = {
  horizontal: 'horizontal',
  vertical: 'vertical'
}

// REVIEW(迁移): 原 this.$store.state.sys.isMobile。当前 Pinia sys store 仅迁移了 menu/setMenu，
// 无 isMobile 字段；此处保留原取值意图，值为 undefined（等价于“非移动端”），待 store 补全后恢复。
const sys = useSysStore()
const isMobile = computed(() => (sys as unknown as Record<string, unknown>).isMobile as boolean)

const title = '提交成功'
const description =
  '提交结果页用于反馈一系列操作任务的处理结果，\n' +
  ' 如果仅是简单操作，使用 Message 全局提示反馈即可。\n' +
  ' 本文字区域可以展示简单的补充说明，如果有类似展示\n' +
  ' “单据”的需求，下面这个灰色区域可以呈现比较复杂的内容。'
</script>

<style scoped>
</style>

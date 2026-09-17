<template>
  <div>
    <v-card>
      <a-button type="primary" @click="guide">点我开启向导</a-button>
      <a-divider/>
      <a-alert
        id="id1"
        description="This is an error message about copywriting."
        message="Error"
        show-icon
        type="error"
      />
      <a-divider/>
      <a-list :data-source="data" item-layout="horizontal">
        <template #renderItem="{ item }">
          <a-list-item id="id2">
            <a-list-item-meta
              description="Ant Design, a design language for background applications, is refined by Ant UED Team"
            >
              <template #title>
                <a href="https://vue.ant.design/">{{ item.title }}</a>
              </template>
              <template #avatar>
                <a-avatar
                  src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                />
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
      <a-divider/>
      <a-comment id="id3">
        <template #actions>
          <span>
            <a-tooltip title="Like">
              <a-icon
                :theme="action === 'liked' ? 'filled' : 'outlined'"
                type="like"
                @click="like"
              />
            </a-tooltip>
            <span style="padding-left: '8px';cursor: 'auto'">{{ likes }}</span>
          </span>
          <span>
            <a-tooltip title="Dislike">
              <a-icon
                :theme="action === 'disliked' ? 'filled' : 'outlined'"
                type="dislike"
                @click="dislike"
              />
            </a-tooltip>
            <span style="padding-left: '8px';cursor: 'auto'">{{ dislikes }}</span>
          </span>
          <span>Reply to</span>
        </template>
        <template #author>
          <a>Han Solo</a>
        </template>
        <template #avatar>
          <a-avatar
            alt="Han Solo"
            src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
          />
        </template>
        <template #content>
          <p>We supply a series of design principles, practical patterns and high quality design resources (Sketch and
            Axure), to help people create their product prototypes beautifully and efficiently.</p>
        </template>
        <template #datetime>
          <a-tooltip :title="moment().format('YYYY-MM-DD HH:mm:ss')">
            <span>{{ moment().fromNow() }}</span>
          </a-tooltip>
        </template>
      </a-comment>
    </v-card>
    <v-guide ref="guideRef" :steps="steps"/>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import moment from 'moment'

interface GuideListItem {
  title: string
}

const data: GuideListItem[] = [
  {title: 'Ant Design Title 1'},
  {title: 'Ant Design Title 2'},
  {title: 'Ant Design Title 3'},
  {title: 'Ant Design Title 4'}
]

// driver.js v1 的 steps 结构：v0.9 的 `position` 改为 `side`，`stageBackground` 已废弃（用全局 opacity）。
// 每个步骤的 element 选择器与文案保持与原版一致。
type PopoverSide = 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

interface GuidePopover {
  className?: string
  title: string
  description: string
  side: PopoverSide
}

interface GuideStep {
  element: string
  popover: GuidePopover
}

const steps: GuideStep[] = [
  {
    element: '#id1',
    popover: {
      className: 'first-step-popover-class',
      title: '提示说明模块',
      description: '当某个页面需要向用户显示警告的信息时。',
      side: 'bottom'
    }
  },
  {
    element: '#id2',
    popover: {
      title: '通用列表。',
      description: '最基础的列表展示，可承载文字、列表、图片、段落，常用于后台数据展示页面。',
      side: 'top'
    }
  },
  {
    element: '#id3',
    popover: {
      title: '评论组件',
      description: '评论组件可用于对事物的讨论，例如页面、博客文章、问题等等。',
      side: 'top'
    }
  }
]

const likes = ref(0)
const dislikes = ref(0)
const action = ref<string | null>(null)

// v-guide 通过 defineExpose 暴露 start / destroy
const guideRef = ref<{ start: () => void; destroy: () => void } | null>(null)

function like() {
  likes.value = 1
  dislikes.value = 0
  action.value = 'liked'
}

function dislike() {
  likes.value = 0
  dislikes.value = 1
  action.value = 'disliked'
}

function guide() {
  guideRef.value?.start()
}
</script>

<style lang="scss" scoped>
</style>

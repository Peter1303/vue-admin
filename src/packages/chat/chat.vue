<template>
  <div v-if="modelValue" v-drag="{trigger:'.chat-top',body:'.artiely-chat'}" class="artiely-chat">
    <div class="chat-top">
      <div class="top-l">
        <v-avatar-group :avatarList="list1" :maxlength="3" :size="20" style="margin-top:10px"></v-avatar-group>
        <span>排队中...</span>
      </div>
      <div class="top-m">谭杰</div>
      <div class="top-r">
        快捷回复
        <v-icon name="icon-smallscreen" @click="close"></v-icon>
      </div>
    </div>
    <div class="chat-container">
      <div class="chat-custom-wrapper">
        <div class="custom-wrapper">
          <div v-for="item in list2" :key="item.id" class="custom-list">
            <a-avatar
              :style="{background:item.color}"
            >{{ item.name.split('')[0] }}
            </a-avatar>
            <div class="userinfo">
              <h1 class="name">{{ item.name }}</h1>
              <h1 class="tel number">{{ telFormat(item.tel) }}</h1>
            </div>
            <a-badge :count="item.count" class="message-count"/>
          </div>
        </div>
      </div>
      <div class="chat-content-wrapper">
        <div class="chat-list">
          <div class="chat-body">
            <div class="left">
              <div class="avatar">
                <a-avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>
              </div>
              <div class="message-box">
                <div class="message">
                  你们这是什么服务态度啊！！！你们这是什么服务态度啊！！！你们这是什么服务态度啊！！！你们这是什么服务态度啊！！！
                </div>
              </div>
            </div>
            <div class="left">
              <div class="avatar">
                <a-avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>
              </div>
              <div class="message-box">
                <div class="message">你们这是什么服务态度啊！！！</div>
              </div>
            </div>
            <div class="right">
              <div class="message-box">
                <div class="message">亲~，您听我解释...</div>
              </div>
              <div class="avatar">
                <a-avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>
              </div>
            </div>
          </div>
        </div>
        <div class="chat-input">
          <div class="input-action">
            <v-icon name="icon-picture"></v-icon>
            <v-emoji-picker @emoji="handleEmoji">
              <v-icon name="icon-emoji"></v-icon>
            </v-emoji-picker>
          </div>
          <a-textarea
            v-model:value="messageInfo"
            :auto-size="{ minRows: 2, maxRows: 2 }"
            class="input-field"
            placeholder="客户就是衣食父母~！"
          />
          <div class="send">
            <v-icon name="icon-fasong"></v-icon>
          </div>
        </div>
      </div>
      <div class="message-list">
        <ul>
          <li v-for="i in list" :key="i" class="message-item">{{ i }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, reactive, ref} from 'vue'
import {api} from '@core'
import {telFormat} from '@/common/filter'

defineOptions({name: 'v-chat'})

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
  }>(),
  {modelValue: false}
)
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const list = [
  'Hello，周末愉快！很高兴为你效劳',
  '您好，欢迎光临本小店，请问您观看中哪些宝贝？我可以帮你介绍一下',
  '您好，欢迎光临足康乐旗舰店，很高兴为您服务,请问有什么可以帮助您！',
  '您好！请问有什么可以为您效劳吗？',
  '您好！欢迎光临足康乐旗舰店，请问可以帮助到您吗？',
  '您好！欢迎光临足康乐旗舰店，很高兴为您效劳！',
  '好吧，如果您相信我的个人意见，我给您推荐几款，存属个人意见哈，呵呵……',
  '我们的价格是最优惠的了',
  '你还有什么不了解或者不明白的地方吗？ ',
  '忘了告诉你，我这几天正好在促销，优惠很大的'
]

const messageInfo = ref('')
const list2 = ref<any[]>([])
const list1 = [
  {
    url:
      'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    label: '头像提示1'
  },
  {
    url:
      'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    label: '头像提示2'
  },
  {
    url:
      'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    label: '头像提示3'
  },
  {
    url:
      'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    label: '头像提示4'
  },
  {
    url:
      'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    label: '头像提示5'
  },
  {
    url:
      'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    label: '头像提示6'
  }
]
const draggableValue = reactive<{ handle: HTMLElement | null }>({handle: null})

function close() {
  emit('update:modelValue', false)
}

function handleEmoji(emoji: string) {
  messageInfo.value += emoji
}

function getData() {
  api
    .USER_LIST()
    .then((res: any) => {
      list2.value = (res && res.list) || []
    })
    .catch(() => {
      list2.value = []
    })
    .finally(() => {
      // 常驻组件：失败也要收尾，避免未捕获的 Promise 在每一页抛错
    })
}

onMounted(() => {
  getData()
  // 原 $refs.handle 在模板里无对应节点，这里保持 undefined/空的原始行为
  draggableValue.handle = null
})
</script>

<style lang="less" scoped>
@import "@/assets/styles/var.less";

.artiely-chat {
  height: 500px;
  width: 800px;
  position: fixed;
  right: 0;
  z-index: 999;
  bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 0 22px rgba(0, 0, 0, 0.1);
  display: flex;
  background: color-mix(in srgb, var(--background-color-base, @background-color-base) 90%, transparent);
  flex-direction: column;
  overflow: hidden;

  .chat-top {
    height: 50px;
    padding-top: 10px;
    padding-left: 10px;
    display: flex;

    .top-l {
      width: 180px;
      display: flex;
      line-height: 40px;
    }

    .top-m {
      flex: 1;
      font-size: 18px;
      color: var(--text-color, @text-color);
      line-height: 40px;
    }

    .top-r {
      width: 180px;
      text-align: center;
      line-height: 40px;
    }

    .icon-smallscreen {
      position: absolute;
      top: -10px;
      right: 0;
      font-size: 24px;
      cursor: pointer;
    }
  }

  .chat-container {
    display: flex;
    height: 450px;
    flex: 1;
  }

  .input-action {
    display: flex;
    padding-left: 10px;

    .iconfont {
      font-size: 24px;
      margin: 0 3px;
    }
  }

  .custom-list {
    display: flex;
    border-top: 1px solid var(--background-color-base, @background-color-base);
    padding: 10px 0;

    .userinfo {
      display: flex;
      flex: 1;
      flex-direction: column;
      padding-left: 5px;

      .name {
        font-size: 14px;
        color: var(--text-color-secondary, @text-color-secondary);
        margin: 0;
      }

      .tel {
        font-size: 10px;
        color: #999;
      }
    }

    .message-count {
      transform: scale(0.8);
    }
  }

  .chat-custom-wrapper {
    display: flex;
    width: 180px;
    padding-left: 10px;
    flex-direction: column;

    .custom-action {
      height: 50px;
    }
  }

  .custom-wrapper {
    flex: 1;
    overflow-y: scroll;
  }

  .chat-content-wrapper {
    flex: 2;
    background: color-mix(in srgb, var(--layout-body-background, @layout-body-background) 90%, transparent);
    display: flex;
    flex-direction: column;

    .chat-list {
      flex: 3;
      display: flex;
      flex-direction: column;

      .chat-body {
        flex: 1;
        display: flex;
        flex-direction: column;

        .avatar {
          width: 40px;
        }

        .left {
          display: flex;
          padding-left: 5px;
          padding-right: 20px;
          padding-top: 40px;
          justify-content: flex-start;

          .message-box {
            flex: 1;
            display: flex;
            justify-content: flex-start;
          }

          .message {
            margin-left: 10px;
            background: rgba(#1690ff, 0.5);
            color: #fff;
            padding: 6px;
            border-radius: 4px;
            position: relative;
          }
        }

        .right {
          display: flex;
          padding-left: 20px;
          padding-right: 5px;
          padding-top: 40px;
          justify-content: flex-end;

          .message-box {
            flex: 1;
            display: flex;
            justify-content: flex-end;
          }

          .message {
            margin-right: 10px;
            background: rgba(#bbb);
            color: #fff;
            padding: 6px;
            border-radius: 4px;
            position: relative;
          }
        }
      }
    }

    .chat-input {
      flex: 1;
      background: var(--layout-body-background, @layout-body-background);
      display: flex;
      flex-direction: column;

      .input-field {
        flex: 1;
        border: none;
        outline: none;
        box-shadow: none;
        overflow-y: scroll;
      }

      .send {
        text-align: right;
        padding-right: 20px;

        .iconfont {
          font-size: 24px;
          cursor: pointer;
        }
      }
    }
  }

  .message-list {
    width: 180px;
    overflow-y: scroll;

    .message-item {
      background: var(--body-background, @body-background);
      cursor: pointer;
      padding: 3px 8px;
      border-radius: 4px;
      margin: 5px 10px;

      &:hover {
        // darken() 是编译期函数，取不到 CSS 变量；color-mix 与它在 #fff 上等价（90% 白 + 10% 黑 = #e6e6e6）
        background: color-mix(in srgb, var(--body-background, @body-background) 90%, black);
      }
    }
  }
}
</style>

<template>
  <div class="fr header-right">
    <v-button class="hidden-xs-only" tip="点击新增一个订单">
      <a-icon type="search"/>
    </v-button>
    <v-button class="hidden-xs-only" tip="查看今日订单">
      <a-iconfont type="icon-commodity"/>
    </v-button>
    <v-button class="hidden-xs-only" tip="查看今日营业额">
      <a-iconfont type="icon-financial_fill"/>
    </v-button>
    <v-button tip="预约消息">
      <a-iconfont type="icon-wangwang"/>
    </v-button>
    <v-button class="hidden-xs-only" tip="代办事项">
      <a-iconfont type="icon-time"/>
    </v-button>
    <v-button :tip="screen?'退出全屏':'全屏'" class="hidden-xs-only" @click="toggleScreen">
      <a-iconfont :type="screen?'icon-smallscreen':'icon-send'"/>
    </v-button>
    <v-button class="hidden-xs-only" tip="锁屏" @click="router.push('/lock')">
      <a-iconfont type="icon-lock"/>
    </v-button>
    <a-divider type="vertical"/>
    <a-dropdown>
      <a class="ant-dropdown-link" href="#">
        <a-badge :count="99">
          <a-avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>
        </a-badge>
        Artiely
        <a-icon type="down"/>
      </a>
      <template #overlay>
        <a-menu>
          <a-menu-item key="-1">
            <a href="javascript:;" rel="noopener noreferrer" @click="router.push('/userinfo')">个人中心</a>
          </a-menu-item>
          <a-menu-item key="0">
            <a href="javascript:;" rel="noopener noreferrer" @click="router.push('/todo')">代办事项</a>
          </a-menu-item>
          <a-menu-item key="1">
            <a
              href="javascript:;"
              rel="noopener noreferrer"
              @click="router.push('/handler-over')"
            >交班下班</a>
          </a-menu-item>
          <a-menu-divider/>
          <a-menu-item key="2">
            <a href="javascript:;" rel="noopener noreferrer" @click="router.replace('/login')">退出登录</a>
          </a-menu-item>
          <a-menu-divider/>
          <a-menu-item key="3" disabled>切换店铺</a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
    <a-divider type="vertical"/>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {message} from 'ant-design-vue'

const router = useRouter()
const screen = ref(false)

function toggleScreen() {
  if (!screen.value) {
    const docElm = document.documentElement
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen()
    } else if ((docElm as HTMLElement & { mozRequestFullScreen?: () => void }).mozRequestFullScreen) {
      (docElm as HTMLElement & { mozRequestFullScreen?: () => void }).mozRequestFullScreen!()
    } else if ((docElm as HTMLElement & { webkitRequestFullScreen?: () => void }).webkitRequestFullScreen) {
      (docElm as HTMLElement & { webkitRequestFullScreen?: () => void }).webkitRequestFullScreen!()
    } else if ((docElm as HTMLElement & { msRequestFullscreen?: () => void }).msRequestFullscreen) {
      (docElm as HTMLElement & { msRequestFullscreen?: () => void }).msRequestFullscreen!()
    } else {
      message.error({
        content: '除了让你升级浏览器对方没什么好说的！',
        duration: 3
      })
    }
    screen.value = true
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if ((document as Document & { mozCancelFullScreen?: () => void }).mozCancelFullScreen) {
      (document as Document & { mozCancelFullScreen?: () => void }).mozCancelFullScreen!()
    } else if ((document as Document & { webkitCancelFullScreen?: () => void }).webkitCancelFullScreen) {
      (document as Document & { webkitCancelFullScreen?: () => void }).webkitCancelFullScreen!()
    } else if ((document as Document & { msExitFullscreen?: () => void }).msExitFullscreen) {
      (document as Document & { msExitFullscreen?: () => void }).msExitFullscreen!()
    } else {
      message.error({
        content: '请升级浏览器，不然我是不会理你的！',
        duration: 3
      })
    }
    screen.value = false
  }
}
</script>

<style scoped>
.header-right {
  height: 64px;
  overflow: hidden;
  padding-right: 20px;
}
</style>

<template>
  <div class="v-bg login">
    <a-modal
      v-model:open="centerDialogVisible"
      :body-style="{ padding: 0 }"
      :closable="false"
      :footer="null"
      :keyboard="false"
      :mask="false"
      :mask-closable="false"
      :modal="false"
      :show-close="false"
      :width="layout.breakPoint !== 'lg' ? '400px' : '1000px'"
      centered
      class="login-modal"
      wrap-class-name="my-login-modal"
    >
      <div style="display: flex">
        <div class="hidden-md-and-down" style="flex: 2">
          <a-carousel autoplay>
            <div><h3>1</h3></div>
            <div><h3>2</h3></div>
            <div><h3>3</h3></div>
            <div><h3>4</h3></div>
          </a-carousel>
        </div>
        <div style="flex: 1">
          <a-spin :spinning="loading">
            <div class="login1" style="padding: 40px">
              <v-logo color="#333"/>
              <a-form ref="formRef" :model="state" :rules="rules">
                <a-form-item
                  :label-col="formItemLayout.labelCol"
                  :wrapper-col="formItemLayout.wrapperCol"
                  name="username"
                >
                  <a-input v-model:value="state.username" placeholder="请输入邮箱地址" size="large">
                    <template #prefix>
                      <a-icon type="user"/>
                    </template>
                  </a-input>
                </a-form-item>
                <a-form-item
                  :label-col="formItemLayout.labelCol"
                  :wrapper-col="formItemLayout.wrapperCol"
                  name="password"
                >
                  <a-input v-model:value="state.password" placeholder="请输入密码" size="large" type="password">
                    <template #prefix>
                      <a-icon type="lock"/>
                    </template>
                  </a-input>
                </a-form-item>
                <a-form-item
                  :label-col="formItemLayout.labelCol"
                  :wrapper-col="formItemLayout.wrapperCol"
                  style="margin-bottom: 0"
                >
                  <a-checkbox v-model:checked="memory" @change="memory != memory">下次自动登录</a-checkbox>
                </a-form-item>
              </a-form>

              <a-button
                :loading="loading"
                size="large"
                style="width: 100%; margin-bottom: 10px"
                type="primary"
                @click="check"
              >登录
              </a-button>
              <a @click="toRegister">还没有账号？立即注册</a>
              <a class="fr" href="">忘记密码</a>
              <div style="padding-top: 50px">
                为了您的流畅体验和避免广告骚扰，我们推荐您使用chrome浏览器，<a href="">点击下载</a>
              </div>
            </div>
          </a-spin>
        </div>
      </div>
    </a-modal>
    <div id="particles-js"></div>
  </div>
</template>

<script lang="ts" setup>
import {v4 as uuidv4} from 'uuid'
import md5 from 'md5'
import {layout} from '@layouts'
import {api} from '@core'
import {onBeforeRouteLeave, useRouter} from 'vue-router'
import {onMounted, reactive, ref} from 'vue'
import type {FormInstance} from 'ant-design-vue'

const formItemLayout = {
  labelCol: {span: 6},
  wrapperCol: {span: 24}
}
const centerDialogVisible = ref(true)
const loading = ref(false)
const memory = ref(true)
const uuidR = ref('')
const formRef = ref<FormInstance | null>(null)
const state = reactive({
  username: 'admin',
  password: ''
})
const rules = {
  username: [{required: true, message: '请输入邮箱地址'}],
  password: [{required: true, message: '请输入密码'}]
}
const router = useRouter()

function toRegister() {
  router.push('/register')
}

async function check() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  loading.value = true
  const password = state.password
  // REVIEW(迁移): 原 this.$store.commit('sys/savePassword', md5(password))。
  // 当前 Pinia sys store 仅迁移了 menu/setMenu，无 savePassword action，auth 模块亦未迁移；
  // 保留 md5 处理意图但暂不提交，待 store 补全后恢复。
  void md5(password)
  // REVIEW(迁移): 原 this.$store.dispatch('auth/login', {...})。当前 src/api/modules/auth.ts 中
  // LOGIN 接口被注释禁用，且 auth Vuex 模块未迁移；此处保留预期的登录网络调用意图，
  // 取消 auth.ts 中 LOGIN 注释后 api.LOGIN 即可生效。未擅自改动业务调用意图。
  api.LOGIN({...state, uuid: uuidR.value})
    .then(() => {
      getCaptch()
    })
    .catch(() => {
      getCaptch()
    })
    .finally(() => {
      loading.value = false
    })
}

// eslint 全局变量声明：particles.js 由页面脚本注入，无类型定义
declare const particlesJS: (containerId: string, config: Record<string, unknown>, callback?: () => void) => void

function getCaptch() {
  uuidR.value = uuidv4()
  // this.captchPath = this.$api.CAPTCHA() + this.uuid
}

function _animateBg() {
  particlesJS(
    'particles-js',
    {
      particles: {
        number: {
          value: 80,
          density: {
            enable: true,
            value_area: 800
          }
        },
        color: {
          value: '#888888'
        },
        shape: {
          type: 'circle',
          stroke: {
            width: 0,
            color: '#000000'
          },
          polygon: {
            nb_sides: 5
          },
          image: {
            src: 'img/github.svg',
            width: 100,
            height: 100
          }
        },
        opacity: {
          value: 0.5,
          random: false,
          anim: {
            enable: false,
            speed: 1,
            opacity_min: 0.1,
            sync: false
          }
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: false,
            speed: 40,
            size_min: 0.1,
            sync: false
          }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#999999',
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: 6,
          direction: 'none',
          random: false,
          straight: false,
          out_mode: 'out',
          bounce: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200
          }
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: {
            enable: true,
            mode: 'repulse'
          },
          onclick: {
            enable: true,
            mode: 'push'
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 400,
            line_linked: {
              opacity: 1
            }
          },
          bubble: {
            distance: 400,
            size: 40,
            duration: 2,
            opacity: 8,
            speed: 3
          },
          repulse: {
            distance: 200,
            duration: 0.4
          },
          push: {
            particles_nb: 4
          },
          remove: {
            particles_nb: 2
          }
        }
      },
      retina_detect: true
    },
    function () {
      console.log('callback - particles.js config loaded')
    }
  )
}

onMounted(() => {
  _animateBg()
  getCaptch()
})

onBeforeRouteLeave(() => {
  loading.value = false
})
</script>

<style lang="less">
/* For demo */
.ant-carousel {
  width: 667px;
}

.ant-carousel .slick-slide {
  text-align: center;
  height: 500px;
  line-height: 500px;
  background: #364d79;
  overflow: hidden;
}

.login1 .ant-form-item-control .ant-input {
  border: none;
  border-bottom: 1px solid #1690ff;
  border-radius: 0;
}

.ant-carousel .slick-slide h3 {
  color: #fff;
}

.v-bg {
  height: 100%;
  min-height: 100vh;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background: #eee;
}

canvas {
  display: block;
  /* vertical-align: bottom; */
}

/* ---- particles.js container ---- */
#particles-js {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: none;
  background-image: url("");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50% 50%;
}

/* ---- stats.js ---- */
</style>

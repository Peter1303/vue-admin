<template>
  <div class="v-bg">
    <a-modal
      v-model:open="centerDialogVisible"
      :closable="false"
      :footer="null"
      :keyboard="false"
      :mask="false"
      :mask-closable="false"
      :modal="false"
      :show-close="false"
      centered
      class="login-modal my-login-modal"
      style="width: 300px !important"
      width="400px"
    >
      <a-spin :spinning="loading">
        <v-logo color="#333"></v-logo>
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
            name="captcha"
          >
            <a-input
              v-model:value="state.captcha"
              autocomplete="off"
              class="captch-img"
              placeholder="请输入右侧验证码"
              size="large"
            >
              <template #addonAfter>
                <img :src="captchPath" style="width: 152px; cursor: pointer" @click="getCaptch"/>
              </template>
            </a-input>
          </a-form-item>
          <a-form-item
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
            style="margin-bottom: 0"
          >
            <a-checkbox v-model:checked="memory" @change="memory != memory">记住密码</a-checkbox>
            <a class="fr" href="">忘记密码</a>
          </a-form-item>
        </a-form>
        <div>
          <a-button
            :loading="loading"
            size="large"
            style="width: 100%"
            type="primary"
            @click="check"
          >登录
          </a-button>
          <a-button
            :loading="loading"
            size="large"
            style="width: 100%; margin: 10px 0 0 0"
            @click="toRegister"
          >立即注册
          </a-button>
        </div>
      </a-spin>
    </a-modal>
    <div id="particles-js"></div>
  </div>
</template>

<script lang="ts" setup>
import {v4 as uuidv4} from 'uuid'
import md5 from 'md5'
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
const captchPath = ref('')
const formRef = ref<FormInstance | null>(null)
const state = reactive({
  username: 'admin',
  password: '',
  captcha: ''
})
const rules = {
  username: [{required: true, message: '请输入邮箱地址'}],
  password: [{required: true, message: '请输入密码'}],
  captcha: [{required: true, message: '请输入右侧验证码'}]
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
          value: 6,
          density: {
            enable: true,
            value_area: 800
          }
        },
        color: {
          value: '#1b1e34'
        },
        shape: {
          type: 'polygon',
          stroke: {
            width: 0,
            color: '#000'
          },
          polygon: {
            nb_sides: 6
          },
          image: {
            src: 'img/github.svg',
            width: 100,
            height: 100
          }
        },
        opacity: {
          value: 0.3,
          random: true,
          anim: {
            enable: false,
            speed: 1,
            opacity_min: 0.1,
            sync: false
          }
        },
        size: {
          value: 160,
          random: false,
          anim: {
            enable: true,
            speed: 10,
            size_min: 40,
            sync: false
          }
        },
        line_linked: {
          enable: false,
          distance: 200,
          color: '#ffffff',
          opacity: 1,
          width: 2
        },
        move: {
          enable: true,
          speed: 8,
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
            enable: false,
            mode: 'grab'
          },
          onclick: {
            enable: false,
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

<style lang="less" scoped>
.my-login-modal {
  .ant-modal-content {
    border-radius: 0;
  }
}

.captch-img {
  .ant-input-group-addon {
    padding: 0;
  }
}

.v-bg {
  height: 100%;
  min-height: 100vh;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-image: url('../../assets/fullstack.jpg');
}

.login-modal {
  .ant-modal-body {
    padding-bottom: 0 !important;
  }
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
  background-image: url('');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50% 50%;
}

/* ---- stats.js ---- */
.count-particles {
  background: #000022;
  position: absolute;
  top: 48px;
  left: 0;
  width: 80px;
  color: #13e8e9;
  font-size: 0.8em;
  text-align: left;
  text-indent: 4px;
  line-height: 14px;
  padding-bottom: 2px;
  font-family: Helvetica, Arial, sans-serif;
  font-weight: bold;
}

.js-count-particles {
  font-size: 1.1em;
}

#stats,
.count-particles {
  -webkit-user-select: none;
  margin-top: 5px;
  margin-left: 5px;
}

#stats {
  border-radius: 3px 3px 0 0;
  overflow: hidden;
}

.count-particles {
  border-radius: 0 0 3px 3px;
}
</style>

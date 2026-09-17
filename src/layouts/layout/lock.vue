<template>
  <div class="lock-wrapper" @keyup.esc="back">
    <div id="clock">
      <p class="date">{{ date }}</p>
      <p class="time">{{ time }}</p>
      <div class="lock-input-wrapper">
        <input
          v-model="password"
          autocomplete="off"
          placeholder="输入密码解锁"
          type="password"
          @keyup.enter="back"
        >
      </div>
      <p class="text">DIGITAL CLOCK by Artiely</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {h, nextTick, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {notification} from 'ant-design-vue'
import md5 from 'md5'
import {useSysStore} from '@store/modules/sys'

const router = useRouter()
const sys = useSysStore()

// 注意：迁移后的 sys store 只含 menu/setMenu，原 Vue2 的 password / isLock 尚未迁入，
// 这里用宽松类型保留原始取数 / 写回行为，待 store 补齐后再收敛。
const sysAny = sys as unknown as { password?: string; isLock: boolean }

const time = ref('')
const date = ref('')
const password = ref('')

onMounted(() => {
  nextTick(() => {
    render()
    document.addEventListener('keyup', (e: KeyboardEvent) => {
      if (e.keyCode === 27) {
        back()
      }
    })
  })
})

function back() {
  if (md5(password.value) === sysAny.password) {
    sysAny.isLock = false
    router.replace({name: 'workplace'})
  } else {
    const key = `open${Date.now()}`
    notification.error({
      placement: 'topRight',
      message: '错误提示！',
      description: '密码错误！访问被拒绝！',
      duration: 5,
      btn: () => h('a-button', {type: 'primary', size: 'small'}, '忘记密码？'),
      key
    })
  }
}

function render() {
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  setInterval(updateTime, 1000)
  updateTime()

  function updateTime() {
    const cd = new Date()
    time.value =
      zeroPadding(cd.getHours(), 2) +
      ':' +
      zeroPadding(cd.getMinutes(), 2) +
      ':' +
      zeroPadding(cd.getSeconds(), 2)
    date.value =
      zeroPadding(cd.getFullYear(), 4) +
      '-' +
      zeroPadding(cd.getMonth() + 1, 2) +
      '-' +
      zeroPadding(cd.getDate(), 2) +
      ' ' +
      week[cd.getDay()]
  }

  function zeroPadding(num: number, digit: number) {
    let zero = ''
    for (let i = 0; i < digit; i++) {
      zero += '0'
    }
    return (zero + num).toString().slice(-digit)
  }
}
</script>

<style lang="less">
.lock-wrapper {
  display: flex;
  flex: 1;
  height: 100vh;
  background: #0f3854;
  background: radial-gradient(ellipse at center, #0a2e38 0%, #000000 70%);
  background-size: 100%;
}

.lock-input-wrapper {
  height: 60px;
  width: 200px;
  border-radius: 4px;
  border: 2px solid #0a2e38;
  margin: 0 auto;

  input {
    height: 100%;
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    font-size: 24px;
    text-align: center;
  }
}

#clock {
  font-family: 'Share Tech Mono', monospace;
  text-align: center;
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  color: #daf6ff;
  text-shadow: 0 0 20px #0aafe6, 0 0 20px rgba(10, 175, 230, 0);
}

#clock .time {
  letter-spacing: 0.05em;
  font-size: 80px;
  padding: 5px 0;
  font-family: 'DINPro-Medium';
}

#clock .date {
  letter-spacing: 0.1em;
  font-size: 24px;
}

#clock .text {
  letter-spacing: 0.1em;
  font-size: 12px;
  padding: 20px 0 0;
}
</style>

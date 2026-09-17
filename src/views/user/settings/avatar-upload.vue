<template>
  <a-modal
    v-model:open="visible"
    :confirm-loading="confirmLoading"
    :mask-closable="false"
    :width="800"
    title="修改头像"
    @cancel="cancelHandel"
  >
    <a-row>
      <a-col :md="12" :style="{ height: '350px' }" :xs="24">
        <vue-cropper
          ref="cropper"
          :auto-crop="option.autoCrop"
          :auto-crop-height="option.autoCropHeight"
          :auto-crop-width="option.autoCropWidth"
          :fixed-box="option.fixedBox"
          :img="option.img"
          :info="true"
          @real-time="realTime"
        ></vue-cropper>
      </a-col>
      <a-col :md="12" :style="{ height: '350px' }" :xs="24">
        <div class="avatar-upload-preview">
          <img :src="previews.url" :style="previews.img"/>
        </div>
      </a-col>
    </a-row>

    <template #footer>
      <a-button key="back" @click="cancelHandel">取消</a-button>
      <a-button key="submit" :loading="confirmLoading" type="primary" @click="okHandel">
        保存
      </a-button>
    </template>
  </a-modal>
</template>

<script lang="ts" setup>
import {reactive, ref} from 'vue'
import {message} from 'ant-design-vue'
// vue-cropper 1.x 是 Vue 3 版本（原来是 0.4.x / Vue 2）。
// ⚠️ v1 必须手动引入样式，antdv1 时代是自动带的，漏了会看到裁切框错位。
import {VueCropper} from 'vue-cropper'
import 'vue-cropper/dist/index.css'
import mobileImg from '@/assets/img/mobile.png'

defineOptions({name: 'AvatarUpload'})

const visible = ref(false)
const id = ref<number | null>(null)
const confirmLoading = ref(false)

const option = reactive({
  // 原 data() 里是 require('../../../assets/img/mobile.png')，
  // Vite 下浏览器没有 require，会整页空白；改为构建期 import
  img: mobileImg,
  autoCrop: true,
  autoCropWidth: 200,
  autoCropHeight: 200,
  fixedBox: true
})

interface PreviewData {
  url?: string
  img?: string
}

const previews = reactive<PreviewData>({})
const cropper = ref<InstanceType<typeof VueCropper> | null>(null)
void cropper

// 父组件（settings/base-settings.vue）通过 ref 调 edit/close，必须显式暴露
function edit(targetId: number) {
  visible.value = true
  id.value = targetId
  // 原代码此处留空：/* 获取原始头像 */
}

function close() {
  id.value = null
  visible.value = false
}

function cancelHandel() {
  close()
}

function okHandel() {
  confirmLoading.value = true
  setTimeout(() => {
    confirmLoading.value = false
    close()
    message.success('上传头像成功')
  }, 2000)
}

function realTime(data: unknown) {
  Object.assign(previews, data as PreviewData)
}

// 公开方法：与 base-settings.vue 的 ref 调用保持一致
defineExpose({edit, close})
</script>

<style lang="less" scoped>
.avatar-upload-preview {
  position: absolute;
  top: 50%;
  transform: translate(50%, -50%);
  width: 180px;
  height: 180px;
  border-radius: 50%;
  box-shadow: 0 0 4px #ccc;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
  }
}
</style>

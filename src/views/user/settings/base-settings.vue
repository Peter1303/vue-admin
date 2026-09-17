<template>
  <div class="account-settings-info-view">
    <a-row :gutter="16">
      <a-col :lg="16" :md="24">
        <a-form layout="vertical">
          <a-form-item label="昵称">
            <a-input id="id3" placeholder="给自己起个名字"/>
          </a-form-item>
          <a-form-item label="Bio">
            <a-textarea :rows="4" placeholder="You are not alone."/>
          </a-form-item>

          <a-form-item :required="false" label="电子邮件">
            <a-input placeholder="exp@admin.com"/>
          </a-form-item>
          <a-form-item :required="false" label="加密方式">
            <a-select default-value="aes-256-cfb">
              <a-select-option value="aes-256-cfb">aes-256-cfb</a-select-option>
              <a-select-option value="aes-128-cfb">aes-128-cfb</a-select-option>
              <a-select-option value="chacha20">chacha20</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :required="false" label="连接密码">
            <a-input placeholder="h3gSbecd"/>
          </a-form-item>
          <a-form-item :required="false" label="登陆密码">
            <a-input placeholder="密码"/>
          </a-form-item>
          <a-form-item>
            <a-button type="primary">提交</a-button>
            <a-button style="margin-left: 8px">保存</a-button>
          </a-form-item>
        </a-form>
      </a-col>
      <a-col :lg="8" :md="24" :style="{ minHeight: '180px' }">
        <!-- 原 $refs.modal.edit(1) → script setup 的模板 ref（已 auto-unwrap） -->
        <div class="ant-upload-preview" @click="modalRef?.edit(1)">
          <a-icon class="upload-icon" type="cloud-upload-o"/>
          <div class="mask">
            <a-icon type="plus"/>
          </div>
          <img :src="option.img"/>
        </div>
      </a-col>
    </a-row>

    <avatar-upload ref="modalRef"></avatar-upload>
  </div>
</template>

<script lang="ts" setup>
import {reactive, ref} from 'vue'
import AvatarUpload from './avatar-upload.vue'
import mobileImg from '@/assets/img/mobile.png'

defineOptions({name: 'UserSettingsBase'})

// 模板 ref 名（modalRef）必须与这里的变量名一致
const modalRef = ref<InstanceType<typeof AvatarUpload> | null>(null)

const preview = reactive<Record<string, unknown>>({})
void preview

const option = reactive({
  // 原为 require('../../../assets/img/mobile.png')，Vite 下浏览器没有 require
  img: mobileImg,
  info: true,
  size: 1,
  outputType: 'jpeg',
  canScale: false,
  autoCrop: true,
  // 只有自动截图开启 宽度高度才生效
  autoCropWidth: 180,
  autoCropHeight: 180,
  fixedBox: true,
  // 开启宽度和高度比例
  fixed: true,
  fixedNumber: [1, 1] as [number, number]
})
</script>

<style lang="less" scoped>
.avatar-upload-wrapper {
  height: 200px;
  width: 100%;
}

.ant-upload-preview {
  position: relative;
  margin: 0 auto;
  width: 100%;
  max-width: 180px;
  border-radius: 50%;
  box-shadow: 0 0 4px #ccc;

  .upload-icon {
    position: absolute;
    top: 0;
    right: 10px;
    font-size: 1.4rem;
    padding: 0.5rem;
    background: rgba(222, 221, 221, 0.7);
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.2);

    // 浮在头像图上的小圆钮：浅色下是浅灰半透明，深色下同一块就变成扎眼的亮斑。
    // 深色改用「半透明黑 + 白色描边」，压在任意头像上都能看清，浅色取值一字未动。
    html[data-theme='dark'] & {
      background: rgba(0, 0, 0, 0.45);
      border-color: rgba(255, 255, 255, 0.25);
    }
  }

  .mask {
    opacity: 0;
    position: absolute;
    background: rgba(0, 0, 0, 0.4);
    cursor: pointer;
    transition: opacity 0.4s;

    &:hover {
      opacity: 1;
    }

    // antdv4 的图标根节点从 <i> 变成 <span class="anticon">（内含 svg），
    // 原来的 `i` 选择器已经完全匹配不到，图标会既没尺寸也没定位
    .anticon {
      font-size: 2rem;
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -1rem;
      margin-top: -1rem;
      color: #d6d6d6;
    }
  }

  img,
  .mask {
    width: 100%;
    max-width: 180px;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
  }
}
</style>

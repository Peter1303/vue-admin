<template>
  <div class="result">
    <div>
      <a-icon
        :class="{ 'icon': true, 'success': isSuccess, 'error': !isSuccess }"
        :type="isSuccess ? 'check-circle' : 'close-circle'"
      />
    </div>
    <div v-if="title" class="title">{{ title }}</div>
    <div v-if="description" class="description">{{ description }}</div>
    <div v-if="content" class="content">
      <slot></slot>
    </div>
    <div class="action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 注意：defineProps / withDefaults 是 <script setup> 的编译宏，由编译器注入，
// 从 'vue' 显式 import 会与注入的局部声明冲突（TS2440），因此不要引入。

defineOptions({name: 'Result'})

interface Props {
  isSuccess?: boolean
  title?: string
  description?: string
  content?: boolean
}

withDefaults(defineProps<Props>(), {
  isSuccess: false,
  title: '',
  description: '',
  content: true
})
</script>

<style lang="less" scoped>
@import "@/assets/styles/var.less";

.result {
  text-align: center;
  width: 72%;
  margin: 0 auto;
  padding: 24px 0 8px;

  .icon {
    font-size: 72px;
    line-height: 72px;
    margin-bottom: 24px;
  }

  .success {
    color: #52c41a;
  }

  .error {
    color: red;
  }

  .title {
    font-size: 24px;
    color: @text-color;
    font-weight: 500;
    line-height: 32px;
    margin-bottom: 16px;
  }

  .description {
    font-size: 14px;
    line-height: 22px;
    color: @text-color-secondary;
    margin-bottom: 24px;
  }

  .content {
    // background: #fafafa;
    padding: 24px 40px;
    border-radius: 2px;
    text-align: left;
  }

  .action {
    margin-top: 32px;
  }
}

.mobile {
  .result {
    width: 100%;
    margin: 0 auto;
    padding: unset;
  }
}
</style>

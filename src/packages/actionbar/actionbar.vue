<template>
  <div>
    <lazy-render :time="500" immediately maskClass="action-box2" tip="loading">
      <div class="action-box clearfix">
        <slot/>
        <div class="fr">
          <slot name="right"/>
        </div>
      </div>
    </lazy-render>
  </div>
</template>

<script lang="ts" setup>
import {layout} from '@layouts'

defineOptions({name: 'v-actionbar'})
</script>

<style lang="less">
@import "@/assets/styles/var.less";

.action-box {
  background: fade(@component-background, 90%);
  padding: 10px;
  box-shadow: 0 4px 3px -3px rgba(10, 10, 10, 0.1);
  position: relative;
  z-index: 100;
  border-radius: 4px;
  height: 100%;
  width: 100%
}

.action-box2 {
  background: fade(@component-background, 90%);
  box-shadow: 0 4px 3px -3px rgba(10, 10, 10, 0.1);
  height: 56px;
  width: 100%;
  padding: 10px;
  border-radius: 4px;
}
</style>

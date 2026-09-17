<template>
  <div class="cell-wrapper">
    <div v-if="title" class="left"><span>{{ title }}</span></div>
    <div class="right">
        <span>
      <v-icon v-if="link" name="icon-enter"></v-icon>
      <a-switch v-else-if="onoff" v-model:checked="checked" @change="change"></a-switch>
      <span v-else>
        <slot name="right"></slot>
      </span>
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

defineOptions({name: 'v-cell'})

const props = withDefaults(
  defineProps<{
    title?: string
    defaultChecked?: boolean
    link?: boolean
    onoff?: boolean
  }>(),
  {
    title: undefined,
    defaultChecked: false,
    link: false,
    onoff: false
  }
)

const checked = ref(props.defaultChecked)

const emit = defineEmits<{ (e: 'change', val: boolean): void }>()

function change(val: boolean) {
  emit('change', val)
}
</script>

<style lang="less" scoped>
.cell-wrapper {
  display: flex;
  padding: 4px 0;
  min-height: 40px;

  .left {
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    font-size: 14px;
  }

  .right {
    flex: 1;
    text-align: right;
    display: flex;
    justify-content: center;
    flex-direction: column;
  }
}
</style>

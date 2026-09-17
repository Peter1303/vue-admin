<template>
  <a-tooltip>
    <template v-if="tip" #title>{{ tip }}</template>
    <a v-on-clickaway="away" :class="active?'active':''" class="artiely-button ghost" href="javascript:;"
       @click="handleClick">
      <slot/>
    </a>
  </a-tooltip>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

defineOptions({name: 'v-button'})

const props = withDefaults(
  defineProps<{
    type?: string
    tip?: string
  }>(),
  {
    type: 'ghost',
    tip: ''
  }
)

const active = ref(false)

function handleClick(e: MouseEvent) {
  active.value = true
  emit('click', e)
}

function away() {
  active.value = false
}

const emit = defineEmits<{ (e: 'click', v: MouseEvent): void }>()
</script>

<style lang="less">
@import "@/assets/styles/var.less";

.artiely-button {
  display: inline-block;
  cursor: pointer;
  height: 32px;
  line-height: 32px !important;
  padding: 0 10px;
  border-radius: 4px;
  text-decoration: none !important;

  .anticon {
    font-size: 22px !important;
    vertical-align: middle;
  }

  &.ghost {
    background: transparent;
    color: #959cb6;

    &:visited {
      background: fade(@primary-color, 10%);
      background: color-mix(in srgb, var(--primary-color, @primary-color) 10%, transparent);
    }

    &:hover {
      background: fade(@primary-color, 10%);
      background: color-mix(in srgb, var(--primary-color, @primary-color) 10%, transparent);
      color: var(--primary-color, @primary-color);
    }

    &.active {
      background: fade(@primary-color, 10%);
      background: color-mix(in srgb, var(--primary-color, @primary-color) 10%, transparent);
    }
  }
}
</style>

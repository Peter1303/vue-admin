<template>
  <svg
    v-if="symbol"
    aria-hidden="true"
    class="icon"
  >
    <use :xlink:href="'#' + name"/>
  </svg>
  <i
    v-else
    :class="name"
    class="iconfont"
  />
</template>
<script lang="ts" setup>
defineOptions({name: 'VIcon'})

const props = withDefaults(
  defineProps<{
    name?: string
    symbol?: boolean
  }>(),
  {
    name: '',
    symbol: false
  }
)
</script>
<style lang="less">
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>

<template>
  <a-card :bordered="false" class="artiely-card" hoverable>
    <slot/>
  </a-card>
</template>

<script lang="ts" setup>
defineOptions({name: 'v-card'})
</script>

<style>
.artiely-card {
  font-size: 24px
}
</style>

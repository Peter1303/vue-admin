<template>
  <div>
    <v-create-table :sourceData="sourceData" :tableData="tableData">

    </v-create-table>
    <v-create-form :defaultData="rowData" :sourceData="sourceData" model="modal"></v-create-form>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

defineOptions({name: 'v-create-table-form'})

const props = withDefaults(
  defineProps<{
    sourceData?: any[]
    tableData?: any[]
    defaultData?: Record<string, any>
  }>(),
  {
    sourceData: () => [],
    tableData: () => [],
    defaultData: () => ({})
  }
)

const rowData = ref<Record<string, any>>({...(props.defaultData as any)})
</script>

<style>
</style>

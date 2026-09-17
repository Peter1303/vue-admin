<template>
  <a-popover>
    <template v-if="!selectType" #title>
      <span>
      <a-button
        :type="type==1?'primary':'default'"
        size="small"
        style="margin-right:20px"
        @click="type=1"
      >复制标签</a-button>
      <a-button :type="type==2?'primary':'default'" size="small" @click="type=2">复制属性</a-button></span>
    </template>
    <template #icon></template>
    <template #cancelText></template>
    <template #okText></template>
    <template #content>
      <div class="iconbox">
        <v-button
          v-for="item in data"
          :key="item"
          v-clipboard="{value:type==1?`<v-icon name='${item}' />`:item,success,error}"
          @click="handleClick(item)"
        >
          <v-icon :name="item"></v-icon>
        </v-button>
      </div>
    </template>
    <slot>
      <a-input :value="currVal" placeholder="default size">
        <template #addonBefore>
          <v-icon :name="currVal"/>
        </template>
      </a-input>
    </slot>
  </a-popover>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue'
import {message} from 'ant-design-vue'

let icons = [
  'icon-inport',
  'icon-daochu',
  'icon-download-fill',
  'icon-weibiaoti526',
  'icon-zhtn',
  'icon-commodity',
  'icon-int',
  'icon-tools',
  'icon-supply',
  'icon-questions',
  'icon-qianniudaidise',
  'icon-budaidise',
  'icon-decoration_fill',
  'icon-shake',
  'icon-marketing_fill',
  'icon-financial_fill',
  'icon-wangwang',
  'icon-unfold',
  'icon-packup',
  'icon-transaction_fill',
  'icon-shop_fill',
  'icon-publishgoods_fill',
  'icon-qianniu',
  'icon-searchfill',
  'icon-search',
  'icon-workbench',
  'icon-workbench_fill',
  'icon-warning',
  'icon-warning_fill',
  'icon-video_fill',
  'icon-video',
  'icon-unlock',
  'icon-unlock_fill',
  'icon-undo',
  'icon-trash_fill',
  'icon-trash',
  'icon-translation',
  'icon-translation_fill',
  'icon-time',
  'icon-time_fill'
]

defineOptions({name: 'v-iconbox'})

const props = withDefaults(
  defineProps<{
    modelValue?: string
    selectType?: string
  }>(),
  {
    modelValue: 'icon-supply',
    selectType: ''
  }
)

const type = ref(1)
const data = ref(Object.freeze(icons))

const currVal = computed(() => (props.modelValue ? props.modelValue : 'icon-supply'))

const emit = defineEmits<{ (e: 'update:modelValue', val: string): void }>()

function handleClick(val: string) {
  emit('update:modelValue', val)
}

function success() {
  message.info('已复制到剪切板')
}

function error() {
  message.info('复制失败')
}
</script>

<style lang="less">
.iconbox {
  width: 400px;
}
</style>

<template>
  <div class="code-box select-none">
    <div v-for="(item,i) in Number(maxlength)" :key="item" :class="item==modelValue.length+1 && autofocus?'active':''"
         class="item">
      <span v-if="mask"><v-icon v-if="item<=modelValue.length" name="icon-dian"></v-icon></span>
      <span v-else>{{ modelValue[i] }}</span>
    </div>
    <input
      ref="inputRef"
      v-model="temValue"
      v-on-clickaway="focus"
      :autofocus="autofocus"
      :maxlength="maxlength"
      class="input"
      type="password"
      @click="focus"
      @input="input"
    />
  </div>
</template>

<script lang="ts" setup>
import {nextTick, onMounted, ref} from 'vue'

defineOptions({name: 'v-codebox'})

const props = withDefaults(
  defineProps<{
    modelValue?: string
    mask?: boolean
    maxlength?: number | string
  }>(),
  {
    modelValue: '',
    mask: false,
    maxlength: 4
  }
)

const autofocus = ref(true)
const temValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

onMounted(() => {
  nextTick(() => {
    inputRef.value && inputRef.value.focus()
  })
})

function input() {
  emit('update:modelValue', temValue.value)
}

function focus() {
  inputRef.value && inputRef.value.focus()
}
</script>

<style lang="less" scoped>
.code-box {
  display: flex;
  height: 50px;
  line-height: 50px;
  text-align: center;
  justify-content: center;
  position: relative;

  .item {
    max-width: 50px;
    flex: 1;
    font-size: 18px;
    text-align: center;
    border: 1px solid #ddd;
    margin-left: -1px;
    position: relative;

    &.active {
      &::after {
        content: '';
        position: absolute;
        top: 10px;
        display: inline-block;
        width: 1px;
        height: 30px;
        animation: blink 1s infinite steps(1, start);
      }
    }
  }

  .input {
    width: 100%;
    text-indent: -9999999px;
    opacity: 0;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}

@keyframes blink {
  0% {
    background-color: white;
  }
  50% {
    background-color: #999;
  }
  100% {
    background-color: white;
  }
}
</style>

<template>
  <div>
    <a-popover :getPopupContainer="(trigger: HTMLElement) => trigger.parentNode as HTMLElement" trigger="click">
      <template #content>
        <div class="emoji-content">
          <div v-for="(emojiGroup, category) in emojis" :key="category">
            <h5>{{ category }}</h5>
            <div>
              <span
                v-for="(emoji, emojiName) in emojiGroup"
                :key="emojiName"
                :title="emojiName"
                @click="insert(emoji)"
              >{{ emoji }}</span>
            </div>
          </div>
        </div>
      </template>
      <span>
        <slot>
          <v-icon name="icon-emoji"></v-icon>
        </slot>
      </span>
    </a-popover>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import emojiSource from './emojis'

defineOptions({name: 'v-emoji-picker'})

const emojis = ref(Object.freeze(emojiSource))

const emit = defineEmits<{ (e: 'emoji', val: string): void }>()

function insert(emoji: string) {
  emit('emoji', emoji)
}
</script>

<style lang="less" scoped>
.emoji-content {
  width: 400px;
  height: 200px;
  overflow-y: scroll;
}
</style>

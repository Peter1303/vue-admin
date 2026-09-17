<template>
  <div :style="styleWidth">
    <div :style="style" class="avatar-group">
      <a-tooltip v-for="(item,index) in list" :key="index">
        <template #title>
          {{ item.label }}
        </template>
        <a-avatar :class="index!==0?'ml':''" :size="size" :src="item.url" :style="{left:(index*50)+'%'}"
                  class="artiely-avatar "/>
      </a-tooltip>
      <a-avatar v-if="avatarList.length>maxLen" :size="size" :style="{left:(list.length*50)+'%'}"
                class="artiely-avatar ml">+{{ avatarList.length - maxLen }}
      </a-avatar>
    </div>
  </div>

</template>

<script lang="ts" setup>
import {computed} from 'vue'

defineOptions({name: 'v-avatar-group'})

const props = withDefaults(
  defineProps<{
    avatarList?: any[]
    maxlength?: number | string
    size?: number
  }>(),
  {
    avatarList: () => [],
    maxlength: undefined,
    size: 30
  }
)

const list = computed(() => {
  if (props.avatarList.length > Number(props.maxlength)) {
    return props.avatarList.slice(0, Number(props.maxlength))
  }
  return props.avatarList
})

/**
 * 归一化后的 maxlength。
 * 原模板直接写 `avatarList.length > maxlength`，而 maxlength 允许不传（undefined）：
 * undefined 时比较结果为 false（即不显示 +N 角标）。这里显式归一化，
 * 既保留原语义，又避免模板里对 `number | string | undefined` 做算术运算。
 */
const maxLen = computed(() => {
  const n = Number(props.maxlength)
  return Number.isFinite(n) ? n : props.avatarList.length
})
const style = computed(() => {
  return {
    width: props.size + 'px',
    height: props.size + 'px'

  }
})
const styleWidth = computed(() => {
  let len = props.maxlength ? props.maxlength : props.avatarList.length
  let w = (Number(len) + 2) * (props.size / 2)
  return {
    display: 'inline-block',
    width: w + 'px',
    fontSize: 0
  }
})
</script>

<style lang="less">
@import "@/assets/styles/var.less";

.avatar-group {
  display: inline-block;
  position: relative;
  width: 30px;
  height: 30px;

  .artiely-avatar {
    border: 1px solid #fff;
    background: #eee;
    user-select: none;
    cursor: pointer;
    position: absolute;
    top: 0;

    &.ml {
      // margin-left: -8%;
      position: absolute;
      top: 0;
      // left: -8%;
    }

    .ant-avatar-string {
      color: var(--primary-color, @primary-color);
      font-weight: bold;
    }
  }
}

</style>

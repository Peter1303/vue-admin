<template>
  <div class="licence-plate">
    <a-input-group compact>
      <a-popover :open="hovered" trigger="hover" @open-change="handleHoverChange">
        <template #content>
          <span
            v-for="item in keys"
            :key="item"
            :class="province==item?'active':''"
            class="licence-plate-city"
            @click="handleItem(item)"
          >{{ item }}</span>
          <div>
            <span
              v-for="item in list"
              :key="item"
              :class="city==item?'active':''"
              class="licence-plate-city"
              @click="handleCity(item)"
            >{{ item }}</span>
          </div>
        </template>
        <a-input v-model:value="preLicence" style="width: 60px"/>
      </a-popover>
      <!-- REVIEW(迁移): 原代码这里同时写了 ref="endLicence" 和 v-model="endLicence"。
           在 Options API 下二者互不干扰（一个落到 $refs，一个落到 data），但
           <script setup> 会自动把同名 ref 变量认作模板 ref —— 渲染时会把组件实例
           写进 endLicence.value，直接把车牌号冲掉。全文无任何 $refs.endLicence 读取，
           该 ref 是死引用，故移除。 -->
      <the-mask
        v-model="endLicence"
        :tokens="hexTokens"
        class="ant-input"
        mask="FFFFFF"
        style="width: 30%"
      ></the-mask>
    </a-input-group>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue'

let data: Record<string, string[]> = {
  '冀': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'R', 'T'],
  '豫': [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    'M',
    'N',
    'P',
    'Q',
    'R',
    'S',
    'U'
  ],
  '鄂': [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    'M',
    'N',
    'P',
    'Q',
    'R',
    'S'
  ],
  '桂': [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    'M',
    'N',
    'P',
    'R'
  ],
  '黑': [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    'M',
    'N',
    'P',
    'R'
  ],
  '湘': [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    'M',
    'N',
    'U',
    'S'
  ],
  '皖': [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    'M',
    'N',
    'P',
    'R',
    'S'
  ],
  '云': [
    'A',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    'M',
    'N',
    'P',
    'Q',
    'R',
    'S'
  ],
  '新': [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    'M',
    'N',
    'P',
    'Q',
    'R'
  ],
  '陕': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'V'],
  '蒙': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
  '赣': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
  '辽': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P'],
  '苏': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'U'],
  '甘': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P'],
  '晋': ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'J', 'K', 'L', 'M'],
  '浙': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L'],
  '闽': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K']
}
let keys = Object.keys(data)
let defaultProvince = '鄂'
let defaultCity = 'A'
let defaultList = data[defaultProvince]

defineOptions({name: 'v-licence-plate'})

const province = ref(defaultProvince)
const city = ref(defaultCity)
const list = ref(defaultList)
const hovered = ref(false)
const endLicence = ref('')
const clicked = ref(false)
const hexTokens = {
  F: {
    pattern: /[0-9a-zA-Z]/,
    transform: (v: string) => v.toLocaleUpperCase()
  }
}

const preLicence = computed(() => province.value + city.value)

function handleItem(item: string) {
  province.value = item
  list.value = data[item]
}

function handleHoverChange(visible: boolean) {
  clicked.value = false
  hovered.value = visible
}

function handleCity(cityVal: string) {
  hovered.value = false
  city.value = cityVal
}
</script>

<style lang="less" scoped>
@import "@/assets/styles/var.less";

.licence-plate {
  max-width: 500px;
}

.licence-plate-city {
  display: inline-block;
  padding: 10px;
  font-size: 30px;
  cursor: pointer;

  &.active {
    color: var(--primary-color, @primary-color);
  }
}
</style>

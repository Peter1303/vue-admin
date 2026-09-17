<template>
  <a-popover>
    <template #content>
      <h5>城市选择</h5>
      <!-- <a-input size="small" placeholder="搜索您的城市" v-model:value="keyword"></a-input> -->
      <ul class="vcp-tags">
        <template v-for="(item, i) in keys" :key="i">
          <li
            v-if="item == 'hot'"
            class="hot"
            :class="{ 'z-on': activeTag === item }"
            @click="choiceTag(item)"
          >热门</li>
          <li v-else :class="{ 'z-on': activeTag === item }" @click="choiceTag(item)">{{ item }}</li>
        </template>
      </ul>
      <div class="vcp-list">
        <div>
          <ul>
            <!-- 长名字（本项目数据集里有 30 个「XX自治州」，7~11 字）保持单行省略号，
                 列宽固定 110px —— 最多可见约 6 个字，够用户辨认，且 4 列栅格永远对齐。
                 这是有意的产品决定，不要改成「按内容撑开宽度」。 -->
            <li
              v-for="citys in defaultView"
              :key="citys.name"
              class="city-item textover1"
              :class="{ 'z-on': result.name === citys.name }"
              @click="handleItem(citys)"
            >{{ citys.name }}
            </li>
          </ul>
        </div>
      </div>
    </template>
    <a-input :placeholder="placeholder" :value="result.name"></a-input>
  </a-popover>
</template>
<script lang="ts" setup>
import {ref} from 'vue'
import cityList from 'china-city-data'

const keysInit = Object.keys(cityList)
keysInit.splice(-1)
keysInit.unshift('hot')
const defaultViewInit = cityList['hot']

defineOptions({name: 'v-city-picker'})

const props = withDefaults(
  defineProps<{
    placeholder?: string
    cityList?: object
  }>(),
  {
    placeholder: '',
    cityList: () => Object.freeze(cityList)
  }
)

const keys = ref(keysInit)
const defaultView = ref(defaultViewInit)
const keyword = ref('')
const result = ref<Record<string, any>>({})
// 当前激活的分组标签（'hot' / 'A' / 'B' ...）。原模板只有一条从未被应用的
// `.z-on` 样式，点了标签看不出在哪个分组 —— 补上这个状态。
const activeTag = ref('hot')

const emit = defineEmits<{ (e: 'ok', item: any): void }>()

function handleItem(item: any) {
  result.value = item
  emit('ok', item)
}

// 选择标签
function choiceTag(key: string) {
  activeTag.value = key
  // `?? []` 是防御：万一 key 在数据里缺失，原写法会把 defaultView 置为 undefined，
  // 模板 v-for 遍历 undefined 会直接抛错整块内容区空白
  defaultView.value = cityList[key] ?? []
}
</script>

<style lang="less" scoped>
@import "@/assets/styles/var.less";

// ------------------------------------------------------------
// 城市选择面板：对齐 antd 设计语言
// ------------------------------------------------------------
// 参照系是 antd light Menu 的 item（antdv4 CSS-in-JS 注入值，实测）：
//   默认   bg transparent          color rgba(0, 0, 0, 0.88)
//   hover  bg rgba(0, 0, 0, 0.06)  color 不变  ← antd 菜单 hover 只换底色，不改文字色
//   选中   bg rgb(230, 247, 255)   color rgb(24, 144, 255)
// 即「选中 = 主色 10% 淡底 + 主色文字」。淡底沿用项目既有写法（见 Button.vue /
// layout1.vue）：两行 —— fade() 构建期兜底，color-mix() 运行时跟随 --primary-color。
//
// 面板宽度：@vcp-panel-width 同时管住标签行与城市栅格。
// 这个上限是「承重」的 —— 两个列表都是 wrap 布局，不加 max-width 时它们的
// max-content（一行铺开）会把 popover 撑到几千像素宽。
// ------------------------------------------------------------

@vcp-panel-width: 500px;
@vcp-radius: 6px;
// 原为写死的 rgba(0, 0, 0, 0.06)：深色底上「再叠一层黑」等于没有 hover 反馈，
// 改走主题令牌（--hover-fill，浅色与原来完全等价，深色换成白光叠加）
@vcp-hover-bg: var(--hover-fill, rgba(0, 0, 0, 0.06));

// 原模板用的是裸 <h5>，被 UA 的 0.83em 压到 11.62px，比面板正文还小。
// 对齐 antd v5 colorTextHeading。
h5 {
  margin: 0 0 8px;
  color: var(--heading-color, rgba(0, 0, 0, 0.88));
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
}

.vcp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: @vcp-panel-width;
  margin: 0 0 8px;
  // 旧样式靠 `display: block` 压掉 li 的项目符号，改成 flex 后要显式去掉
  list-style: none;
  padding: 0;

  li {
    box-sizing: border-box;
    min-width: 26px;
    height: 26px;
    line-height: 26px;
    padding: 0 6px;
    border-radius: @vcp-radius;
    // 原为 @component-background(#fff)，在白色 popover 上完全看不出边界
    // 写死的 4% 黑在深色 popover 上同样看不见，改走令牌（浅色 #f5f5f5 ≙ 4% 黑）
    background-color: var(--background-color-base, rgba(0, 0, 0, 0.04));
    text-align: center;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;

    &.hot {
      min-width: 53px;
    }

    &:hover {
      background-color: @vcp-hover-bg;
    }

    &.z-on {
      background-color: color-mix(in srgb, var(--primary-color, @primary-color) 10%, transparent);
      color: var(--primary-color, @primary-color);
      font-weight: 600;
    }
  }
}

.vcp-list {
  max-width: @vcp-panel-width;

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
}

.city-item {
  // box-sizing 必须显式声明：110px 要含左右内边距，否则 4 列栅格会被撑成 3 列
  box-sizing: border-box;
  flex: none;
  // 定宽 + textover1 省略号：长名字（7~11 字的「XX自治州」，数据集里 30 个）
  // 会被截成约 6 字 + 省略号。这是**有意保留**的：4 列栅格永远对齐，
  // 用户靠前 6 字足以认出城市。不要改成 min-width / 按内容撑开——
  // 那会让长名字把 110px 的列撑到 114~170px，同一行出现不等宽格子。
  width: 110px !important;
  height: 28px;
  line-height: 28px;
  padding: 0 8px;
  border-radius: @vcp-radius;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: @vcp-hover-bg;
  }

  &.z-on {
    background-color: color-mix(in srgb, var(--primary-color, @primary-color) 10%, transparent);
    color: var(--primary-color, @primary-color);
  }
}
</style>

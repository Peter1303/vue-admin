<template>
  <div v-on-clickaway="blur" class="filterbox">
    <a-input
      ref="inputRef"
      v-model:value="keywords"
      :placeholder="placeholder"
      class="filter-input"
      size="large"
      @focus="focus"
    >
      <template #prefix>
        <a-icon class="filter-search" type="search"/>
      </template>
      <template #suffix>
        <a-icon type="close-circle" @click="emitEmpty"/>
      </template>
    </a-input>
    <div v-show="show" :key="1" class="filterbox-group">
      <div v-for="(filterItem,index) in data" :key="index" class="filterbox-item">
        <!-- 自定义时间 -->
        <template v-if="filterItem.type=='date-range-picker'">
          <v-date-range-picker @change="dateChange">
            <a-badge :dot="!!data[index].defaultValue.filter((v: unknown) => v).length">{{ filterItem.label }}
            </a-badge>
            <v-icon class="fr" name="icon-xiala"></v-icon>
          </v-date-range-picker>
        </template>
        <a-popover v-else :getPopupContainer="(e: HTMLElement) => e.parentNode as HTMLElement" placement="bottomLeft">
          <template #content>
            <!-- 多选 -->
            <a-checkbox-group v-if="filterItem.type=='checkbox'" v-model:value="data[index].defaultValue">
              <a-row v-for="(item,i) in filterItem.options" :key="i">
                <a-col>
                  <a-checkbox :value="item.value">{{ item.label }}</a-checkbox>
                </a-col>
              </a-row>
            </a-checkbox-group>
            <!-- 单选 -->
            <a-radio-group v-else-if="filterItem.type=='radio'" v-model:value="data[index].defaultValue">
              <a-row v-for="(item,i) in filterItem.options" :key="i">
                <a-col>
                  <a-radio :value="item.value">{{ item.label }}</a-radio>
                </a-col>
              </a-row>
            </a-radio-group>
          </template>
          <div>
            <a-badge :dot="filterItem.type=='radio' && data[index].defaultValue">
              {{ filterItem.label }}
              <a-badge
                v-if="filterItem.type=='checkbox'"
                :count="data[index].defaultValue.length"
                class="checkbox-badge"
              />
            </a-badge>
            <v-icon class="fr" name="icon-xiala"></v-icon>
          </div>
        </a-popover>
      </div>
    </div>
    <!-- tags -->
    <div v-if="hasTag" class="filter-tags">
      <span v-for="(item,j) in data" :key="j">
        <span v-if="item.type=='date-range-picker'">
          <span>
            <a-tag
              v-if="item.defaultValue.length"
              closable
              @close="closeTime(j)"
            >
            {{ item.defaultValue.join(' ~ ') }}
            </a-tag>
          </span>
        </span>
        <span v-else>
          <template v-for="(sub,i) in item.options">
            <template v-if="item.type=='checkbox'">
              <a-tag
                v-if="item.defaultValue.indexOf(sub.value)!=-1"
                :key="i"
                closable
                @close="closeCheck(j,sub.value)"
              >{{ sub.label }}</a-tag>
            </template>
            <template v-else-if="item.type=='radio'">
              <a-tag
                v-if="item.defaultValue==sub.value"
                :key="i"
                closable
                @close="closeRadio(j,sub.value)"
              >{{ sub.label }}</a-tag>
            </template>
          </template>
        </span>
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, nextTick, ref, watch} from 'vue'

defineOptions({name: 'v-filter'})

const props = withDefaults(
  defineProps<{
    data?: any[]
    dataIndex?: string
    placeholder?: string
    modelValue?: Record<string, unknown>
  }>(),
  {
    data: () => [],
    dataIndex: 'keywords',
    placeholder: '搜索',
    modelValue: () => ({})
  }
)

const show = ref(false)
const keywords = ref('')
const timer = ref<number | null>(null)
const inputRef = ref<HTMLElement | null>(null)

const emit = defineEmits<{ (e: 'update:modelValue', val: Record<string, unknown>): void }>()

const hasTag = computed(() => {
  const values = Object.values(props.modelValue as Record<string, unknown>)
  const len = values.filter(v => v && (v as any).toString().length)
  return !!len.length
})

watch(keywords, () => {
  clearTimeout(timer.value as unknown as number)
  timer.value = setTimeout(() => {
    finalFilter()
  }, 400) as unknown as number
})

watch(
  () => props.data,
  () => {
    finalFilter()
  },
  {deep: true, immediate: true}
)

function dateChange(dateString: any) {
  const index = props.data.findIndex((el: any) => el.type === 'date-range-picker')
  props.data[index].defaultValue.splice(0, 2, ...dateString)
  props.data[index].defaultValue = dateString
}

function closeTime(j: number) {
  props.data[j].defaultValue.splice(0)
}

function finalFilter() {
  const obj: Record<string, unknown> = {}
  props.data.map((v: any) => {
    obj[v.dataIndex] = v.defaultValue
  })
  obj[props.dataIndex] = keywords.value
  emit('update:modelValue', obj)
}

function emitEmpty(e: any) {
  nextTick(() => {
    const el = inputRef.value as any
    el && el.focus && el.focus()
  })
  keywords.value = ''
}

function focus() {
  show.value = true
}

function blur() {
  show.value = false
}

// REVIEW(迁移): 下面两个函数原本在模板里被 `closeCheck(eq, sub.value)` / `closeRadio(eq, sub.value)`
// 调用，但组件里从来没有定义过 `eq`（原始 Vue 2 版本同样如此）。
// 运行时 `props.data[undefined]` 是 undefined，点 tag 上的 × 会直接抛
// "Cannot read properties of undefined"，属于必然崩溃的路径，故按原意图修正为
// 外层 `v-for="(item, j) in data"` 的索引 `j`。
function closeCheck(eq: any, val: any) {
  const index = props.data[eq].defaultValue.indexOf(val)
  props.data[eq].defaultValue.splice(index, 1)
}

function closeRadio(eq: any, val: any) {
  props.data[eq].defaultValue = null
}
</script>

<style lang="less">
@import "@/assets/styles/var.less";

.filterbox {
  background: var(--input-bg, @input-bg);
  border-radius: 4px;
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.1);
  // REVIEW(迁移): 字号必须显式写回 14px。
  // 原 Vue2 + antdv1 下这里继承到的是 14px —— 外层卡片虽然写了 `.artiely-card{font-size:24px}`，
  // 但它排在 antd 的 `.ant-card{font-size:.875rem}` **前面**，同权重取后者（已在迁移前的
  // dist 产物里核对：`.artiely-card` 在 app.css 偏移 8938，`.ant-card` 在 1558754）。
  // antdv4 的规则都包在 `:where(.css-xxx)` 里（权重为 0），压不住那个 24px，
  // 于是整个面板继承到 24px：标签行的 line-height 从 22px 变 37.7px，
  // 行高从 44px 被撑到 59px，标签在行里显得"飘"。
  font-size: 14px;
  // overflow: hidden;
  .filter-tags {
    padding: 10px 20px;
    border-top: 1px solid #d5d5d5;

    // 深色模式下 #d5d5d5 是一条扎眼的亮线；浅色沿用原值，不引入任何观感变化
    html[data-theme='dark'] & {
      border-top-color: var(--border-color-split, #d5d5d5);
    }
  }

  .filter-search {
    font-size: 16px;
  }

  // REVIEW(迁移): 搜索框的边框在 antdv4 里"搬了家"。
  // antd1 的 `.ant-input-affix-wrapper` 本身无边框/圆角/背景（边框在内部的 `.ant-input` 上），
  // 所以原代码只写一条 `.filter-input .ant-input { border: 0 }` 就能做出无边框搜索条；
  // antdv4 改成「wrapper 带边框 + 内部 input 去边框」，那条规则因此落空，
  // 面板里会多出一个 1px 灰边 + 8px 圆角的浮框（与面板自身 4px 圆角套在一起，非常突兀）。
  // 补 8px 纵向内边距是为了补回去掉 1px 边框后少掉的 2px，保持整体仍是 40px
  // （= antd1 `.ant-input-lg` 的 height 2.5rem），否则会矮 2px、下方标签行跟着上移。
  // 聚焦态不处理：antdv4 的聚焦光晕在 `-focused` 类上，原版同样是"无边框 + 主色光晕"。
  .filter-input {
    border: 0;
    padding: 8px 11px;
  }

  .filter-input .ant-input {
    border: 0;
    outline: none;
    box-shadow: none;
  }

  .filterbox-group {
    border-top: 1px solid #d5d5d5;

    // 同上：深色下换成令牌里的分隔线色
    html[data-theme='dark'] & {
      border-top-color: var(--border-color-split, #d5d5d5);
    }

    display: flex;
    // background: @background-color-base;
    .filterbox-item {
      font-size: 14px;
      padding: 10px;
      min-width: 100px;
      border-right: 1px solid #eee;

      // 同上：深色下换成令牌里的分隔线色
      html[data-theme='dark'] & {
        border-right-color: var(--border-color-split, #eee);
      }

      .checkbox-badge {
        transform: scale(0.8);
        vertical-align: text-top;
      }
    }
  }
}
</style>

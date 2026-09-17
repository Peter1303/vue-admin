<template>
  <a-list item-layout="horizontal">
    <a-list-item>
      <a-list-item-meta>
        <template #title>
          <a>风格配色</a>
        </template>
        <template #description>
          <span>整体风格配色设置</span>
        </template>
      </a-list-item-meta>
      <template #actions>
        <div>
          <a-switch
            :checked="isDarkTheme"
            checked-children="暗色"
            un-checked-children="白色"
            @change="onChange"
          />
        </div>
      </template>
    </a-list-item>
    <a-list-item>
      <a-list-item-meta>
        <template #title>
          <a>主题色</a>
        </template>
        <template #description>
          <span>页面风格配色： {{ colorFilter(layout.primaryColor) }}</span>
        </template>
      </a-list-item-meta>
    </a-list-item>
  </a-list>
</template>

<script lang="ts" setup>
import {computed} from 'vue'
import {layout} from '@layouts'

defineOptions({name: 'UserSettingsCustom'})

const colorList = [
  {key: '薄暮', color: '#F5222D'},
  {key: '火山', color: '#FA541C'},
  {key: '日暮', color: '#FAAD14'},
  {key: '明青', color: '#13C2C2'},
  {key: '极光绿', color: '#52C41A'},
  {key: '拂晓蓝（默认）', color: '#1890FF'},
  {key: '极客蓝', color: '#2F54EB'},
  {key: '酱紫', color: '#722ED1'}
]

function colorFilter(color: string): string | undefined {
  const c = colorList.find((o) => o.color === color)
  return c && c.key
}

// ------------------------------------------------------------
// REVIEW(迁移): 原代码是 JSX render 函数，读的是 `this.navTheme` 与 `this.primaryColor`。
// 这两个字段在组件里、在 Vuex / Pinia store 里都**不存在**，Vuex 的 sys 模块只有 `menu`。
// 也就是说原来「风格配色」开关恒为未选中（undefined === 'dark' → false），
// 「主题色」那行恒为 undefined。
//
// 这里做的是「把只读展示接到真实状态」——`layout.menuTheme` 就是布局里
// 实际生效的菜单主题（'dark' | 'light'），`layout.primaryColor` 是当前主题色，
// 属于修掉一个渲染用的失效引用，**不改变任何业务行为**。
//
// ⚠️ `onChange` 保持原样（空实现），也就是说这个开关仍然只是个展示。
// 如果你希望它真的能切换暗色模式，把 onChange 改成：
//     function onChange(checked: boolean) {
//       layout.menuTheme = checked ? 'dark' : 'light'
//     }
// （layout 是 reactive 的，App.vue 里对它做了 deep watch 并持久化到 localStorage）
// ------------------------------------------------------------
const isDarkTheme = computed(() => layout.menuTheme === 'dark')

function onChange(_checked: boolean) {
  // 原实现为空函数，故此处保持不写入状态，避免擅自改变行为
}
</script>

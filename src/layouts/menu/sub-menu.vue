<template>
  <a-sub-menu :key="menuInfo.path">
    <template #title>
      <a-iconfont :type="menuInfo.meta?.icon"/>
      <span>{{ menuInfo.meta?.title }}</span>
    </template>
    <!--
      ⚠️ 为什么两个分支各套一层 <template>、而 `:key` 写在里面那个组件上：
      是两条硬约束打架的结果，别把 <template> 拆掉。

      1) Vue 3 破坏性变更（迁移指南「key Attribute」）：
         同一个 v-if / v-else 链里，手动写出的 key **必须互不相同**，
         否则编译器直接报 vue(29) `v-if/else branches must use unique keys.`
         （Vue 2 的旧写法恰恰是两个分支写同一个 key —— 迁移后不再允许。）

      2) 但 antd 的菜单项标识就是从 **vnode.key** 取的，且必须原样等于 item.path：
         · MenuItem.js:51  `const key = instance.vnode.key`
                             → `selected = selectedKeys.includes(key)`（选中态）
         · SubMenu.js:55  同理；SubMenu.js:206 的 `data-menu-id` 也是它（展开态）
         所以这个 key 既不能删掉，也不能改成 "xxx-item" / "xxx-sub" 之类去凑唯一。

      结论：key 只能留在组件上 ⇒ **分支自身不能带 key**。把分支根节点换成
      <template>（只做分组、不渲染真实节点）即可让「分支 key 重复」消失，
      而组件的 vnode.key 完全不受影响。
      （试过按迁移指南把 key 提到 <template v-for> 上：那样 a-menu-item 的
       vnode.key 会变成 undefined，选中态与展开态会整片失效，所以不行。）
    -->
    <template v-for="item in menuInfo.children">
      <template v-if="!item.meta?.hide">
        <template v-if="!item.children">
          <a-menu-item :key="item.path">
            <a-iconfont :type="item.meta?.icon"/>
            <!-- ⚠️ 这里不要写成 `v-if="!isCollapse"`：
                 折叠态下 antd 会把这些子项渲染进右侧弹出层（inline 里的那份是
                 display:none），弹出层需要标题文字；加了条件后弹出层只剩一排图标
                 （实测 text="" 宽 152px 的空壳）。
                 「折叠时字看不见」应该由 CSS 负责（antd 的 opacity:0 + cover.less
                 把宽度归零），而不是在模板里删节点。
                 注：原 Vue2 版此处也是恒真（functional 组件里 isCollapse 未定义），
                 迁移时误绑成了真正的条件。 -->
            <span>{{ item.meta?.title }}</span>
          </a-menu-item>
        </template>
        <template v-else>
          <sub-menu :key="item.path" :menu-info="item" />
        </template>
      </template>
    </template>
  </a-sub-menu>
</template>
<script lang="ts" setup>
import SubMenu from './sub-menu.vue'

defineOptions({name: 'SubMenu'})

interface MenuInfo {
  path: string
  meta?: { icon?: string; title?: string; hide?: boolean }
  children?: MenuInfo[]
}

interface Props {
  menuInfo: MenuInfo
}

// 折叠与否不再影响子节点渲染（见上方注释），因此不再接收 isCollapse。
// antd 折叠时会把子项挂到弹出层里，模板里提前删节点会让弹出层变成空壳。
defineProps<Props>()
</script>

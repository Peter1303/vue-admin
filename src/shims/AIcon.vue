<script lang="ts" setup>
/**
 * <a-icon> 兼容适配器
 * ------------------------------------------------------------
 * antdv 1 的 `<a-icon type="xxx" />` 用的是图标字体，antdv 4 改成 SVG 图标组件，
 * 且 `a-icon` 已被废弃。全站有几十处 `type="..."`，逐处改写风险大，
 * 因此这里提供一个同名适配组件，在 main.ts 里于 `app.use(Antd)` 之后注册以覆盖内置版本。
 *
 * 映射规则：
 *   1. `type` 以 `icon-` 开头 → 当作 iconfont 类名（配合 index.html 引入的 alicdn 字体）
 *   2. 其余 `xxx-yy` → `XxxYyOutlined`，并先剥掉末尾的 `-o`（v1 的线框风格后缀）
 *   3. 命中不了再退回别名表与原名 Pascal 形式
 */
import {computed} from 'vue'
import * as AntdIcons from '@ant-design/icons-vue'

defineOptions({
  name: 'AIcon',
  // 模板是 v-if / v-else 多分支，Vue 会当成多根节点而丢弃 attrs 透传，
  // 因此显式关掉继承并手动 v-bind="$attrs"（否则 @click 这类监听会静默失效）
  inheritAttrs: false
})

const props = withDefaults(
  defineProps<{
    type?: string
    spin?: boolean
    rotate?: number
    twoToneColor?: string
  }>(),
  {
    type: '',
    spin: false,
    rotate: undefined,
    twoToneColor: undefined
  }
)

/** v1 与 v4 名字不一致的少数几个 */
const ALIAS: Record<string, string> = {
  vertical: 'VerticalAlignMiddleOutlined',
  'align-left': 'AlignLeftOutlined',
  'align-center': 'AlignCenterOutlined',
  'align-right': 'AlignRightOutlined',
  more: 'MoreOutlined',
  ellipsis: 'EllipsisOutlined',
  'double-left': 'DoubleLeftOutlined',
  'double-right': 'DoubleRightOutlined',
  'dashboard': 'DashboardOutlined',
  'setting': 'SettingOutlined'
}

const toPascal = (s: string): string =>
  s
    .split(/[-_]/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
    .join('')

const isIconFont = computed(() => props.type.startsWith('icon-') || props.type.startsWith('icon_'))

const iconComp = computed(() => {
  const t = props.type
  if (!t || isIconFont.value) return undefined

  const candidates = [
    ALIAS[t],
    `${toPascal(t.replace(/-o$/, ''))}Outlined`,
    toPascal(t),
    `${toPascal(t)}Outlined`,
    `${toPascal(t.replace(/-o$/, ''))}Filled`,
    `${toPascal(t.replace(/-o$/, ''))}TwoTone`
  ].filter(Boolean) as string[]

  for (const name of candidates) {
    const comp = (AntdIcons as Record<string, unknown>)[name]
    if (comp) return comp
  }

  // 未命中不能静默 —— 否则图标直接消失且没有任何提示
  console.warn(
    `[a-icon] 未匹配到图标 type="${t}"，请把正确的图标名补进 src/shims/AIcon.vue 的 ALIAS 表`
  )
  return undefined
})
</script>

<template>
  <!-- iconfont 走类名模式：index.html 引入的 alicdn CSS 里，字体族由 .iconfont 提供、字形由 .icon-xxx:before 提供，两者缺一不可 -->
  <i v-if="isIconFont" :class="type" class="iconfont" v-bind="$attrs"/>
  <component
    :is="iconComp"
    v-else-if="iconComp"
    :rotate="rotate"
    :spin="spin"
    :two-tone-color="twoToneColor"
    v-bind="$attrs"
  />
  <!-- 兜底：保留占位元素，避免布局塌陷 -->
  <i v-else class="anticon" v-bind="$attrs"/>
</template>

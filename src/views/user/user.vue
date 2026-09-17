<template>
  <div>
    <a-card :bordered="false">
      <a-tabs :tab-position="tabPosition" default-active-key="1">
        <a-tab-pane key="1" tab="基本设置">
          <base-setting></base-setting>
        </a-tab-pane>
        <a-tab-pane key="2" tab="安全设置">
          <security/>
        </a-tab-pane>
        <a-tab-pane key="3" tab="个性化">
          <custom/>
        </a-tab-pane>
        <a-tab-pane key="4" tab="账户绑定">账户绑定</a-tab-pane>
        <a-tab-pane key="5" tab="新消息通知">新消息通知</a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import {computed, reactive, ref, watch} from 'vue'
import {useSysStore} from '@store/modules/sys'
import BaseSetting from './settings/base-settings.vue'
import Custom from './settings/custom.vue'
import Security from './settings/security.vue'

defineOptions({name: 'UserSettings'})

const sys = useSysStore()

const tabPosition = ref<'left' | 'top' | 'right' | 'bottom'>('left')

// ------------------------------------------------------------
// REVIEW(迁移): 原代码读的是 `this.$store.state.sys.isMobile`，
// 但 Vuex 的 sys 模块（见 git 历史 src/store/modules/sys.js）里**只有 `menu`**，
// 迁移后的 Pinia store 同样只有 `menu`。也就是说这个 isMobile 分支在过去一直是失效的：
// computed 恒为 undefined → tabPosition 恒为 'left'，移动端也不会切成 'top'。
//
// 这里按「保留原语义」处理，没有擅自改成 layout.isMobile（那会让它突然真正生效，属于行为变更）。
// 若希望它按预期工作，把下面一行换成 `computed(() => layout.isMobile)` 即可
// （`layout` 从 '@layouts' 导入，项目已导出）。
// ------------------------------------------------------------
const isMobile = computed<boolean | undefined>(
  () => (sys as unknown as { isMobile?: boolean }).isMobile
)

watch(isMobile, (val) => {
  tabPosition.value = val ? 'top' : 'left'
})

// ------------------------------------------------------------
// 原 data() 里的 cropper 相关配置（preview / option）。
// 这两个字段在当前模板与脚本里都没有被引用 —— 原代码即如此，
// 保留以维持原状，同时避免误以为是迁移漏搬。
// ------------------------------------------------------------
const preview = reactive<Record<string, unknown>>({})
const option = reactive({
  img: '/avatar2.jpg',
  info: true,
  size: 1,
  outputType: 'jpeg',
  canScale: false,
  autoCrop: true,
  // 只有自动截图开启 宽度高度才生效
  autoCropWidth: 180,
  autoCropHeight: 180,
  fixedBox: true,
  // 开启宽度和高度比例
  fixed: true,
  fixedNumber: [1, 1] as [number, number]
})
void preview
void option
</script>

<template>
  <div>
    <a-modal
      v-if="model=='modal'"
      v-model:open="open"
      :confirmLoading="confirmLoading"
      :width="layout.isMobile?'90%':'70%'"
      title="Title"
      @cancel="handleCancel"
      @ok="handleOk"
    >
      <v-create-form-view ref="formViewRef" :defaultData="defaultData" :sourceData="sourceData">
      </v-create-form-view>
    </a-modal>
    <a-drawer
      v-else-if="model=='drawer'"
      v-model:open="open"
      :closable="true"
      :width="layout.isMobile?'90%':'70%'"
      placement="right"
      root-class-name="create-form-drawer"
      title="Basic Drawer"
      @close="onClose"
    >
      <v-create-form-view ref="formViewRef" :defaultData="defaultData" :sourceData="sourceData"></v-create-form-view>
      <!--
        底部操作条走 antd 原生的 #footer 插槽（渲染成 .ant-drawer-footer），
        不再自己塞一个绝对定位的 div 到 body 里面。原因见下方 <style> 注释。
      -->
      <template #footer>
        <div class="create-form-footer">
          <a-button type="primary" @click="handleOk">ok</a-button>
        </div>
      </template>
    </a-drawer>
    <v-create-form-view v-else ref="formViewRef" :defaultData="defaultData"
                        :sourceData="sourceData"></v-create-form-view>
  </div>

</template>

<script lang="ts" setup>
import {ref, watch} from 'vue'
import {layout} from '@layouts'

defineOptions({name: 'v-create-form'})

const props = withDefaults(
  defineProps<{
    sourceData?: any[]
    /**
     * 弹层可见性。
     * ⚠️ 迁移前是 Vue 2 的 `value` + `@input` 组合（老式 v-model 约定），
     * 而 Vue 3 的 `v-model` 绑定的是 `modelValue` / `update:modelValue`。
     * 若沿用旧名，`<v-create-form v-model="visible">`（views/crud/crud.vue 就是这么写的）
     * 会**静默失效**：弹层永远打不开，编译和运行都不报错。
     * 因此这里统一改成 Vue 3 标准契约。
     */
    modelValue?: boolean
    model?: string
    confirmLoading?: boolean
    defaultData?: Record<string, any>
    labelCol?: number | string
    wrapperCol?: number | string
    size?: string
  }>(),
  {
    sourceData: () => [],
    modelValue: false,
    model: 'modal',
    confirmLoading: false,
    defaultData: () => ({}),
    labelCol: 5,
    wrapperCol: 18,
    size: 'large'
  }
)

const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const formViewRef = ref<any>(null)

// 原弹层用 visible 控制，antdv4 用 v-model:open，并回写父级 v-model
const open = ref(Boolean(props.modelValue))
watch(
  () => props.modelValue,
  (v) => {
    open.value = Boolean(v)
  }
)
watch(open, (v) => {
  if (!v) emit('update:modelValue', false)
})

function onClose() {
  emit('update:modelValue', false)
}

function handleOk(e: Event) {
  formViewRef.value?.handleSubmit(e)
}

function handleCancel() {
  emit('update:modelValue', false)
}
</script>

<style lang="less">
/*
 * 抽屉底部操作条
 * ============================================================
 * ⚠️ 这里**不要**再退回 `position: absolute; bottom: 0; width: 100%; right: 10px` 那套写法。
 *
 * 旧实现把 footer 作为 `<div>` 直接丢进默认插槽（即 `.ant-drawer-body` 内部），
 * 而 `.ant-drawer-body` 是 `position: static` ⇒ 绝对定位的包含块落到
 * `.ant-drawer-content-wrapper` 上，于是它跟 body 的内容与高度彻底脱钩：
 *
 *   1) `width: 100%` 与 `right: 10px` 同时存在 ⇒ 整条左移 10px：
 *      实测左侧溢出抽屉 10px、右侧留 10px 缺口（四条视口全部一致）。
 *      用户在抽屉底部看到的就是一条"左边多出一截、右边差一截"的白条。
 *   2) footer 覆盖在 body 的滚动区之上（body 高度 = 满高，并没有为 footer 让位）⇒
 *      内容滚动到底时最后一项仍被白色横条压住。实测 1280x560 与 390x844 均被遮 5px，
 *      这 5px 是**永远滚不出来**的。
 *   3) 旧版 antdv1 之所以看不出问题，是因为当时这句
 *      `.create-form-drawer .ant-drawer-content-wrapper { overflow: hidden }` 还生效，
 *      把左边溢出的 10px 裁掉了；迁移到 antdv4 后 `wrapClassName` 被移除（改名 rootClassName），
 *      类名根本没落到 DOM 上（实测 4 条视口 `document.querySelectorAll('.create-form-drawer').length` 全为 0），
 *      挂在它下面的 body 高度、wrapper overflow 两条规则一起静默失效，溢出才裸露出来。
 *      ⇒ 现在改用 `root-class-name`，但那两条 hack 规则也一并删掉了，见下。
 *
 * 正解：antd 4 的 drawer 自带 `#footer` 插槽，渲染出的 `.ant-drawer-footer` 与
 * `.ant-drawer-body` 同属 `.ant-drawer-wrapper-body` —— 一个 `display:flex; flex-direction:column; height:100%`
 * 的列容器，其中 header `flex:0`、body `flex:1; min-height:0; overflow:auto`、footer `flex-shrink:0`
 * （均在 `node_modules/ant-design-vue/es/drawer/style/index.js` 中现核）。
 * 高度由 flex 自动分配 ⇒ 不需要 `calc(100vh - 100px)`，也不会互相覆盖。
 */
.create-form-footer {
  display: flex;
  justify-content: flex-end;
}
</style>

<template>
  <div class="artiely-more-group">
    <a-card :bodyStyle="{padding:0}" :bordered="false" class="artiely-more-group-btn">
      <a-tooltip placement="left">
        <template #title>主题配置</template>
        <div class="item" @click="toggle">
          <v-icon name="icon-yixiangkan"></v-icon>
        </div>
      </a-tooltip>
      <a-tooltip placement="left">
        <template #title>文档说明</template>
        <div class="item">
          <v-icon name="icon-shoucang"></v-icon>
        </div>
      </a-tooltip>
      <a-tooltip placement="left">
        <template #title>联系我们</template>
        <div class="item" @click="handleChart">
          <v-icon name="icon-tishi"></v-icon>
        </div>
      </a-tooltip>
    </a-card>

    <a-drawer v-model:open="visible" :width="300" placement="right" title="布局设置" @close="onClose">
      <div>
        <h1>主题配置</h1>
        <div>
          <span
            v-for="item in colorList"
            :key="item.key"
            :style="{background:item.color}"
            :title="item.key"
            class="theme-item"
            @click="handleItem(item)"
          >
            <v-icon v-if="currTheme.color===item.color" name="icon-right"/>
          </span>
        </div>
        <a-radio-group v-model:value="layout.menuTheme">
          <a-radio value="dark">黑色菜单</a-radio>
          <a-radio value="light">白色菜单</a-radio>
        </a-radio-group>
        <a-divider></a-divider>
        <h1>布局配置</h1>
        <a-radio-group v-model:value="layout.layoutShap">
          <a-radio value="layout1">布局1</a-radio>
          <a-radio value="layout2">布局2</a-radio>
        </a-radio-group>
        <div style="height:10px"></div>
        <a-radio-group v-model:value="layout.layoutMode">
          <a-radio value="flow">流式布局</a-radio>
          <a-radio value="fixed">固定布局</a-radio>
        </a-radio-group>
        <a-divider></a-divider>
        <h1>其他配置</h1>
        <v-cell defaultChecked onoff title="标签页模式" @change="navTabsChange"></v-cell>
        <v-cell onoff title="色弱模式" @change="colorWeakChange"></v-cell>
        <v-cell title="字体大小">
          <template #right>
            <a-slider :max="20" :min="14" :value="layout.fontSize" @change="handleChange"/>
          </template>
        </v-cell>
      </div>
    </a-drawer>
    <v-chat v-model="chartShow"></v-chat>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import {layout, setFontSize, setPrimaryColor} from '../observable/layout'

interface ColorItem {
  key: string
  color: string
}

const colorList: ColorItem[] = [
  {
    key: '薄暮',
    color: '#F5222D'
  },
  {
    key: '火山',
    color: '#FA541C'
  },
  {
    key: '日暮',
    color: '#FAAD14'
  },
  {
    key: '明青',
    color: '#13C2C2'
  },
  {
    key: '极光绿',
    color: '#52C41A'
  },
  {
    key: '拂晓蓝（默认）',
    color: '#1890FF'
  },
  {
    key: '极客蓝',
    color: '#2F54EB'
  },
  {
    key: '酱紫',
    color: '#722ED1'
  }
]

const visible = ref(false)
const chartShow = ref(false)
const currTheme = ref<ColorItem>({
  key: '拂晓蓝（默认）',
  color: '#1890FF'
})

// 原实现直接把 setFontSize 作为 @change 回调，这里原样复用（a-slider 会传最新值）
const handleChange = setFontSize

function toggle() {
  visible.value = !visible.value
}

function onClose() {
  visible.value = false
}

function navTabsChange(val: boolean) {
  layout.isNavTabs = val
}

function handleChart() {
  chartShow.value = true
}

function handleItem(item: ColorItem) {
  currTheme.value = item
  // 换肤：原来在浏览器里重编译 less 的方式在 antdv 4 已失效，改走 setPrimaryColor
  setPrimaryColor(item.color)
}

function colorWeakChange(colorWeak: boolean) {
  colorWeak ? document.body.classList.add('colorWeak') : document.body.classList.remove('colorWeak')
}
</script>

<style lang="less">
@import "@/assets/styles/var.less";

.artiely-more-group {
  .artiely-more-group-btn {
    position: fixed;
    right: 0;
    top: 40%;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 20px 0 color-mix(in srgb, var(--primary-color, @primary-color) 50%, transparent);
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    z-index: 88;

    .item {
      width: 30px;
      height: 30px;
      margin: 5px;
      background: @component-background;
      text-align: center;
      line-height: 30px;
      cursor: pointer;
      border-radius: 4px;

      .icon-yixiangkan {
        color: #1dc9b7;
      }

      .icon-shoucang {
        color: #374afb;
      }

      .icon-tishi {
        color: #fd397a;
      }

      &:hover {
        background: #ffb822;

        .iconfont {
          color: #fff;
        }
      }

      .anticon {
        font-size: 20px;
      }
    }
  }
}

.theme-item {
  width: 25px;
  height: 25px;
  color: #fff;
  margin-right: 6px;
  margin-bottom: 6px;
  display: inline-block;
  border-radius: 2px;
  cursor: pointer;
  text-align: center;
  line-height: 25px;
  overflow: hidden;
}

/*
 * 移动端：把右侧竖排悬浮组改为「左下角横排」。
 *
 * 为什么必须挪位置：桌面内容区左右各留 24px，卡片右边缘在 342px，而这个悬浮组
 * 固定在 right: 0、宽 40px（占 350~390），恰好落在卡片右侧的留白里、不遮内容。
 * 但移动端内容区留白收窄到 12px 后卡片右边缘变成 378px，就被它压住 28px。
 *
 * ⚠️ 这段媒体查询必须写在**本组件自己的 <style> 里**，不能写到 assets/styles/mobile.less：
 *    组件样式由 Vite 运行时注入，略晚于全局样式，两者权重相同 ⇒ 只有「组件没写过的属性」
 *    才会被全局规则加上。踩过的坑：全局写了 `top:auto; right:auto; bottom; left`，
 *    结果 top/right 被组件样式赢走、bottom/left 却生效，四个方向同时存在 ⇒
 *    这个框被撑成 370×494 的大块，直接盖住整页下半部分（/calendar 当时就被盖成一片空白）。
 *
 * ⚠️ 另外注意别只写 `top: auto` —— 必须同时把 `right` 也置回 `auto`，
 *    否则 left(12px) + right(0) 会把这个卡片横向拉伸。
 */
@media only screen and (max-width: 767px) {
  .artiely-more-group .artiely-more-group-btn {
    top: auto;
    right: auto;
    bottom: 12px;
    left: 12px;
    border-radius: 4px;
    /*
     * 固定悬浮元素在窄屏上必然压住一点内容，只能把代价压小：
     * 缩到 32×96（原位是 40×110），并降低存在感，按下时恢复不透明。
     */
    opacity: 0.8;
    transition: opacity 0.2s;

    &:active {
      opacity: 1;
    }

    /*
     * ⚠️ 三个 `.item` 是 `.ant-card-body` 的子元素，**不是卡片本身的子元素**
     *    （a-card 会渲染成 .ant-card > .ant-card-body > .item）。
     *    卡片上原本那句 `display: flex; flex-direction: column` 其实只作用于
     *    它唯一的子元素 .ant-card-body，所以从来就没排过版 —— 在卡片上改
     *    `flex-direction: row` 同样不会有任何效果（实测确认：宽高仍是 40×110）。
     *    真正要横排，得把 flex 设在 .ant-card-body 上。
     */
    .ant-card-body {
      display: flex;
      flex-direction: row;
    }

    .item {
      width: 26px;
      height: 26px;
      margin: 3px;
      line-height: 26px;
    }
  }
}
</style>

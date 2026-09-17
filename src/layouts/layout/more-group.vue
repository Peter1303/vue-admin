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
</style>

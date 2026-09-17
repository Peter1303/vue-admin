<template>
  <div class="workspace">
    123
    <a-button @click="guide">开始引导</a-button>
    <div id="id1">
      <v-iconbox v-model="iconname"/>
    </div>
    456
    <v-avatar-group></v-avatar-group>
    <v-count-to :endVal="1000000" style="font-size:24px;"></v-count-to>
    <a-iconfont type="icon-xiaoxi"></a-iconfont>
    自定义指令和过滤器
    <p>无单位万字</p>
    <div id="id2" v-currency="10000.34" class="money"></div>
    <p>万以下</p>
    <div v-currency:w="{value:99}" class="money"></div>
    <p>万以上</p>
    <div v-currency:w="{value:1200003}" class="money"></div>
    <a-date-picker/>
    <p>亿以上</p>
    <div id="id3" v-currency:w="{value:12000037889}" class="money"></div>
    <p>单位与数字的比例</p>
    <div v-currency:w="{value:82000037889,zoom:0.7}" class="money"></div>
    <p>无分隔符</p>
    <div id="id4" v-currency:w="{value:82037889,zoom:0.7,separator:''}" class="money"></div>
    <p>不保留小数位</p>
    <div v-currency:w="{value:82037889,zoom:0.7,separator:'',decimals:0}" class="money"></div>
    <p>不要货币符号</p>
    <div v-currency:w="{value:82037889,zoom:0.7,separator:'',decimals:0,pre:''}" class="money"></div>
    <p>自定义单位</p>
    <div v-currency:w="{value:82037889,zoom:0.7,separator:'',decimals:0,unit:'圆'}" class="money"></div>
    <p>自定义货币符号</p>
    <div v-currency="{value:82037889,zoom:1,separator:',',decimals:2,pre:'€'}" class="money"></div>
    <a-range-picker
      :ranges="{ Today: [moment(), moment()], 'This Month': [moment(), moment().endOf('month')] }"
      format="YYYY/MM/DD HH:mm:ss"
      showTime
    />
    <div style="height:1000px;"></div>
    <v-guide ref="guideRef" :steps="steps"></v-guide>
  </div>
</template>
<script lang="ts" setup>
import moment from 'moment'
import {ref} from 'vue'

// driver.js 0.9 → 1.x：steps 结构变化，popover 的 position 改为 side
const steps = [
  {
    element: '#id1',
    popover: {
      className: 'first-step-popover-class',
      title: 'Title on Popover',
      description: 'Body of the popover',
      side: 'bottom'
    }
  },
  {
    element: '#id2',
    popover: {
      title: 'Title on Popover',
      description: 'Body of the popover',
      side: 'top'
    }
  },
  {
    element: '#id3',
    popover: {
      title: 'Title on Popover',
      description: 'Body of the popover',
      side: 'top'
    }
  }
]

defineOptions({name: 'workspace'})

const iconname = ref('')
const guideRef = ref<any>(null)

function guide() {
  guideRef.value?.start()
}
</script>
<style lang="less" scoped>
.workspace {
  .money {
    font-size: 30px;
  }
}
</style>

<template>
  <!--
    ⚠️ 根元素**不能留上内边距**（原来是 `padding: 10px`）。

    页面根的上内边距会叠加在 layout/router-page.vue 提供的统一留白（24px）之上，
    于是这一页的内容比其它所有页低 10px —— 实测（CDP，1440×900，fixed+标签页）：
      · 其它页首个可见盒子顶边 = 133px（chrome 底边 105 + 24）
      · 本页 = 143px，元凶就是这 10px
    左右/下的 10px 保留：那是这页自己的呼吸感，且不影响「页面顶端到 chrome 的距离」。

    结论：页面自己加的「顶部」间距一律交给布局壳统一提供，页面只负责内容。
  -->
  <div style="padding: 0 10px 10px">
    <a-spin :spinning="loading">
      <!-- apex -->
      <a-row :gutter="24" style="margin-bottom: 24px">
        <a-col :lg="6" :md="12" :sm="12" :xs="24">
          <chart-min-chart
            :countValue="count[0]"
            :data="list"
            :opacity="0.9"
            color="#fd397a"
            desc="今日新增客户"
            separator=""
            type="line"
          />
        </a-col>
        <a-col :lg="6" :md="12" :sm="12" :xs="24">
          <chart-min-chart
            :countValue="count[1]"
            :data="list"
            color="#fd7e14"
            desc="今日订单量"
            separator=""
          />
        </a-col>
        <a-col :lg="6" :md="12" :sm="12" :xs="24">
          <chart-min-chart
            :countValue="count[2]"
            :data="list"
            color="#20c997"
            desc="剩余库存"
            separator=""
            type="bar"
          />
        </a-col>
        <a-col :lg="6" :md="12" :sm="12" :xs="24">
          <chart-min-chart
            :countValue="count[3]"
            :data="list"
            :decimals="2"
            color="#ffb822"
            desc="今日营业额"
            prefix="￥"
            type="area"
          />
        </a-col>
      </a-row>
      <a-row :gutter="24" style="margin-bottom: 24px">
        <a-col :lg="12" :md="12" :sm="24" :xs="24">
          <a-card :bordered="false" hoverable>
            <pie></pie>
          </a-card>
        </a-col>
        <a-col :lg="12" :md="12" :sm="24" :xs="24">
          <a-card :bordered="false" hoverable>
            <pie-platelets></pie-platelets>
          </a-card>
        </a-col>
      </a-row>

      <a-row :gutter="24" style="margin-bottom: 24px">
        <a-col :lg="12" :md="12" :sm="24" :xs="24">
          <a-card :bordered="false" hoverable>
            <pie-multi-level></pie-multi-level>
          </a-card>
        </a-col>
        <a-col :lg="12" :md="12" :sm="24" :xs="24">
          <a-card :bordered="false" hoverable>
            <point></point>
          </a-card>
        </a-col>
      </a-row>
      <a-row :gutter="24" style="margin-bottom: 24px">
        <a-col :lg="12" :md="12" :sm="24" :xs="24">
          <a-card :bordered="false" hoverable>
            <dashed/>
          </a-card>
        </a-col>
        <a-col :lg="12" :md="12" :sm="24" :xs="24">
          <a-card :bordered="false" hoverable>
            <spline-area/>
          </a-card>
        </a-col>
      </a-row>

      <a-row :gutter="24" style="margin-bottom: 24px">
        <a-col :lg="12" :md="12" :sm="24" :xs="24">
          <a-card :bordered="false" hoverable>
            <column-charts/>
          </a-card>
        </a-col>
        <a-col :lg="12" :md="12" :sm="24" :xs="24">
          <a-card :bordered="false" hoverable>
            <line-area></line-area>
          </a-card>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {api} from '@core'
import ChartMinChart from './template/chart-min-chart.vue'
import Pie from './g2/pie.vue'
import PiePlatelets from './g2/pie-platelets.vue'
import PieMultiLevel from './g2/pie-multi-level.vue'
import Point from './g2/point.vue'
import Dashed from './apex-charts/dashed.vue'
import SplineArea from './apex-charts/spline-area.vue'
import ColumnCharts from './apex-charts/column-charts.vue'
import LineArea from './apex-charts/line-area.vue'

defineOptions({name: 'DashboardAnalysis'})

const loading = ref(false)
const count = ref<number[]>([])
const list = ref<number[]>([])

onMounted(() => {
  getData()
})

function getData() {
  loading.value = true
  api
    .GET_ANALYSIS()
    .then((r) => {
      const res = r as { data?: { count?: number[]; list?: number[] } }
      count.value = res.data?.count ?? []
      list.value = res.data?.list ?? []
    })
    .finally(() => {
      loading.value = false
    })
    .catch(() => {
      list.value = [2, 5, 3, 7, 9, 3, 4]
      // alert(1)
    })
}
</script>

<style lang="less">
.current-data {
  padding-right: 10px;

  > a {
    color: #777;
    padding: 0 10px;

    &.active {
      color: #1690ff;
    }
  }
}

.video-container {
  position: relative;
  width: 100%;

  .homepage-title {
    position: absolute;
    top: 50%;
    margin-top: -70px;
    width: 100%;
    z-index: 1;
  }

  .overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1;
    background-color: rgba(45, 57, 103, 0.6);

    img {
      width: 20px;
      height: 18px;
      position: absolute;
      bottom: 18px;
      left: 50%;
      margin-left: -10px;
      animation: updown 2s infinite;
      animation-timing-function: cubic-bezier(0.36, 0.72, 0.35, 0.92);
    }
  }
}

@keyframes updown {
  0% {
    bottom: 18px;
  }
  50% {
    bottom: 28px;
  }
  100% {
    bottom: 18px;
  }
}
</style>

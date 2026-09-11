<template>
  <div>
    <a-spin :spinning="loading">
    <a-row  :gutter="24" style="margin-bottom:25px;">
      <a-col :xs="24" :sm="24" :md="8" :lg="8">
        <card-chart title="每日销售" :loading="loading" :data="dataBar" :transform="transform" type="bar" subTitle="查看每个列以获取更多详细信息"></card-chart>
      </a-col>
      <a-col :xs="24" :sm="24" :md="8" :lg="8">
        <card-chart title="分享利益" :loading="loading" :data="dataPie" type="pie" subTitle="利润在客户之间分享"></card-chart>
      </a-col>
      <a-col :xs="24" :sm="24" :md="8" :lg="8">
        <card-chart title="收入变化" :loading="loading" :data="dataTriangle" type="triangle" subTitle="按城市划分的收入变化细分"></card-chart>
      </a-col>
    </a-row>
    <a-card>
      <div id="timeline-chart"></div>
    </a-card>
    </a-spin>
  </div>
</template>

<script>
import ApexCharts from 'apexcharts'
import cardChart from './template/card-chart'

export default {
  components: {
    cardChart
  },
  data () {
    return {
      dataTriangle: [],
      dataPie: [],
      transform: {},
      dataBar: [],
      loading: false
    }
  },
  mounted () {
    this.getData()
    this.$nextTick(() => {
      this.render()
    })
  },
  methods: {
    render () {
      var options = {
        chart: {
          type: 'area',
          height: 300,
          foreColor: '#999',
          scroller: {
            enabled: true,
            track: {
              height: 7,
              background: '#e0e0e0'
            },
            thumb: {
              height: 10,
              background: '#94E3FF'
            },
            scrollButtons: {
              enabled: true,
              size: 9,
              borderWidth: 2,
              borderColor: '#008FFB',
              fillColor: '#008FFB'
            },
            padding: {
              left: 30,
              right: 20
            }
          },
          stacked: true,
          dropShadow: {
            enabled: true,
            enabledSeries: [0],
            top: -2,
            left: 2,
            blur: 5,
            opacity: 0.06
          }
        },
        colors: ['#00E396', '#0090FF'],
        stroke: {
          curve: 'smooth',
          width: 3
        },
        dataLabels: {
          enabled: false
        },
        series: [
          {
            name: 'Total Views',
            data: generateDayWiseTimeSeries(0, 18)
          },
          {
            name: 'Unique Views',
            data: generateDayWiseTimeSeries(1, 18)
          }
        ],
        markers: {
          size: 0,
          strokeColor: '#fff',
          strokeWidth: 3,
          strokeOpacity: 1,
          fillOpacity: 1,
          hover: {
            size: 6
          }
        },
        xaxis: {
          type: 'datetime',
          axisBorder: {
            show: false
          },
          axisTicks: {
            show: false
          }
        },
        yaxis: {
          tickAmount: 4,
          min: 0,
          labels: {
            offsetX: 24,
            offsetY: -5
          },
          tooltip: {
            enabled: true
          }
        },
        grid: {
          padding: {
            left: -5,
            right: 5
          }
        },
        tooltip: {
          x: {
            format: 'dd MMM yyyy'
          }
        },
        legend: {
          position: 'top',
          horizontalAlign: 'left'
        },
        fill: {
          type: 'solid',
          fillOpacity: 0.7
        }
      }

      var chart = new ApexCharts(
        document.querySelector('#timeline-chart'),
        options
      )

      chart.render()

      function generateDayWiseTimeSeries (s, count) {
        var values = [
          [4, 3, 10, 9, 29, 19, 25, 9, 12, 7, 19, 5, 13, 9, 17, 2, 7, 5],
          [2, 3, 8, 7, 22, 16, 23, 7, 11, 5, 12, 5, 10, 4, 15, 2, 6, 2]
        ]
        var i = 0
        var series = []
        var x = new Date('11 Nov 2012').getTime()
        while (i < count) {
          series.push([x, values[s][i]])
          x += 86400000
          i++
        }
        return series
      }
    },
    getData () {
      this.loading = true
      this.$api.GET_DASHBOARD().then(res => {
        this.$nextTick(() => {
          this.dataTriangle = Object.freeze(res.data.dataTriangle)
          this.dataPie = Object.freeze(res.data.dataPie)
          this.transform = Object.freeze(res.data.transform)
          this.dataBar = Object.freeze(res.data.dataBar)
        })
      }).catch(() => {
        // 接口异常（原 easy-mock 服务已停服）时用兜底数据渲染，保证页面可用
        this.transform = {
          type: 'fold',
          fields: ['本月', '上月'],
          key: 'name',
          value: 'value'
        }
        this.dataBar = [
          { 城市: '北京', 本月: 32, 上月: 24 },
          { 城市: '上海', 本月: 45, 上月: 31 },
          { 城市: '广州', 本月: 28, 上月: 35 },
          { 城市: '深圳', 本月: 38, 上月: 29 }
        ]
        this.dataPie = [
          { type: '线上', value: 42 },
          { type: '门店', value: 31 },
          { type: '代理', value: 27 }
        ]
        this.dataTriangle = [
          { type: '华北', value: 46 },
          { type: '华东', value: 38 },
          { type: '华南', value: 34 },
          { type: '西部', value: 22 }
        ]
      }).finally(() => {
        // 必须放在 finally：否则接口失败时 loading 永远为 true，页面会一直转圈
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>
</style>

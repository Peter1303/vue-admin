<template>
  <div class="amap-page-container">
    <a-alert
      v-if="errorMsg"
      :description="errorMsg"
      class="amap-error"
      message="高德地图加载失败"
      show-icon
      type="warning"
    />
    <div v-show="!errorMsg" ref="mapRef" class="amap-demo"></div>
  </div>
</template>

<script lang="ts" setup>
/**
 * 高德地图演示页
 * ------------------------------------------------------------
 * ⚠️ 迁移要点（这是原项目里最容易「静默空白」的一页）：
 *
 * 原模板用的是 element-ui 的 `<el-amap>` / `<el-amap-marker>` 标签，并由 vue-amap
 * 在 Vite/webpack 侧注入 SDK。但：
 *   1) 本项目 src 里对 element-ui 是**零引用**（package.json 里的死依赖），
 *      所以 `<el-amap>` 从来没有真正的实现；
 *   2) vue-amap 只有 Vue 2 版本，没有 Vue 3 版本。
 * Vue 3 对未注册标签只会当成普通自定义元素渲染 → 整块地图区域静默为空、不报错。
 *
 * 因此这里改为**命令式**创建地图：用 @amap/amap-jsapi-loader 运行时加载 JSAPI 2.0，
 * 再 `new AMap.Map(...)`（封装在 @/shims/amap.ts）。加载失败时用 a-alert 明确提示，
 * 而不是留一片空白。
 */
import {onMounted, onUnmounted, ref, watch} from 'vue'
import type {AMapMapInstance, AMapNamespace} from '@/shims/amap'
import {createAMap, loadAMap} from '@/shims/amap'

defineOptions({name: 'Amap'})

/** 高德 POI（onSearchResult 用到的字段） */
interface AMapPoi {
  lng: number
  lat: number
}

const mapRef = ref<HTMLDivElement | null>(null)
const errorMsg = ref('')

// 原 data() 的三个字段，语义不变
const markers = ref<number[][]>([])
const mapCenter = ref<[number, number]>([121.59996, 31.197646])
const mapStyle = 'amap://styles/dark'

let map: AMapMapInstance | null = null
let amapNS: AMapNamespace | null = null
let markerInstances: unknown[] = []

/** 把 markers 同步到地图上（对应原来的 `<el-amap-marker :position>`） */
function renderMarkers() {
  if (!map || !amapNS) return
  markerInstances.forEach((m) => map?.remove(m))
  markerInstances = markers.value.map(
    (position) => new (amapNS as AMapNamespace).Marker({position, map})
  )
}

async function initMap() {
  const el = mapRef.value
  if (!el) return
  try {
    amapNS = await loadAMap()
    map = await createAMap(el, {
      center: mapCenter.value,
      zoom: 15,
      mapStyle,
      resizeEnable: true
    })
    renderMarkers()
  } catch (e) {
    // 捕获所有加载/实例化异常，交给模板里的 a-alert 展示（避免整页空白）
    errorMsg.value = e instanceof Error ? e.message : String(e)
  }
}

// 地图中心变化时同步（原 onSearchResult 里改 mapCenter 后由 el-amap 的 :center 响应）
watch(mapCenter, (center) => {
  map?.setCenter(center)
})

// 标记变化时重绘
watch(markers, renderMarkers, {deep: true})

onMounted(initMap)

onUnmounted(() => {
  map?.destroy()
  map = null
  markerInstances = []
})

/**
 * REVIEW(迁移): 原页面里的搜索框 `<el-amap-search-box>` 在源码中本就是**注释掉**的
 * （见 git 历史），所以这个回调当前不会被触发。这里原样保留它的计算逻辑，
 * 便于后续接回高德 Autocomplete 时直接复用。
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onSearchResult(pois: AMapPoi[]) {
  let latSum = 0
  let lngSum = 0
  if (pois.length > 0) {
    pois.forEach((poi) => {
      const {lng, lat} = poi
      lngSum += lng
      latSum += lat
      markers.value.push([poi.lng, poi.lat])
    })
    const center = {
      lng: lngSum / pois.length,
      lat: latSum / pois.length
    }
    mapCenter.value = [center.lng, center.lat]
  }
}
</script>

<style>
.amap-demo {
  height: 100%;
  width: 100%;
}

.search-box {
  position: absolute !important;
  top: 10px;
  left: 20px;
}

.amap-page-container {
  position: relative;
  width: 100%;
  height: 600px;
}

.amap-error {
  margin-bottom: 8px;
}
</style>

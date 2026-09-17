<template>
  <div class="exception">
    <div class="img">
      <img :src="config[type].img">
    </div>
    <div class="content">
      <h1>{{ config[type].title }}</h1>
      <div class="desc">{{ config[type].desc }}</div>
      <div class="action">
        <a-button type="primary" @click="handleToHome">返回首页</a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useRouter} from 'vue-router'
import types from './type'

defineOptions({name: 'Exception'})

const props = withDefaults(
  defineProps<{
    type?: string
  }>(),
  {type: '404'}
)

// 保留原 config[type] 取值结构（按 403/404/500 取图与文案），不可漏字段
const config = types
const router = useRouter()

function handleToHome() {
  router.push('/')
}
</script>

<style lang="less" scoped>
/*
 * 错误页（403 / 404 / 500 共用）：插图在上，标题 / 描述 / 按钮依次往下，整体上下居中。
 *
 * 原先是「左右并排」：`.img` 与 `.content` 都是 inline-block，靠 vertical-align: baseline
 * 对齐，于是 .content 的垂直中心比插图中心高 71px —— 视觉上文案悬在右上方；整块又被
 * margin-top: 150px 从顶部推下去，下面留一大片空白。
 *
 * 现在改成纵向排布 + 垂直居中：
 *   · 父级（#app）高度即视口高，所以 min-height: 100% 就能让内容在视口里真正居中；
 *   · 去掉 margin-top: 150px —— 它会经 margin 折叠一路顶到 body，把文档撑到 1050px，
 *     页面因此常年带一条滚动条（视口只有 900px）；
 *   · 去掉 .content 的 flex: auto —— .exception 变成 flex 容器后，它会去抢剩余高度把内容撑开。
 */
.exception {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 100%;

  .img {
    // 原来是左右并排时的横向间距（padding-right），改成纵向间距
    margin-bottom: 32px;

    img {
      display: block;
      /*
       * 四张错误页插画（403/404/500/600）固有尺寸各不相同：403 竖 227×269、404 横 423×341、
       * 500 很横 422×193、600 另算。之前只用 max-height:360px 兜底，于是各自按固有高度呈现
       * （269 / 341 / 193 …），肉眼看就是「有些高有些低」。
       * 现在统一钉死高度、宽度按各自比例自适应：四张渲染高度一致，宽度随长宽比自然拉开，
       * 不裁切、不拉伸（object-fit:contain 兜底极端窄屏被 max-width 卡住时也不变形）。
       * 插图都是 .svg，缩放无损。
       */
      height: 260px;
      width: auto;
      max-width: 100%;
      object-fit: contain;
    }
  }

  .content {
    h1 {
      // 错误页是挂在 #app 下的满屏页（没有布局壳），文字色必须自己接主题令牌：
      // 深色模式下页底是 #000，写死的 #434e59 会变成一块看不出来的深灰
      color: var(--heading-color, #434e59);
      font-size: 72px;
      font-weight: 600;
      line-height: 72px;
      margin-bottom: 24px;
    }

    .desc {
      color: var(--text-color-secondary, rgba(0, 0, 0, 0.45));
      font-size: 20px;
      line-height: 28px;
      // 原来 16px（紧贴按钮），改成与标题同节奏的 24px
      margin-bottom: 24px;
    }
  }
}
</style>

<template>
  <div class="artiely-action-bar">
    <slot></slot>
    <div class="action-search"></div>
    <div class="action-action">
      <a-button class="action-btn" type="primary">新增</a-button>
    </div>
    <div class="action-default">
      <a-tooltip>
        <template #title>设置</template>
        <div class="action-icon">
          <v-icon name="icon-decoration_fill"></v-icon>
        </div>
      </a-tooltip>
      <a-tooltip>
        <template #title>截屏</template>
        <div class="action-icon">
          <v-icon name="icon-tailor"></v-icon>
        </div>
      </a-tooltip>
      <a-tooltip>
        <template #title>下载</template>
        <div class="action-icon">
          <v-icon name="icon-download-fill"></v-icon>
        </div>
      </a-tooltip>
      <a-tooltip>
        <template #title>打印</template>
        <div class="action-icon">
          <v-icon name="icon-weibiaoti526"></v-icon>
        </div>
      </a-tooltip>
      <a-tooltip>
        <template #title>导出</template>
        <div class="action-icon">
          <v-icon name="icon-send"></v-icon>
        </div>
      </a-tooltip>
      <a-tooltip>
        <template #title>导入</template>
        <div class="action-icon">
          <v-icon name="icon-inport"></v-icon>
        </div>
      </a-tooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
</script>

<style lang="less" scoped>
.artiely-action-bar {
  height: 50px;
  padding-left: 10px;
  // background: #fff;
  width: 100%;
  display: flex;

  .action-search {
    width: 200px;
    height: 30px;
    // 中性填充块：深色下用 --fill-muted 的深色值，否则这两个方块会亮在深色页面上
    background: var(--fill-muted, #e1e3ec);
    border-radius: 4px;
    margin: 10px;
  }

  .action-action {
    flex: 1;
    margin: 9px;
    display: flex;
  }

  .action-default {
    margin: 5px;
    display: flex;
  }

  .action-icon {
    height: 30px;
    width: 30px;
    background: var(--fill-muted, #e1e3ec);
    line-height: 30px;
    text-align: center;
    margin: 5px;
    cursor: pointer;
    user-select: none;
    border-radius: 4px;

    &:hover {
      color: #fff;
      background: #1DA57A;

      .iconfont {
        color: #fff;
      }
    }

    .iconfont {
      color: #959cb6
    }
  }
}
</style>

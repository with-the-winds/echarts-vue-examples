<!--
 * @Author: zhubj | '' 
 * @Date: 2023-11-20 16:57:55
 * @LastEditors: zhubj | '' 
 * @LastEditTime: 2023-11-27 08:49:06
 * @FilePath: \echarts-vue-examples\src\App.vue
 * @Description: 
-->
<template>
  <div class="menu-box">
    <div
      :class="['menu-item', currentPath == '/bar' && 'menu-item-active']"
      @click="routerPush('/bar')"
    >
      001.基础柱状图（单个）
    </div>
    <div
      :class="['menu-item', currentPath == '/line' && 'menu-item-active']"
      @click="routerPush('/line')"
    >
      002.基础折线图（单个）
    </div>
    <div
      :class="['menu-item', currentPath == '/mulBar' && 'menu-item-active']"
      @click="routerPush('/mulBar')"
    >
      003.自定义多个柱状图
    </div>
    <div
      :class="['menu-item', currentPath == '/mul3DBar' && 'menu-item-active']"
      @click="routerPush('/mul3DBar')"
    >
      004.自定义多个立体柱状图
    </div>
  </div>

  <div class="wrap-box">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'
const router = useRouter()

const currentPath = ref<string>('/bar')
const routerPush = (path: string) => {
  currentPath.value = path
  router.push({ path })
}
</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
  font-size: 14px;
  font-weight: 400;
}
#app {
  display: flex;
}
</style>

<style lang="scss" scoped>
.menu-box {
  width: 300px;
  height: 100vh;
  background-color: #f6f6f7;
  .menu-item {
    cursor: pointer;
    height: 28px;
    line-height: 28px;
    padding-left: 6px;
    &:hover {
      color: #409eff;
    }
  }
  .menu-item-active {
    color: #409eff;
    background-color: rgba(64, 158, 255, 0.2);
  }
}
.wrap-box {
  width: calc(100% - 300px);
  height: 100vh;
  position: relative;
  // background-image: url('@/assets/main-bg001.png');
  // background-repeat: no-repeat;
  // background-size: 100% 100%;
  // color: #ffffff;
}
</style>

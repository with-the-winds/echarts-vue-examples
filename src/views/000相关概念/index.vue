<!--
 * @Author: zhubj | '' 
 * @Date: 2023-11-28 13:29:59
 * @LastEditors: zhubj | '' 
 * @LastEditTime: 2023-11-28 14:28:44
 * @FilePath: \echarts-vue-examples\src\views\000相关概念\index.vue
 * @Description: 
-->
<template>
  <div class="description">{{ description }}</div>
  <div class="bar-chart" ref="baseChartRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption, EChartsType } from 'echarts'

const description = `
功能：
1）基本使用
`

let chart: EChartsType | null = null
let options: EChartsOption = {}

const baseChartRef = ref()
// 初始化图表
const initChart = async () => {
  if (chart) {
    chart.dispose()
    chart = null
  }

  // 图表挂载到dom上
  await nextTick()
  chart = echarts.init(baseChartRef.value)

  // options 配置项
  options = {
    title: {
      text: 'ECharts 入门示例'
    },
    // 图例组件
    legend: {
      show: true
    },
    tooltip: {},
    xAxis: {
      data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
    },
    yAxis: {},
    series: [
      {
        name: '销量',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20]
      }
    ]
  }

  // 绘制图表
  chart.setOption(options, true)
  // chart.resize({
  //   width: 600,
  //   height: 400
  // })
  // chart.on('contextmenu', (params) => {
  //   console.log('params', params)
  // })
}

// echartsInstance.resize 监听图表容器的大小并改变图表大小
const chartResize = () => {
  chart?.resize()
}

onMounted(() => {
  initChart()
  // 组件挂载时添加事件监听器
  window.addEventListener('resize', chartResize)
})

onUnmounted(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
  // 在组件卸载前移除事件监听器，防止内存泄漏
  window.removeEventListener('resize', chartResize)
})
</script>

<style lang="scss" scoped>
.description {
  white-space: pre-line;
  padding-left: 6px;
}
.bar-chart {
  width: calc(100% - 20px);
  height: 600px;
  margin: 10px;
  border: 1px solid gray;
}
</style>

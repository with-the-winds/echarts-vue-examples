<template>
  <div class="description">{{ description }}</div>
  <div class="bar-chart" ref="ringChartRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption, EChartsType } from 'echarts'
import { pieSeriesData } from '@/utils/baseData'

const description = `
功能：
1）区别于柱状图和折线图，没有x轴和y轴设置
2）tooltip区别于触发选项要设置，数据项图形'item'和坐标轴'axis'触发
3）对于装饰画的圆环取消tooltip显示
`

let chart: EChartsType | null = null
let options: EChartsOption = {}

// series各项对应的颜色
const optionsItemColor = {
  水果: {
    color: 'rgba(255, 214, 57, 1)',
    alphaColor: 'rgba(255, 214, 57, 0.3)'
  },
  蔬菜: {
    color: 'rgba(251, 162, 29, 1)',
    alphaColor: 'rgba(251, 162, 29, 0.3)'
  },
  禽类: {
    color: 'rgba(243, 100, 96, 1)',
    alphaColor: 'rgba(243, 100, 96, 0.3)'
  },
  海鲜: {
    color: 'rgba(34, 91, 239, 1)',
    alphaColor: 'rgba(34, 91, 239, 0.3)'
  },
  主食: {
    color: 'rgba(93, 221, 160, 1)',
    alphaColor: 'rgba(93, 221, 160, 0.3)'
  }
}

const ringChartRef = ref()
const initChart = async () => {
  if (chart) {
    chart.dispose()
    chart = null
  }

  // 图表挂载到标签上
  await nextTick()
  if (!pieSeriesData.length) return
  chart = echarts.init(ringChartRef.value)
  // options 配置项
  options = {
    // 标题组件，包含主标题和副标题
    title: {
      show: false,
      text: '水果标题',
      left: 'center'
    },
    // 图例组件
    legend: {
      show: true,
      textStyle: {
        color: '#000'
      },
      // icon: legendImg,
      itemWidth: 16,
      itemHeight: 18,
      // data: ['水果'],
      top: 20
    },
    // 直角坐标系内绘图网格
    grid: {
      top: 60,
      left: 40,
      right: 10,
      bottom: 30
    },
    // dataZoom 组件 用于区域缩放
    dataZoom: [
      {
        type: 'inside',
        maxValueSpan: 12,
        filterMode: 'filter',
        zoomOnMouseWheel: false, // 如何触发缩放
        moveOnMouseMove: true, // 如何触发数据窗口平移（鼠标移动）
        moveOnMouseWheel: false // 如何触发数据窗口平移(鼠标滚轮)
      }
    ],
    // 提示框组件
    tooltip: {
      show: true,
      trigger: 'item', // 触发类型
      axisPointer: {
        type: 'shadow'
      }
    },
    // 图表类型
    series: [
      {
        type: 'pie',
        name: '',
        data: pieSeriesData,
        radius: [150, 167], // 饼图的半径
        center: ['50%', '50%'], // 饼图的中心（圆心）坐标，数组的第一项是横坐标，第二项是纵坐标。
        // roseType: 'radius', // 是否展示成南丁格尔图
        // 图形的样式
        itemStyle: {
          borderRadius: 0,
          color: (params) => {
            return optionsItemColor[params.name].color
            // console.log(params)
          }
        },
        // 饼图图形上的文本标签
        label: {
          show: true,
          position: 'outside', // 标签的位置
          formatter: (params: any) => {
            return `{gap|${params.value}个 / ${params.percent}%\n}{gap|${params.name}}`
          },
          color: 'inherit', // 如果设置为 'inherit'，则为视觉映射得到的颜色，如系列色
          fontSize: 14,
          padding: [0, -80, 0, -80],
          // 自定义富文本样式
          rich: {
            gap: {
              width: 50,
              height: 24,
              align: 'center',
              verticalAlign: 'middle',
              fontSize: 14
            }
          }
        },
        // 标签的视觉引导线配置
        labelLine: {
          show: true,
          length: 35, // 视觉引导线第一段的长度
          length2: 100 // 视觉引导项第二段的长度
        }
      },
      {
        type: 'pie',
        name: '装饰部分',
        data: pieSeriesData,
        radius: [130, 150], // 饼图的半径
        center: ['50%', '50%'], // 饼图的中心（圆心）坐标，数组的第一项是横坐标，第二项是纵坐标。
        // roseType: false, // 是否展示成南丁格尔图
        // 图形的样式
        itemStyle: {
          borderRadius: 0,
          color: (params) => {
            return optionsItemColor[params.name].alphaColor
            // console.log(params)
          }
        },
        // 饼图图形上的文本标签
        label: {
          show: false
        },
        // 标签的视觉引导线配置
        labelLine: {
          show: false
        },
        // 本系列特定的 tooltip 设定
        tooltip: { show: false }
      }
    ]
  }
  // options 配置设置到chart上
  options && chart.setOption(options, true)
}

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>

<style lang="scss" scoped>
.description {
  white-space: pre-line;
  padding-left: 6px;
}
.bar-chart {
  width: 800px;
  height: 600px;
  margin: 10px;
  border: 1px solid gray;
}
</style>

<template>
  <div class="description">{{ description }}</div>
  <div class="bar-chart" ref="barChartRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption, EChartsType } from 'echarts'

const description = `
功能：
1）与 014自定义基本扇形图的区别 是饼图是多个series扇形图组成的，legend有多个图例
`

let chart: EChartsType | null = null
let options: EChartsOption = {}
const seriesData = [
  { name: '衬衫', value: 5, isShow: true },
  { name: '羊毛衫', value: 10, isShow: true },
  { name: '雪纺衫', value: 36, isShow: true },
  { name: '裤子', value: 10, isShow: true },
  { name: '高跟鞋', value: 10, isShow: true },
  { name: '袜子', value: 20, isShow: true }
]

const barChartRef = ref()
const initChart = async () => {
  if (chart) {
    chart.dispose()
    chart = null
  }

  // 图表挂载到标签上
  await nextTick()
  chart = echarts.init(barChartRef.value)
  // 返回series的数组
  function getSeriesOption() {
    const tempSeriesData = seriesData.filter((item) => item.isShow == true)

    const seriesOption = seriesData.map((item) => {
      const total = tempSeriesData.reduce((total, currentValue) => total + currentValue.value, 0) // 总数
      let endTotal = 0
      // 判断累加到当前的值
      if (item.isShow) {
        for (const itemValue of tempSeriesData) {
          endTotal += itemValue.value
          if (itemValue.name == item.name) {
            break
          }
        }
      }

      const currentAngle = (item.value / total) * Math.PI * 2
      const endAngle = (endTotal / total) * Math.PI * 2
      return {
        type: 'custom',
        name: item.name,
        // @ts-ignore
        renderItem: (params, api) => {
          return {
            type: 'sector',
            // 形状
            shape: {
              cx: 400, // 图形元素的中心在父节点坐标系（以父节点左上角为原点）中的横坐标值。
              cy: 300, // 图形元素的中心在父节点坐标系（以父节点左上角为原点）中的纵坐标值。
              r: 150, // 外半径
              r0: 0, // 内半径
              startAngle: item.isShow ? endAngle - currentAngle : 0, // 开始弧度
              endAngle: item.isShow ? endAngle : 0, // 结束弧度
              clockwise: true // 是否顺时针
            },
            style: {
              fill: api.visual('color') // 填充
            }
          }
        },
        data: [item.value]
      }
    })
    return seriesOption
  }

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
    // 直角坐标系 grid 中的 x 轴
    xAxis: {
      show: false,
      type: 'category',
      // name: 'x轴',
      // nameLocation: 'start',
      boundaryGap: true, // 两边留白策略
      // 轴线
      axisLine: {
        show: true,
        lineStyle: {
          color: '#000',
          opacity: 0.4,
          width: 1,
          type: 'solid'
        }
      },
      // 刻度
      axisTick: {
        show: false,
        alignWithLabel: true, // 类目轴中在 boundaryGap 为 true 的时候有效，可以保证刻度线和标签对齐
        lineStyle: {} // 刻度线样式
      },
      // 标签
      axisLabel: {
        show: true,
        interval: 0, // 坐标轴刻度标签的显示间隔，在类目轴中有效, 设置成 0 强制显示所有标签
        color: '#000',
        fontWeight: 400,
        fontSize: 12,
        margin: 12
      },
      // 分隔线
      splitLine: {
        show: false,
        lineStyle: {
          color: '#000',
          width: 1,
          opacity: 0.15,
          type: 'dashed'
        }
      },
      data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
    },
    // 直角坐标系 grid 中的 y 轴
    yAxis: {
      show: false,
      type: 'value',
      // 坐标轴名称和样式
      name: '(单位/个)',
      nameTextStyle: {
        padding: [0, 8, 0, 0],
        fontSize: 12,
        fontFamily: 'SourceHanSansCN-Regular',
        color: '#8F9297',
        fontWeight: 400
      },
      minInterval: 1, // 刻度分割间隔，1的话确保都是整数
      // 轴线
      axisLine: {
        show: true,
        lineStyle: {
          color: '#000',
          opacity: 0.14,
          width: 1
        }
      },
      // 刻度
      axisTick: {
        show: false
      },
      // 刻度标签
      axisLabel: {
        show: true,
        interval: 0, // 强制显示全部文字
        color: '#8F9297',
        fontSize: 12,
        fontWeight: 400
      },
      // 分隔线
      splitLine: {
        show: true,
        lineStyle: {
          color: '#000',
          width: 1,
          opacity: 0.15,
          type: 'dashed'
        }
      }
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
      },
      formatter: '{a} {c}'
    },
    // 图表类型
    series: getSeriesOption() as echarts.SeriesOption
  }
  // options 配置设置到chart上
  options && chart.setOption(options, true)

  // 图例选中/未选中的事件
  chart.on('legendselectchanged', (params: any) => {
    for (let item of seriesData) {
      if (item.name == params.name) {
        item.isShow = params.selected[params.name]
        break
      }
    }

    chart?.setOption({
      series: getSeriesOption()
    })
  })
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

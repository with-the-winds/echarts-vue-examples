<template>
  <div class="description">{{ description }}</div>
  <div class="bar-chart" ref="mulBarChartRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption, EChartsType } from 'echarts'
import { mulSeriesData } from '@/utils/baseData'

const description = `
功能：
1）dataZoom 组件鼠标左右滚动功能
2）自定义 custom 画图
3）这个图有做根据series数量的居中设置
`

let chart: EChartsType | null = null
let options: EChartsOption = {}

const mulBarChartRef = ref()
const initChart = async () => {
  if (chart) {
    chart.dispose()
    chart = null
  }
  // 根据源数据获取 x 轴列表
  let seriesLabel = []
  if (mulSeriesData.length > 0) {
    seriesLabel = mulSeriesData[0].data.map((item) => item.name)
  }

  // 图表挂载到标签上
  await nextTick()
  if (!mulSeriesData.length) return
  chart = echarts.init(mulBarChartRef.value)
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
      data: ['入库数量', '销售数量', '库存数量'],
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
      show: true,
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
      data: seriesLabel
    },
    // 直角坐标系 grid 中的 y 轴
    yAxis: {
      show: true,
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
          opacity: 0.4,
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
        color: '#000',
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
        maxValueSpan: 6,
        filterMode: 'filter',
        zoomOnMouseWheel: false, // 如何触发缩放
        moveOnMouseMove: true, // 如何触发数据窗口平移（鼠标移动）
        moveOnMouseWheel: false // 如何触发数据窗口平移(鼠标滚轮)
      }
    ],
    // 提示框组件
    tooltip: {
      show: true,
      trigger: 'axis', // 触发类型
      axisPointer: {
        type: 'shadow'
      }
    },
    // 无障碍访问（为了让贴花能够使用）
    aria: {
      enabled: true,
      decal: {
        show: true
      }
    },
    // 图表类型
    series: [
      {
        type: 'custom',
        name: '入库数量',
        data: mulSeriesData[0].data,
        // @ts-ignore
        renderItem: (params, api) => {
          return getRenderItem(params, api)
        },
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(45,126,217,0.6) ' // 0% 处的颜色
              },
              {
                offset: 1,
                color: 'rgba(3,30,78,0.3)' // 100% 处的颜色
              }
            ]
          },
          borderColor: '#0078FF',
          // 纹理贴花
          decal: {
            color: 'rgba(0,252,255,0.3)',
            dashArrayX: [1, 0],
            dashArrayY: [1, 3],
            symbolSize: 1,
            rotation: -Math.PI / 4
          }
        }
      },
      {
        type: 'custom',
        name: '销售数量',
        data: mulSeriesData[1].data,
        // @ts-ignore
        renderItem: (params, api) => {
          return getRenderItem(params, api)
        },
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(249,82,102,0.6) ' // 0% 处的颜色
              },
              {
                offset: 1,
                color: 'rgba(3,31,80,0.3)' // 100% 处的颜色
              }
            ]
          },
          borderColor: '#FC3951',
          // 纹理贴花
          decal: {
            color: 'rgba(249,82,102,0.3)',
            dashArrayX: [1, 0],
            dashArrayY: [1, 3],
            symbolSize: 1,
            rotation: -Math.PI / 4
          }
        }
      },
      {
        type: 'custom',
        name: '库存数量',
        data: mulSeriesData[2].data,
        // @ts-ignore
        renderItem: (params, api) => {
          return getRenderItem(params, api)
        },
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(255,252,0,0.6)' // 0% 处的颜色
              },
              {
                offset: 1,
                color: 'rgba(3,31,80,0.3)' // 100% 处的颜色
              }
            ]
          },
          borderColor: '#FFFC00',
          // 纹理贴花
          decal: {
            color: 'rgba(255,252,0,0.3)',
            dashArrayX: [1, 0],
            dashArrayY: [1, 3],
            symbolSize: 1,
            rotation: -Math.PI / 4
          }
        }
      }
    ]
  }
  // options 配置设置到chart上
  options && chart.setOption(options, true)

  // 渲染图形
  function getRenderItem(params, api) {
    /**
     * 注意：坐标轴左上角是原点（0, 0）
     * params 当前数据信息
     * api.value(0) 是index值（第一个维度的数值） 0 1 2 3 4 ...
     * api.value(1) 是value值（数据） 10 15 12 26 58 ...
     * api.coord 表示将 dataItem 中的数值转换成坐标系上的点
     * api.size 表示得到坐标系上一段数值范围对应的长度
     *  */
    const point = api.coord([api.value(0), api.value(1)]) // 左上角是原点，根据原点往右往下变大，点位是顶部中点 [x横坐标值, y纵坐标值]
    const height = api.size([0, api.value(1)])[1] // 得到坐标系上一段数值范围对应的长度
    const seriesIndex = params.seriesIndex // 系列index, series （从 0 开始）用于不同系列的间隔
    const seriesLength = 3

    return {
      type: 'group',
      children: [
        {
          type: 'rect',
          // 形状
          shape: {
            x: point[0] - 12 * seriesLength + seriesIndex * 24,
            y: point[1],
            width: 24,
            height: height
          },
          // 样式
          style: {
            fill: api.visual('color'),
            // 纹理贴花
            decal: api.visual('decal')
            // {
            //   color: 'rgba(0,252,255,0.3)',
            //   dashArrayX: [1, 0],
            //   dashArrayY: [1, 3],
            //   symbolSize: 1,
            //   rotation: -Math.PI / 4
            // }
          }
        },
        {
          type: 'rect',
          // 形状
          shape: {
            x: point[0] - 12 * seriesLength + seriesIndex * 24,
            y: point[1],
            width: 24,
            height: 2
          },
          // 样式
          style: {
            fill: api.visual('borderColor')
          }
        }
      ]
    }
  }
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

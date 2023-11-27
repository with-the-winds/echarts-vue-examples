<template>
  <div class="description">{{ description }}</div>
  <div class="bar-chart" ref="mul3DBarChartRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption, EChartsType } from 'echarts'
import { mulSeriesData } from '@/utils/baseData'
const legendRect10Img =
  'image://data:image/png;base64,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'
const legendRect12Img =
  'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAaCAYAAACtv5zzAAAAAXNSR0IArs4c6QAABWRJREFUSEuVVjtvXEUUPmdm7nN3vY69foQkWDYJUkA8BAUKSpEiHTQgkQYJfgF/wbFASBSIjjpSyoSODiGhUBAQUEY0RNgKMUn8yL73vmYO31w7RgmJA2Pt7vU9M9/5zne+mXuZnjJkjcxk+ZlnWOvzxPRBPV3oslj7bfLH5iavUXUYBD8pKFdIj6r5DlN0hh2Amd9kltkaX3gHXz+IQiLKrzfMvW2+QPZxWP9K8CgwE58hlg4Rm4cBpCLhbSG5fliigwT/HfhRnocnYgCH47wza3TyhoUUT2b81G4dVKQhXWiyH4m2djm/vPSu0+49YT7HBCnkUSmeBvyYioi3ROh7LXyVB58vX+M2z+uwOkEaPlEUwCXB/4Xdmw+5iEusFxb1Jzuzw71PTvdVFBtygx3VKu9xQxaUpmlSAgIUYeoTnbZPQvBbsJDFRZet2mKn5pmjaTap5cFnr+1KPkrIVUOAWtZcccPe5WmKlJZncc/ARRGYqX+q8pjk0K8cBKA93SKrK7Y8p+Bn0WHIQdqQYjLi3tqpDRaXgkGORfgRRya0lKakXK+HqjJOaIkMtRCtrQodK2g8xP64pZyOyKmUHKJMIelQKdNgqkaBq/IR9y+u3ACf/QQCt0eY1jCoypItCvTFsRan2m6o2voIG8UiQU/lVRPEkA0SemMICjIhcdBiKQYitogQQgUXV36CyDGSFKxxL25qyQYWE0Co3rUewXIQIkk7NDPArHoFWasRhCIQCBekIs1hU0k5tFTluKdCLM94sLryDf5L2IQVR1NK8j4mFM7j7q3Fn4k0BS0ADmzQAar2ZtnzSt0KHTMHIFYMHdnM1lURhyh1wt3V5a9MECcUtZwDc7K5xdID57CJ1X5VQM0lnEcHQvTb99lBojCGsacMFb2SSjBXD7wgASmTc//TFy+BeZMn3RGaUttjz9KeeaJVA4vH3bIqc2cMc7gIAO3jADeJoqhtKO9WNbF6HdiDOukopnDa8eCLs1/SeFdRmWUH2AKFwlSrZCZwk10wy5wnqwKQnRfWISaoplZxO3DZ/RKywEM1pb3KdaoQS13eG/Hg4+dXnbXYvVLVxWGtdxE3jgQyvl+4bOQUyvZ+Uca5cEExxQ2toiMBZffR7JFP7eNeM1S1Hyu64srRBE1e/gi6oCGqdNgpOkQzGzMRjbZyW4xRtqoVsShBxwlHx9CAJuLj7VxKWLmO+oHempahZCakbDunYgxIOLO/+tyH9bFgpeKkFejWXET9u5nNYTfR0BO1eckCVDV3Io3msG50e+Ksj+8L4/HhImosRDS8U5AbVX73oBcVEiy942vUyQxxeyGR7mYm4z4cA2be5eDu5eLmYiTDO3nSyayV4sAMnhklnYDSucgO7uRUYq3vCD9IcHHlrIpbKbeXYultZDLpltYZ1jgNPDHGYp49Fpd3NzLtuqXBs82Exp+6QhV4NBBvHYulvzmh4v4eeK0aThXWJffXXu9EKyfnxrdvxjzYQmY8LvxAAm52grBzMim2f5/IsFcGOMQDJKAUnxKfFsCbS4kMbo5pCKsqbH5WDi8ElWgzjBZfHfityPTdOb1+bd3MUtG0Gfa7gSGn5wK1eLrh7t0Yu92doq4mEhUu+CW4bh4NeP5UKohLjjiXLuKgpCwbUxgOqbFe+heBh876Otk5FPjWy9Hk1PmZyc1fKN7ZqCjEcbA/0qNKsqnlSM29lLq7v45sdzNvRBXs6jI6spnTBX921Pu8Hoe8tlzRdPUC0fHj4W41DtTslFJTqZo6vqTpxCsN+uvnAfVujmhj3b8XObwf7W2FR8bTnlb1dH800toLht5fa8PsTL9dGtLbX0/2TsPDx991xcv1kyzFnwAAAABJRU5ErkJggg=='
const legendRect15Img =
  'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAaCAYAAACtv5zzAAAAAXNSR0IArs4c6QAABSxJREFUSEuVVs9vG0UUfu/N7Kx/JTZ2kkLa0kqolx64orRQgeCExKFIcIQbN/4G/gGOnLgg9UjFP4A4AAdaCVWcegHEoXEiUsdxHdtZr3d2Ht+sU7UNTQMrrby7M/N9733vezNmOutStZTRJim9R0yfVNOVbuH5B6rTLjH7F0HwqYOqhma0BqCtCljpGn57xwRDPP9SESndoSbtg6h8Hta/CU4CEwgIRET2BECMfB/3nRcRPSH478AnA30hEZOqoyOkbukNKiuNT4v4rGo9ITKQztFdLDhgc6QfQryP8PL2KVKcBfy8jAb4+LMjus1XBpOfhs5tTK29ULCIMiXQNPm/qMfzvTAVVlVXhPubrEN+Z/dgbJiTIfP+jqsNDl1yrhDulMwGi1KQne60JariXlim0qk+6gkNzhnaWCHqtEk9v79zMMpUawXR1GMSsvAjl+ztuzTNRF4FGdzDKUDkRFYBzHnC5FOmbTSK7xlac6SmRpTUiZpzpim/1R8+QA0arJSj4ljDpQj7RIQeihzupOl8Zu0lEK0EimSVX0tEfLhCun3BUNoCmMVaw+QwJgCHb8h5pRlf3x7ehwhNZJpDDYX43BQ2yKpcBPVepFwwh4e12mScuK6xwudIxz2jTRSRQQTZyUAnjoUDOAM8FAp5mY5AsH8XXVjHhNxhcguFnmoIAK/SqQqALhWQ1BObJJ0GzUUK1hAlMwGRYS28TtIQlqOgIce7EDslzfhaf/h9JHbCRZPYzAIipxALF5Hj4lhp0xIx80jUWwkQH4pKBbwcD6bJZGZKWCtQPMTAQCAZb/WHt5FLc9VweRjI54geS6vEQaM1uGmFyR4qFQVDwm6LjDGVdeIVI28twX2M/LERIgFSzPndndE30Lw5UT3KAsCjJpU6iExEUMBkGqjISEtrhFy3CcqKQNNAZkUomWA8F+wD8YITot9coLSDb3xzb/TVo1Jl7jWPAwJRo7p1wKyK2HEIfl5qWY3hTrurUF4I1jRtGGpMMetj8OPw4xhm1acKm97YGX4BO1nw+siO6oQGi22zulHgvMoqljNW04qm3RY3QBzBD4kKOMbH4eiimFUD39FkDmMhI0KRd0afkwYH4OrgaJCYlyynQ6/znMoS1l12MgRwBpKtr0pHBOQhP0Lksd0fHwQotO1CxWGgHOCRseDr/f1P0SO2RAevMtsewB96j8WwIpXIJ0oG02uwm6mtJZ0W7YlkM5DHsYgTE0DUtmc4HZSazxAsGs74gBpsbe/fhDLStobXhWuDoPMJ+ovVxFJz6UvqYLtYT7h2wDIv2q2gxoTyKdmjXF0ytQGV8ykki3LFkoE58PXdgzebKvXzRhp/hyI7CIJtqUoPBJ57SWJfFqn3FyEbi/oaMrB2ebhBGu2Qd6+wre0oZWPyHpLFWkBXi8McgX6we7h2OeWNP+c+HRWeYRBBCNWG3RVJLhqpb+chG7GJOyYnbZQxSWLBdANP55kafYAfIHJEjIMc7RNdBQddTWkSTzT+7N49+3uvZyZp2kqp3tRSkg0r7nISmn/N/NGeCVVW2Dm5trmmeNHzC3KXHDX+wL42yGkhaHfIUqAsM0ydruP5Njr/2b0eZDjaZLxHtRtJ1v11nlHfBe/mUVKiOQ6SxsU1ugJDvQaf/wZwRJ6jgxcLDKPQix+jcuj4pzr68eOzv9/iT8DH+LTVB0WjkXhmRi1kw7Tt6y1qAnzyYBmtByh8wktPnbjOOq2W01Xl6n2yX16atk2rxd9Bgq/RRE9H+vwwif4BT69jJPex4C0AAAAASUVORK5CYII='
const description = `
功能：
1）tooltip 提示框组件是自定义的
2）dataZoom 组件鼠标左右滚动功能
3）在 type: 'bar' 下修改的属性：柱状图有背景、label显示
`

let chart: EChartsType | null = null
let options: EChartsOption = {}
const seriesColor = {
  入库数量: {
    leftColor: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 1, color: 'rgba(9, 145, 219,0)' },
      { offset: 0, color: '#0991DB' }
    ]),
    rightColor: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 1, color: 'rgba(31,172,250,0)' },
      { offset: 0, color: '#1FACFA' }
    ]),
    topColor: '#00B4FF'
  },
  销售数量: {
    leftColor: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 1, color: 'rgba(246,128,35,0)' },
      { offset: 0, color: '#F68023' }
    ]),
    rightColor: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 1, color: 'rgba(252,158,37,0)' },
      { offset: 0, color: '#FC9E25' }
    ]),
    topColor: '#F7A51E'
  },
  库存数量: {
    leftColor: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 1, color: 'rgba(59,230,239,0)' },
      { offset: 0, color: '#3BE6EF' }
    ]),
    rightColor: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 1, color: 'rgba(67,253,255,0)' },
      { offset: 0, color: '#43FDFF' }
    ]),
    topColor: '#00F6FF'
  }
}

const mul3DBarChartRef = ref()
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
  chart = echarts.init(mul3DBarChartRef.value)
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
      data: [
        {
          name: '入库数量',
          icon: legendRect10Img
        },
        {
          name: '销售数量',
          icon: legendRect12Img
        },
        {
          name: '库存数量',
          icon: legendRect15Img
        }
      ],
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
        maxValueSpan: 5,
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
        name: '背景',
        data: mulSeriesData[0].data,
        // @ts-ignore
        renderItem: (_params, api) => {
          const bgtPoint = api.coord([api.value(0), 0]) // 得到背景高度点位

          return {
            type: 'bgRect',
            shape: {
              x: bgtPoint[0], // 左上角x点位
              y: bgtPoint[1], // 左上角y点位
              width: 104
            },
            style: {
              fill: 'rgba(13, 25, 37,0.85)',
              // 纹理贴花
              decal: {
                color: '#212F40',
                dashArrayX: [1, 0],
                dashArrayY: [1, 3],
                symbolSize: 1,
                rotation: -Math.PI / 4
              }
            }
          }
        }
      },
      {
        type: 'custom',
        name: '入库数量',
        data: mulSeriesData[0].data,
        // @ts-ignore
        renderItem: (params, api) => {
          return getRenderItem(params, api)
        },
        itemStyle: {}
      },
      {
        type: 'custom',
        name: '销售数量',
        data: mulSeriesData[1].data,
        // @ts-ignore
        renderItem: (params, api) => {
          return getRenderItem(params, api)
        }
      },
      {
        type: 'custom',
        name: '库存数量',
        data: mulSeriesData[2].data,
        // @ts-ignore
        renderItem: (params, api) => {
          return getRenderItem(params, api)
        }
      }
    ]
  }

  // 定义柱状图左侧图形元素
  const leftRect = echarts.graphic.extendShape({
    buildPath: function (ctx, shape) {
      const p0 = [shape.x - shape.width, shape.y] // 左上点位
      const p1 = [shape.x - shape.width, shape.fullY] // 左下点位
      const p2 = [shape.x, shape.fullY] // 右下点位
      const p3 = [shape.x, shape.y + shape.zy] // 右上点位

      ctx.moveTo(p0[0], p0[1])
      ctx.lineTo(p1[0], p1[1])
      ctx.lineTo(p2[0], p2[1])
      ctx.lineTo(p3[0], p3[1])
      ctx.lineTo(p0[0], p0[1])
      ctx.closePath()
    }
  })

  // 定义柱状图右侧图形元素
  const rightRect = echarts.graphic.extendShape({
    buildPath: function (ctx, shape) {
      const p0 = [shape.x, shape.y + shape.zy] // 左上点位
      const p1 = [shape.x, shape.fullY] // 左下点位
      const p2 = [shape.x + shape.width, shape.fullY] // 右下点位
      const p3 = [shape.x + shape.width, shape.y] // 右上点位

      ctx.moveTo(p0[0], p0[1])
      ctx.lineTo(p1[0], p1[1])
      ctx.lineTo(p2[0], p2[1])
      ctx.lineTo(p3[0], p3[1])
      ctx.lineTo(p0[0], p0[1])
      ctx.closePath()
    }
  })

  // 定义柱状图顶部图形元素
  const topRect = echarts.graphic.extendShape({
    buildPath: function (ctx, shape) {
      const p0 = [shape.x, shape.y - shape.zy] // 上点位
      const p1 = [shape.x - shape.width / 2, shape.y] // 左点位
      const p2 = [shape.x, shape.y + shape.zy] // 下点位
      const p3 = [shape.x + shape.width / 2, shape.y] // 右点位

      ctx.moveTo(p0[0], p0[1])
      ctx.lineTo(p1[0], p1[1])
      ctx.lineTo(p2[0], p2[1])
      ctx.lineTo(p3[0], p3[1])
      ctx.lineTo(p0[0], p0[1])
      ctx.closePath()
    }
  })

  // 定义柱状图背景图形元素
  const bgRect = echarts.graphic.extendShape({
    buildPath: function (ctx, shape) {
      const p0 = [shape.x - shape.width / 2, 60] // 左上点位 根据grid.top的位置得到高
      const p1 = [shape.x - shape.width / 2, shape.y] // 左下点位
      const p2 = [shape.x + shape.width / 2, shape.y] // 右下点位
      const p3 = [shape.x + shape.width / 2, 60] // 右上点位 根据grid.top的位置得到高

      ctx.moveTo(p0[0], p0[1])
      ctx.lineTo(p1[0], p1[1])
      ctx.lineTo(p2[0], p2[1])
      ctx.lineTo(p3[0], p3[1])
      ctx.lineTo(p0[0], p0[1])
      ctx.closePath()
    }
  })

  // 注册图形元素
  echarts.graphic.registerShape('leftRect', leftRect)
  echarts.graphic.registerShape('rightRect', rightRect)
  echarts.graphic.registerShape('topRect', topRect)
  echarts.graphic.registerShape('bgRect', bgRect)
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
    const bgtPoint = api.coord([api.value(0), 0]) // 得到背景高度点位
    const seriesIndex = params.seriesIndex // 系列index, series （从 0 开始）用于不同系列的间隔
    const seriesIndexGap = (seriesIndex - 1) * 24 // 不同 series 系列的间隔(因为第一个永远是背景所以index要 - 1 开始)
    const seriesName = params.seriesName // 系列名称

    // const seriesLength = 3

    return {
      type: 'group',
      children: [
        {
          type: 'leftRect',
          shape: {
            width: 12, // 宽度
            x: point[0] + seriesIndexGap - 24, // x点位
            y: point[1], // y点位
            fullY: bgtPoint[1], // 整个图表的高度
            zy: 6 //右上点往下偏移高度
          },
          style: {
            fill: seriesColor[seriesName].leftColor
          }
        },
        {
          type: 'rightRect',
          shape: {
            width: 12, // 宽度
            x: point[0] + seriesIndexGap - 24, // x点位
            y: point[1], // y点位
            fullY: bgtPoint[1], // 整个图表的高度
            zy: 6 //右上点往下偏移高度
          },
          style: {
            fill: seriesColor[seriesName].rightColor
          }
        },
        {
          type: 'topRect',
          shape: {
            width: 24, // 宽度
            x: point[0] + seriesIndexGap - 24, // x点位
            y: point[1], // y点位
            zy: 6 //右上点往下偏移高度
          },
          style: {
            fill: seriesColor[seriesName].topColor
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
  border: 1px solid gray;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>

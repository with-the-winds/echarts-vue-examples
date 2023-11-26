<!--
 * @Author: zhubj | '' 
 * @Date: 2023-11-10 11:41:08
 * @LastEditors: zhubj | '' 
 * @LastEditTime: 2023-11-26 17:25:57
 * @FilePath: \echarts-vue-examples\src\views\004自定义多个立体柱状图\index.vue
 * @Description: 立杆平均完成时间
-->
<template>
  <el-form ref="formRef" :model="searchParam" :inline="true">
    <el-form-item label="组织机构 :">
      <el-tree-select
        v-model="searchParam.deptId"
        :data="deptList"
        :props="defaultProps"
        check-strictly
        node-key="id"
        placeholder="请选择组织机构"
        clearable
        @change="getDeviceOptions"
      />
    </el-form-item>
    <el-form-item label="设备编号 :">
      <el-select v-model="searchParam.code" placeholder="请选择" filterable>
        <el-option
          v-for="item in deviceCodeOptions"
          :key="item.id"
          :value="item.code"
          :label="item.code"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="日期 :">
      <el-date-picker
        v-model="searchDate"
        type="daterange"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        :teleported="false"
        format="YYYY-MM-DD"
        :default-time="defaultTime"
        value-format="YYYY-MM-DD"
        @change="changeDate"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="initChart"> 搜索 </el-button>
      <el-button type="info" @click="reset"> 重置 </el-button>
    </el-form-item>
  </el-form>

  <div class="echart-wrap">
    <div v-if="seriesData.length" ref="poleFinishedTimeRef" style="width: 100%; height: 100%"></div>
    <!-- <Echart :height="'100%'" :options="barOptionsData" /> -->
    <div v-else class="text-tip">暂无相关数据</div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption, EChartsType } from 'echarts'
import { poleFinishedTime } from '@/api/statistic/index'
import type { IfinishNums } from '@/api/statistic/index'
import { deviceByDeptId } from '@/api/equipment/list/index'
import { defaultProps } from '@/utils/tree'
import { defaultTime } from '@/utils/util'
import * as DeptApi from '@/api/system/dept'
import barImg from '@/assets/imgs/statistic/bar-bg.png'
const legendRect10Img =
  'image://data:image/png;base64,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'
const legendRect12Img =
  'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAaCAYAAACtv5zzAAAAAXNSR0IArs4c6QAABWRJREFUSEuVVjtvXEUUPmdm7nN3vY69foQkWDYJUkA8BAUKSpEiHTQgkQYJfgF/wbFASBSIjjpSyoSODiGhUBAQUEY0RNgKMUn8yL73vmYO31w7RgmJA2Pt7vU9M9/5zne+mXuZnjJkjcxk+ZlnWOvzxPRBPV3oslj7bfLH5iavUXUYBD8pKFdIj6r5DlN0hh2Amd9kltkaX3gHXz+IQiLKrzfMvW2+QPZxWP9K8CgwE58hlg4Rm4cBpCLhbSG5fliigwT/HfhRnocnYgCH47wza3TyhoUUT2b81G4dVKQhXWiyH4m2djm/vPSu0+49YT7HBCnkUSmeBvyYioi3ROh7LXyVB58vX+M2z+uwOkEaPlEUwCXB/4Xdmw+5iEusFxb1Jzuzw71PTvdVFBtygx3VKu9xQxaUpmlSAgIUYeoTnbZPQvBbsJDFRZet2mKn5pmjaTap5cFnr+1KPkrIVUOAWtZcccPe5WmKlJZncc/ARRGYqX+q8pjk0K8cBKA93SKrK7Y8p+Bn0WHIQdqQYjLi3tqpDRaXgkGORfgRRya0lKakXK+HqjJOaIkMtRCtrQodK2g8xP64pZyOyKmUHKJMIelQKdNgqkaBq/IR9y+u3ACf/QQCt0eY1jCoypItCvTFsRan2m6o2voIG8UiQU/lVRPEkA0SemMICjIhcdBiKQYitogQQgUXV36CyDGSFKxxL25qyQYWE0Co3rUewXIQIkk7NDPArHoFWasRhCIQCBekIs1hU0k5tFTluKdCLM94sLryDf5L2IQVR1NK8j4mFM7j7q3Fn4k0BS0ADmzQAar2ZtnzSt0KHTMHIFYMHdnM1lURhyh1wt3V5a9MECcUtZwDc7K5xdID57CJ1X5VQM0lnEcHQvTb99lBojCGsacMFb2SSjBXD7wgASmTc//TFy+BeZMn3RGaUttjz9KeeaJVA4vH3bIqc2cMc7gIAO3jADeJoqhtKO9WNbF6HdiDOukopnDa8eCLs1/SeFdRmWUH2AKFwlSrZCZwk10wy5wnqwKQnRfWISaoplZxO3DZ/RKywEM1pb3KdaoQS13eG/Hg4+dXnbXYvVLVxWGtdxE3jgQyvl+4bOQUyvZ+Uca5cEExxQ2toiMBZffR7JFP7eNeM1S1Hyu64srRBE1e/gi6oCGqdNgpOkQzGzMRjbZyW4xRtqoVsShBxwlHx9CAJuLj7VxKWLmO+oHempahZCakbDunYgxIOLO/+tyH9bFgpeKkFejWXET9u5nNYTfR0BO1eckCVDV3Io3msG50e+Ksj+8L4/HhImosRDS8U5AbVX73oBcVEiy942vUyQxxeyGR7mYm4z4cA2be5eDu5eLmYiTDO3nSyayV4sAMnhklnYDSucgO7uRUYq3vCD9IcHHlrIpbKbeXYultZDLpltYZ1jgNPDHGYp49Fpd3NzLtuqXBs82Exp+6QhV4NBBvHYulvzmh4v4eeK0aThXWJffXXu9EKyfnxrdvxjzYQmY8LvxAAm52grBzMim2f5/IsFcGOMQDJKAUnxKfFsCbS4kMbo5pCKsqbH5WDi8ElWgzjBZfHfityPTdOb1+bd3MUtG0Gfa7gSGn5wK1eLrh7t0Yu92doq4mEhUu+CW4bh4NeP5UKohLjjiXLuKgpCwbUxgOqbFe+heBh876Otk5FPjWy9Hk1PmZyc1fKN7ZqCjEcbA/0qNKsqnlSM29lLq7v45sdzNvRBXs6jI6spnTBX921Pu8Hoe8tlzRdPUC0fHj4W41DtTslFJTqZo6vqTpxCsN+uvnAfVujmhj3b8XObwf7W2FR8bTnlb1dH800toLht5fa8PsTL9dGtLbX0/2TsPDx991xcv1kyzFnwAAAABJRU5ErkJggg=='
const legendRect15Img =
  'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAaCAYAAACtv5zzAAAAAXNSR0IArs4c6QAABSxJREFUSEuVVs9vG0UUfu/N7Kx/JTZ2kkLa0kqolx64orRQgeCExKFIcIQbN/4G/gGOnLgg9UjFP4A4AAdaCVWcegHEoXEiUsdxHdtZr3d2Ht+sU7UNTQMrrby7M/N9733vezNmOutStZTRJim9R0yfVNOVbuH5B6rTLjH7F0HwqYOqhma0BqCtCljpGn57xwRDPP9SESndoSbtg6h8Hta/CU4CEwgIRET2BECMfB/3nRcRPSH478AnA30hEZOqoyOkbukNKiuNT4v4rGo9ITKQztFdLDhgc6QfQryP8PL2KVKcBfy8jAb4+LMjus1XBpOfhs5tTK29ULCIMiXQNPm/qMfzvTAVVlVXhPubrEN+Z/dgbJiTIfP+jqsNDl1yrhDulMwGi1KQne60JariXlim0qk+6gkNzhnaWCHqtEk9v79zMMpUawXR1GMSsvAjl+ztuzTNRF4FGdzDKUDkRFYBzHnC5FOmbTSK7xlac6SmRpTUiZpzpim/1R8+QA0arJSj4ljDpQj7RIQeihzupOl8Zu0lEK0EimSVX0tEfLhCun3BUNoCmMVaw+QwJgCHb8h5pRlf3x7ehwhNZJpDDYX43BQ2yKpcBPVepFwwh4e12mScuK6xwudIxz2jTRSRQQTZyUAnjoUDOAM8FAp5mY5AsH8XXVjHhNxhcguFnmoIAK/SqQqALhWQ1BObJJ0GzUUK1hAlMwGRYS28TtIQlqOgIce7EDslzfhaf/h9JHbCRZPYzAIipxALF5Hj4lhp0xIx80jUWwkQH4pKBbwcD6bJZGZKWCtQPMTAQCAZb/WHt5FLc9VweRjI54geS6vEQaM1uGmFyR4qFQVDwm6LjDGVdeIVI28twX2M/LERIgFSzPndndE30Lw5UT3KAsCjJpU6iExEUMBkGqjISEtrhFy3CcqKQNNAZkUomWA8F+wD8YITot9coLSDb3xzb/TVo1Jl7jWPAwJRo7p1wKyK2HEIfl5qWY3hTrurUF4I1jRtGGpMMetj8OPw4xhm1acKm97YGX4BO1nw+siO6oQGi22zulHgvMoqljNW04qm3RY3QBzBD4kKOMbH4eiimFUD39FkDmMhI0KRd0afkwYH4OrgaJCYlyynQ6/znMoS1l12MgRwBpKtr0pHBOQhP0Lksd0fHwQotO1CxWGgHOCRseDr/f1P0SO2RAevMtsewB96j8WwIpXIJ0oG02uwm6mtJZ0W7YlkM5DHsYgTE0DUtmc4HZSazxAsGs74gBpsbe/fhDLStobXhWuDoPMJ+ovVxFJz6UvqYLtYT7h2wDIv2q2gxoTyKdmjXF0ytQGV8ykki3LFkoE58PXdgzebKvXzRhp/hyI7CIJtqUoPBJ57SWJfFqn3FyEbi/oaMrB2ebhBGu2Qd6+wre0oZWPyHpLFWkBXi8McgX6we7h2OeWNP+c+HRWeYRBBCNWG3RVJLhqpb+chG7GJOyYnbZQxSWLBdANP55kafYAfIHJEjIMc7RNdBQddTWkSTzT+7N49+3uvZyZp2kqp3tRSkg0r7nISmn/N/NGeCVVW2Dm5trmmeNHzC3KXHDX+wL42yGkhaHfIUqAsM0ydruP5Njr/2b0eZDjaZLxHtRtJ1v11nlHfBe/mUVKiOQ6SxsU1ugJDvQaf/wZwRJ6jgxcLDKPQix+jcuj4pzr68eOzv9/iT8DH+LTVB0WjkXhmRi1kw7Tt6y1qAnzyYBmtByh8wktPnbjOOq2W01Xl6n2yX16atk2rxd9Bgq/RRE9H+vwwif4BT69jJPex4C0AAAAASUVORK5CYII='

defineOptions({ name: 'PoleFinishedTime' })

const searchParam = ref<IfinishNums>({
  code: undefined,
  deptId: undefined,
  startTime: undefined,
  endTime: undefined
})

const searchDate = ref('')

const deviceCodeOptions = ref<any[]>([])
const deptList = ref<Tree[]>([]) // 树形结构
// 获取精简组织机构
const getDeptOptions = async () => {
  deptList.value = await DeptApi.getSimpleDeptList()
}

// 根据组织机构获取设备列表（不传查当前权限的所有设备）
const getDeviceOptions = async () => {
  searchParam.value.code = undefined
  deviceCodeOptions.value = await deviceByDeptId({ deptId: searchParam.value.deptId })
}

// 改变日期
const changeDate = () => {
  searchParam.value.startTime = searchDate.value && searchDate.value[0]
  searchParam.value.endTime = searchDate.value && searchDate.value[1]
}

// 重置搜索框
const reset = () => {
  searchParam.value = {
    code: undefined,
    deptId: undefined,
    startTime: undefined,
    endTime: undefined
  }
  searchDate.value = ''
  initChart()
}

const poleFinishedTimeRef = ref()

let chart: EChartsType | null = null
let options: EChartsOption = {}
const seriesData = ref<any[]>([])

const initChart = async () => {
  if (chart) {
    chart.dispose()
    chart = null
  }
  seriesData.value = await poleFinishedTime(searchParam.value)
  // seriesData.value = [
  //   {
  //     deviceCode: 'XH002',
  //     list: [
  //       {
  //         towerTypeName: '10米杆',
  //         house: 10
  //       },
  //       {
  //         towerTypeName: '12米杆',
  //         house: 0
  //       },
  //       {
  //         towerTypeName: '15米杆',
  //         house: 20
  //       }
  //     ]
  //   },
  //   {
  //     deviceCode: 'XH003',
  //     list: [
  //       {
  //         towerTypeName: '10米杆',
  //         house: 12
  //       },
  //       {
  //         towerTypeName: '12米杆',
  //         house: 14
  //       },
  //       {
  //         towerTypeName: '15米杆',
  //         house: 19
  //       }
  //     ]
  //   },
  //   {
  //     deviceCode: 'XH004',
  //     list: [
  //       {
  //         towerTypeName: '10米杆',
  //         house: 15
  //       },
  //       {
  //         towerTypeName: '12米杆',
  //         house: 17
  //       },
  //       {
  //         towerTypeName: '15米杆',
  //         house: 11
  //       }
  //     ]
  //   }
  // ]
  // 10米杆
  const series10Data: any = []
  // 12米杆
  const series12Data: any = []
  // 15米杆
  const series15Data: any = []
  // x轴坐标
  const seriesLable: any = []
  // 背景
  let bgSeries: any = []
  let maxNum = 0

  if (seriesData.value.length) {
    seriesData.value.forEach((item) => {
      seriesLable.push(item.deviceCode)
      item.list.forEach((subitem) => {
        if (subitem.towerTypeName == '10米杆') {
          series10Data.push(subitem.house)
        } else if (subitem.towerTypeName == '12米杆') {
          series12Data.push(subitem.house)
        } else if (subitem.towerTypeName == '15米杆') {
          series15Data.push(subitem.house)
        }
      })
    })
    maxNum = Math.max.apply(null, [
      Math.max.apply(null, series10Data),
      Math.max.apply(null, series12Data),
      Math.max.apply(null, series15Data)
    ])
    bgSeries = new Array(seriesData.value.length).fill(maxNum + 2)
  }

  await nextTick()
  if (!seriesData.value.length) return
  chart = echarts.init(poleFinishedTimeRef.value)

  options = {
    dataZoom: [
      {
        type: 'inside',
        maxValueSpan: 12,
        filterMode: 'none',
        zoomOnMouseWheel: false, // 如何触发缩放
        moveOnMouseMove: true, // 如何触发数据窗口平移（鼠标移动）
        moveOnMouseWheel: false // 如何触发数据窗口平移(鼠标滚轮)
      }
    ],
    title: {
      text: '',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        const htmlStr = `
          <span>${params[0].name}</span>
          <br />
          <div style="display: flex; justify-content: flex-start; align-items: center;">
            <div style="width: 8px;height: 8px;background: #00B4FF;margin-right: 6px;"></div>
            <span style="padding-right: 6px;">${params[1].seriesName}</span>
            <span>${params[1].value || 0}h</span>
          </div>
          <div style="display: flex; justify-content: flex-start; align-items: center;">
            <div style="width: 8px;height: 8px;background: #F7A51E;margin-right: 6px;"></div>
            <span style="padding-right: 6px;">${params[2].seriesName}</span>
            <span>${params[2].value || 0}h</span>
          </div>
          <div style="display: flex; justify-content: flex-start; align-items: center;">
            <div style="width: 8px;height: 8px;background: #00F6FF;margin-right: 6px;"></div>
            <span style="padding-right: 6px;">${params[3].seriesName}</span>
            <span>${params[3].value || 0}h</span>
          </div>
        `
        return htmlStr
      }
    },
    grid: {
      top: 60,
      left: 40,
      right: 10,
      bottom: 30
    },
    xAxis: {
      type: 'category',
      data: seriesLable,
      boundaryGap: true, // 两边留白策略
      // 坐标轴线
      axisLine: {
        show: true,
        lineStyle: {
          color: '#FFFFFF',
          opacity: 0.4,
          width: 1,
          type: 'solid'
        }
      },
      // 坐标轴刻度
      axisTick: {
        show: false
      },
      // 坐标轴刻度标签
      axisLabel: {
        show: true,
        interval: 0, // 坐标轴刻度标签的显示间隔，在类目轴中有效, 设置成 0 强制显示所有标签
        color: '#FFFFFF',
        fontWeight: 400,
        fontFamily: 'SourceHanSansCN-Regular',
        fontSize: 12,
        margin: 12
      },
      // 分隔线
      splitLine: {
        show: false,
        lineStyle: {
          color: '#FFFFFF',
          width: 1,
          opacity: 0.15,
          type: 'dashed'
        }
      }
    },
    // 图例组件
    legend: {
      show: true,
      textStyle: {
        color: '#FFF'
      },
      itemGap: 20,
      itemWidth: 16,
      itemHeight: 18,
      data: [
        { name: '10米杆', icon: legendRect10Img },
        { name: '12米杆', icon: legendRect12Img },
        { name: '15米杆', icon: legendRect15Img }
      ],
      top: 20
    },
    yAxis: {
      type: 'value',
      // max: function(value) {
      //   const mid = value.max / 4 < 1 ? 1 : parseInt((value.max / 4).toString())

      //   return value.max + mid
      // },
      // 坐标轴名称和样式
      name: '(单位/h)',
      minInterval: 1,
      nameTextStyle: {
        padding: [0, 8, 0, 0],
        fontSize: 12,
        fontFamily: 'SourceHanSansCN-Regular',
        color: '#8F9297',
        fontWeight: 400
      },
      // 坐标轴线
      axisLine: {
        show: true,
        lineStyle: {
          color: '#FFFFFF',
          opacity: 0.14,
          width: 1
        }
      },
      // 坐标轴刻度
      axisTick: {
        show: false
      },
      // 坐标轴刻度标签
      axisLabel: {
        show: true,
        interval: 0, // 坐标轴刻度标签的显示间隔，在类目轴中有效, 设置成 0 强制显示所有标签
        color: '#8F9297',
        fontSize: 12,
        fontWeight: 400,
        fontFamily: 'SourceHanSansCN-Regular'
      },
      // 分隔线
      splitLine: {
        show: true,
        lineStyle: {
          color: '#FFFFFF',
          width: 1,
          opacity: 0.15,
          type: 'dashed'
        }
      }
    },
    series: [
      {
        data: bgSeries,
        type: 'custom',
        name: '背景',
        // @ts-ignore
        renderItem: function (params, api) {
          const location = api.coord([api.value(0), api.value(1)])

          return {
            type: 'bgRect',
            shape: {
              api,
              xValue: api.value(0),
              yValue: api.value(1),
              x: location[0],
              y: location[1]
            },
            style: {
              fill: api.visual('color')
            }
          }
        },
        itemStyle: {
          color: {
            image: barImg,
            repeat: 'repeat',
            scaleX: 1.5,
            scaleY: 1.5
          }
        }
      },
      {
        data: series10Data,
        type: 'custom',
        name: '10米杆',
        // @ts-ignore
        renderItem: function (params, api) {
          return getRenderItem(params, api)
        },
        itemStyle: {
          color: 'transParent'
        }
      },
      {
        data: series12Data,
        type: 'custom',
        name: '12米杆',
        // @ts-ignore
        renderItem: function (params, api) {
          return getRenderItem(params, api)
        },
        itemStyle: {
          color: 'transParent'
        }
      },
      {
        data: series15Data,
        type: 'custom',
        name: '15米杆',
        // @ts-ignore
        renderItem: function (params, api) {
          return getRenderItem(params, api)
        },
        itemStyle: {
          color: 'transParent'
        }
      }
    ]
  }

  // 定义柱状图左侧图形元素
  const leftRect = echarts.graphic.extendShape({
    shape: {
      x: 0,
      y: 0,
      width: 12, // 柱状图宽
      zHeight: 6, // 高度偏移
      zwidth10: 44, // 10米柱离中心点偏移(最左侧)
      zwidth12: 12, // 12米柱离中心点偏移(最左侧)
      zwidth15: 20 // 15米柱离中心点偏移(最左侧)
    },
    buildPath: function (ctx, shape) {
      const api = shape.api
      const xAxisPoint = api.coord([shape.xValue, 0]) // 根据列表中index的值转化为坐标点
      if (shape.name == '10米杆') {
        const p0 = [shape.x - shape.zwidth10, shape.y] // 左上点位
        const p1 = [shape.x - shape.zwidth10, xAxisPoint[1]] // 左下点位
        const p2 = [shape.x - shape.zwidth10 + shape.width, xAxisPoint[1]] // 右下点位
        const p3 = [shape.x - shape.zwidth10 + shape.width, shape.y + shape.zHeight] // 右上点位

        ctx.moveTo(p0[0], p0[1])
        ctx.lineTo(p1[0], p1[1])
        ctx.lineTo(p2[0], p2[1])
        ctx.lineTo(p3[0], p3[1])
        ctx.lineTo(p0[0], p0[1])
        ctx.closePath()
      } else if (shape.name == '12米杆') {
        const p0 = [shape.x - shape.zwidth12, shape.y] // 左上点位
        const p1 = [shape.x - shape.zwidth12, xAxisPoint[1]] // 左下点位
        const p2 = [shape.x - shape.zwidth12 + shape.width, xAxisPoint[1]] // 右下点位
        const p3 = [shape.x - shape.zwidth12 + shape.width, shape.y + shape.zHeight] // 右上点位

        ctx.moveTo(p0[0], p0[1])
        ctx.lineTo(p1[0], p1[1])
        ctx.lineTo(p2[0], p2[1])
        ctx.lineTo(p3[0], p3[1])
        ctx.lineTo(p0[0], p0[1])
        ctx.closePath()
      } else if (shape.name == '15米杆') {
        const p0 = [shape.x + shape.zwidth15, shape.y] // 左上点位
        const p1 = [shape.x + shape.zwidth15, xAxisPoint[1]] // 左下点位
        const p2 = [shape.x + shape.zwidth15 + shape.width, xAxisPoint[1]] // 右下点位
        const p3 = [shape.x + shape.zwidth15 + shape.width, shape.y + shape.zHeight] // 右上点位

        ctx.moveTo(p0[0], p0[1])
        ctx.lineTo(p1[0], p1[1])
        ctx.lineTo(p2[0], p2[1])
        ctx.lineTo(p3[0], p3[1])
        ctx.lineTo(p0[0], p0[1])
        ctx.closePath()
      }
    }
  })

  // 定义柱状图右侧图形元素
  const rightRect = echarts.graphic.extendShape({
    shape: {
      x: 0,
      y: 0,
      width: 12, // 柱状图宽
      zHeight: 6, // 高度偏移
      zwidth10: 32, // 10米柱离中心点偏移(最左侧)
      zwidth12: 0, // 12米柱离中心点偏移(最左侧)
      zwidth15: 32 // 15米柱离中心点偏移(最左侧)
    },
    buildPath: function (ctx, shape) {
      const api = shape.api
      const xAxisPoint = api.coord([shape.xValue, 0]) // 坐标点
      if (shape.name == '10米杆') {
        const p0 = [shape.x - shape.zwidth10, shape.y + shape.zHeight] // 左上点位
        const p1 = [shape.x - shape.zwidth10, xAxisPoint[1]] // 左下点位
        const p2 = [shape.x - shape.zwidth10 + shape.width, xAxisPoint[1]] // 右下点位
        const p3 = [shape.x - shape.zwidth10 + shape.width, shape.y] // 右上点位

        ctx.moveTo(p0[0], p0[1])
        ctx.lineTo(p1[0], p1[1])
        ctx.lineTo(p2[0], p2[1])
        ctx.lineTo(p3[0], p3[1])
        ctx.lineTo(p0[0], p0[1])
        ctx.closePath()
      } else if (shape.name == '12米杆') {
        const p0 = [shape.x - shape.zwidth12, shape.y + shape.zHeight] // 左上点位
        const p1 = [shape.x - shape.zwidth12, xAxisPoint[1]] // 左下点位
        const p2 = [shape.x - shape.zwidth12 + shape.width, xAxisPoint[1]] // 右下点位
        const p3 = [shape.x - shape.zwidth12 + shape.width, shape.y] // 右上点位

        ctx.moveTo(p0[0], p0[1])
        ctx.lineTo(p1[0], p1[1])
        ctx.lineTo(p2[0], p2[1])
        ctx.lineTo(p3[0], p3[1])
        ctx.lineTo(p0[0], p0[1])
        ctx.closePath()
      } else if (shape.name == '15米杆') {
        const p0 = [shape.x + shape.zwidth15, shape.y + shape.zHeight] // 左上点位
        const p1 = [shape.x + shape.zwidth15, xAxisPoint[1]] // 左下点位
        const p2 = [shape.x + shape.zwidth15 + shape.width, xAxisPoint[1]] // 右下点位
        const p3 = [shape.x + shape.zwidth15 + shape.width, shape.y] // 右上点位
        ctx.moveTo(p0[0], p0[1])
        ctx.lineTo(p1[0], p1[1])
        ctx.lineTo(p2[0], p2[1])
        ctx.lineTo(p3[0], p3[1])
        ctx.lineTo(p0[0], p0[1])
        ctx.closePath()
      }
    }
  })

  // 定义柱状图顶部图形元素
  const topRect = echarts.graphic.extendShape({
    shape: {
      x: 0,
      y: 0,
      width: 24, // 宽度
      zTopHeight: 6, // 离上面偏移高度
      zBottomHeight: 6, // 离下面偏移高度
      zwidth10: 44, // 10米柱离中心点偏移(最左侧)
      zwidth12: 12, // 12米柱离中心点偏移(最左侧)
      zwidth15: 20 // 15米柱离中心点偏移(最左侧)
    },
    buildPath: function (ctx, shape) {
      if (shape.name == '10米杆') {
        const p0 = [shape.x - shape.zwidth10, shape.y] // 左上点位
        const p1 = [shape.x - shape.zwidth10 + shape.width / 2, shape.y + shape.zBottomHeight] // 左下点位
        const p2 = [shape.x - shape.zwidth10 + shape.width, shape.y] // 右下点位
        const p3 = [shape.x - shape.zwidth10 + shape.width / 2, shape.y - shape.zTopHeight] // 右上点位

        ctx.moveTo(p0[0], p0[1])
        ctx.lineTo(p1[0], p1[1])
        ctx.lineTo(p2[0], p2[1])
        ctx.lineTo(p3[0], p3[1])
        ctx.lineTo(p0[0], p0[1])
        ctx.closePath()
      } else if (shape.name == '12米杆') {
        const p0 = [shape.x - shape.zwidth12, shape.y] // 左上点位
        const p1 = [shape.x - shape.zwidth12 + shape.width / 2, shape.y + shape.zBottomHeight] // 左下点位
        const p2 = [shape.x - shape.zwidth12 + shape.width, shape.y] // 右下点位
        const p3 = [shape.x - shape.zwidth12 + shape.width / 2, shape.y - shape.zTopHeight] // 右上点位

        ctx.moveTo(p0[0], p0[1])
        ctx.lineTo(p1[0], p1[1])
        ctx.lineTo(p2[0], p2[1])
        ctx.lineTo(p3[0], p3[1])
        ctx.lineTo(p0[0], p0[1])
        ctx.closePath()
      } else if (shape.name == '15米杆') {
        const p0 = [shape.x + shape.zwidth15, shape.y] // 左上点位
        const p1 = [shape.x + shape.zwidth15 + shape.width / 2, shape.y + shape.zBottomHeight] // 左下点位
        const p2 = [shape.x + shape.zwidth15 + shape.width, shape.y] // 右下点位
        const p3 = [shape.x + shape.zwidth15 + shape.width / 2, shape.y - shape.zTopHeight] // 右上点位

        ctx.moveTo(p0[0], p0[1])
        ctx.lineTo(p1[0], p1[1])
        ctx.lineTo(p2[0], p2[1])
        ctx.lineTo(p3[0], p3[1])
        ctx.lineTo(p0[0], p0[1])
        ctx.closePath()
      }
    }
  })

  // 定义柱状图背景图形元素
  const bgRect = echarts.graphic.extendShape({
    shape: {
      x: 0,
      y: 0,
      width: 104
    },
    buildPath: function (ctx, shape) {
      const api = shape.api
      const xAxisPoint = api.coord([shape.xValue, 0]) // 坐标点

      const p0 = [shape.x - shape.width / 2, 60] // 左上点位 根据grid.top的位置得到高
      const p1 = [shape.x - shape.width / 2, xAxisPoint[1]] // 左下点位
      const p2 = [shape.x + shape.width / 2, xAxisPoint[1]] // 右下点位
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

  // 渲染图形
  function getRenderItem(params, api) {
    const location = api.coord([api.value(0), api.value(1)])
    if (api.value(1) != 0) {
      return {
        type: 'group',
        children: [
          {
            type: 'bgRect',
            shape: {
              api,
              xValue: api.value(0),
              yValue: api.value(1),
              x: location[0],
              y: location[1]
            },
            style: {
              fill: api.visual('color')
            }
          },
          {
            type: 'leftRect',
            shape: {
              api,
              xValue: api.value(0), // index值
              yValue: api.value(1), // data值
              x: location[0], // x像素
              y: location[1], // y像素
              name: params.seriesName
            },
            style: {
              fill:
                params.seriesName == '10米杆'
                  ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 1, color: 'rgba(9, 145, 219,0)' },
                      { offset: 0, color: '#0991DB' }
                    ])
                  : params.seriesName == '12米杆'
                    ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 1, color: 'rgba(246,128,35,0)' },
                        { offset: 0, color: '#F68023' }
                      ])
                    : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 1, color: 'rgba(59,230,239,0)' },
                        { offset: 0, color: '#3BE6EF' }
                      ])
            }
          },
          {
            type: 'rightRect',
            shape: {
              api,
              xValue: api.value(0),
              yValue: api.value(1),
              x: location[0],
              y: location[1],
              name: params.seriesName
            },
            style: {
              fill:
                params.seriesName == '10米杆'
                  ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 1, color: 'rgba(31,172,250,0)' },
                      { offset: 0, color: '#1FACFA' }
                    ])
                  : params.seriesName == '12米杆'
                    ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 1, color: 'rgba(252,158,37,0)' },
                        { offset: 0, color: '#FC9E25' }
                      ])
                    : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 1, color: 'rgba(67,253,255,0)' },
                        { offset: 0, color: '#43FDFF' }
                      ])
            }
          },
          {
            type: 'topRect',
            shape: {
              api,
              xValue: api.value(0),
              yValue: api.value(1),
              x: location[0],
              y: location[1],
              name: params.seriesName
            },
            style: {
              fill:
                params.seriesName == '10米杆'
                  ? '#00B4FF'
                  : params.seriesName == '12米杆'
                    ? '#F7A51E'
                    : '#00F6FF'
            }
          }
        ]
      }
    }
  }

  options && chart.setOption(options, true)
}

onMounted(() => {
  getDeviceOptions()
  getDeptOptions()
  initChart()
})
</script>

<style lang="scss" scoped>
.echart-wrap {
  width: 100%;
  height: 710px;
  position: relative;
  .text-tip {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>

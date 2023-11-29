<template>
  <div class="description">{{ description }}</div>
  <div class="map-wrap">
    <!-- 左上角文字 -->
    <div class="administrative-list">
      <span v-for="item in administrativeList" @click="handleTitle(item.name, item.level)">
        {{ item.name }}
      </span>
    </div>
    <div ref="mapChartRef" class="map-chart"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption, EChartsType } from 'echarts'
import mapIcon from '@/assets/example008/map-position.png'

const description = `
功能：
1）通过json文件配合echarts实现地图
2）实现点击地图下转的功能
3）配合 scatter 散点图显示icon
4）修改tooltop 显示的样式
5）注意直辖市没有下转功能
`

let chart: EChartsType | null = null
let options: EChartsOption = {}
let administrativeLevel = 'county' // 当前的行政区等级，用于双击下转时快速查到地图边界JSON和对应的子地区
let administrativeList = ref<{ name: string; level: string }[]>([{ name: '中国', level: 'county' }]) // 用于展示左上角的列表
let zhixiashi = ['北京市', '天津市', '上海市', '重庆市'] // 直辖市没有地级市
let provinceList: any = [] // 省、州、自治区列表
let cityList = [] // 地级市列表
let mapJson: any = null // 地图边界

/**
 * 获取当前的geoJson文件
 * @param {*} isTitle 用于判断是点击左上角标题渲染还是下转渲染
 * @param {*} name 下转时传递的name值
 */
const getGeoJson = async (isTitle?: boolean, name?: string) => {
  if (administrativeLevel == 'county') {
    mapJson = await import('@/assets/example008/geoJson/100000_full.json')
    provinceList = (await import('@/assets/example008/geoJson/100000_province.json')).rows
    administrativeList.value = [{ name: '中国', level: 'county' }]
    initChart()
  } else if (administrativeLevel == 'province') {
    let provinceCode = null
    for (let item of provinceList) {
      if (item.name == name) {
        provinceCode = item.adcode
        if (isTitle) {
          const tempList: { name: string; level: string }[] = []
          for (let listInfo of administrativeList.value) {
            tempList.push(listInfo)
            if (listInfo.name == name) {
              break
            }
          }
          administrativeList.value = tempList
        } else {
          administrativeList.value.push({ name: name as string, level: 'province' })
        }
        break
      }
    }

    const mapModules = await import.meta.glob('@/assets/example008/geoJson/city/city/*.json')
    const cityModules = await import.meta.glob('@/assets/example008/geoJson/city/*.json')

    const mapPath = `/src/assets/example008/geoJson/city/city/${provinceCode}_full.json`
    const cityPath = `/src/assets/example008/geoJson/city/${provinceCode}_city.json`

    mapJson = await mapModules[mapPath]()
    cityList = (await cityModules[cityPath]()).rows

    initChart()
  } else {
    let provinceCode = null
    for (let item of cityList) {
      if (item.name == name) {
        provinceCode = item.adcode
        administrativeList.value.push({ name: name as string, level: 'city' })
        break
      }
    }
    const mapModules = await import.meta.glob('@/assets/example008/geoJson/city/city/*.json')
    const mapPath = `/src/assets/example008/geoJson/city/city/${provinceCode}_full.json`
    mapJson = await mapModules[mapPath]()
    initChart()
  }
}
/**
 * 点击左上角标题
 * @param {*} name 省/市名称
 * @param {*} level 行政区等级
 */
const handleTitle = (name: string, level: string) => {
  if (level == 'county' && administrativeLevel !== 'county') {
    administrativeLevel = 'county'
    getGeoJson(true)
  } else if (level === 'province' && administrativeLevel !== 'province') {
    administrativeLevel = 'province'
    getGeoJson(true, name)
  }
}

const mapChartRef = ref()
const initChart = async () => {
  // 坐标点位置的数据
  const seriesData = [{ name: '某个不知名基地', value: [108.344051, 29.776673] }]

  if (chart) {
    chart.dispose()
    chart = null
  }
  echarts.registerMap('China', mapJson)
  chart = echarts.init(mapChartRef.value)

  options = {
    tooltip: {
      show: true,
      className: 'map-tooltip'
    },
    geo: [
      {
        map: 'China',
        aspectScale: 0.75, // 长宽比
        zoom: 1.2, // 当前视角的缩放比例
        roam: false, // 是否开启鼠标缩放和平移，false关闭，true开启，scale缩放，move平移
        itemStyle: {
          areaColor: '#03092B',
          borderColor: '#03092B',
          borderWidth: 1,
          shadowColor: '#000',
          opacity: 1,
          shadowOffsetX: 0,
          shadowOffsetY: 20
          // shadowBlur: 20
        },
        z: 999
      },
      {
        map: 'China',
        aspectScale: 0.75, // 长宽比
        zoom: 1.2, // 当前视角的缩放比例
        roam: false, // 是否开启鼠标缩放和平移，false关闭，true开启，scale缩放，move平移
        itemStyle: {
          areaColor: '#0D245F',
          borderColor: '#0D245F',
          borderWidth: 1,
          shadowColor: '#0D245F',
          opacity: 1,
          shadowOffsetX: 0,
          shadowOffsetY: 10
          // shadowBlur: 20
        },
        z: 1000
      },
      {
        map: 'China',
        aspectScale: 0.75, // 长宽比
        zoom: 1.2,
        roam: false,
        itemStyle: {
          areaColor: '#03092B',
          borderColor: '#9FB5DE',
          borderWidth: 1.5,
          shadowColor: '#0D245F',
          shadowOffsetX: 0,
          shadowOffsetY: 20,
          shadowBlur: 50
        },
        z: 9999
      }
    ],
    series: [
      {
        tooltip: {
          show: true,
          trigger: 'item',
          formatter: (e) => {
            const contentHtmlDom = `
                <div>
                  <div class="last-node">内容：${e.data.name}<div>
                </div>
                `
            return contentHtmlDom
          },
          extraCssText: 'tooltip-label',
          position: 'top'
        },
        type: 'scatter',
        coordinateSystem: 'geo', // 改系列使用的坐标系
        itemStyle: {
          color: 'fff'
        },
        symbol: 'image://' + mapIcon,
        symbolSize: [24, 26],
        z: 9999,
        data: seriesData
      }
    ]
  }

  // 把配置项挂载在图表上
  chart.setOption(options, true)

  // 双击下转
  chart.on('dblclick', (params) => {
    if (params.componentType != 'geo') return
    if (administrativeLevel == 'county') {
      administrativeLevel = 'province'
      getGeoJson(false, params.name)
    } else if (
      administrativeLevel == 'province' &&
      !zhixiashi.includes(administrativeList.value[1].name)
    ) {
      // 直辖市不用下转
      administrativeLevel = 'city'
      getGeoJson(false, params.name)
    }
  })
}

onMounted(() => {
  nextTick(() => {
    getGeoJson()
  })
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
.map-wrap {
  width: 800px;
  height: 600px;
  margin: 10px;
  border: 1px solid gray;
  position: relative;
  .administrative-list {
    position: absolute;
    top: 15px;
    left: 15px;
    z-index: 999;
    span {
      font-size: 14px;
      color: #000;
      cursor: pointer;
      &:not(:last-child)::after {
        content: ' > ';
      }
    }
  }
  .map-chart {
    width: 100%;
    height: 100%;
  }
}

:deep(.map-tooltip) {
  border: 1px solid #2983bc !important;
  border-radius: 4px;
  background: #101c32 !important;
  box-shadow: inset 0px 0px 5px 1px #2983bc !important;
  color: #fff !important;
  font-size: 12px;
  font-weight: 400;
  .last-node {
    div:last-child {
      display: none;
    }
  }
}
</style>

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
import { log } from 'console'

const description = `
功能：
1）区别于柱状图和折线图，没有x轴和y轴设置
2）tooltip区别于触发选项要设置，数据项图形'item'和坐标轴'axis'触发
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
  const modules = import.meta.glob('@/assets/example008/geoJson/**/*.json') // 导入

  if (administrativeLevel == 'county') {
    mapJson = await import('@/assets/example008/geoJson/100000_full.json')
    provinceList = (await import('@/assets/example008/geoJson/100000_province.json')).rows
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
    // https://juejin.cn/post/7256779530392485943
    const test = await import(
      `../../../assets/example008/geoJson/city/city/${provinceCode}_full.json`
    )
    console.console.log('test', test)

    for (const path in modules) {
      if (path == '/src/assets/example008/geoJson/city/city/' + provinceCode + '_full.json') {
        modules[path]().then((mod) => {
          mapJson = mod
        })
        break
      }
    }
    for (const path in modules) {
      if (path == '/src/assets/example008/geoJson/city/' + provinceCode + '_city.json') {
        modules[path]().then((mod) => {
          cityList = mod.rows
        })
        break
      }
    }

    // cityList = (await import(`@/assets/example008/geoJson/city/${provinceCode}_city.json`)).rows
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
    for (const path in modules) {
      console.log('/src/assets/example008/geoJson/city/city/' + provinceCode + '_full.json')
      console.log(path)

      if (path == '/src/assets/example008/geoJson/city/city/' + provinceCode + '_full.json') {
        modules[path]().then((mod) => {
          mapJson = mod
          console.log('mapJson', mapJson)
        })
        break
      }
    }
    // mapJson = await import(`@/assets/example008/geoJson/city/city/${provinceCode}_full.json`)
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
  // const res = await this.$api.devicePosition();
  // const data = res.map((item) => {
  // 	if (item.position) {
  // 		return {
  // 			name: item.nodeName,
  // 			value: item.position
  // 				? [item.position.split(',')[0], item.position.split(',')[1]]
  // 				: [null, null],
  // 			deptName: item.deptName,
  // 			lineName: item.lineName
  // 		};
  // 	}
  // });
  // const data = [{name: '11', value: [108.344051,29.776673], deptName: 'bumn'}]
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
      // {
      //   tooltip: {
      //     show: true,
      //     trigger: 'item',
      //     formatter: (e) => {
      //       const contentHtmlDom = `
      //           <div>
      //             <div>组织机构：${e.data.deptName}<div>
      //             <div>线路：${e.data.lineName}<div>
      //             <div class="last-node">节点：${e.data.name}<div>
      //           </div>
      //           `
      //       return contentHtmlDom
      //     },
      //     extraCssText: 'tooltip-label',
      //     position: 'top'
      //   },
      //   type: 'scatter',
      //   coordinateSystem: 'geo',
      //   itemStyle: {
      //     color: 'fff'
      //   },
      //   symbol: 'image://' + require('../../assets/dashboard/map-position.png'),
      //   symbolSize: [24, 26],
      //   z: 9999,
      //   data: data
      // }
    ]
  }
  // this.chart.on('georoam', () => {
  //   let chartOption = this.chart.getOption()
  //   chartOption.geo[1].center = chartOption.geo[2].center
  //   // chartOption.geo[0].center = chartOption.geo[1].center
  // })
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
  border: 1px solid gray;
  position: relative;
  .administrative-list {
    position: absolute;
    top: 15px;
    left: 15px;
    z-index: 999;
    span {
      font-size: 14px;
      color: #fff;
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
</style>

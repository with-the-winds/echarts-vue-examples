/**
 * 生成3D饼图配置项
 * @param pieData (object:饼图数据)
 * @param internalDiameterRatio (0-1之间的浮点数，内径/外径的值，默认为1/2)
 * @param height (配置每个数据生成的高度)
 */
export function getPie3D(pieData, internalDiameterRatio, height?: any) {
  const series: any[] = []
  let sumValue = 0
  let startValue = 0
  let endValue = 0
  const legendData = []
  const k =
    typeof internalDiameterRatio != 'undefined'
      ? (1 - internalDiameterRatio) / (1 + internalDiameterRatio)
      : 1 / 3

  //  计算比例
  let total = 0
  for (let i = 0; i < pieData.length; i++) {
    pieData[i].value = Number(pieData[i].value)
    total += Number(pieData[i].value)
  }

  for (let i = 0; i < pieData.length; i++) {
    pieData[i].proportion = (pieData[i].value / total).toFixed(4)
  }

  // 为每一个饼图数据，生成一个 series-surface 配置
  for (let i = 0; i < pieData.length; i++) {
    sumValue += pieData[i].value
    const seriesItem = {
      name: typeof pieData[i].name === 'undefined' ? `series${i}` : pieData[i].name,
      type: 'surface',
      parametric: true,
      wireframe: {
        show: false
      },
      pieData: pieData[i],
      pieStatus: {
        selected: pieData[i].selected ? pieData[i].selected : false,
        hovered: pieData[i].hovered ? pieData[i].hovered : false,
        k: k
      },
      itemStyle: {}
    }

    if (typeof pieData[i].itemStyle != 'undefined') {
      const itemStyle = {
        color: null,
        opacity: null
      }

      typeof pieData[i].itemStyle.color != 'undefined'
        ? (itemStyle.color = pieData[i].itemStyle.color)
        : null
      typeof pieData[i].itemStyle.opacity != 'undefined'
        ? (itemStyle.opacity = pieData[i].itemStyle.opacity)
        : null

      seriesItem.itemStyle = itemStyle
    }
    series.push(seriesItem)
  }

  // 使用上一次遍历时，计算出的数据和 sumValue，调用 getParametricEquation 函数，
  // 向每个 series-surface 传入不同的参数方程 series-surface.parametricEquation，也就是实现每一个扇形。
  for (let i = 0; i < series.length; i++) {
    endValue = startValue + series[i].pieData.value
    // console.log(series[i]);
    series[i].pieData.startRatio = startValue / sumValue
    series[i].pieData.endRatio = endValue / sumValue
    series[i].parametricEquation = getParametricEquation(
      series[i].pieData.startRatio,
      series[i].pieData.endRatio,
      series[i].pieStatus.selected,
      series[i].pieStatus.hovered,
      k,
      height ? series[i].pieData.proportion * height[i] : 1 //自己自定义传入高度，每个类型按比例生成高度
      // series[i].pieData.value   ==>这个是饼图默认自己生成高度
      // 1 设置为1所有的扇形高度都一样高
    )

    startValue = endValue

    legendData.push(series[i].name)
  }

  return series
}

/**
 *
 * @param startRatio (浮点数）: 当前扇形起始比例，取值区间[0, endRatio)
 * @param endRatio （浮点数）: 当前扇形结束比例，取值区间(startRatio, 1]
 * @param isSelected （布尔值）: 是否选中，效果参照二维饼图选中效果（单选）
 * @param isHovered （布尔值）: 是否放大，效果接近二维饼图高亮（放大）效果（未能实现阴影）
 * @param k （0~1之间的浮点数）：用于参数方程的一个参数，取值 0~1 之间，通过「内径 / 外径」的值换算而来。
 * @param height 配置3d扇形高度
 * @returns
 */
export function getParametricEquation(startRatio, endRatio, isSelected, isHovered, k, height) {
  // 计算
  const midRatio = (startRatio + endRatio) / 2

  const startRadian = startRatio * Math.PI * 2
  const endRadian = endRatio * Math.PI * 2
  const midRadian = midRatio * Math.PI * 2

  // 如果只有一个扇形，则不实现选中效果。
  if (startRatio === 0 && endRatio === 1) {
    isSelected = false
  }

  // 通过扇形内径/外径的值，换算出辅助参数 k（默认值 1/3）
  k = typeof k !== 'undefined' ? k : 1 / 3

  // 计算选中效果分别在 x 轴、y 轴方向上的位移（未选中，则位移均为 0）
  const offsetX = isSelected ? Math.cos(midRadian) * 0.2 : 0
  const offsetY = isSelected ? Math.sin(midRadian) * 0.2 : 0

  // 计算高亮效果的放大比例（未高亮，则比例为 1）
  const hoverRate = isHovered ? 1.05 : 1

  // 返回曲面参数方程
  return {
    u: {
      min: -Math.PI,
      max: Math.PI * 3,
      step: Math.PI / 32
    },

    v: {
      min: 0,
      max: Math.PI * 2,
      step: Math.PI / 20
    },

    x: function (u, v) {
      if (u < startRadian) {
        return offsetX + Math.cos(startRadian) * (1 + Math.cos(v) * k) * hoverRate
      }
      if (u > endRadian) {
        return offsetX + Math.cos(endRadian) * (1 + Math.cos(v) * k) * hoverRate
      }
      return offsetX + Math.cos(u) * (1 + Math.cos(v) * k) * hoverRate
    },

    y: function (u, v) {
      if (u < startRadian) {
        return offsetY + Math.sin(startRadian) * (1 + Math.cos(v) * k) * hoverRate
      }
      if (u > endRadian) {
        return offsetY + Math.sin(endRadian) * (1 + Math.cos(v) * k) * hoverRate
      }
      return offsetY + Math.sin(u) * (1 + Math.cos(v) * k) * hoverRate
    },

    z: function (u, v) {
      if (u < -Math.PI * 0.5) {
        return Math.sin(u)
      }
      if (u > Math.PI * 2.5) {
        return Math.sin(u)
      }
      return Math.sin(v) > 0 ? 1 * height : -1
    }
  }
}

/*
 * @Author: zhubj | ''
 * @Date: 2023-11-20 16:57:55
 * @LastEditors: zhubj | ''
 * @LastEditTime: 2023-11-28 20:54:19
 * @FilePath: \echarts-vue-examples\src\router\index.ts
 * @Description:
 */
import { createRouter, createWebHistory } from 'vue-router'
import BarChart from '@/views/001单个柱状图/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/bar'
    },
    {
      path: '/base',
      name: 'BaseChart',
      component: () => import('@/views/000相关概念/index.vue')
    },
    {
      path: '/bar',
      name: 'BarChart',
      component: BarChart
    },
    {
      path: '/line',
      name: 'LineChart',
      component: () => import('@/views/002单个折线图/index.vue')
    },
    {
      path: '/mulBar',
      name: 'MulBarChart',
      component: () => import('@/views/003自定义多个柱状图/index.vue')
    },
    {
      path: '/mul3DBar',
      name: 'Mul3DBarChart',
      component: () => import('@/views/004自定义多个立体柱状图/index.vue')
    },
    {
      path: '/pieChart',
      name: 'PieChart',
      component: () => import('@/views/005扇形图/index.vue')
    },
    {
      path: '/ringChart',
      name: 'RingChart',
      component: () => import('@/views/006圆环图/index.vue')
    },
    {
      path: '/roseChart',
      name: 'RoseChart',
      component: () => import('@/views/007玫瑰图/index.vue')
    },
    {
      path: '/mapChart',
      name: 'MapChart',
      component: () => import('@/views/008地图/index.vue')
    },
    {
      path: '/ring3DChart',
      name: 'MapChart',
      component: () => import('@/views/009圆环柱状图/index.vue')
    },
    {
      path: '/curtomBaseBar',
      name: 'CurtomBaseBar',
      component: () => import('@/views/010自定义基本柱状图/index.vue')
    },
    {
      path: '/curtomBaseLine',
      name: 'CurtomBaseLine',
      component: () => import('@/views/011自定义基本折线图/index.vue')
    },
    {
      path: '/curtomBaseRing',
      name: 'CurtomBaseRing',
      component: () => import('@/views/012自定义基本圆环图/index.vue')
    },
    {
      path: '/curtomBaseCircle',
      name: 'CurtomBaseCircle',
      component: () => import('@/views/013自定义基本圆图/index.vue')
    },
    {
      path: '/curtomBaseSector',
      name: 'CurtomBaseSector',
      component: () => import('@/views/014自定义基本扇形图/index.vue')
    },
    {
      path: '/curtomBaseSector2',
      name: 'CurtomBaseSector2',
      component: () => import('@/views/015自定义基本扇形图2/index.vue')
    }
  ]
})

export default router

/*
 * @Author: zhubj | ''
 * @Date: 2023-11-20 16:57:55
 * @LastEditors: zhubj | ''
 * @LastEditTime: 2023-11-27 14:08:20
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
    }
  ]
})

export default router

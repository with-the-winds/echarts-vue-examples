/*
 * @Author: zhubj | ''
 * @Date: 2023-11-20 16:57:55
 * @LastEditors: zhubj | ''
 * @LastEditTime: 2023-11-27 08:48:25
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
    }
  ]
})

export default router

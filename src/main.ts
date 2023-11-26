/*
 * @Author: zhubj | ''
 * @Date: 2023-11-20 16:57:55
 * @LastEditors: zhubj | ''
 * @LastEditTime: 2023-11-21 16:20:40
 * @FilePath: \echarts-vue-examples\src\main.ts
 * @Description:
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

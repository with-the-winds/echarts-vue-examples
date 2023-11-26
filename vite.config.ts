/*
 * @Author: zhubj | ''
 * @Date: 2023-11-20 16:57:55
 * @LastEditors: zhubj | ''
 * @LastEditTime: 2023-11-21 15:38:43
 * @FilePath: \echarts-vue-examples\vite.config.ts
 * @Description:
 */
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    hmr: true,
    open: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
